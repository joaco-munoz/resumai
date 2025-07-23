import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const logStep = (step, details)=>{
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FLOW-CREDITS] ${step}${detailsStr}`);
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
    logStep("🚀 Iniciando compra de créditos Flow");
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
    const commerceOrder = `credits-${shortUserId}-${shortTimestamp}`; // ~30 caracteres
    // Parámetros para crear el pago según documentación de Flow
    const paymentParams = {
      apiKey: flowApiKey,
      commerceOrder: commerceOrder,
      subject: "ResumAI - 50 Créditos",
      currency: "CLP",
      amount: 1000,
      email: user.email || "",
      paymentMethod: 9, // Todos los medios de pago
      urlConfirmation: `${Deno.env.get("SUPABASE_URL")}/functions/v1/flow-webhook`,
      urlReturn: `${Deno.env.get("APP_BASE_URL") || Deno.env.get("SUPABASE_URL")}/payment-success`,
      merchantId: flowApiKey,
      timeout: 600 // 10 minutos
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
    // Crear registro de compra de créditos pendiente
    const { error: insertError } = await supabaseClient
      .from("credit_purchases")
      .insert({
        user_id: user.id,
        amount: 1000,
        credits: 50,
        currency: "CLP",
        provider: "flow",
        flow_token: flowData.token,
        flow_order: flowData.flowOrder,
        commerce_order: commerceOrder,
        status: "pending",
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      logStep("❌ Error creando registro de compra", insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }
    logStep("🎉 Compra de créditos iniciada exitosamente");
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
    logStep("💥 ERROR en create-flow-credits", {
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
