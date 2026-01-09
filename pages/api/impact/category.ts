import type { NextApiRequest, NextApiResponse } from 'next';

interface ExposureData {
  [key: string]: { severity: string; value: string };
}

interface Effect {
  id: string;
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedAreas: string[];
}

interface EffectLevel {
  order: number;
  effects: Effect[];
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

// Categorize articles by impact type (same logic as overview)
function categorizeImpact(article: NewsArticle): ('legal' | 'supply-chain' | 'people' | 'cyber' | 'regulatory')[] {
  const text = (article.headline + ' ' + article.tags.join(' ')).toLowerCase();
  const categories: ('legal' | 'supply-chain' | 'people' | 'cyber' | 'regulatory')[] = [];

  if (text.match(/\b(lawsuit|litigation|legal|court|judge|trial|settlement|compliance|regulatory|sanction|embargo|ban)\b/)) {
    categories.push('legal');
  }
  if (text.match(/\b(supply chain|logistics|shipping|trade|import|export|port|cargo|manufacturing|factory|production|supplier)\b/)) {
    categories.push('supply-chain');
  }
  if (text.match(/\b(evacuation|refugee|migration|workforce|employee|personnel|casualties|injured|killed|death|humanitarian)\b/)) {
    categories.push('people');
  }
  if (text.match(/\b(cyber|hack|breach|malware|ransomware|data leak|security|infrastructure|network|digital)\b/)) {
    categories.push('cyber');
  }
  if (text.match(/\b(regulation|regulatory|policy|compliance|audit|inspection|government|fda|sec|regulator)\b/)) {
    categories.push('regulatory');
  }
  if (categories.length === 0 && ['CRITICAL', 'HIGH'].includes(article.priority)) {
    categories.push('regulatory');
  }

  return categories.length > 0 ? categories : ['regulatory'];
}

// Calculate severity from articles
function calculateSeverity(articles: NewsArticle[]): 'critical' | 'high' | 'medium' | 'low' {
  if (articles.length === 0) return 'low';
  const criticalCount = articles.filter(a => a.priority === 'CRITICAL').length;
  const highCount = articles.filter(a => a.priority === 'HIGH').length;
  
  if (criticalCount >= 2 || (criticalCount >= 1 && articles.length >= 5)) return 'critical';
  if (criticalCount >= 1 || highCount >= 3) return 'high';
  if (highCount >= 1 || articles.length >= 3) return 'medium';
  return 'low';
}

// Get unique regions from articles
function getUniqueRegions(articles: NewsArticle[]): string[] {
  return [...new Set(articles.map(a => a.region))];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    success: boolean;
    data?: {
      exposure: ExposureData;
      effects: EffectLevel[];
      mitigation: string[];
    };
    error?: string;
  }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { category, mode } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ success: false, error: 'Category parameter required' });
  }

  try {
    const categoryLower = category.toLowerCase();
    const viewMode = mode === 'GC' ? 'GC' : 'CEO';

    // Fetch live news data - use internal API call
    const baseUrl = req.headers.host 
      ? `http://${req.headers.host}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const newsResponse = await fetch(`${baseUrl}/api/news/feed?limit=100`);
    
    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news data');
    }

    const newsData = await newsResponse.json();
    const allArticles: NewsArticle[] = newsData.data || [];

    // Filter articles relevant to this category
    const relevantArticles = allArticles.filter(article => {
      const categories = categorizeImpact(article);
      return categories.includes(categoryLower as any);
    });

    const severity = calculateSeverity(relevantArticles);
    const regions = getUniqueRegions(relevantArticles);
    const count = relevantArticles.length;

    // Generate impact data based on category and live news
    let exposure: ExposureData;
    let effects: EffectLevel[];
    let mitigation: string[];

    switch (categoryLower) {
      case 'legal':
        exposure = {
          activeCases: { severity, value: `${count} active matters` },
          regions: { severity: regions.length >= 3 ? 'critical' : regions.length >= 2 ? 'high' : 'medium', value: `${regions.length} region${regions.length !== 1 ? 's' : ''} affected` },
          departments: { severity, value: `${Math.min(count, 5)} departments involved` },
          estimatedImpact: { severity, value: viewMode === 'CEO' ? 'Legal review required' : 'Regulatory review required' }
        };
        effects = [
          {
            order: 1,
            effects: [
              {
                id: '1',
                label: 'Regulatory Compliance Review',
                severity: 'critical',
                description: 'Immediate compliance review required across affected regions. Legal counsel engagement necessary.',
                affectedAreas: ['Legal', 'Compliance', 'Operations']
              },
              {
                id: '2',
                label: 'Contractual Obligations',
                severity: 'high',
                description: 'Existing contracts may be impacted, requiring review and potential renegotiation.',
                affectedAreas: ['Legal', 'Sales', 'Finance']
              }
            ]
          },
          {
            order: 2,
            effects: [
              {
                id: '3',
                label: 'Operational Restrictions',
                severity: 'high',
                description: 'New regulatory requirements may restrict certain operations or require process changes.',
                affectedAreas: ['Operations', 'Compliance', 'Production']
              },
              {
                id: '4',
                label: 'Financial Liability',
                severity: 'medium',
                description: 'Potential financial penalties or settlements may impact quarterly results.',
                affectedAreas: ['Finance', 'Legal', 'Executive']
              }
            ]
          },
          {
            order: 3,
            effects: [
              {
                id: '5',
                label: 'Business Model Adjustments',
                severity: 'medium',
                description: 'Long-term business model may require adjustments to maintain compliance.',
                affectedAreas: ['Strategy', 'Operations', 'Executive']
              }
            ]
          },
          {
            order: 4,
            effects: [
              {
                id: '6',
                label: 'Market Position Impact',
                severity: 'low',
                description: 'Extended legal proceedings may impact competitive positioning.',
                affectedAreas: ['Strategy', 'Sales', 'Executive']
              }
            ]
          }
        ];
        mitigation = [
          'Engage legal counsel immediately',
          'Conduct comprehensive compliance audit',
          'Review all affected contracts',
          'Establish regulatory monitoring protocols',
          'Develop contingency plans for potential outcomes'
        ];
        break;

      case 'supply-chain':
        exposure = {
          disruptions: { severity, value: `${count} active disruption${count !== 1 ? 's' : ''}` },
          regions: { severity: regions.length >= 3 ? 'critical' : regions.length >= 2 ? 'high' : 'medium', value: `${regions.length} critical region${regions.length !== 1 ? 's' : ''}` },
          suppliers: { severity, value: `${Math.min(count * 2, 20)} suppliers potentially affected` },
          estimatedImpact: { severity, value: viewMode === 'CEO' ? 'Revenue risk identified' : 'Contractual force majeure review' }
        };
        effects = [
          {
            order: 1,
            effects: [
              {
                id: '1',
                label: 'Supply Chain Disruption',
                severity: 'critical',
                description: 'Immediate disruption to critical supply chains. Key suppliers unable to deliver components.',
                affectedAreas: ['Manufacturing', 'Operations', 'Logistics']
              },
              {
                id: '2',
                label: 'Inventory Shortages',
                severity: 'high',
                description: 'Raw material and component shortages impact production capacity.',
                affectedAreas: ['Production', 'Inventory', 'Operations']
              }
            ]
          },
          {
            order: 2,
            effects: [
              {
                id: '3',
                label: 'Production Delays',
                severity: 'high',
                description: 'Manufacturing delays cascade to production schedules, impacting delivery commitments.',
                affectedAreas: ['Production', 'Sales', 'Customer Relations']
              },
              {
                id: '4',
                label: 'Cost Increases',
                severity: 'medium',
                description: 'Alternative suppliers and expedited shipping increase operational costs.',
                affectedAreas: ['Finance', 'Operations', 'Procurement']
              }
            ]
          },
          {
            order: 3,
            effects: [
              {
                id: '5',
                label: 'Revenue Impact',
                severity: 'high',
                description: 'Delayed deliveries directly impact quarterly revenue projections.',
                affectedAreas: ['Finance', 'Sales', 'Executive']
              },
              {
                id: '6',
                label: 'Customer Relationship Strain',
                severity: 'medium',
                description: 'Delayed commitments strain customer relationships.',
                affectedAreas: ['Sales', 'Customer Success', 'Executive']
              }
            ]
          },
          {
            order: 4,
            effects: [
              {
                id: '7',
                label: 'Market Share Erosion',
                severity: 'medium',
                description: 'Competitors may gain market share while we address supply chain issues.',
                affectedAreas: ['Strategy', 'Sales', 'Executive']
              }
            ]
          }
        ];
        mitigation = [
          'Activate alternative supplier relationships',
          'Implement inventory buffer strategies',
          'Communicate proactively with affected customers',
          'Expedite shipping for critical components',
          'Review force majeure clauses in contracts'
        ];
        break;

      case 'cyber':
        exposure = {
          activeThreats: { severity, value: `${count} threat${count !== 1 ? 's' : ''} detected` },
          systems: { severity, value: `${Math.min(count * 2, 15)} systems potentially at risk` },
          dataExposure: { severity: count >= 3 ? 'critical' : count >= 2 ? 'high' : 'medium', value: count >= 3 ? 'Sensitive data potentially exposed' : 'Monitoring elevated' },
          estimatedImpact: { severity, value: viewMode === 'CEO' ? 'Operational disruption risk' : 'Regulatory notification may be required' }
        };
        effects = [
          {
            order: 1,
            effects: [
              {
                id: '1',
                label: 'Security Breach',
                severity: 'critical',
                description: 'Active cybersecurity threats targeting critical infrastructure detected.',
                affectedAreas: ['IT Security', 'Operations', 'Data Protection']
              },
              {
                id: '2',
                label: 'System Compromise',
                severity: 'high',
                description: 'Potential unauthorized access to sensitive systems and data.',
                affectedAreas: ['IT', 'Data Security', 'Compliance']
              }
            ]
          },
          {
            order: 2,
            effects: [
              {
                id: '3',
                label: 'Data Breach Notification',
                severity: 'high',
                description: 'Regulatory requirements may trigger mandatory breach notifications.',
                affectedAreas: ['Legal', 'Compliance', 'IT']
              },
              {
                id: '4',
                label: 'Operational Disruption',
                severity: 'medium',
                description: 'Security measures may temporarily disrupt normal operations.',
                affectedAreas: ['Operations', 'IT', 'Customer Service']
              }
            ]
          },
          {
            order: 3,
            effects: [
              {
                id: '5',
                label: 'Regulatory Fines',
                severity: 'medium',
                description: 'Potential regulatory fines for data protection violations.',
                affectedAreas: ['Finance', 'Legal', 'Compliance']
              },
              {
                id: '6',
                label: 'Customer Trust Impact',
                severity: 'medium',
                description: 'Data breach may erode customer trust and confidence.',
                affectedAreas: ['Sales', 'Marketing', 'Customer Success']
              }
            ]
          },
          {
            order: 4,
            effects: [
              {
                id: '7',
                label: 'Reputational Damage',
                severity: 'low',
                description: 'Extended security issues may impact brand reputation.',
                affectedAreas: ['Marketing', 'Investor Relations', 'Executive']
              }
            ]
          }
        ];
        mitigation = [
          'Elevate IT security posture immediately',
          'Activate incident response protocols',
          'Engage cybersecurity experts',
          'Review data protection measures',
          'Prepare regulatory notifications if required'
        ];
        break;

      default:
        // Generic/default case
        exposure = {
          activeIssues: { severity, value: `${count} active issue${count !== 1 ? 's' : ''}` },
          regions: { severity: regions.length >= 2 ? 'high' : 'medium', value: `${regions.length} region${regions.length !== 1 ? 's' : ''} affected` },
          departments: { severity: count >= 3 ? 'high' : 'medium', value: `${Math.min(count, 4)} departments involved` },
          estimatedImpact: { severity, value: 'Ongoing monitoring required' }
        };
        effects = [
          {
            order: 1,
            effects: [
              {
                id: '1',
                label: 'Initial Impact',
                severity: 'medium',
                description: 'Initial impact detected in affected areas.',
                affectedAreas: ['Operations', 'Compliance']
              }
            ]
          },
          {
            order: 2,
            effects: [
              {
                id: '2',
                label: 'Secondary Effects',
                severity: 'low',
                description: 'Secondary effects may emerge as situation develops.',
                affectedAreas: ['Operations', 'Finance']
              }
            ]
          }
        ];
        mitigation = [
          'Monitor situation closely',
          'Review risk assessment protocols',
          'Maintain vigilant posture'
        ];
    }

    res.status(200).json({
      success: true,
      data: {
        exposure,
        effects,
        mitigation
      }
    });
  } catch (error: any) {
    console.error('Impact category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate impact analysis'
    });
  }
}

