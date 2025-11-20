import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Trade {
  id: string;
  date: string;
  type: string;
  symbol: string;
  shares?: number;
  contracts?: number;
  price: number;
  value: number;
  reasoning: string;
  portfolio: 'EQUITIES' | 'EVENTS';
}

interface TradeNotificationsProps {
  equitiesTrades?: any[];
  eventsTrades?: any[];
}

const NotificationContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    top: 70px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const NotificationCard = styled.div<{ $type: string }>`
  background: rgba(10, 10, 10, 0.98);
  border: 1px solid ${props =>
    props.$type === 'BUY' ? '#00c853' :
    props.$type === 'SELL' || props.$type === 'SELL_SHORT' ? '#ff0000' :
    '#ff9800'
  };
  border-left: 4px solid ${props =>
    props.$type === 'BUY' ? '#00c853' :
    props.$type === 'SELL' || props.$type === 'SELL_SHORT' ? '#ff0000' :
    '#ff9800'
  };
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.div<{ $type: string }>`
  color: ${props =>
    props.$type === 'BUY' ? '#00c853' :
    props.$type === 'SELL' || props.$type === 'SELL_SHORT' ? '#ff0000' :
    '#ff9800'
  };
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NotificationTime = styled.div`
  color: #888;
  font-size: 0.75rem;
`;

const NotificationDetails = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  margin-bottom: 8px;
`;

const DetailLabel = styled.span`
  color: #888;
  font-size: 0.85rem;
`;

const DetailValue = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
`;

const NotificationReasoning = styled.div`
  color: #aaa;
  font-size: 0.8rem;
  line-height: 1.4;
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #333;
`;

const PortfolioBadge = styled.span<{ $portfolio: string }>`
  background: ${props => props.$portfolio === 'EQUITIES' ? '#0066cc' : '#ff6b00'};
  color: #000;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

export default function TradeNotifications({ equitiesTrades, eventsTrades }: TradeNotificationsProps) {
  const [visibleTrades, setVisibleTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentTrades: Trade[] = [];

    // Check equities trades
    if (equitiesTrades && equitiesTrades.length > 0) {
      equitiesTrades.forEach(trade => {
        const tradeDate = new Date(trade.date);
        if (tradeDate >= last24Hours) {
          recentTrades.push({
            ...trade,
            portfolio: 'EQUITIES'
          });
        }
      });
    }

    // Check events trades
    if (eventsTrades && eventsTrades.length > 0) {
      eventsTrades.forEach(trade => {
        const tradeDate = new Date(trade.date);
        if (tradeDate >= last24Hours) {
          recentTrades.push({
            ...trade,
            portfolio: 'EVENTS'
          });
        }
      });
    }

    // Sort by date (most recent first)
    recentTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Only show top 3 most recent
    setVisibleTrades(recentTrades.slice(0, 3));
  }, [equitiesTrades, eventsTrades]);

  const dismissTrade = (tradeId: string) => {
    setVisibleTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const tradeDate = new Date(dateString);
    const diffMs = now.getTime() - tradeDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (visibleTrades.length === 0) {
    return null;
  }

  return (
    <NotificationContainer>
      {visibleTrades.map(trade => (
        <NotificationCard key={trade.id} $type={trade.type}>
          <NotificationHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NotificationTitle $type={trade.type}>
                {trade.type} {trade.symbol}
              </NotificationTitle>
              <PortfolioBadge $portfolio={trade.portfolio}>
                {trade.portfolio}
              </PortfolioBadge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <NotificationTime>{getTimeAgo(trade.date)}</NotificationTime>
              <CloseButton onClick={() => dismissTrade(trade.id)}>×</CloseButton>
            </div>
          </NotificationHeader>

          <NotificationDetails>
            <DetailLabel>Quantity:</DetailLabel>
            <DetailValue>{trade.shares || trade.contracts || '-'}</DetailValue>

            <DetailLabel>Price:</DetailLabel>
            <DetailValue>${trade.price?.toFixed(2)}</DetailValue>

            <DetailLabel>Value:</DetailLabel>
            <DetailValue>${trade.value?.toLocaleString()}</DetailValue>
          </NotificationDetails>

          <NotificationReasoning>
            {trade.reasoning}
          </NotificationReasoning>
        </NotificationCard>
      ))}
    </NotificationContainer>
  );
}
