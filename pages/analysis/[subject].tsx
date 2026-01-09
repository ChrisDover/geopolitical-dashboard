import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
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

const SubjectTitle = styled.h1`
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

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const BriefingPanel = styled.div`
  background: linear-gradient(135deg, #1a0a00 0%, #0a0505 100%);
  border: 2px solid #ff6b00;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.2);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const BriefingTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 20px 0;
`;

const BriefingSection = styled.div`
  margin-bottom: 25px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BriefingSectionTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const BriefingText = styled.p`
  color: #ddd;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 12px 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BriefingList = styled.ul`
  color: #ddd;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
  padding-left: 20px;
`;

const BriefingListItem = styled.li`
  margin-bottom: 8px;
`;

const BusinessExposureCard = styled.div`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 25px;
`;

const ExposureTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 20px 0;
`;

const ExposureMetric = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ExposureLabel = styled.div`
  color: #888;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const ExposureValue = styled.div<{ $severity?: string }>`
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

const ConnectivityMapContainer = styled.div`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  min-height: 400px;
  position: relative;
`;

const MapTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 20px 0;
`;

const MapPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  color: #666;
  font-size: 1rem;
  border: 2px dashed #333;
  border-radius: 8px;
`;

const CoverageSection = styled.div`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 30px;
`;

const CoverageTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 20px 0;
`;

const CoverageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CoverageItem = styled.div`
  background: #1a1a1a;
  border-left: 4px solid #ff6b00;
  border-radius: 6px;
  padding: 15px;
`;

const CoverageItemTitle = styled.h3`
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const CoverageItemMeta = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const CoverageItemText = styled.p`
  color: #ddd;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
`;

export default function AnalysisPage() {
  const router = useRouter();
  const { subject } = router.query;
  const [viewMode, setViewMode] = useState<ViewMode>('CEO');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!subject) return;

    // Fetch analysis data
    fetch(`/api/analysis/subject?subject=${encodeURIComponent(subject as string)}`)
      .then(r => r.json())
      .then(analysis => {
        if (analysis.success) {
          setAnalysisData(analysis.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load analysis:', err);
        setLoading(false);
      });
  }, [subject]);

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
            Loading analysis...
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Format subject for display
  const subjectTitle = subject ? (subject as string).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') : 'Analysis';

  // Mock briefing data (will be replaced with API data)
  const briefingData = analysisData?.briefing || {
    whatToDo: 'Monitor developments closely. Activate crisis management protocols if escalation continues beyond 72 hours.',
    operationalImpact: 'Supply chain disruptions expected in key regions. Energy costs rising 8-12%. Defense sector positioning for increased demand.',
    whatToMonitor: [
      'Military escalation indicators',
      'Oil price volatility',
      'Supply chain status updates',
      'Regulatory announcements',
      'Market sentiment shifts'
    ]
  };

  const exposureData = analysisData?.exposure || {
    legal: { severity: 'high', value: '3 active matters' },
    supplyChain: { severity: 'critical', value: '5 disruptions' },
    people: { severity: 'medium', value: '2 regions affected' },
    cyber: { severity: 'high', value: '4 threats detected' },
    regulatory: { severity: 'medium', value: '2 changes pending' }
  };

  const coverageData = analysisData?.coverage || [
    {
      title: 'Breaking: Escalation in Middle East',
      source: 'Reuters',
      timestamp: '2 hours ago',
      text: 'Military escalation between Iran and Israel intensifies with direct strikes reported.'
    },
    {
      title: 'Oil Prices Surge on Conflict News',
      source: 'Bloomberg',
      timestamp: '4 hours ago',
      text: 'Crude oil prices jumped 8% overnight as tensions escalate in the Middle East.'
    },
    {
      title: 'Defense Sector Positioning',
      source: 'Financial Times',
      timestamp: '6 hours ago',
      text: 'Defense contractors see increased demand as geopolitical tensions rise.'
    }
  ];

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
          <SubjectTitle>{subjectTitle}</SubjectTitle>
        </Header>

        <ModeToggleContainer>
          <ModeToggle mode={viewMode} onChange={setViewMode} />
        </ModeToggleContainer>

        <GridLayout>
          <BriefingPanel>
            <BriefingTitle>Strategic Briefing</BriefingTitle>
            
            <BriefingSection>
              <BriefingSectionTitle>What to Do</BriefingSectionTitle>
              <BriefingText>{briefingData.whatToDo}</BriefingText>
            </BriefingSection>

            <BriefingSection>
              <BriefingSectionTitle>
                {viewMode === 'CEO' ? 'Operational Impact' : 'Legal & Regulatory Impact'}
              </BriefingSectionTitle>
              <BriefingText>
                {viewMode === 'CEO' 
                  ? briefingData.operationalImpact
                  : 'Legal exposure increasing. Regulatory compliance review required. Contractual obligations under review. Potential liability implications.'
                }
              </BriefingText>
            </BriefingSection>

            <BriefingSection>
              <BriefingSectionTitle>What to Monitor</BriefingSectionTitle>
              <BriefingList>
                {briefingData.whatToMonitor.map((item: string, idx: number) => (
                  <BriefingListItem key={idx}>{item}</BriefingListItem>
                ))}
              </BriefingList>
            </BriefingSection>
          </BriefingPanel>

          <BusinessExposureCard>
            <ExposureTitle>Business Exposure Summary</ExposureTitle>
            <ExposureMetric>
              <ExposureLabel>Legal</ExposureLabel>
              <ExposureValue $severity={exposureData.legal.severity}>
                {exposureData.legal.value}
              </ExposureValue>
            </ExposureMetric>
            <ExposureMetric>
              <ExposureLabel>Supply Chain</ExposureLabel>
              <ExposureValue $severity={exposureData.supplyChain.severity}>
                {exposureData.supplyChain.value}
              </ExposureValue>
            </ExposureMetric>
            <ExposureMetric>
              <ExposureLabel>People & Operations</ExposureLabel>
              <ExposureValue $severity={exposureData.people.severity}>
                {exposureData.people.value}
              </ExposureValue>
            </ExposureMetric>
            <ExposureMetric>
              <ExposureLabel>Cyber Security</ExposureLabel>
              <ExposureValue $severity={exposureData.cyber.severity}>
                {exposureData.cyber.value}
              </ExposureValue>
            </ExposureMetric>
            <ExposureMetric>
              <ExposureLabel>Regulatory</ExposureLabel>
              <ExposureValue $severity={exposureData.regulatory.severity}>
                {exposureData.regulatory.value}
              </ExposureValue>
            </ExposureMetric>
          </BusinessExposureCard>
        </GridLayout>

        <ConnectivityMapContainer>
          <MapTitle>Connectivity Map</MapTitle>
          <MapPlaceholder>
            Connectivity map visualization with intensity-weighted nodes will be rendered here
          </MapPlaceholder>
        </ConnectivityMapContainer>

        <CoverageSection>
          <CoverageTitle>Latest Intelligence Coverage</CoverageTitle>
          <CoverageList>
            {coverageData.map((item: any, idx: number) => (
              <CoverageItem key={idx}>
                <CoverageItemTitle>{item.title}</CoverageItemTitle>
                <CoverageItemMeta>{item.source} • {item.timestamp}</CoverageItemMeta>
                <CoverageItemText>{item.text}</CoverageItemText>
              </CoverageItem>
            ))}
          </CoverageList>
        </CoverageSection>
      </ContentContainer>
    </PageContainer>
  );
}

