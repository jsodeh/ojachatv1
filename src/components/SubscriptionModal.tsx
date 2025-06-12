import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, Mic, Zap, Headphones, Clock, Paperclip } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabOption = "free" | "monthly";

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [activeTab, setActiveTab] = useState<TabOption>("monthly");

  const freePlan = {
    id: "c6d481ea-cbfa-4358-a34f-dde048c31052",
    name: "Free",
    description: "Pay as you go",
    price: 0,
    features: [
      { text: "50 messages per month", included: true },
      { text: "Chat messages", included: true },
      { text: "Voice chat", included: false },
      { text: "File attachments", included: false },
      { text: "Priority support", included: false },
      { text: "Early access features", included: false }
    ],
    color: "bg-white dark:bg-gray-800"
  };

  const monthlyPlans = [
    {
      id: "b7f6131d-9392-46a4-bdb8-583a24e6797b",
      name: "Basic",
      description: "Essential features for everyday use",
      price: 25,
      features: [
        { text: "500 messages per month", included: true },
        { text: "Chat messages", included: true },
        { text: "Voice chat", included: true },
        { text: "10 MB file attachments", included: true },
        { text: "Priority support", included: false },
        { text: "Early access features", included: false }
      ],
      popular: false,
      color: "bg-white dark:bg-gray-800"
    },
    {
      id: "6b8def17-e5a8-4aa1-b5f8-f055661b3eb8",
      name: "Premium",
      description: "Advanced features with priority support",
      price: 80,
      features: [
        { text: "2,000 messages per month", included: true },
        { text: "Chat messages", included: true },
        { text: "Voice chat", included: true },
        { text: "25 MB file attachments", included: true },
        { text: "Priority support", included: true },
        { text: "Early access features", included: false }
      ],
      popular: true,
      color: "bg-green-50 dark:bg-green-900"
    },
    {
      id: "01c33418-cfe8-4565-90fa-685f92706224",
      name: "Prime",
      description: "Ultimate access with all features",
      price: 150,
      features: [
        { text: "Unlimited messages", included: true },
        { text: "Chat messages", included: true },
        { text: "Voice chat", included: true },
        { text: "50 MB file attachments", included: true },
        { text: "Priority support", included: true },
        { text: "Early access features", included: true }
      ],
      popular: false,
      color: "bg-white dark:bg-gray-800"
    }
  ];

  const handlePlanSelect = (planId: string, planName: string) => {
    console.log(`Selected plan: ${planName} (ID: ${planId})`);
    // Implement payment processing logic here
    onClose();
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free";
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[90%] p-0 gap-0 bg-green-50 dark:bg-gray-900 border-0 my-4 sm:my-6 max-h-[90vh] overflow-hidden">
        <div className="p-6 sm:p-8 max-w-full overflow-y-auto max-h-[80vh]">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Choose your plan</h2>
            <p className="text-gray-500 dark:text-gray-400">Select the plan that works best for you</p>
          </div>

          {/* Tab toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setActiveTab("free")}
                className={`px-4 py-2 rounded-md text-sm ${
                  activeTab === "free"
                    ? "bg-green-600 text-white"
                    : "bg-transparent text-gray-700 dark:text-gray-300"
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setActiveTab("monthly")}
                className={`px-4 py-2 rounded-md text-sm ${
                  activeTab === "monthly"
                    ? "bg-green-600 text-white"
                    : "bg-transparent text-gray-700 dark:text-gray-300"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Plans display */}
          {activeTab === "free" ? (
            <div className="max-w-md mx-auto">
              <div className={`${freePlan.color} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{freePlan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{freePlan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">Free</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No subscription required
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {freePlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="mr-2 mt-1">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                            feature.included 
                              ? "bg-green-100 dark:bg-green-800" 
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}>
                            {feature.included ? (
                              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">✕</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm ${
                          feature.included 
                            ? "text-gray-600 dark:text-gray-300" 
                            : "text-gray-400 dark:text-gray-500 line-through"
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanSelect(freePlan.id, freePlan.name)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    variant="outline"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`${plan.color} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">/ month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-2 mt-1">
                            <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                              feature.included 
                                ? "bg-green-100 dark:bg-green-800" 
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}>
                              {feature.included ? (
                                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-xs">✕</span>
                              )}
                            </div>
                          </div>
                          <span className={`text-sm ${
                            feature.included 
                              ? "text-gray-600 dark:text-gray-300" 
                              : "text-gray-400 dark:text-gray-500 line-through"
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handlePlanSelect(plan.id, plan.name)}
                      className={`w-full ${
                        plan.popular
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Subscribe
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            {activeTab === "free" 
              ? "Upgrade anytime to unlock more features and higher limits"
              : "All plans include core features. Cancel anytime."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;