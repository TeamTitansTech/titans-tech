import { getTranslations } from 'next-intl/server';
import { ProductionLineDetail } from './components/ProductionLineDetail';
import { getProductionLineById } from '@/data/services/production-lines.api';
import { getCurrentUser } from '@/data/services/auth.api';
import { notFound, redirect } from 'next/navigation';
import { NoPermission } from '@/components/no-permission/NoPermission';
import { hasPermissionInBranch } from '@titans-tech/shared/types';

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

  // Get current user for permission checking
  const userResponse = await getCurrentUser();
  if (userResponse.errors || !userResponse.data) {
    redirect('/');
  }

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

  const user = userResponse.data;
  const productionLine = response.data;

  const { branchId } = productionLine;
  const canReadProductionLine =
    user && hasPermissionInBranch(user, branchId, 'readProductionLines');

  if (!canReadProductionLine) {
    return <NoPermission />;
  }

  const canViewMachineDetails = hasPermissionInBranch(user, branchId, 'readMachines');
  const canDeleteProductionLine = hasPermissionInBranch(user, branchId, 'deleteProductionLines');

  return (
    <ProductionLineDetail
      productionLine={productionLine}
      initialTab={tab}
      canViewMachineDetails={canViewMachineDetails}
      canDeleteProductionLine={canDeleteProductionLine}
    />
  );
}
