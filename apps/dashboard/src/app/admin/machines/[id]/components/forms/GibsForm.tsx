'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type GibsData, type GibsFormProps } from '@/data/types/services.types';
import Image from 'next/image';

export function GibsForm({ data, updateFn, errors, handleBlur, title }: GibsFormProps) {
  const t = useTranslations('inspections');

  const isOuterBefore =
    title.toLowerCase().includes('outer') && title.toLowerCase().includes('before');
  const isOuterAfter =
    title.toLowerCase().includes('outer') && title.toLowerCase().includes('after');

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{t('form.gibs.frontToBackTitle')}</h4>

        <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_280px_1fr] gap-2 sm:gap-6 items-start sm:items-center border-b pb-6">
          <div className="flex flex-col gap-3 sm:gap-8">
            {['point2', 'point1', 'point4', 'point3'].map((field) => (
              <div key={field}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-2">
                  <Label
                    htmlFor={`${field}-${title}`}
                    className="text-xs sm:text-base font-semibold text-right sm:order-2"
                  >
                    {field.replace('point', '')}
                  </Label>
                  <Input
                    id={`${field}-${title}`}
                    type="number"
                    step="0.0001"
                    min="0"
                    max="999999.9999"
                    value={data[field as keyof GibsData]}
                    onChange={(e) => updateFn(field as keyof GibsData, Number(e.target.value))}
                    onBlur={() => handleBlur(field as keyof GibsData)}
                    className={`text-xs sm:text-sm h-8 w-16 sm:w-24 sm:order-1 ${errors[field] ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div className="bg-muted/30 rounded border p-2 max-w-[140px] sm:max-w-[280px] mx-auto">
            <Image
              src="/assets/gibs/front-to-back.png"
              alt="Front to Back"
              width={250}
              height={220}
              className="w-full h-auto"
              unoptimized
            />
          </div>

          <div className="flex flex-col gap-3 sm:gap-8">
            {['point6', 'point5', 'point8', 'point7'].map((field) => (
              <div key={field}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <Label
                    htmlFor={`${field}-${title}`}
                    className="text-xs sm:text-base font-semibold text-left"
                  >
                    {field.replace('point', '')}
                  </Label>
                  <Input
                    id={`${field}-${title}`}
                    type="number"
                    step="0.0001"
                    min="0"
                    max="999999.9999"
                    value={data[field as keyof GibsData]}
                    onChange={(e) => updateFn(field as keyof GibsData, Number(e.target.value))}
                    onBlur={() => handleBlur(field as keyof GibsData)}
                    className={`text-xs sm:text-sm h-8 w-16 sm:w-24 ${errors[field] ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_280px_1fr] gap-2 sm:gap-6 items-start sm:items-center">
          <div className="flex flex-col gap-3 sm:gap-8">
            {['point13', 'point9', 'point15', 'point11'].map((field) => (
              <div key={field}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-2">
                  <Label
                    htmlFor={`${field}-${title}`}
                    className="text-xs sm:text-base font-semibold text-right sm:order-2"
                  >
                    {field.replace('point', '')}
                  </Label>
                  <Input
                    id={`${field}-${title}`}
                    type="number"
                    step="0.0001"
                    min="0"
                    max="999999.9999"
                    value={data[field as keyof GibsData]}
                    onChange={(e) => updateFn(field as keyof GibsData, Number(e.target.value))}
                    onBlur={() => handleBlur(field as keyof GibsData)}
                    className={`text-xs sm:text-sm h-8 w-16 sm:w-24 sm:order-1 ${errors[field] ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div className="bg-muted/30 rounded border p-2 max-w-[140px] sm:max-w-[280px] mx-auto">
            <Image
              src="/assets/gibs/left-to-right.png"
              alt="Left to Right"
              width={250}
              height={220}
              className="w-full h-auto"
              unoptimized
            />
          </div>

          <div className="flex flex-col gap-3 sm:gap-8">
            {['point14', 'point10', 'point16', 'point12'].map((field) => (
              <div key={field}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <Label
                    htmlFor={`${field}-${title}`}
                    className="text-xs sm:text-base font-semibold text-left"
                  >
                    {field.replace('point', '')}
                  </Label>
                  <Input
                    id={`${field}-${title}`}
                    type="number"
                    step="0.0001"
                    min="0"
                    max="999999.9999"
                    value={data[field as keyof GibsData]}
                    onChange={(e) => updateFn(field as keyof GibsData, Number(e.target.value))}
                    onBlur={() => handleBlur(field as keyof GibsData)}
                    className={`text-xs sm:text-sm h-8 w-16 sm:w-24 ${errors[field] ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>
        </div>

        {isOuterBefore && (
          <div className="bg-muted/30 rounded border p-2 max-w-[200px] sm:max-w-[280px] mx-auto sm:mx-0">
            <Image
              src="/assets/gibs/before-tool-instalation.png"
              alt="Outer Slide Before"
              width={250}
              height={220}
              className="w-full h-auto"
              unoptimized
            />
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              Before Tool Installation
            </p>
          </div>
        )}
        {isOuterAfter && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-muted/30 rounded border p-2 max-w-[200px] sm:max-w-[280px] mx-auto sm:mx-0">
              <Image
                src="/assets/gibs/after-tool-instalation.png"
                alt="Outer Slide After"
                width={250}
                height={220}
                className="w-full h-auto"
                unoptimized
              />
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                After Tool Installation
              </p>
            </div>
            <div className="bg-muted/30 rounded border p-2 max-w-[200px] sm:max-w-[280px] mx-auto sm:mx-0">
              <Image
                src="/assets/gibs/top.png"
                alt="Top View"
                width={250}
                height={220}
                className="w-full h-auto"
                unoptimized
              />
              <p className="text-[10px] text-muted-foreground text-center mt-1">Top View</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.gibs.directionalTitle')}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor={`leftTop-${title}`} className="text-xs">
              {t('form.gibs.leftTop')}
            </Label>
            <Input
              id={`leftTop-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.leftTop || ''}
              onChange={(e) =>
                updateFn('leftTop', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('leftTop')}
              className={`mt-1 ${errors.leftTop ? 'border-destructive' : ''}`}
            />
            {errors.leftTop && <p className="text-xs text-destructive mt-1">{errors.leftTop}</p>}
          </div>

          <div>
            <Label htmlFor={`leftBottom-${title}`} className="text-xs">
              {t('form.gibs.leftBottom')}
            </Label>
            <Input
              id={`leftBottom-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.leftBottom || ''}
              onChange={(e) =>
                updateFn('leftBottom', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('leftBottom')}
              className={`mt-1 ${errors.leftBottom ? 'border-destructive' : ''}`}
            />
            {errors.leftBottom && (
              <p className="text-xs text-destructive mt-1">{errors.leftBottom}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`rightTop-${title}`} className="text-xs">
              {t('form.gibs.rightTop')}
            </Label>
            <Input
              id={`rightTop-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.rightTop || ''}
              onChange={(e) =>
                updateFn('rightTop', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('rightTop')}
              className={`mt-1 ${errors.rightTop ? 'border-destructive' : ''}`}
            />
            {errors.rightTop && <p className="text-xs text-destructive mt-1">{errors.rightTop}</p>}
          </div>

          <div>
            <Label htmlFor={`rightBottom-${title}`} className="text-xs">
              {t('form.gibs.rightBottom')}
            </Label>
            <Input
              id={`rightBottom-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.rightBottom || ''}
              onChange={(e) =>
                updateFn('rightBottom', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('rightBottom')}
              className={`mt-1 ${errors.rightBottom ? 'border-destructive' : ''}`}
            />
            {errors.rightBottom && (
              <p className="text-xs text-destructive mt-1">{errors.rightBottom}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`frontTop-${title}`} className="text-xs">
              {t('form.gibs.frontTop')}
            </Label>
            <Input
              id={`frontTop-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.frontTop || ''}
              onChange={(e) =>
                updateFn('frontTop', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('frontTop')}
              className={`mt-1 ${errors.frontTop ? 'border-destructive' : ''}`}
            />
            {errors.frontTop && <p className="text-xs text-destructive mt-1">{errors.frontTop}</p>}
          </div>

          <div>
            <Label htmlFor={`frontBottom-${title}`} className="text-xs">
              {t('form.gibs.frontBottom')}
            </Label>
            <Input
              id={`frontBottom-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.frontBottom || ''}
              onChange={(e) =>
                updateFn('frontBottom', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('frontBottom')}
              className={`mt-1 ${errors.frontBottom ? 'border-destructive' : ''}`}
            />
            {errors.frontBottom && (
              <p className="text-xs text-destructive mt-1">{errors.frontBottom}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`backTop-${title}`} className="text-xs">
              {t('form.gibs.backTop')}
            </Label>
            <Input
              id={`backTop-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.backTop || ''}
              onChange={(e) =>
                updateFn('backTop', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('backTop')}
              className={`mt-1 ${errors.backTop ? 'border-destructive' : ''}`}
            />
            {errors.backTop && <p className="text-xs text-destructive mt-1">{errors.backTop}</p>}
          </div>

          <div>
            <Label htmlFor={`backBottom-${title}`} className="text-xs">
              {t('form.gibs.backBottom')}
            </Label>
            <Input
              id={`backBottom-${title}`}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={data.backBottom || ''}
              onChange={(e) =>
                updateFn('backBottom', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('backBottom')}
              className={`mt-1 ${errors.backBottom ? 'border-destructive' : ''}`}
            />
            {errors.backBottom && (
              <p className="text-xs text-destructive mt-1">{errors.backBottom}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
