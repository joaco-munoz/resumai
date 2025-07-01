import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Obtener la suscripción actual del usuario
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      logStep("Error fetching subscription", subError);
      throw new Error(`Database error: ${subError.message}`);
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      logStep("Error fetching profile", profileError);
      throw new Error(`Profile error: ${profileError.message}`);
    }

    let subscriptionStatus = "free";
    let isPremium = false;
    let premiumExpiresAt = null;

    if (subscription) {
      // Verificar si la suscripción está activa y no ha expirado
      const now = new Date();
      const expiryDate = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      
      logStep("Checking subscription status", {
        subscriptionId: subscription.stripe_subscription_id,
        provider: subscription.provider || "mercadopago", // Añadimos el proveedor
        status: subscription.status,
        expiryDate: expiryDate?.toISOString(),
        now: now.toISOString()
      });

      if (subscription.status === "active" && (!expiryDate || expiryDate > now)) {
        subscriptionStatus = "pro";
        isPremium = true;
        premiumExpiresAt = subscription.current_period_end;
      } else if (["cancelled", "paused", "expired"].includes(subscription.status) || 
                 (expiryDate && expiryDate <= now)) {
        // La suscripción ha expirado o fue cancelada, actualizar estado
        await supabaseClient
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("id", subscription.id);
        
        subscriptionStatus = "free";
        isPremium = false;
        premiumExpiresAt = null;
        
        logStep("Subscription expired/cancelled, updated status");
      }
    }

    // Actualizar el perfil si es necesario
    if (profile.subscription_tier !== subscriptionStatus || profile.is_premium !== isPremium) {
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: subscriptionStatus,
          is_premium: isPremium,
          premium_expires_at: premiumExpiresAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (updateError) {
        logStep("Error updating profile", updateError);
      } else {
        logStep("Profile updated", { subscriptionStatus, isPremium });
      }
    }

    const response = {
      subscription_tier: subscriptionStatus,
      is_premium: isPremium,
      premium_expires_at: premiumExpiresAt,
      subscription: subscription || null,
      benefits: {
        unlimited_cvs: isPremium,
        unlimited_exports: isPremium,
        unlimited_ai_improvements: isPremium,
        job_matcher_advanced: isPremium,
        premium_templates: isPremium,
        priority_support: isPremium
      }
    };

    logStep("Subscription status checked", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription-status", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
