'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { updateUser } from '@/data/services/users.api';
import { setUserPermissions, getBranch } from '@/data/services/company-branches.api';
import type { UserResponseDto } from '@titans-tech/shared';

const userSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Manager', 'Worker']),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  branchId,
  branchName,
  onSuccess,
}: EditUserDialogProps) {
  const t = useTranslations('adminSettings.editUserDialog');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');

  // Determine initial role based on user data
  const determineRole = useCallback(
    (userData: UserResponseDto | null): 'Manager' | 'Worker' => {
      if (!userData) return 'Worker';

      const branchPermissions = userData.branches?.find((b) => b.branchId === branchId);
      if (branchPermissions) {
        const hasManagerPermissions =
          branchPermissions.createUsers ||
          branchPermissions.manageUserPermissions ||
          branchPermissions.updateBranches;

        if (hasManagerPermissions) {
          return 'Manager';
        }
      }

      return 'Worker';
    },
    [branchId],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: determineRole(user),
    },
  });

  const selectedRole = watch('role');

  // Update form when user prop changes
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email);
      setValue('role', determineRole(user));
    }
  }, [user, setValue, determineRole]);

  // Fetch companyId when dialog opens
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!branchId) return;

      try {
        const response = await getBranch({ branchId });
        if (response.data) {
          setCompanyId(response.data.companyId);
        }
      } catch {
        // Silently fail
      }
    };
    fetchCompanyId();
  }, [branchId]);

  const onSubmit = async (data: UserFormData) => {
    if (!user || !companyId) return;

    setIsSubmitting(true);

    try {
      // Update user basic info
      const response = await updateUser({
        companyId,
        userId: user.id,
        data: {
          name: data.name,
          email: data.email,
        },
      });

      if (!response.data) {
        toast.error(t('error') || 'Failed to update user');
        return;
      }

      // Update permissions based on role
      const permissions: Record<string, boolean> = {
        readUsers: false,
        createUsers: false,
        updateUsers: false,
        deleteUsers: false,
        manageUserPermissions: false,
        assignUsersToBranches: false,
        readBranches: false,
        updateBranches: false,
        readBlueprints: false,
        createBlueprints: false,
        updateBlueprints: false,
        deleteBlueprints: false,
        readMachines: false,
        createMachines: false,
        updateMachines: false,
        deleteMachines: false,
        readInspections: false,
        createInspections: false,
        updateInspections: false,
        deleteInspections: false,
      };

      if (data.role === 'Manager') {
        // Manager: Full branch permissions
        permissions.readUsers = true;
        permissions.createUsers = true;
        permissions.updateUsers = true;
        permissions.deleteUsers = true;
        permissions.manageUserPermissions = true;
        permissions.assignUsersToBranches = true;
        permissions.readBranches = true;
        permissions.updateBranches = true;
        permissions.readBlueprints = true;
        permissions.createBlueprints = true;
        permissions.updateBlueprints = true;
        permissions.deleteBlueprints = true;
        permissions.readMachines = true;
        permissions.createMachines = true;
        permissions.updateMachines = true;
        permissions.deleteMachines = true;
        permissions.readInspections = true;
        permissions.createInspections = true;
        permissions.updateInspections = true;
        permissions.deleteInspections = true;
      } else if (data.role === 'Worker') {
        // Worker: Basic operational permissions
        permissions.readBranches = true;
        permissions.readBlueprints = true;
        permissions.readMachines = true;
        permissions.readInspections = true;
        permissions.createInspections = true;
        permissions.updateInspections = true;
      }

      await setUserPermissions({
        branchId,
        userId: user.id,
        permissions,
      });

      toast.success(t('success'));
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(t('error') || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { branchName })}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              {t('form.name.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              {...register('name')}
              placeholder={t('form.name.placeholder')}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">
              {t('form.email.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              {...register('email')}
              placeholder={t('form.email.placeholder')}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">
              {t('form.role.label')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as UserFormData['role'])}
              disabled={isSubmitting}
            >
              <SelectTrigger id="edit-role">
                <SelectValue placeholder={t('form.role.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">{t('form.role.options.manager')}</SelectItem>
                <SelectItem value="Worker">{t('form.role.options.worker')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}

            <p className="text-xs text-muted-foreground">
              {t(`form.role.descriptions.${selectedRole.toLowerCase()}`)}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
