import React from 'react';
import styled from 'styled-components';
import Tooltip from './Tooltip';

interface PortfolioHeroProps {
  totalValue: number;
  returnPercent: number;
  returnDollar: number;
  status: 'good' | 'caution' | 'danger';
  summary: string;
}

const HeroCard = styled.div<{ $status: string }>`
  background: ${props =>
    props.$status === 'good' ? 'linear-gradient(135deg, #00c853 0%, #00e676 100%)' :
    props.$status === 'caution' ? 'linear-gradient(135deg, #ffa000 0%, #ffb333 100%)' :
    'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)'
  };
  border: 3px solid ${props =>
    props.$status === 'good' ? '#00c853' :
    props.$status === 'caution' ? '#ffa000' :
    '#d32f2f'
  };
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 8px;
  }
`;

const StatusIndicator = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1.5px;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const TrafficLight = styled.div<{ $status: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props =>
    props.$status === 'good' ? '#fff' :
    props.$status === 'caution' ? '#fff' :
    '#fff'
  };
  box-shadow: 0 0 20px ${props =>
    props.$status === 'good' ? 'rgba(255, 255, 255, 0.8)' :
    props.$status === 'caution' ? 'rgba(255, 255, 255, 0.8)' :
    'rgba(255, 255, 255, 0.8)'
  };
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
`;

const MainValue = styled.div`
  font-size: 4.5rem;
  font-weight: 800;
  color: #000;
  line-height: 1;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const ReturnInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const ReturnPercent = styled.div<{ $positive: boolean }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ReturnDollar = styled.div<{ $positive: boolean }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Summary = styled.div`
  font-size: 1.3rem;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.9);
  font-weight: 500;
  max-width: 800px;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const PortfolioHero: React.FC<PortfolioHeroProps> = ({
  totalValue,
  returnPercent,
  returnDollar,
  status,
  summary
}) => {
  const isPositive = returnPercent >= 0;
  const statusText = status === 'good' ? '✓ All Good' : status === 'caution' ? '⚠ Needs Attention' : '✕ Action Required';

  return (
    <HeroCard $status={status}>
      <StatusIndicator $status={status}>
        <TrafficLight $status={status} />
        {statusText}
      </StatusIndicator>

      <MainValue>
        ${totalValue.toLocaleString()}
      </MainValue>

      <ReturnInfo>
        <ReturnPercent $positive={isPositive}>
          {isPositive ? '+' : ''}{returnPercent.toFixed(2)}%
        </ReturnPercent>
        <ReturnDollar $positive={isPositive}>
          ({isPositive ? '+' : ''}${Math.abs(returnDollar).toLocaleString()})
        </ReturnDollar>
      </ReturnInfo>

      <Summary>{summary}</Summary>
    </HeroCard>
  );
};

export default PortfolioHero;
