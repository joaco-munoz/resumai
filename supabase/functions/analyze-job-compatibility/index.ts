import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { resolveAIConfig, createChatCompletion, AIError } from '../_shared/ai.ts';
import { getAllowedOrigins, corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { getAuthedUser, enforceQuota, recordUsage, HttpError } from '../_shared/auth.ts';

const env = Deno.env.toObject();

interface MatchResult {
  score: number;
  missingKeywords: string[];
  suggestedBullets: string[];
  strengths: string[];
  improvements: string[];
}

const SYSTEM_PROMPT = `Eres un consultor experto en recursos humanos con certificación ATS y más de 15 años de experiencia. Analiza la compatibilidad entre un CV y una oferta laboral con objetividad, ética y criterios verificables.

REGLAS:
- Analiza únicamente la información entregada en el CV; no infieras datos ausentes.
- Evita sesgos de género, edad, nacionalidad u otros factores personales.

ESTRUCTURA DE RESPUESTA (JSON válido, sin markdown ni texto extra):
{
  "score": <número 0-100>,
  "strengths": ["máximo 5 fortalezas específicas basadas en el CV"],
  "missingKeywords": ["máximo 8 términos relevantes ausentes en el CV"],
  "suggestedBullets": ["máximo 4 bullets concretos para mejorar el CV"],
  "improvements": ["máximo 5 recomendaciones para aumentar compatibilidad"]
}

Responde ÚNICAMENTE con el objeto JSON válido.`;

// deno-lint-ignore no-explicit-any
function buildCvText(cvData: any): string {
  return `
INFORMACIÓN PERSONAL:
Nombre: ${cvData?.personalInfo?.fullName || 'No especificado'}
Ubicación: ${cvData?.personalInfo?.location || 'No especificado'}

RESUMEN PROFESIONAL:
${cvData?.summary || 'No especificado'}

EXPERIENCIA LABORAL:
${
    cvData?.experience
      // deno-lint-ignore no-explicit-any
      ?.map((exp: any) => `- ${exp.position} en ${exp.company} (${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}): ${exp.description}`)
      .join('\n') || 'No especificada'
  }

EDUCACIÓN:
${
    cvData?.education
      // deno-lint-ignore no-explicit-any
      ?.map((edu: any) => `- ${edu.degree}, ${edu.institution} (${edu.year})`)
      .join('\n') || 'No especificada'
  }

HABILIDADES:
${cvData?.skills?.join(', ') || 'No especificadas'}
  `.trim();
}

const MOCK_RESULT: MatchResult = {
  score: 74,
  strengths: [
    'Experiencia relevante alineada con el rol',
    'Habilidades técnicas coincidentes con la oferta',
  ],
  missingKeywords: ['liderazgo de equipos', 'metodologías ágiles'],
  suggestedBullets: [
    'Cuantifica el impacto de tus logros con métricas concretas',
    'Añade las herramientas mencionadas en la oferta que domines',
  ],
  improvements: [
    'Alinea el resumen profesional con las palabras clave de la oferta',
    'Destaca resultados medibles en tu experiencia más reciente',
  ],
};

serve(async (req) => {
  const cors = corsHeaders(req.headers.get('Origin'), getAllowedOrigins(env));
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    // Authenticate and bind queries to the caller's JWT (RLS enforced).
    // The user is NEVER taken from the request body — this closes the IDOR where
    // any authenticated caller could read another user's CV via a supplied userId.
    const ctx = await getAuthedUser(req, env);
    await enforceQuota(ctx, 'job_matcher_advanced');

    const { jobDescription, cvId } = await req.json();
    if (!jobDescription || typeof jobDescription !== 'string') {
      return jsonResponse({ error: 'jobDescription es requerido' }, 400, cors);
    }

    // Read a CV that belongs to the caller. RLS guarantees ownership; we never
    // trust a client-supplied user id.
    let query = ctx.supabase.from('cvs').select('content').order('last_updated', { ascending: false }).limit(1);
    query = cvId ? query.eq('id', cvId) : query.eq('cv_source', 'editor');
    const { data: cv, error: cvError } = await query.maybeSingle();

    if (cvError) return jsonResponse({ error: 'Error al obtener el CV' }, 500, cors);
    if (!cv?.content) return jsonResponse({ error: 'No se encontró un CV para analizar' }, 404, cors);

    const config = resolveAIConfig(env);
    const raw = await createChatCompletion(config, {
      system: SYSTEM_PROMPT,
      user: `OFERTA LABORAL:\n${jobDescription}\n\nCV DEL CANDIDATO:\n${buildCvText(cv.content)}\n\nDevuelve el análisis en JSON válido.`,
      temperature: 0.2,
      maxTokens: 2000,
      json: true,
      mock: JSON.stringify(MOCK_RESULT),
    });

    const result = parseMatchResult(raw);
    await recordUsage(ctx, 'job_matcher_advanced');
    return jsonResponse(result, 200, cors);
  } catch (error) {
    if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status, cors);
    if (error instanceof AIError) return jsonResponse({ error: error.message }, error.status, cors);
    console.error('Error in analyze-job-compatibility:', error instanceof Error ? error.message : error);
    return jsonResponse({ error: 'Error interno del servidor' }, 500, cors);
  }
});

function parseMatchResult(raw: string): MatchResult {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }
  const parsed = JSON.parse(cleaned) as MatchResult;
  if (
    typeof parsed.score !== 'number' ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.missingKeywords) ||
    !Array.isArray(parsed.suggestedBullets) ||
    !Array.isArray(parsed.improvements)
  ) {
    throw new AIError('AI returned an invalid analysis structure', 502, false);
  }
  parsed.score = Math.max(0, Math.min(100, parsed.score));
  return parsed;
}
