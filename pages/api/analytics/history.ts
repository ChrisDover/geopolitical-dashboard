import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface HistoricalPrediction {
  date: string;
  scenarios: {
    [scenario: string]: {
      modelProbability: number;
      polymarketPrice: number | null;
      kalshiPrice: number | null;
      divergence: number;
      actualOutcome: boolean | null;
      resolved: boolean;
    };
  };
}

interface HistoryResponse {
  success: boolean;
  data?: {
    predictions: HistoricalPrediction[];
    metadata: any;
    analytics: {
      totalDays: number;
      scenarioPerformance: { [scenario: string]: any };
      overallAccuracy: number | null;
      calibration: any;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HistoryResponse>
) {
  try {
    // Load historical predictions
    const historyPath = path.join(process.cwd(), 'data', 'historical-predictions.json');
    const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

    // Calculate analytics
    const predictions = historyData.predictions || [];

    // Scenario performance tracking
    const scenarioPerformance: { [scenario: string]: any } = {};

    predictions.forEach((pred: HistoricalPrediction) => {
      Object.entries(pred.scenarios).forEach(([scenario, data]) => {
        if (!scenarioPerformance[scenario]) {
          scenarioPerformance[scenario] = {
            totalPredictions: 0,
            avgModelProb: 0,
            avgMarketProb: 0,
            avgDivergence: 0,
            resolved: 0,
            correct: 0,
            history: []
          };
        }

        const sp = scenarioPerformance[scenario];
        sp.totalPredictions++;
        sp.avgModelProb += data.modelProbability;
        sp.avgMarketProb += (data.polymarketPrice || data.kalshiPrice || 0);
        sp.avgDivergence += Math.abs(data.divergence);

        if (data.resolved) {
          sp.resolved++;
          if (data.actualOutcome !== null) {
            // Check if model was more accurate than market
            const modelDistance = Math.abs((data.actualOutcome ? 100 : 0) - data.modelProbability);
            const marketDistance = Math.abs((data.actualOutcome ? 100 : 0) - (data.polymarketPrice || data.kalshiPrice || 50));
            if (modelDistance <= marketDistance) {
              sp.correct++;
            }
          }
        }

        sp.history.push({
          date: pred.date,
          modelProb: data.modelProbability,
          marketProb: data.polymarketPrice || data.kalshiPrice,
          divergence: data.divergence
        });
      });
    });

    // Calculate averages
    Object.keys(scenarioPerformance).forEach(scenario => {
      const sp = scenarioPerformance[scenario];
      sp.avgModelProb = (sp.avgModelProb / sp.totalPredictions).toFixed(1);
      sp.avgMarketProb = (sp.avgMarketProb / sp.totalPredictions).toFixed(1);
      sp.avgDivergence = (sp.avgDivergence / sp.totalPredictions).toFixed(1);
      sp.accuracy = sp.resolved > 0 ? ((sp.correct / sp.resolved) * 100).toFixed(1) : null;
    });

    // Overall accuracy
    let totalResolved = 0;
    let totalCorrect = 0;
    Object.values(scenarioPerformance).forEach((sp: any) => {
      totalResolved += sp.resolved;
      totalCorrect += sp.correct;
    });
    const overallAccuracy = totalResolved > 0 ? ((totalCorrect / totalResolved) * 100) : null;

    // Calibration analysis (grouping predictions by probability buckets)
    const calibration = {
      '0-20': { count: 0, avgOutcome: 0 },
      '20-40': { count: 0, avgOutcome: 0 },
      '40-60': { count: 0, avgOutcome: 0 },
      '60-80': { count: 0, avgOutcome: 0 },
      '80-100': { count: 0, avgOutcome: 0 }
    };

    predictions.forEach((pred: HistoricalPrediction) => {
      Object.values(pred.scenarios).forEach((data) => {
        if (data.resolved && data.actualOutcome !== null) {
          const prob = data.modelProbability;
          const outcome = data.actualOutcome ? 1 : 0;

          if (prob < 20) {
            calibration['0-20'].count++;
            calibration['0-20'].avgOutcome += outcome;
          } else if (prob < 40) {
            calibration['20-40'].count++;
            calibration['20-40'].avgOutcome += outcome;
          } else if (prob < 60) {
            calibration['40-60'].count++;
            calibration['40-60'].avgOutcome += outcome;
          } else if (prob < 80) {
            calibration['60-80'].count++;
            calibration['60-80'].avgOutcome += outcome;
          } else {
            calibration['80-100'].count++;
            calibration['80-100'].avgOutcome += outcome;
          }
        }
      });
    });

    // Calculate average outcomes for each bucket
    Object.keys(calibration).forEach((bucket: string) => {
      const cal = calibration[bucket as keyof typeof calibration];
      cal.avgOutcome = cal.count > 0 ? (cal.avgOutcome / cal.count) * 100 : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        predictions,
        metadata: historyData.metadata,
        analytics: {
          totalDays: predictions.length,
          scenarioPerformance,
          overallAccuracy,
          calibration
        }
      }
    });

  } catch (error) {
    console.error('Error loading historical data:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
