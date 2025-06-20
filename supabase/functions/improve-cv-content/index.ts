
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
    const { content, type, context } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'summary') {
      systemPrompt = `Eres un experto en recursos humanos especializado en redactar resúmenes profesionales para CVs. Tu objetivo es crear resúmenes concisos, impactantes y optimizados para ATS (Applicant Tracking Systems).

Características de un buen resumen profesional:
- Máximo 3-4 líneas
- Incluye años de experiencia específicos
- Menciona habilidades técnicas clave
- Destaca logros cuantificables cuando sea posible
- Usa palabras clave relevantes para la industria
- Evita clichés como "profesional dinámico" o "team player"
- Es específico y concreto`;

      userPrompt = `Mejora este resumen profesional para que sea más impactante y optimizado para ATS:

"${content}"

${context ? `Contexto adicional: ${context}` : ''}

Devuelve solo el resumen mejorado, sin explicaciones adicionales.`;
    } else if (type === 'experience') {
      systemPrompt = `Eres un experto en recursos humanos especializado en redactar bullet points para experiencia laboral en CVs. Tu objetivo es crear descripciones impactantes que destaquen logros y responsabilidades de manera cuantificable.

Características de buenos bullet points:
- Comienzan con verbos de acción en pasado
- Incluyen métricas y números específicos cuando sea posible
- Muestran el impacto y los resultados obtenidos
- Son concisos pero descriptivos
- Usan palabras clave relevantes para ATS
- Evitan responsabilidades básicas, se enfocan en logros
- Máximo 3-4 bullet points por experiencia`;

      userPrompt = `Mejora estos bullet points de experiencia laboral para que sean más impactantes y cuantificables:

"${content}"

${context ? `Contexto adicional: ${context}` : ''}

Devuelve solo los bullet points mejorados en formato de lista con viñetas (•), sin explicaciones adicionales.`;
    }

    console.log('Calling OpenAI API for content improvement...');

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

    console.log('Content improved successfully');

    return new Response(JSON.stringify({ improvedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in improve-cv-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Error al mejorar el contenido del CV'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
