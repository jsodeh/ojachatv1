import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import OrderStatusWidget from "./OrderStatusWidget";
import { OrderStatus } from "@/types/chat";
import AuthModal from "./AuthModal";
import { useAuth } from "@/contexts/AuthContext";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void; // Original prop to trigger checkout process
  onOrderStatus?: (status: OrderStatus) => void; // Added back as it's used
}

const CartModal = ({ isOpen, onClose, onCheckout, onOrderStatus }: CartModalProps) => {
  const { items, updateQuantity, removeItem, totalItems, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(false);

  const getProxiedImageUrl = (url: string) => {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=placeholder`;
  };

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setPendingOrder(true);
      return;
    }
    setIsProcessing(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Please sign in to place an order');
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: user.id,
            cart_items: items,
            total_amount: totalAmount, // Use totalAmount from useCart()
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setShowOrderStatus(true);
      
      if (onOrderStatus && data) {
        const orderStatus: OrderStatus = {
          type: 'order_status',
          message: 'Your order has been received and is being processed',
          orderId: data.id,
          status: 'pending'
        };
        onOrderStatus(orderStatus);
      }
      
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setShowOrderStatus(false);
        }, 3000);
      }, 2000);

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
      setPendingOrder(false);
    }
  };

  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
  };

  useEffect(() => {
    if (isAuthenticated && pendingOrder) {
      setShowAuthModal(false);
      setPendingOrder(false);
      handleCreateOrder();
    }
  }, [isAuthenticated, pendingOrder]); // Added pendingOrder to dependency array

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-[600px] mx-auto px-5 sm:px-6 max-w-[90%] rounded-lg">
          <div className="p-4 md:p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600">Start adding some items to your cart!</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-[600px] flex flex-col h-[85vh] py-0 px-5 sm:p-0 mx-2 md:mx-auto">
          <div className="flex justify-between items-center border-b p-4 px-5 sm:px-4 bg-white">
            <h2 className="text-xl font-semibold text-gray-900">
              Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 px-5 sm:px-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.color || 'default'}`}
                  className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg relative group hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(item.id)}
                >
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                    <img
                      src={getProxiedImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate group-hover:text-gray-700">{item.name}</h3>
                    {item.color && (
                      <p className="text-sm text-gray-500 mt-1">Color: {item.color}</p>
                    )}
                    <p className="text-sm font-medium text-gray-900 mt-1">₦{item.price.toLocaleString()}</p>

                    <div className="flex items-center gap-1 md:gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1), item.color)}
                        className="h-7 w-7 md:h-8 md:w-8 bg-white hover:bg-gray-50"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 md:w-8 text-center text-gray-900">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color)}
                        className="h-7 w-7 md:h-8 md:w-8 bg-white hover:bg-gray-50"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id, item.color);
                    }}
                    className="text-gray-400 hover:text-gray-600 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t bg-white p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-lg font-semibold text-gray-900">₦{totalAmount.toLocaleString()}</span>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white" 
              size="lg"
              onClick={handleCreateOrder}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Send your order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showOrderStatus && (
        <OrderStatusWidget message="Your order has been sent for processing" />
      )}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default CartModal; 