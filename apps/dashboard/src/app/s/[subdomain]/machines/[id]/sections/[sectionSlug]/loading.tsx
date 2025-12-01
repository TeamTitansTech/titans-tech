'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BrandedSkeleton } from '@/components/ui/branded-skeleton';

export default function SectionDetailLoading() {
  return (
    <BrandedSkeleton>
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="w-5 h-5 shrink-0" />
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Section Content - Chart Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>

        {/* Data Table Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table header */}
              <div className="flex gap-4 pb-2 border-b">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              {/* Table rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 py-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BrandedSkeleton>
  );
}
