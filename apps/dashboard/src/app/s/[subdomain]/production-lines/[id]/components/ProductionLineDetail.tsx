'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { ArrowLeft, Eye, Settings, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { ConfigTab } from './ConfigTab';
import { ViewTab } from './ViewTab';
import { DeleteProductionLineDialog } from './DeleteProductionLineDialog';
import type { ProductionLine } from '@/data/types/production-lines.types';

interface ProductionLineDetailProps {
  productionLine: ProductionLine;
  initialTab?: string;
  canViewMachineDetails?: boolean;
  canEditProductionLine?: boolean;
  canDeleteProductionLine?: boolean;
}

export function ProductionLineDetail({
  productionLine: initialProductionLine,
  initialTab = 'view',
  canViewMachineDetails = true,
  canEditProductionLine = false,
  canDeleteProductionLine = false,
}: ProductionLineDetailProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [productionLine, setProductionLine] = useState(initialProductionLine);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const t = useTranslations('productionLines');
  const router = useInternalRouter();

  const handleConfigSaved = (updatedLine: ProductionLine) => {
    setProductionLine(updatedLine);
    setActiveTab('view');
    router.refresh();
  };

  return (
    <div className="space-y-6 p-8" data-testid="detail-production-line-page">
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push('/production-lines')}
          className="shrink-0"
          data-testid="detail-back-button"
        >
          <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
        </button>
        <div className="flex-1">
          <Typography variant="h2" data-testid="detail-production-line-name">
            {productionLine.name}
          </Typography>
          <Typography
            variant="muted"
            className="mt-1"
            data-testid="detail-production-line-description"
          >
            {t('pageDescription')}
          </Typography>
        </div>
        {canDeleteProductionLine && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            data-testid="detail-delete-button"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('deleteButton')}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="detail-tabs">
        <TabsList data-testid="detail-tabs-list">
          <TabsTrigger value="view" data-testid="detail-tab-view">
            <Eye className="w-4 h-4 mr-2" />
            {t('tabView')}
          </TabsTrigger>
          {canEditProductionLine && (
            <TabsTrigger value="config" data-testid="detail-tab-config">
              <Settings className="w-4 h-4 mr-2" />
              {t('tabConfig')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view" className="mt-6" data-testid="detail-view-content">
          <ViewTab productionLine={productionLine} canViewMachineDetails={canViewMachineDetails} />
        </TabsContent>

        {canEditProductionLine && (
          <TabsContent value="config" className="mt-6" data-testid="detail-config-content">
            <ConfigTab productionLine={productionLine} onSuccess={handleConfigSaved} />
          </TabsContent>
        )}
      </Tabs>

      <DeleteProductionLineDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        productionLine={productionLine}
      />
    </div>
  );
}
