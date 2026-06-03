# CLAUDE_CODE_BRIEF.md
# YouTube Strategy Consultant — Brief Completo para Claude Code
# Versión: 6.0 | Fecha: Mayo 2026 | Autor: Proyecto YT Maximiliano A. Sena

> **INSTRUCCIÓN DE LECTURA PARA CLAUDE CODE**
> Este archivo es tu documento rector absoluto. Léelo COMPLETO antes de escribir
> una sola línea de código. Ante cualquier duda, ve a la SECCIÓN 10 — DUDAS &
> CONSULTAS. No asumas — pregunta.

---

## ÍNDICE

1. Identidad del Agente
2. Objetivo del Proyecto
3. Base de Conocimiento — Los 5 Mentores
4. Arquitectura Técnica
5. Diseño UI/UX — Momentum UI
6. Páginas y Flujos de la App
7. Seguridad — Nivel Enterprise
8. Estructura de Archivos
9. Rol QA / Testing Obligatorio
10. Dudas & Consultas — Canal Interactivo
11. Reglas Inviolables

---

## 1. IDENTIDAD DEL AGENTE

**Nombre del agente:** NEXUS
**Rol:** Arquitecto Full Stack Senior + Experto en Ciberseguridad
**Experiencia simulada:** 12+ años en SaaS de alto tráfico, EdTech y CreatorTech

**Especializaciones obligatorias:**
- Clean Architecture / Hexagonal para apps de IA
- Integración YouTube Data API v3, Anthropic Claude API, OpenAI
- Sistemas RAG (Retrieval-Augmented Generation) con pgvector
- Ciberseguridad ofensiva/defensiva — OWASP Top 10 compliance
- Diseño UX motivacional — psicología del flujo (Flow State)
- DevOps: CI/CD, Docker, Vercel, Railway, Sentry, Posthog

**Filosofía de trabajo:**
- "Primero diseña la oferta, después el canal" — Alex Hormozi
- "El nicho correcto es el 80% del éxito" — Adrián Sáenz
- "El packaging (thumbnail) es el 80% del éxito del video" — MrBeast
- Primero que funcione y sea seguro, después que escale
- Cada módulo que escribas debe pasar tus propios tests antes de entregarlo

---

## 2. OBJETIVO DEL PROYECTO

### ¿Qué construir?
Una aplicación web full stack de consultoría inteligente que guíe a
emprendedores desde cero hasta monetizar en YouTube, usando IA con RAG.

### ¿Para quién?
Persona que empieza desde cero con el objetivo de monetizar YouTube lo más
rápido posible. Puede querer crear un canal o varios canales en distintos nichos.
No tiene experiencia técnica. Necesita guía paso a paso, motivación constante
y herramientas concretas.

### ¿Qué resuelve?
Responde la pregunta: "¿Cuál es el mejor nicho para mí ahora mismo, cómo
arranco, qué publico primero y cómo monetizo lo antes posible?"

### Restricciones del usuario final:
- Presupuesto máximo inicial: $500 USD
- Puede producir contenido sin mostrar su cara (canal sin rostro con IA)
- Idioma principal: Español (con potencial de expansión a inglés/portugués)
- Objetivo: monetización en plazos de 30-90 días según el caso

### KPIs de éxito de la app:
- El usuario completa la evaluación de nicho en menos de 10 minutos
- El consultor IA responde en menos de 5 segundos (con streaming visible)
- El usuario nunca se siente perdido — siempre hay una "próxima acción" visible
- Interfaz motivacional, no burocrática

---

## 3. BASE DE CONOCIMIENTO — LOS 5 MENTORES

> Esta es la base del motor RAG. Los embeddings de este conocimiento alimentan
> las respuestas del consultor IA. Cuando construyas el RAG, estos datos deben
> estar indexados como fuente primaria.

---

### 3.1 — ELOISA WOLF
**Canal:** @EloisaWolf | 26.3K subs | 25 videos
**Especialidad:** Monetización YouTube en español, RPM por nicho

| Principio | Descripción |
|-----------|-------------|
| YouTube = Televisión | No es red social. Requiere estrategia editorial, no viralidad de impulso |
| Regla de los 8 minutos | Videos de +8 min pueden incluir mid-roll ads — aumenta RPM significativamente |
| RPM por nicho | Finanzas/Tech/Salud: RPM $4-15 USD. Entretenimiento/música: $0.5-2 USD |
| CPM comparativo | El CPM varía hasta 10x entre nichos. Elegir nicho = elegir techo de ingresos |
| Regla 7-11-4 | Un comprador necesita 7h contenido + 11 puntos de contacto + 4 plataformas antes de comprar |
| Dubbing multiidioma | Traducir al inglés puede multiplicar ingresos 3-5x sin nuevo contenido |
| Miniaturas 4K | Diferenciador visual vs competencia |
| 5 fuentes de ingresos | AdSense / Patrocinios / Productos digitales / Afiliados / Membresías |

---

### 3.2 — ADRIÁN SÁENZ
**Canal:** @AdrianSaenz | 3.93M subs | 1K+ videos
**Especialidad:** Proceso completo Nicho → Packaging → Producción IA → Monetización

| Principio | Descripción |
|-----------|-------------|
| Proceso de 5 pasos | Nicho → Tipo de contenido → Packaging → Producción con IA → Monetización |
| Viralidad = Embudo | Atención → Nutrición → Venta. Sin los tres no hay negocio |
| Ideas desde afuera | Las mejores ideas de nicho vienen de FUERA del nicho, no de adentro |
| Métricas de éxito | CTR >4% y Retención >50% son los únicos dos números que importan al inicio |
| Guión viral | Estructura: Gancho (0-30s) / Problema / Solución / CTA |
| Validación con IA | Usar Claude + YouTube API para validar nichos antes de producir |

**FORMULARIO DE EVALUACIÓN DE NICHO** (Typeform — observado en video min 44-48):

SECCIÓN 01 — Identificación del nicho:
- Nombre del nicho (campo texto)
- Sub-nicho específico (campo texto — más específico = menos competencia)
- Idioma principal (selector)
- Nivel del canal: Sub-nicho (dropdown)
- Fecha de validación (date picker)
- "¿Por qué crees que este nicho funcionará?" (textarea)

SECCIÓN 02 — Nichos a evitar (checkboxes):
- [ ] Seducción / Contenido sexual — Penalización Yellow/No monetizable
- [ ] Recopilaciones sin narrativa propia — Copyright + baja retención
- [ ] Contenido sin evergreen — Sin tráfico sostenido
- [ ] Canales de música / dance / lip sync — RPM bajísimo
- [ ] Contenido gore / muertes / sangre — Restricción total de anuncios
- [ ] Riesgo alto detección de contenido de autor — Reclamaciones copyright

SECCIÓN 03 — Demanda de mercado (IA busca en YouTube API en tiempo real):
- [ ] ¿Hay búsquedas activas en YouTube sobre este tema?
- [ ] ¿Existen videos virales recientes con 1-2M+ vistas?
- [ ] ¿El mercado objetivo tiene volumen suficiente en español?
- [ ] ¿Los videos recientes siguen creciendo (no en caída)?
- [ ] ¿Existen múltiples casos de éxito documentados?
- [ ] ¿Proyección positiva del tema a 1-2 años vista?

SECCIÓN 04 — Análisis de competencia (IA busca en YouTube API):
- Campo: Número de canales activos (auto-llenado por IA)
- Dropdown: Nivel de competencia (Bajo / Medio / Alto / Saturado)
- [ ] ¿Los canales dominantes tienen menos de 100K subs?
- [ ] ¿Hay alguien que domine el nicho sin competencia real?
- [ ] ¿Funciona también en inglés/otros idiomas? (= mercado probado)
- [ ] ¿Puedes aplicar un ángulo diferente al existente?
- [ ] ¿Es posible posicionarse desde 0 en 90 días?
- Textarea: "Tu ventaja competitiva específica" (IA sugiere opciones)

SECCIÓN 05 — Tabla de puntuación final (calculada automáticamente):

| Criterio               | Puntos Máx | Multiplicador | Total Máx |
|------------------------|-----------|---------------|-----------|
| Demanda de mercado     | 12        | x2            | 24        |
| Competencia media-baja | 12        | x2            | 24        |
| RPM / Monetización     | 8         | x2            | 16        |
| Barreras de entrada    | 8         | x1.5          | 12        |
| Escalabilidad          | 8         | x1.5          | 12        |
| Producción IA viable   | 8         | x1            | 8         |
| PUNTUACIÓN TOTAL       |           |               | 96        |

Escala de resultado:
- >= 70 puntos → ADELANTE — Este nicho tiene todo para funcionar
- 50-69 puntos → Tiene potencial — Refina estos puntos primero
- < 50 puntos  → Descartar — Busca otra oportunidad

---

### 3.3 — ERIC ALANIS
**Canal:** @ericalanisyt | 40.7K subs | 55 videos
**Especialidad:** Canal sin rostro + IA + Monetización acelerada

| Principio | Descripción |
|-----------|-------------|
| Canal sin rostro viable | Monetizable y escalable — no requiere mostrar cara |
| Velocidad de monetización | Casos documentados: monetización en 5-13 días |
| 8 nichos sin cara aprobados | Espiritualidad/motivación, Finanzas personales, Historia/ciencia, Tecnología, Salud/bienestar, ASMR/meditación, Cripto/inversión, Idiomas |
| Validación OBLIGATORIA | Siempre validar en viralyt.ai antes de producir cualquier contenido |
| ADVERTENCIA CRITICA 2025-2026 | YouTube PENALIZA/DESMONETIZA canales de IA sin valor humano real. Necesario: voz propia / narración / edición original / ángulo editorial único |
| Casos de éxito reales | Aleix 4.000 EUR/mes, Nicole 7.000 EUR/mes, Samuel monetizado en 1 mes |

Criterios de aprobación de nicho (mínimo 5 de 8):
1. RPM >$4 USD en audiencia hispanohablante
2. Views/suscriptores ratio >50:1 en canales de referencia
3. Outliers recientes (videos con 10x el promedio del canal)
4. Menos de 10 competidores directos en español con >100K subs
5. Producible sin cara o con inversión técnica mínima (viable con IA)
6. Demanda evergreen activa
7. Al menos una fuente de monetización además de AdSense
8. Nicho alineado con una oferta de backend diseñable

---

### 3.4 — ALEX HORMOZI
**Canal:** @AlexHormozi | 4.24M subs | 5.1K+ videos
**Especialidad:** $100M Offers Framework + Content Strategy

| Principio | Descripción |
|-----------|-------------|
| OFERTA PRIMERO | Diseñar la oferta ANTES del canal — el contenido son anuncios gratuitos |
| Jerarquía de valor | Sueños/Deseos > Problemas que bloquean > Soluciones que provees |
| Value Equation | (Resultado soñado × Probabilidad percibida) / (Tiempo × Esfuerzo) |
| 3 Palancas de crecimiento | Volumen (más contenido) / Calidad (mejor packaging) / Distribución (más plataformas) |
| NO audiencia antes que oferta | Construir audiencia sin oferta = trabajo sin retorno económico |
| Contenido = Lead generation | Cada video debe atraer clientes potenciales de la oferta backend |

---

### 3.5 — MRBEAST
**Canal:** @MrBeast | 494M subs | 984 videos
**Especialidad:** Packaging universal + Thumbnails + Outlier Test

| Principio | Descripción |
|-----------|-------------|
| OUTLIER TEST | Único filtro de nicho: busca videos con 10x el promedio del canal. Si existen, el nicho funciona |
| Thumbnail = 80% del éxito | El thumbnail es más importante que el propio video |
| Gancho de 30 segundos | Si no enganchas en los primeros 30s, el video está muerto |
| Curiosity Loops | Nunca resuelvas antes de construir tensión — siempre hay una pregunta abierta |
| A/B Testing obligatorio | Testear múltiples thumbnails — nunca publicar con una sola opción |
| Consistencia > Talento | Publicar consistentemente supera al talento esporádico |
| Modelo multi-canal | Mismo sistema, distintos nichos, ingresos acumulados en paralelo |

8 Principios de packaging de MrBeast:
1. El thumbnail es la publicidad del video — invertir el mismo tiempo que en el video
2. Los primeros 30 segundos determinan si el video vive o muere
3. Curiosity gaps: la promesa del título NUNCA se revela antes del minuto 3
4. Cada 2-3 minutos debe haber un nuevo gancho que retenga
5. A/B test de thumbnails: publicar, esperar 48h, cambiar si CTR <3%
6. Consistencia de estilo: el espectador reconoce el canal antes de ver el nombre
7. El título y thumbnail trabajan juntos — no son independientes
8. Nunca imites a competidores directos — imita a los mejores del mundo en otros nichos

---

## 4. ARQUITECTURA TÉCNICA

### 4.1 Stack Tecnológico Mandatorio

FRONTEND:
- Framework:     Next.js 14+ con App Router + TypeScript estricto
- Styling:       Tailwind CSS 3.4+ + Shadcn/ui + Radix Primitives
- State:         Zustand (global) + TanStack Query (server state)
- Animaciones:   Framer Motion
- IA Streaming:  Server-Sent Events (SSE)
- Charts:        Recharts o Tremor
- Forms:         React Hook Form + Zod
- A11y:          WCAG 2.1 AA obligatorio
- Dark/Light:    next-themes

BACKEND:
- Runtime:       Node.js 20 LTS con TypeScript
- Framework:     Next.js API Routes (App Router)
- Arquitectura:  Clean Architecture — Entities / Use Cases / Adapters / Frameworks
- ORM:           Prisma con migraciones controladas
- Queue:         Bull/BullMQ con Redis
- Storage:       Vercel Blob o AWS S3
- Auth:          NextAuth.js v5 (OAuth 2.0 — Google)

### 4.2 Bases de Datos — Triple Capa

CAPA 1 — PostgreSQL (datos estructurados):
```sql
users              (id, email, name, plan, created_at, last_active)
channels           (id, user_id, youtube_channel_id, niche, score, status)
niche_evaluations  (id, channel_id, criteria_json, total_score, recommendation)
content_ideas      (id, channel_id, title, hook, description, outlier_score, status)
action_items       (id, channel_id, step, description, due_date, completed_at)
audit_logs         (id, user_id, action, metadata, ip_hash, timestamp)
```

CAPA 2 — Redis (caché + sesiones + rate limiting):
- Sesiones JWT activas (TTL: 1 hora)
- Caché YouTube API responses (TTL: 6 horas)
- Caché IA respuestas frecuentes (TTL: 24 horas)
- Rate limiting por IP y user_id
- Bull queues para jobs asíncronos

CAPA 3 — PostgreSQL + pgvector (base de datos vectorial para RAG):
```sql
CREATE TABLE knowledge_embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR CHECK (source_type IN (
                'youtube_transcript','web_article','methodology')),
  source_id   TEXT,
  author      VARCHAR CHECK (author IN (
                'eloisa_wolf','adrian_saenz','eric_alanis',
                'alex_hormozi','mrbeast')),
  chunk_text  TEXT NOT NULL,
  embedding   vector(1536),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON knowledge_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 4.3 Motor RAG

Pipeline:
1. Query del usuario → Generar embedding (text-embedding-3-small)
2. Búsqueda coseno en pgvector (top-K = 5 chunks)
3. Recuperar chunks más relevantes de knowledge_embeddings
4. Construir contexto: [system prompt] + [chunks] + [query]
5. Enviar a LLM via SSE (streaming) → Respuesta con cita de fuente

- LLM principal:  Anthropic Claude 3.5 Sonnet
- Fallback:       OpenAI GPT-4o
- Temperatura:    0.3 factual / 0.7 generación de ideas
- Max tokens:     2000 por respuesta

### 4.4 YouTube Data API v3

Datos a extraer:
- search.list          → buscar canales y videos por nicho/keyword
- videos.list          → vistas, likes, comentarios, metadata
- channels.list        → suscriptores, video count, keywords
- captions.list        → transcripciones para indexar en RAG
- commentThreads.list  → análisis de demanda del mercado

Optimización OBLIGATORIA:
- Redis caché: ninguna llamada repetida en menos de 6 horas
- Batch requests: máximo 50 IDs por llamada
- Quota monitor: alerta cuando quede <20% de cuota diaria

### 4.5 Web Search & Scraping

- Búsqueda global:  Tavily API (primaria) → Google Custom Search API (fallback)
- Scraping limpio:  Firecrawl API (Cloudflare bypass)
- Validación:       viralyt.ai via Playwright headless
- Reglas:           Respetar robots.txt, user-agent rotation

---

## 5. DISEÑO UI/UX — MOMENTUM UI

### Filosofía: Estado de Flujo (Flow State)
El usuario siempre en el punto óptimo entre desafío y habilidad.
Ni aburrido ni abrumado. Siempre con una sola acción clara frente a él.

### Principios de diseño obligatorios:
1. Un solo foco por pantalla — nunca más de una decisión a la vez
2. Progreso visible siempre — barra de % completado en todo momento
3. Celebrar micro-logros — animaciones en cada completado
4. Lenguaje motivacional — nunca burocrático
5. Carga progresiva — mostrar algo inmediatamente, cargar datos en background
6. Nunca un error agresivo — los errores son "oportunidades de ajuste"

### Paleta de colores mandatoria:
--bg-primary:       #0f0f0f   /* Fondo principal — YouTube dark /
--bg-secondary:     #1a1a2e   / Cards y paneles /
--bg-card:          #16213e   / Contenedores secundarios /
--accent-primary:   #6366f1   / Índigo — progreso y acciones /
--accent-secondary: #8b5cf6   / Violeta — hover states /
--accent-success:   #10b981   / Esmeralda — validaciones positivas /
--accent-warning:   #f59e0b   / Dorado — advertencias y logros /
--accent-danger:    #ef4444   / Rojo suave — errores /
--text-primary:     #f1f5f9   / Texto principal /
--text-secondary:   #94a3b8   / Texto secundario /
--text-muted:       #475569   / Texto muted */
### Tipografía:
- Display:  Inter 700 o Geist Sans
- Body:     Inter 400/500
- Mono:     JetBrains Mono o Geist Mono

---

## 6. PÁGINAS Y FLUJOS DE LA APP

### PÁGINA 1 — Dashboard Principal (/dashboard)
Objetivo emocional: El usuario siente que tiene control y claridad

Componentes obligatorios:
- Hero motivacional: "Tu canal de YouTube que genera ingresos. Paso a paso, con IA."
- Barra de progreso: % completado del roadmap (siempre visible)
- 4 tarjetas de métricas:
  * Puntuación del nicho actual
  * Videos publicados
  * Días hasta elegibilidad de monetización
  * Ingresos proyectados a 90 días
- Feed de acciones pendientes (estilo Notion con checkboxes)
- Consejo del día del mentor (RAG + avatar del mentor fuente)
- Widget CTA: "Tu próxima acción de alto impacto"

---

### PÁGINA 2 — Evaluador de Nichos (/dashboard/evaluator)
Diseño: Wizard multi-paso tipo Typeform — UNA sola pregunta por pantalla
Objetivo: Completar la evaluación en menos de 10 minutos

PASO 1 — Identificación del nicho:
- Campo texto: nombre del nicho con autocompletado IA en tiempo real
- Campo texto: sub-nicho específico con ejemplos auto-generados
- Pills visuales: idioma principal (ES / EN / PT / FR / Otro)
- 3 opciones visuales con íconos:
  "Sin cara con IA" / "Con mi voz" / "Con mi cara"
- Date picker: fecha de validación
- Textarea: "¿Por qué crees que este nicho va a funcionar?"
- Mientras escribe → IA busca en YouTube API en tiempo real

PASO 2 — Nichos a evitar:
- 6 cards visuales con ícono grande, fondo rojo suave si riesgo:
  Seducción/Sexual | Recopilaciones sin narrativa | Sin evergreen
  Música/dance | Gore/violencia | Riesgo copyright
- Si alguno marcado: advertencia animada + opción continuar o cambiar nicho

PASO 3 — Demanda de mercado (búsqueda IA automática en vivo):
- 6 checks que se encienden mientras la IA busca en YouTube API + Tavily
- Botón: "Ver videos de referencia encontrados" (modal con thumbnails reales)

PASO 4 — Análisis de competencia (IA busca en YouTube API):
- Auto-fill: número de canales activos encontrados
- Dropdown resultado: BAJA / MEDIA / ALTA / SATURADA
- 5 checks que se encienden automáticamente
- Campo: "¿Cuál es tu ventaja competitiva?" con sugerencias IA

PASO 5 — El veredicto (tabla animada + resultado):
- Tabla con puntuación calculada automáticamente y contador animado
- >=70: Confetti verde + "¡ADELANTE!"
- 50-69: Pulso dorado + "Tiene potencial — refina estos puntos"
- <50: Suave rojo + "Busca otro nicho"
- Botones: Guardar / Crear Plan de Acción / Consultar IA

---

### PÁGINA 3 — Consultor IA (/dashboard/consultant)
Objetivo: Respuestas concretas y motivadoras en segundos

Layout: Split — izquierda historial + derecha área de chat con SSE streaming

Estructura OBLIGATORIA de cada respuesta del consultor:
  ANALISIS:          [breve, basado en RAG]
  RECOMENDACIÓN:     [concreta y accionable]
  ACCIÓN SIGUIENTE:  [qué hacer HOY]
  TIEMPO ESTIMADO:   [cuánto tarda]
  HERRAMIENTA:       [qué usar para ejecutarlo]
  FUENTE:            [qué mentor y concepto respalda esto]

El consultor SIEMPRE conoce:
- Nicho evaluado y puntuación del usuario
- % de progreso del roadmap
- Últimas acciones completadas
- Historial de conversaciones anteriores

Cuando busca en YouTube/web → mostrar: "Buscando en YouTube..."

Prompts sugeridos (chips clickeables):
"¿Por dónde empiezo hoy?" | "Analiza mi nicho" | "¿Cuál es mi primer video?"
"¿Cómo optimizo thumbnails?" | "¿Cuánto gano en 90 días?"

---

### PÁGINA 4 — Plan de Acción (/dashboard/roadmap)
Objetivo: El usuario nunca se pregunta "¿qué hago ahora?"

Timeline vertical interactivo — 4 fases:

FASE 0 — VALIDACIÓN (Días 1-3) | Color: Índigo
- Completar evaluación de nicho
- Validar en viralyt.ai
- Identificar 10 mejores canales de referencia
- Aplicar Outlier Test a los 3 canales top
- Diseñar la oferta backend ANTES de crear el canal (Hormozi)

FASE 1 — SETUP & PRIMEROS VIDEOS (Días 4-14) | Color: Violeta
- Crear canal de YouTube con configuración completa
- Diseñar banner y logo con identidad del nicho
- Publicar Video 1 (guión viral)
- Publicar Video 2 (A/B test thumbnail)
- Publicar Video 3 (medir CTR y retención — ajustar)

FASE 2 — CONSISTENCIA Y CRECIMIENTO (Días 15-60) | Color: Esmeralda
- Publicar 2-3 videos por semana
- Optimizar thumbnails con CTR <3%
- Replicar formato del video con mejor retención
- Llegar a 500 suscriptores (punto de inflexión del algoritmo)
- Revisar métricas semanales con consultor IA

FASE 3 — MONETIZACIÓN (Días 61-90+) | Color: Dorado
- Alcanzar 1.000 subs + 4.000 horas de visualización
- Aplicar al Programa de Socios de YouTube
- Activar primera fuente alternativa (afiliados/producto)
- Expandir al segundo nicho o al inglés (modelo multi-canal)

Cada tarea tiene:
- Ícono visual descriptivo
- Tiempo estimado: "45 min"
- Herramienta recomendada: "Claude AI + viralyt.ai"
- Estado: pendiente / en-progreso / completada (toggle con animación)
- Al completar: toast motivacional

---

### PÁGINA 5 — Content Factory (/dashboard/ideas)
Objetivo: El usuario nunca se queda sin ideas

Generador IA con Outlier Test (YouTube API en tiempo real):
Output por cada idea:
- Título optimizado para CTR
- Gancho de 30 segundos listo para usar
- Ángulo diferenciador vs competencia
- Score de viralidad estimado (0-100)
- Referencia al outlier que inspiró la idea (thumbnail real)
- RPM potencial del tema
- Herramienta de producción recomendada

Acciones por idea:
- "Generar concepto de thumbnail" (prompt para Midjourney/DALL-E)
- "Generar guión completo"
- "Guardar en biblioteca"

Biblioteca filtrable por: estado / score / fecha / tipo de contenido

---

## 7. SEGURIDAD — NIVEL ENTERPRISE (OWASP Top 10)

IMPLEMENTACIÓN OBLIGATORIA — ningún módulo puede lanzarse sin estos controles.

### A1 — BROKEN ACCESS CONTROL
- Middleware de autorización en TODAS las rutas API antes de cualquier lógica
- Row-Level Security en PostgreSQL: usuarios solo ven SUS propios datos
- Tokens JWT NUNCA en localStorage — solo en cookies HttpOnly + Secure + SameSite=Strict
- Expiración JWT: 1 hora access token / 7 días refresh token con rotación automática

### A2 — CRYPTOGRAPHIC FAILURES
- HTTPS obligatorio con TLS 1.3 — redirigir HTTP a HTTPS en middleware
- HSTS: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- Passwords: bcrypt con salt rounds 12 — NUNCA MD5 o SHA1
- API Keys SOLO en variables de entorno — JAMAS en código frontend
- Producción: AWS Secrets Manager o HashiCorp Vault para todos los secrets
- Datos sensibles en DB encriptados con AES-256 antes de insertar

### A3 — INJECTION (SQL + NoSQL + PROMPT INJECTION)
- Prisma ORM con queries parametrizadas — cero queries raw sin sanitizar
- Validación de TODOS los inputs con Zod schemas en el edge
- Sanitización HTML con DOMPurify en todo contenido renderizado
- PROMPT INJECTION defense: envolver inputs en delimitadores seguros antes del LLM
- Filtrado de palabras clave de jailbreak antes de enviar al LLM

### A5 — SECURITY MISCONFIGURATION
Headers obligatorios en next.config.js:
- Content-Security-Policy: default-src self; script-src self nonce; frame-ancestors none
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- CORS: solo orígenes whitelist en producción

### A7 — AUTHENTICATION
- OAuth 2.0 / OpenID Connect via NextAuth.js v5 (Google provider)
- Lockout: 5 intentos fallidos → bloqueo 15 minutos + alerta email
- Session invalidation inmediata al logout (Redis TTL = 0)

### A8 — DATA INTEGRITY
Rate limiting con Redis (Upstash):
- Rutas IA:          máx 20 req/min por usuario
- Rutas YouTube API: máx 10 req/min por usuario
- Rutas auth:        máx 5 req/min por IP
- Global:            máx 1.000 req/min por IP

### A9 — SECURITY LOGGING
Tabla audit_logs registra:
- Todos los logins (exitosos y fallidos) con IP hasheada
- Cambios de datos de usuario
- Llamadas a IA (metadata, sin contenido)
- Errores 4xx y 5xx
- Accesos denegados por autorización

Alertas automáticas: >10 errores 401 en 1 minuto = alerta al admin
Sentry para error tracking en producción

---

## 8. ESTRUCTURA DE ARCHIVOS DEL PROYECTO
youtube-strategy-app/
|-- README.md                    <- LEER PRIMERO
|-- CLAUDE_CODE_BRIEF.md         <- Este archivo
|-- .env.example                 <- Template variables sin valores
|-- .env.local                   <- NUNCA al repositorio
|-- .gitignore                   <- node_modules, .env*, .next, dist
|-- next.config.js               <- Security headers configurados aquí
|-- tailwind.config.ts
|-- prisma/
|   |-- schema.prisma
|   |-- migrations/
|-- src/
|   |-- app/
|   |   |-- (auth)/login/page.tsx
|   |   |-- (auth)/register/page.tsx
|   |   |-- (dashboard)/layout.tsx
|   |   |-- (dashboard)/page.tsx
|   |   |-- (dashboard)/evaluator/page.tsx
|   |   |-- (dashboard)/consultant/page.tsx
|   |   |-- (dashboard)/roadmap/page.tsx
|   |   |-- (dashboard)/ideas/page.tsx
|   |   |-- api/auth/[...nextauth]/route.ts
|   |   |-- api/ai/chat/route.ts
|   |   |-- api/ai/evaluate/route.ts
|   |   |-- api/youtube/search/route.ts
|   |   |-- api/youtube/channel/route.ts
|   |   |-- api/youtube/outlier/route.ts
|   |   |-- api/search/web/route.ts
|   |   |-- api/evaluations/route.ts
|   |-- components/
|   |   |-- ui/                  <- Shadcn components
|   |   |-- dashboard/ProgressBar.tsx
|   |   |-- dashboard/MetricsCard.tsx
|   |   |-- dashboard/ActionItem.tsx
|   |   |-- dashboard/DailyInsight.tsx
|   |   |-- evaluator/WizardStep.tsx
|   |   |-- evaluator/NicheIdentifier.tsx
|   |   |-- evaluator/RiskChecker.tsx
|   |   |-- evaluator/DemandAnalyzer.tsx
|   |   |-- evaluator/CompetitionAnalyzer.tsx
|   |   |-- evaluator/ScoreCard.tsx
|   |   |-- consultant/ChatInterface.tsx
|   |   |-- consultant/MessageBubble.tsx
|   |   |-- consultant/SourceCitation.tsx
|   |   |-- shared/MomentumToast.tsx
|   |   |-- shared/ConfettiEffect.tsx
|   |-- lib/
|   |   |-- db/prisma.ts
|   |   |-- db/redis.ts
|   |   |-- ai/rag.ts
|   |   |-- ai/embeddings.ts
|   |   |-- ai/prompts.ts
|   |   |-- youtube/client.ts
|   |   |-- youtube/quota.ts
|   |   |-- youtube/outlier.ts
|   |   |-- search/tavily.ts
|   |   |-- security/rateLimit.ts
|   |   |-- security/sanitize.ts
|   |   |-- security/audit.ts
|   |   |-- scoring/nicheScore.ts
|   |-- store/
|   |   |-- useUserStore.ts
|   |   |-- useEvaluatorStore.ts
|   |   |-- useConsultantStore.ts
|   |-- types/index.ts
|   |-- types/youtube.ts
|   |-- types/ai.ts
|   |-- middleware.ts
---

## 9. ROL QA / TESTING OBLIGATORIO

Después de implementar CADA módulo, actuar como QA Senior propio:

Comandos de testing:
```bash
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
npm run test -- --coverage
npm audit
npx playwright test
npm run build
```

Checklist funcional por módulo:
- [ ] Todos los estados manejados: loading, empty, error
- [ ] Responsive: mobile (375px) y desktop (1440px)
- [ ] Animaciones no bloquean interacción
- [ ] Streaming de IA funciona sin cortes de UI
- [ ] Rate limiting no bloquea flujo normal
- [ ] Dark mode sin colores hardcodeados
- [ ] Accesibilidad: teclado, ARIA labels, contraste WCAG AA

Formato de reporte de errores:
ERROR ENCONTRADO:  [descripción técnica]
UBICACION:         [archivo y línea]
FIX APLICADO:      [qué cambié y por qué]
ESTADO:            [confirmación de resolución]
---

## 10. DUDAS & CONSULTAS — CANAL INTERACTIVO

Este es el canal oficial de comunicación bidireccional.
Usarlo SIEMPRE antes de asumir algo que no está claro en este brief.
El objetivo es NO gastar trabajo en dirección equivocada.

---

### 10.1 — FORMATO DE DUDA DE CLAUDE CODE
DUDA #[número] — [fecha]
Categoría:    [Arquitectura / UI-UX / Seguridad / Base de datos / IA-RAG / Otro]
Contexto:     [En qué parte del proyecto surgió]
Pregunta:     [La pregunta concreta y específica]
Opciones consideradas:

Opción A: [descripción + pros/contras]
Opción B: [descripción + pros/contras]
Recomendación de Claude Code: [cuál prefiere y por qué]
Estado:       PENDIENTE DE RESPUESTA
---

### 10.2 — CÓMO ADJUNTAR CAPTURAS DE PANTALLA
CAPTURA #[número] — [fecha]
Descripción:  [qué muestra la imagen]
Archivo:      ./screenshots/nombre-archivo.png
Pregunta:     [qué se quiere saber sobre la imagen]
Estado:       PENDIENTE DE REVISIÓN
Pasos para adjuntar imágenes a Claude Code:
1. Guardar la imagen en la carpeta /screenshots/ del proyecto
2. Decirle a Claude Code: "lee la imagen screenshots/nombre.png"
3. Claude Code
