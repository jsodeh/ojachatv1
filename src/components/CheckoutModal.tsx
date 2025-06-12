import { ChevronLeft, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import DeliveryTimeTrigger from "@/components/DeliveryTimeTrigger";
import MapPicker from "@/components/MapPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  status: string;
  totalAmount: number;
}

const PAYMENT_METHODS = [
  {
    id: "credit-card",
    name: "Credit Card",
    icon: "/mastercard-logo.png",
  },
  {
    id: "paypal",
    name: "Paypal",
    icon: "/paypal-logo.png",
  },
  {
    id: "google-pay",
    name: "Google Pay",
    icon: "/google-pay-logo.png",
  },
];

const SHIPPING_FEE = 50.00;

const CheckoutModal = ({ isOpen, onClose, orderId, status, totalAmount }: CheckoutModalProps) => {
  const { items, totalAmount: cartTotalAmount } = useCart();
  const [location, setLocation] = useState<Location | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<{
    date: Date;
    timeSlot: string;
  } | null>(null);

  const handleDeliveryTimeSelected = (date: Date, timeSlot: string) => {
    setSelectedDeliveryTime({ date, timeSlot });
  };

  const handleLocationSelected = (selectedLocation: Location) => {
    setLocation(selectedLocation);
    setIsMapOpen(false);
  };

  const handlePayment = () => {
    if (!location || !selectedDeliveryTime) {
      alert("Please select both delivery location and time");
      return;
    }
    
    console.log("Processing payment with:", {
      location,
      deliveryTime: selectedDeliveryTime,
      items,
      totalAmount: cartTotalAmount + SHIPPING_FEE
    });
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Order #{orderId} - {status === 'completed' ? 'Complete' : 'Status'}</DialogTitle>
            <DialogDescription>
              {status === 'completed' ? 
                `Your order has been successfully placed!` : 
                `Current status of your order.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-lg font-semibold">Total Amount: ${totalAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Status: <span className={`font-medium ${status === 'completed' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
            {/* Add more order details here if available, e.g., estimated delivery, items summary */}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={onClose}>Close</Button>
            {/* Potentially add a button to view order history or track order */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelected}
      />
    </>
  );
};

export default CheckoutModal; 