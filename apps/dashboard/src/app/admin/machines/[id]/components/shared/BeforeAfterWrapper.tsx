'use client';

import { ReactNode, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ServiceType } from '@titans-tech/shared/types/services';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface BeforeAfterWrapperProps {
  serviceType: ServiceType;
  beforeContent: ReactNode;
  afterContent: ReactNode;
  onIncludeBeforeChange?: (include: boolean) => void;
  checkboxLabel?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  defaultBeforeOpen?: boolean;
  defaultAfterOpen?: boolean;
}

export function BeforeAfterWrapper({
  serviceType,
  beforeContent,
  afterContent,
  onIncludeBeforeChange,
  checkboxLabel,
  beforeLabel,
  afterLabel,
  className,
  defaultBeforeOpen = false,
  defaultAfterOpen = false,
}: BeforeAfterWrapperProps) {
  const t = useTranslations('forms.beforeAfter');
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(false);
  const [isBeforeOpen, setIsBeforeOpen] = useState(defaultBeforeOpen);
  const [isAfterOpen, setIsAfterOpen] = useState(defaultAfterOpen);

  const checkboxLabelFinal = checkboxLabel || t('includeBefore');
  const beforeLabelFinal = beforeLabel || t('beforeMaintenance');
  const afterLabelFinal = afterLabel || t('afterMaintenance');

  const handleIncludeBeforeChange = (checked: boolean) => {
    setIncludeBeforeMeasurements(checked);
    onIncludeBeforeChange?.(checked);
  };

  // For inspection type, don't show checkbox and before/after separation
  if (serviceType === ServiceType.INSPECTION) {
    return <div className={className}>{afterContent}</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Include Before Measurements Checkbox - Only for Maintenance */}
      <div className="flex items-center space-x-2 pb-4 border-b">
        <Checkbox
          id="includeBeforeMeasurements"
          checked={includeBeforeMeasurements}
          onCheckedChange={handleIncludeBeforeChange}
        />
        <Label
          htmlFor="includeBeforeMeasurements"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {checkboxLabelFinal}
        </Label>
      </div>

      {includeBeforeMeasurements ? (
        <div className="space-y-8">
          {/* Before Maintenance Section */}
          <Collapsible open={isBeforeOpen} onOpenChange={setIsBeforeOpen}>
            <div className="space-y-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <h4 className="text-lg font-semibold">{beforeLabelFinal}</h4>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isBeforeOpen ? '' : 'rotate-180',
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>{beforeContent}</CollapsibleContent>
            </div>
          </Collapsible>

          {/* After Maintenance Section */}
          <Collapsible open={isAfterOpen} onOpenChange={setIsAfterOpen}>
            <div className="space-y-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <h4 className="text-lg font-semibold">{afterLabelFinal}</h4>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isAfterOpen ? '' : 'rotate-180',
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>{afterContent}</CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      ) : (
        <div>{afterContent}</div>
      )}
    </div>
  );
}
