
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      // Verificar si el usuario ya completó el onboarding
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        setIsLoading(false);
        return;
      }

      // Always set onboarding as completed to prevent welcome messages
      // Using type assertion temporarily until types are regenerated  
      const profileWithOnboarding = profile as any;
      
      // If onboarding is not completed, complete it automatically without showing modal
      if (!profileWithOnboarding?.onboarding_completed) {
        await completeOnboardingAutomatically();
      }
      
      // Never show onboarding modal
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboardingAutomatically = async () => {
    if (!user) return;

    try {
      // Using type assertion temporarily until types are regenerated
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding automatically:', error);
        return;
      }
    } catch (error) {
      console.error('Error in completeOnboardingAutomatically:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      // Using type assertion temporarily until types are regenerated
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return;
      }

      setShowOnboarding(false);
    } catch (error) {
      console.error('Error in completeOnboarding:', error);
    }
  };

  return {
    showOnboarding: false, // Always return false to never show onboarding
    isLoading,
    completeOnboarding,
    setShowOnboarding
  };
};
