import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { ViewMode } from './ModeToggle';

interface ImpactMetric {
  category: 'legal' | 'supply-chain' | 'people' | 'cyber' | 'regulatory';
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  description: string;
  ceoFocus?: string;
  gcFocus?: string;
}

interface EnterpriseImpactSnapshotProps {
  mode: ViewMode;
  impacts: ImpactMetric[];
}

const SnapshotContainer = styled.div`
  background: linear-gradient(135deg, #1a0a00 0%, #0a0505 100%);
  border: 2px solid #ff6b00;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.2);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h2`
  color: #ff6b00;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Subtitle = styled.p`
  color: #aaa;
  font-size: 1rem;
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const ImpactCard = styled.div<{ $severity: string }>`
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
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px ${props => {
      switch (props.$severity) {
        case 'critical': return 'rgba(255, 0, 0, 0.3)';
        case 'high': return 'rgba(255, 107, 0, 0.3)';
        case 'medium': return 'rgba(255, 170, 0, 0.3)';
        default: return 'rgba(255, 255, 255, 0.1)';
      }
    }};
  }
`;

const ImpactHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ImpactLabel = styled.div`
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SeverityBadge = styled.div<{ $severity: string }>`
  background: ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      case 'medium': return '#ffaa00';
      default: return '#666';
    }
  }};
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const ImpactCount = styled.div`
  color: #ff6b00;
  font-size: 2rem;
  font-weight: 800;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
`;

const ImpactDescription = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-top: 8px;
`;

export const EnterpriseImpactSnapshot: React.FC<EnterpriseImpactSnapshotProps> = ({ mode, impacts }) => {
  const router = useRouter();

  const getModeSpecificDescription = (impact: ImpactMetric) => {
    if (mode === 'CEO' && impact.ceoFocus) {
      return impact.ceoFocus;
    }
    if (mode === 'GC' && impact.gcFocus) {
      return impact.gcFocus;
    }
    return impact.description;
  };

  const handleCardClick = (category: string) => {
    router.push(`/impact/${category}`);
  };

  return (
    <SnapshotContainer>
      <Header>
        <div>
          <Title>Enterprise Impact Snapshot</Title>
          <Subtitle>
            {mode === 'CEO' 
              ? 'Operational risks affecting business continuity and revenue'
              : 'Legal and regulatory exposures requiring compliance attention'
            }
          </Subtitle>
        </div>
      </Header>
      <ImpactGrid>
        {impacts.map((impact) => (
          <ImpactCard 
            key={impact.category} 
            $severity={impact.severity}
            onClick={() => handleCardClick(impact.category)}
          >
            <ImpactHeader>
              <ImpactLabel>{impact.label}</ImpactLabel>
              <SeverityBadge $severity={impact.severity}>{impact.severity}</SeverityBadge>
            </ImpactHeader>
            <ImpactCount>{impact.count}</ImpactCount>
            <ImpactDescription>
              {getModeSpecificDescription(impact)}
            </ImpactDescription>
          </ImpactCard>
        ))}
      </ImpactGrid>
    </SnapshotContainer>
  );
};

export default EnterpriseImpactSnapshot;

