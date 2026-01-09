import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';
import ModeToggle, { ViewMode } from './ModeToggle';

interface NavigationProps {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
`;

export default function Navigation({ viewMode = 'CEO', onViewModeChange }: NavigationProps) {
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
        </NavTabs>

        <RightSection>
          {onViewModeChange && (
            <ModeToggle mode={viewMode} onChange={onViewModeChange} />
          )}
        </RightSection>
      </NavContainer>
    </Nav>
  );
}
