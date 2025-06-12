import { Product } from "@/types/chat";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { toast } from "sonner";
import { X, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Add debug logging
  console.log('ProductModal rendered with:', { product, isOpen });

  const getProxiedImageUrl = (url: string) => {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=placeholder`;
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image,
      quantity,
      color: selectedColor || undefined,
    });
    
    toast("Added to cart", {
      description: `${quantity}x ${product.name} added to your cart`,
      duration: 2000,
      className: "bg-white text-black border border-gray-200",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white text-gray-900 max-w-[90vw] md:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={getProxiedImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">{product.name}</h2>
            
            {product.description && (
              <p className="text-gray-600 mb-4">{product.description}</p>
            )}
            
            {product.price !== undefined && (
              <div className="text-xl font-bold mb-6 text-gray-900">
                ₦{product.price.toLocaleString()}
              </div>
            )}
            
            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 text-gray-600"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-12 text-center text-gray-900 font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 text-gray-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "text-sm",
                          selectedColor === color 
                            ? "bg-gray-900 text-white hover:bg-gray-800" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-auto"
              size="lg"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal; 