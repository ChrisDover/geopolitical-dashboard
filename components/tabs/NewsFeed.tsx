import React, { useState } from 'react';
import styled from 'styled-components';

interface NewsArticle {
  timestamp: string;
  source: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  region: string;
  headline: string;
  url: string;
  tags: string[];
  sentiment: number;
  verified: boolean;
}

interface NewsFeedProps {
  data: NewsArticle[];
  loading: boolean;
}

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
  margin: 0 0 20px 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#ff6b00' : '#0a0a0a'};
  color: ${props => props.$active ? '#000' : '#888'};
  border: 1px solid ${props => props.$active ? '#ff6b00' : '#333'};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#ff8c33' : '#1a1a1a'};
    border-color: #ff6b00;
  }
`;

const NewsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 800px;
  overflow-y: auto;
  padding-right: 10px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #0a0a0a;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ff6b00;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #ff8c33;
  }
`;

const NewsCard = styled.div<{ $priority: string }>`
  background: #1a1a1a;
  border: 1px solid #333;
  border-left: 4px solid ${props =>
    props.$priority === 'CRITICAL' ? '#ff0000' :
    props.$priority === 'HIGH' ? '#ff6b00' :
    props.$priority === 'MEDIUM' ? '#ffaa00' :
    '#4ade80'
  };
  border-radius: 6px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    background: #242424;
    box-shadow: 0 2px 10px ${props =>
      props.$priority === 'CRITICAL' ? 'rgba(255, 0, 0, 0.2)' :
      props.$priority === 'HIGH' ? 'rgba(255, 107, 0, 0.2)' :
      'rgba(255, 170, 0, 0.2)'
    };
  }
`;

const NewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
  gap: 10px;
  flex-wrap: wrap;
`;

const BadgesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  background: ${props =>
    props.$priority === 'CRITICAL' ? '#ff0000' :
    props.$priority === 'HIGH' ? '#ff6b00' :
    props.$priority === 'MEDIUM' ? '#ffaa00' :
    '#4ade80'
  };
  color: #000;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RegionBadge = styled.span`
  background: #0a0a0a;
  color: #aaa;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  border: 1px solid #333;
`;

const VerifiedBadge = styled.span`
  background: #0e4a8f;
  color: #fff;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const TimeStamp = styled.span`
  color: #888;
  font-size: 0.8rem;
  white-space: nowrap;
`;

const NewsTitle = styled.a`
  color: #fff;
  font-size: 1.05rem;
  font-weight: 600;
  text-decoration: none;
  display: block;
  margin-bottom: 12px;
  line-height: 1.4;

  &:hover {
    color: #ff6b00;
  }
`;

const NewsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #0a0a0a;
  color: #888;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  border: 1px solid #333;
`;

const SourceInfo = styled.div`
  text-align: right;
`;

const SourceName = styled.div`
  color: #888;
  font-size: 0.8rem;
`;

const SentimentText = styled.div<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#4ade80' : '#ff0000'};
  font-size: 0.75rem;
  font-weight: 600;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const LoadingText = styled.div`
  color: #888;
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

const LoadingSubtext = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #888;
`;

export default function NewsFeed({ data = [], loading }: NewsFeedProps) {
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  // Deduplicate articles by headline (case-insensitive)
  const deduplicatedData = data.reduce((acc: NewsArticle[], current) => {
    const isDuplicate = acc.some(article =>
      article.headline.toLowerCase() === current.headline.toLowerCase()
    );
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, []);

  const filteredData = filter === 'all'
    ? deduplicatedData
    : deduplicatedData.filter(item => ['CRITICAL', 'HIGH'].includes(item.priority));

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading intelligence feed...</LoadingText>
        <LoadingSubtext>Fetching real-time events from GDELT Project</LoadingSubtext>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Real-Time Intelligence Feed</Title>
        <Subtitle>
          Live geopolitical events from verified sources worldwide
        </Subtitle>
        <FilterContainer>
          <FilterButton
            $active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All Events ({deduplicatedData.length})
          </FilterButton>
          <FilterButton
            $active={filter === 'critical'}
            onClick={() => setFilter('critical')}
          >
            Critical Only ({deduplicatedData.filter(n => ['CRITICAL', 'HIGH'].includes(n.priority)).length})
          </FilterButton>
        </FilterContainer>
      </Header>

      <NewsGrid>
        {filteredData.map((news, idx) => (
          <NewsCard key={idx} $priority={news.priority}>
            <NewsHeader>
              <BadgesContainer>
                <PriorityBadge $priority={news.priority}>
                  {news.priority}
                </PriorityBadge>
                <RegionBadge>{news.region}</RegionBadge>
                {news.verified && <VerifiedBadge>✓ Verified</VerifiedBadge>}
              </BadgesContainer>
              <TimeStamp>
                {new Date(news.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TimeStamp>
            </NewsHeader>

            <NewsTitle href={news.url} target="_blank" rel="noopener noreferrer">
              {news.headline}
            </NewsTitle>

            <NewsFooter>
              <TagsContainer>
                {news.tags.slice(0, 4).map((tag, i) => (
                  <Tag key={i}>{tag}</Tag>
                ))}
              </TagsContainer>
              <SourceInfo>
                <SourceName>{news.source}</SourceName>
                {news.sentiment !== 0 && (
                  <SentimentText $positive={news.sentiment > 0}>
                    Sentiment: {(news.sentiment * 100).toFixed(0)}
                  </SentimentText>
                )}
              </SourceInfo>
            </NewsFooter>
          </NewsCard>
        ))}

        {filteredData.length === 0 && (
          <EmptyState>
            No news items found
          </EmptyState>
        )}
      </NewsGrid>
    </Container>
  );
}
