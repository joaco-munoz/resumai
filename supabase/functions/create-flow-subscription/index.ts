
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FLOW-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Función para generar firma HMAC-SHA256
const generateSignature = (params: string, secretKey: string): string => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const data = encoder.encode(params);
  
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ).then(key => {
    return crypto.subtle.sign("HMAC", key, data);
  }).then(signature => {
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
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
    logStep("🚀 Iniciando creación de suscripción Flow");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("👤 Usuario autenticado", { userId: user.id, email: user.email });

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      logStep("❌ Error obteniendo perfil", profileError);
      throw new Error(`Profile error: ${profileError.message}`);
    }

    const flowApiKey = Deno.env.get("FLOW_API_KEY");
    const flowSecretKey = Deno.env.get("FLOW_SECRET_KEY");

    if (!flowApiKey || !flowSecretKey) {
      throw new Error("Flow API credentials not configured");
    }

    // Parámetros para crear la suscripción en Flow
    const subscriptionParams = {
      apiKey: flowApiKey,
      planId: "pro-plan-resumai", // ID único del plan
      customerId: user.id,
      currency: "CLP",
      amount: 6990,
      subject: "Suscripción Pro ResumAI",
      email: user.email,
      urlConfirmation: `${Deno.env.get("SUPABASE_URL")}/functions/v1/flow-webhook`,
      urlReturn: "https://jwitsagioonykrabioku.supabase.co/app/billing?status=success",
    };

    // Crear string de parámetros ordenados para firma
    const paramString = Object.keys(subscriptionParams)
      .sort()
      .map(key => `${key}=${subscriptionParams[key as keyof typeof subscriptionParams]}`)
      .join('&');

    logStep("📝 Parámetros para Flow", subscriptionParams);

    // Generar firma
    const signature = await generateSignature(paramString, flowSecretKey);

    // Crear suscripción en Flow
    const flowResponse = await fetch("https://www.flow.cl/api/payment/createSubscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        ...subscriptionParams,
        s: signature,
      }).toString(),
    });

    if (!flowResponse.ok) {
      const errorText = await flowResponse.text();
      logStep("❌ Error en Flow API", { status: flowResponse.status, error: errorText });
      throw new Error(`Flow API error: ${flowResponse.status} - ${errorText}`);
    }

    const flowData = await flowResponse.json();
    logStep("✅ Respuesta de Flow", flowData);

    // Guardar suscripción en base de datos
    const { error: subscriptionError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        tier: "pro",
        status: "pending",
        price_per_month: 6990,
        currency: "CLP",
        provider: "flow",
        stripe_subscription_id: flowData.token || flowData.flowOrder, // Usar token de Flow
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (subscriptionError) {
      logStep("❌ Error guardando suscripción", subscriptionError);
      throw new Error(`Database error: ${subscriptionError.message}`);
    }

    logStep("🎉 Suscripción creada exitosamente");

    return new Response(JSON.stringify({
      success: true,
      paymentUrl: flowData.url + "?token=" + flowData.token,
      token: flowData.token,
      flowOrder: flowData.flowOrder,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR en create-flow-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
