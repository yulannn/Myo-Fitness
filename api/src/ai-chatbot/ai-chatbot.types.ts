export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: Date;
}

export interface ChatResponse {
  message: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
}

export interface UserStats {
  totalMessages: number;
  totalConversations: number;
  lastMessageAt: Date | null;
}

export interface ClearHistoryResponse {
  success: boolean;
  deletedCount: number;
}
