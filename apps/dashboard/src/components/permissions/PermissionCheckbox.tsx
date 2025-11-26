'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PermissionName } from '@titans-tech/shared/types';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface PermissionCheckboxProps {
  permission: PermissionName;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function PermissionCheckbox({
  permission,
  checked,
  onChange,
  disabled = false,
}: PermissionCheckboxProps) {
  const t = useTranslations('settings.permissions');

  const permissionName = t(`names.${permission}`);
  const permissionDescription = t(`descriptions.${permission}`);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={permission}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
      <Label
        htmlFor={permission}
        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1.5"
      >
        {permissionName}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoCircledIcon className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm">{permissionDescription}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
    </div>
  );
}
