import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { resolveAIConfig, createChatCompletion, AIError } from '../_shared/ai.ts';
import { getAllowedOrigins, corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { getAuthedUser, enforceQuota, recordUsage, HttpError } from '../_shared/auth.ts';

const env = Deno.env.toObject();

const SYSTEM_PROMPT = `Eres un consultor experto en recursos humanos con certificación ATS y más de 15 años de experiencia ayudando a profesionales a optimizar sus CVs.

OBJETIVO: Transformar bullet points de experiencia laboral en declaraciones de impacto profesional que cumplan con estándares ATS y principios éticos.

PRINCIPIOS:
- Mantén la veracidad absoluta; no inventes métricas, logros ni responsabilidades.
- No menciones nombres de empresas ni cargos.
- Inicia con verbos de acción potentes (Implementé, Desarrollé, Optimicé, Lideré, ...).
- Cuantifica solo si la métrica está presente en el input.
- Incorpora keywords técnicas relevantes ya mencionadas.

FORMATO DE RESPUESTA:
- Devuelve ÚNICAMENTE el bullet point mejorado (máximo 250 caracteres).
- Sin explicaciones ni markdown. Español profesional y directo.`;

serve(async (req) => {
  const cors = corsHeaders(req.headers.get('Origin'), getAllowedOrigins(env));
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    const ctx = await getAuthedUser(req, env);
    await enforceQuota(ctx, 'ai_improvements');

    const { bulletPoint, context } = await req.json();
    if (!bulletPoint || typeof bulletPoint !== 'string') {
      return jsonResponse({ error: 'bulletPoint es requerido' }, 400, cors);
    }

    const userPrompt = `Transforma este bullet point aplicando los más altos estándares ATS y principios éticos:

BULLET POINT ORIGINAL:
"${bulletPoint}"

${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

Devuelve únicamente el bullet point mejorado, sin explicaciones adicionales.`;

    const config = resolveAIConfig(env);
    const improvedBulletPoint = await createChatCompletion(config, {
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 250,
      mock: `[Demo] Lideré ${bulletPoint.slice(0, 120)} con impacto medible en eficiencia.`,
    });

    await recordUsage(ctx, 'ai_improvements');
    return jsonResponse({ improvedBulletPoint }, 200, cors);
  } catch (error) {
    if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status, cors);
    if (error instanceof AIError) return jsonResponse({ error: error.message }, error.status, cors);
    console.error('Error in improve-bullet-point:', error instanceof Error ? error.message : error);
    return jsonResponse({ error: 'No se pudo mejorar el bullet point' }, 500, cors);
  }
});
