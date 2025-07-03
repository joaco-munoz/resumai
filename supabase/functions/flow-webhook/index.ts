
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

    if (!token) {
      logStep("❌ Token faltante");
      return new Response("Missing token", { status: 400 });
    }

    logStep("📋 Webhook data received", { token, signature });

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
      return new Response("OK", { status: 200 }); // Siempre retornar 200 para evitar reintentos
    }

    const paymentData = await flowResponse.json();
    logStep("💳 Datos del pago", paymentData);

    const status = paymentData.status;
    const commerceOrder = paymentData.commerceOrder;

    // Extraer user_id del commerce order
    const userIdMatch = commerceOrder?.match(/resumai-([^-]+)-/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    if (status === 2 && userId) { // Status 2 = Pagado
      logStep("✅ Pago confirmado", { userId, commerceOrder });

      // Actualizar suscripción
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("provider", "flow");

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
        .eq("id", userId);

      if (profileError) {
        logStep("❌ Error actualizando perfil", profileError);
      } else {
        logStep("✅ Perfil actualizado a Pro");
      }
    } else {
      logStep("⚠️ Pago no completado o userId no encontrado", { status, userId, commerceOrder });
    }

    logStep("🎉 Webhook procesado exitosamente");
    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR en flow-webhook", { message: errorMessage });
    return new Response("OK", { status: 200 }); // Siempre retornar 200 para evitar reintentos
  }
});
