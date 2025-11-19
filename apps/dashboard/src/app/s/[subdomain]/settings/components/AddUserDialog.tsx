'use client';

import { useState, useMemo } from 'react';
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

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  branchId,
  branchName,
  onSuccess,
}: AddUserDialogProps) {
  const t = useTranslations('settings.addUserDialog');
  const tValidation = useTranslations('validation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, tValidation('fullNameRequired')),
        email: z.string().email(tValidation('invalidEmail')),
        role: z.enum(['Manager', 'Worker']),
      }),
    [tValidation],
  );

  type UserFormData = z.infer<typeof userSchema>;

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
      role: 'Worker',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      const response = await createUser({
        branchId,
        data: {
          name: data.name,
          email: data.email,
          isCompanyAdmin: false,
          isCompanyManager: false,
        },
      });

      if (!response.data) {
        toast.error(t('error'));
        return;
      }

      // Set branch-specific permissions based on role
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
        readServices: false,
        createServices: false,
        updateServices: false,
        deleteServices: false,
      };

      if (data.role === 'Manager') {
        // Manager: One per branch, has admin permissions for the branch
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
        permissions.readServices = true;
        permissions.createServices = true;
        permissions.updateServices = true;
        permissions.deleteServices = true;
      } else if (data.role === 'Worker') {
        // Worker: Standard employee with basic operational access
        permissions.readBranches = true;
        permissions.readBlueprints = true;
        permissions.readMachines = true;
        permissions.readServices = true;
        permissions.createServices = true;
        permissions.updateServices = true;
      }

      await setUserPermissions({
        branchId,
        userId: response.data.id,
        permissions,
      });

      toast.success(t('success'));
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(t('error'));
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
