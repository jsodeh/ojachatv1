import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const ProductDetailsModal = ({ isOpen, onClose, product }: ProductDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Details for {product.name}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-1 gap-4 py-4">
            <div key={product.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
              <p className="text-gray-700 text-lg mb-2">₦{product.price.toLocaleString()}</p>
              <p className="text-gray-600 text-base">{product.description}</p>
              {product.features && product.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-md mb-2">Features:</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal; 