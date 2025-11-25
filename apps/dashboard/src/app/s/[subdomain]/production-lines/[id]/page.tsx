import { getTranslations } from 'next-intl/server';
import { ProductionLineDetail } from './components/ProductionLineDetail';
import { getProductionLineById } from '@/data/services/production-lines.api';
import { getCurrentUser } from '@/data/services/auth.api';
import { notFound, redirect } from 'next/navigation';
import { NoPermission } from '@/components/no-permission/NoPermission';
import { hasPermissionForResource } from '@/lib/permissions';

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

  // Check if user has readProductionLines permission for this branch
  const canReadProductionLine = hasPermissionForResource(
    user,
    productionLine,
    'readProductionLines',
  );

  // If user doesn't have permission to read production lines, show no permission message
  if (!canReadProductionLine) {
    return <NoPermission />;
  }

  // Check if user has readMachines permission for the production line's branch
  const canViewMachineDetails = hasPermissionForResource(user, productionLine, 'readMachines');

  // Check if user has updateProductionLines permission
  const canEditProductionLine = hasPermissionForResource(
    user,
    productionLine,
    'updateProductionLines',
  );

  // Check if user has deleteProductionLines permission
  const canDeleteProductionLine = hasPermissionForResource(
    user,
    productionLine,
    'deleteProductionLines',
  );

  return (
    <ProductionLineDetail
      productionLine={productionLine}
      initialTab={tab}
      canViewMachineDetails={canViewMachineDetails}
      canEditProductionLine={canEditProductionLine}
      canDeleteProductionLine={canDeleteProductionLine}
    />
  );
}
