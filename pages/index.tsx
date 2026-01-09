import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navigation from '../components/Navigation';
import EnterpriseImpactSnapshot from '../components/EnterpriseImpactSnapshot';
import RiskStory from '../components/RiskStory';
import { ViewMode } from '../components/ModeToggle';

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

const ExecutiveBriefSection = styled.section`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.08);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const BriefHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const BriefTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0;
`;

const BriefSubtitle = styled.p`
  color: #aaa;
  margin: 6px 0 0 0;
  font-size: 0.95rem;
`;

const BriefGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const BriefTile = styled.div`
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  padding: 16px;
`;

const BriefLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const BriefValue = styled.div`
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 8px;
`;

const BriefBody = styled.p`
  color: #ddd;
  font-size: 1rem;
  line-height: 1.6;
  margin: 16px 0 0 0;
`;


const EmptyState = styled.div`
  border: 1px dashed #333;
  border-radius: 8px;
  padding: 16px;
  color: #aaa;
  font-size: 0.95rem;
  line-height: 1.5;
  background: #111;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div<{ $color: string }>`
  background: #0a0a0a;
  border: 2px solid ${props => props.$color};
  border-radius: 12px;
  padding: 30px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$color};
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px ${props => props.$color}33;
    border-color: ${props => props.$color};
  }
`;

const ProductIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const ProductTitle = styled.h2<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProductDescription = styled.p`
  color: #aaa;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 25px 0;
`;

const ProductStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
`;

const StatLabel = styled.span`
  color: #888;
  font-size: 1.125rem; /* 18px - increased from 0.9rem (14.4px) */
  font-weight: 600;
`;

const StatValue = styled.span<{ $positive?: boolean; $highlight?: boolean }>`
  color: ${props =>
    props.$highlight ? '#ff6b00' :
    props.$positive === undefined ? '#fff' :
    props.$positive ? '#00c853' : '#ff0000'
  };
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
`;


export default function OverviewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('CEO');

  const [enterpriseImpacts, setEnterpriseImpacts] = useState<any[]>([]);
  const [riskShifts, setRiskShifts] = useState<any[]>([]);
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const fallbackImpacts = [
    {
      category: 'legal',
      label: 'Legal Exposure',
      severity: 'low',
      count: 0,
      description: '0 active legal matters requiring executive attention.',
      ceoFocus: '0 active legal matters requiring executive attention.',
      gcFocus: '0 regulatory investigations or compliance reviews.'
    },
    {
      category: 'supply-chain',
      label: 'Supply Chain',
      severity: 'low',
      count: 0,
      description: '0 critical supply chain disruptions detected.',
      ceoFocus: '0 critical supply chain disruptions detected.',
      gcFocus: '0 supply chain disruptions with regulatory implications.'
    },
    {
      category: 'people',
      label: 'People & Operations',
      severity: 'low',
      count: 0,
      description: '0 operational risks affecting workforce in key regions.',
      ceoFocus: '0 operational risks affecting workforce in key regions.',
      gcFocus: '0 workforce risks requiring employment law review.'
    },
    {
      category: 'cyber',
      label: 'Cyber Security',
      severity: 'low',
      count: 0,
      description: '0 active cyber threats targeting infrastructure.',
      ceoFocus: '0 active cyber threats targeting infrastructure.',
      gcFocus: '0 cybersecurity incidents requiring notification.'
    },
    {
      category: 'regulatory',
      label: 'Regulatory',
      severity: 'low',
      count: 0,
      description: '0 regulatory changes affecting operations.',
      ceoFocus: '0 regulatory changes affecting operations.',
      gcFocus: '0 regulatory changes requiring legal review.'
    }
  ];

  useEffect(() => {
    // Fetch notifications and analysis data
    Promise.all([
      fetch('/api/news/feed?limit=30').then(r => r.json()),
      fetch('/api/analysis/overview').then(r => r.json()).catch(() => ({ success: false, data: null }))
    ])
      .then(([news, analysis]) => {
        const feedItems = news.data || [];
        setNewsFeed(feedItems);

        // Fetch enterprise impact and risk story data
        if (analysis.success && analysis.data) {
          setEnterpriseImpacts(analysis.data.impacts || []);
          setRiskShifts(analysis.data.riskShifts || []);
        }
      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);

  // Use API data, fallback to empty arrays if not loaded yet
  const displayImpacts = enterpriseImpacts.length > 0 ? enterpriseImpacts : fallbackImpacts;
  const displayRiskShifts = riskShifts.length > 0 ? riskShifts : [];
  const totalEvents = newsFeed.length;
  const topRegions = [...new Set(newsFeed.map((n: any) => n.region).filter(Boolean))].slice(0, 3);
  const briefFocus = viewMode === 'CEO'
    ? 'Business continuity, exposure concentration, and operational readiness.'
    : 'Regulatory exposure, compliance posture, and legal response readiness.';

  return (
    <PageContainer>
      <Navigation 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ContentContainer>
        <ExecutiveBriefSection>
          <BriefHeader>
            <div>
              <BriefTitle>Executive Brief</BriefTitle>
              <BriefSubtitle>Daily posture summary for leadership action.</BriefSubtitle>
            </div>
          </BriefHeader>
          <BriefGrid>
            <BriefTile>
              <BriefLabel>Strategic Posture</BriefLabel>
              <BriefValue>Maintain readiness across priority theaters.</BriefValue>
            </BriefTile>
            <BriefTile>
              <BriefLabel>Operational Focus</BriefLabel>
              <BriefValue>{briefFocus}</BriefValue>
            </BriefTile>
            <BriefTile>
              <BriefLabel>Monitoring Load</BriefLabel>
              <BriefValue>{totalEvents} tracked signals in the last 72h.</BriefValue>
            </BriefTile>
            <BriefTile>
              <BriefLabel>Regions in Focus</BriefLabel>
              <BriefValue>{topRegions.length > 0 ? topRegions.join(', ') : 'No dominant cluster'}</BriefValue>
            </BriefTile>
          </BriefGrid>
          <BriefBody>
            Leadership attention should remain on {topRegions.length > 0 ? topRegions.join(', ') : 'global monitoring'}, with emphasis on {briefFocus.toLowerCase()}
          </BriefBody>
        </ExecutiveBriefSection>

        {/* Enterprise Impact Snapshot - NEW */}
        <EnterpriseImpactSnapshot mode={viewMode} impacts={displayImpacts} />

        {/* 24-72h Risk Story - NEW */}
        <RiskStory shifts={displayRiskShifts} />
      </ContentContainer>
    </PageContainer>
  );
}
