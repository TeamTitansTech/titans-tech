# Arquitetura do Sistema - Titans Tech

Este documento descreve a arquitetura completa do sistema Titans Tech, incluindo decisões de design, padrões utilizados e fluxos de dados.

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura do Monorepo](#estrutura-do-monorepo)
- [Backend (NestJS)](#backend-nestjs)
- [Frontend (Next.js)](#frontend-nextjs)
- [Banco de Dados (Prisma)](#banco-de-dados-prisma)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Fluxos de Dados](#fluxos-de-dados)
- [Decisões de Design](#decisões-de-design)

## Visão Geral

### Arquitetura High-Level

```
┌─────────────────────────────────────────────────────────────┐
│                         Cliente (Browser)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend (Next.js - Port 3000)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ App Router │ React 19 │ Tailwind │ Context API       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JWT)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (NestJS - Port 3001)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers │ Services │ Guards │ Pipes │ Filters    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Database (PostgreSQL - Port 5432)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Companies │ Branches │ Users │ Machines │ Services   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  Shared Package  │
                    │  Types │ DTOs    │
                    └──────────────────┘
```

### Stack Tecnológico

| Camada       | Tecnologia      | Versão | Propósito                          |
| ------------ | --------------- | ------ | ---------------------------------- |
| Monorepo     | Turborepo       | 2.6.1  | Build system e caching             |
| Backend      | NestJS          | 10.x   | Framework API                      |
| Frontend     | Next.js         | 16.x   | Framework React com SSR            |
| Database     | PostgreSQL      | 15.x   | Banco de dados relacional          |
| ORM          | Prisma          | 6.x    | Type-safe database client          |
| Auth         | JWT             | -      | Autenticação stateless             |
| Validation   | Zod             | 3.x    | Runtime schema validation          |
| UI           | Radix UI        | -      | Componentes acessíveis headless    |
| Styling      | Tailwind CSS    | 3.x    | Utility-first CSS                  |
| i18n         | next-intl       | -      | Internacionalização                |
| Package Mgr  | npm             | 10.9.2 | Gerenciador de pacotes             |

## Estrutura do Monorepo

### Visão Geral de Workspaces

```
titans-tech/
├── apps/                           # Aplicações
│   ├── backend/                    # API NestJS
│   │   ├── src/
│   │   │   ├── main.ts            # Bootstrap da aplicação
│   │   │   ├── app.module.ts      # Módulo raiz
│   │   │   ├── modules/           # Módulos de features
│   │   │   │   ├── auth/          # Autenticação
│   │   │   │   ├── sysadmin/      # SysAdmin
│   │   │   │   ├── users/         # Usuários
│   │   │   │   ├── companies/     # Empresas
│   │   │   │   ├── company-branches/  # Filiais
│   │   │   │   ├── blueprints/    # Blueprints
│   │   │   │   ├── machines/      # Máquinas
│   │   │   │   ├── services/      # Serviços
│   │   │   │   └── alerts/        # Sistema de alertas
│   │   │   ├── config/            # Configurações
│   │   │   ├── errors/            # Error handling
│   │   │   └── types/             # Type definitions
│   │   ├── test/                  # Testes E2E
│   │   └── package.json
│   │
│   └── dashboard/                  # Frontend Next.js
│       ├── src/
│       │   ├── app/               # App Router
│       │   │   ├── layout.tsx     # Root layout
│       │   │   ├── page.tsx       # Home page
│       │   │   └── [locale]/      # i18n routes
│       │   │       └── admin/     # Admin pages
│       │   ├── components/        # React components
│       │   │   ├── ui/            # UI primitives
│       │   │   ├── forms/         # Form components
│       │   │   └── alerts/        # Alert components
│       │   ├── contexts/          # React contexts
│       │   │   ├── AuthContext.tsx
│       │   │   ├── SysAdminContext.tsx
│       │   │   └── CompanyUserContext.tsx
│       │   ├── data/              # Data fetching
│       │   ├── lib/               # Utilities
│       │   └── types/             # Type definitions
│       └── package.json
│
├── packages/                       # Pacotes compartilhados
│   ├── database/                   # Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Schema do banco
│   │   │   ├── migrations/        # Histórico de migrations
│   │   │   └── seed.ts            # Seed data
│   │   ├── generated/             # Prisma Client gerado
│   │   └── package.json
│   │
│   ├── shared/                     # Types e DTOs compartilhados
│   │   ├── backend-dtos/
│   │   │   ├── requests-dto/      # Request DTOs
│   │   │   └── responses-dto/     # Response DTOs
│   │   ├── types/                 # Type definitions
│   │   └── index.ts
│   │
│   ├── eslint-config/              # Configuração ESLint
│   └── tsconfig/                   # Configuração TypeScript
│
├── scripts/                        # Scripts utilitários
├── .githooks/                      # Git hooks
└── turbo.json                      # Configuração Turborepo
```

### Gerenciamento de Dependências

Utilizamos **npm workspaces** para gerenciar o monorepo:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

**Benefícios**:
- Dependências compartilhadas são hoisted para raiz
- Pacotes internos usam scoped names: `@titans-tech/<name>`
- Single `package-lock.json` para todo o monorepo
- `npm install` na raiz instala tudo

**Referências entre pacotes**:

```json
{
  "dependencies": {
    "@titans-tech/database": "*",
    "@titans-tech/shared": "*"
  }
}
```

O `*` garante que sempre usa a versão local do workspace.

### Turborepo Pipeline

Definido em `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["@titans-tech/database#db:generate", "^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["@titans-tech/database#db:generate"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

**Explicação**:
- `build` depende de `db:generate` executar primeiro
- `^build` significa "build de todas as dependências"
- `dev` nunca usa cache (modo watch)
- Outputs são cacheados para builds incrementais

## Backend (NestJS)

### Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│           HTTP Request                  │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Middlewares                     │
│  • CORS                                 │
│  • Body Parser                          │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Global Guards                   │
│  • AuthGuard (JWT validation)           │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Route Handler                   │
│  • @Public()                            │
│  • @Authenticated()                     │
│  • @Admin()                             │
│  • @CompanyAdmin()                      │
│  • @BranchPermission()                  │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Validation Pipes                │
│  • ZodValidationPipe                    │
│  • Built-in ValidationPipe              │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Controller                      │
│  • Routing                              │
│  • Request/Response handling            │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Service                         │
│  • Business logic                       │
│  • Database operations (via Prisma)     │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         Prisma Client                   │
│  • Type-safe queries                    │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│         PostgreSQL                      │
└─────────────────────────────────────────┘
```

### Módulos Principais

#### 1. AuthModule (Global)

**Responsabilidades**:
- Configuração JWT
- AuthGuard global
- Decoradores de autorização

**Código Chave** (`src/modules/auth/auth.guard.ts:1-250`):

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Verifica @Public() decorator
    if (isPublic) return true;

    // 2. Extrai e valida JWT
    const token = extractTokenFromHeader(request);
    const payload = await this.jwtService.verifyAsync(token);

    // 3. Valida usuário existe no DB
    const user = await this.validateUser(payload);

    // 4. Popula request.user
    request.user = user;

    // 5. Verifica permissões (@Admin, @CompanyAdmin, etc.)
    if (requiresAdmin && !user.isSysAdmin) {
      throw new ForbiddenException();
    }

    // 6. Verifica permissões de branch (se rota tem :branchId)
    if (branchId) {
      await this.validateBranchPermissions(user, branchId, permission);
    }

    return true;
  }
}
```

**Decoradores Disponíveis**:

```typescript
@Public()                                    // Sem autenticação
@Authenticated()                             // Qualquer usuário autenticado
@Admin()                                     // Apenas SysAdmin
@CompanyAdmin()                              // Admin da empresa
@CompanyManager()                            // Manager ou Admin da empresa
@BranchPermission('readMachines')            // Permissão específica
```

#### 2. Módulos de Features

Cada feature segue o padrão NestJS:

```
blueprints/
├── blueprints.module.ts       # Módulo
├── blueprints.controller.ts   # Rotas HTTP
├── blueprints.service.ts      # Lógica de negócio
└── dto/                       # DTOs e validação
    ├── create-blueprint.dto.ts
    └── update-blueprint.dto.ts
```

**Exemplo de Controller**:

```typescript
@Controller('blueprints')
export class BlueprintsController {
  constructor(private readonly blueprintsService: BlueprintsService) {}

  @Post()
  @Admin()  // Apenas SysAdmin pode criar blueprints
  create(@Body() dto: CreateBlueprintDto) {
    return this.blueprintsService.create(dto);
  }

  @Get()
  @Authenticated()  // Qualquer usuário autenticado
  findAll() {
    return this.blueprintsService.findAll();
  }

  @Get(':id')
  @Authenticated()
  findOne(@Param('id') id: string) {
    return this.blueprintsService.findOne(id);
  }
}
```

**Exemplo de Service**:

```typescript
@Injectable()
export class BlueprintsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBlueprintDto) {
    return this.prisma.blueprint.create({
      data: {
        name: dto.name,
        fields: dto.fields,
        sections: dto.sections,
      },
    });
  }

  async findAll() {
    return this.prisma.blueprint.findMany({
      where: { deletedAt: null },  // Soft delete
    });
  }
}
```

### Validação com Zod

**Custom Pipe** (`src/errors/zod-validation.pipe.ts`):

```typescript
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  }
}
```

**Uso em Controllers**:

```typescript
@Post()
create(
  @Body(new ZodValidationPipe(CreateBlueprintSchema))
  dto: CreateBlueprintDto
) {
  return this.service.create(dto);
}
```

### Error Handling

**Global Exception Filter** (`src/errors/error.filter.ts`):

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      // Erros HTTP conhecidos
      response.status(exception.getStatus()).json(exception.getResponse());
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Erros Prisma (unique constraint, etc.)
      response.status(400).json({
        statusCode: 400,
        message: 'Database error',
        error: exception.message,
      });
    } else {
      // Erros desconhecidos
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
```

## Frontend (Next.js)

### App Router Structure

```
app/
├── layout.tsx                    # Root layout (providers)
├── page.tsx                      # Home page
├── [locale]/                     # i18n wrapper
│   ├── layout.tsx               # Locale layout
│   └── admin/                    # Admin routes
│       ├── dashboard/            # Dashboard
│       ├── machines/             # Máquinas
│       │   ├── page.tsx         # Lista de máquinas
│       │   └── [id]/            # Detalhes da máquina
│       │       ├── page.tsx     # Overview
│       │       └── sections/    # Seções de serviço
│       │           └── [sectionSlug]/
│       │               └── page.tsx
│       ├── blueprints/           # Blueprints
│       ├── settings/             # Configurações
│       └── users/                # Usuários
```

### Provider Hierarchy

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>
            <SysAdminProvider>
              <CompanyUserProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </CompanyUserProvider>
            </SysAdminProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Ordem de Providers**:
1. **ThemeProvider** - Gerencia tema dark/light
2. **NextIntlClientProvider** - Internacionalização
3. **SysAdminProvider** - Context para SysAdmin
4. **CompanyUserProvider** - Context para usuários de empresa
5. **AuthProvider** - Orquestra autenticação

### Contextos de Autenticação

#### AuthContext (Orquestrador)

```typescript
// src/contexts/AuthContext.tsx
export function AuthProvider({ children }) {
  const { sysAdmin } = useSysAdmin();
  const { companyUser } = useCompanyUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const isSysPanel = cookies.get('is_sys_panel') === 'true';

      if (isSysPanel) {
        await loadSysAdmin();  // Chama /auth/admin/me
      } else {
        await loadCompanyUser();  // Chama /users/me
      }

      setIsLoading(false);
    }

    loadUser();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
```

#### SysAdminContext

```typescript
export function SysAdminProvider({ children }) {
  const [sysAdmin, setSysAdmin] = useState<SysAdmin | null>(null);

  const loadSysAdmin = async () => {
    const response = await fetch('/auth/admin/me', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (response.ok) {
      const data = await response.json();
      setSysAdmin(data);
    }
  };

  return (
    <SysAdminContext.Provider value={{ sysAdmin, setSysAdmin, loadSysAdmin }}>
      {children}
    </SysAdminContext.Provider>
  );
}

// Hook para consumir
export function useSysAdmin() {
  const context = useContext(SysAdminContext);
  if (!context) {
    throw new Error('useSysAdmin must be used within SysAdminProvider');
  }
  return context;
}
```

### Data Fetching

**Helper centralizado** (`src/data/helpers/responseHandler.ts`):

```typescript
export async function responseHandler<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const token = cookies.get('access_token');

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado - redireciona para login
      cookies.remove('access_token');
      window.location.href = '/login';
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
```

**Uso em componentes**:

```typescript
// Server Component
async function MachinesPage() {
  const machines = await responseHandler<Machine[]>('/machines');

  return <MachinesList machines={machines} />;
}

// Client Component
function MachineForm() {
  async function handleSubmit(data: MachineDto) {
    await responseHandler('/machines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Componentes UI

Utilizamos **Radix UI** + **Tailwind CSS** + **CVA**:

```tsx
// components/ui/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Uso**:

```tsx
<Button variant="destructive" size="lg">
  Delete
</Button>
```

## Banco de Dados (Prisma)

### Schema Principal

Localização: `packages/database/prisma/schema.prisma`

**Principais Entidades**:

```prisma
// Administrador do Sistema
model SysAdmin {
  id                      String   @id @default(cuid())
  email                   String   @unique
  password                String
  name                    String
  isUsingDefaultPassword  Boolean  @default(true)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

// Empresa
model Company {
  id          String          @id @default(cuid())
  name        String          @unique
  logo        String?
  brandColor  String?
  description String?
  branches    CompanyBranch[]
  users       User[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

// Filial da Empresa
model CompanyBranch {
  id           String        @id @default(cuid())
  name         String
  isMainBranch Boolean       @default(false)
  location     String?
  companyId    String
  company      Company       @relation(fields: [companyId], references: [id])
  userBranches UserBranch[]
  machines     Machine[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

// Usuário da Empresa
model User {
  id                      String         @id @default(cuid())
  email                   String         @unique
  password                String
  name                    String
  companyId               String
  company                 Company        @relation(fields: [companyId], references: [id])
  isCompanyAdmin          Boolean        @default(false)
  isCompanyManager        Boolean        @default(false)
  isUsingDefaultPassword  Boolean        @default(true)
  userBranches            UserBranch[]
  servicesPerformed       MachineService[]
  createdAt               DateTime       @default(now())
  updatedAt               DateTime       @updatedAt
}

// Permissões do Usuário em uma Filial (Junction Table)
model UserBranch {
  id       String        @id @default(cuid())
  userId   String
  user     User          @relation(fields: [userId], references: [id])
  branchId String
  branch   CompanyBranch @relation(fields: [branchId], references: [id])

  // 24 permissões granulares
  readUsers    Boolean @default(false)
  createUsers  Boolean @default(false)
  updateUsers  Boolean @default(false)
  deleteUsers  Boolean @default(false)
  // ... mais 20 permissões

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, branchId])
}

// Blueprint (Template de Máquina)
model Blueprint {
  id        String     @id @default(cuid())
  name      String     @unique
  fields    Json       // Campos dinâmicos
  sections  String[]   // Seções habilitadas
  deletedAt DateTime?  // Soft delete
  machines  Machine[]
  threshold ThresholdBearingClearance?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

// Máquina
model Machine {
  id          String          @id @default(cuid())
  name        String
  blueprintId String
  blueprint   Blueprint       @relation(fields: [blueprintId], references: [id])
  branchId    String
  branch      CompanyBranch   @relation(fields: [branchId], references: [id])
  fields      MachineField[]
  services    MachineService[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

// Serviço de Máquina
model MachineService {
  id           String                  @id @default(cuid())
  machineId    String
  machine      Machine                 @relation(fields: [machineId], references: [id])
  date         DateTime
  type         ServiceType             // INSPECTION | MAINTENANCE
  status       ServiceStatus           // PENDING | COMPLETED
  performedBy  String?
  performer    User?                   @relation(fields: [performedBy], references: [id])

  // Relações com dados de seções
  bearingClearance     MachineServiceBearingClearance[]
  slide                MachineServiceSlide[]
  gibs                 MachineServiceGibs[]
  lubricationHydraulic MachineServiceLubricationHydraulics[]
  clutch               MachineServiceClutch[]
  counterbalance       MachineServiceCounterbalanceCylinderAirbag[]

  // Alertas
  alertBearingClearance AlertBearingClearance?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Dados de Folga de Mancais (Normalizado - Fonte da Verdade)
model BearingClearanceData {
  id                              String   @id @default(cuid())

  // Campos com medições RH/LH
  totalClearance_RH               Decimal? @db.Decimal(10, 4)
  totalClearance_LH               Decimal? @db.Decimal(10, 4)
  mainBearings_RH                 Decimal? @db.Decimal(10, 4)
  mainBearings_LH                 Decimal? @db.Decimal(10, 4)
  upperConnectionBearings_RH      Decimal? @db.Decimal(10, 4)
  upperConnectionBearings_LH      Decimal? @db.Decimal(10, 4)
  wristPinToMatingPart_RH         Decimal? @db.Decimal(10, 4)
  wristPinToMatingPart_LH         Decimal? @db.Decimal(10, 4)
  wristPinToBushing_RH            Decimal? @db.Decimal(10, 4)
  wristPinToBushing_LH            Decimal? @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_RH     Decimal? @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_LH     Decimal? @db.Decimal(10, 4)

  // Relação many-to-many com serviços
  services MachineServiceBearingClearance[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Junction Table: Serviço <-> Dados de Mancais
model MachineServiceBearingClearance {
  id            String                  @id @default(cuid())
  serviceId     String
  service       MachineService          @relation(fields: [serviceId], references: [id])

  // Before/After Data
  outerBeforeId String?
  outerBefore   BearingClearanceData?   @relation("outerBefore", fields: [outerBeforeId], references: [id])
  outerDataId   String?
  outerData     BearingClearanceData?   @relation("outerData", fields: [outerDataId], references: [id])
  innerBeforeId String?
  innerBefore   BearingClearanceData?   @relation("innerBefore", fields: [innerBeforeId], references: [id])
  innerDataId   String?
  innerData     BearingClearanceData?   @relation("innerData", fields: [innerDataId], references: [id])

  @@unique([serviceId])
}

// Alertas de Folga de Mancais (Normalizado - Apenas Diferenciais)
model AlertBearingClearance {
  id                                          String         @id @default(cuid())
  serviceId                                   String         @unique
  service                                     MachineService @relation(fields: [serviceId], references: [id])

  // Diferenciais calculados (|RH - LH|)
  totalClearance_differential                 Decimal?       @db.Decimal(10, 4)
  mainBearings_differential                   Decimal?       @db.Decimal(10, 4)
  upperConnectionBearings_differential        Decimal?       @db.Decimal(10, 4)
  wristPinToMatingPart_differential           Decimal?       @db.Decimal(10, 4)
  wristPinToBushing_differential              Decimal?       @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_differential       Decimal?       @db.Decimal(10, 4)

  // Severidades determinadas
  totalClearance_severity                     AlertSeverity?
  mainBearings_severity                       AlertSeverity?
  upperConnectionBearings_severity            AlertSeverity?
  wristPinToMatingPart_severity               AlertSeverity?
  wristPinToBushing_severity                  AlertSeverity?
  slideAdjNutToScrewSleeve_severity           AlertSeverity?

  // Snapshot de thresholds (audit trail)
  thresholdSnapshot Json

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Thresholds de Alertas (por Blueprint)
model ThresholdBearingClearance {
  id          String    @id @default(cuid())
  blueprintId String    @unique
  blueprint   Blueprint @relation(fields: [blueprintId], references: [id])

  // 6 campos × 3 níveis = 18 thresholds
  // Exemplo: totalClearance
  totalClearance_greenMin  Decimal @db.Decimal(10, 4)
  totalClearance_yellowMin Decimal @db.Decimal(10, 4)
  totalClearance_redMin    Decimal @db.Decimal(10, 4)

  // ... repetir para os outros 5 campos

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ServiceType {
  INSPECTION
  MAINTENANCE
}

enum ServiceStatus {
  PENDING
  COMPLETED
}

enum AlertSeverity {
  NONE
  GREEN
  YELLOW
  RED
}
```

### Migrations

Migrations são versionadas e rastreadas:

```bash
# Criar nova migration
npm run db:migrate -- --name add_alerts_system

# Aplicar migrations
npm run db:migrate

# Ver status
npx prisma migrate status

# Reset (desenvolvimento)
npm run db:reset
```

**Histórico de Migrations**: `packages/database/prisma/migrations/`

### Seed Data

Arquivo: `packages/database/prisma/seed.ts`

**Dados criados**:
- 1 SysAdmin padrão
- 1 Empresa (Acme Corporation)
- 2 Filiais (Matriz e Filial Norte)
- 3 Usuários com diferentes roles
- 2 Blueprints (Prensa Hidráulica, Prensa Mecânica)
- 4 Máquinas
- Permissões configuradas

## Autenticação e Autorização

### JWT Flow Completo

```
┌─────────────┐                                  ┌─────────────┐
│   Client    │                                  │   Backend   │
└──────┬──────┘                                  └──────┬──────┘
       │                                                │
       │  1. POST /auth/admin/login                    │
       │    { email, password }                        │
       ├──────────────────────────────────────────────>│
       │                                                │
       │                      2. Valida credenciais    │
       │                         (bcrypt.compare)      │
       │                                                │
       │                      3. Gera JWT               │
       │                         (sign com secret)     │
       │                                                │
       │  4. { accessToken, user }                     │
       │<──────────────────────────────────────────────┤
       │                                                │
       │  5. Armazena token em cookie                  │
       │     (httpOnly, Secure em prod)                │
       │                                                │
       │  6. GET /machines                             │
       │     Authorization: Bearer <token>             │
       ├──────────────────────────────────────────────>│
       │                                                │
       │                      7. AuthGuard:             │
       │                         - Extrai token         │
       │                         - Verifica assinatura  │
       │                         - Busca user no DB     │
       │                         - Popula request.user  │
       │                                                │
       │  8. { machines: [...] }                       │
       │<──────────────────────────────────────────────┤
       │                                                │
```

### JWT Payload Structure

```typescript
// SysAdmin
{
  id: "cuid_do_sysadmin",
  isSysAdmin: true,
  iat: 1234567890,
  exp: 1235172690  // 7 dias depois
}

// Usuário Regular
{
  id: "cuid_do_usuario",
  companyId: "cuid_da_empresa",
  isSysAdmin: false,
  iat: 1234567890,
  exp: 1235172690
}
```

### Sistema de Permissões

**24 Permissões Granulares** (em `UserBranch`):

| Categoria      | Permissões                                        |
| -------------- | ------------------------------------------------- |
| Usuários       | read/create/update/delete/updatePermissions       |
| Filiais        | read/update                                       |
| Blueprints     | read/create/update/delete                         |
| Máquinas       | read/create/update/delete                         |
| Serviços       | read/create/update/delete                         |

**Verificação de Permissões** (AuthGuard):

```typescript
async validateBranchPermissions(
  user: User,
  branchId: string,
  requiredPermission: string
) {
  if (user.isSysAdmin) {
    return true;  // SysAdmin tem acesso total
  }

  const userBranch = await this.prisma.userBranch.findUnique({
    where: {
      userId_branchId: {
        userId: user.id,
        branchId: branchId,
      },
    },
  });

  if (!userBranch) {
    throw new ForbiddenException('User not in this branch');
  }

  if (!userBranch[requiredPermission]) {
    throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
  }

  return true;
}
```

**Uso em Routes**:

```typescript
@Get('branches/:branchId/machines')
@BranchPermission('readMachines')
getMachines(@Param('branchId') branchId: string) {
  // AuthGuard já validou que user tem permissão readMachines nesta branch
  return this.service.findAll(branchId);
}
```

### Hierarquia de Roles

```
SysAdmin (isSysAdmin: true)
├─ Acesso total a todas as empresas
├─ Pode criar/editar blueprints (globais)
├─ Pode criar empresas e filiais
└─ Não precisa de permissões de branch

CompanyAdmin (isCompanyAdmin: true)
├─ Acesso total à sua empresa
├─ Pode gerenciar filiais da empresa
├─ Pode gerenciar usuários da empresa
└─ Pode atribuir permissões

CompanyManager (isCompanyManager: true)
├─ Acesso administrativo limitado
├─ Pode ver relatórios consolidados
└─ Permissões de branch aplicam

User (flags em false)
├─ Acesso baseado em permissões de branch
└─ Precisa de permissão explícita para cada ação
```

## Fluxos de Dados

### 1. Criação de Serviço com Alertas

```
1. Frontend: Usuário preenche formulário de inspeção
   └─ Seção: Bearing Clearance
      ├─ Total Clearance RH: 0.035
      ├─ Total Clearance LH: 0.015
      └─ ... outros campos

2. Frontend: POST /services
   {
     machineId: "...",
     type: "INSPECTION",
     sections: {
       bearingClearance: {
         outerData: {
           totalClearance_RH: 0.035,
           totalClearance_LH: 0.015,
           ...
         }
       }
     }
   }

3. Backend: ServicesController.create()
   └─ Validação Zod
   └─ ServicesService.create()
      ├─ 3.1. Cria MachineService
      ├─ 3.2. Cria BearingClearanceData
      │        └─ Salva RH/LH (fonte da verdade)
      ├─ 3.3. Cria MachineServiceBearingClearance (junction)
      └─ 3.4. Chama AlertsService.generateAlertsForService()

4. Backend: AlertsService.generateAlertsForService()
   ├─ 4.1. Busca ThresholdBearingClearance do blueprint
   ├─ 4.2. Busca BearingClearanceData do serviço
   ├─ 4.3. Calcula diferenciais:
   │        differential = |RH - LH|
   │        Ex: |0.035 - 0.015| = 0.020
   ├─ 4.4. Determina severidade:
   │        if (differential >= redMin) → RED
   │        else if (differential >= yellowMin) → YELLOW
   │        else if (differential >= greenMin) → GREEN
   │        else → NONE
   ├─ 4.5. Cria snapshot de thresholds (audit trail)
   └─ 4.6. Salva AlertBearingClearance
            └─ Apenas differential + severity (normalizado)

5. Backend: Retorna serviço criado com alertas

6. Frontend: Exibe confirmação + alertas detectados
```

### 2. Consulta de Alertas

```
1. Frontend: GET /alerts/bearing-clearance/service/:serviceId

2. Backend: AlertsController.getAlerts()
   └─ AlertsService.getAlertsForService()
      ├─ 2.1. Busca AlertBearingClearance
      │        └─ Include: service.bearingClearance
      ├─ 2.2. Busca BearingClearanceData (RH/LH)
      │        └─ Via service.bearingClearance.outerData
      └─ 2.3. Combina dados:
               {
                 totalClearance_RH: 0.035,        // de BearingClearanceData
                 totalClearance_LH: 0.015,        // de BearingClearanceData
                 totalClearance_differential: 0.020,  // de AlertBearingClearance
                 totalClearance_severity: "YELLOW",   // de AlertBearingClearance
                 thresholdSnapshot: {...}          // de AlertBearingClearance
               }

3. Frontend: Renderiza alertas com cores/ícones por severidade
   ├─ RED: Crítico (ícone vermelho)
   ├─ YELLOW: Alerta (ícone amarelo)
   ├─ GREEN: Atenção (ícone verde)
   └─ NONE: Normal (sem alerta)
```

## Decisões de Design

### 1. Por que Monorepo?

**Benefícios**:
- Compartilhamento de código (tipos, DTOs, validações)
- Build incremental com Turborepo
- Versionamento sincronizado
- Refatorações type-safe entre frontend e backend

**Trade-offs**:
- Complexidade inicial de setup
- Tamanho do repositório maior
- Deploy pode ser mais complexo

### 2. Por que NestJS?

**Benefícios**:
- Arquitetura modular e escalável
- Dependency Injection nativo
- Decorators para metaprogramming (guards, pipes, etc.)
- TypeScript first-class
- Ecosystem maduro (Passport, TypeORM, Prisma)

**Trade-offs**:
- Curva de aprendizado para iniciantes
- Boilerplate inicial maior que Express

### 3. Por que Next.js App Router?

**Benefícios**:
- Server Components (performance)
- Streaming e Suspense nativos
- Layouts aninhados
- File-based routing
- Built-in optimization (images, fonts, etc.)

**Trade-offs**:
- Curva de aprendizado (mudança do Pages Router)
- Algumas libs ainda não compatíveis com Server Components

### 4. Por que Prisma?

**Benefícios**:
- Type-safety completa
- Migrations versionadas
- Schema declarativo e legível
- Excelente DX (autocomplete, introspection)
- Prisma Studio para debug

**Trade-offs**:
- Performance em queries muito complexas (vs SQL raw)
- Tamanho do Prisma Client gerado

### 5. Por que Normalização de Alertas?

**Design Original (Duplicado)**:
- AlertBearingClearance continha RH + LH + differential + severity
- Total: 24 colunas (12 RH + 12 LH)

**Design Atual (Normalizado)**:
- BearingClearanceData = fonte da verdade (RH + LH)
- AlertBearingClearance = apenas calculados (differential + severity)
- Total: 12 colunas no alerta

**Benefícios**:
- 66% redução de tamanho da tabela de alertas
- Zero duplicação de dados
- Single source of truth para medições
- Consistência garantida

**Trade-offs**:
- Query mais complexa (JOIN necessário)
- Latência ~10ms maior (15ms vs 5ms)

**Decisão**: Benefícios superam trade-offs. Performance é aceitável e manutenibilidade melhorou significativamente.

### 6. Por que JWT e não Sessions?

**Benefícios**:
- Stateless (escalabilidade horizontal)
- Não requer armazenamento server-side
- Pode incluir claims customizados
- Funciona bem com múltiplos serviços

**Trade-offs**:
- Não pode revogar tokens (até expirar)
- Tamanho maior em headers
- Precisa refresh token strategy (não implementado ainda)

## Próximos Passos

- [Documentação da API](API.md)
- [Guia de Desenvolvimento](DEVELOPMENT.md)
- [Sistema de Permissões Detalhado](PERMISSIONS.md)
- [Sistema de Alertas Detalhado](ALERTS.md)
