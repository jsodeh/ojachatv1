import { OrderStatus } from "@/types/chat";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderStatusMessageProps {
  status: OrderStatus;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  processing: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

export default function OrderStatusMessage({ status }: OrderStatusMessageProps) {
  const config = statusConfig[status.status];
  const Icon = config.icon;

  return (
    <div className={`w-full rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div>
          <h3 className={`font-medium ${config.color}`}>Order Status Update</h3>
          <p className={`mt-1 ${config.color.replace('600', '700')}`}>
            {status.message}
          </p>
          <p className="text-sm mt-2 text-gray-500">
            Order ID: {status.orderId}
          </p>
        </div>
      </div>
    </div>
  );
} 