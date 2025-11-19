# @titans-tech/shared Package

Shared type definitions and DTOs used across the Titans Tech monorepo.

## Architecture

This package is organized into two main directories:

### 📁 `/types` - Type Definitions & Interfaces

Pure TypeScript interfaces and enums used for type-checking across frontend and backend.

**What goes here:**

- TypeScript interfaces
- TypeScript enums
- Type aliases
- No runtime validation
- No classes with decorators

**Examples:**

- `machines.ts` - Machine, MachineField interfaces
- `services.ts` - Service, BearingClearanceData interfaces
- `blueprints.ts` - Blueprint, BlueprintField interfaces
- `enums.ts` - FoundationType, FrameType enums

**Usage:**

```typescript
import { Machine, Blueprint, ServiceType } from '@titans-tech/shared/types';
```

### 📁 `/backend-dtos` - Data Transfer Objects

DTOs with runtime validation (Zod schemas) and transformation (class-transformer).

#### `/backend-dtos/requests-dto` - Request DTOs

Zod schemas for validating incoming API requests.

**What goes here:**

- Zod schemas (`z.object()`)
- Type inference from schemas (`z.infer<typeof Schema>`)
- Used by backend for validation
- Can be used by frontend for type-safety

**Examples:**

- `auth.dto.ts` - LoginDto with LoginSchema
- `machine.dto.ts` - CreateMachineDto, UpdateMachineDto
- `service/` - All service-related DTOs

**Usage:**

```typescript
// Backend
import { CreateMachineDto, CreateMachineSchema } from '@titans-tech/shared';

// Frontend (uses the inferred type)
import { CreateMachineDto } from '@titans-tech/shared';
const data: CreateMachineDto = { ... };
```

#### `/backend-dtos/responses-dto` - Response DTOs

Classes with class-transformer decorators for API responses.

**What goes here:**

- Class definitions with `@Exclude()`, `@Type()` decorators
- Used by backend to transform Prisma entities to API responses
- Can be used by frontend as TypeScript types (not instantiated)

**Examples:**

- `user-response.dto.ts` - UserResponseDto
- `sysadmin-response.dto.ts` - SysAdminResponseDto

**Usage:**

```typescript
// Backend (instantiates the class)
import { UserResponseDto } from '@titans-tech/shared';
return new UserResponseDto(user);

// Frontend (uses as type only)
import { UserResponseDto } from '@titans-tech/shared';
const user: UserResponseDto = await api.getUser();
```

## Import Patterns

### ✅ Correct Usage

**Frontend:**

```typescript
// Import interfaces/types from /types
import { Machine, Service, Blueprint } from '@titans-tech/shared/types';

// Import DTOs for type-safety (as types, not for instantiation)
import { CreateMachineDto, UserResponseDto } from '@titans-tech/shared';
```

**Backend:**

```typescript
// Import DTOs for validation and transformation
import { CreateMachineDto, CreateMachineSchema, UserResponseDto } from '@titans-tech/shared';

// Import interfaces when you need just the type shape
import { Machine, Service } from '@titans-tech/shared/types';
```

### ❌ Incorrect Usage

```typescript
// ❌ Don't import DTOs from /types (they don't exist there)
import { CreateMachineDto } from '@titans-tech/shared/types';

// ❌ Don't instantiate response DTO classes in frontend
import { UserResponseDto } from '@titans-tech/shared';
const user = new UserResponseDto(data); // Only backend does this
```

## Key Principles

1. **Types folder = Pure TypeScript** (no runtime dependencies)
2. **Backend-DTOs = Runtime validation & transformation** (Zod, class-transformer)
3. **Frontend can import both** - types for type-checking, DTOs for matching API contracts
4. **Single source of truth** - No duplicate type definitions
5. **Enums from database** - Import enums from `@titans-tech/db` when they match Prisma schema

## Directory Structure

```
packages/shared/
├── types/                           # Pure TypeScript types
│   ├── index.ts
│   ├── enums.ts                     # TypeScript enums
│   ├── machines.ts                  # Machine interfaces
│   ├── services.ts                  # Service interfaces
│   ├── blueprints.ts                # Blueprint interfaces
│   └── bearing-fields.ts            # Bearing field types
│
├── backend-dtos/
│   ├── requests-dto/                # Request DTOs with Zod
│   │   ├── index.ts
│   │   ├── auth.dto.ts
│   │   ├── machine.dto.ts
│   │   ├── blueprint.dto.ts
│   │   ├── service/
│   │   │   ├── index.ts
│   │   │   ├── service.dto.ts
│   │   │   └── service-sections.dto.ts
│   │   └── ...
│   │
│   └── responses-dto/               # Response DTOs with class-transformer
│       ├── user-response.dto.ts
│       ├── sysadmin-response.dto.ts
│       └── ...
│
└── README.md                        # This file
```

## Migration Notes

All DTOs have been moved from `/types` to `/backend-dtos` to maintain clear separation:

- `/types` now contains ONLY interfaces and type definitions
- All Zod validation schemas are in `/backend-dtos/requests-dto`
- All class-transformer response classes are in `/backend-dtos/responses-dto`
