/**
 * News Feed API
 *
 * Sources:
 * - GDELT Project API (real-time global event database)
 * - AllSides.com RSS (multi-perspective news, alternative to Ground News)
 *
 * Note: Ground News was requested but no longer provides public API access.
 * They require a paid subscription. AllSides.com provides similar balanced,
 * multi-perspective coverage and is used as an alternative.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser';

interface Article {
  timestamp: string;
  source: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  region: string;
  headline: string;
  url: string;
  tags: string[];
  sentiment: number;
  verified: boolean;
}

interface NewsResponse {
  success: boolean;
  data?: Article[];
  lastUpdate?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsResponse>
) {
  const { filter = 'all', limit = 20 } = req.query;

  try {
    const queries = [
      'Iran Israel military strike',
      'China Taiwan invasion military',
      'Venezuela military Colombia border',
      'Russia NATO Ukraine escalation',
      'Saudi Arabia OPEC oil production',
      'North Korea missile nuclear',
      'Syria military conflict'
    ];

    const allArticles: Article[] = [];

    for (const query of queries) {
      const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json&timespan=24h`;

      const response = await fetch(gdeltUrl);

      if (!response.ok) continue;

      const data = await response.json();

      if (data.articles) {
        const processedArticles = data.articles
          .filter((article: any) => article && article.title && article.url)
          .map((article: any) => {
            // Parse GDELT date format (YYYYMMDDTHHmmssZ)
            let timestamp;
            try {
              if (article.seendate) {
                // GDELT format: 20231118T120000Z
                const dateStr = article.seendate.toString();
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                const hour = dateStr.substring(9, 11);
                const minute = dateStr.substring(11, 13);
                const second = dateStr.substring(13, 15);
                timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
              } else {
                timestamp = new Date().toISOString();
              }
            } catch (e) {
              timestamp = new Date().toISOString();
            }

            return {
              timestamp,
              source: extractDomain(article.url || ''),
              priority: calculatePriority(article.title || ''),
              region: categorizeRegion(article.title || '', article.url || ''),
              headline: article.title || 'No headline',
              url: article.url || '',
              tags: extractTags(query),
              sentiment: parseSentiment(article.tone),
              verified: isVerifiedSource(article.url || '')
            };
          });

        allArticles.push(...processedArticles);
      }
    }

    // Fetch from AllSides RSS (alternative to Ground News) with timeout
    try {
      const parser = new Parser({
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GeopoliticalDashboard/1.0)'
        }
      });

      // Wrap in Promise.race with timeout
      const feedPromise = parser.parseURL('https://www.allsides.com/rss/news');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AllSides RSS timeout')), 5000)
      );

      const feed = await Promise.race([feedPromise, timeoutPromise]) as any;

      if (feed && feed.items && feed.items.length > 0) {
        const allsidesArticles = feed.items
          .slice(0, 15) // Limit to 15 most recent articles
          .filter((item: any) => item && item.title && item.link)
          .map((item: any) => ({
            timestamp: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            source: 'AllSides.com',
            priority: calculatePriority(item.title || ''),
            region: categorizeRegion(item.title || '', item.link || ''),
            headline: item.title || 'No headline',
            url: item.link || '',
            tags: extractTags((item.title || '') + ' ' + (item.contentSnippet || '')),
            sentiment: 0, // AllSides provides balanced coverage, neutral sentiment
            verified: true // AllSides is a verified multi-perspective source
          }));

        allArticles.push(...allsidesArticles);
      }
    } catch (error) {
      // Continue even if AllSides fetch fails - don't block GDELT data
      console.error('AllSides RSS fetch error (continuing with GDELT only):', error);
    }

    // Sort by priority and recency
    const sorted = allArticles.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Apply filter
    const filtered = filter === 'critical'
      ? sorted.filter(a => ['CRITICAL', 'HIGH'].includes(a.priority))
      : sorted;

    res.status(200).json({
      success: true,
      data: filtered.slice(0, parseInt(limit as string)),
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

function calculatePriority(title: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const text = title.toLowerCase();

  // Enhanced keyword lists with more comprehensive coverage
  const criticalKeywords = [
    'nuclear strike', 'ballistic missile', 'invasion', 'war declared', 'nuclear',
    'airstrike', 'bombing', 'casualties', 'attack on', 'killed', 'explosion',
    'military offensive', 'armed conflict', 'chemical weapon', 'terrorist attack'
  ];

  const highKeywords = [
    'military', 'conflict', 'escalation', 'troops deployed', 'missile',
    'combat', 'forces', 'artillery', 'drone strike', 'military action',
    'sanctions imposed', 'blockade', 'incursion', 'border clash',
    'naval confrontation', 'air defense', 'mobilization'
  ];

  const mediumKeywords = [
    'tension', 'exercise', 'deployment', 'sanction', 'warning',
    'diplomatic', 'talks', 'negotiation', 'summit', 'crisis',
    'protest', 'demonstration', 'unrest', 'dispute', 'standoff'
  ];

  // Score-based priority with keyword weighting
  let score = 0;
  criticalKeywords.forEach(k => { if (text.includes(k)) score += 10; });
  highKeywords.forEach(k => { if (text.includes(k)) score += 5; });
  mediumKeywords.forEach(k => { if (text.includes(k)) score += 2; });

  if (score >= 10) return 'CRITICAL';
  if (score >= 5) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function categorizeRegion(title: string, url: string): string {
  const text = (title + ' ' + url).toLowerCase();

  // Enhanced region detection with more countries and aliases
  const middleEast = [
    'iran', 'israel', 'gaza', 'palestine', 'saudi', 'syria', 'lebanon',
    'hezbollah', 'hamas', 'yemen', 'iraq', 'jordan', 'egypt', 'turkey',
    'gulf', 'persian gulf', 'red sea', 'suez'
  ];

  const eastAsia = [
    'china', 'taiwan', 'korea', 'japan', 'vietnam', 'philippines',
    'south china sea', 'beijing', 'pyongyang', 'seoul', 'tokyo',
    'strait', 'pacific', 'asean'
  ];

  const southAmerica = [
    'venezuela', 'colombia', 'brazil', 'argentina', 'chile', 'peru',
    'bolivia', 'latin america', 'south america', 'caracas', 'bogota'
  ];

  const europe = [
    'russia', 'ukraine', 'nato', 'europe', 'poland', 'baltic',
    'germany', 'france', 'uk', 'britain', 'moscow', 'kiev', 'kyiv',
    'belarus', 'lithuania', 'estonia', 'latvia', 'eu', 'european union'
  ];

  const africa = [
    'africa', 'sudan', 'ethiopia', 'somalia', 'nigeria', 'congo',
    'sahel', 'libya', 'egypt', 'sahara', 'african union'
  ];

  const southAsia = [
    'india', 'pakistan', 'afghanistan', 'bangladesh', 'kashmir',
    'delhi', 'islamabad', 'kabul', 'taliban'
  ];

  if (middleEast.some(k => text.includes(k))) return 'Middle East';
  if (eastAsia.some(k => text.includes(k))) return 'East Asia';
  if (southAmerica.some(k => text.includes(k))) return 'South America';
  if (europe.some(k => text.includes(k))) return 'Europe';
  if (africa.some(k => text.includes(k))) return 'Africa';
  if (southAsia.some(k => text.includes(k))) return 'South Asia';

  return 'Global';
}

function extractTags(query: string): string[] {
  const title = query.toLowerCase();

  // Create semantic tags based on content
  const tags: string[] = [];

  // Military/Conflict tags
  if (title.includes('military') || title.includes('forces') || title.includes('troops')) tags.push('Military');
  if (title.includes('conflict') || title.includes('war')) tags.push('Conflict');
  if (title.includes('diplomacy') || title.includes('negotiat') || title.includes('talks')) tags.push('Diplomacy');
  if (title.includes('sanction') || title.includes('trade') || title.includes('economic')) tags.push('Economic');
  if (title.includes('cyber') || title.includes('hack')) tags.push('Cyber');
  if (title.includes('nuclear') || title.includes('missile')) tags.push('WMD');
  if (title.includes('naval') || title.includes('maritime') || title.includes('sea')) tags.push('Naval');
  if (title.includes('terror') || title.includes('insurgent')) tags.push('Terrorism');
  if (title.includes('humanitarian') || title.includes('refugee') || title.includes('aid')) tags.push('Humanitarian');
  if (title.includes('election') || title.includes('government') || title.includes('politic')) tags.push('Political');

  return tags.length > 0 ? tags : ['Geopolitical'];
}

function parseSentiment(tone: string | number): number {
  // GDELT tone is typically a float between -10 (very negative) and +10 (very positive)
  if (!tone) return 0;
  return parseFloat(tone.toString()) / 10; // Normalize to -1 to +1
}

function isVerifiedSource(url: string): boolean {
  const verifiedDomains = [
    'reuters.com', 'bloomberg.com', 'apnews.com',
    'bbc.com', 'cnn.com', 'ft.com', 'wsj.com',
    'nytimes.com', 'washingtonpost.com', 'theguardian.com',
    'aljazeera.com', 'axios.com', 'ground.news', 'allsides.com'
  ];
  return verifiedDomains.some(domain => url.includes(domain));
}
