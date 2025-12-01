# Deployment Guide

## Sumário

1. [Arquitetura de Deploy](#arquitetura-de-deploy)
2. [Pré-requisitos](#pré-requisitos)
3. [Git Flow](#git-flow)
4. [Deploy Frontend (Vercel)](#deploy-frontend-vercel)
5. [Deploy Backend (Railway)](#deploy-backend-railway)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [DNS e Subdomínios](#dns-e-subdomínios)
8. [Checklist de Deploy](#checklist-de-deploy)

---

## Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUÇÃO                                │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────┐ │
│  │  Vercel          │    │  Railway/Render  │    │  Neon/    │ │
│  │  (Frontend)      │◄──►│  (Backend)       │◄──►│  Supabase │ │
│  │  dashboard       │    │  api             │    │  (DB)     │ │
│  └──────────────────┘    └──────────────────┘    └───────────┘ │
│         │                                                       │
│         ▼                                                       │
│  *.titanstech.com.br (wildcard DNS)                            │
│  - admin.titanstech.com.br → /admin                            │
│  - cliente.titanstech.com.br → /s/cliente                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pré-requisitos

- [ ] Conta Vercel (free tier ok)
- [ ] Conta Railway, Render ou similar (backend)
- [ ] Banco PostgreSQL já configurado
- [ ] Domínio com acesso DNS

---

## Git Flow

### Opções de Fluxo

**Opção A (Recomendada) - 3 branches:**

```
feature → dev (PR) → staging (merge manual) → main (merge manual)
```

- PRs obrigatórios para `dev`
- Mais controle sobre o que vai para produção
- Ideal para times maiores ou produtos em produção

**Opção B - 2 branches (simplificado):**

```
feature → staging (PR) → main (merge manual)
```

- PRs direto para `staging`
- Menos overhead, mais rápido
- Ideal para times pequenos ou MVPs

**Opção C - GitHub Flow (mais simples):**

```
feature → main (PR)
```

- PRs direto para `main`
- Deploy automático em cada merge
- Ideal para CI/CD maduro com bons testes

**Este projeto usa Opção A.**

### Branches

| Branch    | Ambiente | Deploy Automático |
| --------- | -------- | ----------------- |
| `main`    | Produção | Sim (Vercel)      |
| `staging` | Staging  | Sim (Vercel)      |
| `dev`     | Nenhum   | Não               |

### Fluxo de Trabalho

```
feature-branch
      │
      ▼ (PR)
    dev ─────────────────────► Desenvolvimento local
      │                        Sem deploy automático
      │ (merge manual)
      ▼
  staging ───────────────────► Preview/Testes
      │                        Deploy automático
      │ (merge manual)
      ▼
   main ─────────────────────► Produção
                               Deploy automático
```

### Regras

1. **PRs sempre para `dev`** - Revisão de código obrigatória
2. **`dev` → `staging`** - Merge manual quando features prontas para teste
3. **`staging` → `main`** - Merge manual após QA aprovado
4. **Hotfixes** - Podem ir direto para `main` se urgente (criar PR depois para `dev`)

### Configurar Branches (GitHub)

```bash
# Criar branches se não existem
git checkout main
git checkout -b staging
git push -u origin staging

git checkout -b dev
git push -u origin dev
```

**GitHub → Settings → Branches → Add rule:**

| Branch    | Proteções                                        |
| --------- | ------------------------------------------------ |
| `main`    | Require PR, Require status checks, No force push |
| `staging` | Require status checks                            |
| `dev`     | Require PR                                       |

---

## Deploy Frontend (Vercel)

### 1. Conectar Repositório

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Import do GitHub → Selecione `titans-tech`
3. Configure:

```
Framework Preset: Next.js
Root Directory: apps/dashboard
Build Command: cd ../.. && npm run build
Output Directory: .next
Install Command: cd ../.. && npm install
```

> Nota: O arquivo `apps/dashboard/vercel.json` já contém estas configurações.

### 2. Configurar Environments

**Vercel → Project → Settings → Git:**

- Production Branch: `main`
- Preview Branches: `staging`
- Ignored Build Step: `dev` (deixe sem deploy)

**Para ignorar `dev`:**
Settings → Git → Ignored Build Step:

```bash
if [ "$VERCEL_GIT_COMMIT_REF" = "dev" ]; then exit 0; fi
```

### 3. Variáveis de Ambiente (Vercel)

**Settings → Environment Variables:**

| Variável                  | Production                      | Staging                                 |
| ------------------------- | ------------------------------- | --------------------------------------- |
| `NODE_ENV`                | `production`                    | `staging`                               |
| `NEXT_PUBLIC_API_URL`     | `https://api.titanstech.com.br` | `https://api-staging.titanstech.com.br` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `titanstech.com.br`             | `staging.titanstech.com.br`             |
| `AUTH_JWT_SECRET`         | `<secret>`                      | `<secret>`                              |
| `DATABASE_URL`            | `<prod-db-url>`                 | `<staging-db-url>`                      |

### 4. Configurar Domínio

**Settings → Domains:**

```
titanstech.com.br          → Production
*.titanstech.com.br        → Production (wildcard)
staging.titanstech.com.br  → Staging
```

---

## Deploy Backend (Railway)

Railway é recomendado por ser o mais simples para NestJS. Alternativas: Render, Fly.io.

### Opção A: Railway (Recomendado)

1. Acesse [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Selecione `titans-tech`
4. Configure:

```
Root Directory: apps/backend
Build Command: cd ../.. && npm install && npm run build:backend
Start Command: node dist/main.js
```

**Variáveis de Ambiente (Railway):**

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...
AUTH_JWT_SECRET=<secret>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=titechjf-bucket
SENDGRID_API_KEY=<key>
EMAIL_FROM=noreply@titanstech.com.br
EMAIL_PROVIDER=SENDGRID
FRONTEND_URL=https://titanstech.com.br
```

**Domínio personalizado:**
Settings → Networking → Custom Domain: `api.titanstech.com.br`

### Opção B: Render

1. [render.com](https://render.com) → New Web Service
2. Connect GitHub → `titans-tech`
3. Configure:

```
Root Directory: apps/backend
Build Command: cd ../.. && npm install && npm run build:backend
Start Command: node dist/main.js
```

### Opção C: Vercel (Serverless - Mais complexo)

Requer adaptação para serverless. Não recomendado para este projeto devido a:

- WebSockets (Socket.IO)
- Cold starts
- Limites de execução

---

## Variáveis de Ambiente

### Produção

**Frontend (Vercel):**

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.titanstech.com.br
NEXT_PUBLIC_ROOT_DOMAIN=titanstech.com.br
AUTH_JWT_SECRET=<jwt-secret-min-32-chars>
DATABASE_URL=<production-database-url>
```

**Backend (Railway):**

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=<production-database-url>
AUTH_JWT_SECRET=<jwt-secret-min-32-chars>
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=titechjf-bucket
SENDGRID_API_KEY=<sendgrid-key>
EMAIL_FROM=noreply@titanstech.com.br
EMAIL_PROVIDER=SENDGRID
FRONTEND_URL=https://titanstech.com.br
```

### Staging

Mesmas variáveis, mas com:

- `NODE_ENV=staging`
- URLs apontando para staging
- Database de staging separado

---

## DNS e Subdomínios

### Configuração DNS (Cloudflare/Route53)

```
Tipo    Nome                    Valor
─────────────────────────────────────────────────────
A       titanstech.com.br       76.76.21.21 (Vercel)
CNAME   www                     cname.vercel-dns.com
CNAME   *                       cname.vercel-dns.com (wildcard)
CNAME   api                     <railway-domain>
CNAME   api-staging             <railway-staging-domain>
```

### Roteamento de Clientes (Multi-tenancy)

O projeto usa rotas dinâmicas do Next.js:

**Estrutura de rotas:**

```
/admin/*                → Painel SysAdmin
/s/[subdomain]/*        → Dashboard do cliente
```

**URLs de acesso:**

```
Admin:   https://titanstech.com.br/admin
Cliente: https://titanstech.com.br/s/empresa-x/home
```

**Middleware de Subdomínios (opcional):**

O arquivo `src/proxy.ts` contém lógica para roteamento por subdomínio. Para habilitar:

1. Criar `apps/dashboard/middleware.ts`:

```ts
export { proxy as middleware, config } from './src/proxy';
```

2. Isso permitirá acessar via `empresa.titanstech.com.br` ao invés de `/s/empresa`

> Nota: Requer wildcard DNS (`*.titanstech.com.br`) e configuração no Vercel.

---

## Checklist de Deploy

### Primeiro Deploy

- [ ] Criar branches `staging` e `dev`
- [ ] Configurar proteção de branches no GitHub
- [ ] Criar projeto no Vercel (frontend)
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Criar projeto no Railway (backend)
- [ ] Configurar variáveis de ambiente no Railway
- [ ] Configurar DNS (wildcard para subdomínios)
- [ ] Rodar migrations no banco de produção:
  ```bash
  DATABASE_URL=<prod-url> npx prisma migrate deploy
  ```
- [ ] Criar SysAdmin no banco:
  ```bash
  DATABASE_URL=<prod-url> npm run db:create-sys-admin
  ```
- [ ] Testar acesso admin
- [ ] Testar acesso cliente (subdomínio)

### Deploy Subsequentes

**Merge para `staging`:**

1. `git checkout staging && git merge dev`
2. `git push origin staging`
3. Vercel deploya automaticamente preview
4. Testar em `staging.titanstech.com.br`

**Merge para `main`:**

1. `git checkout main && git merge staging`
2. `git push origin main`
3. Vercel deploya automaticamente produção
4. Railway deploya automaticamente backend (se configurado)

### Migrations em Produção

```bash
# Staging
DATABASE_URL=<staging-url> npx prisma migrate deploy

# Produção
DATABASE_URL=<prod-url> npx prisma migrate deploy
```

Ou use o workflow do GitHub Actions:

```bash
gh workflow run database-operations.yml -f operation=migrate-production
```

---

## Troubleshooting

### Build falha no Vercel

```bash
# Teste local
npm run build:dashboard
```

Verifique se todas as env vars estão configuradas.

### Subdomínio não funciona

1. Verifique DNS wildcard (`*.domain` → Vercel)
2. Verifique se a empresa existe no banco com o slug correto
3. Limpe cache do navegador

### CORS errors

Verifique `FRONTEND_URL` no backend aponta para domínio correto.

### WebSocket não conecta

Railway/Render suportam WebSocket. Vercel não (para backend).

---

## Custos Estimados

| Serviço       | Free Tier       | Pro           |
| ------------- | --------------- | ------------- |
| Vercel        | Sim (hobby)     | $20/mês       |
| Railway       | $5 crédito/mês  | Pay as you go |
| Render        | Sim (spin down) | $7/mês        |
| Neon (DB)     | 500MB free      | $19/mês       |
| Supabase (DB) | 500MB free      | $25/mês       |

**Recomendação inicial:** Vercel Free + Railway Free = $0/mês para começar.
