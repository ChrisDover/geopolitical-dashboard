import type { NextApiRequest, NextApiResponse } from 'next';

interface BriefingData {
  whatToDo: string;
  operationalImpact: string;
  whatToMonitor: string[];
}

interface ExposureData {
  legal: { severity: string; value: string };
  supplyChain: { severity: string; value: string };
  people: { severity: string; value: string };
  cyber: { severity: string; value: string };
  regulatory: { severity: string; value: string };
}

interface CoverageItem {
  title: string;
  source: string;
  timestamp: string;
  text: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    success: boolean;
    data?: {
      briefing: BriefingData;
      exposure: ExposureData;
      coverage: CoverageItem[];
    };
    error?: string;
  }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { subject } = req.query;

  if (!subject || typeof subject !== 'string') {
    return res.status(400).json({ success: false, error: 'Subject parameter required' });
  }

  try {
    // Fetch live news data related to subject
    const baseUrl = req.headers.host 
      ? `http://${req.headers.host}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const newsResponse = await fetch(`${baseUrl}/api/news/feed?limit=50`);
    const newsData = newsResponse.ok ? await newsResponse.json() : { data: [] };
    const allArticles = newsData.data || [];
    
    // Filter articles relevant to subject
    const subjectLower = subject.toLowerCase();
    const subjectKeywords = subjectLower.split('-').filter(w => w.length > 2);
    
    const relevantArticles = allArticles.filter((article: any) => {
      const text = (article.headline + ' ' + article.region).toLowerCase();
      return subjectKeywords.some(keyword => text.includes(keyword));
    }).slice(0, 10);
    
    // Generate briefing based on subject
    let briefing: BriefingData;
    let exposure: ExposureData;
    let coverage: CoverageItem[];

    if (subjectLower.includes('iran') || subjectLower.includes('israel')) {
      briefing = {
        whatToDo: 'Monitor developments closely. Activate crisis management protocols if escalation continues beyond 72 hours. Review supply chain dependencies in the region.',
        operationalImpact: 'Supply chain disruptions expected in key regions. Energy costs rising 8-12%. Defense sector positioning for increased demand. Potential workforce relocations.',
        whatToMonitor: [
          'Military escalation indicators',
          'Oil price volatility',
          'Supply chain status updates',
          'Regulatory announcements',
          'Market sentiment shifts'
        ]
      };

      exposure = {
        legal: { severity: 'high', value: '3 active matters' },
        supplyChain: { severity: 'critical', value: '5 disruptions' },
        people: { severity: 'medium', value: '2 regions affected' },
        cyber: { severity: 'high', value: '4 threats detected' },
        regulatory: { severity: 'medium', value: '2 changes pending' }
      };

      // Use live news articles for coverage
      coverage = relevantArticles.length > 0 
        ? relevantArticles.slice(0, 5).map((article: any) => {
            const articleDate = new Date(article.timestamp);
            const now = new Date();
            const hoursAgo = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
            const timeStr = hoursAgo < 1 ? 'Just now' : 
                           hoursAgo === 1 ? '1 hour ago' : 
                           `${hoursAgo} hours ago`;
            
            return {
              title: article.headline,
              source: article.source,
              timestamp: timeStr,
              text: article.headline
            };
          })
        : [
            {
              title: 'Breaking: Escalation in Middle East',
              source: 'Reuters',
              timestamp: '2 hours ago',
              text: 'Military escalation between Iran and Israel intensifies with direct strikes reported.'
            }
          ];
    } else if (subjectLower.includes('sanctions')) {
      briefing = {
        whatToDo: 'Immediate compliance review required. Assess all contracts and relationships in affected regions. Update compliance protocols.',
        operationalImpact: 'Contract renegotiations may be required. Some business relationships at risk. Regulatory reporting obligations increasing.',
        whatToMonitor: [
          'Sanctions list updates',
          'Regulatory guidance',
          'Contract compliance status',
          'Legal counsel recommendations',
          'Business partner notifications'
        ]
      };

      exposure = {
        legal: { severity: 'critical', value: '5 compliance reviews' },
        supplyChain: { severity: 'high', value: '3 relationships at risk' },
        people: { severity: 'low', value: 'Minimal impact' },
        cyber: { severity: 'medium', value: '2 monitoring alerts' },
        regulatory: { severity: 'critical', value: '4 changes required' }
      };

      // Use live news articles for coverage
      coverage = relevantArticles.length > 0 
        ? relevantArticles.slice(0, 5).map((article: any) => {
            const articleDate = new Date(article.timestamp);
            const now = new Date();
            const hoursAgo = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
            const timeStr = hoursAgo < 1 ? 'Just now' : 
                           hoursAgo === 1 ? '1 hour ago' : 
                           `${hoursAgo} hours ago`;
            
            return {
              title: article.headline,
              source: article.source,
              timestamp: timeStr,
              text: article.headline
            };
          })
        : [
            {
              title: 'New Sanctions Framework Announced',
              source: 'Wall Street Journal',
              timestamp: '1 hour ago',
              text: 'EU and US announce coordinated sanctions targeting key sectors.'
            }
          ];
    } else {
      // Default/generic briefing
      briefing = {
        whatToDo: 'Monitor situation closely. Review risk assessment protocols. Maintain vigilant posture.',
        operationalImpact: 'Ongoing monitoring required. Potential impacts across multiple business areas.',
        whatToMonitor: [
          'Situation developments',
          'Market reactions',
          'Regulatory updates',
          'Supply chain status',
          'Security alerts'
        ]
      };

      exposure = {
        legal: { severity: 'medium', value: '2 active matters' },
        supplyChain: { severity: 'medium', value: '3 potential disruptions' },
        people: { severity: 'low', value: '1 region monitored' },
        cyber: { severity: 'medium', value: '2 threats detected' },
        regulatory: { severity: 'low', value: '1 change pending' }
      };

      // Use live news articles for coverage
      coverage = relevantArticles.length > 0 
        ? relevantArticles.slice(0, 5).map((article: any) => {
            const articleDate = new Date(article.timestamp);
            const now = new Date();
            const hoursAgo = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
            const timeStr = hoursAgo < 1 ? 'Just now' : 
                           hoursAgo === 1 ? '1 hour ago' : 
                           `${hoursAgo} hours ago`;
            
            return {
              title: article.headline,
              source: article.source,
              timestamp: timeStr,
              text: article.headline
            };
          })
        : [
            {
              title: 'Geopolitical Situation Update',
              source: 'News Source',
              timestamp: 'Recent',
              text: 'Latest developments in the situation.'
            }
          ];
    }

    res.status(200).json({
      success: true,
      data: {
        briefing,
        exposure,
        coverage
      }
    });
  } catch (error: any) {
    console.error('Analysis subject error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate analysis'
    });
  }
}

