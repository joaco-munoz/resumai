
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

    const systemPrompt = `Eres un experto en recursos humanos especializado en redactar bullet points impactantes para experiencia laboral en CVs. Tu objetivo es crear descripciones que destaquen logros y responsabilidades de manera cuantificable y optimizada para ATS.

Características de buenos bullet points:
- Comienzan con verbos de acción en pasado (Desarrollé, Implementé, Lideré, Optimicé, etc.)
- Incluyen métricas y números específicos cuando sea posible
- Muestran el impacto y los resultados obtenidos
- Son concisos pero descriptivos (máximo 250 caracteres)
- Usan palabras clave relevantes para ATS
- Se enfocan en logros, no solo en responsabilidades básicas
- Evitan palabras vagas como "ayudé", "participé", "colaboré"`;

    const userPrompt = `Mejora este bullet point de experiencia laboral para que sea más impactante y cuantificable:

"${bulletPoint}"

${context ? `Contexto: ${context}` : ''}

Devuelve solo el bullet point mejorado, sin explicaciones adicionales. Debe comenzar con un verbo de acción en pasado y ser específico sobre los logros.`;

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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
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
