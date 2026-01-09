import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { parse, isValid, differenceInCalendarDays } from 'date-fns';
import Navigation from '../../components/Navigation';
import ModeToggle, { ViewMode } from '../../components/ModeToggle';
import NotificationBar from '../../components/NotificationBar';

interface Notification {
  id: number;
  time: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  title: string;
  message: string;
  acknowledged: boolean;
}

interface ImpactNode {
  id: string;
  label: string;
  order: number; // 1st, 2nd, 3rd, 4th order
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedAreas: string[];
  mitigationActions?: string[];
}

const PageContainer = styled.div`
  min-height: 100vh;
  background: #000;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const CategoryTitle = styled.h1`
  color: #ff6b00;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ModeToggleContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
`;

const ExposureSection = styled.div`
  background: linear-gradient(135deg, #1a0a00 0%, #0a0505 100%);
  border: 2px solid #ff6b00;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.2);
`;

const SectionTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 20px 0;
`;

const ExposureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
`;

const ExposureCard = styled.div<{ $severity: string }>`
  background: #0a0a0a;
  border: 2px solid ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      case 'medium': return '#ffaa00';
      default: return '#333';
    }
  }};
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-color: #ff6b00;
  }
`;

const ExposureLabel = styled.div`
  color: #888;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const ExposureValue = styled.div<{ $severity: string }>`
  color: ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      case 'medium': return '#ffaa00';
      default: return '#fff';
    }
  }};
  font-size: 1.5rem;
  font-weight: 700;
`;

const CascadingEffectsSection = styled.div`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
`;

const SectionSubTitle = styled.div`
  color: #999;
  font-size: 0.95rem;
  margin: -8px 0 24px 0;
`;

const EffectsSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const SummaryCard = styled.div`
  background: #131313;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  padding: 18px 18px 16px 18px;
`;

const SummaryLabel = styled.div`
  color: #aaa;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
`;

const SummaryValue = styled.div`
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const SummaryMeta = styled.div`
  color: #c7c7c7;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const HeatmapList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeatRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px;
  gap: 12px;
  align-items: center;
`;

const HeatLabel = styled.div`
  color: #ddd;
  font-size: 0.95rem;
  font-weight: 600;
`;

const HeatBar = styled.div<{ $severity: string; $width: number }>`
  height: 6px;
  border-radius: 999px;
  background: ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      case 'medium': return '#ffaa00';
      default: return '#666';
    }
  }};
  width: ${props => props.$width}%;
`;

const SignalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SignalItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SignalTitle = styled.div`
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
`;

const SignalMeta = styled.div`
  color: #9a9a9a;
  font-size: 0.85rem;
`;

const EffectsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const OrderLevel = styled.div`
  position: relative;
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #333;
`;

const OrderNumber = styled.div<{ $order: number }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$order) {
      case 1: return '#ff0000';
      case 2: return '#ff6b00';
      case 3: return '#ffaa00';
      default: return '#666';
    }
  }};
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const OrderTitle = styled.h3`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EffectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-left: 65px;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const EffectCard = styled.div<{ $severity: string }>`
  background: #1a1a1a;
  border-left: 4px solid ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      case 'medium': return '#ffaa00';
      default: return '#666';
    }
  }};
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;

  &:hover {
    background: #222;
    transform: translateX(4px);
  }
`;

const EffectTitle = styled.h4`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const EffectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const EffectBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
`;

const EffectBadge = styled.span`
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #1f1f1f;
  border: 1px solid #333;
  color: #ddd;
`;

const EffectBadgeTone = styled(EffectBadge)`
  background: #1b1410;
  border-color: #3a2b1a;
  color: #ffb36a;
`;

const EffectDescription = styled.p`
  color: #ddd;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

const AffectedAreas = styled.div`
  margin-top: 12px;
`;

const AffectedLabel = styled.div`
  color: #888;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const AffectedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const AffectedTag = styled.span<{ $severity: string }>`
  background: ${props => {
    switch (props.$severity) {
      case 'critical': return 'rgba(255, 0, 0, 0.2)';
      case 'high': return 'rgba(255, 107, 0, 0.2)';
      case 'medium': return 'rgba(255, 170, 0, 0.2)';
      default: return 'rgba(102, 102, 102, 0.2)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      case 'medium': return '#ffaa00';
      default: return '#666';
    }
  }};
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const MitigationSection = styled.div`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 30px;
`;

const MitigationList = styled.ul`
  color: #ddd;
  font-size: 1rem;
  line-height: 1.8;
  margin: 0;
  padding-left: 20px;
`;

const MitigationItem = styled.li`
  margin-bottom: 12px;
`;

const DetailOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => (props.$open ? 'block' : 'none')};
  z-index: 50;
`;

const DetailPanel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(520px, 100%);
  background: #0c0c0c;
  border-left: 2px solid #222;
  transform: ${props => (props.$open ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.25s ease;
  z-index: 60;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #222;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const DetailTitle = styled.div`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
`;

const DetailClose = styled.button`
  background: transparent;
  border: 1px solid #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
`;

const DetailBody = styled.div`
  padding: 20px 24px 32px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const DetailSection = styled.div`
  border: 1px solid #222;
  border-radius: 10px;
  padding: 16px;
  background: #121212;
`;

const DetailLabel = styled.div`
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const DetailHeadline = styled.div`
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 6px;
`;

const DetailMeta = styled.div`
  color: #c8c8c8;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const FlowMap = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding-top: 22px;
`;

const FlowColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 7px;
    bottom: 6px;
    width: 2px;
    background: #222;
  }
`;

const FlowColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

const FlowDot = styled.div<{ $order: number }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$order) {
      case 1: return '#ff0000';
      case 2: return '#ff6b00';
      case 3: return '#ffaa00';
      default: return '#666';
    }
  }};
  box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
`;

const FlowNode = styled.button<{ $active: boolean }>`
  text-align: left;
  background: ${props => (props.$active ? '#1b1410' : '#0f0f0f')};
  border: 1px solid ${props => (props.$active ? '#ff6b00' : '#2a2a2a')};
  color: #fff;
  border-radius: 10px;
  padding: 10px 12px 10px 18px;
  cursor: pointer;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 50%;
    width: 12px;
    height: 1px;
    background: #2a2a2a;
  }
`;

const FlowNodeTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const FlowNodeMeta = styled.div`
  color: #bdbdbd;
  font-size: 0.8rem;
`;

const UpcomingTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #ffb36a;
  border: 1px solid #3a2b1a;
  background: rgba(255, 179, 106, 0.08);
`;

export default function ImpactCategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const [viewMode, setViewMode] = useState<ViewMode>('CEO');
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedExposure, setSelectedExposure] = useState<string | null>(null);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;

    fetch(`/api/impact/category?category=${encodeURIComponent(category as string)}&mode=${viewMode}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setImpactData(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load impact data:', err);
        setLoading(false);
      });
  }, [category, viewMode]);

  const acknowledgeNotification = (id: number) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, acknowledged: true } : n
    ));
  };

  if (loading) {
    return (
      <PageContainer>
        <Navigation viewMode={viewMode} onViewModeChange={setViewMode} />
        <ContentContainer>
          <div style={{ color: '#fff', textAlign: 'center', padding: '60px 20px' }}>
            Loading impact analysis...
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Format category for display
  const categoryTitle = category ? (category as string).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') : 'Impact Analysis';

  // Mock data structure (will be replaced with API data)
  const exposureData = impactData?.exposure || {
    activeCases: { severity: 'high', value: '3 active matters' },
    regions: { severity: 'critical', value: '5 regions affected' },
    departments: { severity: 'high', value: '4 departments involved' },
    estimatedImpact: { severity: 'high', value: '$2.5M potential' }
  };

  const activeEvents = impactData?.activeEvents || {
    activeCases: {
      title: 'Export license challenge for Tier-1 supplier',
      scope: 'Asia-Pacific manufacturing lanes',
      timeframe: 'Active now • next 30 days',
      summary: 'Regulatory review threatens shipment clearance for high-margin SKUs.'
    },
    regions: {
      title: 'Border delays at two key crossings',
      scope: 'Eastern Europe logistics corridor',
      timeframe: 'Disruptions since 72 hours',
      summary: 'Customs inspections increased, slowing inbound components and outbound deliveries.'
    },
    departments: {
      title: 'Compliance surge impacting Legal & Ops',
      scope: 'Corporate compliance and procurement',
      timeframe: 'Immediate staffing impact',
      summary: 'Manual review backlog growing as new filings and attestations pile up.'
    },
    estimatedImpact: {
      title: 'Revenue at risk from delayed fulfillment',
      scope: 'Q3 enterprise accounts',
      timeframe: 'Likely in 4-6 weeks',
      summary: 'Delivery slippage could trigger penalties and deferred revenue recognition.'
    }
  };

  const cascadingEffects = impactData?.effects || [
    {
      order: 1,
      effects: [
        {
          id: '1',
          label: 'Supply Chain Disruption',
          severity: 'critical',
          confidence: 'high',
          significantDates: ['Export license decision: Oct 12'],
          description: 'Immediate disruption to critical supply chains in affected regions. Key suppliers unable to deliver components.',
          affectedAreas: ['Manufacturing', 'Operations', 'Logistics']
        },
        {
          id: '2',
          label: 'Regulatory Compliance Review',
          severity: 'high',
          confidence: 'medium',
          significantDates: ['EU guidance update: Oct 25'],
          description: 'New regulatory requirements trigger mandatory compliance review across affected business units.',
          affectedAreas: ['Legal', 'Compliance', 'Operations']
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
          confidence: 'medium',
          description: 'Manufacturing delays cascade to production schedules, impacting delivery commitments.',
          affectedAreas: ['Production', 'Sales', 'Customer Relations']
        },
        {
          id: '4',
          label: 'Contract Renegotiations',
          severity: 'medium',
          confidence: 'low',
          significantDates: ['Top 5 contract renewals: Nov 7'],
          description: 'Existing contracts may require renegotiation due to force majeure or regulatory changes.',
          affectedAreas: ['Legal', 'Sales', 'Finance']
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
          confidence: 'medium',
          significantDates: ['Quarter close: Dec 31'],
          description: 'Delayed deliveries and contract issues directly impact quarterly revenue projections.',
          affectedAreas: ['Finance', 'Sales', 'Executive']
        },
        {
          id: '6',
          label: 'Customer Relationship Strain',
          severity: 'medium',
          confidence: 'medium',
          description: 'Delayed commitments strain customer relationships, potentially affecting future contracts.',
          affectedAreas: ['Sales', 'Customer Success', 'Executive']
        }
      ]
    },
    {
      order: 4,
      effects: [
        {
          id: '7',
          label: 'Market Position Erosion',
          severity: 'medium',
          confidence: 'low',
          description: 'Competitors may gain market share while we address supply chain and compliance issues.',
          affectedAreas: ['Strategy', 'Sales', 'Executive']
        },
        {
          id: '8',
          label: 'Reputational Risk',
          severity: 'low',
          confidence: 'medium',
          description: 'Extended disruptions may impact brand reputation and investor confidence.',
          affectedAreas: ['Marketing', 'Investor Relations', 'Executive']
        }
      ]
    }
  ];

  const severityRank: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const flattenedEffects = cascadingEffects.flatMap((level: any) => level.effects || []);
  const highestSeverity = flattenedEffects.reduce((current: string, effect: any) => {
    if (!current) return effect.severity;
    return severityRank[effect.severity] > severityRank[current] ? effect.severity : current;
  }, '');

  const affectedAreaStats = flattenedEffects.reduce((acc: Record<string, { count: number; severity: string }>, effect: any) => {
    (effect.affectedAreas || []).forEach((area: string) => {
      if (!acc[area]) {
        acc[area] = { count: 0, severity: effect.severity };
      }
      acc[area].count += 1;
      if (severityRank[effect.severity] > severityRank[acc[area].severity]) {
        acc[area].severity = effect.severity;
      }
    });
    return acc;
  }, {});

  const topAreas = Object.entries(affectedAreaStats)
    .map(([area, data]) => ({ area, ...data }))
    .sort((a, b) => {
      const severityDiff = severityRank[b.severity] - severityRank[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.count - a.count;
    })
    .slice(0, 6);

  const maxAreaCount = topAreas.reduce((max, area) => Math.max(max, area.count), 1);

  const primaryEffects = cascadingEffects
    .find((level: any) => level.order === 1)?.effects
    ?.slice(0, 3)
    .map((effect: any) => effect.label)
    .join(', ') || 'No immediate effects identified';

  const contextSignals = impactData?.contextSignals || [
    { title: 'Shipping lane reroutes', meta: 'MEA + East Asia • direct impact' },
    { title: 'Regulatory scrutiny rising', meta: 'EU + US • 30-60 days' },
    { title: 'Commodity price volatility', meta: 'Global • downstream pressure' }
  ];

  const mitigationActions = impactData?.mitigation || [
    'Activate crisis management protocols',
    'Establish alternative supplier relationships',
    'Engage legal counsel for compliance review',
    'Communicate proactively with affected customers',
    'Monitor situation daily and adjust strategy as needed'
  ];

  const allEffects = cascadingEffects.flatMap((level: any) => level.effects || []);
  const selectedEffect = allEffects.find((effect: any) => effect.id === selectedEffectId) || allEffects[0];
  const selectedEvent = selectedExposure ? activeEvents[selectedExposure] : null;

  const parseSignificantDate = (entry: string) => {
    if (!entry) return null;
    const text = entry.includes(':') ? entry.split(':').slice(1).join(':').trim() : entry.trim();
    const parsed = new Date(text);
    if (isValid(parsed)) return parsed;
    const assumedYear = new Date().getFullYear();
    const fallback = parse(text, 'MMM d', new Date(assumedYear, 0, 1));
    return isValid(fallback) ? fallback : null;
  };

  const isUpcoming = (entry: string) => {
    const date = parseSignificantDate(entry);
    if (!date) return false;
    const diff = differenceInCalendarDays(date, new Date());
    return diff >= 0 && diff <= 14;
  };

  return (
    <PageContainer>
      <Navigation 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <NotificationBar
        notifications={notifications}
        onAcknowledge={acknowledgeNotification}
      />

      <ContentContainer>
        <Header>
          <CategoryTitle>{categoryTitle} Exposure</CategoryTitle>
        </Header>

        <ModeToggleContainer>
          <ModeToggle mode={viewMode} onChange={setViewMode} />
        </ModeToggleContainer>

        <ExposureSection>
          <SectionTitle>Current Exposure</SectionTitle>
          <ExposureGrid>
            {Object.entries(exposureData).map(([key, value]: [string, any]) => (
              <ExposureCard
                key={key}
                $severity={value.severity}
                onClick={() => {
                  setSelectedExposure(key);
                  setSelectedEffectId(null);
                }}
              >
                <ExposureLabel>{key.split(/(?=[A-Z])/).join(' ')}</ExposureLabel>
                <ExposureValue $severity={value.severity}>{value.value}</ExposureValue>
              </ExposureCard>
            ))}
          </ExposureGrid>
        </ExposureSection>

        <CascadingEffectsSection>
          <SectionTitle>Cascading Effects Analysis</SectionTitle>
          <SectionSubTitle>How the risk propagates across the business and where it hits next.</SectionSubTitle>
          <EffectsSummaryGrid>
            <SummaryCard>
              <SummaryLabel>Propagation Snapshot</SummaryLabel>
              <SummaryValue>{flattenedEffects.length} total effects</SummaryValue>
              <SummaryMeta>
                Highest severity: {highestSeverity || 'unknown'}. Immediate focus: {primaryEffects}.
              </SummaryMeta>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Most Exposed Functions</SummaryLabel>
              <HeatmapList>
                {topAreas.map(area => (
                  <HeatRow key={area.area}>
                    <HeatLabel>{area.area}</HeatLabel>
                    <HeatBar $severity={area.severity} $width={(area.count / maxAreaCount) * 100} />
                  </HeatRow>
                ))}
              </HeatmapList>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Global Context Signals</SummaryLabel>
              <SignalList>
                {contextSignals.slice(0, 4).map((signal: any, idx: number) => (
                  <SignalItem key={`${signal.title}-${idx}`}>
                    <SignalTitle>{signal.title}</SignalTitle>
                    <SignalMeta>{signal.meta}</SignalMeta>
                  </SignalItem>
                ))}
              </SignalList>
            </SummaryCard>
          </EffectsSummaryGrid>
          <EffectsContainer>
            {cascadingEffects.map((level: any) => (
              <OrderLevel key={level.order}>
                <OrderHeader>
                  <OrderNumber $order={level.order}>{level.order}</OrderNumber>
                  <OrderTitle>
                    {level.order === 1 ? '1st Order Effects' :
                     level.order === 2 ? '2nd Order Effects' :
                     level.order === 3 ? '3rd Order Effects' :
                     '4th Order Effects'}
                  </OrderTitle>
                </OrderHeader>
                <EffectsGrid>
                  {level.effects.map((effect: any) => (
                    <EffectCard key={effect.id} $severity={effect.severity}>
                      <EffectHeader>
                        <EffectTitle>{effect.label}</EffectTitle>
                        <EffectBadges>
                          {effect.timeToImpact && (
                            <EffectBadgeTone>{effect.timeToImpact}</EffectBadgeTone>
                          )}
                          {effect.confidence && (
                            <EffectBadge>Confidence: {effect.confidence}</EffectBadge>
                          )}
                        </EffectBadges>
                      </EffectHeader>
                      <EffectDescription>{effect.description}</EffectDescription>
                      <AffectedAreas>
                        <AffectedLabel>Affected Areas</AffectedLabel>
                        <AffectedList>
                          {effect.affectedAreas.map((area: string) => (
                            <AffectedTag key={area} $severity={effect.severity}>
                              {area}
                            </AffectedTag>
                          ))}
                        </AffectedList>
                      </AffectedAreas>
                    </EffectCard>
                  ))}
                </EffectsGrid>
              </OrderLevel>
            ))}
          </EffectsContainer>
        </CascadingEffectsSection>

        <MitigationSection>
          <SectionTitle>Recommended Mitigation Actions</SectionTitle>
          <MitigationList>
            {mitigationActions.map((action: string, idx: number) => (
              <MitigationItem key={idx}>{action}</MitigationItem>
            ))}
          </MitigationList>
        </MitigationSection>
      </ContentContainer>

      <DetailOverlay $open={!!selectedExposure} onClick={() => setSelectedExposure(null)} />
      <DetailPanel $open={!!selectedExposure}>
        <DetailHeader>
          <DetailTitle>Active Exposure Detail</DetailTitle>
          <DetailClose onClick={() => setSelectedExposure(null)}>Close</DetailClose>
        </DetailHeader>
        {selectedExposure && (
          <DetailBody>
            <DetailSection>
              <DetailLabel>Active Event</DetailLabel>
              <DetailHeadline>{selectedEvent?.title || 'No active event available'}</DetailHeadline>
              <DetailMeta>{selectedEvent?.summary}</DetailMeta>
              <DetailMeta>{selectedEvent?.scope} • {selectedEvent?.timeframe}</DetailMeta>
            </DetailSection>
            <DetailSection>
              <DetailLabel>Visual Cascade</DetailLabel>
              <FlowMap>
                {cascadingEffects.map((level: any) => (
                  <FlowColumn key={level.order}>
                    <FlowColumnHeader>
                      <FlowDot $order={level.order} />
                      {level.order === 1 ? '1st Order' :
                       level.order === 2 ? '2nd Order' :
                       level.order === 3 ? '3rd Order' :
                       '4th Order'}
                    </FlowColumnHeader>
                    {level.effects.map((effect: any) => (
                      <FlowNode
                        key={effect.id}
                        $active={selectedEffect?.id === effect.id}
                        onClick={() => setSelectedEffectId(effect.id)}
                      >
                        <FlowNodeTitle>{effect.label}</FlowNodeTitle>
                        <FlowNodeMeta>
                          {effect.severity}
                          {effect.significantDates?.length ? ` • ${effect.significantDates[0]}` : ''}
                        </FlowNodeMeta>
                        {effect.significantDates?.some((date: string) => isUpcoming(date)) && (
                          <UpcomingTag>Upcoming date</UpcomingTag>
                        )}
                      </FlowNode>
                    ))}
                  </FlowColumn>
                ))}
              </FlowMap>
            </DetailSection>
            <DetailSection>
              <DetailLabel>Selected Impact</DetailLabel>
              <DetailHeadline>{selectedEffect?.label}</DetailHeadline>
              <DetailMeta>{selectedEffect?.description}</DetailMeta>
              <DetailMeta>
                Confidence: {selectedEffect?.confidence || 'unknown'}
                {selectedEffect?.significantDates?.length ? ` • ${selectedEffect.significantDates.join(', ')}` : ''}
              </DetailMeta>
              {selectedEffect?.significantDates?.some((date: string) => isUpcoming(date)) && (
                <UpcomingTag>Upcoming date in next 14 days</UpcomingTag>
              )}
            </DetailSection>
          </DetailBody>
        )}
      </DetailPanel>
    </PageContainer>
  );
}
