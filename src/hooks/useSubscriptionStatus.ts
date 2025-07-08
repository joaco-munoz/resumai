
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [tier, setTier] = useState<string>('free');
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user || adminLoading) {
        if (!adminLoading) {
          setIsLoading(false);
        }
        return;
      }

      // Si es admin, siempre es premium
      if (isAdmin) {
        console.log('User is admin, setting as premium');
        setTier('pro');
        setIsPremium(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_tier, is_premium, premium_expires_at')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription status:', error);
          return;
        }

        if (profile) {
          const currentTier = profile.subscription_tier || 'free';
          const currentIsPremium = profile.is_premium || false;
          
          // Verificar si la suscripción premium ha expirado
          if (currentIsPremium && profile.premium_expires_at) {
            const expiresAt = new Date(profile.premium_expires_at);
            const now = new Date();
            
            if (now > expiresAt) {
              // Actualizar el perfil para reflejar que ya no es premium
              await supabase
                .from('profiles')
                .update({ 
                  is_premium: false, 
                  subscription_tier: 'free' 
                })
                .eq('id', user.id);
              
              setTier('free');
              setIsPremium(false);
            } else {
              setTier(currentTier);
              setIsPremium(currentIsPremium);
            }
          } else {
            setTier(currentTier);
            setIsPremium(currentIsPremium);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, isAdmin, adminLoading]);

  const refreshStatus = async () => {
    setIsLoading(true);
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Si es admin, siempre es premium
    if (isAdmin) {
      setTier('pro');
      setIsPremium(true);
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, is_premium, premium_expires_at')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription status:', error);
        return;
      }

      if (profile) {
        const currentTier = profile.subscription_tier || 'free';
        const currentIsPremium = profile.is_premium || false;
        
        if (currentIsPremium && profile.premium_expires_at) {
          const expiresAt = new Date(profile.premium_expires_at);
          const now = new Date();
          
          if (now > expiresAt) {
            await supabase
              .from('profiles')
              .update({ 
                is_premium: false, 
                subscription_tier: 'free' 
              })
              .eq('id', user.id);
            
            setTier('free');
            setIsPremium(false);
          } else {
            setTier(currentTier);
            setIsPremium(currentIsPremium);
          }
        } else {
          setTier(currentTier);
          setIsPremium(currentIsPremium);
        }
      }
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { tier, isPremium, isLoading, refreshStatus };
};
