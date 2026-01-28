export enum ModelProvider {
  GPT = 'GPT',
  GEMINI = 'GEMINI',
  DEEPSEEK = 'DEEPSEEK'
}

export interface ModelResponse {
  provider: ModelProvider;
  content: string;
  loading: boolean;
  error?: string;
  duration?: number; // Execution time in ms
}

export interface ComparisonResult {
  [ModelProvider.GPT]: ModelResponse;
  [ModelProvider.GEMINI]: ModelResponse;
  [ModelProvider.DEEPSEEK]: ModelResponse;
}

export interface ApiRequest {
  question: string;
}