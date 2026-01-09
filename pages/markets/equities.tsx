import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navigation from '../../components/Navigation';
import EquitiesPortfolio from '../../components/tabs/EquitiesPortfolio';
import TradeNotifications from '../../components/TradeNotifications';

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
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fetch equities portfolio data for P&L and trade history
    fetch('/api/portfolio/equities')
      .then(r => r.json())
      .then(portfolio => {
        if (portfolio.success && portfolio.data) {
          setTradeHistory(portfolio.data.tradeHistory || []);
        }
      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);

  return (
    <PageContainer>
      <Navigation />
      <TradeNotifications equitiesTrades={tradeHistory} />

      <ContentContainer>
        <Header>
          <PageTitle>Tactical Equities Dashboard</PageTitle>
          <PageSubtitle>
            Defense & Energy stocks, ETFs, and futures - capitalizing on geopolitical tensions through sector rotation
          </PageSubtitle>
        </Header>

        <EquitiesPortfolio />
      </ContentContainer>
    </PageContainer>
  );
}
