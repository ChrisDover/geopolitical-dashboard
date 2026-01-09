import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import NotificationBar from '../components/NotificationBar';
import EnterpriseImpactSnapshot from '../components/EnterpriseImpactSnapshot';
import RiskStory from '../components/RiskStory';
import { ViewMode } from '../components/ModeToggle';

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
  font-size: 1.125rem; /* 18px - increased from 0.9rem (14.4px) */
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


export default function OverviewPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('CEO');

  const [enterpriseImpacts, setEnterpriseImpacts] = useState<any[]>([]);
  const [riskShifts, setRiskShifts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch notifications and analysis data
    Promise.all([
      fetch('/api/news/feed?limit=5').then(r => r.json()),
      fetch('/api/analysis/overview').then(r => r.json()).catch(() => ({ success: false, data: null }))
    ])
      .then(([news, analysis]) => {
        const criticalNews = news.data?.filter((n: any) => n.priority === 'CRITICAL') || [];
        const newNotifications: Notification[] = criticalNews.slice(0, 3).map((item: any, idx: number) => ({
          id: Date.now() + idx,
          time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          level: 'CRITICAL' as const,
          type: 'NEWS',
          title: item.headline,
          message: `Source: ${item.source} | Region: ${item.region}`,
          acknowledged: false
        }));

        setNotifications(newNotifications);

        // Fetch enterprise impact and risk story data
        if (analysis.success && analysis.data) {
          setEnterpriseImpacts(analysis.data.impacts || []);
          setRiskShifts(analysis.data.riskShifts || []);
        }
      })
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);

  const acknowledgeNotification = (id: number) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, acknowledged: true } : n
    ));
  };

  // Use API data, fallback to empty arrays if not loaded yet
  const displayImpacts = enterpriseImpacts.length > 0 ? enterpriseImpacts : [];
  const displayRiskShifts = riskShifts.length > 0 ? riskShifts : [];

  return (
    <PageContainer>
      <Navigation 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <NotificationBar
        notifications={notifications}
        onAcknowledge={acknowledgeNotification}
      />

      <ContentContainer>
        {/* Enterprise Impact Snapshot - NEW */}
        {displayImpacts.length > 0 && (
          <EnterpriseImpactSnapshot mode={viewMode} impacts={displayImpacts} />
        )}

        {/* 24-72h Risk Story - NEW */}
        {displayRiskShifts.length > 0 && (
          <RiskStory shifts={displayRiskShifts} />
        )}
      </ContentContainer>
    </PageContainer>
  );
}
