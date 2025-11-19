import React from 'react';
import styled from 'styled-components';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

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

interface MarketDivergenceProps {
  data: Divergence[];
  loading: boolean;
}

const Container = styled.div``;

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
  margin: 0 0 20px 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $borderColor: string }>`
  background: #0a0a0a;
  border: 1px solid ${props => props.$borderColor};
  border-radius: 6px;
  padding: 15px;
  text-align: center;
`;

const StatValue = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 0.85rem;
`;

const DivergenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DivergenceCard = styled.div<{ $borderColor: string }>`
  background: #1a1a1a;
  border: 1px solid #333;
  border-left: 4px solid ${props => props.$borderColor};
  border-radius: 8px;
  padding: 25px;
  transition: all 0.2s;

  &:hover {
    background: #242424;
    box-shadow: 0 2px 10px ${props => `${props.$borderColor}33`};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
  gap: 10px;
`;

const ScenarioTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
`;

const EdgeBadge = styled.span<{ $edgeType: string }>`
  background: ${props => {
    if (props.$edgeType.includes('BUY')) return '#00ff00';
    if (props.$edgeType.includes('SELL')) return '#ff0000';
    if (props.$edgeType === 'NO_MARKET') return '#666';
    return '#888';
  }};
  color: #000;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const MetricBox = styled.div`
  background: #0a0a0a;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #333;
`;

const MetricLabel = styled.div`
  color: #888;
  font-size: 0.75rem;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div<{ $color?: string }>`
  color: ${props => props.$color || '#fff'};
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
`;

const AnalysisBox = styled.div`
  background: #0a0a0a;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #333;
`;

const AnalysisLabel = styled.div`
  color: #888;
  font-size: 0.75rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnalysisText = styled.div`
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const TradeBox = styled.div`
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #ff6b00;
`;

const TradeLabel = styled.div`
  color: #000;
  font-size: 0.75rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
`;

const TradeText = styled.div`
  color: #000;
  font-size: 0.95rem;
  font-weight: 700;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 0.85rem;
`;

const DetailItem = styled.div`
  color: #888;
`;

const DetailValue = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 700;
  margin-left: 8px;
`;

const RiskNote = styled.div`
  color: #666;
  font-size: 0.75rem;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #333;
`;

const MarketLink = styled.a`
  color: #ff6b00;
  font-size: 0.85rem;
  text-decoration: none;
  display: block;
  margin-top: 12px;
  font-weight: 600;

  &:hover {
    color: #ff8c33;
    text-decoration: underline;
  }
`;

const NoMarketBox = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #0a0a0a;
  border-radius: 6px;
  border: 1px solid #333;
`;

const NoMarketText = styled.div`
  color: #888;
  font-size: 0.95rem;
  margin-bottom: 10px;
`;

const NoMarketDetail = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const ChartContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 25px;
  margin-top: 30px;
`;

const ChartTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.3rem;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
`;

const ChartCaption = styled.div`
  color: #888;
  font-size: 0.75rem;
  text-align: center;
  margin-top: 15px;
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const LoadingText = styled.div`
  color: #888;
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

const LoadingSubtext = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

export default function MarketDivergence({ data = [], loading }: MarketDivergenceProps) {
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading market data...</LoadingText>
        <LoadingSubtext>Analyzing prediction market divergences</LoadingSubtext>
      </LoadingContainer>
    );
  }

  // Prepare scatter data
  const scatterData = data
    .filter(d => d.polymarket !== null)
    .map(d => ({
      x: d.polymarket,
      y: d.ourModel,
      z: Math.abs(d.divergence || 0) * 10,
      name: d.scenario,
      edge: d.edge
    }));

  const buySignals = data.filter(d => d.edge === 'STRONG BUY' || d.edge === 'BUY').length;
  const sellSignals = data.filter(d => d.edge === 'STRONG SELL' || d.edge === 'SELL').length;
  const fairSignals = data.filter(d => d.edge === 'FAIR').length;

  return (
    <Container>
      <Header>
        <Title>Model vs. Market Divergences</Title>
        <Subtitle>
          Identifying mispricings where our geopolitical model diverges from prediction markets
        </Subtitle>
        <StatsGrid>
          <StatCard $borderColor="#00ff00">
            <StatValue $color="#00ff00">{buySignals}</StatValue>
            <StatLabel>Buy Signals</StatLabel>
          </StatCard>
          <StatCard $borderColor="#ff0000">
            <StatValue $color="#ff0000">{sellSignals}</StatValue>
            <StatLabel>Sell Signals</StatLabel>
          </StatCard>
          <StatCard $borderColor="#888">
            <StatValue $color="#888">{fairSignals}</StatValue>
            <StatLabel>Fair Value</StatLabel>
          </StatCard>
        </StatsGrid>
      </Header>

      <DivergenceGrid>
        {data.map((div, idx) => {
          const borderColor =
            div.edge.includes('BUY') ? '#00ff00' :
            div.edge.includes('SELL') ? '#ff0000' :
            div.edge === 'NO_MARKET' ? '#666' :
            '#888';

          return (
            <DivergenceCard key={idx} $borderColor={borderColor}>
              <CardHeader>
                <ScenarioTitle>{div.scenario}</ScenarioTitle>
                <EdgeBadge $edgeType={div.edge}>{div.edge}</EdgeBadge>
              </CardHeader>

              {(div.polymarket !== null || div.kalshi !== null) ? (
                <>
                  <MetricsGrid>
                    <MetricBox>
                      <MetricLabel>Our Model</MetricLabel>
                      <MetricValue>{div.ourModel}%</MetricValue>
                    </MetricBox>
                    {div.polymarket !== null && (
                      <MetricBox>
                        <MetricLabel>Polymarket</MetricLabel>
                        <MetricValue $color="#ff6b00">{div.polymarket.toFixed(0)}%</MetricValue>
                      </MetricBox>
                    )}
                    {div.kalshi !== null && (
                      <MetricBox>
                        <MetricLabel>Kalshi</MetricLabel>
                        <MetricValue $color="#00aaff">{div.kalshi.toFixed(0)}%</MetricValue>
                      </MetricBox>
                    )}
                    <MetricBox>
                      <MetricLabel>Edge</MetricLabel>
                      <MetricValue $color={(div.divergence || 0) > 0 ? '#00ff00' : '#ff0000'}>
                        {(div.divergence || 0) > 0 ? '+' : ''}{(div.divergence || 0).toFixed(0)}%
                      </MetricValue>
                    </MetricBox>
                  </MetricsGrid>

                  <AnalysisBox>
                    <AnalysisLabel>Analysis</AnalysisLabel>
                    <AnalysisText>{div.reasoning}</AnalysisText>
                  </AnalysisBox>

                  <TradeBox>
                    <TradeLabel>Suggested Trade</TradeLabel>
                    <TradeText>{div.suggestedTrade}</TradeText>
                  </TradeBox>

                  <DetailGrid>
                    <DetailItem>
                      Expected Value:
                      <DetailValue $color="#00ff00">{div.expectedValue}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      Confidence:
                      <DetailValue $color="#fff">{div.confidence}%</DetailValue>
                    </DetailItem>
                  </DetailGrid>

                  {div.riskNote && (
                    <RiskNote>{div.riskNote}</RiskNote>
                  )}

                  {div.marketUrl && (
                    <MarketLink
                      href={div.marketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Polymarket →
                    </MarketLink>
                  )}
                </>
              ) : (
                <NoMarketBox>
                  <NoMarketText>No active market found</NoMarketText>
                  <NoMarketDetail>
                    Model probability: {div.ourModel}%
                  </NoMarketDetail>
                </NoMarketBox>
              )}
            </DivergenceCard>
          );
        })}
      </DivergenceGrid>

      {/* Scatter Plot */}
      {scatterData.length > 0 && (
        <ChartContainer>
          <ChartTitle>Model vs. Market Visualization</ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                type="number"
                dataKey="x"
                name="Polymarket"
                stroke="#888"
                domain={[0, 100]}
                label={{ value: 'Polymarket Probability (%)', position: 'bottom', fill: '#888' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Our Model"
                stroke="#888"
                domain={[0, 100]}
                label={{ value: 'Our Model Probability (%)', angle: -90, position: 'left', fill: '#888' }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 1000]} />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{
                        background: '#1a1a1a',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #333'
                      }}>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{data.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>Polymarket: {data.x}%</div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>Our Model: {data.y}%</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00ff00', marginTop: '6px' }}>{data.edge}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Fair value line (y=x) */}
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                stroke="#ff6b00"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Scatter data={scatterData} fill="#ff6b00">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.edge.includes('BUY') ? '#00ff00' :
                      entry.edge.includes('SELL') ? '#ff0000' :
                      '#888'
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <ChartCaption>
            Points above line = Model predicts higher (potential buy) | Points below = Model predicts lower (potential sell)
          </ChartCaption>
        </ChartContainer>
      )}
    </Container>
  );
}
