import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BranchCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div>
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
