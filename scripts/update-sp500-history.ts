import fs from 'fs';
import path from 'path';

const ALPHAVANTAGE_API_KEY = 'ZAN2YWHAD299PEE8';

interface DailyData {
  date: string;
  close: number;
}

async function fetchSP500History(): Promise<DailyData[]> {
  console.log('Fetching S&P 500 historical data from AlphaVantage...');

  // Fetch SPY (S&P 500 ETF) daily data
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&outputsize=full&apikey=${ALPHAVANTAGE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data['Time Series (Daily)']) {
    console.error('Failed to fetch data:', data);
    throw new Error('No time series data returned from AlphaVantage');
  }

  const timeSeries = data['Time Series (Daily)'];
  const dailyData: DailyData[] = [];

  for (const [date, values] of Object.entries(timeSeries)) {
    dailyData.push({
      date,
      close: parseFloat((values as any)['4. close'])
    });
  }

  // Sort by date ascending
  dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log(`Fetched ${dailyData.length} days of S&P 500 data`);
  console.log(`Date range: ${dailyData[0].date} to ${dailyData[dailyData.length - 1].date}`);

  return dailyData;
}

async function updateEquityCurves() {
  const sp500Data = await fetchSP500History();

  // Filter to weekly data (every Monday or closest trading day)
  const startDate = new Date('2024-11-18');
  const endDate = new Date('2025-11-18');

  const weeklyData: DailyData[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Find the closest trading day to this Monday
    const targetDateStr = currentDate.toISOString().split('T')[0];

    // Look for exact match or closest date within 3 days
    let closestData = sp500Data.find(d => d.date === targetDateStr);

    if (!closestData) {
      // Try next few days
      for (let i = 1; i <= 3; i++) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + i);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        closestData = sp500Data.find(d => d.date === nextDateStr);
        if (closestData) break;
      }
    }

    if (closestData) {
      weeklyData.push(closestData);
    }

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

  console.log(`\nGenerated ${weeklyData.length} weekly data points`);

  // Calculate normalized values (starting at 100000)
  const startValue = weeklyData[0].close;
  const normalizedData = weeklyData.map(d => ({
    date: d.date,
    sp500Value: Math.round((d.close / startValue) * 100000)
  }));

  // Calculate max drawdown
  let peak = normalizedData[0].sp500Value;
  let maxDrawdown = 0;
  let peakDate = normalizedData[0].date;
  let troughDate = normalizedData[0].date;
  let troughValue = normalizedData[0].sp500Value;

  for (const point of normalizedData) {
    if (point.sp500Value > peak) {
      peak = point.sp500Value;
      peakDate = point.date;
    }

    const drawdown = ((point.sp500Value - peak) / peak) * 100;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
      troughDate = point.date;
      troughValue = point.sp500Value;
    }
  }

  console.log(`\nS&P 500 Statistics:`);
  console.log(`Peak: $${peak.toLocaleString()} on ${peakDate}`);
  console.log(`Trough: $${troughValue.toLocaleString()} on ${troughDate}`);
  console.log(`Max Drawdown: ${maxDrawdown.toFixed(2)}%`);
  console.log(`Start: $${normalizedData[0].sp500Value.toLocaleString()} (${normalizedData[0].date})`);
  console.log(`End: $${normalizedData[normalizedData.length - 1].sp500Value.toLocaleString()} (${normalizedData[normalizedData.length - 1].date})`);
  console.log(`Total Return: ${(((normalizedData[normalizedData.length - 1].sp500Value - normalizedData[0].sp500Value) / normalizedData[0].sp500Value) * 100).toFixed(2)}%`);

  // Update both portfolio files
  const portfolioFiles = [
    'data/portfolio.json',
    'data/equities-portfolio.json'
  ];

  for (const filePath of portfolioFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    const portfolioData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    // Update equity curve with real S&P 500 data
    const updatedCurve = portfolioData.equityCurve.map((point: any) => {
      const sp500Point = normalizedData.find(d => d.date === point.date);
      return {
        ...point,
        sp500Value: sp500Point ? sp500Point.sp500Value : point.sp500Value
      };
    });

    portfolioData.equityCurve = updatedCurve;

    fs.writeFileSync(fullPath, JSON.stringify(portfolioData, null, 2));
    console.log(`\nUpdated ${filePath} with real S&P 500 data`);
  }

  console.log('\n✅ All equity curves updated with live AlphaVantage data!');
}

updateEquityCurves().catch(console.error);
