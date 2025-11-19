'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { RolePreset } from '@titans-tech/shared/types';
import { cn } from '@/lib/utils';

interface RolePresetSelectorProps {
  value: RolePreset;
  onChange: (preset: RolePreset) => void;
  disabled?: boolean;
}

export function RolePresetSelector({ value, onChange, disabled = false }: RolePresetSelectorProps) {
  const t = useTranslations('settings');

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

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('permissions.preset.label')}</Label>
      <div className="space-y-2">
        {presets.map((preset) => (
          <label
            key={preset.value}
            className={cn(
              'flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors',
              value === preset.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <input
              type="radio"
              name="rolePreset"
              value={preset.value}
              checked={value === preset.value}
              onChange={() => !disabled && onChange(preset.value)}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{preset.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
