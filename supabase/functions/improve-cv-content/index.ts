import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { resolveAIConfig, createChatCompletion, AIError } from '../_shared/ai.ts';
import { getAllowedOrigins, corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { getAuthedUser, enforceQuota, recordUsage, HttpError } from '../_shared/auth.ts';

const env = Deno.env.toObject();

const SYSTEM_PROMPT = `Eres un consultor líder en recursos humanos con certificación ATS avanzada y más de 15 años de experiencia especializada en la optimización de resúmenes profesionales para CVs de alto impacto.

MISIÓN: Redactar resúmenes profesionales que superen filtros ATS automatizados y generen interés genuino en reclutadores humanos, respetando la identidad y trayectoria real del candidato, sin inferir ni asumir información no entregada.

PRINCIPIOS ÉTICOS FUNDAMENTALES:
- Veracidad absoluta: usa exclusivamente la información proporcionada explícitamente.
- No infieras ni inventes años de experiencia, logros, cargos ni habilidades no mencionadas.
- Mantén el nivel de experiencia, sector y perfil entregado.
- Lenguaje inclusivo, profesional y basado en hechos verificables.

ESTRUCTURA ÓPTIMA:
- Extensión: 3 a 4 líneas máximo (80-120 palabras), párrafo continuo.
- Densidad de keywords técnicas reales del 8-12%.
- Verbos de acción claros; sintaxis compatible con parsing automatizado.

FORMATO DE RESPUESTA:
- Devuelve únicamente el resumen mejorado, sin explicaciones ni markdown.
- Párrafo continuo en español profesional, máximo 4 líneas.
- Si la información es insuficiente, responde igualmente de forma profesional sin agregar datos nuevos.`;

serve(async (req) => {
  const cors = corsHeaders(req.headers.get('Origin'), getAllowedOrigins(env));
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    const ctx = await getAuthedUser(req, env);
    await enforceQuota(ctx, 'ai_improvements');

    const { content, context } = await req.json();
    if (!content || typeof content !== 'string') {
      return jsonResponse({ error: 'content es requerido' }, 400, cors);
    }

    const userPrompt = `Optimiza este resumen profesional aplicando los más altos estándares ATS y principios éticos de reclutamiento. No agregues información que no esté explícitamente mencionada.

RESUMEN ACTUAL:
"${content}"

${context ? `CONTEXTO PROFESIONAL ADICIONAL: ${context}` : ''}

Devuelve únicamente el resumen profesional mejorado, sin explicaciones adicionales.`;

    const config = resolveAIConfig(env);
    const improvedContent = await createChatCompletion(config, {
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 350,
      mock: `[Demo] ${content} — optimizado para ATS con verbos de acción y palabras clave del sector.`,
    });

    await recordUsage(ctx, 'ai_improvements');
    return jsonResponse({ improvedContent }, 200, cors);
  } catch (error) {
    if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status, cors);
    if (error instanceof AIError) return jsonResponse({ error: error.message }, error.status, cors);
    console.error('Error in improve-cv-content:', error instanceof Error ? error.message : error);
    return jsonResponse({ error: 'No se pudo mejorar el contenido' }, 500, cors);
  }
});
