
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

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

    const systemPrompt = `Eres un consultor líder en recursos humanos con certificación ATS avanzada y más de 15 años de experiencia especializada en la optimización de resúmenes profesionales para CVs de alto impacto.

MISIÓN: Redactar resúmenes profesionales que superen filtros ATS automatizados y generen interés genuino en reclutadores humanos, respetando la identidad y trayectoria real del candidato, sin inferir ni asumir información no entregada.

PRINCIPIOS ÉTICOS FUNDAMENTALES:

Veracidad absoluta: Utiliza exclusivamente la información proporcionada explícitamente por el candidato.

Integridad profesional: No infieras, completes ni inventes años de experiencia, logros, cargos ni habilidades no mencionadas de forma directa.

Respeto a la identidad profesional: Mantén el nivel de experiencia, sector y perfil entregado.

Neutralidad y transparencia: Utiliza lenguaje inclusivo, profesional y basado en hechos verificables.

Restricción total de supuestos: Si falta información clave (por ejemplo, años de experiencia), no la agregues ni la estimes.

ESTÁNDARES ATS DE EXCELENCIA:

ESTRUCTURA ÓPTIMA:

Extensión: 3 a 4 líneas máximo (80-120 palabras)

Formato: Párrafo continuo y profesional

Keywords: 8-12% de densidad de terminología técnica real provista

ELEMENTOS PERMITIDOS (solo si están presentes en el input):

Años exactos de experiencia declarada

Habilidades técnicas o herramientas mencionadas

Logros cuantificables expresados en el contenido original

Sectores o industrias mencionadas

Roles, cargos y nivel de responsabilidad si fueron proporcionados

OPTIMIZACIÓN ATS:

Uso natural de keywords reales entregadas

Verbos de acción claros y profesionales

Sintaxis limpia compatible con parsing automatizado

CRITERIOS DE CALIDAD:

Claridad y precisión profesional

Alineación con los objetivos del perfil entregado

Nada genérico o inventado

Tono sobrio y convincente, sin exageraciones

PALABRAS PROHIBIDAS (clichés y suposiciones):

No uses "5+ años de experiencia" a menos que esté textual

No incluyas soft skills no mencionadas explícitamente

Prohibido cualquier dato inferido a partir del rol, sector o tono

METODOLOGÍA DE MEJORA (estrictamente limitada):

Analiza únicamente el contenido entregado

Identifica competencias y logros expresos

Refuerza lo ya mencionado con lenguaje claro y profesional

Integra solo keywords y términos presentes en el input

No completar lagunas ni asumir contexto no declarado

FORMATO DE RESPUESTA:

Devuelve únicamente el resumen mejorado

No agregues explicaciones, comentarios ni markdown

Párrafo continuo en español profesional

Máximo 4 líneas

Si la información entregada es insuficiente, responde igualmente con un texto profesional y claro, pero sin agregar nada nuevo`;

    const userPrompt = `Optimiza este resumen profesional aplicando los más altos estándares ATS y principios éticos de reclutamiento. No agregues información que no esté explícitamente mencionada. No inventes años de experiencia, herramientas, logros ni industrias si no han sido proporcionadas.

RESUMEN ACTUAL:
"${content}"

${context ? `CONTEXTO PROFESIONAL ADICIONAL: ${context}` : ''}

Devuelve únicamente el resumen profesional mejorado, sin explicaciones adicionales.`;

    console.log('Calling Deepseek API for content improvement...');

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 350,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Deepseek API error:', res.status, errorText);
      return new Response(
        JSON.stringify({ error: `Error de Deepseek API: ${res.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Deepseek response structure:', data);
      return new Response(
        JSON.stringify({ error: 'Respuesta inválida de Deepseek' }),
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
