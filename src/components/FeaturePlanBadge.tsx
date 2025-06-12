import React from 'react';
import { LockIcon, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type PlanType = 'free' | 'pro' | 'max';

interface FeaturePlanBadgeProps {
  featureName: string;
  requiredPlan: PlanType;
  userPlan?: PlanType;
  className?: string;
}

export function FeaturePlanBadge({ 
  featureName, 
  requiredPlan, 
  userPlan = 'free',
  className = ''
}: FeaturePlanBadgeProps) {
  const isAvailable = isPlanSufficient(userPlan, requiredPlan);
  
  const planLabels = {
    free: 'Basic',
    pro: 'OjaPRIME PRO',
    max: 'OjaPRIME MAX'
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              isAvailable 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
            } ${className}`}
          >
            {isAvailable ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Available
              </>
            ) : (
              <>
                <LockIcon className="w-3 h-3 mr-1" />
                {planLabels[requiredPlan]}
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isAvailable 
            ? `${featureName} is available in your ${planLabels[userPlan]} plan` 
            : `${featureName} requires ${planLabels[requiredPlan]} plan or higher`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to determine if user's plan is sufficient for the feature
function isPlanSufficient(userPlan: PlanType, requiredPlan: PlanType): boolean {
  const planLevels: Record<PlanType, number> = {
    free: 0,
    pro: 1,
    max: 2
  };
  
  return planLevels[userPlan] >= planLevels[requiredPlan];
} 