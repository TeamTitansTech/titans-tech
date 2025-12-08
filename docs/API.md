# Documentação da API - Titans Tech

Referência completa dos endpoints da API REST do Titans Tech.

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [SysAdmin](#sysadmin)
- [Companies](#companies)
- [Company Branches](#company-branches)
- [Users](#users)
- [Blueprints](#blueprints)
- [Machines](#machines)
- [Services](#services)
- [Alerts](#alerts)
- [Erros Comuns](#erros-comuns)

## Visão Geral

**Base URL**: `http://localhost:3001` (desenvolvimento)

**Content-Type**: `application/json`

**Autenticação**: JWT Bearer Token (exceto endpoints públicos)

**Formato de Resposta**:

```json
{
  "id": "cuid",
  "field": "value",
  ...
}
```

**Formato de Erro**:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Autenticação

### Login SysAdmin

```http
POST /auth/admin/login
```

**Corpo da Requisição**:

```json
{
  "email": "admin@titans.com",
  "password": "Admin@123"
}
```

**Resposta** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm123...",
    "email": "admin@titans.com",
    "name": "System Administrator",
    "isUsingDefaultPassword": true,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Erros**:

- `401 Unauthorized`: Credenciais inválidas

---

### Login User (Empresa)

```http
POST /auth/user/login
```

**Corpo da Requisição**:

```json
{
  "email": "user@company.com",
  "password": "User@123"
}
```

**Resposta** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm123...",
    "email": "user@company.com",
    "name": "John Doe",
    "companyId": "cm456...",
    "isCompanyAdmin": true,
    "isCompanyManager": false,
    "isUsingDefaultPassword": false,
    "company": {
      "id": "cm456...",
      "name": "Acme Corporation"
    }
  }
}
```

---

### Get Current SysAdmin

```http
GET /auth/admin/me
Authorization: Bearer <token>
```

**Resposta** (200 OK):

```json
{
  "id": "cm123...",
  "email": "admin@titans.com",
  "name": "System Administrator",
  "isUsingDefaultPassword": true
}
```

**Erros**:

- `401 Unauthorized`: Token inválido/expirado

---

### Get Current User

```http
GET /users/me
Authorization: Bearer <token>
```

**Resposta** (200 OK):

```json
{
  "id": "cm123...",
  "email": "user@company.com",
  "name": "John Doe",
  "companyId": "cm456...",
  "isCompanyAdmin": true,
  "isCompanyManager": false,
  "company": {
    "id": "cm456...",
    "name": "Acme Corporation",
    "logo": "https://...",
    "brandColor": "#FF5733"
  },
  "userBranches": [
    {
      "branchId": "cm789...",
      "branch": {
        "id": "cm789...",
        "name": "Matriz",
        "isMainBranch": true
      },
      "readMachines": true,
      "createMachines": true,
      ...
    }
  ]
}
```

---

## SysAdmin

### Create SysAdmin

```http
POST /sysadmin
Authorization: Bearer <admin-token>
@Admin()
```

**Corpo da Requisição**:

```json
{
  "email": "newadmin@titans.com",
  "password": "SecurePass@123",
  "name": "New Administrator"
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm123...",
  "email": "newadmin@titans.com",
  "name": "New Administrator",
  "isUsingDefaultPassword": false,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Validações**:

- Email único
- Senha: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial

---

### List SysAdmins

```http
GET /sysadmin
Authorization: Bearer <admin-token>
@Admin()
```

**Resposta** (200 OK):

```json
[
  {
    "id": "cm123...",
    "email": "admin@titans.com",
    "name": "System Administrator",
    "isUsingDefaultPassword": true,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
]
```

---

## Companies

### Create Company

```http
POST /companies
Authorization: Bearer <admin-token>
@Admin()
```

**Corpo da Requisição**:

```json
{
  "name": "acme-corp",
  "logo": "https://example.com/logo.png",
  "brandColor": "#FF5733",
  "description": "Leading manufacturing company"
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm123...",
  "name": "acme-corp",
  "logo": "https://example.com/logo.png",
  "brandColor": "#FF5733",
  "description": "Leading manufacturing company",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

**Validações**:

- `name`: único, kebab-case, 3-50 caracteres
- `brandColor`: formato hexadecimal válido (#RRGGBB)

---

### List Companies

```http
GET /companies
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
[
  {
    "id": "cm123...",
    "name": "acme-corp",
    "logo": "https://...",
    "brandColor": "#FF5733",
    "description": "...",
    "_count": {
      "branches": 3,
      "users": 15
    }
  }
]
```

---

### Get Company

```http
GET /companies/:id
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
{
  "id": "cm123...",
  "name": "acme-corp",
  "logo": "https://...",
  "brandColor": "#FF5733",
  "branches": [
    {
      "id": "cm456...",
      "name": "Matriz",
      "isMainBranch": true,
      "location": "São Paulo, SP"
    }
  ],
  "users": [
    {
      "id": "cm789...",
      "name": "John Doe",
      "email": "john@acme.com",
      "isCompanyAdmin": true
    }
  ]
}
```

---

### Update Company

```http
PUT /companies/:id
Authorization: Bearer <admin-token>
@Admin()
```

**Corpo da Requisição** (campos opcionais):

```json
{
  "logo": "https://new-logo.png",
  "brandColor": "#00FF00",
  "description": "Updated description"
}
```

**Resposta** (200 OK):

```json
{
  "id": "cm123...",
  "name": "acme-corp",
  "logo": "https://new-logo.png",
  "brandColor": "#00FF00",
  "description": "Updated description"
}
```

**Nota**: `name` não pode ser alterado após criação.

---

### Delete Company

```http
DELETE /companies/:id
Authorization: Bearer <admin-token>
@Admin()
```

**Resposta** (200 OK):

```json
{
  "message": "Company deleted successfully"
}
```

**Erros**:

- `400 Bad Request`: Empresa possui filiais/usuários/máquinas

---

## Company Branches

### Create Branch

```http
POST /company-branches
Authorization: Bearer <token>
@CompanyAdmin()
```

**Corpo da Requisição**:

```json
{
  "name": "Filial Norte",
  "companyId": "cm123...",
  "isMainBranch": false,
  "location": "Manaus, AM"
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm456...",
  "name": "Filial Norte",
  "companyId": "cm123...",
  "isMainBranch": false,
  "location": "Manaus, AM",
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Validações**:

- Apenas 1 filial pode ter `isMainBranch: true` por empresa
- `name`: 2-100 caracteres

---

### List Branches

```http
GET /company-branches?companyId=cm123
Authorization: Bearer <token>
@Authenticated()
```

**Query Parameters**:

- `companyId` (opcional): Filtrar por empresa

**Resposta** (200 OK):

```json
[
  {
    "id": "cm456...",
    "name": "Matriz",
    "isMainBranch": true,
    "location": "São Paulo, SP",
    "company": {
      "id": "cm123...",
      "name": "acme-corp"
    },
    "_count": {
      "machines": 12,
      "userBranches": 8
    }
  }
]
```

---

### Get Branch

```http
GET /company-branches/:id
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
{
  "id": "cm456...",
  "name": "Matriz",
  "isMainBranch": true,
  "location": "São Paulo, SP",
  "companyId": "cm123...",
  "company": {
    "id": "cm123...",
    "name": "acme-corp"
  },
  "machines": [
    {
      "id": "cm789...",
      "name": "Prensa H-100"
    }
  ],
  "userBranches": [
    {
      "userId": "cm999...",
      "user": {
        "name": "John Doe",
        "email": "john@acme.com"
      },
      "readMachines": true
    }
  ]
}
```

---

### Update Branch

```http
PUT /company-branches/:branchId
Authorization: Bearer <token>
@BranchPermission('updateBranches')
```

**Corpo da Requisição**:

```json
{
  "name": "Filial Norte - Ampliada",
  "location": "Manaus, AM - Nova Localização"
}
```

**Resposta** (200 OK):

```json
{
  "id": "cm456...",
  "name": "Filial Norte - Ampliada",
  "location": "Manaus, AM - Nova Localização"
}
```

---

### Delete Branch

```http
DELETE /company-branches/:branchId
Authorization: Bearer <admin-token>
@Admin()
```

**Resposta** (200 OK):

```json
{
  "message": "Branch deleted successfully"
}
```

**Erros**:

- `400 Bad Request`: Filial é a principal (`isMainBranch: true`)
- `400 Bad Request`: Filial possui máquinas

---

## Users

### Create User

```http
POST /users
Authorization: Bearer <token>
@CompanyAdmin()
```

**Corpo da Requisição**:

```json
{
  "email": "newuser@company.com",
  "password": "User@123",
  "name": "New User",
  "companyId": "cm123...",
  "isCompanyAdmin": false,
  "isCompanyManager": false
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm456...",
  "email": "newuser@company.com",
  "name": "New User",
  "companyId": "cm123...",
  "isCompanyAdmin": false,
  "isCompanyManager": false,
  "isUsingDefaultPassword": true
}
```

---

### Assign User to Branch

```http
POST /users/:userId/branches
Authorization: Bearer <token>
@CompanyAdmin()
```

**Corpo da Requisição**:

```json
{
  "branchId": "cm789...",
  "permissions": {
    "readMachines": true,
    "createMachines": true,
    "updateMachines": true,
    "deleteMachines": false,
    "readServices": true,
    "createServices": true,
    "updateServices": true,
    "deleteServices": false
  }
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm999...",
  "userId": "cm456...",
  "branchId": "cm789...",
  "readMachines": true,
  "createMachines": true,
  ...
}
```

**20 Permissões Disponíveis**:

- **Usuários**: read/create/update/delete/updatePermissions/manageUsers
- **Filiais**: readBranches/updateBranches
- **Máquinas**: readMachines/createMachines/updateMachines/deleteMachines
- **Serviços**: readServices/createServices/updateServices/deleteServices
- **Alertas**: readAlerts/createAlerts/updateAlerts/deleteAlerts

---

### Update User Permissions

```http
PUT /users/:userId/branches/:branchId/permissions
Authorization: Bearer <token>
@BranchPermission('updatePermissionsUsers')
```

**Corpo da Requisição**:

```json
{
  "readMachines": true,
  "deleteMachines": true
}
```

**Resposta** (200 OK):

```json
{
  "id": "cm999...",
  "userId": "cm456...",
  "branchId": "cm789...",
  "readMachines": true,
  "deleteMachines": true,
  ...
}
```

---

### List Users

```http
GET /users?companyId=cm123
Authorization: Bearer <token>
@Authenticated()
```

**Query Parameters**:

- `companyId` (opcional): Filtrar por empresa

**Resposta** (200 OK):

```json
[
  {
    "id": "cm456...",
    "email": "user@company.com",
    "name": "John Doe",
    "companyId": "cm123...",
    "isCompanyAdmin": true,
    "company": {
      "name": "acme-corp"
    },
    "userBranches": [
      {
        "branchId": "cm789...",
        "branch": {
          "name": "Matriz"
        }
      }
    ]
  }
]
```

---

### Delete User

```http
DELETE /users/:userId
Authorization: Bearer <token>
@CompanyAdmin()
```

**Resposta** (200 OK):

```json
{
  "message": "User deleted successfully"
}
```

---

## Blueprints

### Create Blueprint

```http
POST /blueprints
Authorization: Bearer <admin-token>
@Admin()
```

**Corpo da Requisição**:

```json
{
  "name": "Prensa Hidráulica Industrial",
  "fields": [
    {
      "name": "Tonelagem",
      "type": "number",
      "required": true
    },
    {
      "name": "Ano de Fabricação",
      "type": "number",
      "required": true
    }
  ],
  "sections": [
    "bearing-clearance",
    "slide",
    "gibs",
    "lubrication-hydraulics",
    "clutch",
    "counterbalance-cylinder-airbag"
  ]
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm123...",
  "name": "Prensa Hidráulica Industrial",
  "fields": [...],
  "sections": [...],
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Validações**:

- `name`: único, 3-100 caracteres
- `sections`: array de enums válidos (6 seções disponíveis)

---

### List Blueprints

```http
GET /blueprints
Authorization: Bearer <token>
@Authenticated()
```

**Query Parameters**:

- `includeDeleted` (opcional): `true` para incluir soft-deleted

**Resposta** (200 OK):

```json
[
  {
    "id": "cm123...",
    "name": "Prensa Hidráulica Industrial",
    "fields": [...],
    "sections": ["bearing-clearance", "slide"],
    "_count": {
      "machines": 5
    },
    "deletedAt": null
  }
]
```

---

### Get Blueprint

```http
GET /blueprints/:id
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
{
  "id": "cm123...",
  "name": "Prensa Hidráulica Industrial",
  "fields": [
    {
      "name": "Tonelagem",
      "type": "number",
      "required": true
    }
  ],
  "sections": ["bearing-clearance", "slide", "gibs"],
  "machines": [
    {
      "id": "cm456...",
      "name": "Prensa H-100"
    }
  ],
  "threshold": {
    "id": "cm789...",
    "totalClearance_greenMin": "0.010",
    "totalClearance_yellowMin": "0.020",
    "totalClearance_redMin": "0.030"
  }
}
```

---

### Delete Blueprint (Soft)

```http
DELETE /blueprints/:id
Authorization: Bearer <admin-token>
@Admin()
```

**Resposta** (200 OK):

```json
{
  "message": "Blueprint deleted successfully",
  "id": "cm123...",
  "deletedAt": "2025-01-15T10:00:00.000Z"
}
```

**Nota**: Soft delete - blueprint não é removido do banco, apenas marcado como deletado.

---

## Machines

### Create Machine

```http
POST /machines
Authorization: Bearer <token>
@BranchPermission('createMachines')
```

**Corpo da Requisição**:

```json
{
  "name": "Prensa H-100",
  "blueprintId": "cm123...",
  "branchId": "cm456...",
  "fields": [
    {
      "name": "Tonelagem",
      "value": "100"
    },
    {
      "name": "Ano de Fabricação",
      "value": "2020"
    }
  ]
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm789...",
  "name": "Prensa H-100",
  "blueprintId": "cm123...",
  "branchId": "cm456...",
  "fields": [
    {
      "id": "cm999...",
      "name": "Tonelagem",
      "value": "100"
    }
  ],
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Validações**:

- `fields`: devem corresponder aos definidos no blueprint
- Usuário deve ter permissão `createMachines` na branch

---

### List Machines

```http
GET /machines?branchId=cm456
Authorization: Bearer <token>
@BranchPermission('readMachines')
```

**Query Parameters**:

- `branchId` (obrigatório): ID da filial

**Resposta** (200 OK):

```json
[
  {
    "id": "cm789...",
    "name": "Prensa H-100",
    "blueprint": {
      "id": "cm123...",
      "name": "Prensa Hidráulica Industrial"
    },
    "branch": {
      "id": "cm456...",
      "name": "Matriz"
    },
    "fields": [...],
    "_count": {
      "services": 3
    }
  }
]
```

---

### Get Machine

```http
GET /machines/:id
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
{
  "id": "cm789...",
  "name": "Prensa H-100",
  "blueprintId": "cm123...",
  "branchId": "cm456...",
  "blueprint": {
    "id": "cm123...",
    "name": "Prensa Hidráulica Industrial",
    "sections": ["bearing-clearance", "slide"]
  },
  "branch": {
    "id": "cm456...",
    "name": "Matriz",
    "company": {
      "name": "acme-corp"
    }
  },
  "fields": [
    {
      "id": "cm999...",
      "name": "Tonelagem",
      "value": "100"
    }
  ],
  "services": [
    {
      "id": "cm111...",
      "date": "2025-01-15T10:00:00.000Z",
      "type": "INSPECTION",
      "status": "COMPLETED"
    }
  ]
}
```

---

### Update Machine

```http
PUT /machines/:id
Authorization: Bearer <token>
@BranchPermission('updateMachines')
```

**Corpo da Requisição**:

```json
{
  "name": "Prensa H-100 (Reformada)",
  "fields": [
    {
      "name": "Tonelagem",
      "value": "120"
    }
  ]
}
```

**Resposta** (200 OK):

```json
{
  "id": "cm789...",
  "name": "Prensa H-100 (Reformada)",
  "fields": [...]
}
```

---

### Delete Machine

```http
DELETE /machines/:id
Authorization: Bearer <token>
@BranchPermission('deleteMachines')
```

**Resposta** (200 OK):

```json
{
  "message": "Machine deleted successfully"
}
```

**Erros**:

- `400 Bad Request`: Máquina possui serviços registrados

---

## Services

### Create Service

```http
POST /services
Authorization: Bearer <token>
@BranchPermission('createServices')
```

**Corpo da Requisição**:

```json
{
  "machineId": "cm789...",
  "date": "2025-01-15T10:00:00.000Z",
  "type": "INSPECTION",
  "status": "COMPLETED",
  "performedBy": "cm456...",
  "sections": {
    "bearingClearance": {
      "outerData": {
        "totalClearance_RH": "0.035",
        "totalClearance_LH": "0.015",
        "mainBearings_RH": "0.025",
        "mainBearings_LH": "0.020"
      },
      "innerData": {
        "totalClearance_RH": "0.030",
        "totalClearance_LH": "0.018"
      }
    },
    "slide": {
      "slideHeightLeftFront": "100.5",
      "slideHeightLeftBack": "100.3"
    }
  }
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm111...",
  "machineId": "cm789...",
  "date": "2025-01-15T10:00:00.000Z",
  "type": "INSPECTION",
  "status": "COMPLETED",
  "performedBy": "cm456...",
  "bearingClearance": [...],
  "slide": [...],
  "alertBearingClearance": {
    "id": "cm222...",
    "totalClearance_differential": "0.020",
    "totalClearance_severity": "YELLOW"
  },
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Nota**: Alertas são gerados automaticamente se a seção `bearingClearance` for fornecida.

---

### List Services

```http
GET /services?machineId=cm789
Authorization: Bearer <token>
@BranchPermission('readServices')
```

**Query Parameters**:

- `machineId` (opcional): Filtrar por máquina
- `type` (opcional): `INSPECTION` ou `MAINTENANCE`
- `status` (opcional): `PENDING` ou `COMPLETED`

**Resposta** (200 OK):

```json
[
  {
    "id": "cm111...",
    "date": "2025-01-15T10:00:00.000Z",
    "type": "INSPECTION",
    "status": "COMPLETED",
    "machine": {
      "id": "cm789...",
      "name": "Prensa H-100"
    },
    "performer": {
      "id": "cm456...",
      "name": "John Doe"
    }
  }
]
```

---

### Get Service

```http
GET /services/:id
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
{
  "id": "cm111...",
  "machineId": "cm789...",
  "date": "2025-01-15T10:00:00.000Z",
  "type": "INSPECTION",
  "status": "COMPLETED",
  "performedBy": "cm456...",
  "machine": {
    "id": "cm789...",
    "name": "Prensa H-100",
    "blueprint": {
      "name": "Prensa Hidráulica Industrial"
    }
  },
  "performer": {
    "name": "John Doe"
  },
  "bearingClearance": [
    {
      "outerData": {
        "totalClearance_RH": "0.035",
        "totalClearance_LH": "0.015"
      }
    }
  ],
  "slide": [...],
  "alertBearingClearance": {
    "totalClearance_differential": "0.020",
    "totalClearance_severity": "YELLOW"
  }
}
```

---

### Update Service

```http
PUT /services/:id
Authorization: Bearer <token>
@BranchPermission('updateServices')
```

**Corpo da Requisição**:

```json
{
  "status": "COMPLETED",
  "sections": {
    "slide": {
      "slideHeightLeftFront": "101.0"
    }
  }
}
```

**Resposta** (200 OK):

```json
{
  "id": "cm111...",
  "status": "COMPLETED",
  "slide": [...]
}
```

---

### Delete Service

```http
DELETE /services/:id
Authorization: Bearer <token>
@BranchPermission('deleteServices')
```

**Resposta** (200 OK):

```json
{
  "message": "Service deleted successfully"
}
```

---

## Alerts

### Create Threshold

```http
POST /alerts/bearing-clearance/thresholds
Authorization: Bearer <admin-token>
@Admin()
```

**Corpo da Requisição**:

```json
{
  "blueprintId": "cm123...",
  "totalClearance_greenMin": "0.010",
  "totalClearance_yellowMin": "0.020",
  "totalClearance_redMin": "0.030",
  "mainBearings_greenMin": "0.015",
  "mainBearings_yellowMin": "0.025",
  "mainBearings_redMin": "0.035",
  "upperConnectionBearings_greenMin": "0.012",
  "upperConnectionBearings_yellowMin": "0.022",
  "upperConnectionBearings_redMin": "0.032",
  "wristPinToMatingPart_greenMin": "0.008",
  "wristPinToMatingPart_yellowMin": "0.018",
  "wristPinToMatingPart_redMin": "0.028",
  "wristPinToBushing_greenMin": "0.010",
  "wristPinToBushing_yellowMin": "0.020",
  "wristPinToBushing_redMin": "0.030",
  "slideAdjNutToScrewSleeve_greenMin": "0.015",
  "slideAdjNutToScrewSleeve_yellowMin": "0.025",
  "slideAdjNutToScrewSleeve_redMin": "0.035"
}
```

**Resposta** (201 Created):

```json
{
  "id": "cm789...",
  "blueprintId": "cm123...",
  "totalClearance_greenMin": "0.010",
  "totalClearance_yellowMin": "0.020",
  "totalClearance_redMin": "0.030",
  ...
}
```

**Validações**:

- Para cada campo: `greenMin < yellowMin < redMin`
- Blueprint não pode ter threshold duplicado

---

### Get Threshold by Blueprint

```http
GET /alerts/bearing-clearance/thresholds/blueprint/:blueprintId
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
{
  "id": "cm789...",
  "blueprintId": "cm123...",
  "totalClearance_greenMin": "0.010",
  "totalClearance_yellowMin": "0.020",
  "totalClearance_redMin": "0.030",
  "blueprint": {
    "id": "cm123...",
    "name": "Prensa Hidráulica Industrial"
  }
}
```

---

### Update Threshold

```http
PUT /alerts/bearing-clearance/thresholds/blueprint/:blueprintId
Authorization: Bearer <admin-token>
@Admin()
```

**Corpo da Requisição** (campos opcionais):

```json
{
  "totalClearance_yellowMin": "0.025",
  "totalClearance_redMin": "0.040"
}
```

**Resposta** (200 OK):

```json
{
  "id": "cm789...",
  "totalClearance_greenMin": "0.010",
  "totalClearance_yellowMin": "0.025",
  "totalClearance_redMin": "0.040"
}
```

**Nota**: Validação garante que após update: `greenMin < yellowMin < redMin`

---

### Delete Threshold

```http
DELETE /alerts/bearing-clearance/thresholds/blueprint/:blueprintId
Authorization: Bearer <admin-token>
@Admin()
```

**Resposta** (200 OK):

```json
{
  "message": "Threshold deleted successfully"
}
```

---

### Get Alerts for Service

```http
GET /alerts/bearing-clearance/service/:serviceId
Authorization: Bearer <token>
@Authenticated()
```

**Resposta** (200 OK):

```json
{
  "id": "cm222...",
  "serviceId": "cm111...",
  "alerts": [
    {
      "field": "totalClearance",
      "rh": "0.035",
      "lh": "0.015",
      "differential": "0.020",
      "severity": "YELLOW",
      "thresholds": {
        "greenMin": "0.010",
        "yellowMin": "0.020",
        "redMin": "0.030"
      }
    },
    {
      "field": "mainBearings",
      "rh": "0.025",
      "lh": "0.020",
      "differential": "0.005",
      "severity": "NONE",
      "thresholds": {...}
    }
  ],
  "service": {
    "id": "cm111...",
    "date": "2025-01-15T10:00:00.000Z",
    "machine": {
      "name": "Prensa H-100"
    }
  }
}
```

**Severidade**:

- `NONE`: `differential < greenMin` (normal)
- `GREEN`: `greenMin ≤ differential < yellowMin` (atenção)
- `YELLOW`: `yellowMin ≤ differential < redMin` (alerta)
- `RED`: `differential ≥ redMin` (crítico)

---

### Generate Alerts Manually

```http
POST /alerts/bearing-clearance/service/:serviceId/generate
Authorization: Bearer <admin-token>
@Admin()
```

**Resposta** (200 OK):

```json
{
  "message": "Alerts generated successfully",
  "alert": {
    "id": "cm222...",
    "serviceId": "cm111...",
    "totalClearance_differential": "0.020",
    "totalClearance_severity": "YELLOW"
  }
}
```

**Nota**: Útil para recalcular alertas após atualização de thresholds.

---

## Erros Comuns

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Causas**:

- Dados inválidos no corpo da requisição
- Validação Zod falhou
- Constraints do banco violadas (unique, foreign key)

---

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Causas**:

- Token JWT ausente
- Token expirado (após 7 dias)
- Token inválido (assinatura incorreta)
- Credenciais incorretas no login

---

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**Causas**:

- Usuário não tem permissão para a ação (ex: `createMachines`)
- Usuário não pertence à filial especificada
- Rota requer `@Admin()` mas usuário não é SysAdmin

---

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

**Causas**:

- ID fornecido não existe
- Recurso foi soft-deleted (blueprints)

---

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

**Causas**:

- Erro não tratado no backend
- Erro de conexão com banco de dados
- Bug no código

---

## Notas Adicionais

### Paginação

Atualmente não implementada. Todos os endpoints retornam todos os registros.

**TODO**: Implementar paginação com `skip` e `take`.

### Ordenação

Padrão: `createdAt DESC` (mais recentes primeiro).

### Filtros

Suportados via query parameters onde indicado.

### Rate Limiting

Atualmente não implementado.

**TODO**: Implementar rate limiting por IP/usuário.

### Versionamento

API não versionada. Mudanças breaking devem ser evitadas.

**TODO**: Implementar versionamento (v1, v2, etc.) quando necessário.

---

## Testes

### Exemplo com cURL

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@titans.com","password":"Admin@123"}' \
  | jq -r '.accessToken')

# Listar máquinas
curl -X GET http://localhost:3001/machines?branchId=cm123 \
  -H "Authorization: Bearer $TOKEN"
```

### Exemplo com JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/auth/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@titans.com',
    password: 'Admin@123',
  }),
});

const { accessToken } = await loginResponse.json();

// Listar máquinas
const machinesResponse = await fetch('http://localhost:3001/machines?branchId=cm123', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const machines = await machinesResponse.json();
```

---
