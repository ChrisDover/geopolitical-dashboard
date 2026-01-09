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
  timestamp?: string;
}

interface RiskStoryProps {
  shifts: RiskShift[];
}

const StoryContainer = styled.div`
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    padding: 16px;
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
  gap: 6px;
`;

const EmptyState = styled.div`
  border: 1px dashed #333;
  border-radius: 8px;
  padding: 14px;
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.4;
  background: #111;
`;

const TickerRow = styled.a<{ $severity: string }>`
  text-decoration: none;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 6px 2px;
  border-bottom: 1px solid #1a1a1a;
  color: ${props => props.$severity === 'critical' ? '#ff3b30' : '#ddd'};
  font-size: 0.88rem;

  &:hover {
    color: #fff;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

const TickerHeadline = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TickerMeta = styled.div`
  color: #777;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const SeverityBadge = styled.div<{ $severity: string }>`
  color: ${props => props.$severity === 'critical' ? '#ff3b30' : props.$severity === 'high' ? '#ff6b00' : '#ffaa00'};
  font-size: 0.72rem;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const RiskStory: React.FC<RiskStoryProps> = ({ shifts }) => {
  const timeAgo = (timestamp?: string, fallback?: string) => {
    if (!timestamp) {
      return fallback ? `within ${fallback}` : 'recent';
    }
    const deltaMs = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.max(1, Math.floor(deltaMs / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const sortedShifts = [...shifts].sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    if (aTime !== bTime) {
      return bTime - aTime;
    }
    const severityOrder = { critical: 3, high: 2, medium: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
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
          sortedShifts.slice(0, 10).map((shift) => (
            <Link key={shift.id} href={shift.linkTo || '#'} passHref legacyBehavior>
              <TickerRow $severity={shift.severity}>
                <TickerHeadline title={shift.title}>
                  {shift.title}
                </TickerHeadline>
                <TickerMeta>{timeAgo(shift.timestamp, shift.timeframe)}</TickerMeta>
                <SeverityBadge $severity={shift.severity}>{shift.severity}</SeverityBadge>
              </TickerRow>
            </Link>
          ))
        )}
      </ShiftsList>
    </StoryContainer>
  );
};

export default RiskStory;
