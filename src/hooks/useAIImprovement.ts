
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useAIImprovement = () => {
  const [isImproving, setIsImproving] = useState(false);
  const { user } = useAuth();

  const improveBulletPoint = async (bulletPoint: string): Promise<string> => {
    if (!user) {
      toast.error("Debes estar autenticado para usar esta función");
      throw new Error("User not authenticated");
    }

    // Verificar límites antes de usar IA
    const { data: canUse, error: limitError } = await supabase
      .rpc('can_use_feature', {
        p_user_id: user.id,
        p_feature_type: 'ai_improvements'
      });

    if (limitError) {
      console.error('Error checking AI limits:', limitError);
      toast.error("Error al verificar límites de IA");
      throw new Error("Error checking limits");
    }

    if (!canUse) {
      toast.error("Has alcanzado tu límite de mejoras con IA. Actualiza a Pro para mejoras ilimitadas.");
      throw new Error("AI improvement limit reached");
    }

    setIsImproving(true);

    try {
      const { data, error } = await supabase.functions.invoke('improve-bullet-point', {
        body: { bulletPoint }
      });

      if (error) {
        console.error('Error improving bullet point:', error);
        toast.error("Error al mejorar el punto con IA");
        throw error;
      }

      // Incrementar uso después del éxito
      await supabase.rpc('increment_feature_usage', {
        p_user_id: user.id,
        p_feature_type: 'ai_improvements'
      });

      toast.success("Punto mejorado con IA exitosamente");
      return data.improvedText;
    } catch (error) {
      console.error('Error improving bullet point:', error);
      throw error;
    } finally {
      setIsImproving(false);
    }
  };

  const improveCVContent = async (content: any): Promise<any> => {
    if (!user) {
      toast.error("Debes estar autenticado para usar esta función");
      throw new Error("User not authenticated");
    }

    // Verificar límites antes de usar IA
    const { data: canUse, error: limitError } = await supabase
      .rpc('can_use_feature', {
        p_user_id: user.id,
        p_feature_type: 'ai_improvements'
      });

    if (limitError) {
      console.error('Error checking AI limits:', limitError);
      toast.error("Error al verificar límites de IA");
      throw new Error("Error checking limits");
    }

    if (!canUse) {
      toast.error("Has alcanzado tu límite de mejoras con IA. Actualiza a Pro para mejoras ilimitadas.");
      throw new Error("AI improvement limit reached");
    }

    setIsImproving(true);

    try {
      const { data, error } = await supabase.functions.invoke('improve-cv-content', {
        body: { content }
      });

      if (error) {
        console.error('Error improving CV content:', error);
        toast.error("Error al mejorar el contenido con IA");
        throw error;
      }

      // Incrementar uso después del éxito
      await supabase.rpc('increment_feature_usage', {
        p_user_id: user.id,
        p_feature_type: 'ai_improvements'
      });

      toast.success("Contenido mejorado con IA exitosamente");
      return data.improvedContent;
    } catch (error) {
      console.error('Error improving CV content:', error);
      throw error;
    } finally {
      setIsImproving(false);
    }
  };

  return {
    improveBulletPoint,
    improveCVContent,
    isImproving
  };
};
