# nBoxes (Next.js)

Agendamento e gestão de boxes de ensaio para bandas — cadastro de boxes, bandas e
membros, calendário de ensaio/gravação/ajuste, e divisão de despesas (água, luz,
internet) por banda ou por membro.

Stack: **Next.js 14 (App Router) + Tailwind CSS + shadcn/ui (Radix) + Supabase**
(auth com Google via `@supabase/ssr`, cookies de sessão, e banco Postgres).

## 1. Criar o projeto no Supabase

1. Cria um projeto em [supabase.com](https://supabase.com).
2. Vai a **SQL Editor** e roda o conteúdo de `supabase/schema.sql` — cria as
   tabelas (`boxes`, `bands`, `members`, `schedules`, `expenses`) e as políticas
   de Row Level Security.
3. Vai a **Authentication → Providers → Google** e ativa o login com Google:
   - Cria um OAuth Client ID no [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Nas "Authorized redirect URIs" do Google, adiciona a URL de callback que o
     Supabase mostra nessa tela (algo como
     `https://SEU-PROJETO.supabase.co/auth/v1/callback`).
   - Cola o Client ID e o Client Secret de volta no Supabase.
4. Em **Authentication → URL Configuration**, adiciona:
   - Site URL: `http://localhost:3000` (e depois o domínio de produção)
   - Redirect URLs: `http://localhost:3000/auth/callback` (e o equivalente em produção)

## 2. Configurar o projeto localmente

```bash
cp .env.example .env.local
# edita .env.local com a URL e a anon key do teu projeto (Project Settings > API)

npm install
npm run dev
```

Abre `http://localhost:3000`.

## 3. Build para produção

```bash
npm run build
npm run start
```

Lembra de configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
no ambiente de produção (Vercel, etc.) e de adicionar o domínio final em
Redirect URLs / Site URL no Supabase.

## Como funciona o login (App Router)

1. `loginWithGoogle()` chama `supabase.auth.signInWithOAuth` e manda o Google
   devolver pra `/auth/callback?next=/home`.
2. `app/auth/callback/route.js` troca o `code` por uma sessão e grava os
   cookies via `@supabase/ssr`.
3. `middleware.js` roda em toda navegação, atualiza os cookies de sessão, e
   redireciona pra `/` quem tentar acessar `/home` ou `/box/:id` sem sessão.

## Estrutura

```
app/
  layout.jsx              layout raiz, fontes
  page.jsx                landing / login
  auth/callback/route.js  troca o código OAuth por sessão
  home/page.jsx           lista de boxes do usuário
  box/[id]/page.jsx        agenda / financeiro / bandas & membros
components/
  ui/                     shadcn/ui (button, dialog, tabs, select, switch, etc.)
  dialogs/                formulários de criar box, agendar, despesa, banda, membro
  Logo.jsx                marca nBoxes (ícone, wordmark, selo circular)
  Chrome.jsx              cabeçalho, botões e divisores reutilizados
hooks/useAuth.js          sessão do Supabase (client-side)
lib/
  supabase/client.js      client Supabase para Client Components
  supabase/server.js      client Supabase para Server Components / Route Handlers
  supabase/middleware.js  helper usado pelo middleware.js
  theme.js                paleta de cores, tipos de agendamento/despesa, cálculo de rateio
middleware.js             protege /home e /box, mantém a sessão atualizada
supabase/schema.sql       tabelas + políticas RLS
```

## Modelo de permissões (protótipo)

Quem **cria a box** (`owner_id`) é o único administrador de verdade a nível de
banco — as políticas de RLS só liberam acesso pra quem é dono da box. O toggle
de "Admin" na aba Bandas & Membros marca a permissão dentro da própria banda,
mas pra dar acesso de administração da box a mais de uma conta Google, o
próximo passo é criar uma tabela `box_admins (box_id, user_id)` e trocar as
políticas de `owner_id = auth.uid()` para também aceitar linhas dessa tabela.
