import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryCheckoutProps {
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function DeliveryCheckout({ onSuccess, onCancel }: DeliveryCheckoutProps) {
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { subscription, createDeliveryTransaction } = useSubscription();

  const deliveryCosts = {
    standard: 5.99,
    express: 9.99
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setIsLoading(true);
    try {
      const transaction = await createDeliveryTransaction({
        address: address.trim(),
        type: deliveryType,
        amount: deliveryCosts[deliveryType]
      });

      toast.success('Delivery transaction created successfully');
      onSuccess(transaction.id);
    } catch (error) {
      toast.error('Failed to create delivery transaction');
      console.error('Delivery checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Delivery Checkout</CardTitle>
        <CardDescription>
          {subscription?.plan === 'free' 
            ? 'Pay as you go delivery service'
            : `You have ${subscription?.delivery_credits} delivery credits remaining`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Delivery Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="address"
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Delivery Type</Label>
          <RadioGroup
            value={deliveryType}
            onValueChange={(value) => setDeliveryType(value as 'standard' | 'express')}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="standard"
                id="standard"
                className="peer sr-only"
              />
              <Label
                htmlFor="standard"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Truck className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Standard</div>
                  <div className="text-sm text-muted-foreground">
                    ${deliveryCosts.standard}
                  </div>
                </div>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="express"
                id="express"
                className="peer sr-only"
              />
              <Label
                htmlFor="express"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Truck className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Express</div>
                  <div className="text-sm text-muted-foreground">
                    ${deliveryCosts.express}
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCheckout} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${deliveryCosts[deliveryType]}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 