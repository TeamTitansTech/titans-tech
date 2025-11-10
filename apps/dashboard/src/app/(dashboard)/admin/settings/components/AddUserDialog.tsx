'use client';

import { useState } from 'react';
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
import { createUser } from '@/data/services/users.api';
import { setUserPermissions } from '@/data/services/company-branches.api';

const userSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Admin', 'Inspector', 'Operator', 'Viewer']),
});

type UserFormData = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

const ROLE_DESCRIPTIONS = {
  Admin: 'Full access',
  Inspector: 'Can review and approve',
  Operator: 'Can operate machines',
  Viewer: 'Read-only',
};

export function AddUserDialog({
  open,
  onOpenChange,
  branchId,
  branchName,
  onSuccess,
}: AddUserDialogProps) {
  const t = useTranslations('adminSettings.addUserDialog');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      role: 'Viewer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      // Create user with basic info
      const response = await createUser({
        branchId,
        data: {
          name: data.name,
          email: data.email,
          isCompanyAdmin: data.role === 'Admin',
          isCompanyManager: false,
        },
      });

      if (!response.data) {
        toast.error(t('error') || 'Failed to create user');
        return;
      }

      // Set branch-specific permissions based on role
      if (data.role !== 'Admin') {
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

        // Set permissions based on role
        if (data.role === 'Inspector') {
          permissions.readInspections = true;
          permissions.createInspections = true;
          permissions.updateInspections = true;
          permissions.readMachines = true;
          permissions.readBlueprints = true;
        } else if (data.role === 'Operator') {
          permissions.readMachines = true;
          permissions.readInspections = true;
          permissions.readBlueprints = true;
        } else if (data.role === 'Viewer') {
          permissions.readInspections = true;
          permissions.readMachines = true;
          permissions.readBlueprints = true;
        }

        await setUserPermissions({
          branchId,
          userId: response.data.id,
          permissions,
        });
      }

      toast.success(t('success'));
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(t('error') || 'Failed to create user');
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
            <Label htmlFor="name">
              {t('form.name.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('form.name.placeholder')}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t('form.email.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t('form.email.placeholder')}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              {t('form.role.label')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as UserFormData['role'])}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder={t('form.role.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Inspector">Inspector</SelectItem>
                <SelectItem value="Operator">Operator</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
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
