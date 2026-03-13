'use client';

import { useState, useEffect } from 'react';
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
import { updateMachine } from '@/data/services/machines.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from '@titans-tech/shared/types/enums';

export interface MachineEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  machine: {
    id: string;
    name: string;
    manufacturer?: string | null;
    sizeTonnage?: string | null;
    serialNumber?: string | null;
    stroke?: string | null;
    foundationType?: FoundationType | null;
    frameType?: FrameType | null;
    clutchType?: MachineClutchType | null;
    pneumaticSystem?: PneumaticSystemType | null;
    pressMounting?: PressMountingType | null;
    features?: MachineFeaturesType | null;
    fields?: Array<{ fieldSlug: string; value: string | number }>;
    blueprint?: { name: string };
  };
}

interface FormState {
  name: string;
  manufacturer: string;
  sizeTonnage: string;
  serialNumber: string;
  stroke: string;
  foundationType: FoundationType | '';
  frameType: FrameType | '';
  clutchType: MachineClutchType | '';
  pneumaticSystem: PneumaticSystemType | '';
  pressMounting: PressMountingType | '';
  features: MachineFeaturesType | '';
}

const getInitialFormState = (machine: MachineEditModalProps['machine']): FormState => ({
  name: machine.name,
  manufacturer: machine.manufacturer || '',
  sizeTonnage: machine.sizeTonnage || '',
  serialNumber: machine.serialNumber || '',
  stroke: machine.stroke || '',
  foundationType: machine.foundationType || '',
  frameType: machine.frameType || '',
  clutchType: machine.clutchType || '',
  pneumaticSystem: machine.pneumaticSystem || '',
  pressMounting: machine.pressMounting || '',
  features: machine.features || '',
});

export function MachineEditModal({ isOpen, onClose, onSuccess, machine }: MachineEditModalProps) {
  const tInspections = useTranslations('inspections.form.enums');
  const t = useTranslations('machines.editModal');

  const [formState, setFormState] = useState<FormState>(() => getInitialFormState(machine));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { execute: submitUpdate, isLoading } = useLazyQuery((payload: any) =>
    updateMachine(machine.id, payload),
  );

  // Reset form when machine changes
  useEffect(() => {
    setFormState(getInitialFormState(machine));
  }, [machine]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formState.name,
      manufacturer: formState.manufacturer || undefined,
      sizeTonnage: formState.sizeTonnage || undefined,
      serialNumber: formState.serialNumber || undefined,
      stroke: formState.stroke || undefined,
      foundationType: formState.foundationType || undefined,
      frameType: formState.frameType || undefined,
      clutchType: formState.clutchType || undefined,
      pneumaticSystem: formState.pneumaticSystem || undefined,
      pressMounting: formState.pressMounting || undefined,
      features: formState.features || undefined,
    };

    const response = await submitUpdate(payload);

    if (response.data) {
      toast.success(t('updateSuccess'));
      onSuccess?.();
      onClose();
    } else if (response.errors) {
      toast.error(response.errors.join(', '));
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
            {/* Model (Read-only) */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label>{t('labels.model')}</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-muted-foreground">
                  {machine.blueprint?.name || t('noModel')}
                </div>
                <Typography variant="small" className="text-xs text-muted-foreground">
                  {t('modelCannotBeChanged')}
                </Typography>
              </div>
            </section>

            <Separator />

            {/* Machine Name */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('labels.machineName')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formState.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  placeholder={t('placeholders.machineName')}
                />
              </div>
            </section>

            <Separator />

            {/* Machine Specifications */}
            <section className="space-y-4">
              <Typography variant="h3">{t('machineSpecifications')}</Typography>
              <Typography variant="small" className="text-xs text-muted-foreground">
                {t('allFieldsOptional')}
              </Typography>

              <div className="grid grid-cols-2 gap-4">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">{t('labels.manufacturer')}</Label>
                  <Input
                    id="manufacturer"
                    type="text"
                    value={formState.manufacturer}
                    onChange={(e) => updateField('manufacturer', e.target.value)}
                    placeholder={t('placeholders.manufacturer')}
                  />
                </div>

                {/* Size/Tonnage */}
                <div className="space-y-2">
                  <Label htmlFor="sizeTonnage">{t('labels.sizeTonnage')}</Label>
                  <Input
                    id="sizeTonnage"
                    type="text"
                    value={formState.sizeTonnage}
                    onChange={(e) => updateField('sizeTonnage', e.target.value)}
                    placeholder={t('placeholders.sizeTonnage')}
                  />
                </div>

                {/* Serial Number */}
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">{t('labels.serialNumber')}</Label>
                  <Input
                    id="serialNumber"
                    type="text"
                    value={formState.serialNumber}
                    onChange={(e) => updateField('serialNumber', e.target.value)}
                    placeholder={t('placeholders.serialNumber')}
                  />
                </div>

                {/* Stroke */}
                <div className="space-y-2">
                  <Label htmlFor="stroke">{t('labels.stroke')}</Label>
                  <Input
                    id="stroke"
                    type="text"
                    value={formState.stroke}
                    onChange={(e) => updateField('stroke', e.target.value)}
                    placeholder={t('placeholders.stroke')}
                  />
                </div>

                {/* Foundation Type */}
                <div className="space-y-2">
                  <Label htmlFor="foundationType">{t('labels.foundationType')}</Label>
                  <Select
                    value={formState.foundationType}
                    onValueChange={(val) => updateField('foundationType', val as FoundationType)}
                  >
                    <SelectTrigger id="foundationType">
                      <SelectValue placeholder={t('placeholders.foundationType')} />
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
                  <Label htmlFor="frameType">{t('labels.frameType')}</Label>
                  <Select
                    value={formState.frameType}
                    onValueChange={(val) => updateField('frameType', val as FrameType)}
                  >
                    <SelectTrigger id="frameType">
                      <SelectValue placeholder={t('placeholders.frameType')} />
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
                  <Label htmlFor="clutchType">{t('labels.clutchType')}</Label>
                  <Select
                    value={formState.clutchType}
                    onValueChange={(val) => updateField('clutchType', val as MachineClutchType)}
                  >
                    <SelectTrigger id="clutchType">
                      <SelectValue placeholder={t('placeholders.clutchType')} />
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
                  <Label htmlFor="pneumaticSystem">{t('labels.pneumaticSystem')}</Label>
                  <Select
                    value={formState.pneumaticSystem}
                    onValueChange={(val) =>
                      updateField('pneumaticSystem', val as PneumaticSystemType)
                    }
                  >
                    <SelectTrigger id="pneumaticSystem">
                      <SelectValue placeholder={t('placeholders.pneumaticSystem')} />
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
                  <Label htmlFor="pressMounting">{t('labels.pressMounting')}</Label>
                  <Select
                    value={formState.pressMounting}
                    onValueChange={(val) => updateField('pressMounting', val as PressMountingType)}
                  >
                    <SelectTrigger id="pressMounting">
                      <SelectValue placeholder={t('placeholders.pressMounting')} />
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
                  <Label htmlFor="features">{t('labels.features')}</Label>
                  <Select
                    value={formState.features}
                    onValueChange={(val) => updateField('features', val as MachineFeaturesType)}
                  >
                    <SelectTrigger id="features">
                      <SelectValue placeholder={t('placeholders.features')} />
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
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-background p-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="machine-edit-update-button"
            >
              {isLoading ? t('updating') : t('updateMachine')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
