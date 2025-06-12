import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Icons } from '@/lib/icons';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (paymentDetails: PaymentDetails) => void;
  total: number;
}

interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  cvv: string;
  expiryDate: string;
  paymentMethod: 'mastercard' | 'paypal' | 'google' | 'apple';
}

export function PaymentModal({ open, onClose, onSubmit, total }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentDetails['paymentMethod']>('mastercard');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSubmit({
        cardNumber,
        cardHolder,
        cvv,
        expiryDate,
        paymentMethod
      });
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.substr(0, 2) + '/' + numbers.substr(2, 2);
    }
    return numbers;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <RadioGroup
              defaultValue="mastercard"
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentDetails['paymentMethod'])}
              className="grid grid-cols-4 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="mastercard"
                  id="mastercard"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="mastercard"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Icons.mastercard className="mb-3 h-6 w-6" />
                  Mastercard
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="paypal"
                  id="paypal"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="paypal"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Icons.paypal className="mb-3 h-6 w-6" />
                  PayPal
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="google"
                  id="google"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="google"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Icons.google className="mb-3 h-6 w-6" />
                  Google
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="apple"
                  id="apple"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="apple"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Icons.apple className="mb-3 h-6 w-6" />
                  Apple
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'mastercard' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardHolder">Card Holder</Label>
                  <Input
                    id="cardHolder"
                    placeholder="Enter card holder name"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="000"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substr(0, 3))}
                      maxLength={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total Amount: ${total.toFixed(2)}
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 