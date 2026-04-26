Guía de estudio — PropTech
Cómo leer esto
Cada sección explica un concepto y lo conecta a un archivo real. No necesitás saber programar para entenderlo, solo entender qué rol cumple cada pieza.

1. Qué es una web app moderna (el modelo mental)
Una web app tiene dos mitades:

Frontend — lo que ve el usuario en el navegador (HTML, estilos, botones)
Backend — lo que corre en un servidor: base de datos, lógica de negocio, autenticación
Next.js (el framework que usamos) mezcla ambas en el mismo proyecto. Podés escribir código que corre en el servidor y código que corre en el navegador, en los mismos archivos. Eso es lo que hace especial al App Router.

Archivo clave: next.config.ts — configuración general del framework.

2. Estructura de carpetas → estructura de URLs
En Next.js App Router, la carpeta es la URL. Sin configuración extra:


src/app/page.tsx              →  proptech.com/
src/app/register/role/page.tsx →  proptech.com/register/role
src/app/inquilino/...          →  proptech.com/inquilino/...
src/app/inmobiliaria/...       →  proptech.com/inmobiliaria/...
src/app/admin/...              →  proptech.com/admin/...
Cada page.tsx es una pantalla. Cada layout.tsx es el "envoltorio" compartido (navbar, footer, etc.).

Archivo clave: src/app/layout.tsx, src/app/page.tsx

3. TypeScript — por qué todo tiene tipos
TypeScript es JavaScript con tipos declarados. En vez de:


let score = calcularScore(usuario)  // ¿qué devuelve esto?
escribimos:


let score: { value: number; label: string } = calcularScore(usuario)  // claro
El compilador te avisa si pasás el dato equivocado antes de que el usuario lo vea. En un hackathon de 20 horas evita bugs silenciosos.

4. La base de datos — PostgreSQL + Prisma
PostgreSQL es la base de datos (tablas, filas, relaciones). Prisma es la capa que te permite hablar con ella desde TypeScript sin escribir SQL crudo.

El archivo central es el schema:

prisma/schema.prisma — define todas las tablas y sus relaciones.

Las entidades principales:

Modelo	Qué representa
User	Cualquier usuario (Google OAuth). Tiene un role opcional.
InquilinoProfile	Datos del inquilino: DNI, ingresos, garantía, archivos subidos
InmobiliariaProfile	Datos de la empresa: CUIT, nombre, si fue aprobada por admin
Property	Una propiedad publicada por una inmobiliaria
Postulacion	Un inquilino aplicando a una propiedad (estado: PENDIENTE → APROBADA, etc.)
Transaction	Se crea cuando una postulación es aprobada. Lleva el alquiler activo.
VerazScore	Score crediticio mockeado (500–999)
ConfianzaScore	Score de confianza calculado por IA (0–100)
FlaggedDocument	Documentos que el admin marcó como sospechosos
Relaciones clave:

Un User tiene un InquilinoProfile o un InmobiliariaProfile (nunca ambos)
Una InmobiliariaProfile tiene muchas Property
Una Postulacion conecta un inquilino con una propiedad
Una Transaction nace de una Postulacion aprobada
src/lib/prisma.ts — el cliente Prisma compartido. Se importa en todo el backend como import { prisma } from "@/lib/prisma".

Migraciones: cuando cambiás el schema, corrés prisma migrate dev. Eso crea un archivo de migración versionado en prisma/migrations/ — auditable, reversible.

5. Autenticación — NextAuth.js v5 con Google OAuth
Autenticación = saber quién es el usuario. No usamos contraseñas: usamos Google como proveedor.

src/auth.ts

El flujo completo:

Usuario hace clic en "Iniciar sesión con Google"
Google verifica su identidad y nos manda de vuelta con un token
NextAuth guarda el usuario en la base de datos (via PrismaAdapter)
Se crea un JWT (JSON Web Token) — un token firmado que viaja en una cookie
En cada request, el servidor lee esa cookie para saber quién es el usuario
El callback jwt hace algo importante: carga el role del usuario desde la DB y lo mete en el token. Así cada pantalla puede saber si sos INQUILINO, INMOBILIARIA o ADMIN sin hacer una query extra.


// src/auth.ts — línea 17
if (user) token.id = user.id;
// la primera vez que el usuario se loguea, guardamos su ID en el token
6. Middleware — el guardia de seguridad
src/middleware.ts

El middleware es código que se ejecuta antes de que cualquier request llegue a una página. Es el guardia en la puerta.

Lo que hace el nuestro, en orden:

Si la ruta es /inquilino, /inmobiliaria o /admin y el usuario no está logueado → redirige a /login
Si está logueado pero no tiene rol asignado → redirige a /register/role
Si tiene rol pero intenta entrar a la sección de otro rol → redirige a su propia sección
Ejemplo: si sos INQUILINO y vas a /inmobiliaria/propiedades, el middleware te manda a /inquilino automáticamente.


const ROLE_HOME: Record<string, string> = {
  INQUILINO: "/inquilino",
  INMOBILIARIA: "/inmobiliaria",
  ADMIN: "/admin",
};
7. DAL — capa de acceso a datos
src/lib/dal.ts

DAL = Data Access Layer. Son helpers que cualquier página del servidor puede llamar para verificar sesión sin repetir lógica.

verifySession() — si no hay sesión activa, redirige a /login. Si hay, devuelve el usuario.
verifyRole("INQUILINO") — verifica sesión y además que el rol sea el correcto.
Se usa al principio de cualquier Server Component protegido:


const user = await verifyRole("INMOBILIARIA");
// si llegamos acá, estamos seguros de que es una inmobiliaria logueada
8. Server Actions — formularios sin API
src/app/register/role/actions.ts

En Next.js App Router, en vez de crear un endpoint de API para cada acción, se usan Server Actions: funciones marcadas con "use server" que corren en el servidor pero se pueden llamar directo desde el formulario del cliente.

La acción setRole:

Lee la sesión activa
Actualiza el campo role del usuario en la base de datos
Redirige al usuario a su sección correspondiente

// Así se usa en el formulario — sin fetch, sin API route
<form action={setRole.bind(null, "INQUILINO")}>
  <button type="submit">Soy inquilino</button>
</form>
Es como un shortcut que hace el round-trip servidor ↔ cliente transparente.

9. El flujo de un usuario nuevo (todo conectado)

Usuario entra a proptech.com
      ↓
middleware.ts → no está logueado → /login
      ↓
Google OAuth → NextAuth crea User en DB (sin rol)
      ↓
middleware.ts → sin rol → /register/role
      ↓
register/role/page.tsx → elige "Inquilino"
      ↓
actions.ts setRole() → UPDATE users SET role='INQUILINO'
      ↓
redirect /inquilino → middleware.ts verifica rol ✓
      ↓
dal.ts verifyRole("INQUILINO") → devuelve usuario
      ↓
Pantalla principal del inquilino
10. Los dos scores — cómo funciona la IA
La IA es Claude (de Anthropic). Se invoca desde lib/ai/ (aún no implementado, es lo que viene).

Score	Fuente	Cómo
Score Veraz (500–999)	Mock — busca el DNI en Assets/Usuarios.xlsx	No hay IA, es una tabla
Score Confianza (0–100)	Claude analiza foto del DNI + PDF de ingresos	IA real, retorna JSON estructurado
Claude puede leer imágenes y PDFs nativamente. El score confianza devuelve:


{
  "score": 78,
  "dimensions": { "doc_quality": 85, "income_ratio": 70, "guarantee": 80 },
  "improvement_text": "Tu relación ingreso/alquiler es ajustada..."
}
Además hay dos features de IA más:

Compatibilidad perfil–propiedad: dado un inquilino y una propiedad, Claude dice qué tan compatibles son (0–100% + explicación en español)
Resumen comparativo: dada una lista de candidatos, Claude escribe un párrafo comparativo para la inmobiliaria
11. Seed — datos de prueba
prisma/seed.ts

El seed es un script que llena la base de datos con datos realistas para demostrar la app. Un comando lo corre todo: prisma db seed.

Crea:

3 inmobiliarias
20 inquilinos (datos tomados de Assets/Usuarios.xlsx)
10 propiedades
15 postulaciones en distintos estados del proceso
12. Deploy — dónde vive la app
Componente	Servicio
App (Next.js)	Vercel — deploy automático al hacer push a main
Base de datos	Supabase (PostgreSQL hosteado)
Archivos (DNIs, PDFs)	Supabase Storage
CI/CD	GitHub Actions — lint + build en cada PR
Variables sensibles (API keys, credenciales) van en .env.local (nunca al repo). El .env.example lista qué variables se necesitan sin revelar los valores.

Resumen — las 5 preguntas que te van a hacer
¿Qué hace la app? — Plataforma de alquiler con IA. Los inquilinos suben documentos, la IA los analiza y les da un score. Las inmobiliarias ven candidatos rankeados y gestionan el alquiler.

¿Cómo sabe la app quién soy? — Google OAuth via NextAuth. Tu identidad se guarda en un JWT en una cookie. El middleware valida ese token en cada request.

¿Cómo se guardan los datos? — PostgreSQL (Supabase). Prisma es la capa que convierte objetos TypeScript en queries SQL.

¿Qué hace la IA? — Claude analiza la foto del DNI y el PDF de ingresos para calcular el Score Confianza. También evalúa compatibilidad perfil–propiedad y genera resúmenes comparativos de candidatos.

¿Por qué tres roles separados? — Inquilino, Inmobiliaria y Admin tienen flujos completamente distintos. El middleware garantiza que cada uno solo puede acceder a su sección.