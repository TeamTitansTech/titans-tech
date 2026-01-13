'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Copy, List, Image as ImageIcon } from 'lucide-react';
import type { Subsection } from '@/data/parts/section-subsections';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface DefaultSubsectionCardProps {
  subsection: Subsection;
  onCopyToCustom: () => void;
}

export function DefaultSubsectionCard({ subsection, onCopyToCustom }: DefaultSubsectionCardProps) {
  const t = useTranslations('machines.partsConfig');
  const tParts = useTranslations('parts');
  const partsCount = subsection.parts.length;

  // Try to get translated name, fall back to nameKey
  const displayName = subsection.nameKey.startsWith('subsections.')
    ? tParts(subsection.nameKey)
    : subsection.nameKey;

  return (
    <Card className="relative border-dashed opacity-80 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base truncate">{displayName}</CardTitle>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {t('default')}
              </span>
            </div>
            {subsection.figureReference && (
              <Typography variant="small" className="text-muted-foreground">
                {subsection.figureReference}
              </Typography>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {subsection.description && (
          <Typography variant="small" className="text-muted-foreground line-clamp-2 mb-3">
            {subsection.description}
          </Typography>
        )}

        <div className="flex items-center gap-4 mb-3">
          {subsection.diagramImage ? (
            <div className="relative w-16 h-16 rounded border bg-muted overflow-hidden flex-shrink-0">
              <Image
                src={subsection.diagramImage}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center flex-shrink-0">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <List className="h-4 w-4" />
              <span>
                {partsCount} {partsCount === 1 ? 'part' : 'parts'}
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={onCopyToCustom}>
          <Copy className="h-4 w-4 mr-2" />
          {t('copyToCustomize')}
        </Button>
      </CardContent>
    </Card>
  );
}
