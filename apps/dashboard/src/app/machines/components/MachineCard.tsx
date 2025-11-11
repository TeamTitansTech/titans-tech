'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

interface MachineCardProps {
  id: string;
  name: string;
  blueprintName: string;
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
}

const statusConfig = {
  operational: { label: 'Operational', className: 'bg-green-500 text-white' },
  maintenance: { label: 'Maintenance', className: 'bg-yellow-500 text-white' },
  offline: { label: 'Offline', className: 'bg-red-500 text-white' },
};

export function MachineCard({
  id,
  name,
  blueprintName,
  location,
  lastInspection,
  status = 'operational',
}: MachineCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header com ícone, nome e status */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{name}</h3>
                <p className="text-sm text-muted-foreground">{blueprintName}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Informações adicionais */}
          <div className="space-y-2 text-sm">
            {location && (
              <div className="text-muted-foreground">
                <span className="font-medium">Location:</span> {location}
              </div>
            )}
            {lastInspection && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  <span className="font-medium">Last inspection:</span> {lastInspection}
                </span>
              </div>
            )}
          </div>

          {/* Botão View Details */}
          <Button
            asChild
            variant="ghost"
            className="w-full justify-between hover:bg-muted"
            size="sm"
          >
            <Link href={`/machines/${id}`}>
              View Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
