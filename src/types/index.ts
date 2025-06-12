export interface Message {
  role: 'user' | 'assistant';
  content: MessageContent;
  timestamp: number;
}

export interface MessageContent {
  text: string;
  products?: Product[];
  richComponent?: OrderStatus | any; // Allow for rich components like order status
  rawResponse?: any; // Allow for raw API responses
}

export interface OrderStatus {
  message: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  orderId: string;
  timestamp: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  description?: string;
  image?: string;
} 