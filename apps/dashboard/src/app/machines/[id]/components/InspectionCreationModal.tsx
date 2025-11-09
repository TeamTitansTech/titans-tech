'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createInspection } from '@/data/services/inspections.api';
import {
  MatingPartType,
  type BearingClearanceData,
  type CreateInspectionPayload,
} from '@/data/types/inspections.types';

interface InspectionCreationModalProps {
  machineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OUTER_FIELDS = [
  'totalClearance_RH',
  'totalClearance_LH',
  'mainBearings_RH',
  'mainBearings_LH',
  'upperConnectionBearings_RH',
  'upperConnectionBearings_LH',
  'wristPinToMatingPart_RH',
  'wristPinToMatingPart_LH',
  'wristPinToBushing_RH',
  'wristPinToBushing_LH',
  'slide_adj_nut_to_screw_sleeve_RH',
  'slide_adj_nut_to_screw_sleeve_LH',
  'extra_double_lockOpen_RH',
  'extra_double_lockOpen_LH',
  'ball_box_area_RH',
  'ball_box_area_LH',
] as const;

const INNER_FIELDS = [
  'innerTotalClearance_RH',
  'innerTotalClearance_LH',
  'innerMainBearings_RH',
  'innerMainBearings_LH',
  'innerUpperConnectionBearings_RH',
  'innerUpperConnectionBearings_LH',
  'innerWristPinToMatingPart_RH',
  'innerWristPinToMatingPart_LH',
  'innerWristPinToBushing_RH',
  'innerWristPinToBushing_LH',
  'innerSlide_adj_nut_to_screw_sleeve_RH',
  'innerSlide_adj_nut_to_screw_sleeve_LH',
  'innerExtra_double_lockOpen_RH',
  'innerExtra_double_lockOpen_LH',
  'innerBall_box_area_RH',
  'innerBall_box_area_LH',
] as const;

const defaultBearingData: BearingClearanceData = {
  totalClearance_RH: 0,
  totalClearance_LH: 0,
  mainBearings_RH: 0,
  mainBearings_LH: 0,
  upperConnectionBearings_RH: 0,
  upperConnectionBearings_LH: 0,
  wristPinToMatingPart_RH: 0,
  wristPinToMatingPart_LH: 0,
  wristPinToBushing_RH: 0,
  wristPinToBushing_LH: 0,
  slide_adj_nut_to_screw_sleeve_RH: 0,
  slide_adj_nut_to_screw_sleeve_LH: 0,
  extra_double_lockOpen_RH: 0,
  extra_double_lockOpen_LH: 0,
  ball_box_area_RH: 0,
  ball_box_area_LH: 0,
  innerTotalClearance_RH: 0,
  innerTotalClearance_LH: 0,
  innerMainBearings_RH: 0,
  innerMainBearings_LH: 0,
  innerUpperConnectionBearings_RH: 0,
  innerUpperConnectionBearings_LH: 0,
  innerWristPinToMatingPart_RH: 0,
  innerWristPinToMatingPart_LH: 0,
  innerWristPinToBushing_RH: 0,
  innerWristPinToBushing_LH: 0,
  innerSlide_adj_nut_to_screw_sleeve_RH: 0,
  innerSlide_adj_nut_to_screw_sleeve_LH: 0,
  innerExtra_double_lockOpen_RH: 0,
  innerExtra_double_lockOpen_LH: 0,
  innerBall_box_area_RH: 0,
  innerBall_box_area_LH: 0,
  combined_with: '',
  mating_part: MatingPartType.BUSHING,
};

export function InspectionCreationModal({
  machineId,
  open,
  onOpenChange,
}: InspectionCreationModalProps) {
  const t = useTranslations('inspections');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [performedBy, setPerformedBy] = useState('');
  const [beforeData, setBeforeData] = useState<BearingClearanceData>(defaultBearingData);
  const [afterData, setAfterData] = useState<BearingClearanceData>(defaultBearingData);
  const [includeBefore, setIncludeBefore] = useState(true);
  const [includeAfter, setIncludeAfter] = useState(false);

  const updateBeforeField = (field: keyof BearingClearanceData, value: string | number) => {
    setBeforeData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAfterField = (field: keyof BearingClearanceData, value: string | number) => {
    setAfterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: CreateInspectionPayload = {
        machineId,
        date: new Date(date).toISOString(),
        isMaintenance,
        performedBy: performedBy || undefined,
        bearingClearance: (includeBefore || includeAfter) ? {
          before: includeBefore ? beforeData : undefined,
          after: includeAfter ? afterData : undefined,
        } : undefined,
      };


      const response = await createInspection(payload);

      if (response.errors) {
        toast.error(t('form.error.title') + ' ' + response.errors.join(', '));
      } else {
        toast.success(t('createdSuccessfully'));
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao criar inspeção:', error);
      toast.error(t('form.error.title') + ' ' + String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBearingFields = (
    data: BearingClearanceData,
    updateFn: (field: keyof BearingClearanceData, value: string | number) => void
  ) => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">{t('form.bearingClearance.outer')}</h4>
        <div className="grid grid-cols-2 gap-4">
          {OUTER_FIELDS.map((field) => (
            <div key={field}>
              <Label htmlFor={field} className="text-xs">
                {t(`form.bearingClearance.fields.${field}`)}
              </Label>
              <Input
                id={field}
                type="number"
                step="0.0001"
                value={data[field as keyof BearingClearanceData]}
                onChange={(e) => updateFn(field as keyof BearingClearanceData, Number(e.target.value))}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">{t('form.bearingClearance.inner')}</h4>
        <div className="grid grid-cols-2 gap-4">
          {INNER_FIELDS.map((field) => (
            <div key={field}>
              <Label htmlFor={field} className="text-xs">
                {t(`form.bearingClearance.fields.${field.replace('inner', '')}`)}
              </Label>
              <Input
                id={field}
                type="number"
                step="0.0001"
                value={data[field as keyof BearingClearanceData]}
                onChange={(e) => updateFn(field as keyof BearingClearanceData, Number(e.target.value))}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="combined_with">{t('form.bearingClearance.combined_with.label')}</Label>
          <Input
            id="combined_with"
            value={data.combined_with}
            onChange={(e) => updateFn('combined_with', e.target.value)}
            placeholder={t('form.bearingClearance.combined_with.placeholder')}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mating_part">{t('form.bearingClearance.mating_part.label')}</Label>
          <Select
            value={data.mating_part}
            onValueChange={(value) => updateFn('mating_part', value as MatingPartType)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MatingPartType.BUSHING}>
                {t('form.bearingClearance.mating_part.bushing')}
              </SelectItem>
              <SelectItem value={MatingPartType.CONNECTION}>
                {t('form.bearingClearance.mating_part.connection')}
              </SelectItem>
              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                {t('form.bearingClearance.mating_part.nut_screw_sleeve')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">{t('form.date.label')}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="performedBy">{t('form.performedBy.label')}</Label>
              <Input
                id="performedBy"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder={t('form.performedBy.placeholder')}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMaintenance"
              checked={isMaintenance}
              onCheckedChange={(checked: boolean) => setIsMaintenance(checked)}
            />
            <Label htmlFor="isMaintenance" className="cursor-pointer">
              {t('form.isMaintenance.label')}
            </Label>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('form.bearingClearance.title')}</h3>

            <div className="flex gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeBefore"
                  checked={includeBefore}
                  onCheckedChange={(checked: boolean) => setIncludeBefore(checked)}
                />
                <Label htmlFor="includeBefore" className="cursor-pointer">
                  {t('form.bearingClearance.before')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAfter"
                  checked={includeAfter}
                  onCheckedChange={(checked: boolean) => setIncludeAfter(checked)}
                />
                <Label htmlFor="includeAfter" className="cursor-pointer">
                  {t('form.bearingClearance.after')}
                </Label>
              </div>
            </div>

            <Tabs defaultValue="before" className="w-full">
              <TabsList>
                <TabsTrigger value="before" disabled={!includeBefore}>
                  {t('form.bearingClearance.before')}
                </TabsTrigger>
                <TabsTrigger value="after" disabled={!includeAfter}>
                  {t('form.bearingClearance.after')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="before" className="mt-4">
                {renderBearingFields(beforeData, updateBeforeField)}
              </TabsContent>

              <TabsContent value="after" className="mt-4">
                {renderBearingFields(afterData, updateAfterField)}
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
