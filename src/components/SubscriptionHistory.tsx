import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Package, CreditCard } from 'lucide-react';
import { SubscriptionHistory as SubscriptionHistoryType, DeliveryTransaction } from '@/types/subscription';

export default function SubscriptionHistory() {
  const [history, setHistory] = useState<SubscriptionHistoryType[]>([]);
  const [transactions, setTransactions] = useState<DeliveryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getSubscriptionHistory, getDeliveryTransactions } = useSubscription();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, transactionsData] = await Promise.all([
          getSubscriptionHistory(),
          getDeliveryTransactions()
        ]);
        setHistory(historyData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getSubscriptionHistory, getDeliveryTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      case 'trial':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="subscription" className="space-y-4">
      <TabsList>
        <TabsTrigger value="subscription">
          <CreditCard className="h-4 w-4 mr-2" />
          Subscription History
        </TabsTrigger>
        <TabsTrigger value="deliveries">
          <Package className="h-4 w-4 mr-2" />
          Delivery History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="subscription">
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>
              Track your subscription changes and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(item.timestamp), 'PPp')}
                    </div>
                    {item.previous_plan && item.new_plan && (
                      <div className="text-sm">
                        Changed from {item.previous_plan} to {item.new_plan}
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusColor(item.new_status || '')}>
                    {item.new_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="deliveries">
        <Card>
          <CardHeader>
            <CardTitle>Delivery History</CardTitle>
            <CardDescription>
              View your past delivery transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {transaction.delivery_type.charAt(0).toUpperCase() +
                        transaction.delivery_type.slice(1)}{' '}
                      Delivery
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(transaction.created_at), 'PPp')}
                    </div>
                    <div className="text-sm truncate max-w-xs">
                      {transaction.delivery_address}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <Badge
                      className={
                        transaction.status === 'completed'
                          ? 'bg-green-500/10 text-green-500'
                          : transaction.status === 'failed'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 