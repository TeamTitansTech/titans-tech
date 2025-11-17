# Sistema de Permissões - Titans Tech

Documentação completa do sistema de permissões granulares do Titans Tech.

## Índice

- [Visão Geral](#visão-geral)
- [Hierarquia de Roles](#hierarquia-de-roles)
- [Permissões Granulares](#permissões-granulares)
- [Modelo de Dados](#modelo-de-dados)
- [Implementação Backend](#implementação-backend)
- [Implementação Frontend](#implementação-frontend)
- [Casos de Uso](#casos-de-uso)
- [Boas Práticas](#boas-práticas)

## Visão Geral

O Titans Tech implementa um sistema de permissões em **três níveis**:

1. **Nível Global**: SysAdmin (acesso total ao sistema)
2. **Nível Empresa**: CompanyAdmin e CompanyManager (acesso à empresa)
3. **Nível Filial**: Permissões granulares por usuário/filial (UserBranch)

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        SysAdmin                             │
│  • Acesso total                                             │
│  • Gerencia todas as empresas                               │
│  • Cria blueprints globais                                  │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
┌───────────────────┐              ┌───────────────────┐
│   CompanyAdmin    │              │  CompanyManager   │
│  • Empresa Acme   │              │  • Empresa Acme   │
│  • Todas filiais  │              │  • Algumas filiais│
└───────────────────┘              └───────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           ▼
        ┌──────────────────────────────────────┐
        │         User (Regular)                │
        │  • Filial A: 12 permissões            │
        │  • Filial B: 8 permissões             │
        └──────────────────────────────────────┘
```

## Hierarquia de Roles

### 1. SysAdmin (Sistema)

**Características**:

- Entidade separada (`SysAdmin` table)
- Flag `isSysAdmin: true` no JWT
- Acesso irrestrito a todas as funcionalidades
- **NÃO** pertence a nenhuma empresa

**Permissões**:

- ✅ Criar/editar/deletar empresas
- ✅ Criar/editar/deletar blueprints (globais)
- ✅ Criar/editar/deletar filiais
- ✅ Criar/editar/deletar usuários de qualquer empresa
- ✅ Ver/editar dados de todas as empresas
- ✅ Configurar thresholds de alertas

**JWT Payload**:

```json
{
  "id": "sysadmin-cuid",
  "isSysAdmin": true
}
```

### 2. CompanyAdmin (Empresa)

**Características**:

- Entidade `User` com flag `isCompanyAdmin: true`
- Pertence a uma empresa (`companyId`)
- Acesso total à sua empresa e filiais

**Permissões**:

- ✅ Gerenciar filiais da empresa
- ✅ Criar/editar/deletar usuários da empresa
- ✅ Atribuir permissões a usuários
- ✅ Ver/editar máquinas de todas as filiais
- ✅ Ver/editar serviços de todas as filiais
- ❌ Criar/editar blueprints (apenas SysAdmin)
- ❌ Acessar outras empresas

**JWT Payload**:

```json
{
  "id": "user-cuid",
  "companyId": "company-cuid",
  "isSysAdmin": false
}
```

### 3. CompanyManager (Empresa)

**Características**:

- Entidade `User` com flag `isCompanyManager: true`
- Acesso administrativo limitado
- Pode ver relatórios consolidados
- Permissões de filial ainda aplicam

**Permissões**:

- ✅ Ver dados de todas as filiais (read-only em geral)
- ✅ Gerar relatórios consolidados
- ⚠️ Outras ações dependem de permissões de filial
- ❌ Gerenciar usuários (apenas se tiver permissão na filial)

### 4. User (Regular)

**Características**:

- Entidade `User` sem flags especiais
- Acesso baseado **exclusivamente** em permissões de filial
- Precisa estar associado a filiais via `UserBranch`

**Permissões**:

- ⚠️ Definidas por filial na tabela `UserBranch`
- ❌ Sem acesso se não tiver `UserBranch` em nenhuma filial

## Permissões Granulares

### 24 Permissões na Tabela UserBranch

Cada usuário pode ter permissões específicas **por filial**:

#### 1. Usuários (6 permissões)

| Permissão                | Descrição                                  |
| ------------------------ | ------------------------------------------ |
| `readUsers`              | Ver lista de usuários da filial            |
| `createUsers`            | Criar novos usuários na empresa            |
| `updateUsers`            | Editar dados de usuários                   |
| `deleteUsers`            | Remover usuários                           |
| `updatePermissionsUsers` | Alterar permissões de outros usuários      |
| `manageUsers`            | Permissão administrativa geral de usuários |

#### 2. Filiais (2 permissões)

| Permissão        | Descrição                   |
| ---------------- | --------------------------- |
| `readBranches`   | Ver informações das filiais |
| `updateBranches` | Editar dados das filiais    |

#### 3. Blueprints (4 permissões)

| Permissão          | Descrição                                      |
| ------------------ | ---------------------------------------------- |
| `readBlueprints`   | Ver blueprints disponíveis                     |
| `createBlueprints` | Criar novos blueprints (apenas SysAdmin)       |
| `updateBlueprints` | Editar blueprints existentes (apenas SysAdmin) |
| `deleteBlueprints` | Deletar blueprints (apenas SysAdmin)           |

**Nota**: Blueprints são globais, então essas permissões servem mais para futuras features de blueprints privados.

#### 4. Máquinas (4 permissões)

| Permissão        | Descrição                       |
| ---------------- | ------------------------------- |
| `readMachines`   | Ver lista de máquinas da filial |
| `createMachines` | Cadastrar novas máquinas        |
| `updateMachines` | Editar dados de máquinas        |
| `deleteMachines` | Remover máquinas                |

#### 5. Serviços (4 permissões)

| Permissão        | Descrição                           |
| ---------------- | ----------------------------------- |
| `readServices`   | Ver serviços de manutenção/inspeção |
| `createServices` | Registrar novos serviços            |
| `updateServices` | Editar serviços existentes          |
| `deleteServices` | Remover registros de serviços       |

#### 6. Alertas (4 permissões)

| Permissão      | Descrição                         |
| -------------- | --------------------------------- |
| `readAlerts`   | Ver alertas gerados               |
| `createAlerts` | Gerar alertas manualmente (admin) |
| `updateAlerts` | Editar configurações de alertas   |
| `deleteAlerts` | Remover alertas                   |

### Matriz de Permissões Padrão

#### Técnico de Manutenção

```json
{
  "readUsers": false,
  "createUsers": false,
  "updateUsers": false,
  "deleteUsers": false,
  "updatePermissionsUsers": false,
  "manageUsers": false,

  "readBranches": true,
  "updateBranches": false,

  "readBlueprints": true,
  "createBlueprints": false,
  "updateBlueprints": false,
  "deleteBlueprints": false,

  "readMachines": true,
  "createMachines": false,
  "updateMachines": false,
  "deleteMachines": false,

  "readServices": true,
  "createServices": true,
  "updateServices": true,
  "deleteServices": false,

  "readAlerts": true,
  "createAlerts": false,
  "updateAlerts": false,
  "deleteAlerts": false
}
```

#### Supervisor de Filial

```json
{
  "readUsers": true,
  "createUsers": false,
  "updateUsers": false,
  "deleteUsers": false,
  "updatePermissionsUsers": false,
  "manageUsers": false,

  "readBranches": true,
  "updateBranches": true,

  "readBlueprints": true,
  "createBlueprints": false,
  "updateBlueprints": false,
  "deleteBlueprints": false,

  "readMachines": true,
  "createMachines": true,
  "updateMachines": true,
  "deleteMachines": false,

  "readServices": true,
  "createServices": true,
  "updateServices": true,
  "deleteServices": true,

  "readAlerts": true,
  "createAlerts": false,
  "updateAlerts": false,
  "deleteAlerts": false
}
```

#### Gerente de Filial

```json
{
  "readUsers": true,
  "createUsers": true,
  "updateUsers": true,
  "deleteUsers": false,
  "updatePermissionsUsers": true,
  "manageUsers": true,

  "readBranches": true,
  "updateBranches": true,

  "readBlueprints": true,
  "createBlueprints": false,
  "updateBlueprints": false,
  "deleteBlueprints": false,

  "readMachines": true,
  "createMachines": true,
  "updateMachines": true,
  "deleteMachines": true,

  "readServices": true,
  "createServices": true,
  "updateServices": true,
  "deleteServices": true,

  "readAlerts": true,
  "createAlerts": true,
  "updateAlerts": true,
  "deleteAlerts": true
}
```

## Modelo de Dados

### Schema Prisma

```prisma
model User {
  id                      String         @id @default(cuid())
  email                   String         @unique
  password                String
  name                    String
  companyId               String
  company                 Company        @relation(fields: [companyId], references: [id])
  isCompanyAdmin          Boolean        @default(false)
  isCompanyManager        Boolean        @default(false)
  userBranches            UserBranch[]   // Permissões por filial
  servicesPerformed       MachineService[]
  createdAt               DateTime       @default(now())
  updatedAt               DateTime       @updatedAt
}

model UserBranch {
  id       String        @id @default(cuid())
  userId   String
  user     User          @relation(fields: [userId], references: [id])
  branchId String
  branch   CompanyBranch @relation(fields: [branchId], references: [id])

  // Usuários (6)
  readUsers                Boolean @default(false)
  createUsers              Boolean @default(false)
  updateUsers              Boolean @default(false)
  deleteUsers              Boolean @default(false)
  updatePermissionsUsers   Boolean @default(false)
  manageUsers              Boolean @default(false)

  // Filiais (2)
  readBranches             Boolean @default(false)
  updateBranches           Boolean @default(false)

  // Blueprints (4)
  readBlueprints           Boolean @default(false)
  createBlueprints         Boolean @default(false)
  updateBlueprints         Boolean @default(false)
  deleteBlueprints         Boolean @default(false)

  // Máquinas (4)
  readMachines             Boolean @default(false)
  createMachines           Boolean @default(false)
  updateMachines           Boolean @default(false)
  deleteMachines           Boolean @default(false)

  // Serviços (4)
  readServices             Boolean @default(false)
  createServices           Boolean @default(false)
  updateServices           Boolean @default(false)
  deleteServices           Boolean @default(false)

  // Alertas (4)
  readAlerts               Boolean @default(false)
  createAlerts             Boolean @default(false)
  updateAlerts             Boolean @default(false)
  deleteAlerts             Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, branchId])
}
```

## Implementação Backend

### AuthGuard

O `AuthGuard` é aplicado **globalmente** e executa a lógica de autorização:

```typescript
// apps/backend/src/modules/auth/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const reflector = this.reflector;

    // 1. Verifica se é rota pública
    const isPublic = reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) return true;

    // 2. Extrai e valida JWT
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    const payload = await this.jwtService.verifyAsync(token);

    // 3. Popula request.user
    if (payload.isSysAdmin) {
      const sysAdmin = await this.prisma.sysAdmin.findUnique({
        where: { id: payload.id },
      });
      if (!sysAdmin) throw new UnauthorizedException();
      request.user = { ...sysAdmin, isSysAdmin: true };
    } else {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        include: {
          company: true,
          userBranches: {
            include: { branch: true },
          },
        },
      });
      if (!user) throw new UnauthorizedException();
      request.user = { ...user, isSysAdmin: false };
    }

    // 4. Verifica decoradores de autorização
    const requiresAdmin = reflector.get<boolean>('requiresAdmin', context.getHandler());
    if (requiresAdmin && !request.user.isSysAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    const requiresCompanyAdmin = reflector.get<boolean>(
      'requiresCompanyAdmin',
      context.getHandler(),
    );
    if (requiresCompanyAdmin && !request.user.isSysAdmin && !request.user.isCompanyAdmin) {
      throw new ForbiddenException('Company admin access required');
    }

    // 5. Verifica permissões de filial (se rota tem :branchId)
    const branchId = request.params.branchId;
    if (branchId) {
      const requiredPermission = reflector.get<string>('branchPermission', context.getHandler());
      if (requiredPermission) {
        await this.validateBranchPermission(request.user, branchId, requiredPermission);
      }
    }

    return true;
  }

  private async validateBranchPermission(user: any, branchId: string, permission: string) {
    if (user.isSysAdmin) return true; // SysAdmin bypassa
    if (user.isCompanyAdmin) {
      // CompanyAdmin tem acesso se a filial pertence à sua empresa
      const branch = await this.prisma.companyBranch.findUnique({
        where: { id: branchId },
      });
      if (branch?.companyId === user.companyId) return true;
    }

    // Verifica UserBranch
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

    if (!userBranch[permission]) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    return true;
  }
}
```

### Decoradores de Autorização

```typescript
// apps/backend/src/modules/auth/auth.decorators.ts
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);
export const Authenticated = () => SetMetadata('isAuthenticated', true);
export const Admin = () => SetMetadata('requiresAdmin', true);
export const CompanyAdmin = () => SetMetadata('requiresCompanyAdmin', true);
export const CompanyManager = () => SetMetadata('requiresCompanyManager', true);
export const BranchPermission = (permission: string) => SetMetadata('branchPermission', permission);
```

### Uso em Controllers

```typescript
@Controller('machines')
export class MachinesController {
  @Post()
  @BranchPermission('createMachines')
  create(@Body() dto: CreateMachineDto, @Request() req) {
    // AuthGuard já validou que req.user tem permissão createMachines
    return this.machinesService.create(dto, req.user);
  }

  @Get(':id')
  @Authenticated() // Qualquer usuário autenticado
  findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }

  @Delete(':id')
  @Admin() // Apenas SysAdmin
  remove(@Param('id') id: string) {
    return this.machinesService.remove(id);
  }
}
```

## Implementação Frontend

### Contextos de Autenticação

```typescript
// src/contexts/AuthContext.tsx
export function useAuth() {
  const { sysAdmin } = useSysAdmin();
  const { companyUser } = useCompanyUser();

  const isSysAdmin = !!sysAdmin;
  const isCompanyAdmin = companyUser?.isCompanyAdmin || false;
  const isCompanyManager = companyUser?.isCompanyManager || false;

  const hasPermission = (branchId: string, permission: string): boolean => {
    if (isSysAdmin) return true;
    if (isCompanyAdmin) return true; // Simplificação

    const userBranch = companyUser?.userBranches.find((ub) => ub.branchId === branchId);

    return userBranch?.[permission] || false;
  };

  return {
    isSysAdmin,
    isCompanyAdmin,
    isCompanyManager,
    hasPermission,
  };
}
```

### Proteção de Rotas

```tsx
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  branchId?: string;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  branchId,
  adminOnly,
}: ProtectedRouteProps) {
  const { isSysAdmin, hasPermission } = useAuth();

  if (adminOnly && !isSysAdmin) {
    return <Redirect to="/unauthorized" />;
  }

  if (requiredPermission && branchId && !hasPermission(branchId, requiredPermission)) {
    return <Redirect to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

### Componentes Condicionais

```tsx
// src/components/machines/MachineActions.tsx
export function MachineActions({ machine }: { machine: Machine }) {
  const { hasPermission } = useAuth();

  return (
    <div>
      {hasPermission(machine.branchId, 'updateMachines') && (
        <Button onClick={handleEdit}>Edit</Button>
      )}

      {hasPermission(machine.branchId, 'deleteMachines') && (
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      )}
    </div>
  );
}
```

## Casos de Uso

### 1. Criar Usuário com Permissões

```typescript
// Backend: UsersService
async createWithPermissions(
  dto: CreateUserDto,
  branchPermissions: { branchId: string; permissions: Partial<UserBranchPermissions> }[]
) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Criar usuário
    const user = await tx.user.create({
      data: {
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        name: dto.name,
        companyId: dto.companyId,
      },
    });

    // 2. Criar UserBranch para cada filial
    for (const bp of branchPermissions) {
      await tx.userBranch.create({
        data: {
          userId: user.id,
          branchId: bp.branchId,
          ...bp.permissions,
        },
      });
    }

    return user;
  });
}
```

### 2. Atualizar Permissões de Usuário

```typescript
// Backend: UsersService
async updatePermissions(
  userId: string,
  branchId: string,
  permissions: Partial<UserBranchPermissions>
) {
  return this.prisma.userBranch.update({
    where: {
      userId_branchId: {
        userId,
        branchId,
      },
    },
    data: permissions,
  });
}
```

### 3. Verificar Acesso a Recurso

```typescript
// Backend: Middleware personalizado
async function checkMachineAccess(
  userId: string,
  machineId: string,
  permission: string,
): Promise<boolean> {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
  });

  if (!machine) return false;

  const userBranch = await prisma.userBranch.findUnique({
    where: {
      userId_branchId: {
        userId,
        branchId: machine.branchId,
      },
    },
  });

  return userBranch?.[permission] || false;
}
```

## Boas Práticas

### 1. Princípio do Menor Privilégio

Sempre conceda o **mínimo de permissões necessárias**:

```typescript
// ❌ Ruim: Dar todas as permissões
const permissions = {
  readMachines: true,
  createMachines: true,
  updateMachines: true,
  deleteMachines: true, // Técnico não precisa disso
};

// ✅ Bom: Apenas o necessário
const permissions = {
  readMachines: true,
  createMachines: false,
  updateMachines: false,
  deleteMachines: false,
};
```

### 2. Validação em Múltiplas Camadas

```typescript
// Frontend: Esconder botão
{hasPermission('createMachines') && <CreateButton />}

// Backend: Validar novamente
@Post()
@BranchPermission('createMachines')
create(@Body() dto) { ... }
```

**Nunca confie apenas no frontend!**

### 3. Auditoria de Permissões

Registre mudanças de permissões:

```typescript
// Adicionar tabela PermissionAuditLog
model PermissionAuditLog {
  id            String   @id @default(cuid())
  userId        String
  branchId      String
  permission    String
  oldValue      Boolean
  newValue      Boolean
  changedBy     String
  changedAt     DateTime @default(now())
}
```

### 4. Testes de Permissão

```typescript
describe('MachinesController (Permissions)', () => {
  it('should deny access without permission', async () => {
    const user = await createUserWithoutPermissions();
    const token = signJWT(user);

    return request(app.getHttpServer())
      .post('/machines')
      .set('Authorization', `Bearer ${token}`)
      .send(machineDto)
      .expect(403);
  });

  it('should allow access with permission', async () => {
    const user = await createUserWithPermissions(['createMachines']);
    const token = signJWT(user);

    return request(app.getHttpServer())
      .post('/machines')
      .set('Authorization', `Bearer ${token}`)
      .send(machineDto)
      .expect(201);
  });
});
```

### 5. Documentação de Endpoints

Sempre documente permissões necessárias:

```typescript
/**
 * Create a new machine
 *
 * @permission createMachines (branch-level)
 * @throws {ForbiddenException} If user lacks createMachines permission
 */
@Post()
@BranchPermission('createMachines')
create(@Body() dto: CreateMachineDto) { ... }
```

---

## Recursos Adicionais

- [Documentação da API](API.md)
- [Arquitetura do Sistema](ARCHITECTURE.md)
- [Guia de Desenvolvimento](DEVELOPMENT.md)
