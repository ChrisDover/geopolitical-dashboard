import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  color: #ff6b00;
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

const MetricValue = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
  color: #888;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SectionCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.2rem;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
`;

const AlertBanner = styled.div<{ $type: string }>`
  background: ${props =>
    props.$type === 'STOP_LOSS' ? '#ff0000' :
    props.$type === 'TAKE_PROFIT' ? '#00ff00' :
    '#ff6b00'
  };
  color: #000;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PositionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background: #0a0a0a;
  color: #ff6b00;
  padding: 12px;
  text-align: left;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #333;
`;

const TableRow = styled.tr<{ $highlight?: boolean }>`
  border-bottom: 1px solid #333;
  background: ${props => props.$highlight ? 'rgba(255, 107, 0, 0.15)' : 'transparent'};
  border-left: 4px solid ${props => props.$highlight ? '#ff6b00' : 'transparent'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: ${props => props.$highlight ? 'rgba(255, 107, 0, 0.2)' : '#242424'};
    border-left-color: ${props => props.$highlight ? '#ff6b00' : '#888'};
  }

  &:active {
    background: rgba(255, 107, 0, 0.25);
  }
`;

const TableCell = styled.td`
  padding: 12px;
  color: #ccc;
  font-size: 0.9rem;
`;

const ExpandIconCell = styled(TableCell)`
  color: #ff6b00;
  font-weight: 700;
  width: 40px;
  text-align: center;
  font-size: 1.2rem;
`;

const PnLCell = styled(TableCell)<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#00ff00' : '#ff0000'};
  font-weight: 700;
`;

const SideBadge = styled.span<{ $side: string }>`
  background: ${props => props.$side === 'YES' ? '#00ff00' : '#ff6b00'};
  color: #000;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const TripWireCard = styled.div<{ $status: string }>`
  background: #0a0a0a;
  border-left: 4px solid ${props =>
    props.$status === 'TRIGGERED' ? '#ff0000' :
    props.$status === 'ACTIVE' ? '#00ff00' :
    '#888'
  };
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 12px;
`;

const TripWireHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TripWireTitle = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
`;

const TripWireStatus = styled.span<{ $status: string }>`
  background: ${props =>
    props.$status === 'TRIGGERED' ? '#ff0000' :
    props.$status === 'ACTIVE' ? '#00ff00' :
    '#888'
  };
  color: #000;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const TripWireDetail = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 6px;
`;

const GamePlanCard = styled.div`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
`;

const GamePlanTitle = styled.h4`
  color: #ff6b00;
  font-size: 1.1rem;
  margin: 0 0 15px 0;
  font-weight: 700;
`;

const GamePlanSection = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const GamePlanLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const GamePlanValue = styled.div`
  color: #fff;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const TriggerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
`;

const TriggerItem = styled.li`
  color: #ccc;
  font-size: 0.85rem;
  padding-left: 20px;
  margin-bottom: 4px;
  position: relative;

  &:before {
    content: ">";
    color: #ff6b00;
    position: absolute;
    left: 0;
    font-weight: 700;
  }
`;

const ActionButton = styled.button`
  background: #ff6b00;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff8c33;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #888;
`;

export default function Portfolio() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const gamePlanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Scroll to game plan when a scenario is selected
  useEffect(() => {
    if (selectedScenario && gamePlanRef.current) {
      setTimeout(() => {
        gamePlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedScenario]);

  async function fetchPortfolioData() {
    try {
      const response = await fetch('/api/portfolio');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingContainer>
        <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Loading portfolio...</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>Fetching live positions and trip wires</div>
      </LoadingContainer>
    );
  }

  if (!data) {
    return (
      <LoadingContainer>
        <div style={{ fontSize: '1.1rem', color: '#ff0000' }}>No portfolio data available</div>
      </LoadingContainer>
    );
  }

  const { metadata, positions, tripWires, gamePlans, alerts, triggeredTripWires, equityCurve } = data;

  // Format equity curve data for chart
  const chartData = equityCurve?.map((point: any) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Portfolio: point.portfolioValue,
    'S&P 500': point.sp500Value
  })) || [];

  // Calculate performance metrics
  const portfolioReturn = equityCurve && equityCurve.length > 0
    ? ((equityCurve[equityCurve.length - 1].portfolioValue - equityCurve[0].portfolioValue) / equityCurve[0].portfolioValue * 100).toFixed(2)
    : '0.00';
  const sp500Return = equityCurve && equityCurve.length > 0
    ? ((equityCurve[equityCurve.length - 1].sp500Value - equityCurve[0].sp500Value) / equityCurve[0].sp500Value * 100).toFixed(2)
    : '0.00';
  const alpha = (parseFloat(portfolioReturn) - parseFloat(sp500Return)).toFixed(2);

  return (
    <Container>
      <Header>
        <Title>Live Portfolio Management</Title>
        <Subtitle>
          Real-time position tracking with scenario game plans, trip wires, and adaptive strategies
        </Subtitle>
      </Header>

      {alerts && alerts.length > 0 && (
        <div>
          {alerts.map((alert: any, idx: number) => (
            <AlertBanner key={idx} $type={alert.action}>
              ALERT: TRIP WIRE TRIGGERED - {alert.action} - {alert.scenario} - {alert.reasoning}
            </AlertBanner>
          ))}
        </div>
      )}

      <MetricsGrid>
        <MetricCard $borderColor="#ff6b00">
          <MetricValue $color="#fff">${metadata.totalCapital.toLocaleString()}</MetricValue>
          <MetricLabel>Total Capital</MetricLabel>
        </MetricCard>

        <MetricCard $borderColor={metadata.unrealizedPnL >= 0 ? '#00ff00' : '#ff0000'}>
          <MetricValue $color={metadata.unrealizedPnL >= 0 ? '#00ff00' : '#ff0000'}>
            {metadata.unrealizedPnL >= 0 ? '+' : ''}${metadata.unrealizedPnL.toLocaleString()}
          </MetricValue>
          <MetricLabel>Unrealized P&L</MetricLabel>
        </MetricCard>

        <MetricCard $borderColor="#ffaa00">
          <MetricValue $color="#fff">${metadata.deployedCapital.toLocaleString()}</MetricValue>
          <MetricLabel>Deployed Capital ({((metadata.deployedCapital / metadata.totalCapital) * 100).toFixed(1)}%)</MetricLabel>
        </MetricCard>

        <MetricCard $borderColor="#888">
          <MetricValue $color="#fff">{metadata.totalPositions}</MetricValue>
          <MetricLabel>Open Positions</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      {equityCurve && equityCurve.length > 0 && (
        <SectionCard>
          <SectionTitle>Portfolio Performance vs S&P 500</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div>
              <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>Portfolio Return</div>
              <div style={{ color: parseFloat(portfolioReturn) >= 0 ? '#00ff00' : '#ff0000', fontSize: '1.5rem', fontWeight: '700' }}>
                {parseFloat(portfolioReturn) >= 0 ? '+' : ''}{portfolioReturn}%
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>S&P 500 Return</div>
              <div style={{ color: parseFloat(sp500Return) >= 0 ? '#00ff00' : '#ff0000', fontSize: '1.5rem', fontWeight: '700' }}>
                {parseFloat(sp500Return) >= 0 ? '+' : ''}{sp500Return}%
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>Alpha (Outperformance)</div>
              <div style={{ color: parseFloat(alpha) >= 0 ? '#00ff00' : '#ff0000', fontSize: '1.5rem', fontWeight: '700' }}>
                {parseFloat(alpha) >= 0 ? '+' : ''}{alpha}%
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="date"
                stroke="#888"
                style={{ fontSize: '0.85rem' }}
              />
              <YAxis
                stroke="#888"
                style={{ fontSize: '0.85rem' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                labelStyle={{ color: '#ff6b00' }}
              />
              <Legend
                wrapperStyle={{ color: '#fff', paddingTop: '10px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="Portfolio"
                stroke="#ff6b00"
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
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle>Active Positions</SectionTitle>
        <PositionsTable>
          <thead>
            <tr>
              <TableHeader style={{ width: '40px' }}></TableHeader>
              <TableHeader>Scenario</TableHeader>
              <TableHeader>Side</TableHeader>
              <TableHeader>Contracts</TableHeader>
              <TableHeader>Entry</TableHeader>
              <TableHeader>Current</TableHeader>
              <TableHeader>Cost Basis</TableHeader>
              <TableHeader>Current Value</TableHeader>
              <TableHeader>P&L</TableHeader>
              <TableHeader>P&L %</TableHeader>
              <TableHeader>Target/Stop</TableHeader>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos: any) => (
              <TableRow
                key={pos.id}
                $highlight={selectedScenario === pos.scenario}
                onClick={() => setSelectedScenario(selectedScenario === pos.scenario ? null : pos.scenario)}
              >
                <ExpandIconCell>
                  {selectedScenario === pos.scenario ? '▼' : '►'}
                </ExpandIconCell>
                <TableCell style={{ fontWeight: 600, color: '#fff' }}>{pos.scenario}</TableCell>
                <TableCell>
                  <SideBadge $side={pos.side}>{pos.side}</SideBadge>
                </TableCell>
                <TableCell>{pos.contracts.toLocaleString()}</TableCell>
                <TableCell>${pos.entryPrice.toFixed(2)}</TableCell>
                <TableCell>${pos.currentPrice.toFixed(2)}</TableCell>
                <TableCell>${pos.costBasis.toLocaleString()}</TableCell>
                <TableCell>${pos.currentValue.toLocaleString()}</TableCell>
                <PnLCell $positive={pos.unrealizedPnL >= 0}>
                  {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toLocaleString()}
                </PnLCell>
                <PnLCell $positive={pos.unrealizedPnLPercent >= 0}>
                  {pos.unrealizedPnLPercent >= 0 ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                </PnLCell>
                <TableCell style={{ fontSize: '0.8rem', color: '#888' }}>
                  ${pos.targetExit.toFixed(2)} / ${pos.stopLoss.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </PositionsTable>
      </SectionCard>

      {selectedScenario && gamePlans[selectedScenario] && (
        <SectionCard ref={gamePlanRef}>
          <SectionTitle>Game Plan: {selectedScenario}</SectionTitle>
          <GamePlanCard>
            <GamePlanTitle>Base Case</GamePlanTitle>
            <GamePlanSection>
              <GamePlanLabel>Position</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].baseCase.position}</GamePlanValue>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>Rationale</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].baseCase.rationale}</GamePlanValue>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>Expected Value</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].baseCase.expectedValue}</GamePlanValue>
            </GamePlanSection>
          </GamePlanCard>

          <GamePlanCard>
            <GamePlanTitle>Bull Case (Escalation Scenario)</GamePlanTitle>
            <GamePlanSection>
              <GamePlanLabel>Triggers</GamePlanLabel>
              <TriggerList>
                {gamePlans[selectedScenario].bullCase.triggers.map((trigger: string, idx: number) => (
                  <TriggerItem key={idx}>{trigger}</TriggerItem>
                ))}
              </TriggerList>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>Action</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].bullCase.action}</GamePlanValue>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>New Probability</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].bullCase.newProbability}</GamePlanValue>
            </GamePlanSection>
          </GamePlanCard>

          <GamePlanCard>
            <GamePlanTitle>Bear Case (De-escalation Scenario)</GamePlanTitle>
            <GamePlanSection>
              <GamePlanLabel>Triggers</GamePlanLabel>
              <TriggerList>
                {gamePlans[selectedScenario].bearCase.triggers.map((trigger: string, idx: number) => (
                  <TriggerItem key={idx}>{trigger}</TriggerItem>
                ))}
              </TriggerList>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>Action</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].bearCase.action}</GamePlanValue>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>New Probability</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].bearCase.newProbability}</GamePlanValue>
            </GamePlanSection>
          </GamePlanCard>

          <GamePlanCard>
            <GamePlanTitle>Exit Strategy</GamePlanTitle>
            <GamePlanSection>
              <GamePlanLabel>Target Exit</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].exitStrategy.target}</GamePlanValue>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>Stop Loss</GamePlanLabel>
              <GamePlanValue>{gamePlans[selectedScenario].exitStrategy.stopLoss}</GamePlanValue>
            </GamePlanSection>
            <GamePlanSection>
              <GamePlanLabel>Partial Exits</GamePlanLabel>
              <TriggerList>
                {gamePlans[selectedScenario].exitStrategy.partialExits.map((exit: any, idx: number) => (
                  <TriggerItem key={idx}>
                    @ ${exit.price.toFixed(2)}: Sell {exit.amount} - {exit.reason}
                  </TriggerItem>
                ))}
              </TriggerList>
            </GamePlanSection>
          </GamePlanCard>
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle>Trip Wires ({tripWires.filter((tw: any) => tw.status === 'ACTIVE').length} Active)</SectionTitle>
        {tripWires.map((tw: any) => {
          const isTriggered = triggeredTripWires?.some((t: any) => t.id === tw.id);
          return (
            <TripWireCard key={tw.id} $status={isTriggered ? 'TRIGGERED' : tw.status}>
              <TripWireHeader>
                <TripWireTitle>
                  {tw.scenario || 'Portfolio Level'} - {tw.action}
                </TripWireTitle>
                <TripWireStatus $status={isTriggered ? 'TRIGGERED' : tw.status}>
                  {isTriggered ? 'TRIGGERED' : tw.status}
                </TripWireStatus>
              </TripWireHeader>
              {tw.type === 'PRICE_THRESHOLD' && (
                <TripWireDetail>
                  Price {tw.direction === 'ABOVE' ? 'e' : 'd'} ${tw.threshold.toFixed(2)}
                </TripWireDetail>
              )}
              {tw.type === 'PORTFOLIO_RISK' && (
                <TripWireDetail>
                  Portfolio P&L {tw.threshold > 0 ? 'e' : 'd'} ${tw.threshold.toLocaleString()}
                </TripWireDetail>
              )}
              {tw.type === 'EVENT_TRIGGER' && (
                <TripWireDetail>
                  Event: {tw.event}
                </TripWireDetail>
              )}
              <TripWireDetail style={{ color: '#aaa', marginTop: '6px' }}>
                {tw.reasoning}
              </TripWireDetail>
            </TripWireCard>
          );
        })}
      </SectionCard>

      <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', padding: '20px', color: '#888', fontSize: '0.85rem' }}>
        <strong style={{ color: '#ff6b00' }}>Interactive Features:</strong> Click any position row (look for the <span style={{ color: '#ff6b00', fontWeight: 700 }}>► arrow</span>) to expand its detailed game plan with bull case, bear case, and exit strategies. Selected positions highlight in orange with a <span style={{ color: '#ff6b00' }}>▼ arrow</span>. Click again to collapse. Trip wires are monitored in real-time and will trigger alerts when thresholds are hit.
      </div>
    </Container>
  );
}
