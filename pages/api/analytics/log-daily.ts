/**
 * API endpoint to trigger daily prediction logging
 *
 * Usage:
 * - Manual: POST /api/analytics/log-daily
 * - Vercel Cron: Add to vercel.json crons configuration
 * - External Cron: curl -X POST https://yourdomain.com/api/analytics/log-daily
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

interface ScenarioData {
  modelProbability: number;
  polymarketPrice: number;
  kalshiPrice: number | null;
  divergence: number;
  actualOutcome: boolean | null;
  resolved: boolean;
}

interface DailyPrediction {
  date: string;
  scenarios: Record<string, ScenarioData>;
}

interface HistoricalData {
  predictions: DailyPrediction[];
  metadata: {
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number | null;
    averageDivergence: number;
    lastUpdate: string;
  };
}

/**
 * Calculate model probabilities from risk factors
 */
function calculateModelProbabilities(): Record<string, number> {
  const factorsPath = path.join(process.cwd(), 'data', 'risk-factors.json');

  try {
    const factorsData = JSON.parse(fs.readFileSync(factorsPath, 'utf-8'));
    const probabilities: Record<string, number> = {};

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
    console.error('Error loading risk factors:', error);
    // Fallback probabilities
    return {
      'Iran-Israel War Q1 2026': 42,
      'China-Taiwan 2026': 13,
      'US-Venezuela 2026': 24,
      'Russia-NATO 2026': 6
    };
  }
}

/**
 * Fetch current predictions from model and market data
 * In production, this would fetch from Polymarket/Kalshi APIs
 */
function fetchCurrentPredictions(): Record<string, ScenarioData> {
  try {
    // Get model probabilities
    const modelProbabilities = calculateModelProbabilities();

    const scenarios: Record<string, ScenarioData> = {};

    // For each scenario, create entry
    // In production, you would fetch actual market prices here
    Object.entries(modelProbabilities).forEach(([scenario, modelProb]) => {
      // Placeholder market prices - in production, fetch from API
      // For now, use fallback values or fetch from your price cache
      const marketPrice = getMarketPrice(scenario);
      const divergence = modelProb - marketPrice;

      scenarios[scenario] = {
        modelProbability: modelProb,
        polymarketPrice: marketPrice,
        kalshiPrice: null,
        divergence: Math.round(divergence * 10) / 10,
        actualOutcome: null,
        resolved: false
      };
    });

    return scenarios;
  } catch (error) {
    console.error('Error fetching current predictions:', error);
    throw error;
  }
}

/**
 * Get market price for scenario
 * In production, this would call Polymarket/Kalshi API
 */
function getMarketPrice(scenario: string): number {
  // Fallback market prices based on the divergence we saw earlier
  const fallbackPrices: Record<string, number> = {
    'Iran-Israel War Q1 2026': 1.65,
    'China-Taiwan 2026': 12,
    'US-Venezuela 2026': 14.5,
    'Russia-NATO 2026': 1.15
  };

  return fallbackPrices[scenario] || 50;
}

/**
 * Load existing historical data
 */
function loadHistoricalData(): HistoricalData {
  const dataPath = path.join(process.cwd(), 'data', 'historical-predictions.json');

  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading historical data:', error);
    throw error;
  }
}

/**
 * Save updated historical data
 */
function saveHistoricalData(data: HistoricalData): void {
  const dataPath = path.join(process.cwd(), 'data', 'historical-predictions.json');

  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving historical data:', error);
    throw error;
  }
}

/**
 * Calculate metadata
 */
function calculateMetadata(predictions: DailyPrediction[]): HistoricalData['metadata'] {
  let totalPredictions = 0;
  let correctPredictions = 0;
  let totalDivergence = 0;
  let divergenceCount = 0;

  predictions.forEach(pred => {
    Object.values(pred.scenarios).forEach(scenario => {
      if (scenario.resolved && scenario.actualOutcome !== null) {
        totalPredictions++;

        const modelDistance = Math.abs(
          (scenario.actualOutcome ? 100 : 0) - scenario.modelProbability
        );
        const marketDistance = Math.abs(
          (scenario.actualOutcome ? 100 : 0) - scenario.polymarketPrice
        );

        if (modelDistance <= marketDistance) {
          correctPredictions++;
        }
      }

      totalDivergence += Math.abs(scenario.divergence);
      divergenceCount++;
    });
  });

  const accuracy = totalPredictions > 0
    ? Math.round((correctPredictions / totalPredictions) * 100)
    : null;
  const avgDivergence = divergenceCount > 0
    ? Math.round((totalDivergence / divergenceCount) * 10) / 10
    : 0;

  return {
    totalPredictions,
    correctPredictions,
    accuracy,
    averageDivergence: avgDivergence,
    lastUpdate: predictions[predictions.length - 1].date
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current date (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Load existing historical data
    const historicalData = loadHistoricalData();

    // Check if today's data already exists
    const existingEntryIndex = historicalData.predictions.findIndex(
      pred => pred.date === todayISO
    );

    // Fetch current predictions
    const currentScenarios = fetchCurrentPredictions();

    // Create today's prediction entry
    const todayPrediction: DailyPrediction = {
      date: todayISO,
      scenarios: currentScenarios
    };

    // Update or append today's data
    if (existingEntryIndex !== -1) {
      historicalData.predictions[existingEntryIndex] = todayPrediction;
    } else {
      historicalData.predictions.push(todayPrediction);
    }

    // Sort predictions by date
    historicalData.predictions.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Recalculate metadata
    historicalData.metadata = calculateMetadata(historicalData.predictions);

    // Save updated data
    saveHistoricalData(historicalData);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Daily predictions logged successfully',
      data: {
        date: todayISO,
        scenariosTracked: Object.keys(currentScenarios).length,
        totalDays: historicalData.predictions.length,
        accuracy: historicalData.metadata.accuracy,
        averageDivergence: historicalData.metadata.averageDivergence,
        updated: existingEntryIndex !== -1
      }
    });
  } catch (error: any) {
    console.error('Error logging daily predictions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to log daily predictions',
      details: error.message
    });
  }
}
