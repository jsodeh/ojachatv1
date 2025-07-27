import { ChevronLeft, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import DeliveryTimeTrigger from "@/components/DeliveryTimeTrigger";
import MapPicker from "@/components/MapPicker";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalAmount } = useCart();
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
      totalAmount: totalAmount + SHIPPING_FEE
    });
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-white text-gray-900 sm:max-w-[600px] flex flex-col h-[85vh] p-0">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b bg-white">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Delivery Location */}
              <div>
                <h2 className="text-lg font-medium mb-4 text-gray-900">Delivery Location</h2>
                <button
                  onClick={() => setIsMapOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">
                      {location ? location.address : 'Select delivery location'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Delivery Time */}
              <div>
                <h2 className="text-lg font-medium mb-4 text-gray-900">Delivery Time</h2>
                <DeliveryTimeTrigger 
                  onTimeSelected={handleDeliveryTimeSelected}
                  location={location?.address}
                />
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-medium mb-4 text-gray-900">Payment Method</h2>
                <RadioGroup defaultValue="credit-card" className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-3 bg-white p-4 rounded-xl border hover:bg-gray-50"
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="h-6 w-auto"
                      />
                      <label
                        htmlFor={method.id}
                        className="flex-1 text-sm font-medium cursor-pointer text-gray-700"
                      >
                        {method.name}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3 border">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping Fee</span>
                  <span>₦{SHIPPING_FEE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sub total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-3 border-t text-gray-900">
                  <span>Total</span>
                  <span>₦{(totalAmount + SHIPPING_FEE).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6"
                onClick={handlePayment}
                disabled={!location || !selectedDeliveryTime}
              >
                {!location || !selectedDeliveryTime 
                  ? "Please select delivery location and time"
                  : "Proceed to Payment"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelected}
      />
    </>
  );
} 