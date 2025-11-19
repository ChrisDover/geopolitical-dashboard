import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';

interface NavigationProps {
  totalPnL?: number;
}

const Nav = styled.nav`
  background: #0a0a0a;
  border-bottom: 2px solid #333;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 0;

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: #ff6b00;
  letter-spacing: 0.5px;
  cursor: pointer;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const NavTabs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 10px;
    gap: 6px;
  }
`;

const NavTab = styled.a<{ $active: boolean; $color: string }>`
  padding: 12px 20px;
  border-radius: 6px 6px 0 0;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;

  background: ${props => props.$active ? props.$color : 'transparent'};
  color: ${props => props.$active ? '#000' : '#888'};
  border-bottom: 3px solid ${props => props.$active ? props.$color : 'transparent'};

  &:hover {
    background: ${props => props.$active ? props.$color : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.$active ? '#000' : '#fff'};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
`;

const PnLDisplay = styled.div<{ $positive: boolean }>`
  padding: 12px 20px;
  border-radius: 6px;
  background: ${props => props.$positive ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 0, 0, 0.15)'};
  border: 1px solid ${props => props.$positive ? '#00c853' : '#ff0000'};
  font-weight: 700;
  font-size: 1rem;
  color: ${props => props.$positive ? '#00c853' : '#ff0000'};
  font-family: 'Courier New', monospace;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.9rem;
    margin-top: 10px;
  }
`;

const PnLLabel = styled.span`
  font-size: 0.75rem;
  color: #888;
  margin-right: 8px;
  font-weight: 600;
`;

export default function Navigation({ totalPnL = 0 }: NavigationProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <Nav>
      <NavContainer>
        <LogoSection>
          <Link href="/" passHref legacyBehavior>
            <Logo>GEOPOLITICAL INTEL</Logo>
          </Link>
        </LogoSection>

        <NavTabs>
          <Link href="/" passHref legacyBehavior>
            <NavTab $active={isActive('/')} $color="#ff6b00">
              Overview
            </NavTab>
          </Link>

          <Link href="/markets/events" passHref legacyBehavior>
            <NavTab $active={isActive('/markets/events')} $color="#ff6b00">
              Events
            </NavTab>
          </Link>

          <Link href="/markets/equities" passHref legacyBehavior>
            <NavTab $active={isActive('/markets/equities')} $color="#0066cc">
              Equities
            </NavTab>
          </Link>

          <Link href="/analytics/risk" passHref legacyBehavior>
            <NavTab $active={isActive('/analytics/risk')} $color="#9333ea">
              Risk
            </NavTab>
          </Link>
        </NavTabs>

        <PnLDisplay $positive={totalPnL >= 0}>
          <PnLLabel>TOTAL P&L</PnLLabel>
          {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
        </PnLDisplay>
      </NavContainer>
    </Nav>
  );
}
