import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import NotificationBar from '../components/NotificationBar';
import ExecutiveSummary from '../components/tabs/ExecutiveSummary';
import Portfolio from '../components/tabs/Portfolio';
import NewsFeed from '../components/tabs/NewsFeed';
import MarketDivergence from '../components/tabs/MarketDivergence';
import ModelFactors from '../components/tabs/ModelFactors';
import Analytics from '../components/tabs/Analytics';

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
  kalshi: number | null;
  divergence: number | null;
  edge: 'STRONG BUY' | 'BUY' | 'SELL' | 'STRONG SELL' | 'FAIR' | 'NO_MARKET';
  confidence: number;
  reasoning: string;
  suggestedTrade: string;
  expectedValue: string;
  riskNote?: string;
  marketUrl?: string | null;
}

interface Notification {
  id: number;
  time: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  title: string;
  message: string;
  acknowledged: boolean;
}

const DashboardContainer = styled.div`
  display: flex;
  gap: 30px;
  position: relative;
`;

const SideNav = styled.nav`
  position: sticky;
  top: 20px;
  width: 220px;
  height: fit-content;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const SideNavTitle = styled.div`
  color: #ff6b00;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
`;

const SideNavLink = styled.a<{ $active?: boolean }>`
  display: block;
  color: ${props => props.$active ? '#ff6b00' : '#888'};
  text-decoration: none;
  padding: 10px 12px;
  font-size: 0.9rem;
  border-left: 3px solid ${props => props.$active ? '#ff6b00' : 'transparent'};
  margin-left: -20px;
  padding-left: 17px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    color: #fff;
    background: rgba(255, 107, 0, 0.1);
    border-left-color: #ff6b00;
  }
`;

const MainContent = styled.div`
  flex: 1;
  max-width: 1400px;
`;

const Section = styled.section`
  scroll-margin-top: 20px;
  margin-bottom: 60px;
`;

const SectionHeader = styled.h2`
  color: #ff6b00;
  font-size: 1.8rem;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #333;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
`;

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('executive');
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [marketData, setMarketData] = useState<Divergence[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Intersection Observer to track active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  async function fetchAllData() {
    setLoading(true);
    try {
      const [news, markets] = await Promise.all([
        fetch('/api/news/feed').then(r => r.json()),
        fetch('/api/markets/divergence').then(r => r.json())
      ]);

      if (news.success) setNewsData(news.data);
      if (markets.success) setMarketData(markets.data);

      // Generate notifications from critical news
      const criticalNews = news.data?.filter((n: NewsArticle) => n.priority === 'CRITICAL') || [];
      const newNotifications: Notification[] = criticalNews.slice(0, 3).map((item: NewsArticle, idx: number) => ({
        id: Date.now() + idx,
        time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        level: 'CRITICAL' as const,
        type: 'NEWS',
        title: item.headline,
        message: `Source: ${item.source} | Region: ${item.region}`,
        acknowledged: false
      }));

      // Add market divergence notifications
      const strongSignals = markets.data?.filter((m: Divergence) => m.edge === 'STRONG BUY' || m.edge === 'STRONG SELL') || [];
      const marketNotifications: Notification[] = strongSignals.slice(0, 2).map((item: Divergence, idx: number) => ({
        id: Date.now() + 1000 + idx,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        level: 'HIGH' as const,
        type: 'MARKET',
        title: `${item.edge}: ${item.scenario}`,
        message: `Model: ${item.ourModel}% | Market: ${item.polymarket?.toFixed(0)}% | Edge: ${item.divergence?.toFixed(0)}%`,
        acknowledged: false
      }));

      setNotifications(prev => [
        ...newNotifications,
        ...marketNotifications,
        ...prev.filter(n => n.acknowledged)
      ].slice(0, 10));

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const acknowledgeNotification = (id: number) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, acknowledged: true } : n
    ));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout>
      <NotificationBar
        notifications={notifications}
        onAcknowledge={acknowledgeNotification}
      />

      <DashboardContainer>
        <SideNav>
          <SideNavTitle>Quick Navigation</SideNavTitle>
          <SideNavLink
            $active={activeSection === 'executive'}
            onClick={() => scrollToSection('executive')}
          >
            Executive Summary
          </SideNavLink>
          <SideNavLink
            $active={activeSection === 'portfolio'}
            onClick={() => scrollToSection('portfolio')}
          >
            Live Portfolio
          </SideNavLink>
          <SideNavLink
            $active={activeSection === 'markets'}
            onClick={() => scrollToSection('markets')}
          >
            Market Divergences
          </SideNavLink>
          <SideNavLink
            $active={activeSection === 'news'}
            onClick={() => scrollToSection('news')}
          >
            Live Intelligence
          </SideNavLink>
          <SideNavLink
            $active={activeSection === 'model'}
            onClick={() => scrollToSection('model')}
          >
            Risk Model
          </SideNavLink>
          <SideNavLink
            $active={activeSection === 'analytics'}
            onClick={() => scrollToSection('analytics')}
          >
            Performance
          </SideNavLink>
        </SideNav>

        <MainContent>
          <Section id="executive">
            <ExecutiveSummary
              news={newsData}
              markets={marketData}
            />
          </Section>

          <Section id="portfolio">
            <SectionHeader>Live Portfolio</SectionHeader>
            <Portfolio />
          </Section>

          <Section id="markets">
            <SectionHeader>Market Divergences</SectionHeader>
            <MarketDivergence
              data={marketData}
              loading={loading}
            />
          </Section>

          <Section id="news">
            <SectionHeader>Live Intelligence Feed</SectionHeader>
            <NewsFeed
              data={newsData}
              loading={loading}
            />
          </Section>

          <Section id="model">
            <SectionHeader>Geopolitical Risk Model</SectionHeader>
            <ModelFactors />
          </Section>

          <Section id="analytics">
            <SectionHeader>Performance Analytics</SectionHeader>
            <Analytics />
          </Section>
        </MainContent>
      </DashboardContainer>
    </Layout>
  );
}
