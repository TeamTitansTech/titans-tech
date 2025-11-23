'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookmarkPlus } from 'lucide-react';
import { RolePresetSelector } from './RolePresetSelector';
import { PermissionCheckbox } from './PermissionCheckbox';
import { PermissionTemplateManager } from './PermissionTemplateManager';
import {
  Permissions,
  RolePreset,
  PERMISSION_GROUPS,
  getPresetPermissions,
  detectRolePreset,
  PermissionName,
  setCategoryPermissions,
  PermissionCategory,
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

  // Define permission dependencies: these permissions require the "read" permission
  const permissionDependencies: Record<string, PermissionName> = {
    createUsers: 'readUsers',
    updateUsers: 'readUsers',
    deleteUsers: 'readUsers',
    updateBranches: 'readBranches',
    createMachines: 'readMachines',
    updateMachines: 'readMachines',
    deleteMachines: 'readMachines',
    createServices: 'readServices',
    updateServices: 'readServices',
    deleteServices: 'readServices',
    createProductionLines: 'readProductionLines',
    updateProductionLines: 'readProductionLines',
    deleteProductionLines: 'readProductionLines',
  };

  // Get the read permission for a given category
  const getDependentPermissions = (readPermission: PermissionName): PermissionName[] => {
    return Object.entries(permissionDependencies)
      .filter(([_, dep]) => dep === readPermission)
      .map(([perm]) => perm as PermissionName);
  };

  // Check if a permission should be disabled
  const isPermissionDisabled = (permission: PermissionName): boolean => {
    if (disabled) return true;
    const requiredPermission = permissionDependencies[permission];
    if (requiredPermission) {
      return !permissions[requiredPermission];
    }
    return false;
  };

  // Handle individual permission change
  const handlePermissionChange = (permission: PermissionName, checked: boolean) => {
    const newPermissions = {
      ...permissions,
      [permission]: checked,
    };

    // If unchecking a read permission, also uncheck all dependent permissions
    if (!checked) {
      const dependents = getDependentPermissions(permission);
      if (dependents.length > 0) {
        dependents.forEach((dep) => {
          newPermissions[dep] = false;
        });
      }
    }

    onChange(newPermissions);
  };

  // Handle select all for a category
  const handleSelectAllCategory = (category: PermissionCategory) => {
    const newPermissions = setCategoryPermissions(permissions, category, true);
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
            <h4 className="text-sm font-semibold text-gray-900">{t('permissions.title')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{t('permissions.description')}</p>
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
                  someEnabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200',
                )}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-900">
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

                {/* Permission Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {group.permissions.map((permission) => (
                    <PermissionCheckbox
                      key={permission}
                      permission={permission}
                      checked={permissions[permission]}
                      onChange={(checked) => handlePermissionChange(permission, checked)}
                      disabled={isPermissionDisabled(permission)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Permission Summary */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-700">
            {t('permissions.permissionCount', {
              count: Object.values(permissions).filter((v) => v === true).length,
            })}
          </span>
          {currentPreset !== RolePreset.CUSTOM && (
            <span className="text-xs text-gray-500">
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
