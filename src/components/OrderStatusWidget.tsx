import { CheckCircle } from "lucide-react";

interface OrderStatusWidgetProps {
  message: string;
}

export default function OrderStatusWidget({ message }: OrderStatusWidgetProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md animate-slide-up">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-green-900">Order Status</h3>
          <p className="text-green-700 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
} 