
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailCheck = () => {
  const [loading, setLoading] = useState(false);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Consultar en la tabla de profiles si el email ya existe
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error checking email:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkEmailExists,
    loading
  };
};
