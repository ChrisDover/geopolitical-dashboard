import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface EquitiesPortfolioResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;

async function fetchAlphaVantagePrice(symbol: string, type: string): Promise<number | null> {
  try {
    let url: string;

    if (type === 'FUTURES') {
      // Special handling for commodity futures
      if (symbol === 'CL') {
        // Crude Oil WTI
        url = `https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${ALPHAVANTAGE_API_KEY}`;
      } else if (symbol === 'NG') {
        // Natural Gas
        url = `https://www.alphavantage.co/query?function=NATURAL_GAS&interval=daily&apikey=${ALPHAVANTAGE_API_KEY}`;
      } else {
        return null;
      }
    } else if (type === 'INDEX' || symbol.startsWith('^')) {
      // Market indices (^GSPC for S&P 500)
      const cleanSymbol = symbol.replace('^', '');
      url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanSymbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
    } else {
      // Stocks and ETFs
      url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (type === 'FUTURES') {
      // Commodity data format
      if (data.data && data.data.length > 0) {
        const latestData = data.data[0];
        const price = parseFloat(latestData.value);
        console.log(`  ${symbol} (commodity) -> $${price} (date: ${latestData.date})`);
        return price;
      }
    } else {
      // Stock/ETF/Index data format
      if (data['Global Quote'] && data['Global Quote']['05. price']) {
        const price = parseFloat(data['Global Quote']['05. price']);
        console.log(`  ${symbol} -> $${price}`);
        return price;
      }
    }

    console.warn(`  ${symbol} -> No price data available`);
    return null;
  } catch (err) {
    console.error(`Failed to fetch price for ${symbol}:`, err);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EquitiesPortfolioResponse>
) {
  try {
    // Load base portfolio data
    const portfolioPath = path.join(process.cwd(), 'data', 'equities-portfolio.json');
    const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));

    // Fetch live prices using AlphaVantage
    const priceMap = new Map();

    console.log('Fetching live prices from AlphaVantage...');

    // Fetch S&P 500 price first for benchmark calculations
    console.log('Fetching live price for ^GSPC (S&P 500)...');
    const sp500Price = await fetchAlphaVantagePrice('^GSPC', 'INDEX');
    console.log(`S&P 500 current price: ${sp500Price || 'N/A'}`);

    for (const pos of portfolioData.positions) {
      console.log(`Fetching live price for ${pos.symbol} (${pos.type})...`);
      const price = await fetchAlphaVantagePrice(pos.symbol, pos.type);

      if (price) {
        priceMap.set(pos.symbol, price);
      }

      // Rate limit: AlphaVantage free tier allows 5 requests/minute, premium allows 75/minute
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update positions with live prices and recalculate P&L
    const updatedPositions = portfolioData.positions.map((pos: any) => {
      const livePrice = priceMap.get(pos.symbol);

      if (!livePrice) {
        console.warn(`No live price for ${pos.symbol}, using static price`);
        return pos;
      }

      const currentPrice = livePrice;
      let currentValue: number;
      let unrealizedPnL: number;
      let unrealizedPnLPercent: number;

      if (pos.type === 'FUTURES') {
        // Futures: P&L = contracts * (current - entry) * contract size
        // currentValue stays as margin posted (from costBasis)
        const contractSize = pos.contractSize || 1000;
        currentValue = pos.costBasis; // Margin posted (constant)
        unrealizedPnL = pos.contracts * (currentPrice - pos.entryPrice) * contractSize;

        // For futures, calculate return on NOTIONAL value, not margin (notional = contracts * price * size)
        const notionalEntry = Math.abs(pos.contracts * pos.entryPrice * contractSize);
        unrealizedPnLPercent = (unrealizedPnL / notionalEntry) * 100;
      } else {
        // Equities/ETFs: shares * current price
        currentValue = Math.abs(pos.shares) * currentPrice * (pos.shares > 0 ? 1 : -1);
        const costBasis = Math.abs(pos.shares) * pos.entryPrice * (pos.shares > 0 ? 1 : -1);
        unrealizedPnL = currentValue - costBasis;
        unrealizedPnLPercent = (unrealizedPnL / Math.abs(pos.costBasis)) * 100;
      }

      return {
        ...pos,
        currentPrice,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
        lastUpdated: new Date().toISOString()
      };
    });

    // Recalculate metadata
    const totalUnrealizedPnL = updatedPositions.reduce((sum: number, pos: any) => sum + pos.unrealizedPnL, 0);

    // Deployed capital = sum of cost basis (capital at risk)
    const deployedCapital = updatedPositions.reduce((sum: number, pos: any) => sum + Math.abs(pos.costBasis), 0);

    // Total capital = cash + deployed capital + unrealized P&L
    const totalCapital = portfolioData.metadata.cashReserve + deployedCapital + totalUnrealizedPnL;

    const updatedMetadata = {
      ...portfolioData.metadata,
      unrealizedPnL: Math.round(totalUnrealizedPnL),
      deployedCapital: Math.round(deployedCapital),
      totalCapital: Math.round(totalCapital),
      lastUpdated: new Date().toISOString()
    };

    // Update equity curve with live data for today
    const equityCurve = [...portfolioData.equityCurve];
    if (equityCurve.length > 0 && sp500Price) {
      const today = new Date().toISOString().split('T')[0];
      const lastPoint = equityCurve[equityCurve.length - 1];
      const firstPoint = equityCurve[0];

      // Calculate S&P 500 value dynamically based on live price
      // Starting S&P 500 price on Nov 18, 2024 was approximately 5,900
      // First point has sp500Value = 100,000 (initial $100k investment)
      // Current value = 100,000 * (current_price / starting_price)
      const startingSp500Price = 5900; // S&P 500 price on Nov 18, 2024
      const sp500CurrentValue = firstPoint.sp500Value * (sp500Price / startingSp500Price);
      const sp500Return = ((sp500CurrentValue - firstPoint.sp500Value) / firstPoint.sp500Value) * 100;

      console.log(`S&P 500 calculation: firstValue=${firstPoint.sp500Value}, startPrice=${startingSp500Price}, currentPrice=${sp500Price}, currentValue=${Math.round(sp500CurrentValue)}, return=${sp500Return.toFixed(2)}%`);

      // If last point is today, update it; otherwise add new point
      if (lastPoint.date === today) {
        lastPoint.portfolioValue = updatedMetadata.totalCapital;
        lastPoint.sp500Value = Math.round(sp500CurrentValue);
      } else {
        equityCurve.push({
          date: today,
          portfolioValue: updatedMetadata.totalCapital,
          sp500Value: Math.round(sp500CurrentValue)
        });
      }
    }

    // Calculate total portfolio value for percentage calculations
    const totalPortfolioValue = updatedPositions.reduce((sum: number, pos: any) =>
      sum + Math.abs(pos.currentValue || 0), 0);

    const enrichedData = {
      ...portfolioData,
      metadata: updatedMetadata,
      positions: updatedPositions,
      equityCurve,
      riskMetrics: {
        deploymentRatio: (updatedMetadata.deployedCapital / updatedMetadata.totalCapital) * 100,
        profitFactor: calculateProfitFactor(updatedPositions),
        bestPosition: getBestPosition(updatedPositions),
        worstPosition: getWorstPosition(updatedPositions),
        sectorExposure: calculateSectorExposure(updatedPositions, totalPortfolioValue),
        longShortRatio: calculateLongShortRatio(updatedPositions)
      }
    };

    res.status(200).json({
      success: true,
      data: enrichedData
    });

  } catch (error) {
    console.error('Error loading equities portfolio data:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function calculateProfitFactor(positions: any[]): number {
  const winners = positions.filter(p => p.unrealizedPnL > 0);
  const losers = positions.filter(p => p.unrealizedPnL < 0);

  const totalWins = winners.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const totalLosses = Math.abs(losers.reduce((sum, p) => sum + p.unrealizedPnL, 0));

  return totalLosses === 0 ? totalWins : totalWins / totalLosses;
}

function getBestPosition(positions: any[]): any {
  return positions.reduce((best, current) =>
    current.unrealizedPnLPercent > best.unrealizedPnLPercent ? current : best
  , positions[0]);
}

function getWorstPosition(positions: any[]): any {
  return positions.reduce((worst, current) =>
    current.unrealizedPnLPercent < worst.unrealizedPnLPercent ? current : worst
  , positions[0]);
}

function calculateSectorExposure(positions: any[], totalPortfolioValue: number): any {
  const sectorMap: any = {};

  positions.forEach(pos => {
    const sector = pos.sector || 'Other';
    const value = Math.abs(pos.currentValue || 0);

    if (!sectorMap[sector]) {
      sectorMap[sector] = 0;
    }
    sectorMap[sector] += value;
  });

  // Convert to percentages
  Object.keys(sectorMap).forEach(sector => {
    sectorMap[sector] = (sectorMap[sector] / totalPortfolioValue) * 100;
  });

  return sectorMap;
}

function calculateLongShortRatio(positions: any[]): number {
  const longValue = positions
    .filter(p => p.shares > 0 || p.contracts > 0)
    .reduce((sum, p) => sum + Math.abs(p.currentValue || 0), 0);

  const shortValue = positions
    .filter(p => p.shares < 0)
    .reduce((sum, p) => sum + Math.abs(p.currentValue || 0), 0);

  return shortValue === 0 ? longValue : longValue / shortValue;
}
