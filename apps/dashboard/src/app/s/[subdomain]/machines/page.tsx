import { MachinesPageClient } from './components/MachinesPageClient';

interface MachinesPageProps {
  searchParams: Promise<{ branchId?: string }>;
}

export default async function MachinesPage({ searchParams }: MachinesPageProps) {
  const { branchId } = await searchParams;
  return <MachinesPageClient initialBranchFilter={branchId} />;
}
