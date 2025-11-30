import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function MachineDetailLoading() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6">
        <Skeleton className="w-5 h-5" />
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[350px_1fr] gap-4 lg:gap-6">
        {/* Image card */}
        <Card className="bg-muted h-full">
          <CardContent className="p-0 h-full">
            <Skeleton className="w-full h-full min-h-[300px]" />
          </CardContent>
        </Card>

        {/* Sections grid */}
        <Card>
          <CardContent className="p-3 lg:pt-6 lg:px-6">
            <div className="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
