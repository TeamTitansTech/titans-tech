'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createBlueprint } from '@/data/services/blueprints.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { INSPECTION_SECTION_SLUGS } from '@titans-tech/db';

type FieldType = 'string' | 'int' | 'enum';

interface Field {
  fieldName: string;
  fieldSlug: string;
  fieldType: FieldType;
  fieldOptions?: string[];
}

const AVAILABLE_SECTIONS = INSPECTION_SECTION_SLUGS;

export function BlueprintForm() {
  const t = useTranslations('blueprints');
  const tSections = useTranslations('sections');
  const [name, setName] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

  const { execute: submitBlueprint, isLoading, result } = useLazyQuery(createBlueprint);

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

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

  const addOption = (fieldIndex: number) => {
    const newValue = newOptionValues[fieldIndex]?.trim();
    if (!newValue) return;

    const newFields = [...fields];
    const currentOptions = newFields[fieldIndex].fieldOptions || [];

    if (!currentOptions.includes(newValue)) {
      newFields[fieldIndex].fieldOptions = [...currentOptions, newValue];
      setFields(newFields);
    }

    setNewOptionValues((prev) => ({ ...prev, [fieldIndex]: '' }));
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields];
    const currentOptions = newFields[fieldIndex].fieldOptions || [];
    newFields[fieldIndex].fieldOptions = currentOptions.filter((_, i) => i !== optionIndex);
    setFields(newFields);
  };

  const updateNewOptionValue = (fieldIndex: number, value: string) => {
    setNewOptionValues((prev) => ({ ...prev, [fieldIndex]: value }));
  };

  const hasInvalidEnumFields = fields.some(
    (field) =>
      field.fieldType === 'enum' && (!field.fieldOptions || field.fieldOptions.length === 0),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      sections: selectedSections,
      fields: fields.map((field) => {
        const baseField = {
          fieldName: field.fieldName,
          fieldSlug: field.fieldSlug,
          fieldType: field.fieldType,
        };

        if (field.fieldType === 'enum' && field.fieldOptions) {
          return {
            ...baseField,
            fieldOptions: field.fieldOptions.filter(Boolean),
          };
        }

        return baseField;
      }),
    };

    await submitBlueprint(payload);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('form.name.label')}</Label>
              </div>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t('form.name.placeholder')}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t('form.sections.label')}</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SECTIONS.map((section) => {
                  const isSelected = selectedSections.includes(section);
                  return (
                    <Button
                      key={section}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSection(section)}
                      className={`transition-all ${
                        isSelected
                          ? 'bg-blue-900 text-white font-bold hover:bg-blue-800 hover:text-white border-blue-900 dark:bg-blue-950 dark:border-blue-950 dark:hover:bg-blue-900 dark:hover:text-white'
                          : ''
                      }`}
                    >
                      {tSections(section)}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>{t('form.fields.label')}</Label>
                <Button type="button" onClick={addField} variant="outline" size="sm">
                  {t('form.fields.addButton')}
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Typography variant="small" className="font-medium">
                            {t('form.fields.fieldNumber', { number: index + 1 })}
                          </Typography>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeField(index)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              {t('form.fields.removeButton')}
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`field-name-${index}`}>
                              {t('form.fields.fieldName.label')}
                            </Label>
                            <div className="flex-row flex-1">
                              <div>
                                <Input
                                  id={`field-name-${index}`}
                                  type="text"
                                  value={field.fieldName}
                                  onChange={(e) => updateField(index, 'fieldName', e.target.value)}
                                  required
                                  placeholder={t('form.fields.fieldName.placeholder')}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`field-type-${index}`}>
                              {t('form.fields.fieldType.label')}
                            </Label>
                            <Select
                              value={field.fieldType}
                              onValueChange={(value) =>
                                updateField(index, 'fieldType', value as FieldType)
                              }
                            >
                              <SelectTrigger id={`field-type-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="string">
                                  {t('form.fields.fieldType.string')}
                                </SelectItem>
                                <SelectItem value="int">
                                  {t('form.fields.fieldType.int')}
                                </SelectItem>
                                <SelectItem value="enum">
                                  {t('form.fields.fieldType.enum')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {field.fieldType === 'enum' && (
                            <div className="space-y-2 md:col-span-2">
                              <Label>{t('form.fields.fieldOptions.label')}</Label>

                              {field.fieldOptions && field.fieldOptions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {field.fieldOptions.map((option, optionIndex) => (
                                    <div
                                      key={optionIndex}
                                      className="flex items-center gap-1 bg-muted rounded-md px-3 py-1"
                                    >
                                      <Typography variant="small">{option}</Typography>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(index, optionIndex)}
                                        className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  value={newOptionValues[index] || ''}
                                  onChange={(e) => updateNewOptionValue(index, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addOption(index);
                                    }
                                  }}
                                  placeholder={t('form.fields.fieldOptions.placeholder')}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={() => addOption(index)}
                                  variant="outline"
                                  size="sm"
                                >
                                  {t('form.fields.addButton')}
                                </Button>
                              </div>

                              {field.fieldOptions?.length === 0 && (
                                <Typography variant="small" className="text-destructive">
                                  {t('form.fields.fieldOptions.required')}
                                </Typography>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading || hasInvalidEnumFields} className="w-full">
              {isLoading ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </form>

          {result?.errors && result.errors.length > 0 && (
            <div className="mt-6 rounded-md border border-destructive bg-destructive/10 p-4">
              <Typography variant="h3" className="mb-2 text-destructive">
                {t('form.error.title')}
              </Typography>
              <ul className="list-disc list-inside space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index}>
                    <Typography variant="small" className="text-destructive">
                      {error}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result?.data && (
            <div className="mt-6 space-y-2">
              <Typography variant="h3">{t('form.response.title')}</Typography>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
