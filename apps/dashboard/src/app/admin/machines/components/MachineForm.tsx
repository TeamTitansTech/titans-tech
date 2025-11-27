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
import { getAllCompanies, Company } from '@/data/services/companies.api';
import { responseHandler } from '@/data/helpers/responseHandler';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { BlueprintField, Blueprint, FieldValue } from '@/data/types/machines.types';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from '@titans-tech/shared/types';

interface Branch {
  id: string;
  name: string;
  isMainBranch: boolean;
  location?: string | null;
}

export function MachineForm() {
  const t = useTranslations('machines');
  const tInspections = useTranslations('inspections.form.enums');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [machineName, setMachineName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [lastBlueprintId, setLastBlueprintId] = useState<string>('');
  const [isLoadingBlueprints, setIsLoadingBlueprints] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

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
    if (!selectedBlueprintId) return null;
    return blueprints.find((bp) => bp.id === selectedBlueprintId) || null;
  }, [selectedBlueprintId, blueprints]);

  if (selectedBlueprintId !== lastBlueprintId) {
    setLastBlueprintId(selectedBlueprintId);
    setFieldValues({});
  }

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      const response = await getAllCompanies();
      if (response.data) {
        setCompanies(response.data);
      }
      setIsLoadingCompanies(false);
    };

    loadCompanies();
  }, []);

  // Load blueprints on mount
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
            {/* Company Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">{t('form.company.label')}</Label>
              </div>
              <Select
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
                disabled={isLoadingCompanies}
              >
                <SelectTrigger id="company">
                  <SelectValue
                    placeholder={
                      isLoadingCompanies ? t('form.company.loading') : t('form.company.placeholder')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch Selection */}
            {selectedCompanyId && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="branch">{t('form.branch.label')}</Label>
                </div>
                <Select
                  value={selectedBranchId}
                  onValueChange={setSelectedBranchId}
                  disabled={isLoadingBranches || branches.length === 0}
                >
                  <SelectTrigger id="branch">
                    <SelectValue
                      placeholder={
                        isLoadingBranches
                          ? t('form.branch.loading')
                          : branches.length === 0
                            ? t('form.branch.noBranches')
                            : t('form.branch.placeholder')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                        {branch.isMainBranch && ` ${t('mainBranchSuffix')}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

                {/* Machine Specifications */}
                <div className="border rounded-lg p-4 space-y-4">
                  <Typography variant="h4" className="mb-3">
                    {t('machineSpecificationsOptional')}
                  </Typography>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Manufacturer */}
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">{t('specifications.manufacturer')}</Label>
                      <Input
                        id="manufacturer"
                        type="text"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        placeholder={t('specifications.manufacturerPlaceholder')}
                      />
                    </div>

                    {/* Size/Tonnage */}
                    <div className="space-y-2">
                      <Label htmlFor="sizeTonnage">{t('specifications.sizeTonnage')}</Label>
                      <Input
                        id="sizeTonnage"
                        type="text"
                        value={sizeTonnage}
                        onChange={(e) => setSizeTonnage(e.target.value)}
                        placeholder={t('specifications.sizeTonnagePlaceholder')}
                      />
                    </div>

                    {/* Serial Number */}
                    <div className="space-y-2">
                      <Label htmlFor="serialNumber">{t('specifications.serialNumber')}</Label>
                      <Input
                        id="serialNumber"
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder={t('specifications.serialNumberPlaceholder')}
                      />
                    </div>

                    {/* Stroke */}
                    <div className="space-y-2">
                      <Label htmlFor="stroke">{t('specifications.stroke')}</Label>
                      <Input
                        id="stroke"
                        type="text"
                        value={stroke}
                        onChange={(e) => setStroke(e.target.value)}
                        placeholder={t('specifications.strokePlaceholder')}
                      />
                    </div>

                    {/* Foundation Type */}
                    <div className="space-y-2">
                      <Label htmlFor="foundationType">{t('specifications.foundationType')}</Label>
                      <Select
                        value={foundationType}
                        onValueChange={(val) => setFoundationType(val as FoundationType)}
                      >
                        <SelectTrigger id="foundationType">
                          <SelectValue
                            placeholder={t('specifications.foundationTypePlaceholder')}
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
                      <Label htmlFor="frameType">{t('specifications.frameType')}</Label>
                      <Select
                        value={frameType}
                        onValueChange={(val) => setFrameType(val as FrameType)}
                      >
                        <SelectTrigger id="frameType">
                          <SelectValue placeholder={t('specifications.frameTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FrameType.GAP}>
                            {tInspections('frameType.gap')}
                          </SelectItem>
                          <SelectItem value={FrameType.STRAIGHT_SIDE}>
                            {tInspections('frameType.straightSide')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clutch Type */}
                    <div className="space-y-2">
                      <Label htmlFor="clutchType">{t('specifications.clutchType')}</Label>
                      <Select
                        value={clutchType}
                        onValueChange={(val) => setClutchType(val as MachineClutchType)}
                      >
                        <SelectTrigger id="clutchType">
                          <SelectValue placeholder={t('specifications.clutchTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={MachineClutchType.JH5}>
                            {tInspections('clutchType.jh5')}
                          </SelectItem>
                          <SelectItem value={MachineClutchType.NA}>
                            {tInspections('clutchType.na')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pneumatic System */}
                    <div className="space-y-2">
                      <Label htmlFor="pneumaticSystem">{t('specifications.pneumaticSystem')}</Label>
                      <Select
                        value={pneumaticSystem}
                        onValueChange={(val) => setPneumaticSystem(val as PneumaticSystemType)}
                      >
                        <SelectTrigger id="pneumaticSystem">
                          <SelectValue
                            placeholder={t('specifications.pneumaticSystemPlaceholder')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PneumaticSystemType.AIR}>
                            {tInspections('pneumaticSystem.air')}
                          </SelectItem>
                          <SelectItem value={PneumaticSystemType.HYD}>
                            {tInspections('pneumaticSystem.hyd')}
                          </SelectItem>
                          <SelectItem value={PneumaticSystemType.WET_AIR}>
                            {tInspections('pneumaticSystem.wetAir')}
                          </SelectItem>
                          <SelectItem value={PneumaticSystemType.WET_HYD}>
                            {tInspections('pneumaticSystem.wetHyd')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Press Mounting */}
                    <div className="space-y-2">
                      <Label htmlFor="pressMounting">{t('specifications.pressMounting')}</Label>
                      <Select
                        value={pressMounting}
                        onValueChange={(val) => setPressMounting(val as PressMountingType)}
                      >
                        <SelectTrigger id="pressMounting">
                          <SelectValue placeholder={t('specifications.pressMountingPlaceholder')} />
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
                      <Label htmlFor="features">{t('specifications.features')}</Label>
                      <Select
                        value={features}
                        onValueChange={(val) => setFeatures(val as MachineFeaturesType)}
                      >
                        <SelectTrigger id="features">
                          <SelectValue placeholder={t('specifications.featuresPlaceholder')} />
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

                <Button type="submit" disabled={isLoading || !selectedBranchId} className="w-full">
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
