import { BranchCardSkeleton } from './components/BranchCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyDetailLoading() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <BranchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
