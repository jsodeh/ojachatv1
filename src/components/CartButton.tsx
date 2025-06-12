import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface CartButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
}

const CartButton = ({ variant = "ghost", size = "icon", onClick }: CartButtonProps) => {
  const { totalItems } = useCart();

  return (
    <Button
      variant={variant}
      size={size}
      className="relative"
      onClick={onClick}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {totalItems}
        </span>
      )}
    </Button>
  );
};

export default CartButton; 