import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function BlueprintsLoading() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
