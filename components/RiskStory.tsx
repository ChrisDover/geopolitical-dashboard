import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

interface RiskShift {
  id: string;
  timeframe: '24h' | '72h';
  title: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  impact: string;
  linkTo?: string;
}

interface RiskStoryProps {
  shifts: RiskShift[];
}

const StoryContainer = styled.div`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;

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

const ShiftsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EmptyState = styled.div`
  border: 1px dashed #333;
  border-radius: 8px;
  padding: 20px;
  color: #aaa;
  font-size: 1rem;
  line-height: 1.6;
  background: #111;
`;

const ShiftCard = styled.div<{ $severity: string }>`
  background: #1a1a1a;
  border-left: 4px solid ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      default: return '#ffaa00';
    }
  }};
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  &:hover {
    background: #222;
    transform: translateX(4px);
  }
`;

const ShiftHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
`;

const ShiftTitle = styled.h3`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
`;

const TimeframeBadge = styled.div`
  background: #333;
  color: #ff6b00;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
`;

const SeverityBadge = styled.div<{ $severity: string }>`
  background: ${props => {
    switch (props.$severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b00';
      default: return '#ffaa00';
    }
  }};
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
`;

const ShiftDescription = styled.p`
  color: #ddd;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 10px 0;
`;

const ImpactText = styled.div`
  color: #ff6b00;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 8px;
`;

const ViewLink = styled.a`
  color: #ff6b00;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  margin-top: 12px;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    text-decoration: underline;
  }
`;

export const RiskStory: React.FC<RiskStoryProps> = ({ shifts }) => {
  // Sort by severity and timeframe
  const sortedShifts = [...shifts].sort((a, b) => {
    const severityOrder = { critical: 3, high: 2, medium: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return a.timeframe === '24h' ? -1 : 1;
  });

  return (
    <StoryContainer>
      <Header>
        <Title>24-72h Risk Story</Title>
      </Header>
      <ShiftsList>
        {sortedShifts.length === 0 ? (
          <EmptyState>
            No critical or high-priority shifts detected in the last 72 hours.
            Monitoring continues.
          </EmptyState>
        ) : (
          sortedShifts.slice(0, 3).map((shift) => (
            <ShiftCard key={shift.id} $severity={shift.severity}>
              <ShiftHeader>
                <ShiftTitle>{shift.title}</ShiftTitle>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <TimeframeBadge>{shift.timeframe}</TimeframeBadge>
                  <SeverityBadge $severity={shift.severity}>{shift.severity}</SeverityBadge>
                </div>
              </ShiftHeader>
              <ShiftDescription>{shift.description}</ShiftDescription>
              <ImpactText>Impact: {shift.impact}</ImpactText>
              {shift.linkTo && (
                <Link href={shift.linkTo} passHref legacyBehavior>
                  <ViewLink>View Analysis →</ViewLink>
                </Link>
              )}
            </ShiftCard>
          ))
        )}
      </ShiftsList>
    </StoryContainer>
  );
};

export default RiskStory;
