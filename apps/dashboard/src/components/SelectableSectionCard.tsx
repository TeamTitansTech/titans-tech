'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Check } from 'lucide-react';

export type SectionStatus = 'ok' | 'warning' | 'alert' | 'unknown';

interface SelectableSectionCardProps {
  title: string;
  status: SectionStatus;
  imageUrl?: string;
  subtitle?: string;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_COLORS = {
  ok: 'bg-green-500',
  warning: 'bg-yellow-500',
  alert: 'bg-red-500',
  unknown: 'bg-muted-foreground',
} as const;

export function SelectableSectionCard({
  title,
  status,
  imageUrl,
  subtitle,
  isSelected,
  onClick,
}: SelectableSectionCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all cursor-pointer',
        'hover:shadow-lg hover:scale-[1.02]',
        isSelected
          ? 'ring-2 ring-orange-500 border-orange-500'
          : 'border-border hover:border-orange-300',
      )}
      onClick={onClick}
    >
      {/* Status Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 border-white shadow-md',
            STATUS_COLORS[status],
          )}
        />
      </div>

      {/* Selection Checkmark */}
      {isSelected && (
        <div className="absolute top-3 left-3 z-10">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Image Area */}
      <div className="aspect-[3/2] bg-gray-400 dark:bg-slate-600 flex items-center justify-center relative px-3 py-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={200}
            height={133}
            className="object-contain w-full h-auto brightness-0 invert"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Title and Subtitle Area */}
      <CardContent className="p-2 bg-background">
        <Typography variant="h3" className="text-xs font-medium truncate">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="muted" className="text-[10px] mt-0.5">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
