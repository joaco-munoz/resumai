
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeJobRequest {
  jobDescription: string;
  userId: string;
}

interface MatchResult {
  score: number;
  missingKeywords: string[];
  suggestedBullets: string[];
  strengths: string[];
  improvements: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, userId }: AnalyzeJobRequest = await req.json();

    console.log('Analyzing job compatibility for user:', userId);

    // Get the user's general CV
    const { data: generalCV, error: cvError } = await supabase
      .from('cvs')
      .select('content')
      .eq('user_id', userId)
      .eq('cv_source', 'editor')
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cvError) {
      console.error('Error fetching general CV:', cvError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener el CV general' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!generalCV?.content) {
      return new Response(
        JSON.stringify({ error: 'No se encontró un CV general para analizar' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cvData = generalCV.content as any;

    // Prepare CV text for analysis
    const cvText = `
INFORMACIÓN PERSONAL:
Nombre: ${cvData.personalInfo?.fullName || 'No especificado'}
Email: ${cvData.personalInfo?.email || 'No especificado'}
Teléfono: ${cvData.personalInfo?.phone || 'No especificado'}
Ubicación: ${cvData.personalInfo?.location || 'No especificado'}
LinkedIn: ${cvData.personalInfo?.linkedin || 'No especificado'}
Website: ${cvData.personalInfo?.website || 'No especificado'}

RESUMEN PROFESIONAL:
${cvData.summary || 'No especificado'}

EXPERIENCIA LABORAL:
${cvData.experience?.map((exp: any) => `
- Puesto: ${exp.position}
- Empresa: ${exp.company}
- Período: ${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}
- Descripción: ${exp.description}
`).join('\n') || 'No especificada'}

EDUCACIÓN:
${cvData.education?.map((edu: any) => `
- Título: ${edu.degree}
- Institución: ${edu.institution}
- Año: ${edu.year}
- Descripción: ${edu.description || ''}
`).join('\n') || 'No especificada'}

HABILIDADES:
${cvData.skills?.join(', ') || 'No especificadas'}
    `.trim();

    console.log('Calling OpenAI API for job compatibility analysis...');

    // Call OpenAI API with improved prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres un experimentado consultor en recursos humanos con certificación ATS (Applicant Tracking System) y más de 15 años de experiencia en reclutamiento estratégico. Tu función es realizar análisis de compatibilidad CV-trabajo de manera ética, precisa y profesional.

PRINCIPIOS ÉTICOS Y ESTÁNDARES ATS:
- Analiza únicamente información factual presente en el CV
- No hagas suposiciones sobre información no proporcionada
- Mantén objetividad sin sesgos de género, edad, origen o características personales
- Enfócate en competencias técnicas y experiencia relevante verificable
- Respeta la privacidad y dignidad profesional del candidato
- Proporciona feedback constructivo y accionable
- Utiliza criterios de evaluación transparentes y justos

METODOLOGÍA DE ANÁLISIS:
1. COMPATIBILIDAD TÉCNICA: Evalúa habilidades técnicas, herramientas y tecnologías
2. EXPERIENCIA RELEVANTE: Analiza roles similares, responsabilidades y logros cuantificables
3. NIVEL DE SENIORIDAD: Compara años de experiencia y nivel de responsabilidad
4. INDUSTRIA/SECTOR: Evalúa experiencia en sectores relacionados
5. EDUCACIÓN Y CERTIFICACIONES: Revisa formación académica y certificaciones relevantes

ESTRUCTURA DE RESPUESTA (JSON válido):
{
  "score": [número_0_a_100],
  "strengths": ["máximo_5_fortalezas_específicas_y_medibles"],
  "missingKeywords": ["máximo_8_términos_técnicos_específicos"],
  "suggestedBullets": ["máximo_4_bullets_específicos_y_relevantes"],
  "improvements": ["máximo_5_mejoras_concretas_y_accionables"]
}

CRITERIOS DE PUNTUACIÓN:
- 90-100: Candidato altamente calificado con experiencia excepcional
- 80-89: Candidato muy calificado con experiencia sólida
- 70-79: Candidato calificado con experiencia adecuada
- 60-69: Candidato parcialmente calificado, requiere desarrollo
- 50-59: Candidato con potencial pero necesita capacitación significativa
- 0-49: Candidato no calificado para la posición actual

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON válido, sin markdown ni explicaciones adicionales.`
          },
          {
            role: 'user',
            content: `Analiza la compatibilidad entre este CV y la oferta laboral aplicando los más altos estándares ATS y principios éticos:

OFERTA LABORAL:
${jobDescription}

CV DEL CANDIDATO:
${cvText}

Proporciona el análisis en formato JSON válido siguiendo la estructura especificada.`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: 'Error al procesar el análisis con IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Raw AI Response:', aiResponse);

    try {
      // Clean and parse JSON response
      let cleanedResponse = aiResponse.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Parse the JSON response
      const matchResult: MatchResult = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (typeof matchResult.score !== 'number' ||
          !Array.isArray(matchResult.strengths) ||
          !Array.isArray(matchResult.missingKeywords) ||
          !Array.isArray(matchResult.suggestedBullets) ||
          !Array.isArray(matchResult.improvements)) {
        throw new Error('Invalid response structure from AI');
      }

      // Ensure score is within valid range
      if (matchResult.score < 0 || matchResult.score > 100) {
        matchResult.score = Math.max(0, Math.min(100, matchResult.score));
      }

      console.log('Job compatibility analysis completed successfully with score:', matchResult.score);

      return new Response(JSON.stringify(matchResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, 'Raw response:', aiResponse);
      
      // Fallback response if JSON parsing fails
      const fallbackResult: MatchResult = {
        score: 50,
        strengths: ['Experiencia profesional identificada en el CV'],
        missingKeywords: ['Análisis detallado temporalmente no disponible'],
        suggestedBullets: ['• Revisar y actualizar experiencia laboral según los requisitos de la oferta', '• Añadir habilidades técnicas mencionadas en la descripción del puesto'],
        improvements: ['Intentar nuevamente el análisis para obtener resultados más precisos']
      };

      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in analyze-job-compatibility function:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
