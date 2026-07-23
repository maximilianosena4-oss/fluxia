# FluxIA — Plataforma de estrategia de contenido para YouTube con IA

Dashboard para creadores de contenido que centraliza análisis de canal,
detección de tendencias y generación de ideas/guiones con IA, para decidir qué
contenido producir con datos en vez de intuición.

## Qué problema resuelve

Un creador de YouTube necesita cruzar varias fuentes (su propio canal, canales
competidores, tendencias del momento) para decidir qué video hacer, y después
producirlo (guion, título, miniatura) de forma consistente. Normalmente eso
implica saltar entre varias herramientas sueltas. FluxIA junta ese flujo en un
solo dashboard con generación asistida por IA en cada paso.

## Qué hace

Módulos confirmados en el dashboard (`src/app/dashboard/*`):

- **Analyzer:** análisis de canal propio vía YouTube Data API.
- **Trends:** detección de tendencias/outliers.
- **Ideas / Titles / Scripts:** generación de ideas de contenido, títulos (con
  score de CTR estimado) y guiones usando Claude (Anthropic).
- **Pipeline:** orquestación del proceso de producción de contenido
  (`ContentPipeline.tsx`, `api/pipeline/generate`).
- **Thumbnails:** librería de miniaturas.
- **Comparator / Evaluator / Scorer / Monetization / Roadmap / Calendar:**
  módulos de comparación de canales, evaluación de contenido, scoring,
  estimación de monetización y planificación.
- **Búsqueda web:** integración con Tavily para research (`lib/search/tavily.ts`).

## Stack

- **Frontend/Backend:** Next.js 16 (App Router) + React 19 + TypeScript +
  Tailwind CSS 4.
- **IA:** Anthropic SDK (Claude) y OpenAI SDK.
- **Base de datos:** PostgreSQL con extensión `pgvector`, vía Prisma ORM.
- **Auth:** NextAuth v5 con Google OAuth.
- **Cache / rate limiting:** Upstash Redis (`@upstash/redis`, `@upstash/ratelimit`).
- **Deploy:** Vercel (frontend/backend Next.js) + Supabase (Postgres).

## Arquitectura (real, verificada en el código)

```
youtube-strategy-app/
  src/
    app/
      api/
        ai/{chat,ideas,script}/      # generación con Claude
        pipeline/generate/            # orquestación de producción de contenido
        search/web/                   # research vía Tavily
        youtube/{channel,outlier,search}/  # YouTube Data API
        auth/[...nextauth]/           # NextAuth
      dashboard/{analytics,analyzer,calendar,comparator,consultant,
                 evaluator,ideas,monetization,pipeline,roadmap,scorer,
                 scripts,settings,thumbnails,titles,tools,trends}/
    lib/
      ai/{anthropic,embeddings,rag}.ts  # clientes de IA y lógica de RAG
      db/redis.ts                       # cliente Upstash (con mock en dev)
      search/tavily.ts                  # research web
      youtube/client.ts                 # cliente YouTube Data API
    auth.ts / auth.config.ts            # configuración NextAuth (Google OAuth)
  prisma/schema.prisma                  # modelos: User/Account/Session (NextAuth),
                                         # Channel, ContentPipeline, AuditLog, pgvector
```

## Cómo correrlo

```bash
cd youtube-strategy-app
npm install
# Variables necesarias: DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL,
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ANTHROPIC_API_KEY, OPENAI_API_KEY,
# YouTube Data API key, credenciales de Upstash Redis.
npx prisma generate
npm run dev
```

Guía de deploy en Vercel en [`youtube-strategy-app/DEPLOY.md`](./youtube-strategy-app/DEPLOY.md).

## Estado del proyecto

Aplicación funcional con autenticación real (Google OAuth vía NextAuth) y
persistencia en Postgres vía Prisma. El proyecto de Supabase asociado está en
plan gratuito y actualmente pausado, por lo que no hay una demo pública activa
en este momento — el deploy en Vercel existe como target de despliegue, no
como demo en vivo garantizada.
