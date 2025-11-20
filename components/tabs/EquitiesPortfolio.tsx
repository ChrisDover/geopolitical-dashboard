import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 0;
  max-width: 100%;
`;

const Header = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
`;

const Title = styled.h2`
  color: #0066cc;
  font-size: 1.5rem;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #aaa;
  font-size: 0.95rem;
  margin: 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div<{ $borderColor: string }>`
  background: #1a1a1a;
  border: 2px solid ${props => props.$borderColor};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px ${props => `${props.$borderColor}33`};
`;

const MetricLabel = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 2.5rem;
  font-weight: 800;
  font-family: 'Courier New', monospace;
`;

const PositionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.th`
  background: #0a0a0a;
  color: #0066cc;
  padding: 15px 12px;
  text-align: left;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #333;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #222;

  &:hover {
    background: #222;
  }
`;

const TableCell = styled.td`
  padding: 15px 12px;
  color: #ccc;
  font-size: 0.9rem;
`;

const PnLCell = styled(TableCell)<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#00c853' : '#ff0000'};
  font-weight: 700;
  font-family: 'Courier New', monospace;
`;

const TypeBadge = styled.span<{ $type: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props =>
    props.$type === 'EQUITY' ? 'rgba(0, 102, 204, 0.2)' :
    props.$type === 'ETF' ? 'rgba(138, 43, 226, 0.2)' :
    'rgba(255, 165, 0, 0.2)'
  };
  color: ${props =>
    props.$type === 'EQUITY' ? '#0066cc' :
    props.$type === 'ETF' ? '#8a2be2' :
    '#ffa500'
  };
  border: 1px solid ${props =>
    props.$type === 'EQUITY' ? '#0066cc' :
    props.$type === 'ETF' ? '#8a2be2' :
    '#ffa500'
  };
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #888;
`;

export default function EquitiesPortfolio() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquitiesData();
    const interval = setInterval(fetchEquitiesData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchEquitiesData() {
    try {
      const response = await fetch('/api/portfolio/equities');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load equities portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingContainer>
        <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Loading equities portfolio...</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>Fetching live stock prices from AlphaVantage</div>
      </LoadingContainer>
    );
  }

  if (!data) {
    return (
      <LoadingContainer>
        <div style={{ fontSize: '1.1rem', color: '#ff0000' }}>No equities data available</div>
      </LoadingContainer>
    );
  }

  const { metadata, positions } = data;

  const totalValue = positions.reduce((sum: number, pos: any) => sum + (pos.currentValue || 0), 0);
  const totalCost = positions.reduce((sum: number, pos: any) => sum + Math.abs(pos.costBasis || 0), 0);

  return (
    <Container>
      <Header>
        <Title>Defense & Energy Portfolio</Title>
        <Subtitle>
          Live positions in defense contractors, energy stocks, and futures - updated via AlphaVantage API
        </Subtitle>
      </Header>

      <MetricsGrid>
        <MetricCard $borderColor={metadata.unrealizedPnL >= 0 ? '#00c853' : '#ff0000'}>
          <MetricLabel>Unrealized P&L</MetricLabel>
          <MetricValue $color={metadata.unrealizedPnL >= 0 ? '#00c853' : '#ff0000'}>
            {metadata.unrealizedPnL >= 0 ? '+' : ''}${metadata.unrealizedPnL?.toLocaleString() || '0'}
          </MetricValue>
        </MetricCard>

        <MetricCard $borderColor="#0066cc">
          <MetricLabel>Deployed Capital</MetricLabel>
          <MetricValue $color="#fff">
            ${metadata.deployedCapital?.toLocaleString() || '0'}
          </MetricValue>
        </MetricCard>

        <MetricCard $borderColor="#0066cc">
          <MetricLabel>Total Positions</MetricLabel>
          <MetricValue $color="#fff">
            {positions.length}
          </MetricValue>
        </MetricCard>

        <MetricCard $borderColor="#0066cc">
          <MetricLabel>Return %</MetricLabel>
          <MetricValue $color={metadata.unrealizedPnL >= 0 ? '#00c853' : '#ff0000'}>
            {metadata.unrealizedPnL >= 0 ? '+' : ''}{((metadata.unrealizedPnL / totalCost) * 100).toFixed(2)}%
          </MetricValue>
        </MetricCard>
      </MetricsGrid>

      <PositionsTable>
        <thead>
          <tr>
            <TableHeader>Symbol</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Shares/Contracts</TableHeader>
            <TableHeader>Entry Price</TableHeader>
            <TableHeader>Current Price</TableHeader>
            <TableHeader>Cost Basis</TableHeader>
            <TableHeader>Current Value</TableHeader>
            <TableHeader>Unrealized P&L</TableHeader>
            <TableHeader>Return %</TableHeader>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos: any) => (
            <TableRow key={pos.symbol}>
              <TableCell style={{ fontWeight: 600, color: '#fff' }}>{pos.symbol}</TableCell>
              <TableCell>
                <TypeBadge $type={pos.type}>{pos.type}</TypeBadge>
              </TableCell>
              <TableCell>{(pos.shares || pos.contracts || 0).toLocaleString()}</TableCell>
              <TableCell>${pos.entryPrice.toFixed(2)}</TableCell>
              <TableCell>${pos.currentPrice.toFixed(2)}</TableCell>
              <TableCell>${Math.abs(pos.costBasis).toLocaleString()}</TableCell>
              <TableCell>${pos.currentValue.toLocaleString()}</TableCell>
              <PnLCell $positive={pos.unrealizedPnL >= 0}>
                {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toLocaleString()}
              </PnLCell>
              <PnLCell $positive={pos.unrealizedPnLPercent >= 0}>
                {pos.unrealizedPnLPercent >= 0 ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
              </PnLCell>
            </TableRow>
          ))}
        </tbody>
      </PositionsTable>
    </Container>
  );
}
