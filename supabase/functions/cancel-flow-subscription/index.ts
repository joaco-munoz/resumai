
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-FLOW-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("🚫 Iniciando cancelación de suscripción Flow");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("👤 Usuario autenticado", { userId: user.id });

    // Obtener suscripción actual
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      logStep("❌ Suscripción no encontrada", subError);
      throw new Error("No active subscription found");
    }

    // Para Flow, simplemente marcamos la suscripción como cancelada
    // Flow no requiere cancelación en su API para suscripciones de un solo pago
    const { error: updateError } = await supabaseClient
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: "User requested cancellation",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (updateError) {
      logStep("❌ Error actualizando suscripción", updateError);
      throw new Error(`Database error: ${updateError.message}`);
    }

    // Actualizar perfil del usuario
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        subscription_tier: "free",
        is_premium: false,
        premium_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      logStep("❌ Error actualizando perfil", profileError);
    } else {
      logStep("✅ Perfil actualizado a Free");
    }

    logStep("🎉 Suscripción cancelada exitosamente");

    return new Response(JSON.stringify({
      success: true,
      message: "Subscription cancelled successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR en cancel-flow-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
