# Titans Tech

> Sistema completo de gestão de manutenção e inspeção de máquinas industriais

## Sobre o Projeto

Titans Tech é uma plataforma full-stack desenvolvida para gerenciar o ciclo completo de manutenção e inspeção de máquinas industriais. O sistema permite que empresas criem blueprints de máquinas, registrem equipamentos, agendem serviços e monitorem métricas críticas com sistema de alertas automatizado.

## Funcionalidades Principais

### Gestão de Empresas e Filiais

- Criação e gerenciamento de empresas com múltiplas filiais
- Sistema de permissões granular (24 permissões específicas)
- Hierarquia de usuários: SysAdmin → CompanyAdmin → CompanyManager → User

### Blueprints de Máquinas

- Templates customizáveis para diferentes tipos de máquinas
- Campos dinâmicos configuráveis
- 6 seções técnicas: Folga de Mancais, Corrediças, Guias, Lubrificação/Hidráulica, Embreagem, Cilindro Balancim

### Registro e Monitoramento de Máquinas

- Cadastro de máquinas vinculadas a blueprints
- Campos personalizados por tipo de máquina
- Histórico completo de serviços

### Serviços de Inspeção e Manutenção

- Registro detalhado de inspeções (INSPECTION) e manutenções (MAINTENANCE)
- Formulários específicos por seção técnica
- Medições de alta precisão (Decimal 10,4)
- Comparação antes/depois para cada métrica

### Sistema de Alertas Inteligente

- Alertas automáticos baseados em thresholds configuráveis
- 3 níveis de severidade: VERDE (atenção) / AMARELO (alerta) / VERMELHO (crítico)
- Cálculo de diferenciais (|RH - LH|) para folga de mancais
- Snapshot histórico de thresholds para auditoria
- Dashboard de alertas por máquina/serviço

### Autenticação e Autorização

- Sistema JWT com tokens de 7 dias
- Dois tipos de usuário: SysAdmin e User (empresa)
- Permissões por filial com controle granular
- Guards globais para proteção de rotas

## Stack Tecnológico

### Monorepo

- **Turborepo** 2.6.1 - Build system e cache inteligente
- **npm workspaces** - Gerenciamento de pacotes

### Backend

- **NestJS** 10.x - Framework Node.js
- **PostgreSQL** - Banco de dados relacional
- **Prisma** 6.x - ORM type-safe
- **JWT** - Autenticação
- **Zod** - Validação de schemas
- **bcrypt** - Hash de senhas

### Frontend

- **Next.js** 16.x (App Router)
- **React** 19.x
- **TypeScript** 5.x
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **next-intl** - Internacionalização (pt-BR)

### DevOps

- **Docker** - Container PostgreSQL
- **Git Hooks** - Validação pre-push
- **ESLint** + **Prettier** - Qualidade de código

## Estrutura do Projeto

```
titans-tech/
├── apps/
│   ├── backend/          # API NestJS (porta 3001)
│   └── dashboard/        # Frontend Next.js (porta 3000)
├── packages/
│   ├── database/         # Schema Prisma e migrations
│   ├── shared/           # Types, DTOs e validações compartilhadas
│   ├── eslint-config/    # Configuração ESLint
│   └── tsconfig/         # Configuração TypeScript
├── scripts/              # Scripts de build e setup
├── .githooks/            # Git hooks customizados
└── docs/                 # Documentação detalhada
```

## Quick Start

### Pré-requisitos

- Node.js 18+
- npm 10.9.2+
- Docker e Docker Compose
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/your-org/titans-tech.git
cd titans-tech

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp packages/database/.env.example packages/database/.env
cp apps/backend/.env.example apps/backend/.env
cp apps/dashboard/.env.example apps/dashboard/.env

# 4. Inicie o PostgreSQL
npm run docker:up

# 5. Configure o banco de dados
npm run db:setup

# 6. Inicie os servidores de desenvolvimento
npm run dev
```

Acesse:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Prisma Studio: `npm run db:studio`

## Documentação

- [Guia de Instalação Completo](docs/INSTALLATION.md)
- [Arquitetura do Sistema](docs/ARCHITECTURE.md)
- [Documentação da API](docs/API.md)
- [Guia de Desenvolvimento](docs/DEVELOPMENT.md)
- [Sistema de Permissões](docs/PERMISSIONS.md)
- [Sistema de Alertas](docs/ALERTS.md)

## Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev              # Inicia todos os apps em modo watch
npm run build           # Build de produção
npm run lint            # Lint de código
npm run format          # Formata código com Prettier
```

### Banco de Dados

```bash
npm run db:setup        # Setup completo (docker + migrations + seed)
npm run db:reset        # Reset e reseed
npm run db:push         # Sincroniza schema com DB
npm run db:generate     # Regenera Prisma Client
npm run db:migrate      # Executa migrations
npm run db:studio       # Abre Prisma Studio UI
```

### Docker

```bash
npm run docker:up       # Inicia PostgreSQL
npm run docker:down     # Para PostgreSQL
npm run docker:logs     # Logs do PostgreSQL
```

### Testes e2e

Para e2e, a gente precisa rodar o frontend buildado,
use o watch mode para conseguir fazer alterações no frontend sem precisar rebuildar manualmente toda hora.
Terminal 1 (root): `npx turbo run dev --filter=@titans-tech/backend`
Terminal 2 (apps/dashboard): `npm run build:watch`

## Segurança

- Autenticação JWT com tokens de 7 dias
- Senhas hasheadas com bcrypt
- Permissões granulares por filial
- Guards globais no backend
- Validação de dados com Zod
- Proteção CSRF via cookies httpOnly

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Equipe

Desenvolvido por [Titans Tech Team]

Feito com dedicação pela equipe Titans Tech
