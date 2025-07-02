import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENIU-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("🚀 Iniciando creación de suscripción Reveniu");

    const reveniuSecret = Deno.env.get("REVENIU_SECRET_KEY");
    if (!reveniuSecret) {
      throw new Error("REVENIU_SECRET_KEY no configurado");
    }

    logStep("🔑 Secret de Reveniu verificado");

    // Autenticación del usuario
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No se proporcionó header de autorización");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("❌ Error de autenticación", userError);
      throw new Error(`Error de autenticación: ${userError.message}`);
    }

    const user = userData.user;
    if (!user?.email) {
      throw new Error("Usuario no autenticado o email no disponible");
    }

    logStep("👤 Usuario autenticado", { userId: user.id, email: user.email });

    // Obtener perfil del usuario
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    logStep("📋 Datos del perfil obtenidos", { 
      hasProfile: !!profile,
      fullName: profile?.full_name || "no disponible"
    });

    // Determinar si estamos en sandbox o producción
    const isProduction = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
    const apiUrl = isProduction ? "https://api.reveniu.com/api/v1" : "https://integration.reveniu.com/api/v1";
    
    logStep("🌍 Entorno determinado", { 
      isProduction,
      apiUrl
    });

    // Crear plan en Reveniu (o usar uno existente)
    const planData = {
      frequency: "3", // Monthly
      price: 6990,
      currency: "1", // CLP
      trial_cicles: 0,
      cicles: 0, // Indefinido
      auto_renew: true,
      title: "Plan Pro ResumAI",
      description: "Acceso completo a todas las funciones premium de ResumAI",
      redirect_to: `${Deno.env.get("SUPABASE_URL")?.replace('/functions/v1', '')}/app/billing?status=success`,
      redirect_to_failure: `${Deno.env.get("SUPABASE_URL")?.replace('/functions/v1', '')}/app/billing?status=failed`,
      active: true,
      accepting_new_enrollments: true
    };

    logStep("📋 Creando plan en Reveniu", planData);

    const planResponse = await fetch(`${apiUrl}/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Reveniu-Secret-Key": reveniuSecret,
      },
      body: JSON.stringify(planData),
    });

    if (!planResponse.ok) {
      const planError = await planResponse.json();
      logStep("❌ Error creando plan", {
        status: planResponse.status,
        error: planError
      });
      throw new Error(`Error creando plan: ${planError.message || 'Error desconocido'}`);
    }

    const plan = await planResponse.json();
    logStep("✅ Plan creado", { planId: plan.id });

    // Crear suscripción
    const subscriptionData = {
      plan_id: plan.id,
      external_id: user.id,
      field_values: {
        email: user.email,
        name: profile?.full_name || user.email.split('@')[0]
      }
    };

    logStep("💳 Creando suscripción en Reveniu", subscriptionData);

    const subscriptionResponse = await fetch(`${apiUrl}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Reveniu-Secret-Key": reveniuSecret,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!subscriptionResponse.ok) {
      const subscriptionError = await subscriptionResponse.json();
      logStep("❌ Error creando suscripción", {
        status: subscriptionResponse.status,
        error: subscriptionError
      });
      throw new Error(`Error creando suscripción: ${subscriptionError.message || 'Error desconocido'}`);
    }

    const subscription = await subscriptionResponse.json();
    logStep("✅ Suscripción creada", { 
      subscriptionId: subscription.id,
      hasCompletionUrl: !!subscription.completion_url
    });

    // Guardar suscripción en BD
    const subscriptionRecord = {
      user_id: user.id,
      tier: "pro",
      status: "pending",
      price_per_month: 6990,
      currency: "CLP",
      provider: "reveniu",
      stripe_subscription_id: subscription.id.toString(),
      updated_at: new Date().toISOString(),
    };

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
        logStep("❌ Error actualizando suscripción", updateError);
      } else {
        logStep("✅ Suscripción actualizada en BD");
      }
    } else {
      const { error: insertError } = await supabaseClient
        .from("subscriptions")
        .insert([subscriptionRecord]);
      
      if (insertError) {
        logStep("❌ Error insertando suscripción", insertError);
      } else {
        logStep("✅ Suscripción creada en BD");
      }
    }

    logStep("🎉 Suscripción procesada exitosamente", {
      subscriptionId: subscription.id,
      completionUrl: subscription.completion_url,
      planId: plan.id,
      isProduction
    });

    return new Response(JSON.stringify({
      subscription_id: subscription.id,
      checkout_url: subscription.completion_url,
      plan_id: plan.id,
      amount: 6990,
      currency: "CLP",
      test_mode: !isProduction
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 ERROR en create-reveniu-subscription", { 
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