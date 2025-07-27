import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  query: string;
}

const ProductDetailsModal = ({ isOpen, onClose, products, query }: ProductDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Products Found for "{query}"</DialogTitle>
          <DialogDescription>
            Here are the details for the products found based on your query.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-md mb-2" />
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-1">${product.price.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">No products to display.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal; 