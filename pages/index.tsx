import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import NotificationBar from '../components/NotificationBar';

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
  margin-bottom: 40px;
  text-align: center;
`;

const PageTitle = styled.h1`
  color: #fff;
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 3px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  color: #888;
  font-size: 1.2rem;
  margin: 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
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
  font-size: 0.9rem;
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

const ViewButton = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  color: #000;
  padding: 12px 24px;
  border-radius: 6px;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const PortfolioSummary = styled.div`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
`;

const SummaryTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 25px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const SummaryCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
`;

const SummaryLabel = styled.div`
  color: #888;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
`;

const SummaryValue = styled.div<{ $positive?: boolean }>`
  color: ${props =>
    props.$positive === undefined ? '#fff' :
    props.$positive ? '#00c853' : '#ff0000'
  };
  font-size: 1.8rem;
  font-weight: 800;
  font-family: 'Courier New', monospace;
`;

export default function OverviewPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Portfolio data
  const eventsPnL = 14000;
  const eventsPositions = 8;
  const eventsAllocated = 142500;

  const equitiesPnL = -2748;
  const equitiesPositions = 7;
  const equitiesAllocated = 352985;

  const totalPnL = eventsPnL + equitiesPnL;
  const totalAllocated = eventsAllocated + equitiesAllocated;

  useEffect(() => {
    // Fetch critical notifications
    Promise.all([
      fetch('/api/news/feed?limit=5').then(r => r.json()),
      fetch('/api/markets/divergence').then(r => r.json())
    ])
      .then(([news, markets]) => {
        const criticalNews = news.data?.filter((n: any) => n.priority === 'CRITICAL') || [];
        const newNotifications: Notification[] = criticalNews.slice(0, 2).map((item: any, idx: number) => ({
          id: Date.now() + idx,
          time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          level: 'CRITICAL' as const,
          type: 'NEWS',
          title: item.headline,
          message: `Source: ${item.source} | Region: ${item.region}`,
          acknowledged: false
        }));

        const strongSignals = markets.data?.filter((m: any) => m.edge === 'STRONG BUY' || m.edge === 'STRONG SELL') || [];
        const marketNotifications: Notification[] = strongSignals.slice(0, 2).map((item: any, idx: number) => ({
          id: Date.now() + 1000 + idx,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          level: 'HIGH' as const,
          type: 'MARKET',
          title: `${item.edge}: ${item.scenario}`,
          message: `Model: ${item.ourModel}% | Market: ${item.polymarket?.toFixed(0)}% | Edge: ${item.divergence?.toFixed(0)}%`,
          acknowledged: false
        }));

        setNotifications([...newNotifications, ...marketNotifications].slice(0, 5));
      })
      .catch(error => console.error('Failed to fetch notifications:', error));
  }, []);

  const acknowledgeNotification = (id: number) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, acknowledged: true } : n
    ));
  };

  return (
    <PageContainer>
      <Navigation totalPnL={totalPnL} />

      <NotificationBar
        notifications={notifications}
        onAcknowledge={acknowledgeNotification}
      />

      <ContentContainer>
        <Header>
          <PageTitle>Portfolio Overview</PageTitle>
          <PageSubtitle>
            Unified command center for geopolitical event markets, tactical equities, and risk analytics
          </PageSubtitle>
        </Header>

        <PortfolioSummary>
          <SummaryTitle>Combined Portfolio Metrics</SummaryTitle>
          <SummaryGrid>
            <SummaryCard>
              <SummaryLabel>Total P&L</SummaryLabel>
              <SummaryValue $positive={totalPnL >= 0}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
              </SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Total Allocated</SummaryLabel>
              <SummaryValue>${totalAllocated.toLocaleString()}</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Return %</SummaryLabel>
              <SummaryValue $positive={totalPnL >= 0}>
                {totalPnL >= 0 ? '+' : ''}{((totalPnL / totalAllocated) * 100).toFixed(2)}%
              </SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Active Positions</SummaryLabel>
              <SummaryValue>{eventsPositions + equitiesPositions}</SummaryValue>
            </SummaryCard>
          </SummaryGrid>
        </PortfolioSummary>

        <ProductGrid>
          <Link href="/markets/events" style={{ textDecoration: 'none' }}>
            <ProductCard $color="#ff6b00">
              <ProductIcon>📊</ProductIcon>
              <ProductTitle $color="#ff6b00">Event Markets</ProductTitle>
              <ProductDescription>
                Prediction markets tracking geopolitical events - Polymarket & Kalshi contracts with real-time probabilities and model divergence analysis
              </ProductDescription>
              <ProductStats>
                <StatRow>
                  <StatLabel>P&L</StatLabel>
                  <StatValue $positive={eventsPnL >= 0}>
                    {eventsPnL >= 0 ? '+' : ''}${eventsPnL.toLocaleString()}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Active Positions</StatLabel>
                  <StatValue>{eventsPositions}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Allocated</StatLabel>
                  <StatValue>${eventsAllocated.toLocaleString()}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Return</StatLabel>
                  <StatValue $positive={eventsPnL >= 0}>
                    {eventsPnL >= 0 ? '+' : ''}{((eventsPnL / eventsAllocated) * 100).toFixed(2)}%
                  </StatValue>
                </StatRow>
              </ProductStats>
              <ViewButton $color="#ff6b00">View Dashboard</ViewButton>
            </ProductCard>
          </Link>

          <Link href="/markets/equities" style={{ textDecoration: 'none' }}>
            <ProductCard $color="#0066cc">
              <ProductIcon>📈</ProductIcon>
              <ProductTitle $color="#0066cc">Tactical Equities</ProductTitle>
              <ProductDescription>
                Defense & Energy stocks, ETFs, and futures - capitalizing on geopolitical tensions through sector rotation and momentum
              </ProductDescription>
              <ProductStats>
                <StatRow>
                  <StatLabel>P&L</StatLabel>
                  <StatValue $positive={equitiesPnL >= 0}>
                    {equitiesPnL >= 0 ? '+' : ''}${equitiesPnL.toLocaleString()}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Active Positions</StatLabel>
                  <StatValue>{equitiesPositions}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Allocated</StatLabel>
                  <StatValue>${equitiesAllocated.toLocaleString()}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Return</StatLabel>
                  <StatValue $positive={equitiesPnL >= 0}>
                    {equitiesPnL >= 0 ? '+' : ''}{((equitiesPnL / equitiesAllocated) * 100).toFixed(2)}%
                  </StatValue>
                </StatRow>
              </ProductStats>
              <ViewButton $color="#0066cc">View Dashboard</ViewButton>
            </ProductCard>
          </Link>

          <Link href="/analytics/risk" style={{ textDecoration: 'none' }}>
            <ProductCard $color="#9333ea">
              <ProductIcon>⚡</ProductIcon>
              <ProductTitle $color="#9333ea">Risk Analytics</ProductTitle>
              <ProductDescription>
                Portfolio-level quantitative analysis - Sharpe ratios, drawdowns, factor exposure, and market divergence indicators
              </ProductDescription>
              <ProductStats>
                <StatRow>
                  <StatLabel>Sharpe Ratio</StatLabel>
                  <StatValue $highlight>1.89</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Max Drawdown</StatLabel>
                  <StatValue>-8.2%</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Portfolio Beta</StatLabel>
                  <StatValue $highlight>0.43</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Risk Score</StatLabel>
                  <StatValue $highlight>72/100</StatValue>
                </StatRow>
              </ProductStats>
              <ViewButton $color="#9333ea">View Dashboard</ViewButton>
            </ProductCard>
          </Link>
        </ProductGrid>
      </ContentContainer>
    </PageContainer>
  );
}
