
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
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
    
    const isTestToken = accessToken.startsWith("TEST-");
    logStep("MercadoPago token verified", { 
      isTestMode: isTestToken,
      tokenPrefix: accessToken.substring(0, 15) + "..." 
    });

    if (!isTestToken) {
      logStep("WARNING: Using production token - this may cause issues with test users");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Obtener información adicional del perfil para mejorar calidad de integración
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, phone, country, city")
      .eq("id", user.id)
      .single();

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

    // Determinar el email del pagador
    const payerEmail = user.email;
    
    logStep("Payer email determined", { 
      payerEmail, 
      isTestMode: isTestToken,
      note: "Using real user email for better test compatibility"
    });

    // Separar nombre y apellido para mejor calidad de integración
    const [firstName = "", lastName = ""] = (profile?.full_name || user.email.split('@')[0] || "Usuario").split(' ');

    // Crear la suscripción en MercadoPago con datos completos para mejor calidad
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
      // Información adicional del pagador para mejorar calidad de integración
      payer: {
        first_name: firstName,
        last_name: lastName || "Apellido",
        email: payerEmail,
        phone: {
          area_code: "56",
          number: profile?.phone || "912345678"
        },
        address: {
          country: profile?.country || "Chile",
          city: profile?.city || "Santiago"
        }
      },
      // Información del ítem para mejor calidad
      items: {
        id: "plan-pro-resumai",
        title: "Plan Pro ResumAI",
        description: "Suscripción mensual al Plan Pro de ResumAI con acceso completo a todas las funciones premium",
        category_id: "services", // Categoría del servicio
        quantity: 1,
        currency_id: "CLP",
        unit_price: 6990
      }
    };

    logStep("Creating subscription with enhanced data", { 
      subscriptionData: {
        ...subscriptionData,
        payer_email: payerEmail,// Log the actual email being used
        payer_info: subscriptionData.payer
      }, 
      isTestMode: isTestToken 
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
    logStep("MercadoPago response", { 
      status: response.status, 
      resultId: result.id,
      resultStatus: result.status,
      initPoint: result.init_point,
      error: result.error || "none"
    });

    if (!response.ok) {
      logStep("MercadoPago API Error Details", {
        status: response.status,
        error: result,
        message: result.message || "Unknown error",
        cause: result.cause || "Unknown cause"
      });
      
      let errorMessage = "Error al crear la suscripción en MercadoPago";
      
      if (result.message?.includes("Both payer and collector must be real or test users")) {
        errorMessage = "Error: Necesitas usar credenciales de PRUEBA (TEST-) de una cuenta vendedor específica. Ve a tu panel de MercadoPago → Credenciales de prueba → Cuentas de prueba, crea una cuenta vendedor y usa su token TEST-.";
      } else if (result.message?.includes("Invalid users")) {
        errorMessage = "Usuario no válido para MercadoPago. Asegúrate de usar credenciales de prueba correctas.";
      } else if (result.message?.includes("forbidden")) {
        errorMessage = "Acceso denegado. Verifica que tu token de MercadoPago tenga los permisos necesarios y sea de tipo TEST-.";
      }
      
      throw new Error(errorMessage);
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
      notificationUrl,
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
    logStep("ERROR in create-mercadopago-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
