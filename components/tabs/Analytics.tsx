import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const ScenarioTable = styled.table`
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

const TableRow = styled.tr`
  border-bottom: 1px solid #333;

  &:hover {
    background: #242424;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  color: #ccc;
  font-size: 0.9rem;
`;

const AccuracyBadge = styled.span<{ $accuracy: number | null }>`
  background: ${props =>
    props.$accuracy === null ? '#666' :
    props.$accuracy >= 75 ? '#00ff00' :
    props.$accuracy >= 60 ? '#ffaa00' :
    '#ff0000'
  };
  color: #000;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #888;
`;

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  async function fetchHistoricalData() {
    try {
      const response = await fetch('/api/analytics/history');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingContainer>
        <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Loading historical analytics...</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>Analyzing prediction accuracy and calibration</div>
      </LoadingContainer>
    );
  }

  if (!data) {
    return (
      <LoadingContainer>
        <div style={{ fontSize: '1.1rem', color: '#ff0000' }}>No historical data available</div>
        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
          The system will begin tracking predictions automatically. Check back after 24 hours.
        </div>
      </LoadingContainer>
    );
  }

  const { analytics, metadata } = data;

  return (
    <Container>
      <Header>
        <Title>Historical Performance Analytics</Title>
        <Subtitle>
          Model accuracy tracking, calibration analysis, and prediction performance metrics
        </Subtitle>
      </Header>

      <MetricsGrid>
        <MetricCard $borderColor="#ff6b00">
          <MetricValue $color="#ff6b00">{analytics.totalDays}</MetricValue>
          <MetricLabel>Days Tracked</MetricLabel>
        </MetricCard>

        <MetricCard $borderColor={analytics.overallAccuracy === null ? '#666' : analytics.overallAccuracy >= 70 ? '#00ff00' : '#ffaa00'}>
          <MetricValue $color={analytics.overallAccuracy === null ? '#666' : analytics.overallAccuracy >= 70 ? '#00ff00' : '#ffaa00'}>
            {analytics.overallAccuracy !== null ? `${analytics.overallAccuracy.toFixed(1)}%` : 'N/A'}
          </MetricValue>
          <MetricLabel>Overall Accuracy</MetricLabel>
        </MetricCard>

        <MetricCard $borderColor="#ff6b00">
          <MetricValue $color="#fff">
            {Object.keys(analytics.scenarioPerformance).length}
          </MetricValue>
          <MetricLabel>Scenarios Tracked</MetricLabel>
        </MetricCard>

        <MetricCard $borderColor="#888">
          <MetricValue $color="#888">
            {metadata.averageDivergence?.toFixed(1)}%
          </MetricValue>
          <MetricLabel>Avg. Market Divergence</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      <SectionCard>
        <SectionTitle>Scenario Performance</SectionTitle>
        <ScenarioTable>
          <thead>
            <tr>
              <TableHeader>Scenario</TableHeader>
              <TableHeader>Predictions</TableHeader>
              <TableHeader>Avg Model</TableHeader>
              <TableHeader>Avg Market</TableHeader>
              <TableHeader>Avg Divergence</TableHeader>
              <TableHeader>Resolved</TableHeader>
              <TableHeader>Accuracy</TableHeader>
            </tr>
          </thead>
          <tbody>
            {Object.entries(analytics.scenarioPerformance).map(([scenario, perf]: [string, any]) => (
              <TableRow key={scenario}>
                <TableCell style={{ fontWeight: 600, color: '#fff' }}>{scenario}</TableCell>
                <TableCell>{perf.totalPredictions}</TableCell>
                <TableCell>{perf.avgModelProb}%</TableCell>
                <TableCell>{perf.avgMarketProb}%</TableCell>
                <TableCell style={{ color: Math.abs(parseFloat(perf.avgDivergence)) > 10 ? '#ff6b00' : '#888' }}>
                  {perf.avgDivergence}%
                </TableCell>
                <TableCell>{perf.resolved}</TableCell>
                <TableCell>
                  <AccuracyBadge $accuracy={perf.accuracy ? parseFloat(perf.accuracy) : null}>
                    {perf.accuracy ? `${perf.accuracy}%` : 'Pending'}
                  </AccuracyBadge>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </ScenarioTable>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Model Calibration</SectionTitle>
        <Subtitle style={{ marginBottom: '20px' }}>
          Comparing predicted probabilities vs actual occurrence rates (perfect calibration = diagonal line)
        </Subtitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { bucket: '0-20%', predicted: 10, actual: analytics.calibration['0-20'].avgOutcome },
            { bucket: '20-40%', predicted: 30, actual: analytics.calibration['20-40'].avgOutcome },
            { bucket: '40-60%', predicted: 50, actual: analytics.calibration['40-60'].avgOutcome },
            { bucket: '60-80%', predicted: 70, actual: analytics.calibration['60-80'].avgOutcome },
            { bucket: '80-100%', predicted: 90, actual: analytics.calibration['80-100'].avgOutcome }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="bucket" stroke="#888" />
            <YAxis stroke="#888" label={{ value: 'Probability %', angle: -90, position: 'insideLeft', fill: '#888' }} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="predicted" fill="#ff6b00" name="Predicted Probability" />
            <Bar dataKey="actual" fill="#00ff00" name="Actual Occurrence Rate" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '15px', textAlign: 'center' }}>
          {Object.values(analytics.calibration).reduce((sum: number, cal: any) => sum + cal.count, 0)} total resolved predictions used for calibration analysis
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Historical Trend (Last 30 Days)</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.predictions.slice(-30).map((pred: any, idx: number) => ({
            day: idx + 1,
            date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            avgDivergence: Object.values(pred.scenarios).reduce((sum: number, s: any) => sum + Math.abs(s.divergence), 0) / Object.keys(pred.scenarios).length
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" label={{ value: 'Avg Divergence %', angle: -90, position: 'insideLeft', fill: '#888' }} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="avgDivergence" stroke="#ff6b00" strokeWidth={2} name="Average Divergence" />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', padding: '20px', color: '#888', fontSize: '0.85rem' }}>
        <strong style={{ color: '#ff6b00' }}>Note:</strong> Historical tracking records daily model probabilities and market prices.
        Accuracy is calculated when scenarios resolve by comparing model predictions against actual outcomes.
        The system becomes more accurate with more data over time.
      </div>
    </Container>
  );
}
