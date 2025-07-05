
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  tier: 'free' | 'pro';
  isPremium: boolean;
  expiresAt: string | null;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    tier: 'free',
    isPremium: false,
    expiresAt: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, is_premium, premium_expires_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        return;
      }

      if (profile) {
        const isPremiumActive = profile.is_premium === true && 
          profile.subscription_tier === 'pro' && 
          (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

        setStatus({
          tier: isPremiumActive ? 'pro' : 'free',
          isPremium: isPremiumActive,
          expiresAt: profile.premium_expires_at
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...status,
    isLoading,
    refreshStatus: checkSubscriptionStatus
  };
};
