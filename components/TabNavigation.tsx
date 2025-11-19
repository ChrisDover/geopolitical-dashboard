import React from 'react';
import styled from 'styled-components';

interface TabNavigationProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const TabsContainer = styled.div`
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
`;

const TabsList = styled.nav`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#1a1a1a' : '#0a0a0a'};
  color: ${props => props.$active ? '#ff6b00' : '#888'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#ff6b00' : 'transparent'};
  padding: 15px 25px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  top: 2px;

  &:hover {
    background: #1a1a1a;
    color: ${props => props.$active ? '#ff6b00' : '#fff'};
  }

  @media (max-width: 768px) {
    padding: 12px 18px;
    font-size: 0.85rem;
  }
`;

const tabs = [
  { id: 'summary', label: 'Executive Summary' },
  { id: 'portfolio', label: 'Live Portfolio' },
  { id: 'news', label: 'Live Intelligence' },
  { id: 'markets', label: 'Market Divergences' },
  { id: 'model', label: 'Risk Model' },
  { id: 'analytics', label: 'Performance Analytics' }
];

export default function TabNavigation({ activeTab, onChange }: TabNavigationProps) {
  return (
    <TabsContainer>
      <TabsList>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsList>
    </TabsContainer>
  );
}
