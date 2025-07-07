import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const logStep = (step, details)=>{
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FLOW-SUBSCRIPTION] ${step}${detailsStr}`);
};
// Función para generar firma HMAC-SHA256
const generateSignature = async (params, secretKey)=>{
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const data = encoder.encode(params);
  const key = await crypto.subtle.importKey("raw", keyData, {
    name: "HMAC",
    hash: "SHA-256"
  }, false, [
    "sign"
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return Array.from(new Uint8Array(signature)).map((b)=>b.toString(16).padStart(2, '0')).join('');
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: {
      persistSession: false
    }
  });
  try {
    logStep("🚀 Iniciando creación de suscripción Flow");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("👤 Usuario autenticado", {
      userId: user.id,
      email: user.email
    });
    const flowApiKey = Deno.env.get("FLOW_API_KEY");
    const flowSecretKey = Deno.env.get("FLOW_SECRET_KEY");
    const flowEnv = Deno.env.get("FLOW_ENV");
    // Logs para diagnóstico
    logStep("🔑 Verificando credenciales Flow", {
      apiKeyExists: !!flowApiKey,
      secretKeyExists: !!flowSecretKey,
      flowEnv: flowEnv || "no configurado"
    });
    // Determine Flow base URL: allow explicit FLOW_BASE_URL, otherwise decide by FLOW_ENV ("sandbox" | "production")
    const flowBaseUrl = Deno.env.get("FLOW_BASE_URL") || (flowEnv === "sandbox" ? "https://sandbox.flow.cl/api" : "https://www.flow.cl/api");
    logStep("🌐 URL base de Flow", {
      flowBaseUrl
    });
    if (!flowApiKey || !flowSecretKey) {
      throw new Error("Flow API credentials not configured");
    }
    // Crear un commerceOrder más corto (máximo 45 caracteres)
    // Usar los primeros 8 caracteres del user ID + timestamp corto
    const shortUserId = user.id.substring(0, 8);
    const shortTimestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos
    const commerceOrder = `resumai-${shortUserId}-${shortTimestamp}`; // ~28 caracteres
    // Parámetros para crear el pago según documentación de Flow
    const paymentParams = {
      apiKey: flowApiKey,
      commerceOrder: commerceOrder,
      subject: "Suscripción Pro ResumAI - Plan Mensual",
      currency: "CLP",
      amount: 6990,
      email: user.email || "",
      paymentMethod: 1,
      urlConfirmation: `${Deno.env.get("SUPABASE_URL")}/functions/v1/flow-webhook`,
      urlReturn: `${Deno.env.get("APP_BASE_URL") || Deno.env.get("SUPABASE_URL")}/payment-success`,
      merchantId: flowApiKey,
      timeout: 300 // 5 minutos
    };
    // Crear string de parámetros ordenados para firma
    const paramString = Object.keys(paymentParams).sort().map((key)=>`${key}=${paymentParams[key]}`).join('&');
    logStep("📝 Parámetros para Flow", paymentParams);
    logStep("📏 Longitud commerceOrder", {
      length: commerceOrder.length,
      commerceOrder
    });
    // Generar firma
    const signature = await generateSignature(paramString, flowSecretKey);
    // Crear el pago en Flow usando la API correcta
    const flowResponse = await fetch(`${flowBaseUrl}/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        ...paymentParams,
        s: signature
      }).toString()
    });
    const responseText = await flowResponse.text();
    logStep("📨 Respuesta Flow (raw)", {
      status: flowResponse.status,
      body: responseText
    });
    if (!flowResponse.ok) {
      logStep("❌ Error en Flow API", {
        status: flowResponse.status,
        error: responseText
      });
      throw new Error(`Flow API error: ${flowResponse.status} - ${responseText}`);
    }
    let flowData;
    try {
      flowData = JSON.parse(responseText);
    } catch (e) {
      logStep("❌ Error parsing JSON", {
        responseText
      });
      throw new Error(`Invalid JSON response from Flow: ${responseText}`);
    }
    logStep("✅ Respuesta de Flow", flowData);
    // Verificar si ya existe una suscripción para este usuario
    const { data: existingSubscription } = await supabaseClient.from("subscriptions").select("id").eq("user_id", user.id).single();
    if (existingSubscription) {
      // Actualizar suscripción existente
      const { error: updateError } = await supabaseClient.from("subscriptions").update({
        tier: "pro",
        status: "pending",
        price_per_month: 6990,
        currency: "CLP",
        provider: "flow",
        stripe_subscription_id: flowData.token || flowData.flowOrder || commerceOrder,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id);
      if (updateError) {
        logStep("❌ Error actualizando suscripción", updateError);
        throw new Error(`Database error: ${updateError.message}`);
      }
    } else {
      // Crear nueva suscripción
      const { error: insertError } = await supabaseClient.from("subscriptions").insert({
        user_id: user.id,
        tier: "pro",
        status: "pending",
        price_per_month: 6990,
        currency: "CLP",
        provider: "flow",
        stripe_subscription_id: flowData.token || flowData.flowOrder || commerceOrder,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
      if (insertError) {
        logStep("❌ Error creando suscripción", insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }
    }
    logStep("🎉 Suscripción creada exitosamente");
    return new Response(JSON.stringify({
      success: true,
      paymentUrl: flowData.url + "?token=" + flowData.token,
      token: flowData.token,
      flowOrder: flowData.flowOrder,
      commerceOrder: commerceOrder
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR en create-flow-subscription", {
      message: errorMessage
    });
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
