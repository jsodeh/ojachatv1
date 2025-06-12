import { Product } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import ProductModal from "./ProductModal";
import AuthModal from "./AuthModal";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCarouselProps {
  products: Product[];
  className?: string;
}

const ProductCarousel = ({ products, className }: ProductCarouselProps) => {
  const { isAuthenticated } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const getProxiedImageUrl = (url: string) => {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=placeholder`;
  };

  if (!products || products.length === 0) {
    return null;
  }

  const validProducts = products.filter(product => {
    const hasRequiredFields = product.id && product.name && product.image;
    if (!hasRequiredFields) {
      console.warn('Product missing required fields:', product);
    }
    return hasRequiredFields;
  });

  const handleProductClick = (product: Product) => {
    console.log('Click detected on product:', product);
    setSelectedProduct(product);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  };

  const handleImageError = (product: Product, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageErrors(prev => ({
      ...prev,
      [product.id]: true
    }));
  };

  return (
    <>
      <div className={cn("w-full my-4", className)}>
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
          {validProducts.map((product) => (
            <Card 
              key={product.id}
              className="cursor-pointer hover:scale-[1.02] transition-transform duration-200 overflow-hidden flex-shrink-0 w-[140px] sm:w-[160px]"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative">
                <button 
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteClick(e);
                  }}
                >
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
                
                <div className="relative aspect-square">
                  <img
                    src={getProxiedImageUrl(product.image)}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(product, e)}
                  />
                  {imageErrors[product.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <span className="text-sm text-gray-500">Image unavailable</span>
                    </div>
                  )}
                </div>
                
                <div className="p-2">
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {product.rating.toFixed(1)}
                        {product.ratingCount ? ` (${product.ratingCount})` : ''}
                      </span>
                    </div>
                  )}
                  <h3 className="font-medium text-sm mb-1 text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {product.price !== undefined && (
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      ₦{product.price.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default ProductCarousel; 