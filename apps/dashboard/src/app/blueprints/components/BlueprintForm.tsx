'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FieldType = 'string' | 'int' | 'enum';

interface Field {
  fieldName: string;
  fieldSlug: string;
  fieldType: FieldType;
  fieldOptions?: string[];
}

const AVAILABLE_SECTIONS = ['bearing_clearance'] as const;

export function BlueprintForm() {
  const t = useTranslations('blueprints');
  const tSections = useTranslations('sections');
  const [name, setName] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>(['bearing_clearance']);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  const generateSlug = (name: string, existingSlugs: string[]): string => {
    // Convert to lowercase and replace spaces/special chars with underscores
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!baseSlug) return '';

    // Check for duplicates and append number if needed
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

    // Auto-generate slug when fieldName changes
    if (key === 'fieldName' && typeof value === 'string') {
      const existingSlugs = newFields
        .map((f, i) => (i !== index ? f.fieldSlug : ''))
        .filter(Boolean);
      newFields[index].fieldSlug = generateSlug(value, existingSlugs);
    }

    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
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

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const res = await fetch('http://localhost:3001/blueprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(`HTTP ${res.status}: ${res.statusText}`);
        setResponse(JSON.stringify(data, null, 2));
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error details:', error);
    } finally {
      setIsLoading(false);
    }
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
                          <span className="text-sm font-medium">
                            {t('form.fields.fieldNumber', { number: index + 1 })}
                          </span>
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
                            <Label>{t('form.fields.fieldSlug.label')}</Label>
                            <div className="flex h-9 w-full items-center rounded-md bg-muted px-3 py-2 text-sm">
                              <code className="text-muted-foreground">
                                {field.fieldSlug || t('form.fields.fieldSlug.placeholder')}
                              </code>
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
                              <SelectContent>
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
                            <div className="space-y-2">
                              <Label htmlFor={`field-options-${index}`}>
                                {t('form.fields.fieldOptions.label')}
                              </Label>
                              <Input
                                id={`field-options-${index}`}
                                type="text"
                                value={field.fieldOptions?.join(', ') || ''}
                                onChange={(e) =>
                                  updateField(
                                    index,
                                    'fieldOptions',
                                    e.target.value.split(',').map((s) => s.trim()),
                                  )
                                }
                                required={field.fieldType === 'enum'}
                                placeholder={t('form.fields.fieldOptions.placeholder')}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </form>

          {error && (
            <div className="mt-6 rounded-md border border-destructive bg-destructive/10 p-4">
              <h3 className="text-lg font-semibold mb-2 text-destructive">
                {t('form.error.title')}
              </h3>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold">{t('form.response.title')}</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">{response}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
