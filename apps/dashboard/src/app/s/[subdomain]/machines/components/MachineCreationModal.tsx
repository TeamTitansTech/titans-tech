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
import { getAllBranches } from '@/data/services/company-branches.api';
import { getAllCompanies, type Company } from '@/data/services/companies.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useBranch } from '@/contexts/BranchContext';
import { toast } from 'sonner';
import { Boxes, Check, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

interface Branch {
  id: string;
  name: string;
  isMainBranch: boolean;
}

interface MachineCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branchId?: string;
  companyId?: string;
}

export function MachineCreationModal({
  isOpen,
  onClose,
  onSuccess,
  branchId,
  companyId: companyIdProp,
}: MachineCreationModalProps) {
  const t = useTranslations('machines');
  const { companyUser } = useCompanyUser();
  const { sysAdminUser } = useSysAdmin();
  const { selectedBranchId: contextBranchId } = useBranch();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyIdProp || '');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branchId || '');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [machineName, setMachineName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [isLoadingBlueprints, setIsLoadingBlueprints] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(!!sysAdminUser && !companyIdProp);
  const [isLoadingBranches, setIsLoadingBranches] = useState(!branchId);

  const { execute: submitMachine, isLoading, result } = useLazyQuery(createMachine);

  const isSysAdmin = !!sysAdminUser;
  const effectiveCompanyId = companyIdProp || selectedCompanyId || companyUser?.companyId;

  // Use branch from context if available and not overridden
  const effectiveBranchId = branchId || selectedBranchId || contextBranchId;

  const selectedBlueprint = useMemo(() => {
    return blueprints.find((bp) => bp.id === selectedBlueprintId) ?? null;
  }, [selectedBlueprintId, blueprints]);

  // Determine if user has access to multiple branches with createMachines permission
  const hasMultipleBranches = useMemo(() => {
    if (!companyUser) return false;
    const accessibleBranches = companyUser.branches.filter(
      (userBranch) => userBranch.createMachines,
    );
    return accessibleBranches.length > 1;
  }, [companyUser]);

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

  useEffect(() => {
    if (!isSysAdmin || companyIdProp) {
      return;
    }

    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      const response = await getAllCompanies();
      if (response.data) {
        setCompanies(response.data);
      }
      setIsLoadingCompanies(false);
    };

    loadCompanies();
  }, [isSysAdmin, companyIdProp]);

  useEffect(() => {
    if (branchId) {
      return;
    }

    if (!effectiveCompanyId) {
      return;
    }

    let cancelled = false;

    const loadBranches = async () => {
      setIsLoadingBranches(true);
      const response = await getAllBranches({ companyId: effectiveCompanyId });

      if (cancelled) return;

      if (response.data) {
        setBranches(response.data);
      }
      setIsLoadingBranches(false);
    };

    loadBranches();

    return () => {
      cancelled = true;
    };
  }, [branchId, effectiveCompanyId]);

  // Auto-select branch if user has access to only one branch with createMachines permission
  useEffect(() => {
    // Skip if branch is already provided as prop
    if (branchId) {
      return;
    }

    // Skip if branch is already selected
    if (selectedBranchId) {
      return;
    }

    // Skip if companyUser is not loaded
    if (!companyUser) {
      return;
    }

    // Skip if branches are still loading
    if (isLoadingBranches) {
      return;
    }

    // Get branches where user has createMachines permission
    const accessibleBranches = companyUser.branches.filter(
      (userBranch) => userBranch.createMachines,
    );

    // Auto-select if user has access to exactly one branch
    if (accessibleBranches.length === 1) {
      setSelectedBranchId(accessibleBranches[0].branchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, companyUser, isLoadingBranches]);

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

    if (!selectedBlueprint || !effectiveBranchId) {
      toast.error(t('form.error.branchRequired'));
      return;
    }

    const fields: FieldValue[] = selectedBlueprint.fields.map((field) => ({
      fieldSlug: field.fieldSlug,
      value: String(fieldValues[field.fieldSlug] || ''),
    }));

    const payload = {
      blueprintId: selectedBlueprintId,
      branchId: effectiveBranchId,
      name: machineName,
      fields,
    };

    const response = await submitMachine(payload);

    if (response.data) {
      toast.success(t('createdSuccessfully'));
      setMachineName('');
      setSelectedBlueprintId('');
      setSelectedBranchId(branchId || '');
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
            {isSysAdmin && !companyIdProp && (
              <>
                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {t('form.company.label')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('form.company.description')}
                    </p>
                  </div>

                  {isLoadingCompanies ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('form.company.loading')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companies.map((company) => {
                        const isSelected = selectedCompanyId === company.id;
                        return (
                          <Card
                            key={company.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-500/10'
                                : 'hover:border-orange-500/50'
                            }`}
                            onClick={() => setSelectedCompanyId(company.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                    <Boxes className="w-5 h-5 text-orange-500" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-foreground">
                                      {company.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {company.slug}
                                    </p>
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

                {selectedCompanyId && <Separator />}
              </>
            )}

            {!branchId &&
              (companyIdProp || selectedCompanyId || companyUser?.companyId) &&
              (hasMultipleBranches || isSysAdmin) && (
                <>
                  <section className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('form.branch.label')}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('form.branch.description')}
                      </p>
                    </div>

                    {isLoadingBranches ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('form.branch.loading')}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {branches.map((branch) => {
                          const isSelected = selectedBranchId === branch.id;
                          return (
                            <Card
                              key={branch.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                isSelected
                                  ? 'ring-2 ring-primary border-primary bg-primary/10'
                                  : 'hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedBranchId(branch.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                      <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm text-foreground">
                                        {branch.name}
                                      </h4>
                                      {branch.isMainBranch && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {t('form.branch.mainBranch')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
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

                  {selectedBranchId && <Separator />}
                </>
              )}

            {(branchId || selectedBranchId) && (
              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t('form.blueprint.label')}
                  </h3>
                </div>

                {isLoadingBlueprints ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('form.blueprint.loading')}
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
                                  <h4 className="font-semibold text-sm text-foreground">
                                    {blueprint.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {blueprint.sections.length} {t('sectionsCount')} •{' '}
                                    {blueprint.fields.length} {t('fieldsCount')}
                                  </p>
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
            )}

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

            {!selectedBlueprint &&
              !isLoadingBlueprints &&
              !isLoadingBranches &&
              !isLoadingCompanies && (
                <div className="text-center text-muted-foreground py-8">
                  {isSysAdmin && !companyIdProp && !selectedCompanyId
                    ? t('form.selectCompanyPrompt')
                    : !branchId && !selectedBranchId
                      ? t('form.selectBranchPrompt')
                      : t('form.selectBlueprintPrompt')}
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
