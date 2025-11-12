'use client';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { SectionStatus, SectionCardProps } from '@/data/types/dashboard.types';

export type { SectionStatus };

const STATUS_COLORS = {
  ok: 'bg-green-500',
  warning: 'bg-yellow-500',
  alert: 'bg-red-500',
  unknown: 'bg-gray-400',
} as const;

export function SectionCard({ title, status, imageUrl, onClick }: SectionCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]',
        'bg-card border-border',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 z-10">
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 border-white shadow-md',
            STATUS_COLORS[status],
          )}
        />
      </div>

      <div className="aspect-[4/3] bg-[#808080] flex items-center justify-center relative px-5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={300}
            height={225}
            className="object-contain max-w-full max-h-full brightness-0 invert"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-xs">No Image</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-secondary">
        <Typography variant="h3" className="text-sm font-medium text-secondary-foreground truncate">
          {title}
        </Typography>
      </div>
    </Card>
  );
}
