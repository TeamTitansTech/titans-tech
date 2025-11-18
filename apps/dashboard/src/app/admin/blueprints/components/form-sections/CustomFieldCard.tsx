import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { type Field, type FieldType } from '../types';
import { EnumOptionsManager } from './EnumOptionsManager';

interface CustomFieldCardProps {
  field: Field;
  index: number;
  onRemove: (index: number) => void;
  onUpdate: (index: number, key: keyof Field, value: string | string[]) => void;
  enumHandlers: {
    newValue: string;
    onAdd: () => void;
    onRemove: (optionIndex: number) => void;
    onValueChange: (value: string) => void;
  };
  translations: {
    fieldNumber: string;
    fieldNameLabel: string;
    fieldNamePlaceholder: string;
    fieldTypeLabel: string;
    fieldTypeString: string;
    fieldTypeInt: string;
    fieldTypeEnum: string;
    fieldOptionsLabel: string;
    fieldOptionsPlaceholder: string;
    fieldOptionsRequired: string;
    addButton: string;
  };
}

export const CustomFieldCard = ({
  field,
  index,
  onRemove,
  onUpdate,
  enumHandlers,
  translations,
}: CustomFieldCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="small" className="font-medium">
              {translations.fieldNumber}
            </Typography>
            <Button
              type="button"
              onClick={() => onRemove(index)}
              variant="ghost"
              size="sm"
              className="hover:bg-orange-500 hover:text-white transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`field-name-${index}`}>{translations.fieldNameLabel}</Label>
              <Input
                id={`field-name-${index}`}
                type="text"
                value={field.fieldName}
                onChange={(e) => onUpdate(index, 'fieldName', e.target.value)}
                required
                placeholder={translations.fieldNamePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-type-${index}`}>{translations.fieldTypeLabel}</Label>
              <Select
                value={field.fieldType}
                onValueChange={(value) => onUpdate(index, 'fieldType', value as FieldType)}
              >
                <SelectTrigger id={`field-type-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">{translations.fieldTypeString}</SelectItem>
                  <SelectItem value="int">{translations.fieldTypeInt}</SelectItem>
                  <SelectItem value="enum">{translations.fieldTypeEnum}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {field.fieldType === 'enum' && (
              <EnumOptionsManager
                fieldIndex={index}
                options={field.fieldOptions}
                newValue={enumHandlers.newValue}
                onAdd={enumHandlers.onAdd}
                onRemove={enumHandlers.onRemove}
                onValueChange={enumHandlers.onValueChange}
                translations={{
                  label: translations.fieldOptionsLabel,
                  placeholder: translations.fieldOptionsPlaceholder,
                  addButton: translations.addButton,
                  required: translations.fieldOptionsRequired,
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
