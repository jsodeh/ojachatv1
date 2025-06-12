import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import ProductCarousel from './ProductCarousel';
import OrderStatusWidget from './OrderStatusWidget';
import { Message as MessageType, ActionButton, RichComponent, Product, ProductSummary, ProcessUpdate, CartSummary, CheckoutSummary } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageProps extends MessageType {
  sessionId: string;
  onOpenProductDetailsModal: (products: Product[], query: string) => void;
  onOpenCartModal: (itemCount: number, totalAmount: number) => void;
  onOpenCheckoutModal: (orderId: string, status: string, totalAmount: number) => void;
}

const Message = ({ role, content, timestamp, sessionId, onOpenProductDetailsModal, onOpenCartModal, onOpenCheckoutModal }: MessageProps) => {
  const renderRichComponent = (component: RichComponent) => {
    switch (component.type) {
      case 'order_status': {
        return <OrderStatusWidget message={component.message} />;
      }
      case 'payment_instructions': {
        return (
          <div className="bg-grok-light-surface dark:bg-grok-dark-surface p-4 rounded-lg shadow-md mt-2">
            <h4 className="font-semibold text-lg mb-2">Payment Instructions</h4>
            <p className="text-sm">Amount: ${component.amount.toFixed(2)}</p>
            <p className="text-sm">Reference: {component.reference}</p>
            <p className="text-sm">Bank: {component.accountDetails.bank}</p>
            <p className="text-sm">Account Number: {component.accountDetails.accountNumber}</p>
            <p className="text-sm">Account Name: {component.accountDetails.accountName}</p>
          </div>
        );
      }
      case 'total_amount': {
        return (
          <div className="bg-grok-light-surface dark:bg-grok-dark-surface p-4 rounded-lg shadow-md mt-2">
            <h4 className="font-semibold text-lg mb-2">Order Summary</h4>
            <p className="text-sm flex justify-between"><span>Subtotal:</span><span>${component.subtotal.toFixed(2)}</span></p>
            <p className="text-sm flex justify-between"><span>Shipping:</span><span>${component.shipping.toFixed(2)}</span></p>
            <hr className="my-2 border-grok-light-border dark:border-grok-dark-border" />
            <p className="text-lg font-bold flex justify-between"><span>Total:</span><span>${component.total.toFixed(2)}</span></p>
          </div>
        );
      }
      case 'product_summary': {
        const productSummary = component as ProductSummary;
        return (
          <div 
            className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 cursor-pointer border border-gray-300 dark:border-gray-600 inline-flex items-center gap-2 mt-2 text-sm"
            onClick={() => onOpenProductDetailsModal(content.products || [], productSummary.query)}
          >
            <span className="font-semibold">Found {productSummary.count} products for "{productSummary.query}"</span>
          </div>
        );
      }
      case 'process_update': {
        const processUpdate = component as ProcessUpdate;
        const statusColor = processUpdate.status === 'error' ? 'text-red-500' : processUpdate.status === 'success' ? 'text-green-500' : 'text-gray-500';
        return (
          <div className={`text-sm ${statusColor} italic mt-2`}>
            {processUpdate.message}
          </div>
        );
      }
      case 'cart_summary': {
        const cartSummary = component as CartSummary;
        return (
          <div 
            className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 inline-flex items-center gap-2 mt-2 text-sm"
            onClick={() => onOpenCartModal(cartSummary.itemCount, cartSummary.totalAmount)}
          >
            <span className="font-semibold">Cart: {cartSummary.itemCount} items, Total: ${cartSummary.totalAmount.toFixed(2)}</span>
          </div>
        );
      }
      case 'checkout_summary': {
        const checkoutSummary = component as CheckoutSummary;
        const checkoutStatusColor = checkoutSummary.status === 'failed' ? 'text-red-500' : checkoutSummary.status === 'completed' ? 'text-green-500' : 'text-gray-500';
        return (
          <div 
            className={`bg-gray-100 dark:bg-gray-700 rounded-md p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 inline-flex items-center gap-2 mt-2 text-sm ${checkoutStatusColor}`}
            onClick={() => onOpenCheckoutModal(checkoutSummary.orderId, checkoutSummary.status, checkoutSummary.totalAmount)}
          >
            <span className="font-semibold">Checkout {checkoutSummary.status === 'completed' ? 'Complete' : 'Status'}: Order #{checkoutSummary.orderId} - Total: ${checkoutSummary.totalAmount.toFixed(2)}</span>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role === 'assistant'} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex flex-col items-end' : ''}`}>
          <div className={cn(
            role === 'user' ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block' : 'bg-gray-100 rounded-lg px-4 py-2',
            'max-w-[85%]'
          )}>
            {content.text}
            {content.audioUrl && (
              <audio controls src={content.audioUrl} className="mt-2 w-full"></audio>
            )}
          </div>
          {content.richComponent && role === 'assistant' && renderRichComponent(content.richComponent)}
          {content.actionButtons && content.actionButtons.length > 0 && role === 'assistant' && (
            <div className="flex flex-wrap gap-2 mt-2">
              {content.actionButtons.map((button: ActionButton, index: number) => (
                <Button 
                  key={index} 
                  onClick={() => button.onClick && button.onClick(button.action, sessionId)}
                  variant="secondary" 
                  className="text-grok-blue border-grok-blue-dark hover:bg-grok-blue-light"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
          {role === 'assistant' && <MessageActions />}
        </div>
      </div>
    </div>
  );
};

export default Message;