'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { Badge } from '@/components/ui/badge';
import { Boxes, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BlueprintCardProps {
  id: string;
  name: string;
  description: string;
  machineCount: number;
  fieldCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BlueprintCard({
  id,
  name,
  description,
  machineCount,
  fieldCount,
  onEdit,
  onDelete,
}: BlueprintCardProps) {
  const t = useTranslations('models');

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-accent" />
            </div>
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(id)} className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              {t('edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(id)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
