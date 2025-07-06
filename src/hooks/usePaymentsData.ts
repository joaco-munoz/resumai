
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentData {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  processed_at: string;
  currency: string;
  description: string;
  flow_payment_date: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export const usePaymentsData = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    isLoading,
    refetch: fetchPayments
  };
};
