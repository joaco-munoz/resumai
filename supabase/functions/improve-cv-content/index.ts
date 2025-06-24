
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
    const { content, context } = await req.json();

    const systemPrompt = `Eres un experto en recursos humanos especializado en redactar resúmenes profesionales para CVs. Tu objetivo es crear resúmenes concisos, impactantes y optimizados para ATS (Applicant Tracking Systems).

Características de un buen resumen profesional:
- Máximo 3-4 líneas
- Incluye años de experiencia específicos
- Menciona habilidades técnicas clave
- Destaca logros cuantificables cuando sea posible
- Usa palabras clave relevantes para la industria
- Evita clichés como "profesional dinámico" o "team player"
- Es específico y concreto`;

    const userPrompt = `Mejora este resumen profesional para que sea más impactante y optimizado para ATS:

"${content}"

${context ? `Contexto adicional: ${context}` : ''}

Devuelve solo el resumen mejorado, sin explicaciones adicionales.`;

    console.log('Calling OpenAI API for summary improvement...');

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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const improvedContent = data.choices[0].message.content;

    console.log('Summary improved successfully');

    return new Response(JSON.stringify({ improvedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in improve-cv-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Error al mejorar el resumen profesional'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
