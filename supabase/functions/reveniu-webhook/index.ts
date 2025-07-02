import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENIU-WEBHOOK] ${step}${detailsStr}`);
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

    // Verificar la clave secreta de Reveniu (deberías configurarla en las variables de entorno)
    const reveniuWebhookSecret = Deno.env.get("REVENIU_WEBHOOK_SECRET");
    if (!reveniuWebhookSecret) {
      throw new Error("REVENIU_WEBHOOK_SECRET no configurado");
    }

    // Verificar la firma del webhook (si Reveniu proporciona este mecanismo)
    const signature = req.headers.get("x-reveniu-signature") || req.headers.get("x-webhook-signature");
    
    // Aquí deberías implementar la verificación de la firma según la documentación de Reveniu
    // Este es un placeholder, deberás ajustarlo según la documentación específica
    if (!signature) {
      logStep("⚠️ No se encontró firma de webhook");
      // Dependiendo de tu configuración, podrías rechazar webhooks sin firma
      // return new Response("Unauthorized", { status: 401 });
    }

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

    // Procesar diferentes tipos de eventos de Reveniu
    // Ajusta esto según la documentación específica de Reveniu
    const eventType = body.event || body.type || "unknown";
    const subscriptionId = body.subscription_id || body.id;
    const userId = body.metadata?.user_id || body.user_id || body.external_reference;
    const status = body.status || "unknown";

    logStep("🔍 Evento recibido", { eventType, subscriptionId, userId, status });

    if (!subscriptionId) {
      logStep("❌ No se encontró ID de suscripción", { body });
      return new Response("OK - No subscription ID", { status: 200 });
    }

    if (!userId) {
      logStep("❌ No se encontró ID de usuario", { body });
      return new Response("OK - No user ID", { status: 200 });
    }

    // Determinar el nuevo estado de la suscripción
    let newStatus = "pending";
    let subscriptionEnd = null;

    // Ajusta esta lógica según los estados que maneja Reveniu
    if (status === "active" || status === "paid" || status === "completed") {
      newStatus = "active";
      
      // Calcular fecha de fin de suscripción (30 días por defecto o según lo que indique Reveniu)
      if (body.next_payment_date || body.expiration_date) {
        subscriptionEnd = body.next_payment_date || body.expiration_date;
      } else {
        // Fallback: 30 días desde ahora
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        subscriptionEnd = nextMonth.toISOString();
      }
    } else if (status === "cancelled" || status === "expired") {
      newStatus = "cancelled";
    } else if (status === "paused") {
      newStatus = "paused";
    }

    logStep("🔄 Actualizando base de datos", {
      userId,
      newStatus,
      subscriptionEnd,
      subscriptionId
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
        provider: "reveniu", // Indicar que es una suscripción de Reveniu
        stripe_subscription_id: subscriptionId, // Mantener el mismo campo por compatibilidad
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
      subscriptionId,
      status: newStatus,
      userId: profile.id
    });

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR CRÍTICO", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response("OK", { 
      status: 200  // Siempre devolver 200 para que Reveniu no reintente
    });
  }
});
