'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { BrandedSkeleton } from '@/components/ui/branded-skeleton';

export default function HomeLoading() {
  return (
    <BrandedSkeleton>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Overview Hero Section - 3 stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Production Lines Carousel */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="pt-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, j) => (
                          <Skeleton key={j} className="h-2 w-2 rounded-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next 7 Days + Month Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next 7 Days Timeline */}
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Month Performance */}
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Trends Chart */}
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </BrandedSkeleton>
  );
}
