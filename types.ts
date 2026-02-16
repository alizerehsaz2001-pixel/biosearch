export type AppMode = 'QUERY_BUILDER' | 'PICO_PROTOCOL' | 'ABSTRACT_SCREENER' | 'DATA_EXTRACTOR' | 'CRITICAL_ANALYST' | 'ISO_COMPLIANCE_AUDITOR' | 'NOVELTY_GENERATOR' | 'IMAGE_ANALYZER' | 'RESOURCE_SCOUT' | 'OPEN_ACCESS_FINDER' | 'LAB_SCOUT' | 'PROTOCOL_TROUBLESHOOTER';

export interface SearchResult {
  id: string;
  originalQuery: string;
  content: string;
  type: AppMode;
  timestamp: number;
}

export interface GenerationError {
  message: string;
}

export enum QueryStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}