'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CheckCircle, AlertTriangle, AlertCircle, HelpCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { SectionStatus } from './SectionStatusBadge';
import { PartsListSelector } from '@/components/parts/PartsListSelector';
import { SubsectionPartsModal } from '@/components/parts/SubsectionPartsModal';
import type { Part, SectionWithTabs } from '@/data/parts/dac-parts';
import type { Subsection } from '@/data/parts/section-subsections';

interface PartsConfigBase {
  title: string;
  description?: string;
  machineName?: string;
  machineSerial?: string;
  sectionName?: string;
  /** Optional diagram image to display in the parts modal */
  diagramImage?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

interface PartsConfigWithParts extends PartsConfigBase {
  parts: Part[];
  tabs?: never;
  subsections?: never;
}

interface PartsConfigWithTabs extends PartsConfigBase {
  parts?: never;
  tabs: SectionWithTabs;
  subsections?: never;
}

interface PartsConfigWithSubsections extends PartsConfigBase {
  parts?: never;
  tabs?: never;
  subsections: Subsection[];
}

type PartsConfig = PartsConfigWithParts | PartsConfigWithTabs | PartsConfigWithSubsections;

interface SectionStatusCardProps {
  /** The section status */
  status: SectionStatus;
  /** Parts list configuration */
  partsConfig: PartsConfig;
  /** Additional class names */
  className?: string;
  /** Always show the parts button, even for OK status */
  alwaysShowPartsButton?: boolean;
}

const statusConfig = {
  ok: {
    icon: CheckCircle,
    titleKey: 'status.ok.title',
    descriptionKey: 'status.ok.description',
    cardClass: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30',
    iconClass: 'text-green-600 dark:text-green-400',
    titleClass: 'text-green-800 dark:text-green-300',
    descriptionClass: 'text-green-600 dark:text-green-400',
    showPartsButton: false,
  },
  warning: {
    icon: AlertTriangle,
    titleKey: 'status.warning.title',
    descriptionKey: 'status.warning.description',
    cardClass: 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950/30',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    titleClass: 'text-yellow-800 dark:text-yellow-300',
    descriptionClass: 'text-yellow-600 dark:text-yellow-400',
    showPartsButton: true,
  },
  alert: {
    icon: AlertCircle,
    titleKey: 'status.critical.title',
    descriptionKey: 'status.critical.description',
    cardClass: 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-800 dark:text-red-300',
    descriptionClass: 'text-red-600 dark:text-red-400',
    showPartsButton: true,
  },
  unknown: {
    icon: HelpCircle,
    titleKey: 'status.unknown.title',
    descriptionKey: 'status.unknown.description',
    cardClass: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30',
    iconClass: 'text-gray-500 dark:text-gray-400',
    titleClass: 'text-gray-700 dark:text-gray-300',
    descriptionClass: 'text-gray-500 dark:text-gray-400',
    showPartsButton: false,
  },
};

/**
 * A card component that displays the section status with a call-to-action
 * to view the parts list for replacement.
 */
export function SectionStatusCard({
  status,
  partsConfig,
  className,
  alwaysShowPartsButton = false,
}: SectionStatusCardProps) {
  const t = useTranslations('sectionStatusCard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const config = statusConfig[status];
  const Icon = config.icon;
  const shouldShowPartsButton = config.showPartsButton || alwaysShowPartsButton;

  return (
    <>
      <Card className={cn('border-2', config.cardClass, className)}>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-full', config.iconClass, 'bg-current/10')}>
              <Icon className={cn('h-6 w-6', config.iconClass)} />
            </div>
            <div className="flex-1">
              <p className={cn('font-semibold text-lg', config.titleClass)}>{t(config.titleKey)}</p>
              <p className={cn('text-sm', config.descriptionClass)}>{t(config.descriptionKey)}</p>
            </div>
            {shouldShowPartsButton && (
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  'gap-2',
                  status === 'ok' &&
                    'border-green-400 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/50',
                  status === 'warning' &&
                    'border-yellow-400 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/50',
                  status === 'alert' &&
                    'border-red-400 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50',
                )}
              >
                <Package className="h-4 w-4" />
                {t('viewParts')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Use SubsectionPartsModal for subsections config */}
      {partsConfig.subsections ? (
        <SubsectionPartsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={partsConfig.title}
          subsections={partsConfig.subsections}
          machineName={partsConfig.machineName}
          machineSerial={partsConfig.machineSerial}
          sectionName={partsConfig.sectionName}
        />
      ) : (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            className={cn(
              'max-h-[85vh] overflow-y-auto',
              partsConfig.diagramImage ? 'w-[90vw] max-w-[1600px]' : 'max-w-4xl',
            )}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {partsConfig.title}
              </DialogTitle>
            </DialogHeader>

            {partsConfig.diagramImage ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Diagram Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Technical Diagram
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Scroll to zoom, drag to pan)
                      </span>
                    </h3>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 relative">
                    <TransformWrapper
                      initialScale={1}
                      minScale={0.5}
                      maxScale={4}
                      centerOnInit
                      wheel={{ step: 0.1 }}
                      doubleClick={{ mode: 'zoomIn' }}
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          {/* Zoom Controls */}
                          <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white dark:bg-gray-800 rounded-md shadow-md p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => zoomIn()}
                              title="Zoom in"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => zoomOut()}
                              title="Zoom out"
                            >
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => resetTransform()}
                              title="Reset"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Zoomable Image */}
                          <TransformComponent
                            wrapperStyle={{
                              width: '100%',
                              height: '600px',
                              cursor: 'grab',
                            }}
                            contentStyle={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Image
                              src={partsConfig.diagramImage!.src}
                              alt={partsConfig.diagramImage!.alt}
                              width={partsConfig.diagramImage!.width || 800}
                              height={partsConfig.diagramImage!.height || 600}
                              className="max-w-full max-h-full object-contain"
                              priority
                              unoptimized
                              draggable={false}
                            />
                          </TransformComponent>
                        </>
                      )}
                    </TransformWrapper>
                  </div>
                </div>

                {/* Parts List */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Parts List
                  </h3>
                  <PartsListSelector {...partsConfig} />
                </div>
              </div>
            ) : (
              <PartsListSelector {...partsConfig} />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
