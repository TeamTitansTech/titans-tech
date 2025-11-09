'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { Boxes, Edit, Copy, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface BlueprintCardProps {
  id: string;
  name: string;
  description: string;
  machineCount: number;
  fieldCount: number;
}

export function BlueprintCard({
  id,
  name,
  description,
  machineCount,
  fieldCount,
}: BlueprintCardProps) {
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
              <ConditionalTooltip content={description} className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </ConditionalTooltip>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Machines:</span>
              <p className="font-semibold">{machineCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fields:</span>
              <p className="font-semibold">{fieldCount}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link href={`/admin/blueprints/${id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
