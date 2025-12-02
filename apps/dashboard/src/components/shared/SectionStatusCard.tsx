'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, AlertTriangle, AlertCircle, HelpCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { SectionStatus } from './SectionStatusBadge';
import { PartsListSelector } from '@/components/parts/PartsListSelector';
import type { Part, SectionWithTabs } from '@/data/parts/dac-parts';

interface PartsConfigBase {
  title: string;
  description?: string;
  machineName?: string;
  machineSerial?: string;
  sectionName?: string;
}

interface PartsConfigWithParts extends PartsConfigBase {
  parts: Part[];
  tabs?: never;
}

interface PartsConfigWithTabs extends PartsConfigBase {
  parts?: never;
  tabs: SectionWithTabs;
}

type PartsConfig = PartsConfigWithParts | PartsConfigWithTabs;

interface SectionStatusCardProps {
  /** The section status */
  status: SectionStatus;
  /** Parts list configuration */
  partsConfig: PartsConfig;
  /** Additional class names */
  className?: string;
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
export function SectionStatusCard({ status, partsConfig, className }: SectionStatusCardProps) {
  const t = useTranslations('sectionStatusCard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const config = statusConfig[status];
  const Icon = config.icon;

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
            {config.showPartsButton && (
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  'gap-2',
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {partsConfig.title}
            </DialogTitle>
          </DialogHeader>
          <PartsListSelector {...partsConfig} />
        </DialogContent>
      </Dialog>
    </>
  );
}
