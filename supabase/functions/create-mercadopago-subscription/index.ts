
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MP-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
    
    // Detectar si es token de prueba
    const isTestToken = accessToken.startsWith("TEST-");
    logStep("MercadoPago token verified", { isTestMode: isTestToken });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Para modo de prueba, usar un email de prueba específico
    const payerEmail = isTestToken ? "test_user_123456@testuser.com" : user.email;
    logStep("Payer email determined", { originalEmail: user.email, payerEmail, isTestMode: isTestToken });

    // Construir URLs correctamente
    const origin = req.headers.get("origin") || "https://jwitsagioonykrabioku.supabase.co";
    const successUrl = `${origin}/app/billing?success=true`;
    const failureUrl = `${origin}/app/billing?error=true`;
    const pendingUrl = `${origin}/app/billing?pending=true`;
    
    logStep("URLs constructed", { origin, successUrl, failureUrl, pendingUrl });

    // Crear la suscripción en MercadoPago
    const subscriptionData = {
      reason: "Plan Pro ResumAI - Suscripción Mensual",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 6990,
        currency_id: "CLP"
      },
      payer_email: payerEmail,
      back_url: successUrl,
      status: "pending",
      external_reference: user.id // Para vincular con nuestro usuario
    };

    logStep("Creating subscription", { subscriptionData, isTestMode: isTestToken });

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `subscription-${user.id}-${Date.now()}`
      },
      body: JSON.stringify(subscriptionData),
    });

    const result = await response.json();
    logStep("MercadoPago response", { 
      status: response.status, 
      resultId: result.id,
      resultStatus: result.status,
      initPoint: result.init_point,
      error: result.error || "none"
    });

    if (!response.ok) {
      logStep("MercadoPago API Error Details", {
        status: response.status,
        error: result,
        message: result.message || "Unknown error",
        cause: result.cause || "Unknown cause"
      });
      throw new Error(`MercadoPago API error: ${JSON.stringify(result)}`);
    }

    // Verificar si ya existe una suscripción para este usuario
    const { data: existingSubscription, error: checkError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    logStep("Checking existing subscription", { exists: !!existingSubscription, error: checkError });

    // Preparar los datos de la suscripción
    const subscriptionRecord = {
      user_id: user.id,
      tier: "pro",
      status: "pending",
      price_per_month: 6990,
      currency: "CLP",
      stripe_subscription_id: result.id, // Reutilizamos este campo para MP
      updated_at: new Date().toISOString(),
    };

    if (existingSubscription) {
      // Actualizar la suscripción existente
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .update(subscriptionRecord)
        .eq("user_id", user.id);
      
      if (updateError) {
        logStep("Database update error", updateError);
        throw new Error(`Database update error: ${updateError.message}`);
      }
      logStep("Subscription updated successfully");
    } else {
      // Crear nueva suscripción
      const { error: insertError } = await supabaseClient
        .from("subscriptions")
        .insert([subscriptionRecord]);
      
      if (insertError) {
        logStep("Database insert error", insertError);
        throw new Error(`Database insert error: ${insertError.message}`);
      }
      logStep("Subscription created successfully");
    }

    logStep("Subscription processed successfully", {
      subscriptionId: result.id,
      checkoutUrl: result.init_point,
      isTestMode: isTestToken
    });

    return new Response(JSON.stringify({
      subscription_id: result.id,
      checkout_url: result.init_point,
      status: result.status,
      is_test: isTestToken
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-mercadopago-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
