import React, { useState } from 'react';
import styled from 'styled-components';

interface Position {
  symbol: string;
  name: string;
  type: string;
  shares?: number;
  contracts?: number;
  currentPrice: number;
  sector?: string;
}

interface PositionSizingCalculatorProps {
  portfolioType: 'prediction-markets' | 'equities';
  positions: Position[];
  baseCapital: number; // The reference portfolio size ($100k)
}

const CalculatorContainer = styled.div`
  background: #0a0a0a;
  border: 2px solid #ff6b00;
  border-radius: 8px;
  padding: 30px;
  margin: 30px 0;
`;

const CalculatorTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CalculatorSubtitle = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const InputSection = styled.div`
  margin-bottom: 30px;
`;

const InputLabel = styled.label`
  display: block;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 10px;
`;

const InputField = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 12px 15px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-size: 1rem;
  font-family: 'Courier New', monospace;

  &:focus {
    outline: none;
    border-color: #ff6b00;
  }

  &::placeholder {
    color: #555;
  }
`;

const CalculateButton = styled.button`
  background: #ff6b00;
  color: #000;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.2s;

  &:hover {
    background: #ff8533;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResultsSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #333;
`;

const ResultsTitle = styled.h4`
  color: #ff6b00;
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const PositionsTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PositionRow = styled.div`
  display: grid;
  grid-template-columns: 100px 2fr 120px 150px 150px;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const PositionSymbol = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: #ff6b00;
  font-family: 'Courier New', monospace;
`;

const PositionName = styled.div`
  color: #aaa;
  font-size: 0.85rem;
`;

const PositionPrice = styled.div`
  color: #fff;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
`;

const PositionShares = styled.div`
  color: #00ff00;
  font-weight: 700;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
`;

const PositionCost = styled.div`
  color: #fff;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
`;

const SummarySection = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: #1a1a1a;
  border: 1px solid #ff6b00;
  border-radius: 4px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  color: #fff;
  font-size: 0.95rem;

  &:not(:last-child) {
    border-bottom: 1px solid #333;
  }
`;

const SummaryLabel = styled.span`
  color: #888;
`;

const SummaryValue = styled.span<{ $highlight?: boolean }>`
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: ${props => props.$highlight ? '#ff6b00' : '#fff'};
`;

const WarningBox = styled.div`
  background: rgba(255, 107, 0, 0.1);
  border: 1px solid #ff6b00;
  border-radius: 4px;
  padding: 15px;
  margin-top: 20px;
  color: #ff6b00;
  font-size: 0.9rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  color: #aaa;
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: #fff;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ff6b00;
`;

export default function PositionSizingCalculator({
  portfolioType,
  positions,
  baseCapital
}: PositionSizingCalculatorProps) {
  const [accountSize, setAccountSize] = useState<string>('');
  const [calculatedPositions, setCalculatedPositions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allowFractional, setAllowFractional] = useState(true);

  const calculatePositions = () => {
    const userCapital = parseFloat(accountSize);

    if (isNaN(userCapital) || userCapital <= 0) {
      alert('Please enter a valid account size');
      return;
    }

    const scaleFactor = userCapital / baseCapital;

    const scaled = positions.map(pos => {
      let quantityWhole: number;
      let quantityFractional: number;
      let cost: number;

      if (pos.type === 'FUTURES') {
        // Futures: scale contracts, round to nearest whole number (futures don't support fractional)
        const scaledContracts = Math.round((pos.contracts || 0) * scaleFactor);
        quantityWhole = scaledContracts;
        quantityFractional = scaledContracts;
        // Cost is margin per contract * number of contracts
        const marginPerContract = 770; // Based on CL contract
        cost = quantityWhole * marginPerContract;
      } else {
        // Stocks/ETFs: scale shares
        const scaledShares = (pos.shares || 0) * scaleFactor;

        // Store fractional quantity (exact)
        quantityFractional = scaledShares;

        // Whole number quantity (rounded)
        if (Math.abs(scaledShares) < 1 && Math.abs(scaledShares) >= 0.5) {
          quantityWhole = scaledShares > 0 ? 1 : -1;
        } else {
          quantityWhole = Math.round(scaledShares);
        }

        // Cost based on whether fractional shares are allowed
        const effectiveQuantity = allowFractional ? quantityFractional : quantityWhole;
        cost = Math.abs(effectiveQuantity) * pos.currentPrice;
      }

      const effectiveQuantity = allowFractional ? quantityFractional : quantityWhole;

      return {
        ...pos,
        scaledQuantity: effectiveQuantity,
        scaledQuantityWhole: quantityWhole,
        scaledQuantityFractional: quantityFractional,
        estimatedCost: cost
      };
    }).filter(p => Math.abs(p.scaledQuantity) >= 0.01); // Remove positions that are essentially 0

    setCalculatedPositions(scaled);
    setShowResults(true);
  };

  const totalCost = calculatedPositions.reduce((sum, pos) => sum + pos.estimatedCost, 0);
  const deploymentPercentage = (totalCost / parseFloat(accountSize || '1')) * 100;

  return (
    <CalculatorContainer>
      <CalculatorTitle>Position Sizing Calculator</CalculatorTitle>
      <CalculatorSubtitle>
        Enter your account size to calculate the exact number of shares/contracts you need to buy
        to replicate this portfolio strategy at your scale. The calculator maintains the same proportions
        as the reference ${baseCapital.toLocaleString()} portfolio.
      </CalculatorSubtitle>

      <InputSection>
        <InputLabel>Your Account Size (USD)</InputLabel>
        <InputField
          type="number"
          placeholder="e.g., 50000"
          value={accountSize}
          onChange={(e) => setAccountSize(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') calculatePositions();
          }}
        />
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={allowFractional}
            onChange={(e) => setAllowFractional(e.target.checked)}
          />
          <span>
            Allow fractional shares (for brokerages like Robinhood, Fidelity, etc.)
          </span>
        </CheckboxContainer>
        <CalculateButton onClick={calculatePositions}>
          Calculate Positions
        </CalculateButton>
      </InputSection>

      {showResults && calculatedPositions.length > 0 && (
        <ResultsSection>
          <ResultsTitle>
            Your Position Sizes for ${parseFloat(accountSize).toLocaleString()}
          </ResultsTitle>

          <PositionsTable>
            {calculatedPositions.map((pos, idx) => {
              const isFractional = allowFractional && pos.type !== 'FUTURES' && pos.scaledQuantity % 1 !== 0;
              const displayQuantity = isFractional
                ? pos.scaledQuantity.toFixed(2)
                : pos.scaledQuantity.toString();

              return (
                <PositionRow key={idx}>
                  <PositionSymbol>{pos.symbol}</PositionSymbol>
                  <PositionName>{pos.name}</PositionName>
                  <PositionPrice>
                    ${pos.currentPrice.toFixed(2)}
                  </PositionPrice>
                  <PositionShares>
                    {pos.type === 'FUTURES'
                      ? `${displayQuantity} contract${Math.abs(pos.scaledQuantity) !== 1 ? 's' : ''}`
                      : `${displayQuantity} share${Math.abs(pos.scaledQuantity) !== 1 ? 's' : ''}`
                    }
                    {pos.scaledQuantity < 0 && ' (SHORT)'}
                  </PositionShares>
                  <PositionCost>
                    ${pos.estimatedCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </PositionCost>
                </PositionRow>
              );
            })}
          </PositionsTable>

          <SummarySection>
            <SummaryRow>
              <SummaryLabel>Total Account Size:</SummaryLabel>
              <SummaryValue>${parseFloat(accountSize).toLocaleString()}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Total Capital Required:</SummaryLabel>
              <SummaryValue>${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Deployment Percentage:</SummaryLabel>
              <SummaryValue $highlight>{deploymentPercentage.toFixed(1)}%</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Remaining Cash:</SummaryLabel>
              <SummaryValue>
                ${(parseFloat(accountSize) - totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Number of Positions:</SummaryLabel>
              <SummaryValue>{calculatedPositions.length}</SummaryValue>
            </SummaryRow>
          </SummarySection>

          {portfolioType === 'equities' && calculatedPositions.some(p => p.type === 'FUTURES') && (
            <WarningBox>
              <strong>Futures Notice:</strong> Futures positions require margin (shown as cost above).
              The actual notional exposure will be much larger. Current futures allocation is {
                ((calculatedPositions.find(p => p.type === 'FUTURES')?.estimatedCost || 0) / parseFloat(accountSize) * 100).toFixed(2)
              }% of account (target: &lt;2% margin).
            </WarningBox>
          )}

          {deploymentPercentage > 100 && (
            <WarningBox>
              <strong>Warning:</strong> Total position cost exceeds your account size by $
              {(totalCost - parseFloat(accountSize)).toLocaleString()}.
              Consider a larger account size or reducing position sizes.
            </WarningBox>
          )}
        </ResultsSection>
      )}
    </CalculatorContainer>
  );
}
