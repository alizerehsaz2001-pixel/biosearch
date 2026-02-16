export type AppMode = 'QUERY_BUILDER' | 'PICO_PROTOCOL' | 'ABSTRACT_SCREENER' | 'DATA_EXTRACTOR' | 'CRITICAL_ANALYST' | 'ISO_COMPLIANCE_AUDITOR' | 'NOVELTY_GENERATOR' | 'IMAGE_ANALYZER' | 'RESOURCE_SCOUT' | 'OPEN_ACCESS_FINDER' | 'LAB_SCOUT' | 'PROTOCOL_TROUBLESHOOTER' | 'ACADEMIC_EMAIL_DRAFTER' | 'ML_DEEP_LEARNING_ARCHITECT' | 'PPT_ARCHITECT' | 'PRECISION_SEARCH_COMMANDER';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  id: string;
  originalQuery: string;
  content: string;
  type: AppMode;
  timestamp: number;
  sources?: GroundingSource[];
  isSaved?: boolean;
}

export interface GenerationError {
  message: string;
}

export interface UserProfile {
  email: string;
  education: string;
  institution: string;
  level: string;
  experience: string;
}

export enum QueryStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}