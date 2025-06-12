import { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface UsageItemProps {
  label: string;
  used: number;
  limit: number;
  className?: string;
}

const UsageItem = ({ label, used, limit, className = '' }: UsageItemProps) => {
  // Calculate percentage for limited features
  const percentage = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">
          {limit === -1 ? `${used} / Unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        {limit === -1 ? (
          <div className="bg-green-600 h-2.5 rounded-full w-2"></div>
        ) : (
          <div 
            className={`h-2.5 rounded-full ${percentage >= 90 ? 'bg-red-600' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-600'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        )}
      </div>
    </div>
  );
};

export function SubscriptionUsage() {
  const { currentSubscription, usage, loading, error, refreshUsage } = useSubscription();
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (usage && usage.length > 0) {
      const map: Record<string, number> = {};
      usage.forEach(item => {
        map[item.feature_name] = item.used_amount;
      });
      setUsageMap(map);
    }
  }, [usage]);

  if (loading) {
    return <div>Loading subscription data...</div>;
  }

  if (error) {
    return <div>Error loading subscription information</div>;
  }

  if (!currentSubscription || !currentSubscription.plan) {
    return <div>No active subscription</div>;
  }

  const { plan } = currentSubscription;
  const getUsage = (featureName: string) => usageMap[featureName] || 0;

  return (
    <>
      {isSuperAdmin ? (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Your Usage</h2>
          <p>You have unlimited access as a super admin.</p>
        </div>
      ) : (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Usage</h2>
        <button 
          onClick={() => { refreshUsage(); setRefresh(!refresh); }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      
      <div className="mb-4">
        <span className="text-sm font-semibold">Current Plan: </span>
        <span className="text-sm">{plan.name}</span>
      </div>
      
      {plan.limits.chats_per_month !== undefined && (
        <UsageItem 
          label="Chats" 
          used={getUsage('chats_per_month')} 
          limit={plan.limits.chats_per_month} 
        />
      )}
      
      {plan.limits.words_per_month !== undefined && (
        <UsageItem 
          label="Words" 
          used={getUsage('words_per_month')} 
          limit={plan.limits.words_per_month} 
        />
      )}
      
      {plan.limits.voice_minutes_per_month !== undefined && (
        <UsageItem 
          label="Voice Minutes" 
          used={getUsage('voice_minutes_per_month')} 
          limit={plan.limits.voice_minutes_per_month} 
        />
      )}
      
      {plan.limits.image_shopping_count !== undefined && (
        <UsageItem 
          label="Image Shopping" 
          used={getUsage('image_shopping_count')} 
          limit={plan.limits.image_shopping_count} 
        />
      )}
      
      {plan.limits.online_shopping_count !== undefined && (
        <UsageItem 
          label="Online Shopping" 
          used={getUsage('online_shopping_count')} 
          limit={plan.limits.online_shopping_count} 
        />
      )}
      
      {plan.limits.free_deliveries_count !== undefined && plan.limits.free_deliveries_count > 0 && (
        <UsageItem 
          label="Free Deliveries" 
          used={getUsage('free_deliveries_count')} 
          limit={plan.limits.free_deliveries_count} 
        />
      )}
    </div>
      )}
    </>
  );
} 