
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

    // Actualizar estado en nuestra base de datos
    const newStatus = subscriptionData.status === "authorized" ? "active" : subscriptionData.status;
    const subscriptionEnd = subscriptionData.status === "authorized" 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
      : null;

    const { error: updateError } = await supabaseClient
      .from("subscriptions")
      .update({
        status: newStatus,
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", preapprovalId);

    if (updateError) {
      logStep("Error updating subscription", updateError);
      throw new Error(`Database update error: ${updateError.message}`);
    }

    // Actualizar perfil del usuario si la suscripción está activa
    if (newStatus === "active") {
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .update({
          is_premium: true,
          subscription_tier: "pro",
          premium_expires_at: subscriptionEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("email", subscriptionData.payer_email);

      if (profileError) {
        logStep("Warning: Could not update profile", profileError);
      } else {
        logStep("Profile updated to premium", { email: subscriptionData.payer_email });
      }
    }

    logStep("Webhook processed successfully", {
      preapprovalId,
      status: newStatus,
      email: subscriptionData.payer_email
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
