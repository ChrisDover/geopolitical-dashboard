import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PositionSizingCalculator from '../PositionSizingCalculator';

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

interface Divergence {
  scenario: string;
  ourModel: number;
  polymarket: number | null;
  edge: string;
  divergence: number | null;
}

interface ExecutiveSummaryProps {
  news: NewsArticle[];
  markets: Divergence[];
}

const HeroContainer = styled.div`
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%);
  border: 2px solid #ff6b00;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.3);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const HeroTitle = styled.h2`
  color: #000;
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const HeroSubtitle = styled.p`
  color: #000;
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ $borderColor: string }>`
  background: #1a1a1a;
  border: 2px solid ${props => props.$borderColor};
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px ${props => `${props.$borderColor}33`};
`;

const StatTitle = styled.h3<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 1rem;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
`;

const StatValue = styled.div`
  color: #fff;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 0.85rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $borderColor: string }>`
  background: #1a1a1a;
  border: 1px solid #333;
  border-left: 4px solid ${props => props.$borderColor};
  border-radius: 8px;
  padding: 25px;
`;

const CardTitle = styled.h3<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 1.3rem;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
`;

const NewsItem = styled.div`
  background: #0a0a0a;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 12px;
  border-left: 3px solid #ff0000;

  &:last-child {
    margin-bottom: 0;
  }
`;

const NewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
  gap: 10px;
  flex-wrap: wrap;
`;

const NewsBadge = styled.span`
  background: #ff0000;
  color: #000;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const NewsTime = styled.span`
  color: #888;
  font-size: 0.75rem;
`;

const NewsTitle = styled.a`
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  display: block;
  margin-bottom: 6px;

  &:hover {
    color: #ff6b00;
  }
`;

const NewsSource = styled.div`
  color: #888;
  font-size: 0.75rem;
`;

const OpportunityItem = styled.div<{ $borderColor: string }>`
  background: #0a0a0a;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 12px;
  border-left: 3px solid ${props => props.$borderColor};

  &:last-child {
    margin-bottom: 0;
  }
`;

const OpportunityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const OpportunityBadge = styled.span<{ $color: string }>`
  background: ${props => props.$color};
  color: #000;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const OpportunityEdge = styled.span<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#00ff00' : '#ff0000'};
  font-size: 0.95rem;
  font-weight: 700;
`;

const OpportunityTitle = styled.div`
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
`;

const OpportunityDetail = styled.div`
  color: #888;
  font-size: 0.8rem;
`;

const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const RegionCard = styled.div`
  background: #0a0a0a;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #333;
  text-align: center;
`;

const RegionName = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 10px;
`;

const RegionCount = styled.div`
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 6px;
`;

const RegionCritical = styled.div`
  color: #ff0000;
  font-size: 0.75rem;
`;

const BlufContainer = styled.div`
  background: #0a0a0a;
  border: 2px solid #ff6b00;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const BlufHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const BlufTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.3rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
`;

const BlufTimestamp = styled.div`
  color: #888;
  font-size: 0.85rem;
  font-weight: 600;
`;

const BlufContent = styled.div`
  display: grid;
  gap: 15px;
`;

const BlufSection = styled.div`
  background: #1a1a1a;
  padding: 15px;
  border-radius: 6px;
  border-left: 3px solid ${props => props.color || '#ff6b00'};
`;

const BlufSectionTitle = styled.h4`
  color: ${props => props.color || '#ff6b00'};
  font-size: 0.85rem;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
`;

const BlufText = styled.p`
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
`;

const BlufHighlight = styled.span`
  color: ${props => props.color || '#ff6b00'};
  font-weight: 700;
`;

const PortfolioSection = styled.div`
  background: #0a0a0a;
  border: 3px solid #ff6b00;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 6px 30px rgba(255, 107, 0, 0.2);
`;

const PortfolioHeader = styled.div`
  margin-bottom: 25px;
`;

const PortfolioTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
`;

const PortfolioSubtitle = styled.div`
  color: #aaa;
  font-size: 1rem;
  margin-bottom: 15px;
`;

const ThesisText = styled.p`
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 0;
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin: 25px 0;
`;

const MetricBox = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 18px;
  text-align: center;
`;

const MetricLabel = styled.div`
  color: #888;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div<{ $color?: string }>`
  color: ${props => props.$color || '#fff'};
  font-size: 1.8rem;
  font-weight: 700;
`;

const PositionsList = styled.div`
  display: grid;
  gap: 12px;
  margin: 25px 0;
`;

const PositionCard = styled.div<{ $profit: boolean }>`
  background: #1a1a1a;
  border-left: 4px solid ${props => props.$profit ? '#00ff00' : '#ff0000'};
  border-radius: 6px;
  padding: 15px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 15px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const PositionHealthContainer = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #333;
`;

const PositionHealthBar = styled.div<{ $health: number }>`
  width: 100%;
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$health}%;
    background: ${props =>
      props.$health >= 80 ? '#00ff00' :
      props.$health >= 60 ? '#7ed321' :
      props.$health >= 40 ? '#ffaa00' :
      props.$health >= 20 ? '#ff6b00' : '#ff0000'
    };
    transition: width 0.3s ease, background 0.3s ease;
    box-shadow: ${props =>
      props.$health >= 80 ? '0 0 10px rgba(0, 255, 0, 0.5)' :
      props.$health >= 60 ? '0 0 10px rgba(126, 211, 33, 0.5)' :
      props.$health >= 40 ? '0 0 10px rgba(255, 170, 0, 0.5)' :
      props.$health >= 20 ? '0 0 10px rgba(255, 107, 0, 0.5)' : '0 0 10px rgba(255, 0, 0, 0.5)'
    };
  }
`;

const PositionHealthLabel = styled.div<{ $health: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const HealthStatus = styled.span<{ $health: number }>`
  color: ${props =>
    props.$health >= 80 ? '#00ff00' :
    props.$health >= 60 ? '#7ed321' :
    props.$health >= 40 ? '#ffaa00' :
    props.$health >= 20 ? '#ff6b00' : '#ff0000'
  };
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HealthScore = styled.span`
  color: #888;
  font-size: 0.7rem;
  font-family: 'Courier New', monospace;
`;

const RiskMetricsSection = styled.div`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  margin: 25px 0;
`;

const RiskMetricsTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.1rem;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const GaugeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
`;

const GaugeContainer = styled.div`
  text-align: center;
`;

const GaugeLabel = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GaugeCircle = styled.div<{ $percentage: number; $color: string }>`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: conic-gradient(
    ${props => props.$color} 0deg,
    ${props => props.$color} ${props => props.$percentage * 3.6}deg,
    #333 ${props => props.$percentage * 3.6}deg,
    #333 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #0a0a0a;
  }
`;

const GaugeValue = styled.div`
  position: relative;
  z-index: 1;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
`;

const GaugeSubtext = styled.div`
  color: #888;
  font-size: 0.75rem;
  margin-top: 5px;
`;

const FuturesSection = styled.div`
  background: linear-gradient(135deg, #1a0a00 0%, #0a0505 100%);
  border: 2px solid #ff6b00;
  border-radius: 8px;
  padding: 20px;
  margin: 25px 0;
`;

const FuturesSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;
`;

const FuturesTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.1rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LeverageWarning = styled.div`
  background: rgba(255, 107, 0, 0.2);
  border: 1px solid #ff6b00;
  border-radius: 4px;
  padding: 8px 12px;
  color: #ff6b00;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;

const FuturesMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const FuturesMetricBox = styled.div`
  background: rgba(255, 107, 0, 0.1);
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
`;

const FuturesMetricLabel = styled.div`
  color: #888;
  font-size: 0.75rem;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FuturesMetricValue = styled.div`
  color: #ff6b00;
  font-size: 1.2rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
`;

const PositionInfo = styled.div``;

const PositionScenario = styled.div`
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
`;

const PositionDetail = styled.div`
  color: #888;
  font-size: 0.8rem;
`;

const PositionPnL = styled.div<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#00ff00' : '#ff0000'};
  font-size: 1.3rem;
  font-weight: 700;
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const PositionPercent = styled.div<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#00ff00' : '#ff0000'};
  font-size: 1rem;
  font-weight: 600;
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const SideBadge = styled.span<{ $side: string }>`
  background: ${props => props.$side === 'YES' ? '#00ff00' : '#ff6b00'};
  color: #000;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 8px;
`;

// Action Required Styles
const ActionRequiredContainer = styled.div`
  background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
  border: 3px solid #ff0000;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 6px 30px rgba(255, 0, 0, 0.5);
  animation: pulse 3s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { box-shadow: 0 6px 30px rgba(255, 0, 0, 0.5); }
    50% { box-shadow: 0 6px 40px rgba(255, 0, 0, 0.7); }
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  animation: shake 0.5s infinite;

  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
`;

const ActionTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const ActionCount = styled.span`
  background: #fff;
  color: #ff0000;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-left: auto;
`;

const ActionAlert = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 5px solid #fff;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
`;

const AlertSymbol = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AlertSymbolText = styled.div`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
`;

const AlertType = styled.div`
  color: #ffcccc;
  font-size: 0.85rem;
  margin-top: 2px;
`;

const UrgencyBadge = styled.div<{ level: 'critical' | 'high' | 'medium' }>`
  background: ${props =>
    props.level === 'critical' ? '#fff' :
    props.level === 'high' ? '#ffaa00' : '#ff6b00'
  };
  color: #000;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AlertReason = styled.div`
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const AlertMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
`;

const AlertMetric = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 6px;
`;

const AlertMetricLabel = styled.div`
  color: #ffcccc;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
`;

const AlertMetricValue = styled.div<{ $type?: 'urgent' | 'warning' | 'negative' | 'neutral' }>`
  color: ${props =>
    props.$type === 'urgent' ? '#fff' :
    props.$type === 'warning' ? '#ffaa00' :
    props.$type === 'negative' ? '#ffcccc' : '#fff'
  };
  font-size: 1.2rem;
  font-weight: 700;
  ${props => props.$type === 'urgent' && `
    animation: blink 1s ease-in-out infinite;
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}
`;

const RecommendationBox = styled.div`
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  border-radius: 6px;
  border-left: 3px solid #fff;
`;

const RecommendationTitle = styled.div`
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const RecommendationText = styled.div`
  color: #ffcccc;
  font-size: 0.9rem;
  line-height: 1.6;
`;

export default function ExecutiveSummary({ news = [], markets = [] }: ExecutiveSummaryProps) {
  const [predictionMarketsData, setPredictionMarketsData] = useState<any>(null);
  const [equitiesData, setEquitiesData] = useState<any>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Calculate position health score (0-100)
  const calculatePositionHealth = (position: any): number => {
    let score = 100;

    // Factor 1: Stop Loss Proximity (40% weight) - closer to stop = lower health
    if (position.stopLoss && position.currentPrice) {
      const stopDistance = Math.abs((position.currentPrice - position.stopLoss) / position.currentPrice * 100);
      if (stopDistance < 3) {
        score -= 40; // Critical proximity
      } else if (stopDistance < 5) {
        score -= 30; // Very close
      } else if (stopDistance < 10) {
        score -= 20; // Close
      } else if (stopDistance < 15) {
        score -= 10; // Moderate
      }
      // else: healthy distance, no penalty
    }

    // Factor 2: Profitability (30% weight)
    const pnlPercent = position.unrealizedPnLPercent || 0;
    if (pnlPercent < -15) {
      score -= 30; // Large loss
    } else if (pnlPercent < -8) {
      score -= 20; // Moderate loss
    } else if (pnlPercent < -3) {
      score -= 10; // Small loss
    } else if (pnlPercent > 15) {
      // Bonus for strong winners (but don't exceed 100)
      score = Math.min(100, score + 5);
    }

    // Factor 3: Thesis Validity (20% weight) - check for broken thesis
    if (position.reasoning) {
      const reasoning = position.reasoning.toLowerCase();
      if (reasoning.includes('wrong') || reasoning.includes('invalidated') || reasoning.includes('thesis broken')) {
        score -= 20; // Thesis completely broken
      } else if (reasoning.includes('thesis weakening') || reasoning.includes('reconsidering')) {
        score -= 10; // Thesis under question
      }
    }

    // Factor 4: Futures Roll Date Urgency (10% weight)
    if (position.rollDate) {
      const rollDate = new Date(position.rollDate);
      const now = new Date();
      const daysToRoll = Math.ceil((rollDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToRoll < 3 && daysToRoll > 0) {
        score -= 10; // Imminent roll
      } else if (daysToRoll < 7 && daysToRoll > 0) {
        score -= 5; // Roll approaching
      }
    }

    return Math.max(0, Math.min(100, score));
  };

  const getHealthStatus = (health: number): string => {
    if (health >= 80) return 'Excellent';
    if (health >= 60) return 'Good';
    if (health >= 40) return 'Caution';
    if (health >= 20) return 'Warning';
    return 'Critical';
  };

  async function fetchPortfolios() {
    try {
      const [predMarkets, equities] = await Promise.all([
        fetch('/api/portfolio').then(r => r.json()),
        fetch('/api/portfolio/equities').then(r => r.json())
      ]);

      if (predMarkets.success) {
        setPredictionMarketsData(predMarkets.data);
      }
      if (equities.success) {
        setEquitiesData(equities.data);
      }
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    }
  }

  const criticalNews = news.filter(n => n.priority === 'CRITICAL' || n.priority === 'HIGH').slice(0, 5);
  const buySignals = markets.filter(m => m.edge.includes('BUY'));
  const sellSignals = markets.filter(m => m.edge.includes('SELL'));

  // Calculate regional threat levels
  const regionStats = ['Middle East', 'East Asia', 'Europe', 'South America'].map(region => ({
    region,
    total: news.filter(n => n.region === region).length,
    critical: news.filter(n => n.region === region && (n.priority === 'CRITICAL' || n.priority === 'HIGH')).length
  }));
  const hotspots = regionStats.filter(r => r.critical > 0).sort((a, b) => b.critical - a.critical);

  // Identify top trading opportunities
  const topOpportunities = [...buySignals, ...sellSignals]
    .sort((a, b) => Math.abs(b.divergence || 0) - Math.abs(a.divergence || 0))
    .slice(0, 2);

  // Calculate Sharpe Ratio
  const calculateSharpeRatio = (equityCurve: any[]) => {
    if (!equityCurve || equityCurve.length < 2) return 0;

    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prevValue = equityCurve[i - 1].portfolioValue;
      const currValue = equityCurve[i].portfolioValue;
      const dailyReturn = (currValue - prevValue) / prevValue;
      returns.push(dailyReturn);
    }

    // Calculate average return
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Calculate standard deviation
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualize (assuming weekly data points = 52 periods per year)
    const periodsPerYear = 52;
    const annualizedReturn = avgReturn * periodsPerYear;
    const annualizedStdDev = stdDev * Math.sqrt(periodsPerYear);

    // Risk-free rate (assume 5% T-bill rate)
    const riskFreeRate = 0.05;

    // Sharpe Ratio = (Return - Risk-Free Rate) / Std Dev
    const sharpeRatio = annualizedStdDev > 0 ? (annualizedReturn - riskFreeRate) / annualizedStdDev : 0;

    return sharpeRatio;
  };

  // Calculate Max Drawdown
  const calculateMaxDrawdown = (equityCurve: any[], valueKey: string = 'portfolioValue') => {
    if (!equityCurve || equityCurve.length < 2) return 0;

    let maxDrawdown = 0;
    let peak = equityCurve[0][valueKey];

    for (let i = 1; i < equityCurve.length; i++) {
      const value = equityCurve[i][valueKey];

      // Update peak if we've reached a new high
      if (value > peak) {
        peak = value;
      }

      // Calculate drawdown from peak
      const drawdown = ((value - peak) / peak) * 100;

      // Track the maximum drawdown (most negative)
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  };

  // Helper function to format portfolio data
  const formatPortfolioData = (portfolioData: any) => {
    const chartData = portfolioData?.equityCurve?.map((point: any) => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Portfolio: point.portfolioValue,
      'S&P 500': point.sp500Value
    })) || [];

    const portfolioReturn = portfolioData?.equityCurve && portfolioData.equityCurve.length > 0
      ? ((portfolioData.equityCurve[portfolioData.equityCurve.length - 1].portfolioValue - portfolioData.equityCurve[0].portfolioValue) / portfolioData.equityCurve[0].portfolioValue * 100).toFixed(2)
      : '0.00';
    const sp500Return = portfolioData?.equityCurve && portfolioData.equityCurve.length > 0
      ? ((portfolioData.equityCurve[portfolioData.equityCurve.length - 1].sp500Value - portfolioData.equityCurve[0].sp500Value) / portfolioData.equityCurve[0].sp500Value * 100).toFixed(2)
      : '0.00';
    const alpha = (parseFloat(portfolioReturn) - parseFloat(sp500Return)).toFixed(2);

    // Calculate portfolio-specific Sharpe Ratio and Max Drawdown
    const portfolioSharpe = portfolioData?.equityCurve
      ? calculateSharpeRatio(portfolioData.equityCurve.map((p: any) => ({ portfolioValue: p.portfolioValue })))
      : 0;
    const portfolioMaxDD = portfolioData?.equityCurve
      ? calculateMaxDrawdown(portfolioData.equityCurve, 'portfolioValue')
      : 0;

    return {
      chartData,
      portfolioReturn,
      sp500Return,
      alpha,
      portfolioSharpe,
      portfolioMaxDD
    };
  };

  // Calculate S&P 500 metrics once (should be identical across all portfolios)
  const sp500Sharpe = equitiesData?.equityCurve
    ? calculateSharpeRatio(equitiesData.equityCurve.map((p: any) => ({ portfolioValue: p.sp500Value })))
    : 0;
  const sp500MaxDD = equitiesData?.equityCurve
    ? calculateMaxDrawdown(equitiesData.equityCurve, 'sp500Value')
    : 0;

  const predMarketsFormatted = formatPortfolioData(predictionMarketsData);
  const equitiesFormatted = formatPortfolioData(equitiesData);

  // Analyze positions that need immediate action
  const analyzePositionAction = (position: any) => {
    const issues = [];
    let urgency: 'critical' | 'high' | 'medium' = 'medium';

    // Check stop loss proximity
    if (position.stopLoss && position.currentPrice) {
      const stopDistance = Math.abs((position.currentPrice - position.stopLoss) / position.currentPrice * 100);
      if (stopDistance < 5) {
        issues.push({
          type: 'Stop Loss Proximity',
          value: `$${Math.abs(position.currentPrice - position.stopLoss).toFixed(2)} (${stopDistance.toFixed(1)}%)`,
          severity: 'urgent'
        });
        urgency = 'critical';
      } else if (stopDistance < 10) {
        issues.push({
          type: 'Stop Loss Warning',
          value: `$${Math.abs(position.currentPrice - position.stopLoss).toFixed(2)} (${stopDistance.toFixed(1)}%)`,
          severity: 'warning'
        });
        if (urgency === 'medium') urgency = 'high';
      }
    }

    // Check for broken thesis
    if (position.reasoning && (position.reasoning.includes('WRONG') || position.reasoning.includes('broken') || position.reasoning.toLowerCase().includes('invalidated'))) {
      issues.push({
        type: 'Thesis Status',
        value: 'INVALIDATED',
        severity: 'negative'
      });
      if (urgency === 'medium') urgency = 'high';
    }

    // Check roll date for futures
    if (position.rollDate) {
      const rollDate = new Date(position.rollDate);
      const now = new Date();
      const daysToRoll = Math.ceil((rollDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToRoll < 7 && daysToRoll > 0) {
        issues.push({
          type: 'Roll Date',
          value: `${daysToRoll} days (cost: $${position.rollCost || 0})`,
          severity: 'warning'
        });
        if (urgency === 'medium') urgency = 'high';
      }
    }

    // Check large unrealized losses
    if (position.unrealizedPnLPercent < -8) {
      issues.push({
        type: 'Unrealized Loss',
        value: `${position.unrealizedPnLPercent.toFixed(1)}%`,
        severity: 'negative'
      });
    }

    return issues.length > 0 ? { position, issues, urgency } : null;
  };

  // Get all positions needing action
  const allPositions = [
    ...(predictionMarketsData?.positions || []),
    ...(equitiesData?.positions || [])
  ];

  const positionsNeedingAction = allPositions
    .map(analyzePositionAction)
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const urgencyOrder: { [key: string]: number } = { critical: 3, high: 2, medium: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

  // Render action required section
  const renderActionRequired = () => {
    if (positionsNeedingAction.length === 0) return null;

    return (
      <ActionRequiredContainer>
        <ActionHeader>
          <ActionIcon>⚠️</ActionIcon>
          <ActionTitle>Immediate Action Required</ActionTitle>
          <ActionCount>{positionsNeedingAction.length}</ActionCount>
        </ActionHeader>

        {positionsNeedingAction.map((alert: any, idx: number) => {
          const pos = alert.position;
          const portfolioType = pos.contracts ? 'Futures' : pos.side ? 'Prediction Market' : 'Equity/ETF';

          // Generate recommendation
          let recommendation = '';
          if (alert.urgency === 'critical') {
            recommendation = 'Consider immediate position review. Multiple risk factors present including proximity to stop loss and thesis invalidation. Evaluate exit or adjustment strategies.';
          } else if (alert.urgency === 'high') {
            recommendation = 'Position requires attention within 24-48 hours. Monitor closely and prepare contingency plans.';
          } else {
            recommendation = 'Review position during next trading session. Consider rebalancing or adjusting risk parameters.';
          }

          return (
            <ActionAlert key={idx}>
              <AlertHeader>
                <AlertSymbol>
                  <div>
                    <AlertSymbolText>
                      {pos.symbol || pos.scenario}
                    </AlertSymbolText>
                    <AlertType>{portfolioType} • {pos.name || pos.side}</AlertType>
                  </div>
                </AlertSymbol>
                <UrgencyBadge level={alert.urgency}>
                  {alert.urgency === 'critical' ? '🔴 CRITICAL' : alert.urgency === 'high' ? '🟡 HIGH' : '🟠 MEDIUM'}
                </UrgencyBadge>
              </AlertHeader>

              <AlertReason>
                {alert.issues.map((issue: any) => issue.type).join(' • ')}
              </AlertReason>

              <AlertMetricsGrid>
                {alert.issues.map((issue: any, issueIdx: number) => (
                  <AlertMetric key={issueIdx}>
                    <AlertMetricLabel>{issue.type}</AlertMetricLabel>
                    <AlertMetricValue $type={issue.severity}>
                      {issue.value}
                    </AlertMetricValue>
                  </AlertMetric>
                ))}
                <AlertMetric>
                  <AlertMetricLabel>Current P&L</AlertMetricLabel>
                  <AlertMetricValue $type={pos.unrealizedPnL >= 0 ? 'neutral' : 'negative'}>
                    {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toLocaleString()} ({pos.unrealizedPnLPercent.toFixed(1)}%)
                  </AlertMetricValue>
                </AlertMetric>
              </AlertMetricsGrid>

              <RecommendationBox>
                <RecommendationTitle>💡 Recommendation</RecommendationTitle>
                <RecommendationText>{recommendation}</RecommendationText>
              </RecommendationBox>
            </ActionAlert>
          );
        })}
      </ActionRequiredContainer>
    );
  };

  // Render portfolio section
  const renderPortfolio = (portfolioData: any, formatted: any, title: string) => {
    if (!portfolioData) return null;

    return (
      <PortfolioSection>
        <PortfolioHeader>
          <PortfolioTitle style={{ color: '#ff6b00', marginBottom: '5px' }}>{title}</PortfolioTitle>
          <PortfolioTitle>{portfolioData.portfolioThesis?.title || 'Portfolio'}</PortfolioTitle>
          <PortfolioSubtitle>{portfolioData.portfolioThesis?.summary}</PortfolioSubtitle>
          <ThesisText>
            <strong style={{ color: '#ff6b00' }}>Year-to-Date: </strong>
            {portfolioData.portfolioThesis?.yearToDatePerformance}
            <br/><br/>
            <strong style={{ color: '#ff6b00' }}>Performance Attribution: </strong>
            {portfolioData.portfolioThesis?.performanceAttribution}
          </ThesisText>
        </PortfolioHeader>

        <MetricsRow>
          <MetricBox>
            <MetricLabel>Total Capital</MetricLabel>
            <MetricValue>${(portfolioData.metadata?.totalCapital || 0).toLocaleString()}</MetricValue>
          </MetricBox>
          <MetricBox>
            <MetricLabel>Unrealized P&L</MetricLabel>
            <MetricValue $color={(portfolioData.metadata?.unrealizedPnL || 0) >= 0 ? '#00ff00' : '#ff0000'}>
              {(portfolioData.metadata?.unrealizedPnL || 0) >= 0 ? '+' : ''}${(portfolioData.metadata?.unrealizedPnL || 0).toLocaleString()}
            </MetricValue>
          </MetricBox>
          <MetricBox>
            <MetricLabel>Realized P&L</MetricLabel>
            <MetricValue $color={(portfolioData.metadata?.realizedPnL || 0) >= 0 ? '#00ff00' : '#ff0000'}>
              {(portfolioData.metadata?.realizedPnL || 0) >= 0 ? '+' : ''}${(portfolioData.metadata?.realizedPnL || 0).toLocaleString()}
            </MetricValue>
          </MetricBox>
          <MetricBox>
            <MetricLabel>Portfolio Return</MetricLabel>
            <MetricValue $color={parseFloat(formatted.portfolioReturn) >= 0 ? '#00ff00' : '#ff0000'}>
              {parseFloat(formatted.portfolioReturn) >= 0 ? '+' : ''}{formatted.portfolioReturn}%
            </MetricValue>
          </MetricBox>
          <MetricBox>
            <MetricLabel>Alpha vs S&P 500</MetricLabel>
            <MetricValue $color={parseFloat(formatted.alpha) >= 0 ? '#00ff00' : '#ff0000'}>
              {parseFloat(formatted.alpha) >= 0 ? '+' : ''}{formatted.alpha}%
            </MetricValue>
          </MetricBox>
        </MetricsRow>

        {portfolioData.riskMetrics && (
          <RiskMetricsSection>
            <RiskMetricsTitle>Risk & Portfolio Analytics</RiskMetricsTitle>
            <GaugeGrid>
              <GaugeContainer>
                <GaugeLabel>Capital Deployment</GaugeLabel>
                <GaugeCircle
                  $percentage={Math.min(100, portfolioData.riskMetrics.deploymentRatio || 0)}
                  $color={
                    portfolioData.riskMetrics.deploymentRatio > 95 ? '#ff0000' :
                    portfolioData.riskMetrics.deploymentRatio > 85 ? '#ffaa00' :
                    portfolioData.riskMetrics.deploymentRatio > 70 ? '#7ed321' : '#00ff00'
                  }
                >
                  <GaugeValue>{(portfolioData.riskMetrics.deploymentRatio || 0).toFixed(0)}%</GaugeValue>
                </GaugeCircle>
                <GaugeSubtext>
                  {portfolioData.riskMetrics.deploymentRatio > 95 ? 'Overdeployed' :
                   portfolioData.riskMetrics.deploymentRatio > 85 ? 'Fully Deployed' :
                   portfolioData.riskMetrics.deploymentRatio > 70 ? 'Well Deployed' : 'Conservative'}
                </GaugeSubtext>
              </GaugeContainer>

              <GaugeContainer>
                <GaugeLabel>Profit Factor</GaugeLabel>
                <GaugeCircle
                  $percentage={Math.min(100, ((portfolioData.riskMetrics.profitFactor || 0) / 3) * 100)}
                  $color={
                    portfolioData.riskMetrics.profitFactor >= 2 ? '#00ff00' :
                    portfolioData.riskMetrics.profitFactor >= 1.5 ? '#7ed321' :
                    portfolioData.riskMetrics.profitFactor >= 1 ? '#ffaa00' : '#ff0000'
                  }
                >
                  <GaugeValue>{(portfolioData.riskMetrics.profitFactor || 0).toFixed(2)}</GaugeValue>
                </GaugeCircle>
                <GaugeSubtext>
                  {portfolioData.riskMetrics.profitFactor >= 2 ? 'Excellent' :
                   portfolioData.riskMetrics.profitFactor >= 1.5 ? 'Good' :
                   portfolioData.riskMetrics.profitFactor >= 1 ? 'Neutral' : 'Poor'}
                </GaugeSubtext>
              </GaugeContainer>

              <GaugeContainer>
                <GaugeLabel>Long/Short Ratio</GaugeLabel>
                <GaugeCircle
                  $percentage={Math.min(100, ((portfolioData.riskMetrics.longShortRatio || 0) / 10) * 100)}
                  $color="#ff6b00"
                >
                  <GaugeValue>{(portfolioData.riskMetrics.longShortRatio || 0).toFixed(1)}x</GaugeValue>
                </GaugeCircle>
                <GaugeSubtext>
                  {portfolioData.riskMetrics.longShortRatio > 5 ? 'Net Long' :
                   portfolioData.riskMetrics.longShortRatio > 2 ? 'Long Bias' :
                   portfolioData.riskMetrics.longShortRatio > 0.5 ? 'Balanced' : 'Short Bias'}
                </GaugeSubtext>
              </GaugeContainer>

              <GaugeContainer>
                <GaugeLabel>Win Rate</GaugeLabel>
                <GaugeCircle
                  $percentage={(() => {
                    const winners = portfolioData.positions?.filter((p: any) => p.unrealizedPnL > 0).length || 0;
                    const total = portfolioData.positions?.length || 1;
                    return (winners / total) * 100;
                  })()}
                  $color={(() => {
                    const winners = portfolioData.positions?.filter((p: any) => p.unrealizedPnL > 0).length || 0;
                    const total = portfolioData.positions?.length || 1;
                    const rate = (winners / total) * 100;
                    return rate >= 60 ? '#00ff00' : rate >= 50 ? '#7ed321' : rate >= 40 ? '#ffaa00' : '#ff0000';
                  })()}
                >
                  <GaugeValue>
                    {(() => {
                      const winners = portfolioData.positions?.filter((p: any) => p.unrealizedPnL > 0).length || 0;
                      const total = portfolioData.positions?.length || 1;
                      return ((winners / total) * 100).toFixed(0);
                    })()}%
                  </GaugeValue>
                </GaugeCircle>
                <GaugeSubtext>
                  {portfolioData.positions?.filter((p: any) => p.unrealizedPnL > 0).length || 0}/
                  {portfolioData.positions?.length || 0} Winning
                </GaugeSubtext>
              </GaugeContainer>

              <GaugeContainer>
                <GaugeLabel>Sharpe Ratio</GaugeLabel>
                <GaugeCircle
                  $percentage={Math.min(100, Math.max(0, ((formatted.portfolioSharpe + 2) / 4) * 100))}
                  $color={
                    formatted.portfolioSharpe >= 2 ? '#00ff00' :
                    formatted.portfolioSharpe >= 1 ? '#7ed321' :
                    formatted.portfolioSharpe >= 0 ? '#ffaa00' : '#ff0000'
                  }
                >
                  <GaugeValue style={{ fontSize: '1.3rem' }}>{formatted.portfolioSharpe.toFixed(2)}</GaugeValue>
                </GaugeCircle>
                <GaugeSubtext>
                  {formatted.portfolioSharpe > sp500Sharpe ? '✓ ' : ''}
                  vs S&P: {sp500Sharpe.toFixed(2)}
                  {formatted.portfolioSharpe > sp500Sharpe ? '' : ' ✗'}
                </GaugeSubtext>
              </GaugeContainer>

              <GaugeContainer>
                <GaugeLabel>Max Drawdown</GaugeLabel>
                <GaugeCircle
                  $percentage={Math.min(100, Math.abs(formatted.portfolioMaxDD))}
                  $color={
                    formatted.portfolioMaxDD > -10 ? '#00ff00' :
                    formatted.portfolioMaxDD > -15 ? '#7ed321' :
                    formatted.portfolioMaxDD > -20 ? '#ffaa00' : '#ff0000'
                  }
                >
                  <GaugeValue style={{ fontSize: '1.3rem' }}>{formatted.portfolioMaxDD.toFixed(1)}%</GaugeValue>
                </GaugeCircle>
                <GaugeSubtext>
                  {Math.abs(formatted.portfolioMaxDD) < Math.abs(sp500MaxDD) ? '✓ ' : ''}
                  vs S&P: {sp500MaxDD.toFixed(1)}%
                  {Math.abs(formatted.portfolioMaxDD) < Math.abs(sp500MaxDD) ? '' : ' ✗'}
                </GaugeSubtext>
              </GaugeContainer>
            </GaugeGrid>
          </RiskMetricsSection>
        )}

        {formatted.chartData.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#ff6b00', fontSize: '1.1rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              365-Day Performance vs S&P 500
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatted.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  style={{ fontSize: '0.75rem' }}
                  interval={Math.floor(formatted.chartData.length / 8)}
                />
                <YAxis
                  stroke="#888"
                  style={{ fontSize: '0.75rem' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                  labelStyle={{ color: '#ff6b00' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="Portfolio" stroke="#ff6b00" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="S&P 500" stroke="#888" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {(() => {
          const futuresPositions = portfolioData.positions?.filter((p: any) => p.type === 'FUTURES') || [];
          const totalMargin = futuresPositions.reduce((sum: number, p: any) => sum + (p.costBasis || 0), 0);
          const totalNotional = futuresPositions.reduce((sum: number, p: any) => sum + (p.notionalExposure || 0), 0);
          const leverage = totalMargin > 0 ? (totalNotional / totalMargin).toFixed(1) : '0.0';

          if (futuresPositions.length === 0) return null;

          return (
            <FuturesSection>
              <FuturesSectionHeader>
                <FuturesTitle>
                  Leveraged Futures Positions ({futuresPositions.length})
                  <LeverageWarning>{leverage}x Leverage</LeverageWarning>
                </FuturesTitle>
              </FuturesSectionHeader>

              <FuturesMetricsGrid>
                <FuturesMetricBox>
                  <FuturesMetricLabel>Total Margin Posted</FuturesMetricLabel>
                  <FuturesMetricValue>${totalMargin.toLocaleString()}</FuturesMetricValue>
                </FuturesMetricBox>
                <FuturesMetricBox>
                  <FuturesMetricLabel>Notional Exposure</FuturesMetricLabel>
                  <FuturesMetricValue>${totalNotional.toLocaleString()}</FuturesMetricValue>
                </FuturesMetricBox>
                <FuturesMetricBox>
                  <FuturesMetricLabel>Leverage Ratio</FuturesMetricLabel>
                  <FuturesMetricValue>{leverage}x</FuturesMetricValue>
                </FuturesMetricBox>
                <FuturesMetricBox>
                  <FuturesMetricLabel>% of Portfolio</FuturesMetricLabel>
                  <FuturesMetricValue>
                    {((totalMargin / (portfolioData.metadata?.totalCapital || 1)) * 100).toFixed(1)}%
                  </FuturesMetricValue>
                </FuturesMetricBox>
              </FuturesMetricsGrid>

              <PositionsList>
                {futuresPositions.map((pos: any) => {
                  const health = calculatePositionHealth(pos);
                  const healthStatus = getHealthStatus(health);
                  const daysToRoll = pos.rollDate
                    ? Math.ceil((new Date(pos.rollDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <PositionCard key={pos.id} $profit={pos.unrealizedPnL >= 0}>
                      <PositionInfo>
                        <PositionScenario>
                          {pos.symbol} - {pos.name}
                          <SideBadge $side="FUTURES">FUTURES</SideBadge>
                          {daysToRoll !== null && daysToRoll < 14 && (
                            <SideBadge $side="WARNING" style={{ background: '#ffaa00', color: '#000' }}>
                              ROLL IN {daysToRoll}D
                            </SideBadge>
                          )}
                        </PositionScenario>
                        <PositionDetail>
                          Entry: ${pos.entryPrice.toFixed(2)} → Current: ${pos.currentPrice.toFixed(2)} |
                          {pos.contracts} contracts | Margin: ${pos.costBasis.toLocaleString()} |
                          Notional: ${(pos.notionalExposure || 0).toLocaleString()}
                        </PositionDetail>
                        {pos.rollDate && (
                          <PositionDetail style={{ marginTop: '4px', fontSize: '0.75rem', color: '#ff6b00' }}>
                            Roll Date: {new Date(pos.rollDate).toLocaleDateString()} (Cost: ${pos.rollCost || 0})
                          </PositionDetail>
                        )}
                        <PositionDetail style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                          {pos.reasoning}
                        </PositionDetail>
                        <PositionHealthContainer>
                          <PositionHealthLabel $health={health}>
                            <HealthStatus $health={health}>
                              Position Health: {healthStatus}
                            </HealthStatus>
                            <HealthScore>{health}/100</HealthScore>
                          </PositionHealthLabel>
                          <PositionHealthBar $health={health} />
                        </PositionHealthContainer>
                      </PositionInfo>
                      <PositionPnL $positive={pos.unrealizedPnL >= 0}>
                        {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toLocaleString()}
                      </PositionPnL>
                      <PositionPercent $positive={pos.unrealizedPnLPercent >= 0}>
                        {pos.unrealizedPnLPercent >= 0 ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(1)}%
                      </PositionPercent>
                    </PositionCard>
                  );
                })}
              </PositionsList>
            </FuturesSection>
          );
        })()}

        <div>
          <h3 style={{ color: '#ff6b00', fontSize: '1.1rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Equity & ETF Positions ({portfolioData.positions?.filter((p: any) => p.type !== 'FUTURES').length || 0} Open)
          </h3>
          <PositionsList>
{portfolioData.positions?.filter((p: any) => p.type !== 'FUTURES').map((pos: any) => {
              const health = calculatePositionHealth(pos);
              const healthStatus = getHealthStatus(health);

              return (
                <PositionCard key={pos.id} $profit={pos.unrealizedPnL >= 0}>
                  <PositionInfo>
                    <PositionScenario>
                      {pos.symbol ? `${pos.symbol} - ${pos.name || pos.scenario}` : pos.scenario}
                      {pos.side && <SideBadge $side={pos.side}>{pos.side}</SideBadge>}
                      {pos.type && <SideBadge $side={pos.type}>{pos.type}</SideBadge>}
                    </PositionScenario>
                    <PositionDetail>
                      Entry: ${pos.entryPrice.toFixed(2)} → Current: ${pos.currentPrice.toFixed(2)} |
                      {pos.contracts ? ` ${pos.contracts.toLocaleString()} contracts` : ` ${Math.abs(pos.shares).toLocaleString()} shares`}
                    </PositionDetail>
                    <PositionDetail style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                      {pos.reasoning}
                    </PositionDetail>
                    <PositionHealthContainer>
                      <PositionHealthLabel $health={health}>
                        <HealthStatus $health={health}>
                          Position Health: {healthStatus}
                        </HealthStatus>
                        <HealthScore>{health}/100</HealthScore>
                      </PositionHealthLabel>
                      <PositionHealthBar $health={health} />
                    </PositionHealthContainer>
                  </PositionInfo>
                  <PositionPnL $positive={pos.unrealizedPnL >= 0}>
                    {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toLocaleString()}
                  </PositionPnL>
                  <PositionPercent $positive={pos.unrealizedPnLPercent >= 0}>
                    {pos.unrealizedPnLPercent >= 0 ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(1)}%
                  </PositionPercent>
                </PositionCard>
              );
            })}
          </PositionsList>
        </div>

        <PositionSizingCalculator
          portfolioType={title.includes('PREDICTION') ? 'prediction-markets' : 'equities'}
          positions={portfolioData.positions.map((pos: any) => ({
            symbol: pos.symbol || pos.scenario,
            name: pos.name || pos.scenario,
            type: pos.type || (pos.contracts ? 'FUTURES' : 'EQUITY'),
            shares: pos.shares,
            contracts: pos.contracts,
            currentPrice: pos.currentPrice,
            sector: pos.sector || pos.region
          }))}
          baseCapital={100000}
        />
      </PortfolioSection>
    );
  };

  return (
    <>
      <BlufContainer>
        <BlufHeader>
          <BlufTitle>BLUF - Bottom Line Up Front</BlufTitle>
          <BlufTimestamp>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </BlufTimestamp>
        </BlufHeader>

        <BlufContent>
          <BlufSection color="#ff0000">
            <BlufSectionTitle color="#ff0000">Threat Assessment</BlufSectionTitle>
            <BlufText>
              {news.filter(n => n.priority === 'CRITICAL').length > 0 ? (
                <>
                  <BlufHighlight color="#ff0000">{news.filter(n => n.priority === 'CRITICAL').length} CRITICAL</BlufHighlight> and{' '}
                  <BlufHighlight color="#ff6b00">{news.filter(n => n.priority === 'HIGH').length} HIGH</BlufHighlight> priority events detected in last 24 hours.{' '}
                  {hotspots.length > 0 && (
                    <>Primary hotspots: <BlufHighlight color="#ff0000">{hotspots.map(h => h.region).join(', ')}</BlufHighlight>.</>
                  )}
                </>
              ) : (
                <>
                  Elevated monitoring posture maintained. <BlufHighlight color="#ff6b00">{news.filter(n => n.priority === 'HIGH').length} HIGH</BlufHighlight> priority events tracked.{' '}
                  No critical-level threats identified in current intelligence cycle.
                </>
              )}
            </BlufText>
          </BlufSection>

          <BlufSection color="#00ff00">
            <BlufSectionTitle color="#00ff00">Market Positioning</BlufSectionTitle>
            <BlufText>
              Model identifies <BlufHighlight color="#00ff00">{buySignals.length} BUY signals</BlufHighlight> and{' '}
              <BlufHighlight color="#ff0000">{sellSignals.length} SELL signals</BlufHighlight> across geopolitical prediction markets.{' '}
              {topOpportunities.length > 0 && (
                <>
                  Largest divergence: <BlufHighlight color="#ff6b00">{topOpportunities[0]?.scenario}</BlufHighlight>{' '}
                  ({topOpportunities[0]?.edge}, {Math.abs(topOpportunities[0]?.divergence || 0).toFixed(0)}% edge).
                </>
              )}
            </BlufText>
          </BlufSection>

          <BlufSection color="#ff6b00">
            <BlufSectionTitle color="#ff6b00">Key Takeaway</BlufSectionTitle>
            <BlufText>
              {criticalNews.length > 0 ? (
                <>
                  Monitor <BlufHighlight color="#ff6b00">{criticalNews[0]?.region}</BlufHighlight> developments closely.{' '}
                  Latest: "{criticalNews[0]?.headline.substring(0, 80)}..."{' '}
                  {buySignals.length > 0 && (
                    <>Market mispricing detected in {buySignals[0]?.scenario} presents tactical opportunity.</>
                  )}
                </>
              ) : (
                <>
                  Geopolitical environment remains fluid with {news.length} tracked events.{' '}
                  {markets.length > 0 && (
                    <>Current model-market alignment suggests {markets.filter(m => m.edge === 'FAIR').length} fairly priced scenarios.</>
                  )}
                  Maintain vigilant posture and monitor for emerging threats.
                </>
              )}
            </BlufText>
          </BlufSection>
        </BlufContent>
      </BlufContainer>

      <StatsGrid>
        <StatCard $borderColor="#ff0000">
          <StatTitle $color="#ff0000">Critical Events</StatTitle>
          <StatValue>{news.filter(n => n.priority === 'CRITICAL').length}</StatValue>
          <StatLabel>High-priority events in last 24h</StatLabel>
        </StatCard>

        <StatCard $borderColor="#00ff00">
          <StatTitle $color="#00ff00">Buy Opportunities</StatTitle>
          <StatValue>{buySignals.length}</StatValue>
          <StatLabel>Model predicts higher than market</StatLabel>
        </StatCard>

        <StatCard $borderColor="#ff6b00">
          <StatTitle $color="#ff6b00">Sell Signals</StatTitle>
          <StatValue>{sellSignals.length}</StatValue>
          <StatLabel>Model predicts lower than market</StatLabel>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Card $borderColor="#ffaa00">
          <CardTitle $color="#ffaa00">Top Critical Events</CardTitle>
          {criticalNews.length > 0 ? (
            criticalNews.map((item, idx) => (
              <NewsItem key={idx}>
                <NewsHeader>
                  <NewsBadge>{item.priority}</NewsBadge>
                  <NewsTime>
                    {new Date(item.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </NewsTime>
                </NewsHeader>
                <NewsTitle href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.headline}
                </NewsTitle>
                <NewsSource>
                  {item.region} • {item.source}
                </NewsSource>
              </NewsItem>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              No critical events in the last 24 hours
            </div>
          )}
        </Card>

        <Card $borderColor="#00ff00">
          <CardTitle $color="#00ff00">Top Trading Opportunities</CardTitle>
          {buySignals.length > 0 ? (
            buySignals.slice(0, 4).map((item, idx) => (
              <OpportunityItem key={idx} $borderColor="#00ff00">
                <OpportunityHeader>
                  <OpportunityBadge $color="#00ff00">{item.edge}</OpportunityBadge>
                  <OpportunityEdge $positive={(item.divergence || 0) > 0}>
                    {item.divergence && item.divergence > 0 ? '+' : ''}{item.divergence?.toFixed(0)}%
                  </OpportunityEdge>
                </OpportunityHeader>
                <OpportunityTitle>{item.scenario}</OpportunityTitle>
                <OpportunityDetail>
                  Our Model: {item.ourModel}% | Market: {item.polymarket?.toFixed(0)}%
                </OpportunityDetail>
              </OpportunityItem>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              No strong buy signals detected
            </div>
          )}
        </Card>
      </ContentGrid>

      <Card $borderColor="#ff6b00">
        <CardTitle $color="#ff6b00">Regional Intelligence Summary</CardTitle>
        <RegionGrid>
          {['Middle East', 'East Asia', 'Europe', 'South America'].map(region => {
            const regionNews = news.filter(n => n.region === region);
            const criticalCount = regionNews.filter(n => n.priority === 'CRITICAL' || n.priority === 'HIGH').length;
            return (
              <RegionCard key={region}>
                <RegionName>{region}</RegionName>
                <RegionCount>{regionNews.length}</RegionCount>
                <RegionCritical>{criticalCount} critical</RegionCritical>
              </RegionCard>
            );
          })}
        </RegionGrid>
      </Card>

      {renderActionRequired()}

      {renderPortfolio(predictionMarketsData, predMarketsFormatted, 'PREDICTION MARKETS PORTFOLIO')}

      {renderPortfolio(equitiesData, equitiesFormatted, 'EQUITIES, ETFs & FUTURES PORTFOLIO')}
    </>
  );
}
