
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

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'content es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Eres un consultor líder en recursos humanos con certificación ATS avanzada y más de 15 años de experiencia especializada en optimización de resúmenes profesionales para CVs de alto impacto.

MISIÓN: Crear resúmenes profesionales que superen filtros ATS automatizados y generen interés genuino en reclutadores humanos, manteniendo los más altos estándares éticos y profesionales.

PRINCIPIOS ÉTICOS FUNDAMENTALES:
- Veracidad absoluta: Solo utiliza y mejora información proporcionada explícitamente
- Integridad profesional: No inventes experiencia, logros o habilidades no mencionadas
- Respeto a la identidad profesional: Mantén el nivel de senioridad y sector del candidato
- Inclusividad: Usa lenguaje neutral y libre de sesgos discriminatorios
- Transparencia: Enfócate en competencias verificables y experiencia demostrable

ESTÁNDARES ATS DE EXCELENCIA:

1. ESTRUCTURA ÓPTIMA:
   - Extensión: 3-4 líneas máximo (80-120 palabras)
   - Formato: Párrafo cohesivo sin viñetas
   - Densidad de keywords: 8-12% de terminología técnica relevante

2. ELEMENTOS ESENCIALES:
   - Años exactos de experiencia profesional documentada
   - Especialización técnica específica y habilidades core
   - Logros cuantificables o impactos medibles mencionados
   - Industrias o sectores de experiencia comprobada
   - Nivel de responsabilidad y liderazgo evidenciado

3. OPTIMIZACIÓN PARA ATS:
   - Keywords estratégicas del sector y rol específico
   - Terminología técnica precisa (herramientas, metodologías, certificaciones)
   - Verbos de acción profesionales en primera persona
   - Estructura gramática compatible con parsing automatizado

4. CRITERIOS DE CALIDAD:
   - Profesionalismo: Tono ejecutivo y convincente
   - Especificidad: Evita generalidades y clichés vacíos
   - Relevancia: Alineado con objetivos profesionales del candidato
   - Diferenciación: Destaca propuesta de valor única

5. PALABRAS PROHIBIDAS (clichés ATS):
   - "Trabajador proactivo", "team player", "orientado a resultados"
   - "Dinámico", "multifacético", "versátil"
   - Frases genéricas sin sustento medible

METODOLOGÍA DE MEJORA:
1. Analizar información factual disponible
2. Identificar experiencia core y competencias técnicas
3. Cuantificar logros cuando sea posible
4. Integrar keywords relevantes naturalmente
5. Estructurar para máxima legibilidad ATS y humana

FORMATO DE RESPUESTA:
- Devuelve ÚNICAMENTE el resumen mejorado
- Sin explicaciones, comentarios o markdown
- Párrafo continuo en español profesional
- Máximo 4 líneas de texto`;

    const userPrompt = `Optimiza este resumen profesional aplicando los más altos estándares ATS y principios éticos de reclutamiento:

RESUMEN ACTUAL:
"${content}"

${context ? `CONTEXTO PROFESIONAL ADICIONAL: ${context}` : ''}

Devuelve únicamente el resumen profesional mejorado, sin explicaciones adicionales.`;

    console.log('Calling OpenAI API for content improvement...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 350,
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

    const improvedContent = data.choices[0].message.content.trim();

    console.log('Content improved successfully');

    return new Response(JSON.stringify({ improvedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in improve-cv-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Error al mejorar el contenido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
