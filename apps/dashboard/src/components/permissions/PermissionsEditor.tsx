'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookmarkPlus, Info } from 'lucide-react';
import { RolePresetSelector } from './RolePresetSelector';
import { PermissionCheckbox } from './PermissionCheckbox';
import { PermissionTemplateManager } from './PermissionTemplateManager';
import {
  Permissions,
  RolePreset,
  PERMISSION_GROUPS,
  getPresetPermissions,
  detectRolePreset,
  BranchPermissionType,
  setCategoryPermissions,
  PermissionCategory,
  enableWithPrerequisites,
  disableWithDependents,
} from '@titans-tech/shared/types';
import { cn } from '@/lib/utils';

interface PermissionsEditorProps {
  permissions: Permissions;
  onChange: (permissions: Permissions) => void;
  disabled?: boolean;
  showPresetSelector?: boolean;
  companyId?: string;
}

export function PermissionsEditor({
  permissions,
  onChange,
  disabled = false,
  showPresetSelector = true,
  companyId,
}: PermissionsEditorProps) {
  const t = useTranslations('settings');
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // Detect current preset
  const currentPreset = detectRolePreset(permissions);

  // Handle preset change
  const handlePresetChange = (preset: RolePreset) => {
    const newPermissions = getPresetPermissions(preset);
    onChange(newPermissions);
  };

  // Handle individual permission change
  const handlePermissionChange = (permission: BranchPermissionType, checked: boolean) => {
    if (checked) {
      // Enable permission and all its prerequisites
      onChange(enableWithPrerequisites(permissions, permission));
    } else {
      // Disable permission and all its dependents
      onChange(disableWithDependents(permissions, permission));
    }
  };

  // Handle select all for a category
  const handleSelectAllCategory = (category: PermissionCategory) => {
    let newPermissions = { ...permissions };

    // Get the permissions for this category
    const categoryGroup = PERMISSION_GROUPS.find((g) => g.category === category);
    if (categoryGroup) {
      // Enable all permissions in category with their prerequisites
      categoryGroup.permissions.forEach((permission) => {
        newPermissions = enableWithPrerequisites(newPermissions, permission);
      });
    }

    onChange(newPermissions);
  };

  // Handle clear all for a category
  const handleClearAllCategory = (category: PermissionCategory) => {
    const newPermissions = setCategoryPermissions(permissions, category, false);
    onChange(newPermissions);
  };

  return (
    <div className="space-y-6">
      {/* Role Preset Selector */}
      {showPresetSelector && (
        <>
          <RolePresetSelector
            value={currentPreset}
            onChange={handlePresetChange}
            disabled={disabled}
            companyId={companyId}
            currentPermissions={permissions}
            onApplyTemplate={onChange}
          />
          <Separator />
        </>
      )}

      {/* Permission Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t('permissions.title')}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{t('permissions.description')}</p>
          </div>
          {companyId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateManager(true)}
              disabled={disabled}
              className="h-8"
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              {t('permissions.templates')}
            </Button>
          )}
        </div>

        {/* Permission Groups */}
        <div className="space-y-5">
          {PERMISSION_GROUPS.map((group) => {
            // Check if all permissions in category are enabled
            const allEnabled = group.permissions.every((perm) => permissions[perm]);
            const someEnabled = group.permissions.some((perm) => permissions[perm]);

            return (
              <div
                key={group.category}
                className={cn(
                  'border rounded-lg p-4 space-y-3',
                  someEnabled ? 'border-primary/30 bg-primary/5' : 'border-border',
                )}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-foreground">
                    {t(`permissions.categories.${group.category}`)}
                  </h5>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAllCategory(group.category)}
                      disabled={disabled || allEnabled}
                      className="h-7 text-xs"
                    >
                      {t('permissions.actions.selectAll')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearAllCategory(group.category)}
                      disabled={disabled || !someEnabled}
                      className="h-7 text-xs"
                    >
                      {t('permissions.actions.clearAll')}
                    </Button>
                  </div>
                </div>

                {/* Info message for userManagement category */}
                {group.category === 'userManagement' && (
                  <Alert className="bg-primary/10 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs text-primary">
                      {t('permissions.userManagementInfo')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Info message for services category */}
                {group.category === 'serviceManagement' && (
                  <Alert className="bg-primary/10 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs text-primary">
                      {t('permissions.servicesInfo')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Permission Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {group.permissions.map((permission) => (
                    <PermissionCheckbox
                      key={permission}
                      permission={permission}
                      checked={permissions[permission]}
                      onChange={(checked) => handlePermissionChange(permission, checked)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Permission Summary */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
          <span className="text-sm text-foreground">
            {t('permissions.permissionCount', {
              count: Object.values(permissions).filter((v) => v === true).length,
            })}
          </span>
          {currentPreset !== RolePreset.CUSTOM && (
            <span className="text-xs text-muted-foreground">
              {t(`permissions.preset.${currentPreset}`)}
            </span>
          )}
        </div>
      </div>

      {/* Template Manager Dialog */}
      {companyId && (
        <PermissionTemplateManager
          open={showTemplateManager}
          onOpenChange={setShowTemplateManager}
          companyId={companyId}
          currentPermissions={permissions}
          onApplyTemplate={onChange}
        />
      )}
    </div>
  );
}
