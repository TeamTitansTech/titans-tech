'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ParallelismType,
  type SlideData,
  type SlideFormProps,
} from '@/data/types/services.types';

export function SlideForm({ data, updateFn, errors, handleBlur, title }: SlideFormProps) {
  const t = useTranslations('inspections');

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`parallelism-${title}`} className="text-xs">
            {t('form.slide.parallelism')}
          </Label>
          <Select
            value={data.parallelism}
            onValueChange={(value) => updateFn('parallelism', value as ParallelismType)}
          >
            <SelectTrigger className="mt-1" id={`parallelism-${title}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ParallelismType.DNC}>
                {t('form.slide.parallelismType.DNC')}
              </SelectItem>
              <SelectItem value={ParallelismType.TO_BED}>
                {t('form.slide.parallelismType.TO_BED')}
              </SelectItem>
              <SelectItem value={ParallelismType.TO_BOLSTER}>
                {t('form.slide.parallelismType.TO_BOLSTER')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <Checkbox
            id={`hasBeenAdjusted-${title}`}
            checked={data.hasBeenAdjusted}
            onCheckedChange={(checked: boolean) => updateFn('hasBeenAdjusted', checked)}
          />
          <Label htmlFor={`hasBeenAdjusted-${title}`} className="cursor-pointer text-xs">
            {t('form.slide.hasBeenAdjusted')}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor={`position1-${title}`} className="text-xs">
            {t('form.slide.position1')}
          </Label>
          <Input
            id={`position1-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position1}
            onChange={(e) => updateFn('position1', Number(e.target.value))}
            onBlur={() => handleBlur('position1')}
            className={`mt-1 ${errors.position1 ? 'border-destructive' : ''}`}
            required
          />
          {errors.position1 && <p className="text-xs text-destructive mt-1">{errors.position1}</p>}
        </div>

        <div>
          <Label htmlFor={`position2-${title}`} className="text-xs">
            {t('form.slide.position2')}
          </Label>
          <Input
            id={`position2-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position2}
            onChange={(e) => updateFn('position2', Number(e.target.value))}
            onBlur={() => handleBlur('position2')}
            className={`mt-1 ${errors.position2 ? 'border-destructive' : ''}`}
            required
          />
          {errors.position2 && <p className="text-xs text-destructive mt-1">{errors.position2}</p>}
        </div>

        <div>
          <Label htmlFor={`position3-${title}`} className="text-xs">
            {t('form.slide.position3')}
          </Label>
          <Input
            id={`position3-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position3}
            onChange={(e) => updateFn('position3', Number(e.target.value))}
            onBlur={() => handleBlur('position3')}
            className={`mt-1 ${errors.position3 ? 'border-destructive' : ''}`}
            required
          />
          {errors.position3 && <p className="text-xs text-destructive mt-1">{errors.position3}</p>}
        </div>

        <div>
          <Label htmlFor={`position4-${title}`} className="text-xs">
            {t('form.slide.position4')}
          </Label>
          <Input
            id={`position4-${title}`}
            type="number"
            step="0.0001"
            min="0"
            max="999999.9999"
            value={data.position4}
            onChange={(e) => updateFn('position4', Number(e.target.value))}
            onBlur={() => handleBlur('position4')}
            className={`mt-1 ${errors.position4 ? 'border-destructive' : ''}`}
            required
          />
          {errors.position4 && <p className="text-xs text-destructive mt-1">{errors.position4}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`actualSH-${title}`} className="text-xs">
            {t('form.slide.actualSH')}
          </Label>
          <Input
            id={`actualSH-${title}`}
            value={data.actualSH || ''}
            onChange={(e) => updateFn('actualSH', e.target.value)}
            onBlur={() => handleBlur('actualSH')}
            className={`mt-1 ${errors.actualSH ? 'border-destructive' : ''}`}
          />
          {errors.actualSH && <p className="text-xs text-destructive mt-1">{errors.actualSH}</p>}
        </div>

        <div>
          <Label htmlFor={`overloadsOnMonitor-${title}`} className="text-xs">
            {t('form.slide.overloadsOnMonitor')}
          </Label>
          <Input
            id={`overloadsOnMonitor-${title}`}
            value={data.overloadsOnMonitor || ''}
            onChange={(e) => updateFn('overloadsOnMonitor', e.target.value)}
            onBlur={() => handleBlur('overloadsOnMonitor')}
            className={`mt-1 ${errors.overloadsOnMonitor ? 'border-destructive' : ''}`}
          />
          {errors.overloadsOnMonitor && (
            <p className="text-xs text-destructive mt-1">{errors.overloadsOnMonitor}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`indicatorReading-${title}`} className="text-xs">
            {t('form.slide.indicatorReading')}
          </Label>
          <Input
            id={`indicatorReading-${title}`}
            value={data.indicatorReading || ''}
            onChange={(e) => updateFn('indicatorReading', e.target.value)}
            onBlur={() => handleBlur('indicatorReading')}
            className={`mt-1 ${errors.indicatorReading ? 'border-destructive' : ''}`}
          />
          {errors.indicatorReading && (
            <p className="text-xs text-destructive mt-1">{errors.indicatorReading}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`shutheightChecked-${title}`}
          checked={data.shutheightChecked}
          onCheckedChange={(checked: boolean) => updateFn('shutheightChecked', checked)}
        />
        <Label htmlFor={`shutheightChecked-${title}`} className="cursor-pointer text-xs">
          {t('form.slide.shutheightChecked')}
        </Label>
      </div>
    </div>
  );
}
