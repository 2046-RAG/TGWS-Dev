// Shared types for the search pipeline.

export interface SearchFilters {
  contentType?: string[];
  pillar?: string[];
  industry?: string[];
}

export interface SearchRequest {
  query: string;
  type?: 'text' | 'image';
  imageData?: string;
  filters?: SearchFilters;
  locale?: string;
}

export interface SearchResult {
  id: string;
  type: 'product' | 'solution' | 'blog' | 'faq';
  title: string;
  titleZh?: string;
  description: string;
  descriptionZh?: string;
  url: string;
  category?: string;
  pillar?: string;
  industry?: string;
  source: 'internal';
  relevanceScore: number;
}

export interface ExternalResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'google' | 'tavily';
  relevanceScore: number;
}
