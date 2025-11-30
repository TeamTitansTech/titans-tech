import { MachineCardSkeleton } from './components/MachineCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function MachinesLoading() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <MachineCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
