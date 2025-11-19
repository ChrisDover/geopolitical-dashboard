import React, { useState } from 'react';
import styled from 'styled-components';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  explanation: string;
}

const TooltipContainer = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: help;
`;

const TooltipIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;

  &:hover {
    background: #ff6b00;
    transform: scale(1.1);
  }
`;

const TooltipBubble = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  border: 2px solid #ff6b00;
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 250px;
  max-width: 350px;
  z-index: 1000;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

  /* Arrow */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 8px solid transparent;
    border-top-color: #ff6b00;
  }

  @media (max-width: 768px) {
    min-width: 200px;
    max-width: 280px;
    font-size: 0.9rem;
  }
`;

const TooltipTitle = styled.div`
  color: #ff6b00;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 6px;
`;

const TooltipText = styled.div`
  color: #ddd;
  font-size: 0.85rem;
  line-height: 1.5;
`;

export const Tooltip: React.FC<TooltipProps> = ({ text, children, explanation }) => {
  const [visible, setVisible] = useState(false);

  return (
    <TooltipContainer
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      {children}
      <TooltipIcon>?</TooltipIcon>
      <TooltipBubble $visible={visible}>
        <TooltipTitle>{text}</TooltipTitle>
        <TooltipText>{explanation}</TooltipText>
      </TooltipBubble>
    </TooltipContainer>
  );
};

export default Tooltip;
