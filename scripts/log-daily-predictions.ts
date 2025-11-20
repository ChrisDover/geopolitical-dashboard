/**
 * Daily prediction logging script
 * Appends today's predictions to historical-predictions.json
 *
 * Usage: npx tsx scripts/log-daily-predictions.ts
 * Or schedule via cron: 0 0 * * * cd /path/to/project && npx tsx scripts/log-daily-predictions.ts
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

/**
 * Fetch current model probabilities and market prices
 */
async function fetchCurrentPredictions(): Promise<Record<string, ScenarioData>> {
  const scenariosPath = path.join(__dirname, '..', 'data', 'scenarios.json');

  try {
    // Read scenarios data
    const scenariosData = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'));

    const scenarios: Record<string, ScenarioData> = {};

    // Extract model probabilities from scenarios
    scenariosData.forEach((scenario: any) => {
      const modelProb = scenario.modelProbability || scenario.probability || 0;
      const marketPrice = scenario.marketPrice || scenario.polymarketPrice || modelProb;
      const divergence = modelProb - marketPrice;

      scenarios[scenario.scenario || scenario.name] = {
        modelProbability: modelProb,
        polymarketPrice: marketPrice,
        kalshiPrice: scenario.kalshiPrice || null,
        divergence: Math.round(divergence * 10) / 10,
        actualOutcome: null, // Will be updated when event resolves
        resolved: false // Will be updated manually or via API when event resolves
      };
    });

    return scenarios;
  } catch (error) {
    console.error('❌ Error fetching current predictions:', error);
    throw error;
  }
}

/**
 * Load existing historical data
 */
function loadHistoricalData(): HistoricalData {
  const dataPath = path.join(__dirname, '..', 'data', 'historical-predictions.json');

  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error loading historical data:', error);
    throw error;
  }
}

/**
 * Save updated historical data
 */
function saveHistoricalData(data: HistoricalData): void {
  const dataPath = path.join(__dirname, '..', 'data', 'historical-predictions.json');

  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('✅ Historical data saved successfully');
  } catch (error) {
    console.error('❌ Error saving historical data:', error);
    throw error;
  }
}

/**
 * Calculate updated metadata
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
    totalPredictions,
    correctPredictions,
    accuracy,
    averageDivergence: avgDivergence,
    lastUpdate: predictions[predictions.length - 1].date
  };
}

/**
 * Main logging function
 */
async function logDailyPredictions(): Promise<void> {
  console.log('📊 Starting daily prediction logging...');

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

  if (existingEntryIndex !== -1) {
    console.log('⚠️  Entry for today already exists. Updating...');
  }

  // Fetch current predictions
  const currentScenarios = await fetchCurrentPredictions();

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

  // Sort predictions by date (oldest to newest)
  historicalData.predictions.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Recalculate metadata
  historicalData.metadata = calculateMetadata(historicalData.predictions);

  // Save updated data
  saveHistoricalData(historicalData);

  // Print summary
  console.log('✅ Daily prediction logged successfully!');
  console.log(`📅 Date: ${todayISO}`);
  console.log(`📊 Total scenarios tracked: ${Object.keys(currentScenarios).length}`);
  console.log(`📈 Total historical days: ${historicalData.predictions.length}`);
  console.log(`🎯 Model accuracy: ${historicalData.metadata.accuracy || 'N/A'}%`);
  console.log(`📉 Average divergence: ${historicalData.metadata.averageDivergence}%`);
}

// Run if called directly
if (require.main === module) {
  logDailyPredictions()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export { logDailyPredictions };
