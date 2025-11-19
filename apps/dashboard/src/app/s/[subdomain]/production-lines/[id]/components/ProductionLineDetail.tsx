'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { ConfigTab } from './ConfigTab';
import { ViewTab } from './ViewTab';
import type { ProductionLine } from '@/data/types/production-lines.types';

interface ProductionLineDetailProps {
  productionLine: ProductionLine;
  initialTab?: string;
}

export function ProductionLineDetail({
  productionLine: initialProductionLine,
  initialTab = 'view',
}: ProductionLineDetailProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [productionLine, setProductionLine] = useState(initialProductionLine);
  const t = useTranslations('productionLines');
  const router = useInternalRouter();

  const handleConfigSaved = (updatedLine: ProductionLine) => {
    // Atualizar o estado local com os dados salvos
    setProductionLine(updatedLine);
    // Após salvar config, trocar para tab view
    setActiveTab('view');
    router.refresh();
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-6">
        <Link href={'/production-lines'} className="shrink-0">
          <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
        </Link>
        <div className="flex-1">
          <Typography variant="h2">{productionLine.name}</Typography>
          <Typography variant="muted" className="mt-1">
            {t('pageDescription')}
          </Typography>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">{t('tabView')}</TabsTrigger>
          <TabsTrigger value="config">{t('tabConfig')}</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          <ViewTab productionLine={productionLine} />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <ConfigTab productionLine={productionLine} onSuccess={handleConfigSaved} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
