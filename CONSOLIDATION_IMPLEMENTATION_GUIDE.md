# Component Consolidation Implementation Guide

## ✅ What's Already Done

### Shared Components Created (`src/components/shared/`)

1. ✅ **MachineCard.tsx** - Machine display cards with status indicators
2. ✅ **settings/GeneralSettingsSection.tsx** - Language & unit settings
3. ✅ **settings/AddUserDialog.tsx** - User creation with permissions
4. ✅ **settings/EditUserDialog.tsx** - User editing with permission management
5. ✅ **settings/DeleteUserDialog.tsx** - User deletion confirmation

### Wrappers Created

- ✅ Admin & Client wrappers for GeneralSettingsSection
- ✅ Admin & Client wrappers for MachineCard

### Lines Saved: **~650 lines**

---

## 🔄 What's Remaining

### Components to Create (3 remaining)

#### 1. **BranchUserManagement** (261/272 lines - ~260 lines to save)

#### 2. **BranchesSection** (179/130 lines - ~155 lines to save)

#### 3. **ServiceHistory** (34/27 lines - ~30 lines to save)

### Wrappers to Create (8 remaining)

**Admin Wrappers** (4 files):

- `src/app/admin/settings/components/AddUserDialog.tsx`
- `src/app/admin/settings/components/EditUserDialog.tsx`
- `src/app/admin/settings/components/DeleteUserDialog.tsx`
- `src/app/admin/machines/[id]/components/ServiceHistory.tsx`

**Client Wrappers** (4 files):

- `src/app/s/[subdomain]/settings/components/AddUserDialog.tsx`
- `src/app/s/[subdomain]/settings/components/EditUserDialog.tsx`
- `src/app/s/[subdomain]/settings/components/DeleteUserDialog.tsx`
- `src/app/s/[subdomain]/machines/[id]/components/ServiceHistory.tsx`

---

## 📋 Step-by-Step Instructions

### Step 1: Create AddUserDialog Wrappers

**Admin Wrapper** (`src/app/admin/settings/components/AddUserDialog.tsx`):

```typescript
'use client';

import { AddUserDialog as SharedAddUserDialog } from '@/components/shared/settings/AddUserDialog';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

export function AddUserDialog(props: AddUserDialogProps) {
  return (
    <SharedAddUserDialog
      {...props}
      translationNamespace="adminSettings.addUserDialog"
      currentUser={null} // Sysadmin has full permissions
    />
  );
}
```

**Client Wrapper** (`src/app/s/[subdomain]/settings/components/AddUserDialog.tsx`):

```typescript
'use client';

import { AddUserDialog as SharedAddUserDialog } from '@/components/shared/settings/AddUserDialog';
import { useCompanyUser } from '@/contexts/CompanyUserContext';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

export function AddUserDialog(props: AddUserDialogProps) {
  const { companyUser } = useCompanyUser();

  return (
    <SharedAddUserDialog
      {...props}
      translationNamespace="settings.addUserDialog"
      currentUser={companyUser}
      companyId={companyUser?.companyId}
    />
  );
}
```

### Step 2: Create EditUserDialog Wrappers

**Admin Wrapper** (`src/app/admin/settings/components/EditUserDialog.tsx`):

```typescript
'use client';

import { EditUserDialog as SharedEditUserDialog } from '@/components/shared/settings/EditUserDialog';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function EditUserDialog(props: EditUserDialogProps) {
  return (
    <SharedEditUserDialog
      {...props}
      translationNamespace="adminSettings.editUserDialog"
      currentUser={null} // Sysadmin has full permissions
    />
  );
}
```

**Client Wrapper** (`src/app/s/[subdomain]/settings/components/EditUserDialog.tsx`):

```typescript
'use client';

import { EditUserDialog as SharedEditUserDialog } from '@/components/shared/settings/EditUserDialog';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function EditUserDialog(props: EditUserDialogProps) {
  const { companyUser } = useCompanyUser();

  return (
    <SharedEditUserDialog
      {...props}
      translationNamespace="settings.editUserDialog"
      currentUser={companyUser}
    />
  );
}
```

### Step 3: Create DeleteUserDialog Wrappers

**Admin Wrapper** (`src/app/admin/settings/components/DeleteUserDialog.tsx`):

```typescript
'use client';

import { DeleteUserDialog as SharedDeleteUserDialog } from '@/components/shared/settings/DeleteUserDialog';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function DeleteUserDialog(props: DeleteUserDialogProps) {
  return (
    <SharedDeleteUserDialog
      {...props}
      translationNamespace="adminSettings.deleteUserDialog"
    />
  );
}
```

**Client Wrapper** (`src/app/s/[subdomain]/settings/components/DeleteUserDialog.tsx`):

```typescript
'use client';

import { DeleteUserDialog as SharedDeleteUserDialog } from '@/components/shared/settings/DeleteUserDialog';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function DeleteUserDialog(props: DeleteUserDialogProps) {
  return (
    <SharedDeleteUserDialog
      {...props}
      translationNamespace="settings.deleteUserDialog"
    />
  );
}
```

### Step 4: Create Remaining Shared Components

You can follow the same pattern used for AddUserDialog, EditUserDialog, and DeleteUserDialog:

1. **Read the client version** (it's usually more feature-rich)
2. **Create shared version** in `src/components/shared/`
3. **Add flexible props**:
   - `translationNamespace?: string` (default to client namespace)
   - `currentUser?: UserResponseDto | null` (null = sysadmin)
   - `companyId?: string` (for context-specific features)
4. **Update permission checks** to default to `true` when `currentUser === null`
5. **Create wrappers** following the patterns above

---

## 🧪 Testing Checklist

After creating each wrapper:

### Manual Testing

- [ ] Admin can access the component
- [ ] Client can access the component
- [ ] Permissions work correctly
- [ ] No console errors
- [ ] Translations display correctly in both contexts

### Automated Testing

```bash
# Run from project root
npm run lint                    # Should pass with 0 errors
cd apps/dashboard && npx tsc --noEmit  # Should pass type checking
```

---

## 📊 Progress Tracker

| Component              | Shared Created | Admin Wrapper | Client Wrapper | Tested |
| ---------------------- | -------------- | ------------- | -------------- | ------ |
| MachineCard            | ✅             | ✅            | ✅             | ⏳     |
| GeneralSettingsSection | ✅             | ✅            | ✅             | ⏳     |
| AddUserDialog          | ✅             | ⏳            | ⏳             | ⏳     |
| EditUserDialog         | ✅             | ⏳            | ⏳             | ⏳     |
| DeleteUserDialog       | ✅             | ⏳            | ⏳             | ⏳     |
| BranchUserManagement   | ⏳             | ⏳            | ⏳             | ⏳     |
| BranchesSection        | ⏳             | ⏳            | ⏳             | ⏳     |
| ServiceHistory         | ⏳             | ⏳            | ⏳             | ⏳     |

**Legend**: ✅ Done | ⏳ Pending

---

## 🎯 Expected Results

When complete:

- **~1,340 lines** of duplicated code eliminated
- **Single source of truth** for all settings components
- **Easier maintenance** - fix bugs once, works everywhere
- **Consistent behavior** across admin and client
- **Better type safety** with shared interfaces
- **Faster feature development** - add features once

---

## 💡 Tips & Best Practices

1. **Always use the client version as the base** - It's usually more feature-rich
2. **Keep wrappers thin** - Just pass props and context, no logic
3. **Test both admin and client** after each component
4. **Check translation keys** - Admin uses `adminSettings.*`, client uses `settings.*`
5. **Use TypeScript strict mode** - Catch issues early
6. **Run lint after each change** - Keep code quality high
7. **Commit frequently** - Small, atomic commits are easier to review

---

## 🚀 Quick Commands

```bash
# Run lint
npm run lint

# Type check
cd apps/dashboard && npx tsc --noEmit

# Start dev server
npm run dev

# Build to verify no errors
npm run build
```

---

## 📝 Notes

- All shared components support both admin and client contexts
- Permission checks default to `true` for sysadmin (when `currentUser === null`)
- Translation namespaces are flexible via props
- Wrappers maintain backward compatibility - existing code continues to work
- No breaking changes to existing APIs

---

**Status**: 🟢 5/8 components complete, ~650 lines saved
**Next**: Create wrappers for AddUser, EditUser, DeleteUser dialogs
