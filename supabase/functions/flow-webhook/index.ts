
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FLOW-WEBHOOK] ${step}${detailsStr}`);
};

// Función para validar firma de Flow
const validateSignature = async (params: string, signature: string, secretKey: string): Promise<boolean> => {
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
  
  const expectedSignature = await crypto.subtle.sign("HMAC", key, data);
  const expectedHex = Array.from(new Uint8Array(expectedSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return expectedHex === signature;
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
    logStep("🔔 WEBHOOK Flow recibido", {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    const formData = await req.formData();
    const token = formData.get("token")?.toString();
    const signature = formData.get("s")?.toString();

    if (!token || !signature) {
      logStep("❌ Token o firma faltante");
      return new Response("Missing token or signature", { status: 400 });
    }

    logStep("📋 Datos recibidos", { token, signature });

    const flowSecretKey = Deno.env.get("FLOW_SECRET_KEY");
    const flowApiKey = Deno.env.get("FLOW_API_KEY");

    if (!flowSecretKey || !flowApiKey) {
      throw new Error("Flow credentials not configured");
    }

    // Obtener información del pago desde Flow
    const getPaymentParams = `apiKey=${flowApiKey}&token=${token}`;
    const getPaymentSignature = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(flowSecretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ).then(key => {
      return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(getPaymentParams));
    }).then(signature => {
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    });

    const flowResponse = await fetch("https://www.flow.cl/api/payment/getStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        apiKey: flowApiKey,
        token: token,
        s: getPaymentSignature,
      }).toString(),
    });

    if (!flowResponse.ok) {
      const errorText = await flowResponse.text();
      logStep("❌ Error consultando Flow", { status: flowResponse.status, error: errorText });
      throw new Error(`Flow API error: ${flowResponse.status}`);
    }

    const paymentData = await flowResponse.json();
    logStep("💳 Datos del pago", paymentData);

    const status = paymentData.status;
    const customerId = paymentData.optional; // Aquí debería estar el user_id
    const amount = paymentData.amount;

    if (status === 2) { // Status 2 = Pagado
      logStep("✅ Pago confirmado", { customerId, amount });

      // Buscar y actualizar suscripción
      const { data: subscription, error: subError } = await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", token)
        .single();

      if (subError) {
        logStep("❌ Error buscando suscripción", subError);
        // Intentar buscar por user_id si tenemos el customerId
        if (customerId) {
          const { data: subByUser, error: subByUserError } = await supabaseClient
            .from("subscriptions")
            .select("*")
            .eq("user_id", customerId)
            .single();

          if (subByUserError) {
            logStep("❌ Error buscando suscripción por user_id", subByUserError);
            return new Response("Subscription not found", { status: 404 });
          }
          
          // Actualizar suscripción encontrada por user_id
          const { error: updateError } = await supabaseClient
            .from("subscriptions")
            .update({
              status: "active",
              stripe_subscription_id: token,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", customerId);

          if (updateError) {
            logStep("❌ Error actualizando suscripción", updateError);
          } else {
            logStep("✅ Suscripción actualizada por user_id");
          }
        }
      } else {
        // Actualizar suscripción encontrada por token
        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);

        if (updateError) {
          logStep("❌ Error actualizando suscripción", updateError);
        } else {
          logStep("✅ Suscripción actualizada");
        }

        // Actualizar perfil del usuario
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .update({
            subscription_tier: "pro",
            is_premium: true,
            premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.user_id);

        if (profileError) {
          logStep("❌ Error actualizando perfil", profileError);
        } else {
          logStep("✅ Perfil actualizado a Pro");
        }
      }
    } else {
      logStep("⚠️ Pago no completado", { status, statusText: paymentData.statusText });
    }

    logStep("🎉 Webhook procesado exitosamente");
    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR en flow-webhook", { message: errorMessage });
    return new Response("OK", { status: 200 }); // Siempre retornar 200 para evitar reintentos
  }
});
