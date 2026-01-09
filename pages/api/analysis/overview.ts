import type { NextApiRequest, NextApiResponse } from 'next';

interface ImpactMetric {
  category: 'legal' | 'supply-chain' | 'people' | 'cyber' | 'regulatory';
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  description: string;
  ceoFocus: string;
  gcFocus: string;
}

interface RiskShift {
  id: string;
  timeframe: '24h' | '72h';
  title: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  impact: string;
  linkTo: string;
}

interface NewsArticle {
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

// Categorize articles by enterprise impact type
function categorizeImpact(article: NewsArticle): ('legal' | 'supply-chain' | 'people' | 'cyber' | 'regulatory')[] {
  const text = (article.headline + ' ' + article.tags.join(' ')).toLowerCase();
  const categories: ('legal' | 'supply-chain' | 'people' | 'cyber' | 'regulatory')[] = [];

  // Legal keywords
  if (text.match(/\b(lawsuit|litigation|legal|court|judge|trial|settlement|compliance|regulatory|sanction|embargo|ban)\b/)) {
    categories.push('legal');
  }

  // Supply chain keywords
  if (text.match(/\b(supply chain|logistics|shipping|trade|import|export|port|cargo|manufacturing|factory|production|supplier)\b/)) {
    categories.push('supply-chain');
  }

  // People/Operations keywords
  if (text.match(/\b(evacuation|refugee|migration|workforce|employee|personnel|casualties|injured|killed|death|humanitarian)\b/)) {
    categories.push('people');
  }

  // Cyber keywords
  if (text.match(/\b(cyber|hack|breach|malware|ransomware|data leak|security|infrastructure|network|digital)\b/)) {
    categories.push('cyber');
  }

  // Regulatory keywords
  if (text.match(/\b(regulation|regulatory|policy|compliance|audit|inspection|government|fda|sec|regulator)\b/)) {
    categories.push('regulatory');
  }

  // Default: if it's critical/high priority and no specific category, assign to legal/regulatory
  if (categories.length === 0 && ['CRITICAL', 'HIGH'].includes(article.priority)) {
    categories.push('regulatory');
  }

  return categories.length > 0 ? categories : ['regulatory'];
}

// Calculate severity based on article priority and count
function calculateSeverity(priority: string, count: number): 'critical' | 'high' | 'medium' | 'low' {
  if (priority === 'CRITICAL' && count >= 3) return 'critical';
  if (priority === 'CRITICAL' || (priority === 'HIGH' && count >= 5)) return 'high';
  if (priority === 'HIGH' || (priority === 'MEDIUM' && count >= 3)) return 'medium';
  return 'low';
}

// Generate impact descriptions
function generateImpactDescription(
  category: string,
  count: number,
  severity: string,
  articles: NewsArticle[]
): { description: string; ceoFocus: string; gcFocus: string } {
  const topArticle = articles[0];
  const region = topArticle?.region || 'key regions';

  switch (category) {
    case 'legal':
      return {
        description: `${count} active legal matters and regulatory investigations identified`,
        ceoFocus: `${count} active legal matters requiring executive attention. Potential operational disruptions in ${region}.`,
        gcFocus: `${count} regulatory investigations and compliance reviews. Immediate legal counsel engagement required for ${region}.`
      };
    case 'supply-chain':
      return {
        description: `${count} critical supply chain disruptions identified`,
        ceoFocus: `${count} critical supply chain disruptions in ${region}. Revenue impact estimated. Immediate mitigation required.`,
        gcFocus: `${count} supply chain disruptions with potential contractual and regulatory implications in ${region}.`
      };
    case 'people':
      return {
        description: `${count} workforce and operational risks identified`,
        ceoFocus: `${count} operational risks affecting workforce in ${region}. Business continuity planning activated.`,
        gcFocus: `${count} workforce risks requiring employment law review and duty of care compliance in ${region}.`
      };
    case 'cyber':
      return {
        description: `${count} cybersecurity threats and incidents detected`,
        ceoFocus: `${count} active cyber threats targeting critical infrastructure. IT security team on high alert.`,
        gcFocus: `${count} cybersecurity incidents with potential data breach and regulatory notification requirements.`
      };
    case 'regulatory':
      return {
        description: `${count} regulatory compliance issues identified`,
        ceoFocus: `${count} regulatory changes affecting operations in ${region}. Compliance team monitoring closely.`,
        gcFocus: `${count} regulatory changes requiring legal review and potential policy updates in ${region}.`
      };
    default:
      return {
        description: `${count} issues identified`,
        ceoFocus: `${count} issues requiring attention.`,
        gcFocus: `${count} issues requiring legal review.`
      };
  }
}

// Generate risk shifts from critical news
function generateRiskShifts(articles: NewsArticle[]): RiskShift[] {
  const criticalArticles = articles
    .filter(a => ['CRITICAL', 'HIGH'].includes(a.priority))
    .slice(0, 5);

  const now = new Date();
  const shifts: RiskShift[] = [];

  criticalArticles.forEach((article, idx) => {
    const articleDate = new Date(article.timestamp);
    const hoursAgo = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
    const timeframe: '24h' | '72h' = hoursAgo <= 24 ? '24h' : '72h';
    
    const severity = article.priority === 'CRITICAL' ? 'critical' : 'high';
    
    // Generate impact description based on article content
    const text = article.headline.toLowerCase();
    let impact = 'Ongoing monitoring required.';
    
    if (text.includes('supply') || text.includes('trade') || text.includes('shipping')) {
      impact = 'Supply chain disruptions expected. Logistics and operations may be affected.';
    } else if (text.includes('sanction') || text.includes('embargo') || text.includes('ban')) {
      impact = 'Regulatory review needed. Potential contract renegotiations. Legal exposure increasing.';
    } else if (text.includes('cyber') || text.includes('hack') || text.includes('breach')) {
      impact = 'IT security posture elevated. Data protection protocols activated. Regulatory notifications may be required.';
    } else if (text.includes('military') || text.includes('conflict') || text.includes('strike')) {
      impact = 'Supply chain disruptions expected in 48-72h. Energy costs rising. Defense sector positioning.';
    } else if (text.includes('regulatory') || text.includes('compliance')) {
      impact = 'Compliance requirements changing. Legal review required. Policy updates may be needed.';
    }

    // Create subject slug from headline
    const subjectSlug = article.headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    shifts.push({
      id: `risk-${idx + 1}`,
      timeframe,
      title: article.headline.length > 60 ? article.headline.substring(0, 60) + '...' : article.headline,
      severity,
      description: article.headline,
      impact,
      linkTo: `/analysis/${subjectSlug}`
    });
  });

  return shifts;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    success: boolean;
    data?: {
      impacts: ImpactMetric[];
      riskShifts: RiskShift[];
    };
    error?: string;
  }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Fetch live news data - use internal API call
    const baseUrl = req.headers.host 
      ? `http://${req.headers.host}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const newsResponse = await fetch(`${baseUrl}/api/news/feed?limit=50`);
    
    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news data');
    }

    const newsData = await newsResponse.json();
    const articles: NewsArticle[] = newsData.data || [];

    // Categorize articles by impact type
    const impactCategories: { [key: string]: NewsArticle[] } = {
      'legal': [],
      'supply-chain': [],
      'people': [],
      'cyber': [],
      'regulatory': []
    };

    articles.forEach(article => {
      const categories = categorizeImpact(article);
      categories.forEach(cat => {
        if (impactCategories[cat]) {
          impactCategories[cat].push(article);
        }
      });
    });

    // Generate impact metrics
    const impacts: ImpactMetric[] = [
      {
        category: 'legal',
        label: 'Legal Exposure',
        ...generateImpactDescription('legal', impactCategories['legal'].length, 
          calculateSeverity(impactCategories['legal'][0]?.priority || 'LOW', impactCategories['legal'].length),
          impactCategories['legal']),
        severity: calculateSeverity(
          impactCategories['legal'][0]?.priority || 'LOW',
          impactCategories['legal'].length
        ),
        count: impactCategories['legal'].length
      },
      {
        category: 'supply-chain',
        label: 'Supply Chain',
        ...generateImpactDescription('supply-chain', impactCategories['supply-chain'].length,
          calculateSeverity(impactCategories['supply-chain'][0]?.priority || 'LOW', impactCategories['supply-chain'].length),
          impactCategories['supply-chain']),
        severity: calculateSeverity(
          impactCategories['supply-chain'][0]?.priority || 'LOW',
          impactCategories['supply-chain'].length
        ),
        count: impactCategories['supply-chain'].length
      },
      {
        category: 'people',
        label: 'People & Operations',
        ...generateImpactDescription('people', impactCategories['people'].length,
          calculateSeverity(impactCategories['people'][0]?.priority || 'LOW', impactCategories['people'].length),
          impactCategories['people']),
        severity: calculateSeverity(
          impactCategories['people'][0]?.priority || 'LOW',
          impactCategories['people'].length
        ),
        count: impactCategories['people'].length
      },
      {
        category: 'cyber',
        label: 'Cyber Security',
        ...generateImpactDescription('cyber', impactCategories['cyber'].length,
          calculateSeverity(impactCategories['cyber'][0]?.priority || 'LOW', impactCategories['cyber'].length),
          impactCategories['cyber']),
        severity: calculateSeverity(
          impactCategories['cyber'][0]?.priority || 'LOW',
          impactCategories['cyber'].length
        ),
        count: impactCategories['cyber'].length
      },
      {
        category: 'regulatory',
        label: 'Regulatory',
        ...generateImpactDescription('regulatory', impactCategories['regulatory'].length,
          calculateSeverity(impactCategories['regulatory'][0]?.priority || 'LOW', impactCategories['regulatory'].length),
          impactCategories['regulatory']),
        severity: calculateSeverity(
          impactCategories['regulatory'][0]?.priority || 'LOW',
          impactCategories['regulatory'].length
        ),
        count: impactCategories['regulatory'].length
      }
    ];

    // Generate risk shifts from critical news
    const riskShifts = generateRiskShifts(articles);

    res.status(200).json({
      success: true,
      data: {
        impacts,
        riskShifts
      }
    });
  } catch (error: any) {
    console.error('Analysis overview error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate analysis overview'
    });
  }
}
