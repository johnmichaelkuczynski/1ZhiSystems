// AI Service Types and Configurations
export type AIProvider = 'openai' | 'anthropic' | 'perplexity' | 'deepseek';

export interface AIServiceConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
}

export const AI_PROVIDERS: Record<AIProvider, AIServiceConfig> = {
  openai: {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 4000
  },
  anthropic: {
    provider: 'anthropic', 
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4000
  },
  perplexity: {
    provider: 'perplexity',
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 4000
  },
  deepseek: {
    provider: 'deepseek',
    model: 'deepseek-chat',
    maxTokens: 4000
  }
};

export interface TextProcessingRequest {
  selectedText: string;
  action: 'rewrite' | 'study-guide' | 'test' | 'podcast' | 'cognitive-map' | 'summary-thesis' | 'thesis-deep-dive' | 'suggested-readings';
  provider: AIProvider;
  customInstructions?: string;
  includeAudio?: boolean;
  voiceSelection?: string;
  podcastMode?: 'normal-one' | 'normal-two' | 'custom-one' | 'custom-two';
  podcastInstructions?: string;
}

export interface TestQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
}

export interface TestResult {
  questions: TestQuestion[];
  userAnswers: Record<number, string>;
  score: number;
  totalQuestions: number;
  feedback: string;
}

export interface PodcastScript {
  title: string;
  introduction: string;
  mainContent: string;
  conclusion: string;
  estimatedDuration: string;
  audioUrl?: string;
  mode: 'normal-one' | 'normal-two' | 'custom-one' | 'custom-two';
  hosts?: {
    name: string;
    role: string;
  }[];
}

export interface CognitiveMap {
  centralConcept: string;
  nodes: {
    id: string;
    label: string;
    type: 'central' | 'primary' | 'secondary' | 'detail';
    x: number;
    y: number;
    color: string;
  }[];
  connections: {
    from: string;
    to: string;
    label: string;
    type: 'strong' | 'weak' | 'causal' | 'conceptual';
  }[];
  insights: string[];
}

export interface SummaryThesis {
  thesis: string;
  summary: string;
}

export interface SuggestedReadings {
  primarySources: {
    title: string;
    author: string;
    relevance: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }[];
  supplementaryReadings: {
    title: string;
    author: string;
    relevance: string;
    type: 'article' | 'book' | 'paper' | 'website';
  }[];
}