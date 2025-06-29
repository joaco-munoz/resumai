
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionBenefits {
  unlimited_cvs: boolean;
  unlimited_exports: boolean;
  unlimited_ai_improvements: boolean;
  job_matcher_advanced: boolean;
  premium_templates: boolean;
  priority_support: boolean;
}

interface UseSubscriptionBenefitsReturn {
  benefits: SubscriptionBenefits | null;
  isPro: boolean;
  isLoading: boolean;
  checkSubscriptionStatus: () => Promise<void>;
  canUsePremiumFeature: (feature: keyof SubscriptionBenefits) => boolean;
}

export const useSubscriptionBenefits = (): UseSubscriptionBenefitsReturn => {
  const [benefits, setBenefits] = useState<SubscriptionBenefits | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setBenefits(null);
        setIsPro(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription status:', error);
        return;
      }

      if (data) {
        setBenefits(data.benefits);
        setIsPro(data.subscription_tier === 'pro');
      }
    } catch (error) {
      console.error('Subscription status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canUsePremiumFeature = (feature: keyof SubscriptionBenefits): boolean => {
    if (!benefits) return false;
    return benefits[feature];
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  return {
    benefits,
    isPro,
    isLoading,
    checkSubscriptionStatus,
    canUsePremiumFeature,
  };
};
