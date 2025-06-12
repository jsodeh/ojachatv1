# OjaChat Subscription System

This folder contains the code for the OjaChat subscription system. Below are instructions for deploying and using the subscription features in your application.

## Features

The subscription system includes:

1. **Three Subscription Plans**:
   - **Basic Plan (Free)**: 10 Chats/Month, 1,000 words/Month, 10 Minutes Voice Mode/Month, 5 Image Shopping, 5 Free Online shopping, Standard Support
   - **Basic (₦25,000)**: Unlimited Chats, 20,000 words, 100 Minutes Voice Mode, 15 Image Shopping, 15 Free Online shopping, Priority Support.
   - **Premium (₦80,000)**: Unlimited Chats, 100,000 words, 500 Minutes Voice Mode, 50 Image Shopping, 50 Free Online shopping, Group Shopping, Auto Shopper, 24/7 Support.
   - **OjaPRIME (₦150,000)**: Unlimited Chats, Unlimited words, Unlimited Voice Mode, Unlimited Image Shopping, Unlimited Online shopping, Unlimited Free Deliveries, Group Shopping, Auto Shopper, Dedicated Support, Early Access to New Features.

2. **Automatic Limit Tracking**:
   - Usage tracked for metered features
   - Limits automatically enforced
   - Usage is reset at the end of billing periods (31 days for free users)

3. **User Interface Components**:
   - Account dropdown showing subscription details
   - Subscription page with plan details and usage limits
   - Feature access control components

## Deployment

### 1. Deploy Database Schema

First, deploy the database schema to your Supabase project:

```bash
# Option 1: Using Supabase CLI (recommended)
npx supabase db push

# Option 2: Using the Supabase dashboard
# 1. Go to "SQL Editor" in your Supabase dashboard
# 2. Create a new query
# 3. Copy the contents of supabase/migrations/20231101000000_subscription_plans.sql
# 4. Run the query
```

### 2. Deploy the Usage Reset Function

This function automatically resets usage limits at the end of billing periods:

```bash
# Deploy the edge function
npx supabase functions deploy reset-usage-limits

# Set up a CRON schedule to run daily
npx supabase functions schedule cron '0 0 * * *' reset-usage-limits
```

## Usage in Your Application

### 1. Account Dropdown

Add the account dropdown to your layout:

```jsx
import { AccountDropdown } from '@/components/AccountDropdown';

function Layout() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="logo">OjaChat</div>
        <nav>
          {/* Navigation items */}
        </nav>
        <AccountDropdown />
      </div>
    </header>
  );
}
```

### 2. Subscription Page

Add the subscription page to your routes:

```jsx
import { SubscriptionPage } from '@/pages/SubscriptionPage';

// In your router configuration
const routes = [
  // Other routes
  {
    path: '/subscription',
    element: <SubscriptionPage />
  }
];
```

### 3. Feature Access Control

Control access to premium features in your components:

```jsx
import { FeatureCheck, UsageLimitCheck } from '@/components/FeatureCheck';

function ShoppingPage() {
  return (
    <div>
      {/* Basic features everyone can access */}
      <RegularShopping />
      
      {/* Feature available only in paid plans */}
      <FeatureCheck 
        featureName="group_shopping" 
        fallback={<UpgradePrompt feature="Group Shopping" />}
      >
        <GroupShoppingFeature />
      </FeatureCheck>
      
      {/* Feature with usage limits */}
      <UsageLimitCheck 
        limitName="image_shopping_count" 
        fallback={<LimitReachedMessage />}
      >
        <ImageShoppingFeature />
      </UsageLimitCheck>
    </div>
  );
}
```

### 4. Track Feature Usage

Track usage when users use metered features:

```jsx
import { useTrackFeatureUsage } from '@/components/FeatureCheck';

function ImageShoppingFeature() {
  const { recordUsage } = useTrackFeatureUsage();
  
  const handleImageSearch = async () => {
    // Record that user used this feature
    await recordUsage('image_shopping_count');
    
    // Proceed with image search...
    performImageSearch();
  };
  
  return (
    <div>
      <h2>Image Shopping</h2>
      <button onClick={handleImageSearch}>Search by Image</button>
    </div>
  );
}
```

## Testing the System

1. **Create free users** to test basic plan limits
2. **Add test subscriptions** through the Supabase dashboard:

```sql
-- Example: Subscribe a user to Market PRO
INSERT INTO user_subscriptions (
  user_id, 
  plan_id, 
  status, 
  start_date, 
  end_date
) 
VALUES (
  'user-uuid-here',  -- Replace with actual user ID
  'plan-uuid-here',  -- Replace with Market PRO plan ID
  'active', 
  now(), 
  now() + interval '1 month'
);
```

3. **Test usage tracking** by using features multiple times
4. **Test limit enforcement** by hitting usage limits

## Troubleshooting

- If limits aren't resetting, check the Edge Function logs
- If features aren't properly gated, check the RLS policies
- If usage tracking isn't working, verify the subscription and usage tables 