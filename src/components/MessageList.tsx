import { Message, Product } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Copy, Share2, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ProductCarousel from './ProductCarousel';
import OrderStatusMessage from './chat/OrderStatusMessage';
import PaymentInstructionsMessage from './chat/PaymentInstructionsMessage';
import TotalAmountMessage from './chat/TotalAmountMessage';

interface MessageListProps {
  messages: Message[];
  onRetry?: (content: string, sessionId: string) => void;
  isLoading?: boolean;
  onOpenProductDetailsModal: (product: Product) => void;
  onOpenCartModal: () => void;
  onOpenCheckoutModal: (orderId: string, status: string, totalAmount: number) => void;
}

export default function MessageList({ messages, onRetry, isLoading, onOpenProductDetailsModal, onOpenCartModal, onOpenCheckoutModal }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderRichComponent = (message: Message) => {
    if (!message.content.richComponent) return null;

    const component = message.content.richComponent;
    
    switch (component.type) {
      case 'order_status':
        return <OrderStatusMessage status={component} />;
      case 'payment_instructions':
        return <PaymentInstructionsMessage instructions={component} />;
      case 'total_amount':
        return <TotalAmountMessage amount={component} />;
      case 'product_summary':
        // ProductSummary is now handled by the Message component itself to open modals
        return null; 
      case 'cart_summary':
        // CartSummary is handled by Message component
        return null;
      case 'checkout_summary':
        // CheckoutSummary is handled by Message component
        return null;
      case 'process_update':
        // ProcessUpdate is handled by Message component
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'flex flex-col max-w-[85%] md:max-w-[75%] space-y-4',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              {message.content.text && (
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5 min-w-[80px]',
                    message.role === 'user' 
                      ? 'bg-[#22C55E] text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  )}
                >
                  <div className="prose dark:prose-invert max-w-none">
                    {message.content.text}
                  </div>
                </div>
              )}
              
              {message.content.richComponent && (
                <div className="w-full max-w-sm">
                  {renderRichComponent(message)}
                </div>
              )}
              
              {message.content.products && message.content.products.length > 0 && (
                <ProductCarousel 
                  products={message.content.products}
                  className={message.role === 'user' ? 'ml-auto' : 'mr-auto'}
                />
              )}
              
              {message.role === 'assistant' && message.content.text && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => handleCopy(message.content.text)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
                    title="Copy message"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
                    title="Share message"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  {message.content.actionButtons?.some(btn => btn.label === "Retry") && (
                    <button
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
                      title="Retry"
                      onClick={() => onRetry?.(message.content.text, "current_session")}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex flex-col max-w-[85%] md:max-w-[75%] items-start">
              <div className="rounded-2xl px-4 py-2.5 min-w-[80px] rounded-bl-none bg-gray-100">
                <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}