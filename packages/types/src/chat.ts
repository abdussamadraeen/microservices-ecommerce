// Chat types for Gemini AI integration
export type Role = 'user' | 'model';

export interface ChatMessage {
  role: Role;
  text: string;
  isError?: boolean;
}

// Google Gemini SDK types
export interface GeminiHistoryItem {
  role: Role;
  parts: { text: string }[];
}
