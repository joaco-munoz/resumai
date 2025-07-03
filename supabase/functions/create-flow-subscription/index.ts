
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FLOW-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Función para generar firma HMAC-SHA256
const generateSignature = async (params: string, secretKey: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const data = encoder.encode(params);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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

    const flowApiKey = Deno.env.get("FLOW_API_KEY");
    const flowSecretKey = Deno.env.get("FLOW_SECRET_KEY");

    if (!flowApiKey || !flowSecretKey) {
      throw new Error("Flow API credentials not configured");
    }

    // Parámetros para crear el pago según documentación de Flow
    const paymentParams = {
      apiKey: flowApiKey,
      commerceOrder: `resumai-${user.id}-${Date.now()}`,
      subject: "Suscripción Pro ResumAI - Plan Mensual",
      currency: "CLP",
      amount: 6990,
      email: user.email || "",
      paymentMethod: 9, // Todos los métodos de pago
      urlConfirmation: `${Deno.env.get("SUPABASE_URL")}/functions/v1/flow-webhook`,
      urlReturn: `${Deno.env.get("SUPABASE_URL").replace('supabase.co', 'supabase.co')}/app/billing?status=success`,
      merchantId: flowApiKey, // Usar API key como merchant ID
      timeout: 300 // 5 minutos
    };

    // Crear string de parámetros ordenados para firma
    const paramString = Object.keys(paymentParams)
      .sort()
      .map(key => `${key}=${paymentParams[key as keyof typeof paymentParams]}`)
      .join('&');

    logStep("📝 Parámetros para Flow", paymentParams);

    // Generar firma
    const signature = await generateSignature(paramString, flowSecretKey);

    // Crear el pago en Flow usando la API correcta
    const flowResponse = await fetch("https://www.flow.cl/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        ...paymentParams,
        s: signature,
      }).toString(),
    });

    const responseText = await flowResponse.text();
    logStep("📨 Respuesta Flow (raw)", { status: flowResponse.status, body: responseText });

    if (!flowResponse.ok) {
      logStep("❌ Error en Flow API", { status: flowResponse.status, error: responseText });
      throw new Error(`Flow API error: ${flowResponse.status} - ${responseText}`);
    }

    let flowData;
    try {
      flowData = JSON.parse(responseText);
    } catch (e) {
      logStep("❌ Error parsing JSON", { responseText });
      throw new Error(`Invalid JSON response from Flow: ${responseText}`);
    }

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
        stripe_subscription_id: flowData.token || flowData.flowOrder,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
