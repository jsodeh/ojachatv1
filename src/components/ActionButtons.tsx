import { ImagePlus, FileText, BarChart2, ShoppingCart, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

const ActionButtons = ({ onSend }: { onSend: (message: string) => void }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const actions = [
    { icon: <ImagePlus className="h-4 w-4 text-purple-500" />, label: "Buy Foodstuff", message: "I want to buy foodstuff" },
    { icon: <FileText className="h-4 w-4 text-blue-500" />, label: "Check Prices", message: "I want to check prices" },
    { icon: <BarChart2 className="h-4 w-4 text-green-500" />, label: "Buy Medicine", message: "I want to buy medicine" },
    { icon: <ShoppingCart className="h-4 w-4 text-amber-500" />, label: "Market Runs", message: "I want to do a market run" },
    { icon: <HelpCircle className="h-4 w-4 text-red-500" />, label: "Find a Product", message: "I want to find a product" },
  ];

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-6 mb-2">
      {actions.map((action) => (
        <button 
          key={action.label} 
          className="relative flex h-[38px] items-center gap-1.5 rounded-lg border border-grok-light-border dark:border-grok-dark-border bg-grok-light-button-bg dark:bg-grok-dark-button-bg px-3 py-1.5 text-start text-xs font-medium shadow-sm text-grok-light-text-primary dark:text-grok-dark-text-primary transition-all hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover hover:border-grok-light-border dark:hover:border-grok-dark-border p-[2px]"
          onClick={() => onSend(action.message)}
        >
          {action.icon}
          <span className="max-w-[90px] truncate">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;