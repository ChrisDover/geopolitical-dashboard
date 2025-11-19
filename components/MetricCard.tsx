import React from 'react';
import styled from 'styled-components';
import Tooltip from './Tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  tooltip?: string;
  tooltipExplanation?: string;
  comparison?: {
    label: string;
    value: string;
    better: boolean;
  };
  showProgressBar?: boolean;
  progressPercent?: number;
  progressColor?: string;
}

const Card = styled.div`
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 28px;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #ff6b00;
    box-shadow: 0 4px 20px rgba(255, 107, 0, 0.2);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  color: #ff6b00;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const TrendBadge = styled.div<{ $trend: 'up' | 'down' | 'neutral' }>`
  background: ${props =>
    props.$trend === 'up' ? '#00c853' :
    props.$trend === 'down' ? '#d32f2f' :
    '#666'
  };
  color: #fff;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Value = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.div`
  color: #888;
  font-size: 1rem;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Comparison = styled.div<{ $better: boolean }>`
  background: ${props => props.$better ? 'rgba(0, 200, 83, 0.1)' : 'rgba(211, 47, 47, 0.1)'};
  border: 1px solid ${props => props.$better ? '#00c853' : '#d32f2f'};
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const ComparisonLabel = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ComparisonValue = styled.div<{ $better: boolean }>`
  color: ${props => props.$better ? '#00c853' : '#d32f2f'};
  font-size: 1.2rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 12px;
  background: #2a2a2a;
  border-radius: 6px;
  overflow: hidden;
  margin: 16px 0;
`;

const ProgressBarFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: ${props => props.$color};
  border-radius: 6px;
  transition: width 0.6s ease-out;
`;

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  tooltip,
  tooltipExplanation,
  comparison,
  showProgressBar,
  progressPercent = 0,
  progressColor = '#ff6b00'
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <Card>
      <CardHeader>
        {tooltip && tooltipExplanation ? (
          <Tooltip text={tooltip} explanation={tooltipExplanation}>
            <Title>{title}</Title>
          </Tooltip>
        ) : (
          <Title>{title}</Title>
        )}
        {trend && trendValue && (
          <TrendBadge $trend={trend}>
            {getTrendIcon()} {trendValue}
          </TrendBadge>
        )}
      </CardHeader>

      <Value>{value}</Value>

      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      {showProgressBar && (
        <ProgressBarContainer>
          <ProgressBarFill $percent={progressPercent} $color={progressColor} />
        </ProgressBarContainer>
      )}

      {comparison && (
        <Comparison $better={comparison.better}>
          <ComparisonLabel>{comparison.label}</ComparisonLabel>
          <ComparisonValue $better={comparison.better}>
            {comparison.value}
          </ComparisonValue>
        </Comparison>
      )}
    </Card>
  );
};

export default MetricCard;
