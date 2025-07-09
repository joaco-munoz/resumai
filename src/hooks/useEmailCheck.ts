
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailCheck = () => {
  const [loading, setLoading] = useState(false);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    console.log('🔍 Checking if email exists:', email);
    setLoading(true);
    
    try {
      // Consultar en la tabla de profiles si el email ya existe
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      console.log('📊 Email check result:', { data, error });

      if (error) {
        console.error('❌ Error checking email:', error);
        return false;
      }

      const emailExists = !!data;
      console.log('✅ Email exists:', emailExists);
      return emailExists;
    } catch (error) {
      console.error('💥 Exception checking email:', error);
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
