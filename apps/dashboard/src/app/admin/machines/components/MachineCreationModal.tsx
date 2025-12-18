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
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from '@titans-tech/shared/types/enums';
import Image from 'next/image';

interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

interface Blueprint {
  id: string;
  name: string;
  imageUrl?: string;
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
  preselectedBranchId?: string;
  preselectedCompanyId?: string;
}

export function MachineCreationModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedBranchId,
  preselectedCompanyId,
}: MachineCreationModalProps) {
  const t = useTranslations('machines');
  const tInspections = useTranslations('inspections.form.enums');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(preselectedCompanyId || '');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(preselectedBranchId || '');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [machineName, setMachineName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(!preselectedCompanyId);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingBlueprints, setIsLoadingBlueprints] = useState(true);

  // Machine specification fields
  const [manufacturer, setManufacturer] = useState('');
  const [sizeTonnage, setSizeTonnage] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [stroke, setStroke] = useState('');
  const [foundationType, setFoundationType] = useState<FoundationType | ''>('');
  const [frameType, setFrameType] = useState<FrameType | ''>('');
  const [clutchType, setClutchType] = useState<MachineClutchType | ''>('');
  const [pneumaticSystem, setPneumaticSystem] = useState<PneumaticSystemType | ''>('');
  const [pressMounting, setPressMounting] = useState<PressMountingType | ''>('');
  const [features, setFeatures] = useState<MachineFeaturesType | ''>('');

  const { execute: submitMachine, isLoading, result } = useLazyQuery(createMachine);

  const selectedBlueprint = useMemo(() => {
    return blueprints.find((bp) => bp.id === selectedBlueprintId) ?? null;
  }, [selectedBlueprintId, blueprints]);

  // Load companies and blueprints on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingBlueprints(true);

      if (!preselectedCompanyId) {
        setIsLoadingCompanies(true);
        const [companiesResponse, blueprintsResponse] = await Promise.all([
          getAllCompanies(),
          getBlueprints(),
        ]);

        if (companiesResponse.data) {
          setCompanies(companiesResponse.data);
        }
        setIsLoadingCompanies(false);

        if (blueprintsResponse.data) {
          setBlueprints(blueprintsResponse.data);
        }
      } else {
        const blueprintsResponse = await getBlueprints();
        if (blueprintsResponse.data) {
          setBlueprints(blueprintsResponse.data);
        }
      }

      setIsLoadingBlueprints(false);
    };

    loadData();
  }, [preselectedCompanyId]);

  // Load branches when company changes (skip if preselected)
  useEffect(() => {
    const loadBranches = async () => {
      if (!selectedCompanyId || preselectedBranchId) {
        if (!selectedCompanyId && !preselectedBranchId) {
          setBranches([]);
          setSelectedBranchId('');
        }
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
  }, [selectedCompanyId, preselectedBranchId]);

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
      // Machine specifications (optional)
      manufacturer: manufacturer || undefined,
      sizeTonnage: sizeTonnage || undefined,
      serialNumber: serialNumber || undefined,
      stroke: stroke || undefined,
      foundationType: foundationType || undefined,
      frameType: frameType || undefined,
      clutchType: clutchType || undefined,
      pneumaticSystem: pneumaticSystem || undefined,
      pressMounting: pressMounting || undefined,
      features: features || undefined,
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
      <DialogContent className="flex max-w-4xl flex-col bg-background p-0">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0 border-b border-border p-6 pb-4">
            <DialogTitle className="text-2xl text-foreground">{t('title')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {/* Company and Branch Selection - Hidden when preselected */}
            {!preselectedBranchId && !preselectedCompanyId && (
              <>
                <section className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </>
            )}

            {/* Blueprint Selection */}
            <section className="space-y-4">
              <div>
                <Typography variant="h3">{t('form.blueprint.label')}</Typography>
              </div>

              {isLoadingBlueprints ? (
                <div className="py-8 text-center">
                  <Typography variant="muted">{t('form.blueprint.loading')}</Typography>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {blueprints.map((blueprint) => {
                    const isSelected = selectedBlueprintId === blueprint.id;
                    return (
                      <Card
                        key={blueprint.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500'
                            : 'hover:border-orange-500/50'
                        }`}
                        onClick={() => handleBlueprintSelect(blueprint.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-1 items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                                {blueprint.imageUrl ? (
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                                    <Image
                                      src={blueprint.imageUrl}
                                      alt={blueprint.name}
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                                    <Boxes className="h-5 w-5 text-accent" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <Typography variant="h4" className="text-sm">
                                  {blueprint.name}
                                </Typography>
                                <Typography
                                  variant="small"
                                  className="mt-1 text-xs text-muted-foreground"
                                >
                                  {blueprint.sections.length} {t('sectionsCount')} •{' '}
                                  {blueprint.fields.length} {t('fieldsCount')}
                                </Typography>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500">
                                <Check className="h-3 w-3 text-white" />
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

            <Separator />

            {/* Machine Specifications - Always visible */}
            <section className="space-y-4">
              <Typography variant="h3">{t('form.specifications.title')}</Typography>
              <Typography variant="small" className="text-xs text-muted-foreground">
                {t('form.specifications.allFieldsOptional')}
              </Typography>

              <div className="grid grid-cols-2 gap-4">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">
                    {t('form.specifications.manufacturer.label')}
                  </Label>
                  <Input
                    id="manufacturer"
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder={t('form.specifications.manufacturer.placeholder')}
                  />
                </div>

                {/* Size/Tonnage */}
                <div className="space-y-2">
                  <Label htmlFor="sizeTonnage">{t('form.specifications.sizeTonnage.label')}</Label>
                  <Input
                    id="sizeTonnage"
                    type="text"
                    value={sizeTonnage}
                    onChange={(e) => setSizeTonnage(e.target.value)}
                    placeholder={t('form.specifications.sizeTonnage.placeholder')}
                  />
                </div>

                {/* Serial Number */}
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">
                    {t('form.specifications.serialNumber.label')}
                  </Label>
                  <Input
                    id="serialNumber"
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder={t('form.specifications.serialNumber.placeholder')}
                  />
                </div>

                {/* Stroke */}
                <div className="space-y-2">
                  <Label htmlFor="stroke">{t('form.specifications.stroke.label')}</Label>
                  <Input
                    id="stroke"
                    type="text"
                    value={stroke}
                    onChange={(e) => setStroke(e.target.value)}
                    placeholder={t('form.specifications.stroke.placeholder')}
                  />
                </div>

                {/* Foundation Type */}
                <div className="space-y-2">
                  <Label htmlFor="foundationType">
                    {t('form.specifications.foundationType.label')}
                  </Label>
                  <Select
                    value={foundationType}
                    onValueChange={(val) => setFoundationType(val as FoundationType)}
                  >
                    <SelectTrigger id="foundationType">
                      <SelectValue
                        placeholder={t('form.specifications.foundationType.placeholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FoundationType.PLANT_FLOOR}>
                        {tInspections('foundationType.plantFloor')}
                      </SelectItem>
                      <SelectItem value={FoundationType.ISOLATED_PAD}>
                        {tInspections('foundationType.isolatedPad')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frame Type */}
                <div className="space-y-2">
                  <Label htmlFor="frameType">{t('form.specifications.frameType.label')}</Label>
                  <Select value={frameType} onValueChange={(val) => setFrameType(val as FrameType)}>
                    <SelectTrigger id="frameType">
                      <SelectValue placeholder={t('form.specifications.frameType.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FrameType.GAP}>{tInspections('frameType.gap')}</SelectItem>
                      <SelectItem value={FrameType.STRAIGHT_SIDE}>
                        {tInspections('frameType.straightSide')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clutch Type */}
                <div className="space-y-2">
                  <Label htmlFor="clutchType">{t('form.specifications.clutchType.label')}</Label>
                  <Select
                    value={clutchType}
                    onValueChange={(val) => setClutchType(val as MachineClutchType)}
                  >
                    <SelectTrigger id="clutchType">
                      <SelectValue placeholder={t('form.specifications.clutchType.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MachineClutchType.AIR}>
                        {tInspections('clutchType.air')}
                      </SelectItem>
                      <SelectItem value={MachineClutchType.HYD}>
                        {tInspections('clutchType.hyd')}
                      </SelectItem>
                      <SelectItem value={MachineClutchType.WET_AIR}>
                        {tInspections('clutchType.wetAir')}
                      </SelectItem>
                      <SelectItem value={MachineClutchType.WET_HYD}>
                        {tInspections('clutchType.wetHyd')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pneumatic System */}
                <div className="space-y-2">
                  <Label htmlFor="pneumaticSystem">
                    {t('form.specifications.pneumaticSystem.label')}
                  </Label>
                  <Select
                    value={pneumaticSystem}
                    onValueChange={(val) => setPneumaticSystem(val as PneumaticSystemType)}
                  >
                    <SelectTrigger id="pneumaticSystem">
                      <SelectValue
                        placeholder={t('form.specifications.pneumaticSystem.placeholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PneumaticSystemType.NA}>
                        {tInspections('pneumaticSystem.na')}
                      </SelectItem>
                      <SelectItem value={PneumaticSystemType.COUNTERBALANCE}>
                        {tInspections('pneumaticSystem.counterbalance')}
                      </SelectItem>
                      <SelectItem value={PneumaticSystemType.CBAL_W_DIE_CUSHION}>
                        {tInspections('pneumaticSystem.cbalWDieCushion')}
                      </SelectItem>
                      <SelectItem value={PneumaticSystemType.DIE_CUSHION_ONLY}>
                        {tInspections('pneumaticSystem.dieCushionOnly')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Press Mounting */}
                <div className="space-y-2">
                  <Label htmlFor="pressMounting">
                    {t('form.specifications.pressMounting.label')}
                  </Label>
                  <Select
                    value={pressMounting}
                    onValueChange={(val) => setPressMounting(val as PressMountingType)}
                  >
                    <SelectTrigger id="pressMounting">
                      <SelectValue
                        placeholder={t('form.specifications.pressMounting.placeholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PressMountingType.ADJUSTABLE}>
                        {tInspections('pressMounting.adjustable')}
                      </SelectItem>
                      <SelectItem value={PressMountingType.ON_FLOOR}>
                        {tInspections('pressMounting.onFloor')}
                      </SelectItem>
                      <SelectItem value={PressMountingType.SHIMS}>
                        {tInspections('pressMounting.shims')}
                      </SelectItem>
                      <SelectItem value={PressMountingType.OTHER}>
                        {tInspections('pressMounting.other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label htmlFor="features">{t('form.specifications.features.label')}</Label>
                  <Select
                    value={features}
                    onValueChange={(val) => setFeatures(val as MachineFeaturesType)}
                  >
                    <SelectTrigger id="features">
                      <SelectValue placeholder={t('form.specifications.features.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MachineFeaturesType.AIM}>
                        {tInspections('features.aim')}
                      </SelectItem>
                      <SelectItem value={MachineFeaturesType.ADJ_STROKE}>
                        {tInspections('features.adjStroke')}
                      </SelectItem>
                      <SelectItem value={MachineFeaturesType.DOUBLE_LOCKUP}>
                        {tInspections('features.doubleLockup')}
                      </SelectItem>
                      <SelectItem value={MachineFeaturesType.NA}>
                        {tInspections('features.na')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {selectedBlueprint && (
              <>
                <Separator />

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

                {selectedBlueprint.fields.length > 0 && (
                  <>
                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <Label>{t('form.fields.label')}</Label>
                      </div>

                      <div className="space-y-4 pb-6">
                        {selectedBlueprint.fields.map((field) => (
                          <Card key={field.fieldSlug}>
                            <CardContent className="pt-6">
                              <div className="space-y-2">
                                <Label htmlFor={`field-${field.fieldSlug}`}>
                                  {field.fieldName}
                                </Label>
                                {renderFieldInput(field)}
                                <Typography
                                  variant="small"
                                  className="text-xs text-muted-foreground"
                                >
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
              </>
            )}

            {!selectedBlueprint && !isLoadingBlueprints && (
              <div className="py-8 text-center">
                <Typography variant="muted">{t('form.selectBlueprintPrompt')}</Typography>
              </div>
            )}

            {result?.errors && result.errors.length > 0 && (
              <div className="mb-6 rounded-md border border-destructive bg-destructive/10 p-4">
                <Typography variant="h3" className="mb-2 text-destructive">
                  {t('form.error.title')}
                </Typography>
                <ul className="list-inside list-disc space-y-1">
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

          <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-background p-6">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedBlueprint || !selectedBranchId}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
