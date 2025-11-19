'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGibsStageCalculation, type GibsStageData } from '@/hooks/useGibsCalculations';
import Image from 'next/image';

interface GibsFormProps {
  data: {
    outerBeforeAdjustment?: GibsStageData;
    outerAfterAdjustment?: GibsStageData;
    outerAfterInstallation?: GibsStageData;
    innerBeforeAdjustment?: GibsStageData;
    innerAfterAdjustment?: GibsStageData;
    innerBeforeInstallation?: GibsStageData;
    innerAfterInstallation?: GibsStageData;
  };
  updateFn: (
    stage: keyof GibsFormProps['data'],
    field: keyof GibsStageData,
    value: number | undefined,
  ) => void;
  errors?: Record<string, string>;
  type?: 'outer' | 'inner';
}

interface StageFormProps {
  title: string;
  data: GibsStageData;
  updateFn: (field: keyof GibsStageData, value: number | undefined) => void;
  calculatedData: GibsStageData;
  showPositions: {
    frontToBack?: boolean;
    leftToRight?: boolean;
    topInputs?: boolean;
    topPositions?: boolean;
  };
  showOutputs: {
    leftTop?: boolean;
    leftBottom?: boolean;
    rightTop?: boolean;
    rightBottom?: boolean;

    frontTop?: boolean;
    frontBottom?: boolean;
    backTop?: boolean;
    backBottom?: boolean;
    usable?: boolean;

    topFront?: boolean;
    topBack?: boolean;
    topRear?: boolean;
    bottomFront?: boolean;
    bottomBack?: boolean;
    left?: boolean;
    right?: boolean;
  };
  showDifferentials?: boolean;
  errors?: Record<string, string>;
}

function StageForm({
  title,
  data,
  updateFn,
  calculatedData,
  showPositions,
  showOutputs,
  showDifferentials,
  errors = {},
}: StageFormProps) {
  const t = useTranslations('inspections');

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-base">{title}</h4>

      {showPositions.frontToBack && (
        <div className="space-y-4">
          <h5 className="font-semibold text-sm">{t('form.gibs.frontToBackTitle')}</h5>

          <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_280px_1fr] gap-2 sm:gap-6 items-start sm:items-center">
            <div className="flex flex-col gap-3 sm:gap-8">
              {['position2', 'position1', 'position4', 'position3'].map((field, idx) => (
                <div key={field}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-2">
                    <Label
                      htmlFor={`${field}-${title}`}
                      className="text-xs sm:text-base font-semibold text-right sm:order-2"
                    >
                      {[2, 1, 4, 3][idx]}
                    </Label>
                    <Input
                      id={`${field}-${title}`}
                      type="number"
                      step="0.0001"
                      min="0"
                      max="999999.9999"
                      value={data[field as keyof GibsStageData] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        updateFn(field as keyof GibsStageData, value);
                      }}
                      className={`text-xs sm:text-sm h-8 w-16 sm:w-24 sm:order-1 ${errors[field] ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors[field] && (
                    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                  )}
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
              {['position6', 'position5', 'position8', 'position7'].map((field, idx) => (
                <div key={field}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <Label
                      htmlFor={`${field}-${title}`}
                      className="text-xs sm:text-base font-semibold text-left"
                    >
                      {[6, 5, 8, 7][idx]}
                    </Label>
                    <Input
                      id={`${field}-${title}`}
                      type="number"
                      step="0.0001"
                      min="0"
                      max="999999.9999"
                      value={data[field as keyof GibsStageData] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        updateFn(field as keyof GibsStageData, value);
                      }}
                      className={`text-xs sm:text-sm h-8 w-16 sm:w-24 ${errors[field] ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors[field] && (
                    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPositions.leftToRight && (
        <div className="space-y-4">
          <h5 className="font-semibold text-sm">{t('form.gibs.leftToRightTitle')}</h5>

          <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_280px_1fr] gap-2 sm:gap-6 items-start sm:items-center">
            <div className="flex flex-col gap-3 sm:gap-8">
              {['position13', 'position9', 'position15', 'position11'].map((field, idx) => (
                <div key={field}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-2">
                    <Label
                      htmlFor={`${field}-${title}`}
                      className="text-xs sm:text-base font-semibold text-right sm:order-2"
                    >
                      {[13, 9, 15, 11][idx]}
                    </Label>
                    <Input
                      id={`${field}-${title}`}
                      type="number"
                      step="0.0001"
                      min="0"
                      max="999999.9999"
                      value={data[field as keyof GibsStageData] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        updateFn(field as keyof GibsStageData, value);
                      }}
                      className={`text-xs sm:text-sm h-8 w-16 sm:w-24 sm:order-1 ${errors[field] ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors[field] && (
                    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                  )}
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
              {['position14', 'position10', 'position16', 'position12'].map((field, idx) => (
                <div key={field}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <Label
                      htmlFor={`${field}-${title}`}
                      className="text-xs sm:text-base font-semibold text-left"
                    >
                      {[14, 10, 16, 12][idx]}
                    </Label>
                    <Input
                      id={`${field}-${title}`}
                      type="number"
                      step="0.0001"
                      min="0"
                      max="999999.9999"
                      value={data[field as keyof GibsStageData] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        updateFn(field as keyof GibsStageData, value);
                      }}
                      className={`text-xs sm:text-sm h-8 w-16 sm:w-24 ${errors[field] ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors[field] && (
                    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPositions.topPositions && (
        <div className="space-y-4">
          <h5 className="font-semibold text-sm">{t('form.gibs.topMeasurementsTitle')}</h5>

          <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_280px_1fr] gap-2 sm:gap-6 items-start sm:items-center">
            <div className="flex flex-col gap-3 sm:gap-8">
              {['position2', 'position1'].map((field, idx) => (
                <div key={field}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-2">
                    <Label
                      htmlFor={`${field}-${title}`}
                      className="text-xs sm:text-base font-semibold text-right sm:order-2"
                    >
                      {[2, 1][idx]}
                    </Label>
                    <Input
                      id={`${field}-${title}`}
                      type="number"
                      step="0.0001"
                      min="0"
                      max="999999.9999"
                      value={data[field as keyof GibsStageData] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        updateFn(field as keyof GibsStageData, value);
                      }}
                      className={`text-xs sm:text-sm h-8 w-16 sm:w-24 sm:order-1 ${errors[field] ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors[field] && (
                    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-muted/30 rounded border p-2 max-w-[140px] sm:max-w-[280px] mx-auto">
              <Image
                src="/assets/gibs/top.png"
                alt="Top Measurements"
                width={250}
                height={220}
                className="w-full h-auto"
                unoptimized
              />
            </div>

            <div className="flex flex-col gap-3 sm:gap-8">
              {['position6', 'position5'].map((field, idx) => (
                <div key={field}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <Label
                      htmlFor={`${field}-${title}`}
                      className="text-xs sm:text-base font-semibold text-left"
                    >
                      {[6, 5][idx]}
                    </Label>
                    <Input
                      id={`${field}-${title}`}
                      type="number"
                      step="0.0001"
                      min="0"
                      max="999999.9999"
                      value={data[field as keyof GibsStageData] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        updateFn(field as keyof GibsStageData, value);
                      }}
                      className={`text-xs sm:text-sm h-8 w-16 sm:w-24 ${errors[field] ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors[field] && (
                    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPositions.topInputs && (
        <div className="space-y-4">
          <h5 className="font-semibold text-sm">{t('form.gibs.directTopMeasurementsTitle')}</h5>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <Label htmlFor={`topFront-${title}`} className="text-sm">
                {t('form.gibs.topFront')}
              </Label>
              <Input
                id={`topFront-${title}`}
                type="number"
                step="0.0001"
                min="0"
                max="999999.9999"
                value={data.topFront ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  updateFn('topFront', value);
                }}
                className={`mt-1 ${errors.topFront ? 'border-destructive' : ''}`}
              />
              {errors.topFront && (
                <p className="text-xs text-destructive mt-1">{errors.topFront}</p>
              )}
            </div>
            <div>
              <Label htmlFor={`topBack-${title}`} className="text-sm">
                {t('form.gibs.topBack')}
              </Label>
              <Input
                id={`topBack-${title}`}
                type="number"
                step="0.0001"
                min="0"
                max="999999.9999"
                value={data.topBack ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  updateFn('topBack', value);
                }}
                className={`mt-1 ${errors.topBack ? 'border-destructive' : ''}`}
              />
              {errors.topBack && <p className="text-xs text-destructive mt-1">{errors.topBack}</p>}
            </div>
          </div>
        </div>
      )}

      {Object.values(showOutputs).some((v) => v) && (
        <div className="space-y-4">
          <h5 className="font-semibold text-sm">{t('form.gibs.calculatedResultsTitle')}</h5>

          {(showOutputs.leftTop ||
            showOutputs.leftBottom ||
            showOutputs.rightTop ||
            showOutputs.rightBottom) && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 max-w-md">
                <div></div>
                <div className="text-center text-xs font-semibold">{t('form.gibs.left')}</div>
                <div className="text-center text-xs font-semibold">{t('form.gibs.right')}</div>

                {(showOutputs.leftTop || showOutputs.rightTop) && (
                  <>
                    <div className="text-xs font-semibold">{t('form.gibs.top')}</div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedLeftTop?.toFixed(4) ?? '-'}
                    </div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedRightTop?.toFixed(4) ?? '-'}
                    </div>
                  </>
                )}

                {(showOutputs.leftBottom || showOutputs.rightBottom) && (
                  <>
                    <div className="text-xs font-semibold">{t('form.gibs.bottom')}</div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedLeftBottom?.toFixed(4) ?? '-'}
                    </div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedRightBottom?.toFixed(4) ?? '-'}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {(showOutputs.frontTop ||
            showOutputs.frontBottom ||
            showOutputs.backTop ||
            showOutputs.backBottom) && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 max-w-md">
                <div></div>
                <div className="text-center text-xs font-semibold">{t('form.gibs.top')}</div>
                <div className="text-center text-xs font-semibold">{t('form.gibs.bottom')}</div>

                {(showOutputs.frontTop || showOutputs.frontBottom) && (
                  <>
                    <div className="text-xs font-semibold">{t('form.gibs.front')}</div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedFrontTop?.toFixed(4) ?? '-'}
                    </div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedFrontBottom?.toFixed(4) ?? '-'}
                    </div>
                  </>
                )}

                {(showOutputs.backTop || showOutputs.backBottom) && (
                  <>
                    <div className="text-xs font-semibold">{t('form.gibs.back')}</div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedBackTop?.toFixed(4) ?? '-'}
                    </div>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono text-center">
                      {calculatedData.calculatedBackBottom?.toFixed(4) ?? '-'}
                    </div>
                  </>
                )}

                {showOutputs.usable && (
                  <>
                    <div className="text-xs font-semibold">{t('form.gibs.usable')}</div>
                    <div className="col-span-2 px-3 py-2 bg-blue-100 border border-blue-300 rounded-md text-sm font-mono text-center font-semibold">
                      {calculatedData.calculatedUsable?.toFixed(4) ?? '-'}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showDifferentials && (
        <div className="space-y-4">
          <h5 className="font-semibold text-sm">{t('form.gibs.differentialsTitle')}</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {calculatedData.differentialTopFront !== undefined && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Δ {t('form.gibs.topFront')}
                </Label>
                <div
                  className={`mt-1 px-3 py-2 rounded-md text-sm font-mono ${
                    calculatedData.differentialTopFront > 0
                      ? 'bg-green-100 text-green-800'
                      : calculatedData.differentialTopFront < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-muted'
                  }`}
                >
                  {calculatedData.differentialTopFront > 0 ? '+' : ''}
                  {calculatedData.differentialTopFront.toFixed(4)}
                </div>
              </div>
            )}
            {calculatedData.differentialTopBack !== undefined && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Δ {t('form.gibs.topBack')}
                </Label>
                <div
                  className={`mt-1 px-3 py-2 rounded-md text-sm font-mono ${
                    calculatedData.differentialTopBack > 0
                      ? 'bg-green-100 text-green-800'
                      : calculatedData.differentialTopBack < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-muted'
                  }`}
                >
                  {calculatedData.differentialTopBack > 0 ? '+' : ''}
                  {calculatedData.differentialTopBack.toFixed(4)}
                </div>
              </div>
            )}
            {calculatedData.differentialTopRear !== undefined && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Δ {t('form.gibs.topRear')}
                </Label>
                <div
                  className={`mt-1 px-3 py-2 rounded-md text-sm font-mono ${
                    calculatedData.differentialTopRear > 0
                      ? 'bg-green-100 text-green-800'
                      : calculatedData.differentialTopRear < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-muted'
                  }`}
                >
                  {calculatedData.differentialTopRear > 0 ? '+' : ''}
                  {calculatedData.differentialTopRear.toFixed(4)}
                </div>
              </div>
            )}
            {calculatedData.differentialBottom !== undefined && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Δ {t('form.gibs.bottom')}
                </Label>
                <div
                  className={`mt-1 px-3 py-2 rounded-md text-sm font-mono ${
                    calculatedData.differentialBottom > 0
                      ? 'bg-green-100 text-green-800'
                      : calculatedData.differentialBottom < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-muted'
                  }`}
                >
                  {calculatedData.differentialBottom > 0 ? '+' : ''}
                  {calculatedData.differentialBottom.toFixed(4)}
                </div>
              </div>
            )}
            {calculatedData.differentialLeft !== undefined && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Δ {t('form.gibs.left')}
                </Label>
                <div
                  className={`mt-1 px-3 py-2 rounded-md text-sm font-mono ${
                    calculatedData.differentialLeft > 0
                      ? 'bg-green-100 text-green-800'
                      : calculatedData.differentialLeft < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-muted'
                  }`}
                >
                  {calculatedData.differentialLeft > 0 ? '+' : ''}
                  {calculatedData.differentialLeft.toFixed(4)}
                </div>
              </div>
            )}
            {calculatedData.differentialRight !== undefined && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Δ {t('form.gibs.right')}
                </Label>
                <div
                  className={`mt-1 px-3 py-2 rounded-md text-sm font-mono ${
                    calculatedData.differentialRight > 0
                      ? 'bg-green-100 text-green-800'
                      : calculatedData.differentialRight < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-muted'
                  }`}
                >
                  {calculatedData.differentialRight > 0 ? '+' : ''}
                  {calculatedData.differentialRight.toFixed(4)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GibsForm({ data, updateFn, errors = {}, type = 'outer' }: GibsFormProps) {
  const t = useTranslations('inspections');

  const outerBeforeCalc = useGibsStageCalculation(
    'outerBeforeAdjustment',
    data.outerBeforeAdjustment || {},
  );

  const outerAfterCalc = useGibsStageCalculation(
    'outerAfterAdjustment',
    data.outerAfterAdjustment || {},
    data.outerBeforeAdjustment,
  );

  const outerAfterInstallCalc = useGibsStageCalculation(
    'outerAfterInstallation',
    data.outerAfterInstallation || {},
    data.outerBeforeAdjustment,
  );

  const innerBeforeCalc = useGibsStageCalculation(
    'innerBeforeAdjustment',
    data.innerBeforeAdjustment || {},
  );

  const innerAfterCalc = useGibsStageCalculation(
    'innerAfterAdjustment',
    data.innerAfterAdjustment || {},
    data.innerBeforeAdjustment,
  );

  const innerBeforeInstallCalc = useGibsStageCalculation(
    'innerBeforeInstallation',
    data.innerBeforeInstallation || {},
  );

  const innerAfterInstallCalc = useGibsStageCalculation(
    'innerAfterInstallation',
    data.innerAfterInstallation || {},
    data.innerBeforeInstallation,
  );

  if (type === 'outer') {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="outer-before" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outer-before">{t('form.gibs.stages.outerBefore')}</TabsTrigger>
            <TabsTrigger value="outer-after">{t('form.gibs.stages.outerAfter')}</TabsTrigger>
          </TabsList>

          <TabsContent value="outer-before" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('form.gibs.stages.stage1Title')}</CardTitle>
                <CardDescription>{t('form.gibs.stages.stage1Description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <StageForm
                  title="Outer Before Adjustment"
                  data={data.outerBeforeAdjustment || {}}
                  updateFn={(field, value) => updateFn('outerBeforeAdjustment', field, value)}
                  calculatedData={outerBeforeCalc}
                  showPositions={{ frontToBack: true, leftToRight: true }}
                  showOutputs={{
                    topFront: true,
                    topBack: true,
                    bottomFront: true,
                    bottomBack: true,
                    usable: true,
                  }}
                  errors={errors}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('form.gibs.stages.stage2Title')}</CardTitle>
                <CardDescription>{t('form.gibs.stages.stage2Description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <StageForm
                  title="Outer After Adjustment"
                  data={data.outerAfterAdjustment || {}}
                  updateFn={(field, value) => updateFn('outerAfterAdjustment', field, value)}
                  calculatedData={outerAfterCalc}
                  showPositions={{ frontToBack: true, leftToRight: true }}
                  showOutputs={{
                    topFront: true,
                    topBack: true,
                    bottomFront: true,
                    bottomBack: true,
                    usable: true,
                  }}
                  showDifferentials={true}
                  errors={errors}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outer-after" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('form.gibs.stages.stage3Title')}</CardTitle>
                <CardDescription>{t('form.gibs.stages.stage3Description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <StageForm
                  title="Outer After Installation"
                  data={data.outerAfterInstallation || {}}
                  updateFn={(field, value) => updateFn('outerAfterInstallation', field, value)}
                  calculatedData={outerAfterInstallCalc}
                  showPositions={{ leftToRight: true, topPositions: true }}
                  showOutputs={{
                    topFront: true,
                    topBack: true,
                    bottomFront: true,
                    bottomBack: true,
                  }}
                  showDifferentials={true}
                  errors={errors}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="inner-before" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inner-before">{t('form.gibs.stages.innerBefore')}</TabsTrigger>
          <TabsTrigger value="inner-after">{t('form.gibs.stages.innerAfter')}</TabsTrigger>
        </TabsList>

        <TabsContent value="inner-before" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.gibs.stages.innerStage1Title')}</CardTitle>
              <CardDescription>{t('form.gibs.stages.innerStage1Description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <StageForm
                title="Inner Before Adjustment"
                data={data.innerBeforeAdjustment || {}}
                updateFn={(field, value) => updateFn('innerBeforeAdjustment', field, value)}
                calculatedData={innerBeforeCalc}
                showPositions={{ leftToRight: true }}
                showOutputs={{ topFront: true, topBack: true, bottomFront: true, bottomBack: true }}
                errors={errors}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('form.gibs.stages.innerStage2Title')}</CardTitle>
              <CardDescription>{t('form.gibs.stages.innerStage2Description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <StageForm
                title="Inner After Adjustment"
                data={data.innerAfterAdjustment || {}}
                updateFn={(field, value) => updateFn('innerAfterAdjustment', field, value)}
                calculatedData={innerAfterCalc}
                showPositions={{ leftToRight: true }}
                showOutputs={{ topFront: true, topBack: true, bottomFront: true, bottomBack: true }}
                showDifferentials={true}
                errors={errors}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('form.gibs.stages.innerStage3Title')}</CardTitle>
              <CardDescription>{t('form.gibs.stages.innerStage3Description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <StageForm
                title="Inner Before Installation"
                data={data.innerBeforeInstallation || {}}
                updateFn={(field, value) => updateFn('innerBeforeInstallation', field, value)}
                calculatedData={innerBeforeInstallCalc}
                showPositions={{ frontToBack: true }}
                showOutputs={{
                  left: true,
                  right: true,
                  topFront: true,
                  topBack: true,
                  bottomFront: true,
                  bottomBack: true,
                }}
                errors={errors}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inner-after" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.gibs.stages.innerStage4Title')}</CardTitle>
              <CardDescription>{t('form.gibs.stages.innerStage4Description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <StageForm
                title="Inner After Installation"
                data={data.innerAfterInstallation || {}}
                updateFn={(field, value) => updateFn('innerAfterInstallation', field, value)}
                calculatedData={innerAfterInstallCalc}
                showPositions={{ leftToRight: true }}
                showOutputs={{ topFront: true, topRear: true, bottomFront: true, bottomBack: true }}
                showDifferentials={true}
                errors={errors}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
