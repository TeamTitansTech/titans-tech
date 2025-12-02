import { getTranslations } from 'next-intl/server';
import { ProductionLinesPage } from './components/ProductionLinesPage';
import { getProductionLines } from '@/data/services/production-lines.api';
import { getAllBranchesForSysAdmin } from '@/data/services/company-branches.api';

export default async function ClientProductionLinesPage() {
  const t = await getTranslations('productionLines');
  const [productionLinesResponse, branchesResponse] = await Promise.all([
    getProductionLines(),
    getAllBranchesForSysAdmin(), // This works for all authenticated users, includes machine counts
  ]);

  if (productionLinesResponse.errors) {
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

  const productionLines = productionLinesResponse.data || [];
  const allBranches = branchesResponse.data || [];

  return <ProductionLinesPage productionLines={productionLines} allBranches={allBranches} />;
}
