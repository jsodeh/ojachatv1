import { useState, useEffect } from 'react';
import { Crown, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubscription } from '@/hooks/useSubscription';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'chats' | 'words' | 'deliveries' | 'voice';
  onUpgradeClick?: () => void;
}

export default function LimitReachedModal({ 
  isOpen, 
  onClose, 
  limitType,
  onUpgradeClick 
}: LimitReachedModalProps) {
  const { currentSubscription, plans } = useSubscription();
  const [currentPlan, setCurrentPlan] = useState<string>('Basic');
  const [nextPlan, setNextPlan] = useState<{name: string, price: number} | null>(null);

  // Set current plan and next upgrade option
  useEffect(() => {
    if (currentSubscription?.plan) {
      setCurrentPlan(currentSubscription.plan.name);
      
      // Find the next tier plan
      const sortedPlans = [...plans].sort((a, b) => a.price - b.price);
      const currentPlanIndex = sortedPlans.findIndex(p => p.id === currentSubscription.plan?.id);
      
      if (currentPlanIndex !== -1 && currentPlanIndex < sortedPlans.length - 1) {
        const upgradePlan = sortedPlans[currentPlanIndex + 1];
        setNextPlan({
          name: upgradePlan.name,
          price: upgradePlan.price
        });
      }
    } else {
      setCurrentPlan('Basic');
      
      // If no subscription, suggest the first paid plan
      const firstPaidPlan = plans.find(p => p.price > 0);
      if (firstPaidPlan) {
        setNextPlan({
          name: firstPaidPlan.name,
          price: firstPaidPlan.price
        });
      }
    }
  }, [currentSubscription, plans]);

  // Get limit message based on type
  const getLimitMessage = () => {
    switch (limitType) {
      case 'chats':
        return "You've reached your monthly chat limit";
      case 'words':
        return "You've reached your monthly word limit";
      case 'deliveries':
        return "You've used all your free deliveries this month";
      case 'voice':
        return "You've used all your voice minutes for this month";
      default:
        return "You've reached a usage limit on your current plan";
    }
  };

  // Get feature message based on type
  const getFeatureMessage = () => {
    switch (limitType) {
      case 'chats':
        return `With ${nextPlan?.name}, you'll get unlimited chats`;
      case 'words':
        return `With ${nextPlan?.name}, you'll get more words per month`;
      case 'deliveries':
        return `With ${nextPlan?.name}, you'll get more free deliveries`;
      case 'voice':
        return `With ${nextPlan?.name}, you'll get more voice minutes`;
      default:
        return `Upgrade to ${nextPlan?.name} for more features`;
    }
  };

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-amber-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {getLimitMessage()}
          </DialogTitle>
          <DialogDescription>
            You're currently on the <span className="font-semibold">{currentPlan}</span> plan.
            Upgrade to continue using this feature.
          </DialogDescription>
        </DialogHeader>

        {nextPlan && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 my-4">
            <h3 className="font-semibold text-green-700 flex items-center mb-2">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {nextPlan.name}
            </h3>
            <p className="text-sm text-green-600 mb-2">
              {getFeatureMessage()}
            </p>
            <p className="text-sm font-semibold text-green-800">
              ₦{nextPlan.price.toLocaleString()}/month
            </p>
          </div>
        )}

        <DialogFooter className="flex sm:justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          
          <Button 
            onClick={handleUpgrade}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 