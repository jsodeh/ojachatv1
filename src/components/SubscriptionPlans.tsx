import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription'; // Using the hook from your earlier message
import { SubscriptionPlan } from '@/types/subscription';
import { Separator } from '@radix-ui/react-separator'; // Assuming Separator might be useful for free plan features

export default function SubscriptionPlans() {
  const [isLoading, setIsLoading] = useState(false);
  const { subscription, upgradeSubscription } = useSubscription();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await upgradeSubscription(selectedPlan as SubscriptionPlan, 'monthly'); // Assuming monthly for now, adjust if needed
      toast.success('Subscription upgraded successfully');
    } catch (error) {
      toast.error('Failed to upgrade subscription');
      console.error('Upgrade error:', error);
    } finally {
      setIsLoading(false);
    }
  };
 const { plans, loading, error, subscribeToPlan } = useSubscription();
 const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

 const freePlan = plans.find(plan => plan.price === 0); // Assuming price 0 indicates the free plan
 const paidPlans = plans.filter(plan => plan.price > 0);

 // Dummy handleCheckout function - replace with your actual Flutterwave logic
  const handleCheckout = async (planId: string) => {
    setSelectedPlanId(planId);
    setIsLoading(true);
    try {
      // Replace with your actual Flutterwave checkout initiation logic
      console.log(`Initiating checkout for plan: ${planId}`);
      // Example: Call an API endpoint to create a Flutterwave checkout link
      // const response = await fetch('/api/create-flutterwave-link', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ planId }),
      // });
      // const data = await response.json();
      // if (data.checkout_url) {
      //   window.location.href = data.checkout_url; // Redirect to Flutterwave
      // } else {
      //   toast.error('Failed to create checkout link');
      // }
       toast.success(`Simulating checkout for plan: ${planId}`);
    } catch (error) {
      toast.error('Failed to initiate checkout');
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Content goes here */}
    </div>
  );
} 