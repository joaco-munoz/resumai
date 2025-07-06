
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessMetrics {
  date: string;
  total_users: number;
  active_users: number;
  new_signups: number;
  daily_signups: number;
  daily_active_users: number;
  churned_users: number;
  mrr: number;
  arr: number;
  total_revenue: number;
  avg_revenue_per_user: number;
  churn_rate: number;
  total_cvs_created: number;
  total_jobs_matched: number;
  total_payments_today: number;
  pro_users: number;
  free_users: number;
}

export const useBusinessMetrics = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics[]>([]);
  const [todayMetrics, setTodayMetrics] = useState<BusinessMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      setMetrics(data || []);
      setTodayMetrics(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching business metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetrics = async () => {
    try {
      await supabase.rpc('update_daily_metrics');
      await fetchMetrics();
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    todayMetrics,
    isLoading,
    updateMetrics,
    refetch: fetchMetrics
  };
};
