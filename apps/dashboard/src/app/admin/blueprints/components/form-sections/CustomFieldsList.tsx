import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { type Field } from '../types';
import { CustomFieldCard } from './CustomFieldCard';

interface CustomFieldsListProps {
  fields: Field[];
  addField: () => void;
  removeField: (index: number) => void;
  updateField: (index: number, key: keyof Field, value: string | string[]) => void;
  newOptionValues: Record<number, string>;
  addOption: (
    fieldIndex: number,
    fields: Field[],
    updateField: (index: number, key: keyof Field, value: string | string[]) => void,
  ) => void;
  removeOption: (
    fieldIndex: number,
    optionIndex: number,
    fields: Field[],
    updateField: (index: number, key: keyof Field, value: string | string[]) => void,
  ) => void;
  updateNewOptionValue: (fieldIndex: number, value: string) => void;
  translations: {
    title: string;
    addButton: string;
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
    fieldOptionsAddButton: string;
  };
}

export const CustomFieldsList = ({
  fields,
  addField,
  removeField,
  updateField,
  newOptionValues,
  addOption,
  removeOption,
  updateNewOptionValue,
  translations,
}: CustomFieldsListProps) => {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <Typography variant="h3">{translations.title}</Typography>
        <Button
          type="button"
          onClick={addField}
          variant="outline"
          size="sm"
          className="hover:bg-orange-500 hover:text-white transition-all"
        >
          {translations.addButton}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <CustomFieldCard
            key={index}
            field={field}
            index={index}
            onRemove={removeField}
            onUpdate={updateField}
            enumHandlers={{
              newValue: newOptionValues[index] || '',
              onAdd: () => addOption(index, fields, updateField),
              onRemove: (optionIndex: number) =>
                removeOption(index, optionIndex, fields, updateField),
              onValueChange: (value: string) => updateNewOptionValue(index, value),
            }}
            translations={{
              fieldNumber: `${translations.fieldNumber} ${index + 1}`,
              fieldNameLabel: translations.fieldNameLabel,
              fieldNamePlaceholder: translations.fieldNamePlaceholder,
              fieldTypeLabel: translations.fieldTypeLabel,
              fieldTypeString: translations.fieldTypeString,
              fieldTypeInt: translations.fieldTypeInt,
              fieldTypeEnum: translations.fieldTypeEnum,
              fieldOptionsLabel: translations.fieldOptionsLabel,
              fieldOptionsPlaceholder: translations.fieldOptionsPlaceholder,
              fieldOptionsRequired: translations.fieldOptionsRequired,
              addButton: translations.fieldOptionsAddButton,
            }}
          />
        ))}
      </div>
    </section>
  );
};
