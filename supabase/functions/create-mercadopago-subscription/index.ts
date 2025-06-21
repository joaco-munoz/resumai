
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
    logStep("MercadoPago token verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Crear la suscripción en MercadoPago
    const subscriptionData = {
      reason: "Plan Pro CVMaster AI",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 29,
        currency_id: "USD"
      },
      payer_email: user.email,
      back_url: `${req.headers.get("origin")}/app/billing?success=true`,
      status: "pending"
    };

    logStep("Creating subscription", subscriptionData);

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    const result = await response.json();
    logStep("MercadoPago response", { status: response.status, result });

    if (!response.ok) {
      throw new Error(`MercadoPago API error: ${JSON.stringify(result)}`);
    }

    // Guardar la suscripción en nuestra base de datos
    const { error: dbError } = await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      tier: "pro",
      status: "pending",
      price_per_month: 29,
      currency: "USD",
      stripe_subscription_id: result.id, // Reutilizamos este campo para MP
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (dbError) {
      logStep("Database error", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    logStep("Subscription created successfully", {
      subscriptionId: result.id,
      checkoutUrl: result.init_point
    });

    return new Response(JSON.stringify({
      subscription_id: result.id,
      checkout_url: result.init_point,
      status: result.status
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
