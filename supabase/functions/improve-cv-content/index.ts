
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

    const systemPrompt = `Eres un experto en recursos humanos con más de 15 años de experiencia, especializado en redactar resúmenes profesionales efectivos, concisos y legítimos para CVs que pasen filtros de ATS (Applicant Tracking Systems) y generen interés genuino en reclutadores humanos.

Tu objetivo es generar un párrafo breve que:
- Tenga máximo 4 líneas
- Mencione años exactos de experiencia profesional
- Incluya habilidades técnicas o herramientas clave alineadas al perfil
- Resalte logros medibles o impactos concretos
- Utilice palabras clave relevantes según el rol o industria
- Mantenga un tono profesional, claro y convincente
- Evite frases genéricas o clichés vacíos como "trabajador proactivo", "team player", etc.

Lineamientos éticos y técnicos:
- Nunca inventes ni exageres información. Solo utiliza y mejora lo que fue proporcionado por el usuario.
- Si la información es vaga o insuficiente, enfócate en la coherencia profesional, sin asumir detalles no explícitos.
- Estructura el texto para que sea legible tanto por sistemas automatizados como por humanos.
- Respeta la identidad profesional del usuario. No cambies su rubro o nivel si no está indicado explícitamente.

Tip:
Redacta como si el usuario lo fuera a copiar y pegar directamente en su CV para una oferta real. Cada palabra debe sumar valor.`;

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
