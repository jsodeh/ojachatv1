import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface DeliverySchedule {
  id: string;
  location: string;
  available_times: Date[];
}

export const useDeliveryTimes = (location?: string) => {
  const [deliveryTimes, setDeliveryTimes] = useState<DeliverySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveryTimes = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('delivery_schedules')
          .select('*');
        
        if (location) {
          query = query.eq('location', location);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Convert string timestamps to Date objects
        const formattedData = data.map(schedule => ({
          ...schedule,
          available_times: schedule.available_times.map((time: string) => new Date(time))
        }));

        setDeliveryTimes(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryTimes();
  }, [location]);

  return { deliveryTimes, loading, error };
}; 