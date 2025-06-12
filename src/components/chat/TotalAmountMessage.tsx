import { TotalAmount } from "@/types/chat";

interface TotalAmountMessageProps {
  amount: TotalAmount;
}

export default function TotalAmountMessage({ amount }: TotalAmountMessageProps) {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-medium text-gray-900">Order Summary</h3>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-gray-600">
          <span>Subtotal</span>
          <span>₦{amount.subtotal.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center text-gray-600">
          <span>Shipping</span>
          <span>₦{amount.shipping.toLocaleString()}</span>
        </div>
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center font-medium text-gray-900">
            <span>Total</span>
            <span>₦{amount.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 