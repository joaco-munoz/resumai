
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

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un experimentado reclutador de RRHH y experto en sistemas ATS (Applicant Tracking System). Tu trabajo es analizar la compatibilidad entre un CV y una descripción de trabajo específica.

Debes proporcionar un análisis detallado y profesional que incluya:

1. SCORE DE COMPATIBILIDAD (0-100): Un puntaje numérico basado en qué tan bien coincide el CV con los requisitos del trabajo.

2. FORTALEZAS: Aspectos del CV que coinciden perfectamente con la oferta laboral.

3. KEYWORDS FALTANTES: Términos clave mencionados en la descripción del trabajo que no aparecen en el CV.

4. BULLETS SUGERIDOS: 3-4 bullet points optimizados que el candidato podría agregar a su CV para mejorar la compatibilidad con esta posición específica.

5. ÁREAS DE MEJORA: Sugerencias específicas sobre qué aspectos del CV podrían fortalecerse para esta posición.

Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:
{
  "score": número_entre_0_y_100,
  "strengths": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestedBullets": ["• Bullet point 1", "• Bullet point 2", "• Bullet point 3"],
  "improvements": ["mejora1", "mejora2", "mejora3"]
}

Sé específico, profesional y enfócate en hacer que el análisis sea accionable para el candidato.`
          },
          {
            role: 'user',
            content: `Analiza la compatibilidad entre este CV y la descripción del trabajo:

DESCRIPCIÓN DEL TRABAJO:
${jobDescription}

CV DEL CANDIDATO:
${cvText}

Proporciona el análisis en formato JSON.`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Error al procesar el análisis con IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    try {
      const matchResult: MatchResult = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (typeof matchResult.score !== 'number' ||
          !Array.isArray(matchResult.strengths) ||
          !Array.isArray(matchResult.missingKeywords) ||
          !Array.isArray(matchResult.suggestedBullets) ||
          !Array.isArray(matchResult.improvements)) {
        throw new Error('Invalid response structure from AI');
      }

      console.log('Job compatibility analysis completed successfully');

      return new Response(JSON.stringify(matchResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, 'Raw response:', aiResponse);
      
      // Fallback response if JSON parsing fails
      const fallbackResult: MatchResult = {
        score: 50,
        strengths: ['Experiencia relevante identificada'],
        missingKeywords: ['Análisis detallado no disponible'],
        suggestedBullets: ['• Revisar y actualizar experiencia laboral', '• Añadir habilidades técnicas relevantes'],
        improvements: ['Intentar nuevamente el análisis']
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
