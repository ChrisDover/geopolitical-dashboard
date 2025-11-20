import React, { useState } from 'react';
import styled from 'styled-components';
import Navigation from '../../components/Navigation';
import Portfolio from '../../components/tabs/Portfolio';
import NewsFeed from '../../components/tabs/NewsFeed';
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
  color: #ff6b00;
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

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div``;

export default function EventsPage() {
  const [newsData, setNewsData] = useState<any>({ data: [], loading: true });
  const [marketData, setMarketData] = useState<any[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [totalPnL, setTotalPnL] = useState(0);

  React.useEffect(() => {
    // Fetch portfolio data for P&L
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTotalPnL(data.data.metadata.unrealizedPnL || 0);
        }
      })
      .catch(err => console.error('Portfolio data error:', err));

    // Fetch news feed
    fetch('/api/news/feed?limit=20')
      .then(res => res.json())
      .then(data => setNewsData({ data: data.data || [], loading: false }))
      .catch(() => setNewsData({ data: [], loading: false }));

    // Fetch market divergence data
    fetch('/api/markets/divergence')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMarketData(data.data);
        }
        setMarketLoading(false);
      })
      .catch(err => {
        console.error('Market data error:', err);
        setMarketLoading(false);
      });
  }, []);

  return (
    <PageContainer>
      <Navigation totalPnL={totalPnL} />

      <ContentContainer>
        <Header>
          <PageTitle>Event Markets Dashboard</PageTitle>
          <PageSubtitle>
            Prediction markets tracking geopolitical events - Polymarket & Kalshi contracts with real-time probabilities
          </PageSubtitle>
        </Header>

        <GridLayout>
          <Section>
            <Portfolio />
          </Section>
          <Section>
            <NewsFeed data={newsData.data} loading={newsData.loading} />
          </Section>
        </GridLayout>

        <Section>
          <MarketDivergence data={marketData} loading={marketLoading} />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
