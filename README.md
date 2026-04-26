# PropTech — Plataforma Inmobiliaria

Plataforma integral de alquiler para Argentina: pasaporte de inquilino con scoring de IA, gestión de propiedades, ranking de candidatos y tablero de transacción.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL (Supabase) + Prisma ORM v7 |
| Storage | Supabase Storage (DNIs, comprobantes) |
| Auth | NextAuth.js v5, Google OAuth |
| AI | Groq API — llama-3.3-70b-versatile (texto), llama-3.2-11b-vision-preview (imagen DNI) |
| Deploy | Vercel (app) + Supabase (DB + storage) |

## Roles

- **Inquilino**: carga perfil + documentos → score Veraz + score Confianza IA → postula a propiedades → sigue estado
- **Inmobiliaria**: onboarding → crea propiedades → ve candidatos rankeados por compatibilidad IA → gestiona transacciones
- **Admin**: aprueba agencias, métricas globales, cola de documentos flaggeados

## Features de IA

1. **Score Confianza (0–100)**: analiza imagen del DNI (vision model) + PDF de ingresos (pdf-parse), devuelve `{ score, dimensions, improvement_text }`
2. **Compatibilidad perfil–propiedad**: dado el perfil del inquilino y los requisitos de la propiedad, devuelve `{ compatibility_pct, explanation }` en español
3. **Resumen comparativo de candidatos**: dado un conjunto de postulantes top, devuelve un párrafo comparativo en español para la inmobiliaria

Toda la lógica de IA vive en `src/lib/ai/` como capa de servicio. Las rutas API nunca llaman a Groq directamente.

## Setup local

### Requisitos
- Node.js 22+
- Docker (para postgres local) o cuenta Supabase

### 1. Clonar e instalar
```bash
git clone https://github.com/Tomas8x/Proptech.git
cd Proptech
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env
```

Completar en `.env`:

| Variable | Cómo obtenerla |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection pooling → Session mode (port 5432) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` en local, URL de Vercel en prod |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client |
| `GOOGLE_CLIENT_SECRET` | Idem anterior |
| `GROQ_API_KEY` | console.groq.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |

### 3. Migraciones y seed
```bash
npx prisma migrate deploy
npx prisma db seed
```

El seed carga: 1 admin, 3 inmobiliarias, 20 inquilinos (desde `Assets/Usuarios.xlsx`), 10 propiedades, 15 postulaciones.

### 4. Levantar
```bash
npm run dev
```

### Alternativa: Docker Compose (solo postgres local)
```bash
docker compose up db -d
# Cambiar DATABASE_URL en .env a postgresql://proptech:proptech@localhost:5432/proptech
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Deploy en Vercel

### Primera vez

1. Crear proyecto en Supabase → copiar credenciales
2. Crear OAuth Client en Google Cloud Console:
   - Authorized JS origins: `https://tu-app.vercel.app`
   - Authorized redirect URI: `https://tu-app.vercel.app/api/auth/callback/google`
3. Importar repo en Vercel, configurar todas las env vars (ver tabla arriba)
4. Deploy → copiar URL → actualizar `AUTH_URL` en Vercel → Redeploy
5. Correr migraciones y seed desde local apuntando a Supabase

### Gotchas conocidos

| Problema | Causa | Fix |
|---|---|---|
| `Module not found: ../generated/prisma` | Prisma no genera el client en Vercel | El build script corre `prisma generate && next build` |
| `PrismaClientInitializationError` en build | Prisma v7 requiere adapter explícito | `src/lib/prisma.ts` usa `PrismaPg` adapter |
| Middleware >1 MB en Vercel free | Prisma/PrismaAdapter en el bundle del edge | `auth.config.ts` liviano separado de `auth.ts` |
| `DOMMatrix is not defined` en build | `pdf-parse` se carga al nivel de módulo | `require('pdf-parse')` movido dentro de la función |
| `P2028` en seed | Transaction pooler (port 6543) no soporta `$transaction()` | Seed usa operaciones secuenciales en vez de `$transaction([])` |
| Migración falla en DB fresca | AlterEnum sobre tablas que aún no existen | Migration 4 reescrita para DROP/CREATE del enum directamente |

### Variables de entorno en Vercel
- No van entre comillas en el dashboard de Vercel
- Después de cambiar env vars, hacer Redeploy manual (no se aplican automáticamente)
- `AUTH_URL` debe ser la URL exacta de Vercel sin slash final

## Estructura del proyecto

```
src/
  app/
    inquilino/          # Flujos del inquilino
    inmobiliaria/       # Flujos de la inmobiliaria
    admin/              # Panel admin
    login/              # Página de login
    register/role/      # Selección de rol post-signup
  lib/
    ai/                 # Capa de servicios IA (Groq)
      confidenceScore.ts
      compatibility.ts
      candidates.ts
    dal.ts              # Data Access Layer (verifySession, verifyRole)
    prisma.ts           # Singleton PrismaClient con PrismaPg adapter
    veraz/mock.ts       # Mock del score Veraz
  auth.ts               # NextAuth full (con PrismaAdapter) — solo server
  auth.config.ts        # NextAuth liviano (sin Prisma) — para middleware edge
  middleware.ts         # Protección de rutas + redirección por rol
prisma/
  schema.prisma
  migrations/
  seed.ts
```

## Decisiones de arquitectura

- **Auth separado en dos configs**: `auth.config.ts` (sin Prisma, para middleware Edge) + `auth.ts` (con PrismaAdapter, para server). Necesario para que el middleware entre en el límite de 1 MB de Vercel free.
- **Prisma v7 con driver adapter**: v7 eliminó el `url` en `schema.prisma`; la conexión se pasa via `PrismaPg` al constructor. `prisma.config.ts` maneja la URL para migraciones CLI.
- **AI como capa de servicio**: toda llamada a Groq pasa por `src/lib/ai/`. Cambiar de modelo o proveedor no toca las rutas.
- **pdf-parse lazy load**: se carga con `require()` dentro de la función, no al nivel de módulo, para evitar errores de canvas en el build de Vercel.
- **Score Veraz mock**: matchea DNI contra datos del Excel de Assets. En producción real se reemplazaría por llamada a API de Veraz/BCRA.

## ¿Qué haríamos con un día más?

1. **Tablero de transacción completo (M3)**: la máquina de estados está definida pero falta la UI del board con transiciones, adjuntos por etapa y portal compartido tokenizado.
2. **Panel admin**: aprobación de agencias y cola de documentos flaggeados — la estructura de DB está, falta la UI.
3. **Notificaciones por email**: NextAuth ya tiene los hooks; agregaríamos Resend para notificar en cada cambio de estado de postulación.
4. **Upload real a Supabase Storage**: el flujo de documentos guarda paths locales; conectar el upload al bucket `documents` de Supabase y pasar URLs firmadas al AI service.
5. **GitHub Actions CI/CD**: lint + build en PRs, deploy automático a Vercel en main. La estructura está lista, falta el workflow YAML.
