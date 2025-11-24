# Component Consolidation Status

**Last Updated**: 2025-11-23
**Goal**: Eliminate code duplication between admin and client sections by creating shared, reusable components with proper permission checks.

---

## ✅ Phase 1: Completed Components

### 1. **MachineCard** (✅ DONE)

- **Location**: `src/components/shared/MachineCard.tsx`
- **Admin wrapper**: `src/app/admin/machines/components/MachineCard.tsx`
- **Client wrapper**: `src/app/s/[subdomain]/machines/components/MachineCard.tsx`
- **Savings**: ~140 lines
- **Features**:
  - Flexible status display (circle or badge)
  - Optional Edit/Delete actions for admin
  - Permission-based "View Details" button
  - Configurable base path for routing

### 2. **GeneralSettingsSection** (✅ DONE)

- **Location**: `src/components/shared/settings/GeneralSettingsSection.tsx`
- **Savings**: ~90 lines
- **Features**:
  - Language selector (English, Portuguese, Spanish)
  - Unit system selector (Metric, Imperial)
  - Flexible translation namespace prop
  - Works in both admin and client contexts

### 3. **AddUserDialog** (✅ DONE)

- **Location**: `src/components/shared/settings/AddUserDialog.tsx`
- **Savings**: ~240 lines
- **Features**:
  - Full permissions editor integration
  - "Apply to all branches" option
  - "Promote to Company Manager" (admin-only)
  - Flexible translation namespace
  - Optional user context for permission checks
  - Works for both sysadmin and company users

---

## 🔄 Phase 2: Remaining Settings Components

### 4. **EditUserDialog** (In Progress)

**Current Locations**:

- Admin: `src/app/admin/settings/components/EditUserDialog.tsx` (295 lines)
- Client: `src/app/s/[subdomain]/settings/components/EditUserDialog.tsx` (309 lines)

**Key Differences**:

- Client has full permissions editor
- Admin has simpler role dropdown
- Both have email/name editing

**Shared Component Pattern**:

```typescript
// src/components/shared/settings/EditUserDialog.tsx
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto;
  branchId: string;
  onSuccess: () => void;
  translationNamespace?: string;
  currentUser?: { isCompanyAdmin: boolean; isCompanyManager: boolean } | null;
  companyId?: string;
}
```

### 5. **DeleteUserDialog** (In Progress)

**Current Locations**:

- Admin: `src/app/admin/settings/components/DeleteUserDialog.tsx` (99 lines)
- Client: `src/app/s/[subdomain]/settings/components/DeleteUserDialog.tsx` (154 lines)

**Key Differences**:

- Client has permission checks
- Client shows more detailed user info
- Both have confirmation dialog

**Shared Component Pattern**:

```typescript
// src/components/shared/settings/DeleteUserDialog.tsx
interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; name: string; email: string };
  branchId: string;
  onSuccess: () => void;
  translationNamespace?: string;
}
```

### 6. **BranchUserManagement** (In Progress)

**Current Locations**:

- Admin: `src/app/admin/settings/components/BranchUserManagement.tsx` (261 lines)
- Client: `src/app/s/[subdomain]/settings/components/BranchUserManagement.tsx` (272 lines)

**Key Features**:

- User table with permissions display
- Add/Edit/Delete user actions
- Branch-specific user list
- Permission badges

**Shared Component Pattern**:

```typescript
// src/components/shared/settings/BranchUserManagement.tsx
interface BranchUserManagementProps {
  branchId: string;
  branchName: string;
  translationNamespace?: string;
  currentUser?: UserResponseDto | null;
  companyId?: string;
}
```

### 7. **BranchesSection** (In Progress)

**Current Locations**:

- Admin: `src/app/admin/settings/components/BranchesSection.tsx` (179 lines)
- Client: `src/app/s/[subdomain]/settings/components/BranchesSection.tsx` (130 lines)

**Key Differences**:

- Admin shows all branches for all companies
- Client shows only current company branches
- Different permission checks

**Shared Component Pattern**:

```typescript
// src/components/shared/settings/BranchesSection.tsx
interface BranchesSectionProps {
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  translationNamespace?: string;
  // For client: filter by company
  companyId?: string;
  // For admin: show all companies
  showAllCompanies?: boolean;
}
```

---

## 🔄 Phase 3: Machine Components

### 8. **ServiceHistory** (Pending)

**Current Locations**:

- Admin: `src/app/admin/machines/[id]/components/ServiceHistory.tsx` (34 lines)
- Client: `src/app/s/[subdomain]/machines/[id]/components/ServiceHistory.tsx` (27 lines)

**Key Differences**:

- Very similar, minor routing differences
- Both display service records in a table

**Shared Component Pattern**:

```typescript
// src/components/shared/machines/ServiceHistory.tsx
interface ServiceHistoryProps {
  machineId: string;
  basePath?: string; // '/admin/machines' or '/machines'
}
```

---

## 📊 Estimated Savings

| Component                 | Admin Lines | Client Lines | Total Duplication | Shared Lines | Net Savings      |
| ------------------------- | ----------- | ------------ | ----------------- | ------------ | ---------------- |
| MachineCard ✅            | 140         | 102          | 242               | 210          | ~140             |
| GeneralSettingsSection ✅ | 92          | 93           | 185               | 105          | ~90              |
| AddUserDialog ✅          | 246         | 240          | 486               | 260          | ~240             |
| EditUserDialog            | 295         | 309          | 604               | ~320         | ~290             |
| DeleteUserDialog          | 99          | 154          | 253               | ~120         | ~135             |
| BranchUserManagement      | 261         | 272          | 533               | ~280         | ~255             |
| BranchesSection           | 179         | 130          | 309               | ~150         | ~160             |
| ServiceHistory            | 34          | 27           | 61                | ~30          | ~30              |
| **TOTAL**                 | **1,346**   | **1,327**    | **2,673**         | **~1,475**   | **~1,340 lines** |

---

## 🎯 Implementation Strategy

### For Each Component:

1. **Create Shared Version** in `src/components/shared/[category]/`
   - Based on the MORE feature-rich version (usually client)
   - Add flexible props for translation namespace
   - Add optional `currentUser` prop for permission checks
   - Add optional `companyId` for context

2. **Create Admin Wrapper** in original location

   ```typescript
   export function ComponentName(props) {
     return (
       <SharedComponentName
         {...props}
         translationNamespace="adminSettings.componentName"
         currentUser={null} // Sysadmin has full permissions
       />
     );
   }
   ```

3. **Create Client Wrapper** in original location
   ```typescript
   export function ComponentName(props) {
     const { companyUser } = useCompanyUser();
     return (
       <SharedComponentName
         {...props}
         translationNamespace="settings.componentName"
         currentUser={companyUser}
         companyId={companyUser?.companyId}
       />
     );
   }
   ```

---

## 🚀 Next Steps

### Option A: Complete All Components (Recommended)

- Finish creating all 8 shared components
- Update all admin wrappers
- Update all client wrappers
- Run full test suite
- **Estimated Time**: 2-3 hours
- **Benefit**: Maximum code reuse, single source of truth

### Option B: Incremental Approach

- Complete settings components first (5 components)
- Test settings thoroughly
- Then complete machine components
- **Estimated Time**: 1 hour for settings, 30min for machines
- **Benefit**: Safer, allows for testing between phases

### Option C: Priority Components Only

- Focus on highest duplication: EditUserDialog, BranchUserManagement
- Leave smaller components for later
- **Estimated Time**: 1 hour
- **Benefit**: Quick wins on biggest duplicates

---

## ⚠️ Important Notes

1. **Translation Keys**: All shared components support both `adminSettings.*` and `settings.*` namespaces
2. **Permission Checks**: Sysadmin (`currentUser = null`) gets full permissions by default
3. **Context Providers**: Client wrappers use `useCompanyUser()`, admin doesn't need it
4. **Backward Compatibility**: All existing imports continue to work (wrappers preserve API)
5. **Type Safety**: Full TypeScript support maintained throughout

---

## 📝 Testing Checklist

After consolidation, verify:

- [ ] Admin can create/edit/delete users with full permissions
- [ ] Client users see permission checks working correctly
- [ ] Company admins can promote to manager
- [ ] Company managers can manage users in their branches
- [ ] Regular users see restricted options
- [ ] All translation keys work in both contexts
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Build succeeds

---

## 💡 Future Improvements

Once consolidation is complete:

1. **Add Storybook stories** for all shared components
2. **Add unit tests** for permission logic
3. **Create documentation** for using shared components
4. **Add E2E tests** for critical user flows
5. **Consider extracting** to a separate component library package

---

**Status**: 🟢 In Progress - 3/8 components complete, ~470 lines saved so far
