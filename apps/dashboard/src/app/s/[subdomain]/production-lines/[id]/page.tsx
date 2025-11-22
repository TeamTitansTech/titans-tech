import { getTranslations } from 'next-intl/server';
import { ProductionLineDetail } from './components/ProductionLineDetail';
import { getProductionLineById } from '@/data/services/production-lines.api';
import { notFound } from 'next/navigation';

interface ProductionLineDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProductionLineDetailPage({
  params,
  searchParams,
}: ProductionLineDetailPageProps) {
  const { id } = await params;
  const { tab = 'view' } = await searchParams;
  const t = await getTranslations('productionLines');

  const response = await getProductionLineById(id);

  if (response.errors) {
    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{t('errorLoading')}</p>
        </div>
      </div>
    );
  }

  if (!response.data) {
    notFound();
  }

  return <ProductionLineDetail productionLine={response.data} initialTab={tab} />;
}
