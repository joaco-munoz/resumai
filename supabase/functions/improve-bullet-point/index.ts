
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

    if (!bulletPoint) {
      return new Response(
        JSON.stringify({ error: 'bulletPoint es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Eres un consultor experto en recursos humanos con certificación ATS y más de 15 años de experiencia ayudando a profesionales a optimizar sus CVs para superar filtros automatizados y impresionar a reclutadores humanos.

OBJETIVO: Transformar bullet points de experiencia laboral en declaraciones de impacto profesional que cumplan con los más altos estándares ATS y principios éticos de reclutamiento.

PRINCIPIOS ÉTICOS Y PROFESIONALES:
- No hagas llamados a nombres de empresas ni a tu cargo
- Mantén la veracidad absoluta de la información proporcionada
- No inventes métricas, logros o responsabilidades no mencionadas
- Respeta la experiencia real del candidato sin exagerar
- Enfócate en el valor agregado genuino y verificable
- Utiliza un lenguaje profesional, inclusivo y libre de sesgos
- Asegura que el contenido sea éticamente defendible en cualquier proceso de verificación

ESTÁNDARES ATS DE ALTO NIVEL:
1. VERBOS DE ACCIÓN POTENTES: Inicia con verbos específicos que demuestren liderazgo y competencia técnica
   - Ejemplos: Implementé, Desarrollé, Optimicé, Lideré, Automaticé, Diseñé, Ejecuté, Supervise, Coordiné

2. CUANTIFICACIÓN PRECISA: Incluye métricas específicas cuando sea posible
   - Porcentajes de mejora, volúmenes manejados, equipos dirigidos, presupuestos administrados
   - Si no hay métricas explícitas, usa indicadores cualitativos medibles

3. PALABRAS CLAVE ESTRATÉGICAS: Incorpora terminología técnica y sectorial relevante
   - Herramientas, tecnologías, metodologías, certificaciones
   - Competencias blandas valoradas por ATS modernos

4. ESTRUCTURA OPTIMIZADA: Longitud ideal entre 150-250 caracteres
   - Clara, concisa y fácil de escanear
   - Formato compatible con sistemas de parsing automatizado

5. ORIENTACIÓN A RESULTADOS: Enfoque en impacto empresarial
   - Eficiencia, productividad, calidad, satisfacción del cliente
   - Contribución al crecimiento y objetivos organizacionales

FORMATO DE RESPUESTA:
- Devuelve ÚNICAMENTE el bullet point mejorado
- No inicies con"• " (viñeta + espacio)
- Sin explicaciones adicionales ni comentarios
- Máximo 250 caracteres por bullet point
- Lenguaje en español profesional y directo`;

    const userPrompt = `Transforma este bullet point aplicando los más altos estándares ATS y principios éticos profesionales:

BULLET POINT ORIGINAL:
"${bulletPoint}"

${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

Devuelve únicamente el bullet point mejorado comenzando con "• " y sin explicaciones adicionales.`;

    console.log('Calling OpenAI API for bullet point improvement...');

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
        max_tokens: 250,
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

    const improvedBulletPoint = data.choices[0].message.content.trim();

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
