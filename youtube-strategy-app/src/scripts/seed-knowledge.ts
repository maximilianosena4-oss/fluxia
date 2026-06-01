// Script de seed para la base de conocimiento RAG
// Indexa los principios de los 5 mentores del brief
// Ejecutar: npx tsx src/scripts/seed-knowledge.ts

import { PrismaClient } from "@prisma/client";
import { generateEmbedding } from "../lib/ai/embeddings";

const prisma = new PrismaClient();

const KNOWLEDGE_CHUNKS = [
  // ─── ELOISA WOLF ─────────────────────────────────────────
  {
    author: "eloisa_wolf",
    sourceType: "methodology",
    chunkText: "YouTube no es una red social, es una televisión. Requiere estrategia editorial, no viralidad de impulso. Los videos de más de 8 minutos pueden incluir mid-roll ads, lo que aumenta el RPM significativamente.",
  },
  {
    author: "eloisa_wolf",
    sourceType: "methodology",
    chunkText: "RPM por nicho: Finanzas, Tecnología y Salud tienen RPM de $4-15 USD. Entretenimiento y música tienen RPM de $0.5-2 USD. El CPM puede variar hasta 10x entre nichos — elegir nicho es elegir tu techo de ingresos.",
  },
  {
    author: "eloisa_wolf",
    sourceType: "methodology",
    chunkText: "Regla 7-11-4: Un comprador necesita 7 horas de contenido, 11 puntos de contacto y 4 plataformas antes de comprar. El dubbing multiidioma puede multiplicar ingresos 3-5x sin crear contenido nuevo.",
  },
  {
    author: "eloisa_wolf",
    sourceType: "methodology",
    chunkText: "Las 5 fuentes de ingresos de YouTube: AdSense, Patrocinios, Productos digitales, Marketing de afiliados y Membresías. Diversificar desde el inicio protege contra cambios del algoritmo.",
  },

  // ─── ADRIÁN SÁENZ ────────────────────────────────────────
  {
    author: "adrian_saenz",
    sourceType: "methodology",
    chunkText: "El proceso completo de 5 pasos: Nicho → Tipo de contenido → Packaging → Producción con IA → Monetización. La viralidad funciona como embudo: Atención → Nutrición → Venta. Sin los tres no hay negocio.",
  },
  {
    author: "adrian_saenz",
    sourceType: "methodology",
    chunkText: "Las mejores ideas de nicho vienen de FUERA del nicho, no de adentro. Solo hay 2 métricas que importan al inicio: CTR mayor al 4% y Retención mayor al 50%. Todo lo demás es ruido.",
  },
  {
    author: "adrian_saenz",
    sourceType: "methodology",
    chunkText: "Estructura del guión viral: Gancho (primeros 30 segundos) / Problema / Solución / CTA. Usar Claude AI y YouTube API para validar nichos antes de producir cualquier contenido.",
  },
  {
    author: "adrian_saenz",
    sourceType: "methodology",
    chunkText: "Tabla de scoring de nicho: Demanda de mercado (24 puntos), Competencia baja (24 puntos), RPM/Monetización (16 puntos), Barreras de entrada (12 puntos), Escalabilidad (12 puntos), Producción IA viable (8 puntos). Total máximo: 96 puntos. Mayor a 70: adelante. 50-69: refinar. Menor a 50: descartar.",
  },

  // ─── ERIC ALANIS ─────────────────────────────────────────
  {
    author: "eric_alanis",
    sourceType: "methodology",
    chunkText: "Los canales sin rostro son monetizables y escalables. Casos documentados: Aleix 4.000 EUR/mes, Nicole 7.000 EUR/mes, Samuel monetizado en 1 mes. La monetización acelerada en 5-13 días es posible con el nicho correcto.",
  },
  {
    author: "eric_alanis",
    sourceType: "methodology",
    chunkText: "8 nichos aprobados para canales sin cara: Espiritualidad y motivación, Finanzas personales, Historia y ciencia, Tecnología, Salud y bienestar, ASMR y meditación, Cripto e inversión, Aprendizaje de idiomas. Todos tienen RPM mayor a $4 USD.",
  },
  {
    author: "eric_alanis",
    sourceType: "methodology",
    chunkText: "ADVERTENCIA CRÍTICA 2025-2026: YouTube PENALIZA y DESMONETIZA canales de IA sin valor humano real. Es obligatorio tener: voz propia, narración personal, edición original o ángulo editorial único. Siempre validar en viralyt.ai antes de producir.",
  },
  {
    author: "eric_alanis",
    sourceType: "methodology",
    chunkText: "Criterios de aprobación de nicho (mínimo 5 de 8): RPM mayor a $4 USD en audiencia hispanohablante, ratio vistas/suscriptores mayor a 50:1, outliers recientes (videos con 10x el promedio), menos de 10 competidores directos en español con más de 100K subs, producible sin cara, demanda evergreen activa, fuente de monetización además de AdSense, nicho alineado con oferta de backend.",
  },

  // ─── ALEX HORMOZI ────────────────────────────────────────
  {
    author: "alex_hormozi",
    sourceType: "methodology",
    chunkText: "Principio fundamental: diseñar la OFERTA antes del canal. El contenido son anuncios gratuitos de tu producto o servicio. Construir audiencia sin oferta es trabajo sin retorno económico.",
  },
  {
    author: "alex_hormozi",
    sourceType: "methodology",
    chunkText: "Value Equation de Hormozi: (Resultado soñado × Probabilidad percibida) / (Tiempo hasta el resultado × Esfuerzo y sacrificio). Las 3 palancas de crecimiento: Volumen (más contenido), Calidad (mejor packaging), Distribución (más plataformas).",
  },
  {
    author: "alex_hormozi",
    sourceType: "methodology",
    chunkText: "Jerarquía de valor: Sueños y deseos del cliente > Problemas que bloquean esos sueños > Soluciones que provees. Cada video debe atraer clientes potenciales de la oferta backend, no solo vistas.",
  },

  // ─── MRBEAST ─────────────────────────────────────────────
  {
    author: "mrbeast",
    sourceType: "methodology",
    chunkText: "El Outlier Test es el único filtro de nicho que importa: busca videos con 10 veces el promedio del canal. Si existen, el nicho funciona y el algoritmo amplifica ese tipo de contenido.",
  },
  {
    author: "mrbeast",
    sourceType: "methodology",
    chunkText: "El thumbnail es el 80% del éxito del video. Es más importante que el video en sí. Los primeros 30 segundos determinan si el video vive o muere — si no enganchás ahí, el video está muerto.",
  },
  {
    author: "mrbeast",
    sourceType: "methodology",
    chunkText: "Principios de packaging: Curiosity gaps — la promesa del título NUNCA se revela antes del minuto 3. Cada 2-3 minutos debe haber un nuevo gancho. A/B test de thumbnails: publicar, esperar 48 horas, cambiar si CTR menor al 3%.",
  },
  {
    author: "mrbeast",
    sourceType: "methodology",
    chunkText: "Consistencia supera al talento. Publicar consistentemente supera al talento esporádico. El modelo multi-canal: mismo sistema, distintos nichos, ingresos acumulados en paralelo. Nunca imites a competidores directos — imita a los mejores del mundo en otros nichos.",
  },
];

async function seedKnowledge() {
  console.log("🌱 Iniciando seed de base de conocimiento...");
  console.log(`   Total de chunks: ${KNOWLEDGE_CHUNKS.length}`);

  let seeded = 0;
  let skipped = 0;

  for (const chunk of KNOWLEDGE_CHUNKS) {
    const existing = await prisma.knowledgeEmbedding.findFirst({
      where: { chunkText: chunk.chunkText },
    });

    if (existing) {
      skipped++;
      continue;
    }

    let embedding: number[] | null = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        embedding = await generateEmbedding(chunk.chunkText);
      } catch (e) {
        console.warn(`   ⚠ No se pudo generar embedding para chunk de ${chunk.author}`);
      }
    }

    await prisma.knowledgeEmbedding.create({
      data: {
        sourceType: chunk.sourceType,
        sourceId: null,
        author: chunk.author,
        chunkText: chunk.chunkText,
        metadata: {},
      },
    });

    seeded++;
    console.log(`   ✅ ${chunk.author}: chunk ${seeded} insertado`);
  }

  console.log(`\n✨ Seed completado:`);
  console.log(`   Insertados: ${seeded}`);
  console.log(`   Ya existían: ${skipped}`);

  await prisma.$disconnect();
}

seedKnowledge().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
