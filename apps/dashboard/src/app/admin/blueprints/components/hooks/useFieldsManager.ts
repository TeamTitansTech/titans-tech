import { useState, useCallback } from 'react';
import { type Field } from '../types';

const generateSlug = (name: string, existingSlugs: string[]): string => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!baseSlug) return '';

  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}_${counter}`;
    counter++;
  }

  return slug;
};

export function useFieldsManager() {
  const [fields, setFields] = useState<Field[]>([]);

  const addField = () => {
    setFields([
      ...fields,
      {
        fieldName: '',
        fieldSlug: '',
        fieldType: 'string',
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof Field, value: string | string[]) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };

    if (key === 'fieldName' && typeof value === 'string') {
      const existingSlugs = newFields
        .map((f, i) => (i !== index ? f.fieldSlug : ''))
        .filter(Boolean);
      newFields[index].fieldSlug = generateSlug(value, existingSlugs);
    }

    if (key === 'fieldType' && value === 'enum' && !newFields[index].fieldOptions) {
      newFields[index].fieldOptions = [];
    }

    setFields(newFields);
  };

  const hasInvalidEnumFields = fields.some(
    (field) =>
      field.fieldType === 'enum' && (!field.fieldOptions || field.fieldOptions.length === 0),
  );

  const reset = useCallback(() => {
    setFields([]);
  }, []);

  const initializeFields = useCallback((initialFields: Field[]) => {
    setFields(initialFields);
  }, []);

  return {
    fields,
    addField,
    removeField,
    updateField,
    hasInvalidEnumFields,
    reset,
    initializeFields,
  };
}
