import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionUsage } from '@/components/SubscriptionUsage';
import { CreditCard, Crown, CheckCircle, AlertCircle, Truck, ShoppingCart } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscriptions';

export function SubscriptionPage() {
  const { 
    currentSubscription, 
    plans, 
    loading, 
    error, 
    subscribeToPlan, 
    paymentLinks,
    discountInfo 
  } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <h2 className="text-lg font-semibold flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Subscription
          </h2>
          <p className="mt-1">We couldn't load your subscription information. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const currentPlan = currentSubscription?.plan || plans.find(p => p.price === 0) || null;

  const getDeliveryType = (plan: SubscriptionPlan | null) => {
    if (!plan) return "None";
    
    const deliveryType = plan.features?.delivery_type;
    
    if (!deliveryType) return "None";
    
    switch (deliveryType) {
      case 'self_pickup':
        return "Self Pickup Only";
      case 'standard':
        return `Standard (${plan.limits?.free_deliveries_count || 0} free)`;
      case 'premium':
        return `Premium (${plan.limits?.free_deliveries_count || 0} free)`;
      default:
        return "None";
    }
  };
  
  const handleUpgradeClick = (planId: string) => {
    const planPaymentLinks = paymentLinks[planId] || [];
    if (planPaymentLinks.length > 0) {
      // Open payment link in new tab
      window.open(planPaymentLinks[0].link_url, '_blank');
    } else {
      console.log('No payment link available for this plan');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Subscription & Usage</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Current plan & usage */}
        <div className="md:col-span-2 space-y-6">
          {/* Current plan info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
            
            {currentPlan ? (
              <div>
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${currentPlan.price > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    <Crown className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{currentPlan.name}</h3>
                    <p className="text-sm text-gray-500">
                      {currentPlan.price === 0 
                        ? 'Free Plan' 
                        : `₦${currentPlan.price.toLocaleString()} / month`}
                    </p>
                  </div>
                </div>
                
                {/* Show discount for Prime subscribers if applicable */}
                {discountInfo.hasDiscount && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                    <p className="text-green-700 font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" /> 
                      Special Discount: {discountInfo.discountPercent}% off for first 6 months!
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      You're saving ₦{discountInfo.savings.toLocaleString()} per month!
                    </p>
                  </div>
                )}
                
                {/* Delivery Features */}
                <div className="mt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Delivery Options</h4>
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{getDeliveryType(currentPlan)}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <SubscriptionUsage />
                </div>
                
                {currentPlan.price === 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setIsUpgrading(true)}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No active subscription</p>
              </div>
            )}
          </div>
          
          {/* Usage stats section omitted for brevity */}
        </div>
        
        {/* Right column - Available plans */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
          
          <div className="space-y-4">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan?.id === plan.id;
              const planLinks = paymentLinks[plan.id] || [];
              const hasPaymentLink = planLinks.length > 0;
              
              return (
                <div 
                  key={plan.id}
                  className={`border rounded-lg p-4 hover:shadow transition-shadow ${
                    isCurrentPlan ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{plan.name}</h3>
                    <div className="font-bold">
                      {plan.price === 0 
                        ? 'Free' 
                        : `₦${plan.price.toLocaleString()}`}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">{plan.description}</div>
                  
                  {/* Plan Features */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {(plan.limits?.chats_per_month ?? 0) === -1 
                          ? 'Unlimited chats' 
                          : `${plan.limits?.chats_per_month ?? 0} chats per month`}
                      </span>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {(plan.limits?.words_per_month ?? 0) === -1 
                          ? 'Unlimited words' 
                          : `${(plan.limits?.words_per_month ?? 0).toLocaleString()} words per month`}
                      </span>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">Delivery: </span>
                        {getDeliveryType(plan)}
                      </span>
                    </div>
                    
                    {/* Prime discount feature */}
                    {plan.name === 'OjaPRIME MAX' && (
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-600">
                          30% discount for first 6 months!
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!isCurrentPlan && plan.price > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleUpgradeClick(plan.id)}
                        disabled={!hasPaymentLink}
                        className={`w-full py-2 rounded-md font-medium ${
                          hasPaymentLink 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Upgrade to {plan.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Upgrade modal - would need to be implemented with a proper payment flow */}
      {isUpgrading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Upgrade Your Plan</h3>
            <p className="mb-6">You would implement your payment processing here.</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsUpgrading(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Here you would handle the payment and plan upgrade
                  setIsUpgrading(false);
                }}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 