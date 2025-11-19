import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface PortfolioResponse {
  success: boolean;
  data?: any;
  error?: string;
}

async function fetchLiveMarketPrice(position: any): Promise<number | null> {
  try {
    // Try to fetch from Polymarket API
    if (position.market === 'Polymarket' && position.marketUrl) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/markets/prices`);
      const data = await response.json();

      if (data.success && data.markets) {
        // Match by scenario name
        const market = data.markets.find((m: any) =>
          m.question?.toLowerCase().includes(position.scenario.toLowerCase().split(' ').slice(0, 3).join(' '))
        );

        if (market && market.outcomePrices) {
          const yesPrice = market.outcomePrices.find((p: any) => p.outcome === 'Yes');
          if (yesPrice) {
            console.log(`Live price for ${position.scenario}: ${yesPrice.price}`);
            return yesPrice.price;
          }
        }
      }
    }

    // Try to fetch from Kalshi API
    if (position.market === 'Kalshi' && position.marketUrl) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/markets/kalshi`);
      const data = await response.json();

      if (data.success && data.markets) {
        const market = data.markets.find((m: any) =>
          m.title?.toLowerCase().includes(position.scenario.toLowerCase().split(' ').slice(0, 3).join(' '))
        );

        if (market) {
          console.log(`Live price for ${position.scenario}: ${market.yes_bid}`);
          return market.yes_bid / 100; // Kalshi prices are in cents
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch live price for ${position.scenario}:`, error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortfolioResponse>
) {
  try {
    // Load portfolio data
    const portfolioPath = path.join(process.cwd(), 'data', 'portfolio.json');
    const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));

    // Fetch live prices for all positions
    console.log('Fetching live prices for prediction markets positions...');
    const updatedPositions = await Promise.all(
      portfolioData.positions.map(async (pos: any) => {
        const livePrice = await fetchLiveMarketPrice(pos);

        if (livePrice && livePrice !== pos.currentPrice) {
          const currentPrice = livePrice;
          const currentValue = pos.contracts * currentPrice;
          const unrealizedPnL = currentValue - pos.costBasis;
          const unrealizedPnLPercent = (unrealizedPnL / pos.costBasis) * 100;

          console.log(`Updated ${pos.scenario}: ${pos.currentPrice} -> ${currentPrice}`);

          return {
            ...pos,
            currentPrice,
            currentValue,
            unrealizedPnL,
            unrealizedPnLPercent,
            lastUpdated: new Date().toISOString()
          };
        }

        return pos;
      })
    );

    // Recalculate portfolio metadata with live prices
    const totalUnrealizedPnL = updatedPositions.reduce((sum: number, pos: any) =>
      sum + (pos.unrealizedPnL || 0), 0
    );

    const deployedCapital = updatedPositions.reduce((sum: number, pos: any) =>
      sum + Math.abs(pos.costBasis || 0), 0
    );

    const updatedMetadata = {
      ...portfolioData.metadata,
      unrealizedPnL: Math.round(totalUnrealizedPnL),
      deployedCapital: Math.round(deployedCapital),
      lastUpdated: new Date().toISOString()
    };

    // Update portfolio data with live prices
    const livePortfolioData = {
      ...portfolioData,
      metadata: updatedMetadata,
      positions: updatedPositions
    };

    // Check for triggered trip wires based on LIVE current prices
    const triggeredTripWires = livePortfolioData.tripWires.filter((tw: any) => {
      if (tw.status !== 'ACTIVE') return false;

      if (tw.type === 'PRICE_THRESHOLD') {
        const position = updatedPositions.find((p: any) => p.scenario === tw.scenario);
        if (!position) return false;

        if (tw.direction === 'ABOVE' && position.currentPrice >= tw.threshold) {
          return true;
        }
        if (tw.direction === 'BELOW' && position.currentPrice <= tw.threshold) {
          return true;
        }
      }

      if (tw.type === 'PORTFOLIO_RISK') {
        const unrealizedPnL = updatedMetadata.unrealizedPnL;
        if (tw.threshold > 0 && unrealizedPnL >= tw.threshold) {
          return true;
        }
        if (tw.threshold < 0 && unrealizedPnL <= tw.threshold) {
          return true;
        }
      }

      return false;
    });

    // Enrich data with real-time calculations from LIVE data
    const enrichedData = {
      ...livePortfolioData,
      triggeredTripWires,
      alerts: triggeredTripWires.map((tw: any) => ({
        type: tw.type,
        scenario: tw.scenario || 'PORTFOLIO',
        action: tw.action,
        reasoning: tw.reasoning,
        timestamp: new Date().toISOString()
      })),
      riskMetrics: {
        deploymentRatio: (updatedMetadata.deployedCapital / updatedMetadata.totalCapital) * 100,
        profitFactor: calculateProfitFactor(updatedPositions),
        bestPosition: getBestPosition(updatedPositions),
        worstPosition: getWorstPosition(updatedPositions),
        averageHoldTime: calculateAverageHoldTime(updatedPositions)
      }
    };

    res.status(200).json({
      success: true,
      data: enrichedData
    });

  } catch (error) {
    console.error('Error loading portfolio data:', error);
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

function calculateAverageHoldTime(positions: any[]): number {
  const now = new Date();
  const totalDays = positions.reduce((sum, p) => {
    const openDate = new Date(p.openDate);
    const diffTime = Math.abs(now.getTime() - openDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / positions.length);
}
