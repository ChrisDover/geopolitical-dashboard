import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navigation from '../../components/Navigation';
import ExecutiveSummary from '../../components/tabs/ExecutiveSummary';

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
  color: #0066cc;
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

export default function EquitiesPage() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [totalPnL, setTotalPnL] = useState(0);

  useEffect(() => {
    // Fetch portfolio data, news and market data
    Promise.all([
      fetch('/api/portfolio/equities').then(r => r.json()),
      fetch('/api/news/feed?limit=10').then(r => r.json()),
      fetch('/api/markets/divergence').then(r => r.json())
    ])
      .then(([portfolio, news, markets]) => {
        if (portfolio.success && portfolio.data) {
          setTotalPnL(portfolio.data.metadata.unrealizedPnL || 0);
        }
        if (news.success) setNewsData(news.data);
        if (markets.success) setMarketData(markets.data);
      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);

  return (
    <PageContainer>
      <Navigation totalPnL={totalPnL} />

      <ContentContainer>
        <Header>
          <PageTitle>Tactical Equities Dashboard</PageTitle>
          <PageSubtitle>
            Defense & Energy stocks, ETFs, and futures - capitalizing on geopolitical tensions through sector rotation
          </PageSubtitle>
        </Header>

        <ExecutiveSummary news={newsData} markets={marketData} />
      </ContentContainer>
    </PageContainer>
  );
}
