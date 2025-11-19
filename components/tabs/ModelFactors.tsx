import React from 'react';
import styled from 'styled-components';
import riskFactorsData from '../../data/risk-factors.json';

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

const ScenarioGrid = styled.div`
  display: grid;
  gap: 25px;
`;

const ScenarioCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-left: 4px solid #ff6b00;
  border-radius: 8px;
  padding: 25px;
`;

const ScenarioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;
`;

const ScenarioTitle = styled.h3`
  color: #fff;
  font-size: 1.2rem;
  margin: 0;
  font-weight: 700;
`;

const ProbabilityBadge = styled.div`
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%);
  color: #000;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 1.3rem;
  font-weight: 700;
`;

const FactorsSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h4`
  color: #ff6b00;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
`;

const FactorsList = styled.div`
  display: grid;
  gap: 12px;
`;

const FactorItem = styled.div`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 15px;
`;

const FactorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FactorName = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
`;

const FactorWeight = styled.div`
  color: #888;
  font-size: 0.8rem;
`;

const FactorDescription = styled.div`
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 10px;
  line-height: 1.4;
`;

const FactorScoreBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScoreBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #333;
`;

const ScoreBarFill = styled.div<{ $score: number }>`
  height: 100%;
  width: ${props => props.$score}%;
  background: ${props =>
    props.$score >= 75 ? '#ff0000' :
    props.$score >= 60 ? '#ff6b00' :
    props.$score >= 40 ? '#ffaa00' :
    '#4ade80'
  };
  transition: width 0.3s ease;
`;

const ScoreText = styled.div<{ $score: number }>`
  color: ${props =>
    props.$score >= 75 ? '#ff0000' :
    props.$score >= 60 ? '#ff6b00' :
    props.$score >= 40 ? '#ffaa00' :
    '#4ade80'
  };
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 35px;
`;

const CatalystSection = styled.div`
  margin-bottom: 25px;
`;

const CatalystList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
`;

const CatalystItem = styled.li`
  background: #0a0a0a;
  border-left: 3px solid #ff0000;
  padding: 12px 15px;
  border-radius: 4px;
  color: #ccc;
  font-size: 0.9rem;

  &:before {
    content: "⚠ ";
    color: #ff0000;
    font-weight: 700;
    margin-right: 8px;
  }
`;

const AnalogsSection = styled.div``;

const AnalogsList = styled.div`
  display: grid;
  gap: 10px;
`;

const AnalogItem = styled.div`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 15px;
  display: grid;
  grid-template-columns: 2fr 1fr 3fr;
  gap: 15px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AnalogEvent = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
`;

const AnalogSimilarity = styled.div`
  text-align: center;
`;

const SimilarityBadge = styled.div<{ $similarity: number }>`
  background: ${props =>
    props.$similarity >= 0.7 ? '#ff0000' :
    props.$similarity >= 0.5 ? '#ff6b00' :
    '#ffaa00'
  };
  color: #000;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-block;
`;

const AnalogOutcome = styled.div`
  color: #aaa;
  font-size: 0.85rem;
`;

const MetadataCard = styled.div`
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const MetadataItem = styled.div``;

const MetadataLabel = styled.div`
  color: #888;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
`;

const MetadataValue = styled.div`
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
`;

export default function ModelFactors() {
  const scenarios = riskFactorsData.scenarios;
  const metadata = riskFactorsData.metadata;

  return (
    <Container>
      <Header>
        <Title>Geopolitical Risk Model</Title>
        <Subtitle>
          Factor-based probability scoring with weighted risk assessment
        </Subtitle>
      </Header>

      <ScenarioGrid>
        {Object.entries(scenarios).map(([scenarioName, data]: [string, any]) => {
          // Calculate final probability with factor adjustments
          let probability = data.baselineProbability;
          let factorAdjustment = 0;

          data.factors.forEach((factor: any) => {
            const scoreImpact = (factor.currentScore - 50) * 0.4 * factor.weight;
            factorAdjustment += scoreImpact;
          });

          probability = Math.max(1, Math.min(95, probability + factorAdjustment));

          return (
            <ScenarioCard key={scenarioName}>
              <ScenarioHeader>
                <ScenarioTitle>{scenarioName}</ScenarioTitle>
                <ProbabilityBadge>{Math.round(probability)}%</ProbabilityBadge>
              </ScenarioHeader>

              <FactorsSection>
                <SectionTitle>Risk Factors</SectionTitle>
                <FactorsList>
                  {data.factors.map((factor: any, idx: number) => (
                    <FactorItem key={idx}>
                      <FactorHeader>
                        <FactorName>{factor.name}</FactorName>
                        <FactorWeight>Weight: {(factor.weight * 100).toFixed(0)}%</FactorWeight>
                      </FactorHeader>
                      <FactorDescription>{factor.description}</FactorDescription>
                      <FactorScoreBar>
                        <ScoreBarContainer>
                          <ScoreBarFill $score={factor.currentScore} />
                        </ScoreBarContainer>
                        <ScoreText $score={factor.currentScore}>{factor.currentScore}</ScoreText>
                      </FactorScoreBar>
                    </FactorItem>
                  ))}
                </FactorsList>
              </FactorsSection>

              <CatalystSection>
                <SectionTitle>Potential Catalyst Events</SectionTitle>
                <CatalystList>
                  {data.catalystEvents.map((event: string, idx: number) => (
                    <CatalystItem key={idx}>{event}</CatalystItem>
                  ))}
                </CatalystList>
              </CatalystSection>

              <AnalogsSection>
                <SectionTitle>Historical Analogs</SectionTitle>
                <AnalogsList>
                  {data.historicalAnalogs.map((analog: any, idx: number) => (
                    <AnalogItem key={idx}>
                      <AnalogEvent>{analog.event}</AnalogEvent>
                      <AnalogSimilarity>
                        <SimilarityBadge $similarity={analog.similarity}>
                          {(analog.similarity * 100).toFixed(0)}% similar
                        </SimilarityBadge>
                      </AnalogSimilarity>
                      <AnalogOutcome>{analog.outcome}</AnalogOutcome>
                    </AnalogItem>
                  ))}
                </AnalogsList>
              </AnalogsSection>
            </ScenarioCard>
          );
        })}
      </ScenarioGrid>

      <MetadataCard>
        <SectionTitle>Model Metadata</SectionTitle>
        <MetadataGrid>
          <MetadataItem>
            <MetadataLabel>Model Version</MetadataLabel>
            <MetadataValue>{metadata.modelVersion}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Last Updated</MetadataLabel>
            <MetadataValue>
              {new Date(metadata.lastUpdated).toLocaleDateString()}
            </MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Methodology</MetadataLabel>
            <MetadataValue>{metadata.methodology}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Update Frequency</MetadataLabel>
            <MetadataValue>{metadata.updateFrequency}</MetadataValue>
          </MetadataItem>
        </MetadataGrid>
      </MetadataCard>
    </Container>
  );
}
