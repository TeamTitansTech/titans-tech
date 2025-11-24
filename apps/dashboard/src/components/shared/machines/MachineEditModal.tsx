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

export function MachineEditModal({ isOpen, onClose, onSuccess, machine }: MachineEditModalProps) {
  const tInspections = useTranslations('inspections.form.enums');

  const [machineName, setMachineName] = useState(machine.name);
  const [manufacturer, setManufacturer] = useState(machine.manufacturer || '');
  const [sizeTonnage, setSizeTonnage] = useState(machine.sizeTonnage || '');
  const [serialNumber, setSerialNumber] = useState(machine.serialNumber || '');
  const [stroke, setStroke] = useState(machine.stroke || '');
  const [foundationType, setFoundationType] = useState<FoundationType | ''>(
    machine.foundationType || '',
  );
  const [frameType, setFrameType] = useState<FrameType | ''>(machine.frameType || '');
  const [clutchType, setClutchType] = useState<MachineClutchType | ''>(machine.clutchType || '');
  const [pneumaticSystem, setPneumaticSystem] = useState<PneumaticSystemType | ''>(
    machine.pneumaticSystem || '',
  );
  const [pressMounting, setPressMounting] = useState<PressMountingType | ''>(
    machine.pressMounting || '',
  );
  const [features, setFeatures] = useState<MachineFeaturesType | ''>(machine.features || '');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { execute: submitUpdate, isLoading } = useLazyQuery((payload: any) =>
    updateMachine(machine.id, payload),
  );

  // Reset form when machine changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMachineName(machine.name);
    setManufacturer(machine.manufacturer || '');
    setSizeTonnage(machine.sizeTonnage || '');
    setSerialNumber(machine.serialNumber || '');
    setStroke(machine.stroke || '');
    setFoundationType(machine.foundationType || '');
    setFrameType(machine.frameType || '');
    setClutchType(machine.clutchType || '');
    setPneumaticSystem(machine.pneumaticSystem || '');
    setPressMounting(machine.pressMounting || '');
    setFeatures(machine.features || '');
  }, [machine]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: machineName,
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
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
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
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Enter manufacturer"
                  />
                </div>

                {/* Size/Tonnage */}
                <div className="space-y-2">
                  <Label htmlFor="sizeTonnage">Size/Tonnage</Label>
                  <Input
                    id="sizeTonnage"
                    type="text"
                    value={sizeTonnage}
                    onChange={(e) => setSizeTonnage(e.target.value)}
                    placeholder="Enter size/tonnage"
                  />
                </div>

                {/* Serial Number */}
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Enter serial number"
                  />
                </div>

                {/* Stroke */}
                <div className="space-y-2">
                  <Label htmlFor="stroke">Stroke</Label>
                  <Input
                    id="stroke"
                    type="text"
                    value={stroke}
                    onChange={(e) => setStroke(e.target.value)}
                    placeholder="Enter stroke"
                  />
                </div>

                {/* Foundation Type */}
                <div className="space-y-2">
                  <Label htmlFor="foundationType">Foundation Type</Label>
                  <Select
                    value={foundationType}
                    onValueChange={(val) => setFoundationType(val as FoundationType)}
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
                  <Select value={frameType} onValueChange={(val) => setFrameType(val as FrameType)}>
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
                    value={clutchType}
                    onValueChange={(val) => setClutchType(val as MachineClutchType)}
                  >
                    <SelectTrigger id="clutchType">
                      <SelectValue placeholder="Select clutch type" />
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
                  <Label htmlFor="pneumaticSystem">Pneumatic System</Label>
                  <Select
                    value={pneumaticSystem}
                    onValueChange={(val) => setPneumaticSystem(val as PneumaticSystemType)}
                  >
                    <SelectTrigger id="pneumaticSystem">
                      <SelectValue placeholder="Select pneumatic system" />
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
                  <Label htmlFor="pressMounting">Press Mounting</Label>
                  <Select
                    value={pressMounting}
                    onValueChange={(val) => setPressMounting(val as PressMountingType)}
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
                    value={features}
                    onValueChange={(val) => setFeatures(val as MachineFeaturesType)}
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
