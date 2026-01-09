import React from 'react';
import styled from 'styled-components';

export type ViewMode = 'CEO' | 'GC';

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 6px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#ff6b00' : 'transparent'};
  color: ${props => props.$active ? '#000' : '#888'};
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$active ? '#ff6b00' : 'rgba(255, 107, 0, 0.1)'};
    color: ${props => props.$active ? '#000' : '#ff6b00'};
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
`;

const Label = styled.span`
  color: #888;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  return (
    <ToggleContainer>
      <Label>View:</Label>
      <ToggleButton $active={mode === 'CEO'} onClick={() => onChange('CEO')}>
        CEO Mode
      </ToggleButton>
      <ToggleButton $active={mode === 'GC'} onClick={() => onChange('GC')}>
        GC Mode
      </ToggleButton>
    </ToggleContainer>
  );
};

export default ModeToggle;

