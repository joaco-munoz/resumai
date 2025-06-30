
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MP-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
    }
    
    const isTestToken = accessToken.startsWith("TEST-");
    logStep("MercadoPago token verified", { 
      isTestMode: isTestToken,
      tokenPrefix: accessToken.substring(0, 15) + "..." 
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Obtener información adicional del perfil
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, phone, country, city")
      .eq("id", user.id)
      .single();

    logStep("Profile data retrieved", { 
      hasProfile: !!profile,
      fullName: profile?.full_name || "not available"
    });

    // Construir URLs correctamente
    let origin = req.headers.get("origin") || "https://jwitsagioonykrabioku.supabase.co";
    
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      origin = "https://jwitsagioonykrabioku.supabase.co";
      logStep("Using Supabase URL instead of localhost for MercadoPago", { origin });
    }
    
    if (!origin.startsWith("http://") && !origin.startsWith("https://")) {
      origin = "https://" + origin;
    }
    
    const backUrl = `${origin}/app/billing`;
    const notificationUrl = `${origin}/functions/v1/mercadopago-webhook`;
    
    logStep("URLs constructed", { origin, backUrl, notificationUrl });

    // Para tokens de prueba, usar email de prueba específico
    let payerEmail;
    if (isTestToken) {
      // Usar un email de prueba válido para el entorno de test
      payerEmail = "test_user_123456@testuser.com";
      logStep("Using test email for test token", { payerEmail });
    } else {
      payerEmail = user.email;
      logStep("Using real user email", { payerEmail });
    }

    // Separar nombre y apellido
    const [firstName = "", lastName = ""] = (profile?.full_name || "Test User").split(' ');

    // Crear la suscripción en MercadoPago con configuración optimizada para tokens de prueba
    const subscriptionData = {
      reason: "Plan Pro ResumAI - Suscripción Mensual",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 6990,
        currency_id: "CLP"
      },
      payer_email: payerEmail,
      back_url: backUrl,
      notification_url: notificationUrl,
      external_reference: user.id,
      status: "pending",
      payer: {
        first_name: firstName || "Test",
        last_name: lastName || "User",
        email: payerEmail,
        phone: {
          area_code: "56",
          number: profile?.phone || "912345678"
        },
        address: {
          country: profile?.country || "Chile",
          city: profile?.city || "Santiago"
        }
      }
    };

    logStep("Creating subscription with data", { 
      subscriptionData: {
        reason: subscriptionData.reason,
        amount: subscriptionData.auto_recurring.transaction_amount,
        currency: subscriptionData.auto_recurring.currency_id,
        payer_email: payerEmail,
        external_reference: user.id,
        isTestMode: isTestToken
      }
    });

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `subscription-${user.id}-${Date.now()}`
      },
      body: JSON.stringify(subscriptionData),
    });

    const result = await response.json();
    
    logStep("MercadoPago response received", { 
      status: response.status,
      statusText: response.statusText,
      resultId: result.id,
      resultStatus: result.status,
      hasInitPoint: !!result.init_point,
      errorPresent: !!result.error
    });

    if (!response.ok) {
      logStep("MercadoPago API Error Details", {
        status: response.status,
        statusText: response.statusText,
        error: result,
        message: result.message || "Unknown error",
        cause: result.cause || "Unknown cause",
        details: result.details || "No details"
      });
      
      let errorMessage = "Error al crear la suscripción en MercadoPago";
      
      if (result.message) {
        if (result.message.includes("payer") && result.message.includes("test")) {
          errorMessage = "Error de configuración de prueba: Asegúrate de usar credenciales de TEST completas y cuentas de prueba específicas.";
        } else if (result.message.includes("Invalid users")) {
          errorMessage = "Usuario no válido para MercadoPago. Verifica las credenciales de prueba.";
        } else if (result.message.includes("forbidden") || result.message.includes("Forbidden")) {
          errorMessage = "Acceso denegado. Verifica que tu token de MercadoPago tenga los permisos necesarios.";
        } else {
          errorMessage = `Error de MercadoPago: ${result.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    if (!result.init_point) {
      logStep("No init_point in response", result);
      throw new Error("No se pudo obtener la URL de pago de MercadoPago");
    }

    // Preparar los datos de la suscripción
    const subscriptionRecord = {
      user_id: user.id,
      tier: "pro",
      status: "pending",
      price_per_month: 6990,
      currency: "CLP",
      stripe_subscription_id: result.id,
      updated_at: new Date().toISOString(),
    };

    // Verificar si ya existe una suscripción para este usuario
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
        logStep("Database update error", updateError);
        throw new Error(`Database update error: ${updateError.message}`);
      }
      logStep("Subscription updated successfully");
    } else {
      const { error: insertError } = await supabaseClient
        .from("subscriptions")
        .insert([subscriptionRecord]);
      
      if (insertError) {
        logStep("Database insert error", insertError);
        throw new Error(`Database insert error: ${insertError.message}`);
      }
      logStep("Subscription created successfully");
    }

    logStep("Subscription processed successfully", {
      subscriptionId: result.id,
      checkoutUrl: result.init_point,
      isTestMode: isTestToken,
      externalReference: user.id
    });

    return new Response(JSON.stringify({
      subscription_id: result.id,
      checkout_url: result.init_point,
      status: result.status,
      is_test: isTestToken
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-mercadopago-subscription", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check the function logs for more details"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
