import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface PortfolioResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortfolioResponse>
) {
  try {
    // Load portfolio data
    const portfolioPath = path.join(process.cwd(), 'data', 'portfolio.json');
    const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));

    // Check for triggered trip wires based on current prices
    const triggeredTripWires = portfolioData.tripWires.filter((tw: any) => {
      if (tw.status !== 'ACTIVE') return false;

      if (tw.type === 'PRICE_THRESHOLD') {
        const position = portfolioData.positions.find((p: any) => p.scenario === tw.scenario);
        if (!position) return false;

        if (tw.direction === 'ABOVE' && position.currentPrice >= tw.threshold) {
          return true;
        }
        if (tw.direction === 'BELOW' && position.currentPrice <= tw.threshold) {
          return true;
        }
      }

      if (tw.type === 'PORTFOLIO_RISK') {
        const unrealizedPnL = portfolioData.metadata.unrealizedPnL;
        if (tw.threshold > 0 && unrealizedPnL >= tw.threshold) {
          return true;
        }
        if (tw.threshold < 0 && unrealizedPnL <= tw.threshold) {
          return true;
        }
      }

      return false;
    });

    // Enrich data with real-time calculations
    const enrichedData = {
      ...portfolioData,
      triggeredTripWires,
      alerts: triggeredTripWires.map((tw: any) => ({
        type: tw.type,
        scenario: tw.scenario || 'PORTFOLIO',
        action: tw.action,
        reasoning: tw.reasoning,
        timestamp: new Date().toISOString()
      })),
      riskMetrics: {
        deploymentRatio: (portfolioData.metadata.deployedCapital / portfolioData.metadata.totalCapital) * 100,
        profitFactor: calculateProfitFactor(portfolioData.positions),
        bestPosition: getBestPosition(portfolioData.positions),
        worstPosition: getWorstPosition(portfolioData.positions),
        averageHoldTime: calculateAverageHoldTime(portfolioData.positions)
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
