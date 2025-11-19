import type { NextApiRequest, NextApiResponse } from 'next';

interface MarketData {
  found: boolean;
  probability: number | null;
  question?: string;
  ticker?: string;
  volume?: string;
  url?: string;
}

interface ScenarioMap {
  [key: string]: MarketData;
}

interface KalshiResponse {
  success: boolean;
  data?: {
    scenarios: ScenarioMap;
    allMarkets: any[];
    lastUpdate: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KalshiResponse>
) {
  try {
    // Fetch from Kalshi public API (no auth required)
    let markets: any[] = [];

    try {
      // Use the public Kalshi API - fetch from events endpoint for better market discovery
      const response = await fetch('https://api.elections.kalshi.com/trade-api/v2/markets?limit=200&status=open', {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        markets = data.markets || [];
        console.log(`Successfully fetched ${markets.length} markets from Kalshi`);
      } else {
        console.log(`Kalshi API returned status ${response.status}`);
        markets = [];
      }
    } catch (apiError) {
      console.log('Kalshi API unavailable, using simulated data:', apiError);
      markets = [];
    }

    // Map to our specific scenarios
    const scenarioMap: ScenarioMap = {
      'Iran-Israel War Q1 2026': findMarket(markets, ['iran', 'israel']) || findMarket(markets, ['middle', 'east', 'conflict']) || getMockMarket('Iran-Israel War Q1 2026', 32),
      'China-Taiwan 2026': findMarket(markets, ['china', 'taiwan']) || findMarket(markets, ['china', 'economy']) || getMockMarket('China-Taiwan 2026', 15),
      'US-Venezuela 2026': findMarket(markets, ['venezuela']) || findMarket(markets, ['south', 'america']) || getMockMarket('US-Venezuela 2026', 18),
      'Russia-NATO 2026': findMarket(markets, ['russia', 'ukraine']) || findMarket(markets, ['nato']) || getMockMarket('Russia-NATO 2026', 10)
    };

    res.status(200).json({
      success: true,
      data: {
        scenarios: scenarioMap,
        allMarkets: markets.slice(0, 20),
        lastUpdate: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getMockMarket(scenario: string, probability: number): MarketData {
  return {
    found: false,
    probability,
    question: `${scenario} (No Kalshi market found)`,
    ticker: scenario.toLowerCase().replace(/\s+/g, '-'),
    volume: '0',
    url: `https://kalshi.com/`
  };
}

function findMarket(markets: any[], keywords: string[]): MarketData | null {
  // Filter to active markets
  const activeMarkets = markets.filter((m: any) => m.status === 'active');

  const market = activeMarkets.find((m: any) => {
    const searchText = (m.title + ' ' + (m.subtitle || '')).toLowerCase();
    return keywords.every(k => searchText.includes(k.toLowerCase()));
  });

  if (!market) {
    return null;
  }

  // Calculate probability from yes_bid and yes_ask (midpoint)
  let yesProbability: number | null = null;

  try {
    // Kalshi prices are in cents (0-100), convert to probability percentage
    const yesBid = market.yes_bid || 0;
    const yesAsk = market.yes_ask || 0;

    if (yesAsk > 0 && yesBid > 0) {
      // Use midpoint of bid/ask
      yesProbability = (yesBid + yesAsk) / 2;
    } else if (market.last_price > 0) {
      // Fallback to last price
      yesProbability = market.last_price;
    }
  } catch (e) {
    console.log('Error parsing Kalshi prices:', e);
  }

  return {
    found: true,
    probability: yesProbability,
    question: market.title,
    ticker: market.ticker,
    volume: String(market.volume || '0'),
    url: `https://kalshi.com/markets/${market.ticker}`
  };
}
