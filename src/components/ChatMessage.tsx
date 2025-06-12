import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import ProductCarousel from "./ProductCarousel";

interface ChatMessageProps {
  message: Message;
  className?: string;
}

const ChatMessage = ({ message, className }: ChatMessageProps) => {
  console.log('ChatMessage received:', message); // Debug log
  
  // Parse the response if it's a string containing JSON
  let cleanText = message.content.text;
  let products = [];
  
  try {
    // First try to get products from rawResponse
    if (message.content.rawResponse?.products) {
      products = message.content.rawResponse.products;
    }
    // If no products in rawResponse, try parsing the text content
    else if (typeof cleanText === 'string' && cleanText.includes('"rawResponse"')) {
      const parsedResponse = JSON.parse(cleanText);
      cleanText = parsedResponse.text || cleanText;
      if (parsedResponse.rawResponse?.products) {
        products = parsedResponse.rawResponse.products;
      }
    }
    
    // Validate products array
    products = products.filter((product: any) => {
      if (!product || typeof product !== 'object') return false;
      return product.id && product.name && product.image;
    });
    
    console.log('Parsed and validated products:', products); // Debug log
  } catch (e) {
    console.error('Error parsing message content:', e);
    products = [];
  }
  
  return (
    <div className={cn(
      "flex w-full",
      message.role === "assistant" ? "justify-start" : "justify-end",
      className
    )}>
      <div className={cn(
        "max-w-[85%] rounded-lg px-4 py-2",
        message.role === "assistant" ? "bg-gray-100" : "bg-blue-500 text-white"
      )}>
        <div className="whitespace-pre-wrap">{cleanText}</div>
        {products.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mt-2 mb-1">Found {products.length} products:</p>
            <ProductCarousel products={products} className="mt-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 