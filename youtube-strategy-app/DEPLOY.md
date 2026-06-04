# FluxIA — Guía de Deploy en Vercel

## Pre-requisitos completados
- [x] Supabase PostgreSQL configurado
- [x] Google OAuth configurado (localhost:3000)
- [ ] Anthropic API key
- [ ] YouTube Data API v3 key

---

## PASO 1 — Subir a GitHub

```bash
cd "C:\Users\Maxi\Documents\Proyecto youtube desde cero\Proyecto Web para contenido"
git remote add origin https://github.com/TU_USUARIO/fluxia.git
git push -u origin master
```

---

## PASO 2 — Crear cuenta en Vercel

1. Ir a **vercel.com** → Sign Up con GitHub
2. **New Project** → importar el repo `fluxia`
3. Vercel detecta automáticamente Next.js

---

## PASO 3 — Variables de entorno en Vercel

En **Settings → Environment Variables**, agregar:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:TU_PASSWORD@db.TU_REF.supabase.co:5432/postgres` |
| `DIRECT_URL` | Mismo que DATABASE_URL |
| `AUTH_SECRET` | El mismo de .env.local |
| `AUTH_URL` | `https://TU_APP.vercel.app` |
| `GOOGLE_CLIENT_ID` | El de Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | El de Google Cloud Console |
| `ANTHROPIC_API_KEY` | De console.anthropic.com |
| `YOUTUBE_API_KEY` | De Google Cloud Console |
| `UPSTASH_REDIS_REST_URL` | De upstash.com (opcional) |
| `UPSTASH_REDIS_REST_TOKEN` | De upstash.com (opcional) |

---

## PASO 4 — Actualizar Google OAuth para producción

En **Google Cloud Console → Credentials → tu OAuth 2.0 Client**:

Agregar a **Authorized redirect URIs**:
```
https://TU_APP.vercel.app/api/auth/callback/google
```

---

## PASO 5 — Deploy

Vercel hace el deploy automático en cada push a `master`.

Para deploy manual:
```bash
npm i -g vercel
vercel --prod
```

---

## PASO 6 — Seed de producción

Después del primer deploy, ejecutar el seed del RAG:
```bash
DATABASE_URL="postgresql://..." npx tsx src/scripts/seed-knowledge.ts
```

---

## Estructura de costos estimada (producción)

| Servicio | Costo mensual |
|---------|--------------|
| Vercel (Hobby) | **Gratis** |
| Supabase (Free tier) | **Gratis** |
| Anthropic Claude (~500 queries/mes) | ~$1-2 USD |
| YouTube API (10K req/día gratis) | **Gratis** |
| Total estimado | ~$2 USD/mes |
