# Historical Prediction Tracking Scripts

This directory contains scripts for managing historical prediction data.

## Scripts

### `generate-historical-data.ts`

Generates historical prediction data for a specified date range. Used for initial setup or backfilling data.

**Usage:**
```bash
npx tsx scripts/generate-historical-data.ts
```

**What it does:**
- Generates 80 days of historical predictions (Sept 1 - Nov 19, 2025)
- Creates realistic probability progressions with daily fluctuations
- Includes resolved predictions to demonstrate model accuracy
- Calculates comprehensive metadata (accuracy, divergence, etc.)
- Overwrites existing `data/historical-predictions.json`

### `log-daily-predictions.ts`

Appends today's predictions to the historical data file. Should be run daily.

**Usage:**
```bash
# Run manually
npx tsx scripts/log-daily-predictions.ts

# Or schedule via cron (Linux/Mac)
0 0 * * * cd /path/to/project && npx tsx scripts/log-daily-predictions.ts

# Or use Vercel Cron (see vercel.json configuration)
```

**What it does:**
- Fetches current model probabilities and market prices
- Appends (or updates) today's prediction entry
- Recalculates metadata
- Updates `data/historical-predictions.json`

## API Endpoints

### `POST /api/analytics/log-daily`

API endpoint to trigger daily prediction logging. Can be called manually or automated via cron jobs.

**Usage:**
```bash
# Manual trigger
curl -X POST http://localhost:3003/api/analytics/log-daily

# Or in production
curl -X POST https://yourdomain.com/api/analytics/log-daily
```

**Response:**
```json
{
  "success": true,
  "message": "Daily predictions logged successfully",
  "data": {
    "date": "2025-11-20T00:00:00.000Z",
    "scenariosTracked": 8,
    "totalDays": 81,
    "accuracy": 67,
    "averageDivergence": 3.8,
    "updated": false
  }
}
```

## Automation Options

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/analytics/log-daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This will automatically call the API endpoint daily at midnight UTC.

### Option 2: GitHub Actions

Create `.github/workflows/daily-logging.yml`:
```yaml
name: Daily Prediction Logging
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  log-predictions:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger logging endpoint
        run: |
          curl -X POST https://yourdomain.com/api/analytics/log-daily
```

### Option 3: System Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at midnight)
0 0 * * * cd /path/to/geopolitical-dashboard && npx tsx scripts/log-daily-predictions.ts
```

### Option 4: Manual Trigger

Run the script manually whenever you want to log today's predictions:
```bash
npx tsx scripts/log-daily-predictions.ts
```

## Data Structure

### `data/historical-predictions.json`

```json
{
  "predictions": [
    {
      "date": "2025-09-01T00:00:00.000Z",
      "scenarios": {
        "Iran-Israel War Q1 2026": {
          "modelProbability": 28,
          "polymarketPrice": 21,
          "kalshiPrice": null,
          "divergence": 7,
          "actualOutcome": null,
          "resolved": false
        },
        ...
      }
    },
    ...
  ],
  "metadata": {
    "totalPredictions": 6,
    "correctPredictions": 4,
    "accuracy": 67,
    "averageDivergence": 3.8,
    "lastUpdate": "2025-11-19T00:00:00.000Z"
  }
}
```

## Marking Predictions as Resolved

When a prediction event resolves, manually update the historical data:

1. Open `data/historical-predictions.json`
2. Find the relevant scenario across all date entries
3. Update the scenario for the resolution date:
   ```json
   {
     "modelProbability": 65,
     "polymarketPrice": 58,
     "kalshiPrice": null,
     "divergence": 7,
     "actualOutcome": true,  // Event happened
     "resolved": true         // Mark as resolved
   }
   ```
4. Save the file
5. The next daily logging run will recalculate accuracy metrics

## Calibration Analysis

The system tracks prediction calibration by grouping predictions into probability buckets:

- **0-20%**: Low probability events
- **20-40%**: Unlikely events
- **40-60%**: Toss-up events
- **60-80%**: Likely events
- **80-100%**: High probability events

For each bucket, the system calculates:
- How many predictions fell into this range
- What percentage of those predictions actually occurred

Well-calibrated models should see ~10% of 0-20% predictions occur, ~50% of 40-60% predictions occur, etc.

## Monitoring & Debugging

Check the last update timestamp:
```bash
cat data/historical-predictions.json | grep lastUpdate
```

View total days tracked:
```bash
cat data/historical-predictions.json | grep -c '"date"'
```

Check model accuracy:
```bash
cat data/historical-predictions.json | grep '"accuracy"'
```

## Troubleshooting

**Issue: Daily logging not working**
- Check file permissions on `data/historical-predictions.json`
- Verify `data/market-divergence.json` exists and is valid JSON
- Check API endpoint logs for errors

**Issue: Accuracy always null**
- No predictions have been resolved yet
- Add actual outcomes by manually updating resolved predictions

**Issue: Same day logged multiple times**
- The script will update existing entries for today's date
- Each day should only have one entry; check the date field

## Best Practices

1. **Run daily logging consistently** - Set up automated cron job
2. **Backup historical data** - Commit to git regularly
3. **Resolve predictions promptly** - Update outcomes as events resolve
4. **Monitor accuracy** - Review calibration charts monthly
5. **Archive old data** - Consider moving resolved predictions older than 1 year to archive file
