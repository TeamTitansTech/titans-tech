# Database Seeding

Este arquivo documenta como usar o seed do banco de dados para desenvolvimento.

## Como rodar o seed

```bash
# Da raiz do projeto
npm run db:seed

# Ou diretamente do package database
cd packages/database
npm run seed
```

## O que o seed cria

### 1. SysAdmin

- **Email:** `sysadmin@titans-tech.com`
- **Senha:** `password123`
- **Acesso:** Painel admin em `/admin`

### 2. Empresa Exemplo (ACME Corporation)

- **Nome:** ACME Corporation
- **Slug/Subdomain:** `acme-corp`
- **Acesso:** `http://acme-corp.localhost:3000` (dev) ou `http://acme-corp.[seu-dominio]` (prod)

### 3. Filiais

#### Headquarters (Filial Principal)

- Localização: New York, NY
- Tipo: Filial principal

#### West Coast Facility (Filial Secundária)

- Localização: Los Angeles, CA
- Tipo: Filial secundária

### 4. Usuários

#### Company Admin

- **Email:** `admin@acme-corp.com`
- **Senha:** `password123`
- **Permissões:** Todas as permissões na filial Headquarters
- **Roles:** Company Admin

#### Company Manager

- **Email:** `manager@acme-corp.com`
- **Senha:** `password123`
- **Permissões:** Limitadas (sem delete) na filial Headquarters
- **Roles:** Company Manager

#### Regular User

- **Email:** `user@acme-corp.com`
- **Senha:** `password123`
- **Permissões:** Somente leitura e criar inspeções na filial West Coast
- **Roles:** Usuário regular

### 5. Blueprints

#### Standard Bearing Clearance Inspection

- Seções: Bearing Clearance
- Campos: Serial Number, Model Year, Machine Type

#### Standard Slide Inspection

- Seções: Slide
- Campos: Serial Number, Slide Type

### 6. Máquinas Exemplo

#### Press Machine #001

- Filial: Headquarters
- Blueprint: Bearing Clearance
- Serial: SN-12345
- Ano: 2020
- Tipo: Press

#### Stamping Machine #002

- Filial: Headquarters
- Blueprint: Bearing Clearance
- Serial: SN-67890
- Ano: 2021
- Tipo: Stamping

#### Slide Press #003

- Filial: West Coast Facility
- Blueprint: Slide
- Serial: SN-11111
- Tipo: Double

## Reset do Banco de Dados

Para resetar o banco e rodar o seed novamente:

```bash
npm run db:reset
```

**⚠️ ATENÇÃO:** Isso irá **apagar todos os dados** do banco e recriar tudo do zero!

## Próximos Passos

Após rodar o seed:

1. Acesse `/admin` e faça login como SysAdmin
2. Ou acesse `http://acme-corp.localhost:3000` e faça login como qualquer um dos usuários da empresa
3. Teste as diferentes permissões com cada tipo de usuário

## Removendo a página /admin/auth-test

Agora que temos o seed funcionando, a página `/admin/auth-test` não é mais necessária para desenvolvimento. Você pode:

1. Removê-la completamente, ou
2. Mantê-la apenas para debugging específico

Para remover:

```bash
rm -rf apps/dashboard/src/app/admin/auth-test
```

E remover da lista de rotas públicas em `apps/dashboard/src/proxy.ts`:

```typescript
const ADMIN_PUBLIC_PATHS = ['/admin']; // Remover '/admin/auth-test'
```
