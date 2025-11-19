import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface LayoutProps {
  children: React.ReactNode;
}

const Container = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #f0f0f0;
`;

const Header = styled.header`
  background: #1a1a1a;
  border-bottom: 2px solid #ff6b00;
  padding: 20px 0;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: #ff6b00;
  font-size: 1.8rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const Subtitle = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin: 8px 0 0 0;
  letter-spacing: 0.5px;
`;

const TimeSection = styled.div`
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const TimeLabel = styled.div`
  color: #888;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
`;

const TimeDisplay = styled.div`
  color: #00ff00;
  font-size: 1.2rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
`;

const Main = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Footer = styled.footer`
  background: #1a1a1a;
  border-top: 1px solid #333;
  margin-top: 50px;
  padding: 20px 0;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  text-align: center;
  color: #888;
  font-size: 0.85rem;
`;

export default function Layout({ children }: LayoutProps) {
  const [currentTime, setCurrentTime] = useState('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <TitleSection>
            <Title>Geopolitical Intelligence Command Center</Title>
            <Subtitle>Real-time market intelligence and prediction market analysis</Subtitle>
          </TitleSection>
          <TimeSection>
            <TimeLabel>System Time</TimeLabel>
            <TimeDisplay>{currentTime}</TimeDisplay>
          </TimeSection>
        </HeaderContent>
      </Header>

      <Main>{children}</Main>

      <Footer>
        <FooterContent>
          Powered by GDELT Project & Polymarket | Data refreshes every 5 minutes
        </FooterContent>
      </Footer>
    </Container>
  );
}
