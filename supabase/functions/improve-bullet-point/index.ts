
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bulletPoint, context } = await req.json();

    if (!bulletPoint) {
      return new Response(
        JSON.stringify({ error: 'bulletPoint es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Eres un experto en recursos humanos con más de 15 años de experiencia, especializado en redactar bullet points profesionales y efectivos para descripciones de experiencia laboral en CVs. Tu objetivo es crear bullets que destaquen logros e impacto real, optimizados para filtros ATS (Applicant Tracking Systems) y que impresionen a reclutadores humanos.

Características de un buen bullet point:
- Comienza con un verbo de acción en pasado (Desarrollé, Implementé, Lideré, Optimicé, Automaticé, etc.)
- Incluye métricas claras o resultados cuantificables (porcentaje, monto, volumen, tiempos, etc.)
- Destaca logros específicos por sobre tareas genéricas
- Es conciso pero descriptivo (idealmente no más de 250 caracteres)
- Utiliza palabras clave relevantes para el puesto y sector
- Enfocado en impacto y valor agregado, no en funciones básicas
- Evita verbos vagos como "ayudé", "apoyé", "participé", "colaboré" si no se puede contextualizar con impacto medible

Lineamientos éticos:
- No inventes logros ni datos. Usa únicamente la información proporcionada por el usuario.
- Si no hay métricas explícitas, infiere un impacto razonable sin exagerar ni falsificar información.
- No infles cargos ni responsabilidades más allá de lo entregado.
- Asegúrate de que el resultado sea profesional, legítimo y útil para postular a empleos reales.

Devuelve únicamente el bullet point mejorado en español, comenzando con "• " y sin explicaciones adicionales.`;

    const userPrompt = `Mejora este bullet point de experiencia laboral para que sea más impactante y cuantificable:

"${bulletPoint}"

${context ? `Contexto: ${context}` : ''}

Devuelve solo el bullet point mejorado, sin explicaciones adicionales.`;

    console.log('Calling OpenAI API for bullet point improvement...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Error de OpenAI API: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(
        JSON.stringify({ error: 'Respuesta inválida de OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const improvedBulletPoint = data.choices[0].message.content;

    console.log('Bullet point improved successfully');

    return new Response(JSON.stringify({ improvedBulletPoint }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in improve-bullet-point function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Error al mejorar el bullet point'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
