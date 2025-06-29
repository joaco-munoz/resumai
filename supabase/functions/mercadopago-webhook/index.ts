
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");

    const body = await req.json();
    logStep("Webhook payload", body);

    // Verificar que es una notificación de preapproval (suscripción)
    if (body.type !== "preapproval") {
      logStep("Not a preapproval notification, ignoring");
      return new Response("OK", { status: 200 });
    }

    const preapprovalId = body.data?.id;
    if (!preapprovalId) {
      logStep("No preapproval ID found");
      return new Response("OK", { status: 200 });
    }

    // Obtener detalles de la suscripción desde MercadoPago
    const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const subscriptionData = await mpResponse.json();
    logStep("Subscription data from MP", subscriptionData);

    if (!mpResponse.ok) {
      throw new Error(`Error fetching subscription: ${JSON.stringify(subscriptionData)}`);
    }

    // Determinar el nuevo estado de la suscripción
    const newStatus = subscriptionData.status === "authorized" ? "active" : 
                     subscriptionData.status === "cancelled" ? "cancelled" : 
                     subscriptionData.status === "paused" ? "paused" : "pending";

    const subscriptionEnd = subscriptionData.status === "authorized" 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
      : null;

    // Buscar el usuario por email del pagador
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, email")
      .eq("email", subscriptionData.payer_email)
      .single();

    if (profileError || !profile) {
      logStep("User not found", { email: subscriptionData.payer_email, error: profileError });
      throw new Error(`User not found: ${subscriptionData.payer_email}`);
    }

    // Actualizar o crear suscripción
    const { error: upsertError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: profile.id,
        tier: "pro",
        status: newStatus,
        price_per_month: 6990,
        currency: "CLP",
        stripe_subscription_id: preapprovalId, // Reutilizamos este campo para MP
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (upsertError) {
      logStep("Error upserting subscription", upsertError);
      throw new Error(`Database upsert error: ${upsertError.message}`);
    }

    // Actualizar perfil del usuario según el estado de la suscripción
    const profileUpdates: any = {
      subscription_tier: newStatus === "active" ? "pro" : "free",
      is_premium: newStatus === "active",
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "active") {
      profileUpdates.premium_expires_at = subscriptionEnd;
    } else {
      profileUpdates.premium_expires_at = null;
    }

    const { error: profileUpdateError } = await supabaseClient
      .from("profiles")
      .update(profileUpdates)
      .eq("id", profile.id);

    if (profileUpdateError) {
      logStep("Warning: Could not update profile", profileUpdateError);
    } else {
      logStep("Profile updated", { 
        userId: profile.id, 
        email: profile.email, 
        tier: profileUpdates.subscription_tier,
        isPremium: profileUpdates.is_premium 
      });
    }

    logStep("Webhook processed successfully", {
      preapprovalId,
      status: newStatus,
      email: subscriptionData.payer_email,
      userId: profile.id
    });

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in mercadopago-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
