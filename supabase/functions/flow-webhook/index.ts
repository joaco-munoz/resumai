
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FLOW-CREDITS-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("🔔 WEBHOOK Flow créditos recibido", {
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

    logStep(" Webhook data received", { token, signature });

    const flowSecretKey = Deno.env.get("FLOW_SECRET_KEY");
    const flowApiKey = Deno.env.get("FLOW_API_KEY");
    const flowBaseUrl = Deno.env.get("FLOW_BASE_URL") || (Deno.env.get("FLOW_ENV") === "sandbox" ? "https://sandbox.flow.cl/api" : "https://www.flow.cl/api");

    if (!flowSecretKey || !flowApiKey) {
      throw new Error("Flow credentials not configured");
    }

    // Obtener información del pago desde Flow
    // Concatenar parámetros en orden alfabético sin separadores, como exige Flow
    const getPaymentParams = `apiKey${flowApiKey}token${token}`;
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

    // Log para verificar qué endpoint se está utilizando
    logStep("🌐 Consultando Flow en", { flowBaseUrl });

    const queryString = new URLSearchParams({
      apiKey: flowApiKey,
      token: token,
      s: getPaymentSignature,
    }).toString();

    const flowResponse = await fetch(`${flowBaseUrl}/payment/getStatus?${queryString}`, {
      method: "GET",
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

    // Buscar la compra de créditos en la base de datos por token para obtener el user_id
    const { data: creditPurchase } = await supabaseClient
      .from("credit_purchases")
      .select("user_id, credits, id")
      .eq("flow_token", token)
      .eq("provider", "flow")
      .eq("status", "pending")
      .single();

    const userId = creditPurchase?.user_id || null;
    const creditsToAdd = creditPurchase?.credits || 0;
    const purchaseId = creditPurchase?.id || null;

    if (status === 2 && userId && purchaseId) { // Status 2 = Pagado
      logStep("✅ Pago de créditos confirmado", { userId, commerceOrder, creditsToAdd });

      // Actualizar estado de la compra
      const { error: updatePurchaseError } = await supabaseClient
        .from("credit_purchases")
        .update({
          status: "completed",
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchaseId);

      if (updatePurchaseError) {
        logStep("❌ Error actualizando compra", updatePurchaseError);
      } else {
        logStep("✅ Compra actualizada a completada");
      }

      // Agregar créditos al usuario usando la función de base de datos
      const { error: creditsError } = await supabaseClient
        .rpc('add_credits_to_user', {
          p_user_id: userId,
          p_credits: creditsToAdd
        });

      if (creditsError) {
        logStep("❌ Error agregando créditos", creditsError);
      } else {
        logStep("✅ Créditos agregados exitosamente", { userId, creditsToAdd });
      }
    } else {
      logStep("⚠️ Pago no completado o compra no encontrada", { status, userId, commerceOrder, purchaseId });
    }

    logStep("🎉 Webhook procesado exitosamente");
    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR en flow-webhook", { message: errorMessage });
    return new Response("OK", { status: 200 }); // Siempre retornar 200 para evitar reintentos
  }
});
