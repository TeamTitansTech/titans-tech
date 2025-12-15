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
      toast.success('Machine updated successfully');
      onSuccess?.();
      onClose();
    } else if (response.errors) {
      toast.error(response.errors.join(', '));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col bg-background">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
            <DialogTitle className="text-2xl text-foreground">Edit Machine</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update machine details and specifications
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
            {/* Model (Read-only) */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <div className="px-3 py-2 rounded-md border bg-muted/30 text-muted-foreground">
                  {machine.blueprint?.name || 'No model'}
                </div>
                <Typography variant="small" className="text-xs text-muted-foreground">
                  Model cannot be changed after creation
                </Typography>
              </div>
            </section>

            <Separator />

            {/* Machine Name */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Machine Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formState.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  placeholder="Enter machine name"
                />
              </div>
            </section>

            <Separator />

            {/* Machine Specifications */}
            <section className="space-y-4">
              <Typography variant="h3">Machine Specifications</Typography>
              <Typography variant="small" className="text-xs text-muted-foreground">
                All fields are optional
              </Typography>

              <div className="grid grid-cols-2 gap-4">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    type="text"
                    value={formState.manufacturer}
                    onChange={(e) => updateField('manufacturer', e.target.value)}
                    placeholder="Enter manufacturer"
                  />
                </div>

                {/* Size/Tonnage */}
                <div className="space-y-2">
                  <Label htmlFor="sizeTonnage">Size/Tonnage</Label>
                  <Input
                    id="sizeTonnage"
                    type="text"
                    value={formState.sizeTonnage}
                    onChange={(e) => updateField('sizeTonnage', e.target.value)}
                    placeholder="Enter size/tonnage"
                  />
                </div>

                {/* Serial Number */}
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    type="text"
                    value={formState.serialNumber}
                    onChange={(e) => updateField('serialNumber', e.target.value)}
                    placeholder="Enter serial number"
                  />
                </div>

                {/* Stroke */}
                <div className="space-y-2">
                  <Label htmlFor="stroke">Stroke</Label>
                  <Input
                    id="stroke"
                    type="text"
                    value={formState.stroke}
                    onChange={(e) => updateField('stroke', e.target.value)}
                    placeholder="Enter stroke"
                  />
                </div>

                {/* Foundation Type */}
                <div className="space-y-2">
                  <Label htmlFor="foundationType">Foundation Type</Label>
                  <Select
                    value={formState.foundationType}
                    onValueChange={(val) => updateField('foundationType', val as FoundationType)}
                  >
                    <SelectTrigger id="foundationType">
                      <SelectValue placeholder="Select foundation type" />
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
                  <Label htmlFor="frameType">Frame Type</Label>
                  <Select
                    value={formState.frameType}
                    onValueChange={(val) => updateField('frameType', val as FrameType)}
                  >
                    <SelectTrigger id="frameType">
                      <SelectValue placeholder="Select frame type" />
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
                  <Label htmlFor="clutchType">Clutch Type</Label>
                  <Select
                    value={formState.clutchType}
                    onValueChange={(val) => updateField('clutchType', val as MachineClutchType)}
                  >
                    <SelectTrigger id="clutchType">
                      <SelectValue placeholder="Select clutch type" />
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
                  <Label htmlFor="pneumaticSystem">Pneumatic System</Label>
                  <Select
                    value={formState.pneumaticSystem}
                    onValueChange={(val) =>
                      updateField('pneumaticSystem', val as PneumaticSystemType)
                    }
                  >
                    <SelectTrigger id="pneumaticSystem">
                      <SelectValue placeholder="Select pneumatic system" />
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
                  <Label htmlFor="pressMounting">Press Mounting</Label>
                  <Select
                    value={formState.pressMounting}
                    onValueChange={(val) => updateField('pressMounting', val as PressMountingType)}
                  >
                    <SelectTrigger id="pressMounting">
                      <SelectValue placeholder="Select press mounting" />
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
                  <Label htmlFor="features">Features</Label>
                  <Select
                    value={formState.features}
                    onValueChange={(val) => updateField('features', val as MachineFeaturesType)}
                  >
                    <SelectTrigger id="features">
                      <SelectValue placeholder="Select features" />
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

          <div className="border-t border-border p-6 flex justify-end gap-3 shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Updating...' : 'Update Machine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
