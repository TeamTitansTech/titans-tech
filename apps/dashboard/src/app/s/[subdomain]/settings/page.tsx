import { getCurrentUser } from '@/data/services/auth.api';
import { getAllBranches } from '@/data/services/company-branches.api';
import { CompanySettings } from './components/CompanySettings';

export default async function CompanySettingsPage() {
  const userResponse = await getCurrentUser();
  const user = userResponse.data;

  // Fetch branches if user has a company
  let branches = null;
  if (user?.companyId) {
    const branchesResponse = await getAllBranches({ companyId: user.companyId });
    branches = branchesResponse.data || [];
  }

  return <CompanySettings initialBranches={branches} />;
}
