export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatHistory {
  messages: Message[];
  timestamp: number;
} 