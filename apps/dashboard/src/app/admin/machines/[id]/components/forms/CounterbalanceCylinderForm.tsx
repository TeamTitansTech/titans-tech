'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type CounterbalanceCylinderFormProps,
  CylinderAirbagType,
  OkNaDncLeakingType,
  OkNaDncNotOperationalType,
  OkNaDncDarkOilType,
  OkNaDncNeedReplacedType,
} from '@/data/types/services.types';

type InspectionRow =
  | {
      key: string;
      field?: string;
      type: 'select';
      enumValues: Record<string, string>;
      useCommon: boolean;
    }
  | {
      key: string;
      field?: string;
      type: 'text';
      enumValues?: never;
      useCommon?: never;
    };

const INSPECTION_ROWS: InspectionRow[] = [
  {
    key: 'counterbalanceType',
    type: 'select',
    enumValues: CylinderAirbagType,
    useCommon: false,
  },
  {
    key: 'pistonSeals',
    field: 'airbagPistonSeals',
    type: 'select',
    enumValues: OkNaDncLeakingType,
    useCommon: true,
  },
  { key: 'leakLocation', field: 'airbagPistonSealsLeakLocation', type: 'text' },
  { key: 'regulator', type: 'select', enumValues: OkNaDncNotOperationalType, useCommon: true },
  { key: 'gauge', type: 'select', enumValues: OkNaDncNotOperationalType, useCommon: true },
  {
    key: 'pneumaticsPlumbing',
    type: 'select',
    enumValues: OkNaDncLeakingType,
    useCommon: true,
  },
  { key: 'rodSeals', type: 'select', enumValues: OkNaDncLeakingType, useCommon: true },
  { key: 'rodBushing', type: 'select', enumValues: OkNaDncDarkOilType, useCommon: true },
  { key: 'oilWick', type: 'select', enumValues: OkNaDncNeedReplacedType, useCommon: true },
];

export function CounterbalanceCylinderForm({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
  hideNotes = false,
}: CounterbalanceCylinderFormProps) {
  const t = useTranslations('inspections.form.counterbalanceCylinder');
  const tCommon = useTranslations('common.status');

  const getLabel = (type: string, useCommon: boolean, enumKey?: string) => {
    if (useCommon) {
      return tCommon(type.toLowerCase());
    }
    if (enumKey === 'counterbalanceType') {
      return t(`counterbalanceTypes.${type.toLowerCase()}`);
    }
    return type;
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 border-b pb-2">
          <div className="text-xs font-semibold">{t('field')}</div>
          <div className="text-xs font-semibold">{t('value')}</div>
        </div>

        {INSPECTION_ROWS.map(({ key, field, type, enumValues, useCommon }) => {
          const fieldName = (field || key) as keyof typeof data;

          return (
            <div key={key} className="grid grid-cols-2 gap-4 items-center">
              <div className="text-xs font-medium">{t(key)}</div>

              <div>
                {type === 'select' && enumValues ? (
                  <Select
                    value={(data[fieldName] as string) || ''}
                    onValueChange={(value) => updateFn(fieldName, value ? value : undefined)}
                  >
                    <SelectTrigger
                      id={`${fieldName}-${title}`}
                      className={`h-9 text-xs ${errors[fieldName] ? 'border-destructive' : ''}`}
                      onBlur={() => handleBlur(fieldName)}
                    >
                      <SelectValue placeholder={t('selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(enumValues).map((value) => (
                        <SelectItem key={value} value={value}>
                          {getLabel(value, useCommon || false, key)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`${fieldName}-${title}`}
                    value={(data[fieldName] as string) || ''}
                    onChange={(e) => updateFn(fieldName, e.target.value)}
                    onBlur={() => handleBlur(fieldName)}
                    className={`text-sm ${errors[fieldName] ? 'border-destructive' : ''}`}
                  />
                )}
                {errors[fieldName] && (
                  <p className="text-xs text-destructive mt-1">{errors[fieldName]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!hideNotes && (
        <div className="grid grid-cols-2 gap-4 items-start pt-2">
          <div className="text-xs font-medium">{t('notes')}</div>
          <div>
            <Textarea
              id={`notes-${title}`}
              value={data.notes || ''}
              onChange={(e) => updateFn('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
              className={`text-sm ${errors.notes ? 'border-destructive' : ''}`}
              rows={3}
            />
            {errors.notes && <p className="text-xs text-destructive mt-1">{errors.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
