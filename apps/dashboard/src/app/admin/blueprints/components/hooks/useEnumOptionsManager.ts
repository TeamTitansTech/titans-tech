import { useState, useCallback } from 'react';
import { type Field } from '../types';

export function useEnumOptionsManager() {
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

  const addOption = (
    fieldIndex: number,
    fields: Field[],
    updateField: (index: number, key: keyof Field, value: string | string[]) => void,
  ) => {
    const newValue = newOptionValues[fieldIndex]?.trim();
    if (!newValue) return;

    const currentOptions = fields[fieldIndex].fieldOptions || [];

    if (!currentOptions.includes(newValue)) {
      updateField(fieldIndex, 'fieldOptions', [...currentOptions, newValue]);
    }

    setNewOptionValues((prev) => ({ ...prev, [fieldIndex]: '' }));
  };

  const removeOption = (
    fieldIndex: number,
    optionIndex: number,
    fields: Field[],
    updateField: (index: number, key: keyof Field, value: string | string[]) => void,
  ) => {
    const currentOptions = fields[fieldIndex].fieldOptions || [];
    updateField(
      fieldIndex,
      'fieldOptions',
      currentOptions.filter((_, i) => i !== optionIndex),
    );
  };

  const updateNewOptionValue = (fieldIndex: number, value: string) => {
    setNewOptionValues((prev) => ({ ...prev, [fieldIndex]: value }));
  };

  const reset = useCallback(() => {
    setNewOptionValues({});
  }, []);

  return {
    newOptionValues,
    addOption,
    removeOption,
    updateNewOptionValue,
    reset,
  };
}
