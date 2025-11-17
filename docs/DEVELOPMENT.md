# Guia de Desenvolvimento - Titans Tech

Guia prático para desenvolver no projeto Titans Tech.

## Índice

- [Setup do Ambiente](#setup-do-ambiente)
- [Comandos Úteis](#comandos-úteis)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Adicionando Novas Features](#adicionando-novas-features)
- [Trabalhando com o Banco de Dados](#trabalhando-com-o-banco-de-dados)
- [Debugging](#debugging)
- [Performance](#performance)
- [Segurança](#segurança)
- [Deploy](#deploy)

## Setup do Ambiente

### Ferramentas Recomendadas

#### IDE: Visual Studio Code

**Extensões Essenciais**:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

**Settings (`.vscode/settings.json`)**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Terminal

**Zsh com Oh My Zsh** (opcional mas recomendado):
```bash
# Aliases úteis
alias tt-dev="npm run dev"
alias tt-build="npm run build"
alias tt-db="npm run db:studio"
alias tt-reset="npm run db:reset"
```

### Variáveis de Ambiente

Crie arquivos `.env.local` para overrides locais (não commitados):

```bash
# apps/backend/.env.local
PORT=3002  # Se 3001 estiver em uso
NODE_ENV=development
DEBUG=true
```

## Comandos Úteis

### Monorepo

```bash
# Instalar dependências
npm install

# Limpar cache do Turbo
npx turbo clean

# Build de todos os pacotes
npm run build

# Lint de tudo
npm run lint

# Format com Prettier
npm run format
```

### Backend

```bash
# Desenvolvimento
cd apps/backend
npm run dev                # Watch mode
npm run start             # Production mode
npm run start:debug       # Debug mode

# Build
npm run build

# Lint
npm run lint
npm run lint:fix

# Tests
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage
npm run test:e2e          # E2E tests
```

### Frontend

```bash
# Desenvolvimento
cd apps/dashboard
npm run dev               # Development server
npm run build             # Production build
npm run start             # Start production server
npm run lint              # ESLint
```

### Database

```bash
# Prisma Studio (GUI)
npm run db:studio

# Migrations
npm run db:migrate                    # Apply migrations
npm run db:migrate -- --name <name>   # Create new migration
npm run db:migrate:reset              # Reset migrations

# Sync & Seed
npm run db:push                       # Push schema (dev only)
npm run db:generate                   # Generate Prisma Client
npm run db:seed                       # Seed database
npm run db:reset                      # Reset + Seed

# Utilities
npm run db:create-sys-admin           # Create SysAdmin
npm run db:create-test-user           # Create test user
```

### Docker

```bash
# PostgreSQL
npm run docker:up         # Start
npm run docker:down       # Stop
npm run docker:logs       # View logs
npm run docker:logs -- -f # Follow logs

# Cleanup
docker-compose down -v    # Remove volumes
docker system prune       # Clean unused data
```

## Estrutura de Diretórios

### Backend Module Structure

```
src/modules/machines/
├── dto/
│   ├── create-machine.dto.ts      # Request DTO
│   ├── update-machine.dto.ts      # Update DTO
│   └── machine-response.dto.ts    # Response DTO
├── schemas/
│   └── machine.schema.ts          # Zod schemas
├── machines.controller.ts         # HTTP routes
├── machines.service.ts            # Business logic
├── machines.module.ts             # Module definition
└── machines.service.spec.ts       # Unit tests
```

### Frontend Component Structure

```
src/components/machines/
├── machine-card.tsx               # Component
├── machine-form.tsx               # Form component
├── machine-list.tsx               # List component
└── index.ts                       # Barrel export
```

## Adicionando Novas Features

### 1. Backend: Nova Entidade

#### Passo 1: Schema Prisma

```prisma
// packages/database/prisma/schema.prisma
model Equipment {
  id          String   @id @default(cuid())
  name        String
  serialNumber String  @unique
  machineId   String
  machine     Machine  @relation(fields: [machineId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Passo 2: Migration

```bash
npm run db:migrate -- --name add_equipment_table
npm run db:generate
```

#### Passo 3: DTOs e Schemas

```typescript
// apps/backend/src/modules/equipment/schemas/equipment.schema.ts
import { z } from 'zod';

export const CreateEquipmentSchema = z.object({
  name: z.string().min(2).max(100),
  serialNumber: z.string().min(5).max(50),
  machineId: z.string().cuid(),
});

export type CreateEquipmentDto = z.infer<typeof CreateEquipmentSchema>;
```

#### Passo 4: Service

```typescript
// apps/backend/src/modules/equipment/equipment.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateEquipmentDto } from './schemas/equipment.schema';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEquipmentDto) {
    return this.prisma.equipment.create({
      data: dto,
      include: {
        machine: true,
      },
    });
  }

  async findAll(machineId?: string) {
    return this.prisma.equipment.findMany({
      where: machineId ? { machineId } : undefined,
      include: {
        machine: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
```

#### Passo 5: Controller

```typescript
// apps/backend/src/modules/equipment/equipment.controller.ts
import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { CreateEquipmentSchema, CreateEquipmentDto } from './schemas/equipment.schema';
import { Authenticated, BranchPermission } from '../auth/auth.decorators';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @BranchPermission('createMachines')  // Reutilizar permissão existente
  create(
    @Body(new ZodValidationPipe(CreateEquipmentSchema)) dto: CreateEquipmentDto
  ) {
    return this.equipmentService.create(dto);
  }

  @Get()
  @Authenticated()
  findAll(@Query('machineId') machineId?: string) {
    return this.equipmentService.findAll(machineId);
  }

  @Get(':id')
  @Authenticated()
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }
}
```

#### Passo 6: Module

```typescript
// apps/backend/src/modules/equipment/equipment.module.ts
import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [EquipmentController],
  providers: [EquipmentService],
})
export class EquipmentModule {}
```

#### Passo 7: Registrar no App Module

```typescript
// apps/backend/src/app.module.ts
import { EquipmentModule } from './modules/equipment/equipment.module';

@Module({
  imports: [
    // ... outros módulos
    EquipmentModule,
  ],
})
export class AppModule {}
```

### 2. Frontend: Nova Página

#### Passo 1: Criar Rota

```tsx
// apps/dashboard/src/app/[locale]/admin/equipment/page.tsx
import { EquipmentList } from '@/components/equipment/equipment-list';

export default async function EquipmentPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Equipamentos</h1>
      <EquipmentList />
    </div>
  );
}
```

#### Passo 2: Criar Componentes

```tsx
// apps/dashboard/src/components/equipment/equipment-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { responseHandler } from '@/data/helpers/responseHandler';
import { Equipment } from '@titans-tech/database';
import { EquipmentCard } from './equipment-card';

export function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const data = await responseHandler<Equipment[]>('/equipment');
        setEquipment(data);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {equipment.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  );
}
```

#### Passo 3: Adicionar ao Menu

```tsx
// apps/dashboard/src/components/layout/sidebar.tsx
const menuItems = [
  // ... outros itens
  {
    label: 'Equipamentos',
    href: '/admin/equipment',
    icon: <WrenchIcon />,
  },
];
```

## Trabalhando com o Banco de Dados

### Criando Migrations

```bash
# 1. Edite schema.prisma
# 2. Crie migration
npm run db:migrate -- --name add_new_field

# 3. Revise a migration gerada
cat packages/database/prisma/migrations/*/migration.sql

# 4. Apply
npm run db:migrate
```

### Seedling Data

```typescript
// packages/database/prisma/seed.ts
async function seedEquipment(prisma: PrismaClient) {
  const machines = await prisma.machine.findMany();

  for (const machine of machines) {
    await prisma.equipment.create({
      data: {
        name: `Equipment for ${machine.name}`,
        serialNumber: `SN-${Math.random().toString(36).substr(2, 9)}`,
        machineId: machine.id,
      },
    });
  }

  console.log('✅ Equipment seeded');
}

async function main() {
  // ... outras seeds
  await seedEquipment(prisma);
}
```

### Queries Complexas

```typescript
// Exemplo: Buscar máquinas com alertas críticos
const machinesWithCriticalAlerts = await prisma.machine.findMany({
  where: {
    services: {
      some: {
        alertBearingClearance: {
          OR: [
            { totalClearance_severity: 'RED' },
            { mainBearings_severity: 'RED' },
            { upperConnectionBearings_severity: 'RED' },
          ],
        },
      },
    },
  },
  include: {
    services: {
      where: {
        alertBearingClearance: {
          isNot: null,
        },
      },
      include: {
        alertBearingClearance: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 1,
    },
  },
});
```

### Transactions

```typescript
async updateMachineWithHistory(machineId: string, updateData: any) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Criar histórico
    const history = await tx.machineHistory.create({
      data: {
        machineId,
        changes: updateData,
        timestamp: new Date(),
      },
    });

    // 2. Atualizar máquina
    const machine = await tx.machine.update({
      where: { id: machineId },
      data: updateData,
    });

    return { machine, history };
  });
}
```

## Debugging

### Backend (NestJS)

#### VS Code Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/apps/backend",
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Logging

```typescript
// Use built-in Logger
import { Logger } from '@nestjs/common';

@Injectable()
export class MachinesService {
  private readonly logger = new Logger(MachinesService.name);

  async create(dto: CreateMachineDto) {
    this.logger.log(`Creating machine: ${dto.name}`);

    try {
      const result = await this.prisma.machine.create({ data: dto });
      this.logger.log(`Machine created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create machine: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Frontend (Next.js)

#### React DevTools

Instale a extensão: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)

#### Console Logging

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('[MachineForm] Submitting data:', data);
}

// Use debugger
function handleSubmit(data: MachineDto) {
  debugger;  // Breakpoint aqui
  submitData(data);
}
```

#### Network Inspection

Use Chrome DevTools Network tab para inspecionar requests:
- Headers (Authorization token?)
- Payload (dados corretos?)
- Response (status code, body)

## Performance

### Backend

#### Database Optimization

```typescript
// ❌ N+1 Query Problem
const machines = await prisma.machine.findMany();
for (const machine of machines) {
  machine.services = await prisma.machineService.findMany({
    where: { machineId: machine.id },
  });
}

// ✅ Use include/select
const machines = await prisma.machine.findMany({
  include: {
    services: {
      orderBy: { date: 'desc' },
      take: 10,
    },
  },
});
```

#### Caching (Futuro)

```typescript
// Exemplo com cache-manager
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MachinesService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService
  ) {}

  async findAll() {
    const cacheKey = 'machines:all';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const machines = await this.prisma.machine.findMany();
    await this.cacheManager.set(cacheKey, machines, 300); // 5 min TTL

    return machines;
  }
}
```

### Frontend

#### Code Splitting

```tsx
// Lazy load componentes pesados
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false,
});
```

#### Memoization

```tsx
import { useMemo, useCallback } from 'react';

function MachineList({ machines }) {
  // Memoize computações caras
  const sortedMachines = useMemo(() => {
    return machines.sort((a, b) => a.name.localeCompare(b.name));
  }, [machines]);

  // Memoize callbacks
  const handleSelect = useCallback((id: string) => {
    console.log('Selected:', id);
  }, []);

  return (
    <>
      {sortedMachines.map((machine) => (
        <MachineCard key={machine.id} machine={machine} onSelect={handleSelect} />
      ))}
    </>
  );
}
```

## Segurança

### Backend

#### Validação de Input

```typescript
// Sempre valide com Zod
const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  // Sanitize HTML
  description: z.string().transform((val) => sanitizeHtml(val)),
});
```

#### SQL Injection

```typescript
// ✅ Prisma protege automaticamente
await prisma.user.findFirst({
  where: { email: userInput },  // Safe
});

// ❌ Nunca use raw queries com input do usuário
await prisma.$executeRaw`SELECT * FROM users WHERE email = ${userInput}`;  // Unsafe!

// ✅ Se precisar de raw query, use prepared statements
await prisma.$executeRaw`SELECT * FROM users WHERE email = ${Prisma.sql([userInput])}`;
```

#### Rate Limiting (Futuro)

```typescript
// Exemplo com @nestjs/throttler
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post('login')
  @Throttle(5, 60)  // 5 requests por 60 segundos
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

### Frontend

#### XSS Prevention

```tsx
// ✅ React escapa automaticamente
<div>{userInput}</div>

// ❌ Evite dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Se necessário, sanitize primeiro
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

#### CSRF Protection

```typescript
// Cookies httpOnly + sameSite
cookies.set('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
});
```

## Deploy

### Backend (NestJS)

```bash
# Build
npm run build

# Start production
NODE_ENV=production npm run start:prod
```

**Variáveis de Ambiente Produção**:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@prod-host:5432/titans_tech
AUTH_JWT_SECRET=<secure-random-string>
```

### Frontend (Next.js)

```bash
# Build
npm run build

# Start production
npm run start
```

**Variáveis de Ambiente Produção**:
```env
NEXT_PUBLIC_API_URL=https://api.titanstech.com
AUTH_JWT_SECRET=<same-as-backend>
```

### Docker (Futuro)

```dockerfile
# Exemplo Dockerfile para backend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## Recursos Adicionais

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Zod Docs](https://zod.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Troubleshooting

### "Cannot find module '@titans-tech/database'"

```bash
npm run db:generate
```

### "Port 3001 already in use"

```bash
lsof -ti:3001 | xargs kill -9
```

### "Prisma Client out of sync"

```bash
npm run db:generate
npm run build
```

### "Migration failed"

```bash
npm run db:reset
```

### Frontend não se conecta ao Backend

1. Verifique `NEXT_PUBLIC_API_URL` em `.env`
2. Verifique CORS no backend (deve permitir `localhost:3000`)
3. Verifique se backend está rodando (`curl http://localhost:3001`)

---

Pronto para desenvolver! 🚀
