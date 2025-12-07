'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { RolePreset, Permissions } from '@titans-tech/shared/types';
import type { PermissionTemplateResponseDto } from '@titans-tech/shared/backend-dtos';
import {
  getPermissionTemplates,
  deletePermissionTemplate,
} from '@/data/services/permission-templates.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RolePresetSelectorProps {
  value: RolePreset;
  onChange: (preset: RolePreset) => void;
  disabled?: boolean;
  companyId?: string;
  currentPermissions?: Permissions;
  onApplyTemplate?: (permissions: Permissions) => void;
}

export function RolePresetSelector({
  value,
  onChange,
  disabled = false,
  companyId,
  currentPermissions: _currentPermissions,
  onApplyTemplate,
}: RolePresetSelectorProps) {
  const t = useTranslations('settings');
  const tTemplates = useTranslations('settings.permissionTemplates');
  const [templates, setTemplates] = useState<PermissionTemplateResponseDto[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const presets = [
    {
      value: RolePreset.MANAGER,
      label: t('addUserDialog.form.role.options.manager'),
      description: t('addUserDialog.form.role.descriptions.manager'),
    },
    {
      value: RolePreset.WORKER,
      label: t('addUserDialog.form.role.options.worker'),
      description: t('addUserDialog.form.role.descriptions.worker'),
    },
    {
      value: RolePreset.CUSTOM,
      label: t('addUserDialog.form.role.options.custom'),
      description: t('addUserDialog.form.role.descriptions.custom'),
    },
  ];

  // Load templates when companyId is available
  useEffect(() => {
    if (companyId) {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const loadTemplates = async () => {
    if (!companyId) return;

    setIsLoadingTemplates(true);
    try {
      const response = await getPermissionTemplates(companyId);
      if (response.data) {
        setTemplates(response.data);
      } else if (response.errors) {
        console.error('Error loading templates:', response.errors);
      }
    } catch {
      console.error('Error loading templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (template: PermissionTemplateResponseDto) => {
    if (disabled) return;

    setSelectedTemplateId(template.id);
    onChange(RolePreset.CUSTOM);

    if (onApplyTemplate) {
      onApplyTemplate(template.permissions);
      toast.success(tTemplates('applied', { name: template.name }));
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();

    if (!confirm(tTemplates('confirmDelete'))) {
      return;
    }

    setIsLoadingTemplates(true);
    try {
      const response = await deletePermissionTemplate(companyId!, templateId);
      if (!response.errors) {
        toast.success(tTemplates('deleted'));
        setTemplates(templates.filter((t) => t.id !== templateId));
        if (selectedTemplateId === templateId) {
          setSelectedTemplateId(null);
        }
      } else {
        toast.error(tTemplates('errorDeleting'));
      }
    } catch {
      toast.error(tTemplates('errorDeleting'));
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('permissions.preset.label')}</Label>
      <div className="space-y-2">
        {/* Default presets */}
        {presets.map((preset) => (
          <label
            key={preset.value}
            className={cn(
              'flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors',
              value === preset.value && !selectedTemplateId
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground/30 hover:bg-muted',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <input
              type="radio"
              name="rolePreset"
              value={preset.value}
              checked={value === preset.value && !selectedTemplateId}
              onChange={() => {
                if (!disabled) {
                  onChange(preset.value);
                  setSelectedTemplateId(null);
                }
              }}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border"
            />
            <div className="flex-1">
              <div className="font-medium text-sm text-foreground">{preset.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
            </div>
          </label>
        ))}

        {/* Custom templates */}
        {companyId && templates.length > 0 && (
          <>
            <div className="pt-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {tTemplates('title')}
              </Label>
            </div>
            {templates.map((template) => (
              <label
                key={template.id}
                className={cn(
                  'flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedTemplateId === template.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/30 hover:bg-muted',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                <input
                  type="radio"
                  name="rolePreset"
                  value={template.id}
                  checked={selectedTemplateId === template.id}
                  onChange={() => handleTemplateSelect(template)}
                  disabled={disabled || isLoadingTemplates}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">{template.name}</div>
                  {template.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {template.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    {Object.values(template.permissions).filter((v) => v === true).length}{' '}
                    {tTemplates('permissionsCount')}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteTemplate(e, template.id)}
                  disabled={disabled || isLoadingTemplates}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  {isLoadingTemplates ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  )}
                </Button>
              </label>
            ))}
          </>
        )}

        {/* Loading state */}
        {companyId && isLoadingTemplates && templates.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
            {tTemplates('loading')}
          </div>
        )}
      </div>
    </div>
  );
}
