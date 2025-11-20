import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts';

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

const SectionCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  color: #0066cc;
  font-size: 1.3rem;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
`;

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const StatBox = styled.div`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 15px;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const StatValue = styled.div<{ $color?: string }>`
  color: ${props => props.$color || '#fff'};
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
`;

const PerformanceComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PerformanceCard = styled.div<{ $borderColor: string }>`
  background: #0a0a0a;
  border: 2px solid ${props => props.$borderColor};
  border-radius: 8px;
  padding: 20px;
`;

const PerformanceTitle = styled.div`
  color: #888;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
`;

const PerformanceValue = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 2.5rem;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  margin-bottom: 10px;
`;

const PerformanceDetail = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.6;
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

  const { metadata, positions, equityCurve, riskMetrics, tradeHistory } = data;

  const totalValue = positions.reduce((sum: number, pos: any) => sum + (pos.currentValue || 0), 0);
  const totalCost = positions.reduce((sum: number, pos: any) => sum + Math.abs(pos.costBasis || 0), 0);

  // Format equity curve data for chart
  const chartData = equityCurve?.map((point: any) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: point.date,
    Portfolio: point.portfolioValue,
    'S&P 500': point.sp500Value
  })) || [];

  // Map trades to chart data for markers - find nearest date
  const tradeMarkers = tradeHistory?.map((trade: any) => {
    const tradeDate = new Date(trade.date);

    // Find the nearest chart point (within 7 days)
    let nearestPoint = null;
    let minDiff = Infinity;

    chartData.forEach((point: any) => {
      const pointDate = new Date(point.fullDate);
      const diff = Math.abs(pointDate.getTime() - tradeDate.getTime());
      const daysDiff = diff / (1000 * 60 * 60 * 24);

      if (daysDiff <= 7 && diff < minDiff) {
        minDiff = diff;
        nearestPoint = point;
      }
    });

    return nearestPoint ? {
      date: nearestPoint.date,
      value: nearestPoint.Portfolio,
      type: trade.type,
      symbol: trade.symbol,
      reasoning: trade.reasoning,
      tradeDate: new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } : null;
  }).filter((marker: any) => marker !== null) || [];

  console.log('Trade markers:', tradeMarkers.length, 'out of', tradeHistory?.length || 0, 'trades');

  // Calculate performance metrics
  const portfolioReturn = equityCurve && equityCurve.length > 0
    ? ((equityCurve[equityCurve.length - 1].portfolioValue - equityCurve[0].portfolioValue) / equityCurve[0].portfolioValue * 100).toFixed(2)
    : '0.00';
  const sp500Return = equityCurve && equityCurve.length > 0
    ? ((equityCurve[equityCurve.length - 1].sp500Value - equityCurve[0].sp500Value) / equityCurve[0].sp500Value * 100).toFixed(2)
    : '0.00';

  // Calculate Sharpe Ratio (assuming 5% risk-free rate)
  const returns = equityCurve?.map((point: any, idx: number, arr: any[]) => {
    if (idx === 0) return 0;
    return ((point.portfolioValue - arr[idx - 1].portfolioValue) / arr[idx - 1].portfolioValue) * 100;
  }).filter((_: any, idx: number) => idx > 0) || [];

  const avgReturn = returns.length > 0 ? returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((sum: number, r: number) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const annualizedReturn = avgReturn * 252; // Assuming daily returns
  const annualizedStdDev = stdDev * Math.sqrt(252);
  const sharpeRatio = annualizedStdDev > 0 ? ((annualizedReturn - 5) / annualizedStdDev).toFixed(2) : '0.00';

  // Calculate Max Drawdown
  let maxDrawdown = 0;
  let peak = equityCurve && equityCurve.length > 0 ? equityCurve[0].portfolioValue : 0;
  equityCurve?.forEach((point: any) => {
    if (point.portfolioValue > peak) {
      peak = point.portfolioValue;
    }
    const drawdown = ((point.portfolioValue - peak) / peak) * 100;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  // S&P 500 Sharpe Ratio
  const sp500Returns = equityCurve?.map((point: any, idx: number, arr: any[]) => {
    if (idx === 0) return 0;
    return ((point.sp500Value - arr[idx - 1].sp500Value) / arr[idx - 1].sp500Value) * 100;
  }).filter((_: any, idx: number) => idx > 0) || [];

  const sp500AvgReturn = sp500Returns.length > 0 ? sp500Returns.reduce((sum: number, r: number) => sum + r, 0) / sp500Returns.length : 0;
  const sp500Variance = sp500Returns.length > 0 ? sp500Returns.reduce((sum: number, r: number) => sum + Math.pow(r - sp500AvgReturn, 2), 0) / sp500Returns.length : 0;
  const sp500StdDev = Math.sqrt(sp500Variance);
  const sp500AnnualizedReturn = sp500AvgReturn * 252;
  const sp500AnnualizedStdDev = sp500StdDev * Math.sqrt(252);
  const sp500SharpeRatio = sp500AnnualizedStdDev > 0 ? ((sp500AnnualizedReturn - 5) / sp500AnnualizedStdDev).toFixed(2) : '0.00';

  // S&P 500 Max Drawdown
  let sp500MaxDrawdown = 0;
  let sp500Peak = equityCurve && equityCurve.length > 0 ? equityCurve[0].sp500Value : 0;
  equityCurve?.forEach((point: any) => {
    if (point.sp500Value > sp500Peak) {
      sp500Peak = point.sp500Value;
    }
    const drawdown = ((point.sp500Value - sp500Peak) / sp500Peak) * 100;
    if (drawdown < sp500MaxDrawdown) {
      sp500MaxDrawdown = drawdown;
    }
  });

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

      <SectionCard>
        <SectionTitle>Equity Curve: Portfolio vs S&P 500</SectionTitle>
        <PerformanceComparison>
          <PerformanceCard $borderColor="#0066cc">
            <PerformanceTitle>Portfolio Performance</PerformanceTitle>
            <PerformanceValue $color={parseFloat(portfolioReturn) >= 0 ? '#00c853' : '#ff0000'}>
              {parseFloat(portfolioReturn) >= 0 ? '+' : ''}{portfolioReturn}%
            </PerformanceValue>
            <PerformanceDetail>
              Total return since inception<br/>
              Sharpe Ratio: {sharpeRatio}<br/>
              Max Drawdown: {maxDrawdown.toFixed(2)}%
            </PerformanceDetail>
          </PerformanceCard>

          <PerformanceCard $borderColor="#888">
            <PerformanceTitle>S&P 500 Benchmark</PerformanceTitle>
            <PerformanceValue $color={parseFloat(sp500Return) >= 0 ? '#00c853' : '#ff0000'}>
              {parseFloat(sp500Return) >= 0 ? '+' : ''}{sp500Return}%
            </PerformanceValue>
            <PerformanceDetail>
              Total return since inception<br/>
              Sharpe Ratio: {sp500SharpeRatio}<br/>
              Max Drawdown: {sp500MaxDrawdown.toFixed(2)}%
            </PerformanceDetail>
          </PerformanceCard>
        </PerformanceComparison>

        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="date"
                stroke="#888"
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <YAxis
                stroke="#888"
                tick={{ fill: '#888', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="Portfolio"
                stroke="#0066cc"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="S&P 500"
                stroke="#888"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />

              {/* Trade markers */}
              {tradeMarkers.map((marker: any, idx: number) => {
                const isSell = marker.type === 'SELL' || marker.type === 'SELL_SHORT';
                return (
                  <ReferenceLine
                    key={`trade-${idx}`}
                    x={marker.date}
                    stroke={isSell ? '#ff0000' : '#00c853'}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{
                      value: `${isSell ? '▼' : '▲'} ${marker.symbol}`,
                      position: isSell ? 'bottom' : 'top',
                      fill: isSell ? '#ff0000' : '#00c853',
                      fontSize: 12,
                      fontWeight: 'bold',
                      offset: 10
                    }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Risk & Performance Metrics</SectionTitle>
        <StatsGrid>
          <StatBox>
            <StatLabel>Profit Factor</StatLabel>
            <StatValue $color={riskMetrics?.profitFactor >= 1 ? '#00c853' : '#ff0000'}>
              {riskMetrics?.profitFactor?.toFixed(2) || '0.00'}
            </StatValue>
          </StatBox>

          <StatBox>
            <StatLabel>Deployment Ratio</StatLabel>
            <StatValue $color="#0066cc">
              {riskMetrics?.deploymentRatio?.toFixed(1) || '0.0'}%
            </StatValue>
          </StatBox>

          <StatBox>
            <StatLabel>Long/Short Ratio</StatLabel>
            <StatValue $color="#fff">
              {riskMetrics?.longShortRatio?.toFixed(2) || '0.00'}
            </StatValue>
          </StatBox>

          <StatBox>
            <StatLabel>Best Position</StatLabel>
            <StatValue $color="#00c853">
              {riskMetrics?.bestPosition?.symbol || 'N/A'}
            </StatValue>
            <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '5px' }}>
              {riskMetrics?.bestPosition ? `+${riskMetrics.bestPosition.unrealizedPnLPercent.toFixed(2)}%` : ''}
            </div>
          </StatBox>

          <StatBox>
            <StatLabel>Worst Position</StatLabel>
            <StatValue $color="#ff0000">
              {riskMetrics?.worstPosition?.symbol || 'N/A'}
            </StatValue>
            <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '5px' }}>
              {riskMetrics?.worstPosition ? `${riskMetrics.worstPosition.unrealizedPnLPercent.toFixed(2)}%` : ''}
            </div>
          </StatBox>

          {riskMetrics?.sectorExposure && Object.keys(riskMetrics.sectorExposure).map((sector: string) => (
            <StatBox key={sector}>
              <StatLabel>{sector} Exposure</StatLabel>
              <StatValue $color="#0066cc">
                {riskMetrics.sectorExposure[sector].toFixed(1)}%
              </StatValue>
            </StatBox>
          ))}
        </StatsGrid>
      </SectionCard>

      {/* Trade History Section */}
      {tradeHistory && tradeHistory.length > 0 && (
        <SectionCard>
          <SectionTitle>Trade History ({tradeHistory.length} trades)</SectionTitle>
          <PositionsTable>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Value</th>
                <th>P&L</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {tradeHistory.slice().reverse().map((trade: any) => (
                <tr key={trade.id}>
                  <td>{new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>
                    <span style={{
                      color: trade.type === 'BUY' ? '#00c853' : trade.type === 'SELL' || trade.type === 'SELL_SHORT' ? '#ff0000' : '#ff9800',
                      fontWeight: 600
                    }}>
                      {trade.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'Courier New' }}>{trade.symbol}</td>
                  <td>{trade.shares || trade.contracts || '-'}</td>
                  <td>${trade.price?.toFixed(2) || '-'}</td>
                  <td>${trade.value?.toLocaleString() || '-'}</td>
                  <td style={{
                    color: trade.realizedPnL ? (trade.realizedPnL > 0 ? '#00c853' : '#ff0000') : '#888',
                    fontWeight: trade.realizedPnL ? 600 : 400
                  }}>
                    {trade.realizedPnL ? `${trade.realizedPnL > 0 ? '+' : ''}$${trade.realizedPnL}` : '-'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#aaa' }}>{trade.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </PositionsTable>
        </SectionCard>
      )}
    </Container>
  );
}
