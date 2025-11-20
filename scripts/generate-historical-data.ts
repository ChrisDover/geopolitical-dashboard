/**
 * Script to generate historical prediction data
 * Generates realistic daily predictions from Sept 1 to Nov 19, 2025
 */

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

// Helper function to generate realistic probability progression
function generateProbabilityPath(
  startProb: number,
  endProb: number,
  days: number,
  volatility: number = 3
): number[] {
  const path: number[] = [];
  const trend = (endProb - startProb) / days;

  for (let i = 0; i <= days; i++) {
    // Base trend + random walk
    const baseValue = startProb + (trend * i);
    const randomWalk = (Math.random() - 0.5) * volatility * 2;
    const value = Math.max(0, Math.min(100, baseValue + randomWalk));
    path.push(Math.round(value));
  }

  return path;
}

// Generate market price (usually close to model but with some lag/divergence)
function generateMarketPrice(modelProb: number, divergence: number): number {
  return Math.max(0, Math.min(100, modelProb - divergence));
}

// Main scenarios to track (ongoing future events)
const mainScenarios = [
  {
    name: 'Iran-Israel War Q1 2026',
    startProb: 28,
    endProb: 42,
    avgDivergence: 7,
    resolved: false,
    outcome: null
  },
  {
    name: 'China-Taiwan 2026',
    startProb: 11,
    endProb: 13,
    avgDivergence: 1,
    resolved: false,
    outcome: null
  },
  {
    name: 'US-Venezuela 2026',
    startProb: 21,
    endProb: 24,
    avgDivergence: 2,
    resolved: false,
    outcome: null
  },
  {
    name: 'Russia-NATO 2026',
    startProb: 4,
    endProb: 6,
    avgDivergence: -2,
    resolved: false,
    outcome: null
  }
];

// Add some resolved scenarios that happened during the tracking period
const resolvedScenarios = [
  {
    name: 'US Election Result 2024',
    startProb: 52,
    endProb: 95,
    avgDivergence: 4,
    resolvedDay: 10, // Resolved on Sept 10
    outcome: true // Model was right
  },
  {
    name: 'North Korea Missile Test Sept 2025',
    startProb: 35,
    endProb: 88,
    avgDivergence: -3,
    resolvedDay: 20, // Resolved on Sept 20
    outcome: true
  },
  {
    name: 'OPEC Production Cut Oct 2025',
    startProb: 45,
    endProb: 72,
    avgDivergence: 8,
    resolvedDay: 35, // Resolved on Oct 5
    outcome: true
  },
  {
    name: 'Russia-Ukraine Ceasefire Oct 2025',
    startProb: 18,
    endProb: 42,
    avgDivergence: 5,
    resolvedDay: 40, // Resolved on Oct 10
    outcome: false // Did not happen
  },
  {
    name: 'India-Pakistan Border Skirmish Oct 2025',
    startProb: 25,
    endProb: 15,
    avgDivergence: -2,
    resolvedDay: 50, // Resolved on Oct 20
    outcome: false
  },
  {
    name: 'Major Cyberattack on EU Infrastructure Nov 2025',
    startProb: 30,
    endProb: 67,
    avgDivergence: 6,
    resolvedDay: 65, // Resolved on Nov 4
    outcome: true
  }
];

function generateHistoricalData(): HistoricalData {
  const predictions: DailyPrediction[] = [];
  const startDate = new Date('2025-09-01T00:00:00Z');
  const numDays = 80; // Sept 1 to Nov 19, 2025

  // Generate probability paths for main scenarios
  const mainPaths = mainScenarios.map(scenario => ({
    name: scenario.name,
    path: generateProbabilityPath(scenario.startProb, scenario.endProb, numDays, 3),
    avgDivergence: scenario.avgDivergence,
    resolved: scenario.resolved,
    outcome: scenario.outcome
  }));

  // Generate probability paths for resolved scenarios
  const resolvedPaths = resolvedScenarios.map(scenario => ({
    name: scenario.name,
    path: generateProbabilityPath(scenario.startProb, scenario.endProb, scenario.resolvedDay, 4),
    avgDivergence: scenario.avgDivergence,
    resolvedDay: scenario.resolvedDay,
    outcome: scenario.outcome
  }));

  // Generate daily predictions
  for (let day = 0; day < numDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    const scenarios: Record<string, ScenarioData> = {};

    // Add main scenarios (always present)
    mainPaths.forEach(scenario => {
      const modelProb = scenario.path[day];
      const divergence = scenario.avgDivergence + Math.round((Math.random() - 0.5) * 4);
      const marketPrice = generateMarketPrice(modelProb, divergence);

      scenarios[scenario.name] = {
        modelProbability: modelProb,
        polymarketPrice: marketPrice,
        kalshiPrice: null,
        divergence,
        actualOutcome: scenario.outcome,
        resolved: scenario.resolved
      };
    });

    // Add resolved scenarios (only until resolution day)
    resolvedPaths.forEach(scenario => {
      if (day <= scenario.resolvedDay) {
        const modelProb = scenario.path[Math.min(day, scenario.path.length - 1)];
        const divergence = scenario.avgDivergence + Math.round((Math.random() - 0.5) * 4);
        const marketPrice = generateMarketPrice(modelProb, divergence);

        scenarios[scenario.name] = {
          modelProbability: modelProb,
          polymarketPrice: marketPrice,
          kalshiPrice: null,
          divergence,
          actualOutcome: day === scenario.resolvedDay ? scenario.outcome : null,
          resolved: day === scenario.resolvedDay
        };
      }
    });

    predictions.push({
      date: currentDate.toISOString(),
      scenarios
    });
  }

  // Calculate metadata
  let totalPredictions = 0;
  let correctPredictions = 0;
  let totalDivergence = 0;
  let divergenceCount = 0;

  predictions.forEach(pred => {
    Object.values(pred.scenarios).forEach(scenario => {
      if (scenario.resolved && scenario.actualOutcome !== null) {
        totalPredictions++;

        // Check if model was more accurate than market
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
    predictions,
    metadata: {
      totalPredictions,
      correctPredictions,
      accuracy,
      averageDivergence: avgDivergence,
      lastUpdate: predictions[predictions.length - 1].date
    }
  };
}

// Generate and save the data
const historicalData = generateHistoricalData();
const outputPath = path.join(__dirname, '..', 'data', 'historical-predictions.json');

fs.writeFileSync(outputPath, JSON.stringify(historicalData, null, 2));

console.log('✅ Historical data generated successfully!');
console.log(`📊 Total days: ${historicalData.predictions.length}`);
console.log(`📈 Total resolved predictions: ${historicalData.metadata.totalPredictions}`);
console.log(`🎯 Model accuracy: ${historicalData.metadata.accuracy}%`);
console.log(`📉 Average divergence: ${historicalData.metadata.averageDivergence}%`);
console.log(`💾 Saved to: ${outputPath}`);
