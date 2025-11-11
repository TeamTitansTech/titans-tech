# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Turborepo monorepo** for a machine inspection and maintenance management system. The project uses a multi-tenant architecture with subdomain-based routing for company access.

### Technology Stack

- **Frontend**: Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Monorepo**: Turborepo with npm workspaces
- **Internationalization**: next-intl
- **Authentication**: JWT tokens stored in cookies

## Monorepo Structure

```
apps/
  dashboard/          # Next.js frontend application
  backend/            # NestJS backend API
packages/
  database/          # Prisma schema and database utilities (@titans-tech/db)
  shared/            # Shared types and DTOs (@titans-tech/shared)
  eslint-config/     # Shared ESLint configuration
  tsconfig/          # Shared TypeScript configurations
```

## Common Commands

### Development
```bash
# Start all apps in development mode
npm run dev

# Start only the dashboard
cd apps/dashboard && npm run dev

# Start only the backend
cd apps/backend && npm run dev
```

### Database
```bash
# Start PostgreSQL container
npm run docker:up

# Full database setup (Docker + Prisma + seed)
npm run db:setup

# Reset database (drops all data)
npm run db:reset

# Generate Prisma client (required after schema changes)
cd packages/database && npm run db:generate

# Create database migrations
cd packages/database && npm run db:migrate

# Open Prisma Studio
cd packages/database && npm run db:studio

# Seed database with test data
cd packages/database && npm run db:seed

# Create system admin user
cd packages/database && npm run db:create-sys-admin

# Create test user
cd packages/database && npm run db:create-test-user
```

### Build & Lint
```bash
# Build all packages (from root)
npm run build

# Lint all packages (from root)
npm run lint

# Fix linting issues in dashboard
cd apps/dashboard && npm run lint

# Format code
npm run format
```

### Testing (Backend)
```bash
cd apps/backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # End-to-end tests
```

### Docker Commands
```bash
npm run docker:up       # Start containers
npm run docker:down     # Stop containers
npm run docker:logs     # View PostgreSQL logs
npm run docker:restart  # Restart PostgreSQL
npm run docker:clean    # Remove containers and volumes
```

## Architecture Overview

### Multi-Tenant Subdomain Routing

The dashboard uses **subdomain-based multi-tenancy**:
- Root domain (`localhost` or production domain): System admin panel at `/admin`
- Subdomains (`{company-slug}.localhost`): Company-specific dashboards

Routing logic is handled in [apps/dashboard/src/proxy.ts](apps/dashboard/src/proxy.ts):
- Extracts subdomain from request
- Rewrites subdomain requests to `/s/[subdomain]/*` routes
- Enforces authentication and access control
- Redirects unauthenticated users to login

**Important**: Subdomain routing requires:
- Development: Access via `http://{subdomain}.localhost:3000`
- Production: DNS wildcard record configured

### Dashboard Application Structure

```
apps/dashboard/src/
├── app/                    # Next.js App Router routes
│   ├── (dashboard)/       # Company user routes (requires subdomain)
│   ├── s/[subdomain]/     # Rewritten subdomain routes
│   ├── admin/             # System admin routes (root domain only)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components (Sidebar, AppHeader)
├── contexts/              # React contexts (AuthContext, SysAdminContext, CompanyUserContext)
├── data/
│   ├── services/          # API service functions (*.api.ts)
│   ├── types/             # TypeScript types
│   └── helpers/           # Response and error handling
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── config/                # Environment configuration
└── i18n/                  # Internationalization setup
```

### Backend Application Structure

```
apps/backend/src/
├── modules/
│   ├── auth/              # JWT authentication
│   ├── sysadmin/          # System admin management
│   ├── companies/         # Company CRUD
│   ├── company-branches/  # Branch management
│   ├── users/             # User management
│   ├── shared/            # Shared services (guards, decorators)
│   └── upload/            # File upload handling
├── blueprints/            # Machine blueprint management
├── machines/              # Machine CRUD and services
├── services/              # Service/inspection management
├── errors/                # Global error filters
├── config/                # Environment configuration
└── main.ts                # Application entry point
```

### Database Schema (Prisma)

Key models in [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma):
- `SysAdmin`: System administrators (root domain access)
- `Company`: Multi-tenant companies with unique slugs
- `CompanyBranch`: Company branches/locations
- `User`: Company users with role flags (isCompanyAdmin, isCompanyManager, etc.)
- `UserBranch`: Many-to-many relationship between users and branches
- `Machine`: Equipment tracked in the system
- `Blueprint`: Machine templates with sections
- `Service`: Inspections and maintenance records
- Various section models for bearing clearance, slides, gibs, etc.

### API Communication Pattern

Frontend uses a centralized API handler in [apps/dashboard/src/data/helpers/responseHandler.ts](apps/dashboard/src/data/helpers/responseHandler.ts):
- Handles authentication via JWT cookies
- Standardized error formatting
- Type-safe responses with discriminated unions
- Automatic 401 handling and redirects

API service files in `apps/dashboard/src/data/services/*.api.ts`:
- Use `'use server'` directive for Server Actions
- Call `responseHandler<T>()` for all API requests
- Return structured responses: `{ data, errors, rawErrors }`

Example API service:
```typescript
'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

export const getItem = async (id: string) => {
  return await responseHandler<ItemType>(`/items/${id}`);
};
```

### Shared Package Usage

The `@titans-tech/shared` package contains:
- Shared TypeScript types (in `types/`)
- DTOs for backend communication (in `backend-dtos/`)
- Validators and transformers

Import from dashboard:
```typescript
import { SomeType } from '@titans-tech/shared/types';
```

Import from backend:
```typescript
import { CreateCompanyDto } from '@titans-tech/shared';
```

### Authentication Flow

1. User logs in via `/admin` (sys admin) or subdomain root (company users)
2. Backend returns JWT token
3. Frontend stores token in `auth_token` cookie
4. All API requests include `Authorization: Bearer {token}` header
5. Backend validates token using NestJS guards
6. Middleware in `proxy.ts` enforces authentication on protected routes

Context providers:
- `SysAdminContext`: System admin user state and permissions
- `CompanyUserContext`: Company user state, branches, and permissions
- `AuthContext`: General authentication state

### Image Upload with AWS S3

The system supports image uploads for Blueprint models using AWS S3:

**Backend Implementation**:
- Upload module: `apps/backend/src/modules/upload/`
- Endpoint: `POST /upload/image` (public, multipart/form-data)
- Service uses AWS SDK v3 (@aws-sdk/client-s3)
- Validates file type (JPG/PNG only) and size (max 10MB)
- Generates unique filenames with nanoid + timestamp
- Returns public S3 URL upon successful upload

**Frontend Implementation**:
- Upload service: `apps/dashboard/src/data/services/upload.api.ts`
- Reusable component: `apps/dashboard/src/components/ui/image-upload.tsx`
- Features: preview, upload progress, error handling, remove functionality

**S3 Configuration**:
- Bucket: `titechjf-bucket`
- Region: `us-east-2` (Ohio)
- ACL: `public-read` for direct access
- File naming: `blueprints/{nanoid}-{timestamp}.{ext}`

**Usage Example**:
```typescript
import { ImageUpload } from '@/components/ui/image-upload';

<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  disabled={isLoading}
/>
```

## Important Conventions

### ESLint Rules

**Critical**: The dashboard has a custom ESLint rule that **blocks usage of Next.js `useRouter()`**. Instead, use `useInternalRouter()` from `apps/dashboard/src/hooks/useInternalRouter.ts`. This ensures proper subdomain-aware routing.

### Git Hooks

A pre-push hook prevents direct pushes to the `main` branch:
- Enforced via `.githooks/pre-push`
- Installed automatically via `npm run install:hooks` (runs on postinstall)
- Bypass: Include `[allow-direct-push]` in commit message or use `git push --no-verify`
- Always create pull requests for main branch changes

### Environment Variables

Dashboard environment variables (`.env.local`):
```
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
```

Backend environment variables (`.env`):
```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/titans_tech
JWT_SECRET=your-secret-here

# AWS S3 Configuration for Image Upload
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=titechjf-bucket
```

### Turbo Task Dependencies

Defined in [turbo.json](turbo.json):
- `build` depends on `db:generate` and `^build`
- `dev` runs with `@titans-tech/db#db:generate`
- Database tasks are never cached

When making schema changes:
1. Edit `packages/database/prisma/schema.prisma`
2. Run `cd packages/database && npm run db:generate`
3. Run `cd packages/database && npm run db:migrate` (creates migration)
4. Rebuild dependent packages if needed

### Internationalization

The dashboard uses `next-intl` for i18n:
- Configuration in `apps/dashboard/src/i18n/`
- Translations should be added to locale files
- Use `useTranslations()` hook in components
- Server components use `getTranslations()`

## Development Workflow

1. **Starting fresh**:
   ```bash
   npm install
   npm run db:setup
   npm run dev
   ```

2. **Making database changes**:
   - Edit `packages/database/prisma/schema.prisma`
   - Run `cd packages/database && npm run db:migrate`
   - Prisma client regenerates automatically

3. **Adding new API endpoints**:
   - Backend: Create controller and service in appropriate module
   - Frontend: Create service function in `apps/dashboard/src/data/services/*.api.ts`
   - Use `responseHandler<T>()` for type safety

4. **Creating new UI components**:
   - Use shadcn/ui components from `apps/dashboard/src/components/ui/`
   - Add custom components to `apps/dashboard/src/components/`
   - Follow existing patterns for layout components

5. **Subdomain testing**:
   - Create a company with a slug (e.g., "acme")
   - Access at `http://acme.localhost:3000`
   - System admin panel remains at `http://localhost:3000/admin`

## Package Manager

This project uses **npm** (version 10.9.2+). Do not use yarn or pnpm as the lockfile is `package-lock.json`.

## Node Version

Requires Node.js >= 18.0.0 (specified in root `package.json` engines field).
