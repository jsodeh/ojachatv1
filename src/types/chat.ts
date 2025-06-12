export type MessageRole = 'user' | 'assistant' | 'system';

export interface ActionButton {
  label: string;
  action: string;
  onClick?: (content: string, sessionId: string) => void;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  features?: string[];
}

export interface OrderStatus {
  type: 'order_status';
  message: string;
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface PaymentInstructions {
  type: 'payment_instructions';
  amount: number;
  reference: string;
  accountDetails: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface TotalAmount {
  type: 'total_amount';
  subtotal: number;
  shipping: number;
  total: number;
}

export interface ProductSummary {
  type: 'product_summary';
  count: number;
  query: string;
}

export interface ProcessUpdate {
  type: 'process_update';
  message: string;
  status?: 'info' | 'success' | 'error';
}

export interface CartSummary {
  type: 'cart_summary';
  itemCount: number;
  totalAmount: number;
}

export interface CheckoutSummary {
  type: 'checkout_summary';
  orderId: string;
  status: 'pending' | 'completed' | 'failed';
  totalAmount: number;
}

export type RichComponent = OrderStatus | PaymentInstructions | TotalAmount | ProductSummary | ProcessUpdate | CartSummary | CheckoutSummary;

export interface MessageContent {
  text: string;
  products?: Product[];
  actionButtons?: ActionButton[];
  richComponent?: RichComponent;
  rawResponse?: any;
  audioUrl?: string;
}

export interface Message {
  role: MessageRole;
  content: MessageContent;
  timestamp?: number;
}

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
};
