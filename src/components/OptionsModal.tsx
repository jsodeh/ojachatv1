import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Search, 
  Mic, 
  Monitor, 
  MessageSquare, 
  ShoppingCart, 
  Phone, 
  Globe,
  ChevronDown,
  ChevronUp,
  Utensils,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

export default function OptionsModal({ isOpen, onClose, onSelect }: OptionsModalProps) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const isPaidUser = subscription?.status === 'active';

  const options = [
    {
      id: 'image-search',
      label: 'Image Search',
      icon: Search,
      color: 'text-blue-500',
      description: 'Search and analyze images'
    },
    {
      id: 'voice-notes',
      label: 'Voice Notes',
      icon: Mic,
      color: 'text-purple-500',
      description: 'Record and send voice messages'
    },
    {
      id: 'screenshare',
      label: 'Screenshare',
      icon: Monitor,
      color: 'text-green-500',
      description: 'Share your screen with AI'
    },
    {
      id: 'sms-mode',
      label: 'SMS Mode',
      icon: MessageSquare,
      color: 'text-yellow-500',
      description: 'Chat via SMS'
    },
    {
      id: 'whatsapp-assistant',
      label: 'Whatsapp Assistant',
      icon: MessageSquare,
      color: 'text-green-600',
      description: 'WhatsApp integration'
    },
    {
      id: 'auto-shopper',
      label: 'Auto Shopper',
      icon: ShoppingCart,
      color: 'text-red-500',
      description: 'Automated shopping assistance'
    },
    {
      id: 'follow-up-calls',
      label: 'Follow up Calls',
      icon: Phone,
      color: 'text-indigo-500',
      description: 'Schedule and manage follow-up calls'
    },
    {
      id: 'web-shopper',
      label: 'Web Shopper',
      icon: Globe,
      color: 'text-orange-500',
      description: 'Shop online with AI assistance',
      subOptions: [
        {
          id: 'food-delivery',
          label: 'Food Delivery',
          icon: Utensils,
          color: 'text-orange-500'
        },
        {
          id: 'shop-online',
          label: 'Shop Online',
          icon: Store,
          color: 'text-blue-500'
        }
      ]
    }
  ];

  const handleOptionClick = (optionId: string) => {
    if (optionId === 'web-shopper') {
      setExpandedSection(expandedSection === 'web-shopper' ? null : 'web-shopper');
    } else {
      onSelect(optionId);
      onClose();
    }
  };

  const handleSubOptionClick = (optionId: string) => {
    onSelect(optionId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Available Features</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {options.map((option) => (
            <div key={option.id}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-4",
                  expandedSection === option.id && "bg-gray-100 dark:bg-gray-800"
                )}
                onClick={() => handleOptionClick(option.id)}
              >
                <option.icon className={cn("w-5 h-5", option.color)} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                {option.subOptions && (
                  expandedSection === option.id ? 
                    <ChevronUp className="w-5 h-5" /> : 
                    <ChevronDown className="w-5 h-5" />
                )}
              </Button>
              {option.subOptions && expandedSection === option.id && (
                <div className="ml-12 mt-2 space-y-2">
                  {option.subOptions.map((subOption) => (
                    <Button
                      key={subOption.id}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-2"
                      onClick={() => handleSubOptionClick(subOption.id)}
                    >
                      <subOption.icon className={cn("w-4 h-4", subOption.color)} />
                      <span>{subOption.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 