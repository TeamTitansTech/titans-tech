'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { getBlueprints, createMachine } from '@/data/services/machines.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';

interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

interface Blueprint {
  id: string;
  name: string;
  sections: string[];
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
}

interface FieldValue {
  fieldSlug: string;
  value: string | number;
}

export function MachineForm() {
  const t = useTranslations('machines');
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [machineName, setMachineName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [lastBlueprintId, setLastBlueprintId] = useState<string>('');
  const [isLoadingBlueprints, setIsLoadingBlueprints] = useState(true);

  const { execute: submitMachine, isLoading, result } = useLazyQuery(createMachine);

  const selectedBlueprint = useMemo(() => {
    if (!selectedBlueprintId) return null;
    return blueprints.find((bp) => bp.id === selectedBlueprintId) || null;
  }, [selectedBlueprintId, blueprints]);

  if (selectedBlueprintId !== lastBlueprintId) {
    setLastBlueprintId(selectedBlueprintId);
    setFieldValues({});
  }

  useEffect(() => {
    const loadBlueprints = async () => {
      setIsLoadingBlueprints(true);
      const response = await getBlueprints();
      if (response.data) {
        setBlueprints(response.data);
      }
      setIsLoadingBlueprints(false);
    };

    loadBlueprints();
  }, []);

  const updateFieldValue = (fieldSlug: string, value: string | number) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldSlug]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBlueprint) return;

    const fields: FieldValue[] = selectedBlueprint.fields.map((field) => ({
      fieldSlug: field.fieldSlug,
      value: String(fieldValues[field.fieldSlug] || ''),
    }));

    const payload = {
      blueprintId: selectedBlueprintId,
      name: machineName,
      fields,
    };

    await submitMachine(payload);
  };

  const renderFieldInput = (field: BlueprintField) => {
    const value = fieldValues[field.fieldSlug] || '';

    switch (field.fieldType) {
      case 'int':
        return (
          <Input
            id={`field-${field.fieldSlug}`}
            type="number"
            value={value}
            onChange={(e) => updateFieldValue(field.fieldSlug, parseInt(e.target.value) || 0)}
            required
            placeholder={t('form.fields.placeholder')}
          />
        );

      case 'enum':
        return (
          <Select
            value={String(value)}
            onValueChange={(val) => updateFieldValue(field.fieldSlug, val)}
          >
            <SelectTrigger id={`field-${field.fieldSlug}`}>
              <SelectValue placeholder={t('form.fields.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {field.fieldOptions?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'string':
      default:
        return (
          <Input
            id={`field-${field.fieldSlug}`}
            type="text"
            value={String(value)}
            onChange={(e) => updateFieldValue(field.fieldSlug, e.target.value)}
            required
            placeholder={t('form.fields.placeholder')}
          />
        );
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
            {/* Blueprint Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="blueprint">{t('form.blueprint.label')}</Label>
              </div>
              <Select
                value={selectedBlueprintId}
                onValueChange={setSelectedBlueprintId}
                disabled={isLoadingBlueprints}
              >
                <SelectTrigger id="blueprint">
                  <SelectValue
                    placeholder={
                      isLoadingBlueprints
                        ? t('form.blueprint.loading')
                        : t('form.blueprint.placeholder')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {blueprints.map((blueprint) => (
                    <SelectItem key={blueprint.id} value={blueprint.id}>
                      {blueprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Machine Name */}
            {selectedBlueprint && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('form.name.label')}</Label>
                  </div>
                  <Input
                    id="name"
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    required
                    placeholder={t('form.name.placeholder')}
                  />
                </div>

                {/* Dynamic Fields */}
                <div className="space-y-4">
                  <div>
                    <Label>{t('form.fields.label')}</Label>
                  </div>

                  <div className="space-y-4">
                    {selectedBlueprint.fields.map((field) => (
                      <Card key={field.fieldSlug}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <Label htmlFor={`field-${field.fieldSlug}`}>{field.fieldName}</Label>
                            {renderFieldInput(field)}
                            <Typography variant="small" className="text-xs text-muted-foreground">
                              {t('form.fields.slug')}: <code>{field.fieldSlug}</code>
                            </Typography>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? t('form.submit.loading') : t('form.submit.idle')}
                </Button>
              </>
            )}

            {!selectedBlueprint && !isLoadingBlueprints && (
              <div className="text-center py-8">
                <Typography variant="muted">{t('form.selectBlueprintPrompt')}</Typography>
              </div>
            )}
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
