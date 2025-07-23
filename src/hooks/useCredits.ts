import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';

interface UserCredits {
  total_credits: number;
  used_credits: number;
  available_credits: number;
}

interface CreditPurchase {
  id: string;
  amount: number;
  credits: number;
  status: string;
  created_at: string;
  payment_date?: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [credits, setCredits] = useState<UserCredits>({
    total_credits: 0,
    used_credits: 0,
    available_credits: 0
  });
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserCredits();
      loadPurchaseHistory();
      checkProStatus();
    }
  }, [user, isAdmin]);

  const checkProStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, is_premium, premium_expires_at')
        .eq('id', user.id)
        .single();

      const isUserPro = isAdmin || (profile?.is_premium === true && 
        profile?.subscription_tier === 'pro' && 
        (!profile?.premium_expires_at || new Date(profile.premium_expires_at) > new Date()));

      setIsPro(isUserPro);
    } catch (error) {
      console.error('Error checking pro status:', error);
    }
  };

  const loadUserCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('user_credits')
        .select('total_credits, used_credits, available_credits')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading credits:', error);
        return;
      }

      setCredits(data || {
        total_credits: 0,
        used_credits: 0,
        available_credits: 0
      });
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('credit_purchases')
        .select('id, amount, credits, status, created_at, payment_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading purchase history:', error);
        return;
      }

      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchase history:', error);
    }
  };

  const canUseCredits = (creditsNeeded: number = 1): boolean => {
    // Pro users have unlimited credits
    if (isPro || isAdmin) return true;
    
    // Regular users need to have enough credits
    return credits.available_credits >= creditsNeeded;
  };

  const useCredits = async (creditsToUse: number = 1): Promise<boolean> => {
    if (!user) return false;

    // Pro users don't consume credits
    if (isPro || isAdmin) return true;

    if (!canUseCredits(creditsToUse)) {
      toast.error(`No tienes suficientes créditos. Necesitas ${creditsToUse} crédito(s) pero solo tienes ${credits.available_credits}.`);
      return false;
    }

    try {
      const { data, error } = await (supabase as any).rpc('use_credits', {
        p_user_id: user.id,
        p_credits_to_use: creditsToUse
      });

      if (error) {
        console.error('Error using credits:', error);
        toast.error('Error al usar créditos. Inténtalo de nuevo.');
        return false;
      }

      if (!data) {
        toast.error('No tienes suficientes créditos.');
        return false;
      }

      // Reload credits to get updated balance
      await loadUserCredits();
      return true;
    } catch (error) {
      console.error('Error using credits:', error);
      toast.error('Error al usar créditos. Inténtalo de nuevo.');
      return false;
    }
  };

  const createFlowPayment = async (): Promise<{ success: boolean; paymentUrl?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return { success: false, error: 'Sesión no válida' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-flow-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error creating Flow payment:', result);
        return { success: false, error: result.error || 'Error al crear el pago' };
      }

      return { success: true, paymentUrl: result.paymentUrl };
    } catch (error) {
      console.error('Error creating Flow payment:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const refreshCredits = async () => {
    await loadUserCredits();
    await loadPurchaseHistory();
    await checkProStatus();
  };

  return {
    credits,
    purchases,
    isPro,
    isLoading,
    canUseCredits,
    useCredits,
    createFlowPayment,
    refreshCredits
  };
};
