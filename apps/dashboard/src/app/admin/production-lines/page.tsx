import { getTranslations } from 'next-intl/server';
import { ProductionLinesPage } from '@/app/s/[subdomain]/production-lines/components/ProductionLinesPage';
import { getProductionLines } from '@/data/services/production-lines.api';

export default async function AdminProductionLinesPage() {
  const t = await getTranslations('productionLines');
  const response = await getProductionLines();

  if (response.errors) {
    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
          <p className="text-muted-foreground mt-1">{t('pageDescription')}</p>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{t('errorLoading')}</p>
        </div>
      </div>
    );
  }

  const productionLines = response.data || [];

  return <ProductionLinesPage productionLines={productionLines} />;
}
