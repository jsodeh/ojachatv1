import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Copy, Share2, RotateCcw, ShoppingCart, Store, CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useRef, useMemo } from 'react';
import ProductCarousel from './ProductCarousel';
import OrderStatusMessage from './chat/OrderStatusMessage';
import PaymentInstructionsMessage from './chat/PaymentInstructionsMessage';
import TotalAmountMessage from './chat/TotalAmountMessage';

interface MessageListProps {
  messages: Message[];
  onRetry?: (content: string, sessionId: string) => void;
  isLoading?: boolean;
}

// Timeline components
const TimelineContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex flex-col gap-8 pl-8 border-l-2 border-dashed border-green-200 dark:border-green-700">
    {children}
  </div>
);

const TimelineStep = ({
  icon,
  label,
  children,
  active,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  last?: boolean;
}) => (
  <div className="relative flex items-start group">
    {/* Timeline node */}
    <div className="absolute -left-8 flex flex-col items-center">
      <div className={`rounded-full bg-white dark:bg-green-900 border-2 border-green-400 shadow w-8 h-8 flex items-center justify-center z-10 ${active ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      {/* Animated vertical line */}
      {!last && (
        <div className={`w-1 h-full bg-gradient-to-b from-green-300 to-green-100 dark:from-green-700 dark:to-green-900 ${active ? 'animate-timeline-pulse' : ''}`}></div>
      )}
    </div>
    <div className="ml-4 flex-1">
      <div className="text-xs text-green-700 dark:text-green-300 font-semibold mb-1">{label}</div>
      <div className="bg-white dark:bg-green-950 rounded-xl shadow p-4 border border-green-100 dark:border-green-800">
        {children}
      </div>
    </div>
  </div>
);

// Timeline animation (inject only once)
if (typeof window !== 'undefined' && !document.getElementById('timeline-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'timeline-pulse-style';
  style.innerHTML = `.animate-timeline-pulse { animation: timeline-pulse 1.2s infinite; } @keyframes timeline-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`;
  document.head.appendChild(style);
}

export default function MessageList({ messages, onRetry, isLoading }: MessageListProps) {
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
      default:
        return null;
    }
  };

  // Group assistant messages for timeline
  const timelineSteps = useMemo(() =>
    messages
      .map((message, idx) => ({ message, idx }))
      .filter(({ message }) => message.role === 'assistant'),
    [messages]
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
        {messages.map((message, index) =>
          (message.role as string) === 'user' ? (
            <div key={index} className="flex w-full justify-end">
              <div className="flex flex-col max-w-[85%] md:max-w-[75%] items-end space-y-4">
                {message.content.text && (
                  <div className="rounded-2xl px-4 py-2.5 min-w-[80px] bg-[#22C55E] text-white rounded-br-none">
                    <div className="prose dark:prose-invert max-w-none">{message.content.text}</div>
                  </div>
                )}
                {message.content.richComponent && (
                  <div className="w-full max-w-sm">
                    {renderRichComponent(message)}
                  </div>
                )}
                {message.content.products && message.content.products.length > 0 && (
                  <ProductCarousel products={message.content.products} className="" />
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
          ) : null
        )}
        <TimelineContainer>
          {timelineSteps.map(({ message, idx }, i) => {
            // Pick icon and label based on message content
            let icon = <Store className="h-5 w-5 text-green-600" />;
            let label = "Assistant";
            if (message.content.products) {
              icon = <ShoppingCart className="h-5 w-5 text-green-600" />;
              label = "Product Search";
            } else if (message.content.richComponent?.type === 'payment_instructions') {
              icon = <CreditCard className="h-5 w-5 text-green-600" />;
              label = "Payment";
            } else if (message.content.richComponent?.type === 'order_status') {
              icon = <Loader2 className="h-5 w-5 text-green-600 animate-spin" />;
              label = "Order Status";
            }
            const isActive = isLoading && i === timelineSteps.length - 1;
            const isLast = i === timelineSteps.length - 1;
            return (
              <TimelineStep key={idx} icon={icon} label={label} active={isActive} last={isLast && !isLoading}>
                {message.content.text && (
                  <div className="prose dark:prose-invert max-w-none mb-2">{message.content.text}</div>
                )}
                {message.content.richComponent && (
                  <div className="w-full max-w-sm mb-2">{renderRichComponent(message)}</div>
                )}
                {message.content.products && message.content.products.length > 0 && (
                  <ProductCarousel products={message.content.products} className="" />
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
              </TimelineStep>
            );
          })}
          {isLoading && (
            <TimelineStep icon={<Loader2 className="h-5 w-5 text-green-600 animate-spin" />} label="Thinking" active last>
              <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse"></div>
            </TimelineStep>
          )}
        </TimelineContainer>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}