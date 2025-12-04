'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { Badge } from '@/components/ui/badge';
import { Boxes, Edit, Copy, Trash2, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ThresholdEditModal } from './ThresholdEditModal';

interface BlueprintCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  description: string;
  machineCount: number;
  fieldCount: number;
  sections: string[];
  onEdit?: () => void;
}

export function BlueprintCard({
  id,
  name,
  imageUrl,
  description,
  machineCount,
  fieldCount,
  sections,
  onEdit,
}: BlueprintCardProps) {
  const t = useTranslations('models');
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  // Check if blueprint has any alert sections
  const hasAlertSections = sections.some((section) =>
    ['BEARING_CLEARANCE', 'CLUTCH', 'SLIDE', 'GIBS', 'TRAMMING', 'PISTONS'].includes(section),
  );

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {imageUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                <Image
                  src={imageUrl}
                  alt={name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Boxes className="w-5 h-5 text-accent" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <ConditionalTooltip content={name}>
                <CardTitle className="text-lg truncate">{name}</CardTitle>
              </ConditionalTooltip>
              <ConditionalTooltip
                content={description}
                className="text-sm text-muted-foreground line-clamp-2"
              >
                {description}
              </ConditionalTooltip>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Badge variant="secondary">
              {machineCount} {machineCount === 1 ? t('machine') : t('machines')}
            </Badge>
            <Badge variant="secondary">
              {fieldCount} {fieldCount === 1 ? t('field') : t('fields')}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {hasAlertSections && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setIsThresholdModalOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('thresholds')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {hasAlertSections && (
        <ThresholdEditModal
          isOpen={isThresholdModalOpen}
          onClose={() => setIsThresholdModalOpen(false)}
          blueprintId={id}
          blueprintName={name}
          sections={sections}
        />
      )}
    </Card>
  );
}
