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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createBlueprint } from '@/data/services/blueprints.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { INSPECTION_SECTION_SLUGS } from '@/constants/inspection-sections';
import { Card, CardContent } from '@/components/ui/card';

interface BlueprintCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FieldType = 'string' | 'int' | 'enum';

interface Field {
  fieldName: string;
  fieldSlug: string;
  fieldType: FieldType;
  fieldOptions?: string[];
}

const AVAILABLE_SECTIONS = INSPECTION_SECTION_SLUGS;

export const BlueprintCreationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: BlueprintCreationModalProps) => {
  const t = useTranslations('models');
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

    const response = await submitBlueprint(payload);

    if (response.data) {
      toast.success(t('createdSuccessfully'));
      setName('');
      setSelectedSections([]);
      setFields([]);
      setNewOptionValues({});
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="p-6 pb-4 shrink-0">
            <DialogTitle className="text-2xl">{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-6 min-h-0 scrollbar-thin">
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('form.basicInfo.title')}</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('form.name.label')} *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={t('form.name.placeholder')}
                    />
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Sections */}
            <section className="space-y-4">
              <div>
                <h3 className=" mb-4">{t('form.sections.label')}</h3>
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
                        className={
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold hover:bg-primary/90 border-primary transition-all'
                            : 'transition-all'
                        }
                      >
                        {tSections(section)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </section>

            <Separator />

            {/* Fields */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t('form.fields.label')}</h3>
                <Button
                  type="button"
                  onClick={addField}
                  variant="outline"
                  size="sm"
                  className="hover:bg-action-orange hover:text-white hover:border-action-orange"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('form.fields.addButton')}
                </Button>
              </div>

              <div className="space-y-4 pb-6">
                {fields.map((field, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {t('form.fields.fieldNumber', { number: index + 1 })}
                          </span>
                          {fields.length > 0 && (
                            <Button
                              type="button"
                              onClick={() => removeField(index)}
                              variant="ghost"
                              size="sm"
                              className="hover:bg-action-orange hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`field-name-${index}`}>
                              {t('form.fields.fieldName.label')}
                            </Label>
                            <Input
                              id={`field-name-${index}`}
                              type="text"
                              value={field.fieldName}
                              onChange={(e) => updateField(index, 'fieldName', e.target.value)}
                              required
                              placeholder={t('form.fields.fieldName.placeholder')}
                            />
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
                            <div className="space-y-2 md:col-span-2">
                              <Label>{t('form.fields.fieldOptions.label')}</Label>

                              {field.fieldOptions && field.fieldOptions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {field.fieldOptions.map((option, optionIndex) => (
                                    <div
                                      key={optionIndex}
                                      className="flex items-center gap-1 bg-muted rounded-md px-3 py-1"
                                    >
                                      <span className="text-sm">{option}</span>
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
                                <p className="text-sm text-destructive">
                                  {t('form.fields.fieldOptions.required')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Error Display */}
            {result?.errors && result.errors.length > 0 && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-4 mb-6">
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                  {t('form.error.title')}
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-6 flex justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="hover:bg-action-orange hover:text-white hover:border-action-orange"
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
