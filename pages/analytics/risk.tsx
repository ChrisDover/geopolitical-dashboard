import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navigation from '../../components/Navigation';
import Analytics from '../../components/tabs/Analytics';
import ModelFactors from '../../components/tabs/ModelFactors';
import MarketDivergence from '../../components/tabs/MarketDivergence';

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

const PageTitle = styled.h1`
  color: #9333ea;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const PageSubtitle = styled.p`
  color: #aaa;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export default function RiskPage() {
  const [totalPnL, setTotalPnL] = useState(0);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both portfolios and market data
    Promise.all([
      fetch('/api/portfolio').then(r => r.json()),
      fetch('/api/portfolio/equities').then(r => r.json()),
      fetch('/api/markets/divergence').then(r => r.json())
    ])
      .then(([eventsPortfolio, equitiesPortfolio, markets]) => {
        // Calculate combined P&L from both portfolios
        const eventsPnL = eventsPortfolio.success && eventsPortfolio.data ?
          eventsPortfolio.data.metadata.unrealizedPnL : 0;
        const equitiesPnL = equitiesPortfolio.success && equitiesPortfolio.data ?
          equitiesPortfolio.data.metadata.unrealizedPnL : 0;

        setTotalPnL(eventsPnL + equitiesPnL);

        if (markets.success) {
          setMarketData(markets.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Data fetch error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <PageContainer>
      <Navigation totalPnL={totalPnL} />

      <ContentContainer>
        <Header>
          <PageTitle>Risk Analytics Dashboard</PageTitle>
          <PageSubtitle>
            Portfolio-level quantitative analysis - Sharpe ratios, drawdowns, factor exposure, and market divergence indicators
          </PageSubtitle>
        </Header>

        <Section>
          <Analytics />
        </Section>

        <Section>
          <ModelFactors />
        </Section>

        <Section>
          <MarketDivergence data={marketData} loading={loading} />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
