
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-WEBHOOK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Webhook recibido");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
    }

    // Verificar que sea un token válido (TEST- o APP_USR-)
    if (!accessToken.startsWith("TEST-") && !accessToken.startsWith("APP_USR-")) {
      logStep("Advertencia: Token no reconocido", { tokenPrefix: accessToken.substring(0, 10) });
    }

    const isTestToken = accessToken.startsWith("TEST-");
    logStep("Token verificado", { 
      tipo: isTestToken ? "TEST" : "PRODUCCIÓN",
      tokenPrefix: accessToken.substring(0, 20) + "..." 
    });

    const body = await req.json();
    logStep("Payload del webhook", body);

    // Verificar que es una notificación de suscripción (preapproval)
    if (body.type !== "subscription_preapproval") {
      logStep("No es una notificación de suscripción, ignorando", { type: body.type });
      return new Response("OK", { status: 200 });
    }

    const preapprovalId = body.data?.id;
    if (!preapprovalId) {
      logStep("No se encontró ID de preapproval");
      return new Response("OK", { status: 200 });
    }

    logStep("Procesando suscripción", { preapprovalId });

    // Obtener detalles de la suscripción desde MercadoPago
    const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        // Headers adicionales para modo TEST
        ...(isTestToken && {
          "X-Test-Token": "true"
        })
      },
    });

    const subscriptionData = await mpResponse.json();
    logStep("Datos de suscripción desde MP", subscriptionData);

    if (!mpResponse.ok) {
      throw new Error(`Error obteniendo suscripción: ${JSON.stringify(subscriptionData)}`);
    }

    // Determinar el nuevo estado basado en el estado de MercadoPago
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
    if (subscriptionData.status === "authorized" && subscriptionData.auto_recurring?.next_payment_date) {
      subscriptionEnd = subscriptionData.auto_recurring.next_payment_date;
    } else if (subscriptionData.status === "authorized") {
      // Fallback: 30 días desde ahora para suscripciones activas
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      subscriptionEnd = nextMonth.toISOString();
    }

    logStep("Estado procesado", {
      preapprovalId,
      newStatus,
      subscriptionEnd,
      externalReference: subscriptionData.external_reference,
      isTestMode: isTestToken
    });

    // Buscar usuario por external_reference
    const userId = subscriptionData.external_reference;
    if (!userId) {
      logStep("No se encontró external_reference, no se puede identificar usuario");
      throw new Error("No se encontró external_reference en datos de suscripción");
    }

    // Verificar que el usuario existe
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      logStep("Usuario no encontrado por external_reference", { userId, error: profileError });
      throw new Error(`Usuario no encontrado: ${userId}`);
    }

    logStep("Usuario encontrado", { userId: profile.id, email: profile.email });

    // Actualizar o crear suscripción
    const { error: upsertError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: profile.id,
        tier: "pro",
        status: newStatus,
        price_per_month: 6990,
        currency: "CLP",
        stripe_subscription_id: preapprovalId, // Reutilizamos este campo para MP
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (upsertError) {
      logStep("Error actualizando suscripción", upsertError);
      throw new Error(`Error de base de datos: ${upsertError.message}`);
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
      logStep("Advertencia: No se pudo actualizar perfil", profileUpdateError);
    } else {
      logStep("Perfil actualizado exitosamente", { 
        userId: profile.id, 
        email: profile.email, 
        tier: profileUpdates.subscription_tier,
        isPremium: profileUpdates.is_premium,
        expiresAt: profileUpdates.premium_expires_at,
        isTestMode: isTestToken
      });
    }

    logStep("Webhook procesado exitosamente", {
      preapprovalId,
      status: newStatus,
      userId: profile.id,
      subscriptionEnd,
      isTestMode: isTestToken
    });

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR en mercadopago-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
