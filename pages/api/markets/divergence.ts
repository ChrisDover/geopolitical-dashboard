import type { NextApiRequest, NextApiResponse } from 'next';

interface Divergence {
  scenario: string;
  ourModel: number;
  polymarket: number | null;
  kalshi: number | null;
  divergence: number | null;
  edge: 'STRONG BUY' | 'BUY' | 'SELL' | 'STRONG SELL' | 'FAIR' | 'NO_MARKET';
  confidence: number;
  reasoning: string;
  suggestedTrade: string;
  expectedValue: string;
  riskNote?: string;
  marketUrl?: string | null;
}

interface DivergenceResponse {
  success: boolean;
  data?: Divergence[];
  lastUpdate?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DivergenceResponse>
) {
  try {
    // Fetch from both Polymarket and Kalshi
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const [polymarketResponse, kalshiResponse] = await Promise.all([
      fetch(`${baseUrl}/api/markets/prices`),
      fetch(`${baseUrl}/api/markets/kalshi`)
    ]);

    const polymarketData = await polymarketResponse.json();
    const kalshiData = await kalshiResponse.json();

    if (!polymarketData.success && !kalshiData.success) {
      throw new Error('Failed to fetch market prices from both sources');
    }

    const polymarketPrices = polymarketData.success ? polymarketData.data.scenarios : {};
    const kalshiPrices = kalshiData.success ? kalshiData.data.scenarios : {};

    // Your probability model
    const yourModel = calculateModelProbabilities();

    // Calculate divergences
    const divergences: Divergence[] = Object.keys(yourModel).map(scenario => {
      const ourProb = yourModel[scenario];
      const polyData = polymarketPrices[scenario];
      const kalshiDataForScenario = kalshiPrices[scenario];

      const polyProb = polyData?.found ? polyData.probability : null;
      const kalshiProb = kalshiDataForScenario?.found ? kalshiDataForScenario.probability : null;

      // Use Polymarket as primary, Kalshi as fallback
      const marketProb = polyProb || kalshiProb;
      const marketSource = polyProb ? 'Polymarket' : kalshiProb ? 'Kalshi' : null;
      const marketUrl = polyProb ? polyData.url : kalshiProb ? kalshiDataForScenario.url : null;

      if (!marketProb) {
        return {
          scenario,
          ourModel: ourProb,
          polymarket: null,
          kalshi: null,
          divergence: null,
          edge: 'NO_MARKET' as const,
          confidence: 0,
          reasoning: 'No active prediction market found on Polymarket or Kalshi. Monitor for market creation.',
          suggestedTrade: 'No market available',
          expectedValue: 'N/A',
          marketUrl: null
        };
      }

      const divergence = ourProb - marketProb;
      const absDivergence = Math.abs(divergence);

      return {
        scenario,
        ourModel: ourProb,
        polymarket: polyProb,
        kalshi: kalshiProb,
        divergence,
        edge: absDivergence > 10 ? (divergence > 0 ? 'STRONG BUY' : 'STRONG SELL') :
              absDivergence > 5 ? (divergence > 0 ? 'BUY' : 'SELL') : 'FAIR',
        confidence: calculateConfidence(scenario, absDivergence),
        reasoning: generateReasoning(scenario, divergence, marketSource),
        suggestedTrade: generateTrade(scenario, divergence, marketProb, marketSource),
        expectedValue: `${divergence > 0 ? '+' : ''}${(divergence * 2).toFixed(0)}% if correct`,
        riskNote: `Max loss ${marketProb.toFixed(0)}¢`,
        marketUrl
      };
    });

    res.status(200).json({
      success: true,
      data: divergences,
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function calculateModelProbabilities(): { [key: string]: number } {
  // Load risk factors from our factor model
  const fs = require('fs');
  const path = require('path');

  try {
    const factorsPath = path.join(process.cwd(), 'data', 'risk-factors.json');
    const factorsData = JSON.parse(fs.readFileSync(factorsPath, 'utf8'));

    const probabilities: { [key: string]: number } = {};

    // Calculate weighted probability for each scenario
    Object.entries(factorsData.scenarios).forEach(([scenario, data]: [string, any]) => {
      // Start with baseline probability
      let probability = data.baselineProbability;

      // Calculate weighted factor score
      let factorAdjustment = 0;
      data.factors.forEach((factor: any) => {
        // Convert 0-100 score to adjustment (-20 to +20 percentage points)
        const scoreImpact = (factor.currentScore - 50) * 0.4 * factor.weight;
        factorAdjustment += scoreImpact;
      });

      // Apply factor adjustment
      probability = Math.max(1, Math.min(95, probability + factorAdjustment));

      // Round to nearest integer
      probabilities[scenario] = Math.round(probability);
    });

    return probabilities;
  } catch (error) {
    console.error('Error loading risk factors, using fallback:', error);
    // Fallback to baseline if file can't be loaded
    return {
      'Iran-Israel War Q1 2026': 42,
      'China-Taiwan 2026': 15,
      'US-Venezuela 2026': 18,
      'Russia-NATO 2026': 12
    };
  }
}

function calculateConfidence(scenario: string, divergence: number): number {
  // Confidence decreases as divergence increases (market might know something)
  // But increases with our data quality
  const baseConfidence = 75;
  const divergencePenalty = Math.min(divergence / 2, 15);
  return Math.max(50, baseConfidence - divergencePenalty);
}

function generateReasoning(scenario: string, divergence: number, marketSource: string | null): string {
  const reasons: { [key: string]: string } = {
    'Iran-Israel War Q1 2026': 'Model factors recent proxy escalation patterns, Israeli cabinet composition shift toward hawks, and historical response patterns. Market may be underpricing near-term catalyst risk.',
    'China-Taiwan 2026': 'Model weighs Xi economic priorities and PLA readiness assessments. Market appears to overweight routine exercise noise.',
    'US-Venezuela 2026': 'Model incorporates border tension escalation, regime economic desperation metrics, and US administration hawkish signals. Low market attention creates opportunity.',
    'Russia-NATO 2026': 'Model balances escalation risks against nuclear deterrence and economic constraints. Market pricing appears roughly efficient.'
  };

  const baseReason = reasons[scenario] || 'Model divergence based on proprietary factor analysis.';
  return marketSource ? `${baseReason} (Source: ${marketSource})` : baseReason;
}

function generateTrade(scenario: string, divergence: number, marketPrice: number, marketSource: string | null): string {
  if (Math.abs(divergence) < 5) {
    return 'No position - fair value';
  }

  const source = marketSource || 'Market';

  if (divergence > 0) {
    return `Long ${source} "${scenario}" @ ${marketPrice.toFixed(0)}¢`;
  } else {
    return `Short/Fade ${source} "${scenario}" @ ${marketPrice.toFixed(0)}¢`;
  }
}
