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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { getBlueprints, createMachine } from '@/data/services/machines.api';
import { getAllCompanies, type Company } from '@/data/services/companies.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { toast } from 'sonner';
import { Boxes, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { responseHandler } from '@/data/helpers/responseHandler';

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

interface Branch {
  id: string;
  name: string;
  isMainBranch: boolean;
  location?: string | null;
}

interface FieldValue {
  fieldSlug: string;
  value: string | number;
}

interface MachineCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MachineCreationModal({ isOpen, onClose, onSuccess }: MachineCreationModalProps) {
  const t = useTranslations('machines');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [machineName, setMachineName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingBlueprints, setIsLoadingBlueprints] = useState(true);

  const { execute: submitMachine, isLoading, result } = useLazyQuery(createMachine);

  const selectedBlueprint = useMemo(() => {
    return blueprints.find((bp) => bp.id === selectedBlueprintId) ?? null;
  }, [selectedBlueprintId, blueprints]);

  // Load companies and blueprints on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingCompanies(true);
      setIsLoadingBlueprints(true);

      const [companiesResponse, blueprintsResponse] = await Promise.all([
        getAllCompanies(),
        getBlueprints(),
      ]);

      if (companiesResponse.data) {
        setCompanies(companiesResponse.data);
      }
      if (blueprintsResponse.data) {
        setBlueprints(blueprintsResponse.data);
      }

      setIsLoadingCompanies(false);
      setIsLoadingBlueprints(false);
    };

    loadData();
  }, []);

  // Load branches when company changes
  useEffect(() => {
    const loadBranches = async () => {
      if (!selectedCompanyId) {
        setBranches([]);
        setSelectedBranchId('');
        return;
      }

      setIsLoadingBranches(true);
      const response = await responseHandler<Branch[]>(`/companies/${selectedCompanyId}/branches`, {
        method: 'GET',
      });

      if (response.data) {
        setBranches(response.data);
      }
      setIsLoadingBranches(false);
    };

    loadBranches();
  }, [selectedCompanyId]);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedBranchId('');
  };

  const handleBlueprintSelect = (blueprintId: string) => {
    setSelectedBlueprintId(blueprintId);
    setFieldValues({});
  };

  const updateFieldValue = (fieldSlug: string, value: string | number) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldSlug]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBlueprint || !selectedBranchId) {
      toast.error(t('form.error.branchRequired'));
      return;
    }

    const fields: FieldValue[] = selectedBlueprint.fields.map((field) => ({
      fieldSlug: field.fieldSlug,
      value: String(fieldValues[field.fieldSlug] || ''),
    }));

    const payload = {
      blueprintId: selectedBlueprintId,
      branchId: selectedBranchId,
      name: machineName,
      fields,
    };

    const response = await submitMachine(payload);

    if (response.data) {
      toast.success(t('createdSuccessfully'));
      setMachineName('');
      setSelectedCompanyId('');
      setSelectedBranchId('');
      setSelectedBlueprintId('');
      setFieldValues({});
      onSuccess?.();
      onClose();
    }
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
            <SelectContent>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col bg-background">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
            <DialogTitle className="text-2xl text-foreground">{t('title')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
            {/* Company and Branch Selection */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">{t('form.company.label')}</Label>
                  <Typography variant="small" className="text-xs text-muted-foreground">
                    {t('form.company.description')}
                  </Typography>
                  <Select value={selectedCompanyId} onValueChange={handleCompanySelect}>
                    <SelectTrigger id="company">
                      <SelectValue placeholder={t('form.selectCompanyPrompt')} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCompanies ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          {t('form.company.loading')}
                        </div>
                      ) : (
                        companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">{t('form.branch.label')}</Label>
                  <Typography variant="small" className="text-xs text-muted-foreground">
                    {t('form.branch.description')}
                  </Typography>
                  <Select
                    value={selectedBranchId}
                    onValueChange={setSelectedBranchId}
                    disabled={!selectedCompanyId || isLoadingBranches}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder={t('form.selectBranchPrompt')} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingBranches ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          {t('form.branch.loading')}
                        </div>
                      ) : (
                        branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                            {branch.isMainBranch && ` (${t('form.branch.mainBranch')})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* Blueprint Selection */}
            <section className="space-y-4">
              <div>
                <Typography variant="h3">{t('form.blueprint.label')}</Typography>
              </div>

              {isLoadingBlueprints ? (
                <div className="text-center py-8">
                  <Typography variant="muted">{t('form.blueprint.loading')}</Typography>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blueprints.map((blueprint) => {
                    const isSelected = selectedBlueprintId === blueprint.id;
                    return (
                      <Card
                        key={blueprint.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-500/10'
                            : 'hover:border-orange-500/50'
                        }`}
                        onClick={() => handleBlueprintSelect(blueprint.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                <Boxes className="w-5 h-5 text-orange-500" />
                              </div>
                              <div className="flex-1">
                                <Typography variant="h4" className="text-sm">
                                  {blueprint.name}
                                </Typography>
                                <Typography
                                  variant="small"
                                  className="text-xs text-muted-foreground mt-1"
                                >
                                  {blueprint.sections.length} {t('sectionsCount')} •{' '}
                                  {blueprint.fields.length} {t('fieldsCount')}
                                </Typography>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {selectedBlueprint && <Separator />}

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

                <div className="space-y-4">
                  <div>
                    <Label>{t('form.fields.label')}</Label>
                  </div>

                  <div className="space-y-4 pb-6">
                    {selectedBlueprint.fields.map((field) => (
                      <Card key={field.fieldSlug}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <Label htmlFor={`field-${field.fieldSlug}`}>{field.fieldName}</Label>
                            {renderFieldInput(field)}
                            <Typography variant="small" className="text-xs text-muted-foreground">
                              {t('form.fields.slug')}:{' '}
                              <code className="text-muted-foreground">{field.fieldSlug}</code>
                            </Typography>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!selectedBlueprint && !isLoadingBlueprints && (
              <div className="text-center py-8">
                <Typography variant="muted">{t('form.selectBlueprintPrompt')}</Typography>
              </div>
            )}

            {result?.errors && result.errors.length > 0 && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-4 mb-6">
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
          </div>

          <div className="border-t border-border p-6 flex justify-end gap-3 shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedBlueprint || !selectedBranchId}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
