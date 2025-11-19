import React, { useState } from 'react';
import styled from 'styled-components';
import PortfolioHero from './PortfolioHero';
import MetricCard from './MetricCard';
import Tooltip from './Tooltip';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  color: #ff6b00;
  font-size: 1.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const ToggleButton = styled.button`
  background: #333;
  border: 2px solid #ff6b00;
  border-radius: 8px;
  color: #ff6b00;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ff6b00;
    color: #000;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const SummaryBox = styled.div`
  background: rgba(255, 107, 0, 0.1);
  border: 2px solid #ff6b00;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

const SummaryTitle = styled.h3`
  color: #ff6b00;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`;

const SummaryText = styled.p`
  color: #ddd;
  font-size: 1.125rem;
  line-height: 1.8;
  margin: 0 0 12px 0;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HighlightText = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 700;
`;

interface ImprovedExecutiveSummaryProps {
  portfolioData?: any;
}

export const ImprovedExecutiveSummary: React.FC<ImprovedExecutiveSummaryProps> = ({ portfolioData }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mock data for demo (replace with real data)
  const totalValue = portfolioData?.metadata?.totalCapital || 113997;
  const returnPercent = 14.0;
  const returnDollar = 14000;
  const unrealizedPnL = portfolioData?.metadata?.unrealizedPnL || -2748;
  const realizedPnL = 568;

  // Determine portfolio status
  const getPortfolioStatus = () => {
    if (unrealizedPnL > 5000) return 'good';
    if (unrealizedPnL < -5000) return 'danger';
    return 'caution';
  };

  const getSummary = () => {
    const status = getPortfolioStatus();
    if (status === 'good') {
      return "Your portfolio is performing excellently. All positions are healthy with strong gains across the board. No immediate action needed.";
    } else if (status === 'danger') {
      return "Your portfolio needs attention. Some positions are approaching stop losses. Review the Action Required section below.";
    }
    return "Your portfolio is up 14% this year, but the S&P 500 is up 22%. Your defensive strategy is working - you lost less during the April crash (-10% vs market's -17%).";
  };

  return (
    <Container>
      {/* Hero Section with Traffic Light */}
      <PortfolioHero
        totalValue={totalValue}
        returnPercent={returnPercent}
        returnDollar={returnDollar}
        status={getPortfolioStatus()}
        summary={getSummary()}
      />

      {/* Plain English Summary */}
      <SummaryBox>
        <SummaryTitle>What This Means in Plain English</SummaryTitle>
        <SummaryText>
          You started with <HighlightText $color="#fff">$100,000</HighlightText> and now have{' '}
          <HighlightText $color="#00c853">${totalValue.toLocaleString()}</HighlightText>.
        </SummaryText>
        <SummaryText>
          <HighlightText $color="#00c853">9 out of 11</HighlightText> of your positions are making money.
          Your best performer is up <HighlightText $color="#00c853">+23%</HighlightText>.
        </SummaryText>
        <SummaryText>
          You're playing it <HighlightText $color="#ffa000">safer than the market</HighlightText>.
          When stocks crashed in April, you only lost 10% while the S&P 500 lost 17%.
        </SummaryText>
      </SummaryBox>

      {/* Core Metrics (Always Visible) */}
      <Section>
        <SectionHeader>
          <SectionTitle>Key Metrics</SectionTitle>
        </SectionHeader>
        <MetricsGrid>
          <MetricCard
            title="Total Return"
            value={`+${returnPercent.toFixed(2)}%`}
            subtitle="How much your portfolio has grown"
            trend="up"
            trendValue="+2.3% this month"
            comparison={{
              label: "vs S&P 500",
              value: "+22.0%",
              better: false
            }}
            showProgressBar
            progressPercent={returnPercent}
            progressColor="#00c853"
          />

          <MetricCard
            title="Unrealized Profit/Loss"
            value={`$${Math.abs(unrealizedPnL).toLocaleString()}`}
            subtitle={unrealizedPnL >= 0 ? "Profit if you sold today" : "Loss if you sold today"}
            trend={unrealizedPnL >= 0 ? "up" : "down"}
            trendValue={`${unrealizedPnL >= 0 ? '+' : ''}${((unrealizedPnL / totalValue) * 100).toFixed(2)}%`}
          />

          <MetricCard
            title="Win Rate"
            value="82%"
            subtitle="9 winners, 2 losers"
            tooltip="Win Rate"
            tooltipExplanation="Percentage of your positions that are profitable. Above 60% is good. You have 9 out of 11 positions making money."
            showProgressBar
            progressPercent={82}
            progressColor="#00c853"
          />
        </MetricsGrid>
      </Section>

      {/* Advanced Metrics (Collapsible) */}
      <Section>
        <SectionHeader>
          <SectionTitle>Advanced Metrics</SectionTitle>
          <ToggleButton onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Hide Details ▲' : 'Show Details ▼'}
          </ToggleButton>
        </SectionHeader>

        {showAdvanced && (
          <MetricsGrid>
            <MetricCard
              title="Sharpe Ratio"
              value="0.57"
              subtitle="Risk-adjusted return"
              tooltip="Sharpe Ratio"
              tooltipExplanation="This measures your return compared to the risk you took. Higher is better. You have 0.57, S&P 500 has 0.71 - meaning the market gives better returns for the same risk level."
              comparison={{
                label: "vs S&P 500",
                value: "0.71",
                better: false
              }}
            />

            <MetricCard
              title="Max Drawdown"
              value="-10.6%"
              subtitle="Biggest loss from peak"
              tooltip="Maximum Drawdown"
              tooltipExplanation="Your worst moment - the biggest drop from your portfolio's highest point. You lost 10.6% from peak to trough, while the S&P 500 lost 17.5%. Your defensive strategy protected you!"
              comparison={{
                label: "vs S&P 500",
                value: "-17.5%",
                better: true
              }}
              showProgressBar
              progressPercent={Math.abs(10.6)}
              progressColor="#00c853"
            />

            <MetricCard
              title="Profit Factor"
              value="0.67"
              subtitle="Winners ÷ Losers"
              tooltip="Profit Factor"
              tooltipExplanation="Total gains divided by total losses. Above 1.0 means your winners are bigger than your losers. You're at 0.67, which means you need to let winners run longer or cut losers faster."
              showProgressBar
              progressPercent={67}
              progressColor="#ffa000"
            />

            <MetricCard
              title="Alpha vs S&P 500"
              value="-8.00%"
              subtitle="Underperforming market"
              tooltip="Alpha"
              tooltipExplanation="How much you're beating (or trailing) the S&P 500. Negative means underperforming. You're -8% behind, but that's by design - your defensive strategy protects against crashes."
              trend="down"
              trendValue="-8.0%"
            />

            <MetricCard
              title="Capital Deployment"
              value="100%"
              subtitle="Fully invested"
              tooltip="Capital Deployment"
              tooltipExplanation="How much of your cash is invested vs sitting on the sidelines. You're at 100% - fully invested. Consider keeping 5-10% in cash for opportunities."
              showProgressBar
              progressPercent={100}
              progressColor="#d32f2f"
            />

            <MetricCard
              title="Long/Short Ratio"
              value="6.6x"
              subtitle="Net long bias"
              tooltip="Long/Short Ratio"
              tooltipExplanation="How much you're betting up vs down. 6.6x means for every $1 betting down, you have $6.60 betting up. You're bullish overall."
              showProgressBar
              progressPercent={86}
              progressColor="#00c853"
            />
          </MetricsGrid>
        )}
      </Section>
    </Container>
  );
};

export default ImprovedExecutiveSummary;
