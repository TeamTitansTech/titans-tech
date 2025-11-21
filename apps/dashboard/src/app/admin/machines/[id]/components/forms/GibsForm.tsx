'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
import { type GibsStageData } from '@/data/types/services.types';
import { MeasurementSection } from './MeasurementSection';

interface StageConfig {
  data?: GibsStageData;
  onUpdate?: (field: keyof GibsStageData, value: number) => void;
  errors?: Record<string, string>;
  handleBlur?: (field: keyof GibsStageData) => void;
}

interface GibsFormProps {
  slideType: 'outer' | 'inner';
  beforeAdjustment?: StageConfig;
  afterAdjustment?: StageConfig;
  afterInstall?: StageConfig;
  beforeToolInstall?: StageConfig;
  afterToolInstall?: StageConfig;
}

export function GibsForm({
  slideType,
  beforeAdjustment,
  afterAdjustment,
  afterInstall,
  beforeToolInstall,
  afterToolInstall,
}: GibsFormProps) {
  const t = useTranslations('inspections');
  const [includePreviousMeasurements, setIncludePreviousMeasurements] = useState(false);
  const [beforeAdjustmentOpen, setBeforeAdjustmentOpen] = useState(false);
  const [afterAdjustmentOpen, setAfterAdjustmentOpen] = useState(false);
  const [afterInstallOpen, setAfterInstallOpen] = useState(false);
  const [includeAdjustmentPrevious, setIncludeAdjustmentPrevious] = useState(false);
  const [adjustmentBeforeOpen, setAdjustmentBeforeOpen] = useState(false);
  const [adjustmentAfterOpen, setAdjustmentAfterOpen] = useState(false);

  if (slideType === 'outer') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-previous-measurements"
            checked={includePreviousMeasurements}
            onCheckedChange={(checked) => setIncludePreviousMeasurements(checked as boolean)}
          />
          <Label
            htmlFor="include-previous-measurements"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('form.gibs.includePreviousMeasurements')}
          </Label>
        </div>

        {includePreviousMeasurements ? (
          <>
            {beforeAdjustment?.data && beforeAdjustment?.onUpdate && (
              <Collapsible open={beforeAdjustmentOpen} onOpenChange={setBeforeAdjustmentOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">{t('form.gibs.beforeAdjustment')}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${beforeAdjustmentOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <MeasurementSection
                      data={beforeAdjustment.data!}
                      updateFn={beforeAdjustment.onUpdate!}
                      handleBlur={beforeAdjustment.handleBlur || (() => {})}
                      errors={beforeAdjustment.errors || {}}
                      diagramType="frontToBack"
                      t={t}
                    />
                    <MeasurementSection
                      data={beforeAdjustment.data!}
                      updateFn={beforeAdjustment.onUpdate!}
                      handleBlur={beforeAdjustment.handleBlur || (() => {})}
                      errors={beforeAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {afterAdjustment?.data && afterAdjustment?.onUpdate && (
              <Collapsible open={afterAdjustmentOpen} onOpenChange={setAfterAdjustmentOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">{t('form.gibs.afterAdjustment')}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${afterAdjustmentOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <MeasurementSection
                      data={afterAdjustment.data!}
                      updateFn={afterAdjustment.onUpdate!}
                      handleBlur={afterAdjustment.handleBlur || (() => {})}
                      errors={afterAdjustment.errors || {}}
                      diagramType="frontToBack"
                      t={t}
                    />
                    <MeasurementSection
                      data={afterAdjustment.data!}
                      updateFn={afterAdjustment.onUpdate!}
                      handleBlur={afterAdjustment.handleBlur || (() => {})}
                      errors={afterAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {afterInstall?.data && afterInstall?.onUpdate && (
              <Collapsible open={afterInstallOpen} onOpenChange={setAfterInstallOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">
                    {t('form.gibs.freeHangingAfterInstall')}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${afterInstallOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <MeasurementSection
                      data={afterInstall.data!}
                      updateFn={afterInstall.onUpdate!}
                      handleBlur={afterInstall.handleBlur || (() => {})}
                      errors={afterInstall.errors || {}}
                      diagramType="topView"
                      t={t}
                    />
                    <MeasurementSection
                      data={afterInstall.data!}
                      updateFn={afterInstall.onUpdate!}
                      handleBlur={afterInstall.handleBlur || (() => {})}
                      errors={afterInstall.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        ) : (
          afterInstall?.data &&
          afterInstall?.onUpdate && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t('form.gibs.freeHangingAfterInstall')}</h4>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <MeasurementSection
                  data={afterInstall.data!}
                  updateFn={afterInstall.onUpdate!}
                  handleBlur={afterInstall.handleBlur || (() => {})}
                  errors={afterInstall.errors || {}}
                  diagramType="topView"
                  t={t}
                />
                <MeasurementSection
                  data={afterInstall.data!}
                  updateFn={afterInstall.onUpdate!}
                  handleBlur={afterInstall.handleBlur || (() => {})}
                  errors={afterInstall.errors || {}}
                  diagramType="leftToRight"
                  t={t}
                />
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="adjustment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adjustment">{t('form.gibs.adjustment')}</TabsTrigger>
          <TabsTrigger value="installation">{t('form.gibs.installation')}</TabsTrigger>
        </TabsList>

        <TabsContent value="adjustment" className="space-y-4 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-adjustment-previous"
              checked={includeAdjustmentPrevious}
              onCheckedChange={(checked) => setIncludeAdjustmentPrevious(checked as boolean)}
            />
            <Label
              htmlFor="include-adjustment-previous"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('form.gibs.includePreviousMeasurements')}
            </Label>
          </div>

          {includeAdjustmentPrevious ? (
            <>
              {beforeAdjustment?.data && beforeAdjustment?.onUpdate && (
                <Collapsible open={adjustmentBeforeOpen} onOpenChange={setAdjustmentBeforeOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <span className="text-sm font-medium">{t('form.gibs.beforeAdjustment')}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${adjustmentBeforeOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <MeasurementSection
                      data={beforeAdjustment.data!}
                      updateFn={beforeAdjustment.onUpdate!}
                      handleBlur={beforeAdjustment.handleBlur || (() => {})}
                      errors={beforeAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </CollapsibleContent>
                </Collapsible>
              )}

              {afterAdjustment?.data && afterAdjustment?.onUpdate && (
                <Collapsible open={adjustmentAfterOpen} onOpenChange={setAdjustmentAfterOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <span className="text-sm font-medium">{t('form.gibs.afterAdjustment')}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${adjustmentAfterOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <MeasurementSection
                      data={afterAdjustment.data!}
                      updateFn={afterAdjustment.onUpdate!}
                      handleBlur={afterAdjustment.handleBlur || (() => {})}
                      errors={afterAdjustment.errors || {}}
                      diagramType="leftToRight"
                      t={t}
                    />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          ) : (
            afterAdjustment?.data &&
            afterAdjustment?.onUpdate && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">{t('form.gibs.afterAdjustment')}</h4>
                <MeasurementSection
                  data={afterAdjustment.data!}
                  updateFn={afterAdjustment.onUpdate!}
                  handleBlur={afterAdjustment.handleBlur || (() => {})}
                  errors={afterAdjustment.errors || {}}
                  diagramType="leftToRight"
                  t={t}
                />
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="installation" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {beforeToolInstall?.data && beforeToolInstall?.onUpdate && (
              <MeasurementSection
                data={beforeToolInstall.data!}
                updateFn={beforeToolInstall.onUpdate!}
                handleBlur={beforeToolInstall.handleBlur || (() => {})}
                errors={beforeToolInstall.errors || {}}
                diagramType="beforeTool"
                t={t}
              />
            )}

            {afterToolInstall?.data && afterToolInstall?.onUpdate && (
              <MeasurementSection
                data={afterToolInstall.data!}
                updateFn={afterToolInstall.onUpdate!}
                handleBlur={afterToolInstall.handleBlur || (() => {})}
                errors={afterToolInstall.errors || {}}
                diagramType="afterTool"
                t={t}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
