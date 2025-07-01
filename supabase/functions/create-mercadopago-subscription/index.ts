
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Iniciando creación de suscripción MercadoPago");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
    }

    // Validar que sea un token válido (TEST- para pruebas, APP_USR- para producción)
    if (!accessToken.startsWith("TEST-") && !accessToken.startsWith("APP_USR-")) {
      logStep("Token no válido", { tokenPrefix: accessToken.substring(0, 10) });
      throw new Error("Token de MercadoPago debe comenzar con TEST- (pruebas) o APP_USR- (producción)");
    }

    const isTestToken = accessToken.startsWith("TEST-");
    logStep("Token MercadoPago verificado", { 
      tipo: isTestToken ? "TEST" : "PRODUCCIÓN",
      tokenPrefix: accessToken.substring(0, 20) + "..." 
    });

    // Autenticación del usuario
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No se proporcionó header de autorización");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Error de autenticación", userError);
      throw new Error(`Error de autenticación: ${userError.message}`);
    }

    const user = userData.user;
    if (!user?.email) {
      throw new Error("Usuario no autenticado o email no disponible");
    }

    logStep("Usuario autenticado", { userId: user.id, email: user.email });

    // Obtener perfil del usuario
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, phone, country, city")
      .eq("id", user.id)
      .single();

    logStep("Datos del perfil obtenidos", { 
      hasProfile: !!profile,
      fullName: profile?.full_name || "no disponible"
    });

    // Construir URLs - importante para pruebas
    let origin = req.headers.get("origin") || req.headers.get("host") || "https://jwitsagioonykrabioku.supabase.co";
    
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      origin = "https://jwitsagioonykrabioku.supabase.co";
    }
    
    if (!origin.startsWith("http://") && !origin.startsWith("https://")) {
      origin = "https://" + origin;
    }
    
    const backUrl = `${origin}/app/billing`;
    const notificationUrl = `${origin}/functions/v1/mercadopago-webhook`;
    
    logStep("URLs configuradas", { origin, backUrl, notificationUrl });

    // Datos para la suscripción (PreApproval) - configuración específica para TEST
    const subscriptionData = {
      reason: "Plan Pro ResumAI - Suscripción Mensual",
      payer_email: user.email,
      back_url: backUrl,
      notification_url: notificationUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 6990,
        currency_id: "CLP"
      },
      status: "pending",
      external_reference: user.id
    };

    logStep("Creando suscripción en MercadoPago", {
      email: user.email,
      amount: 6990,
      currency: "CLP",
      frequency: "mensual",
      userId: user.id,
      tokenType: isTestToken ? "TEST" : "PRODUCCIÓN"
    });

    // Usar el endpoint correcto según el tipo de token
    const apiUrl = isTestToken 
      ? "https://api.mercadopago.com/preapproval"
      : "https://api.mercadopago.com/preapproval";

    // Crear suscripción usando la API de PreApproval
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `subscription-${user.id}-${Date.now()}`,
        // Headers adicionales para modo TEST
        ...(isTestToken && {
          "X-Test-Token": "true"
        })
      },
      body: JSON.stringify(subscriptionData),
    });

    const result = await response.json();
    
    logStep("Respuesta de MercadoPago recibida", { 
      status: response.status,
      statusText: response.statusText,
      subscriptionId: result.id,
      status: result.status,
      hasInitPoint: !!result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      fullResponse: result
    });

    if (!response.ok) {
      logStep("Error en API de MercadoPago", {
        status: response.status,
        error: result,
        message: result.message || "Error desconocido"
      });
      
      let errorMessage = "Error al crear la suscripción en MercadoPago";
      
      if (result.message) {
        if (result.message.includes("payer")) {
          errorMessage = "Error con el email del pagador. Asegúrate de usar un email de cuenta de prueba de MercadoPago.";
        } else if (result.message.includes("currency")) {
          errorMessage = "Error con la moneda CLP. Verifica tu configuración de MercadoPago.";
        } else if (result.message.includes("test") || result.message.includes("sandbox")) {
          errorMessage = "Error de configuración de prueba. Verifica que tu token TEST- esté configurado correctamente.";
        } else {
          errorMessage = `Error de MercadoPago: ${result.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Para tokens TEST, usar sandbox_init_point si está disponible
    const checkoutUrl = isTestToken && result.sandbox_init_point 
      ? result.sandbox_init_point 
      : result.init_point;

    if (!checkoutUrl) {
      logStep("No se recibió init_point ni sandbox_init_point", result);
      throw new Error("No se pudo obtener la URL de pago de MercadoPago");
    }

    // Guardar/actualizar suscripción en la base de datos
    const subscriptionRecord = {
      user_id: user.id,
      tier: "pro",
      status: "pending",
      price_per_month: 6990,
      currency: "CLP",
      stripe_subscription_id: result.id, // Reutilizamos este campo para MercadoPago
      updated_at: new Date().toISOString(),
    };

    // Verificar si ya existe una suscripción
    const { data: existingSubscription } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingSubscription) {
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .update(subscriptionRecord)
        .eq("user_id", user.id);
      
      if (updateError) {
        logStep("Error actualizando suscripción en BD", updateError);
        throw new Error(`Error de base de datos: ${updateError.message}`);
      }
      logStep("Suscripción actualizada en BD");
    } else {
      const { error: insertError } = await supabaseClient
        .from("subscriptions")
        .insert([subscriptionRecord]);
      
      if (insertError) {
        logStep("Error insertando suscripción en BD", insertError);
        throw new Error(`Error de base de datos: ${insertError.message}`);
      }
      logStep("Suscripción creada en BD");
    }

    logStep("Suscripción procesada exitosamente", {
      subscriptionId: result.id,
      checkoutUrl: checkoutUrl,
      status: result.status,
      isTestMode: isTestToken
    });

    return new Response(JSON.stringify({
      subscription_id: result.id,
      checkout_url: checkoutUrl,
      status: result.status,
      currency: "CLP",
      amount: 6990,
      test_mode: isTestToken
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR en create-mercadopago-subscription", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Revisa los logs de la función para más detalles"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
