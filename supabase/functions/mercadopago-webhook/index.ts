
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
    logStep("🔔 WEBHOOK RECIBIDO", {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
    }

    const isTestToken = accessToken.startsWith("TEST-");
    logStep("🔑 Token verificado", { 
      tipo: isTestToken ? "TEST" : "PRODUCCIÓN",
      tokenPrefix: accessToken.substring(0, 20) + "..." 
    });

    let body;
    try {
      const text = await req.text();
      logStep("📨 Raw body recibido", { text });
      
      if (text) {
        body = JSON.parse(text);
      } else {
        body = {};
      }
    } catch (error) {
      logStep("⚠️ Error parseando body", { error: error.message });
      body = {};
    }

    logStep("📋 Payload procesado", body);

    // Manejar diferentes tipos de notificaciones de MercadoPago
    let preapprovalId;
    let eventType;

    if (body.type === "subscription_preapproval" || body.type === "preapproval") {
      preapprovalId = body.data?.id;
      eventType = body.type;
    } else if (body.action === "subscription.updated" || body.action === "preapproval.updated") {
      preapprovalId = body.data?.id;
      eventType = body.action;
    } else if (body.id && !body.type) {
      // A veces MP envía solo el ID
      preapprovalId = body.id;
      eventType = "direct_id";
    } else {
      logStep("❓ Tipo de notificación no reconocida", { 
        type: body.type, 
        action: body.action,
        bodyKeys: Object.keys(body)
      });
      
      // Intentar procesar de todas formas si hay algún ID
      preapprovalId = body.data?.id || body.id || body.preapproval_id;
      eventType = "unknown";
    }

    if (!preapprovalId) {
      logStep("❌ No se encontró ID de preapproval", { body });
      return new Response("OK - No preapproval ID", { status: 200 });
    }

    logStep("🔍 Procesando suscripción", { preapprovalId, eventType });

    // Obtener detalles de la suscripción desde MercadoPago
    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    if (isTestToken) {
      headers["X-Test-Token"] = "true";
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      logStep("❌ Error obteniendo suscripción de MP", {
        status: mpResponse.status,
        error: errorData
      });
      
      // Aún así devolver 200 para que MP no reintente
      return new Response("OK - Error handled", { status: 200 });
    }

    const subscriptionData = await mpResponse.json();
    logStep("📊 Datos de suscripción desde MP", subscriptionData);

    // Determinar el nuevo estado
    let newStatus = "pending";
    if (subscriptionData.status === "authorized") {
      newStatus = "active";
    } else if (subscriptionData.status === "cancelled") {
      newStatus = "cancelled";
    } else if (subscriptionData.status === "paused") {
      newStatus = "paused";
    }

    // Calcular fecha de próximo pago
    let subscriptionEnd = null;
    if (subscriptionData.status === "authorized") {
      if (subscriptionData.auto_recurring?.next_payment_date) {
        subscriptionEnd = subscriptionData.auto_recurring.next_payment_date;
      } else {
        // Fallback: 30 días desde ahora
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        subscriptionEnd = nextMonth.toISOString();
      }
    }

    const userId = subscriptionData.external_reference;
    if (!userId) {
      logStep("❌ No se encontró external_reference", subscriptionData);
      return new Response("OK - No user ID", { status: 200 });
    }

    logStep("🔄 Actualizando base de datos", {
      userId,
      newStatus,
      subscriptionEnd,
      preapprovalId
    });

    // Verificar que el usuario existe
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      logStep("❌ Usuario no encontrado", { userId, error: profileError });
      return new Response("OK - User not found", { status: 200 });
    }

    // Actualizar suscripción
    const { error: upsertError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: profile.id,
        tier: "pro",
        status: newStatus,
        price_per_month: 6990,
        currency: "CLP",
        stripe_subscription_id: preapprovalId,
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (upsertError) {
      logStep("❌ Error actualizando suscripción", upsertError);
    } else {
      logStep("✅ Suscripción actualizada");
    }

    // Actualizar perfil del usuario
    const profileUpdates: any = {
      subscription_tier: newStatus === "active" ? "pro" : "free",
      is_premium: newStatus === "active",
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "active") {
      profileUpdates.premium_expires_at = subscriptionEnd;
    } else {
      profileUpdates.premium_expires_at = null;
    }

    const { error: profileUpdateError } = await supabaseClient
      .from("profiles")
      .update(profileUpdates)
      .eq("id", profile.id);

    if (profileUpdateError) {
      logStep("⚠️ Error actualizando perfil", profileUpdateError);
    } else {
      logStep("✅ Perfil actualizado", {
        userId: profile.id,
        tier: profileUpdates.subscription_tier,
        isPremium: profileUpdates.is_premium
      });
    }

    logStep("🎉 WEBHOOK PROCESADO EXITOSAMENTE", {
      preapprovalId,
      status: newStatus,
      userId: profile.id,
      isTestMode: isTestToken
    });

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR CRÍTICO", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response("OK", { 
      status: 200  // Siempre devolver 200 para que MP no reintente
    });
  }
});
