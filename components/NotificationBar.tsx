import React from 'react';
import styled from 'styled-components';

interface Notification {
  id: number;
  time: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  title: string;
  message: string;
  acknowledged: boolean;
}

interface NotificationBarProps {
  notifications: Notification[];
  onAcknowledge: (id: number) => void;
}

const NotificationsContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NotificationCard = styled.div<{ level: string }>`
  background: ${props => props.level === 'CRITICAL' ? '#1a0000' : '#1a1a1a'};
  border: 1px solid ${props =>
    props.level === 'CRITICAL' ? '#ff0000' :
    props.level === 'HIGH' ? '#ff6b00' :
    '#ffaa00'
  };
  border-left: 4px solid ${props =>
    props.level === 'CRITICAL' ? '#ff0000' :
    props.level === 'HIGH' ? '#ff6b00' :
    '#ffaa00'
  };
  border-radius: 6px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  box-shadow: 0 2px 10px ${props =>
    props.level === 'CRITICAL' ? 'rgba(255, 0, 0, 0.2)' :
    props.level === 'HIGH' ? 'rgba(255, 107, 0, 0.2)' :
    'rgba(255, 170, 0, 0.2)'
  };

  ${props => props.level === 'CRITICAL' && `
    animation: flashRed 1.5s ease-in-out infinite;

    @keyframes flashRed {
      0%, 100% {
        background: #1a0000;
        border-color: #ff0000;
        box-shadow: 0 2px 10px rgba(255, 0, 0, 0.2);
      }
      50% {
        background: #330000;
        border-color: #ff3333;
        box-shadow: 0 4px 20px rgba(255, 0, 0, 0.6);
      }
    }
  `}

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const LevelBadge = styled.span<{ level: string }>`
  background: ${props =>
    props.level === 'CRITICAL' ? '#ff0000' :
    props.level === 'HIGH' ? '#ff6b00' :
    '#ffaa00'
  };
  color: #000;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => props.level === 'CRITICAL' && `
    animation: pulseText 1s ease-in-out infinite;

    @keyframes pulseText {
      0%, 100% {
        background: #ff0000;
        transform: scale(1);
      }
      50% {
        background: #ff3333;
        transform: scale(1.05);
      }
    }
  `}
`;

const TimeStamp = styled.span`
  color: #888;
  font-size: 0.75rem;
`;

const TypeBadge = styled.span`
  background: #0a0a0a;
  color: #aaa;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  border: 1px solid #333;
`;

const NotificationTitle = styled.div`
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 8px;
`;

const NotificationMessage = styled.div`
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const DismissButton = styled.button`
  background: #0a0a0a;
  color: #888;
  border: 1px solid #333;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: #ff6b00;
    color: #000;
    border-color: #ff6b00;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default function NotificationBar({ notifications, onAcknowledge }: NotificationBarProps) {
  const unacknowledged = notifications.filter(n => !n.acknowledged);

  if (unacknowledged.length === 0) {
    return null;
  }

  return (
    <NotificationsContainer>
      {unacknowledged.map((notification) => (
        <NotificationCard key={notification.id} level={notification.level}>
          <NotificationContent>
            <NotificationHeader>
              <LevelBadge level={notification.level}>{notification.level}</LevelBadge>
              <TimeStamp>{notification.time}</TimeStamp>
              <TypeBadge>{notification.type}</TypeBadge>
            </NotificationHeader>
            <NotificationTitle>{notification.title}</NotificationTitle>
            <NotificationMessage>{notification.message}</NotificationMessage>
          </NotificationContent>
          <DismissButton onClick={() => onAcknowledge(notification.id)}>
            Dismiss
          </DismissButton>
        </NotificationCard>
      ))}
    </NotificationsContainer>
  );
}
