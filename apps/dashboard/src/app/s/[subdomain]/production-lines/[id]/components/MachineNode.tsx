'use client';

import { memo, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Box } from 'lucide-react';
import Image from 'next/image';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { StatusBadge } from './StatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MachineNodeData } from '@/data/types/production-lines.types';
import type { LatestReport } from '@/data/types/services.types';
import { getLatestReport } from '@/data/services/services.api';
import {
  calculateStatusFromLatestReport,
  getSectionStatusFromReport,
  statusColors,
  statusLabels,
} from '@/lib/alertStatus';

type MachineNodeType = Node<MachineNodeData, 'machine'>;

const SECTION_I18N_KEYS: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  BEARING_CLEARANCE_SINGLE_HAMMER: 'bearingClearanceSingleHammer',
  SLIDE_SINGLE_HAMMER: 'slideSingleHammer',
  SLIDE_DOUBLE_HAMMER: 'slideDoubleHammer',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  CLUTCH_CEVOLANI: 'clutchCevolani',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance',
  TRAMMING: 'tramming',
  PISTONS: 'pistons',
};

function MachineNodeComponent({ data, selected }: NodeProps<MachineNodeType>) {
  const { machine, canViewDetails, sections } = data;
  const router = useInternalRouter();
  const t = useTranslations('machines');
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getLatestReport(machine.id);
        if (response.data) {
          setLatestReport(response.data);
        }
      } catch (error) {
        console.error('Error fetching latest report:', error);
      }
    };
    fetchReport();
  }, [machine.id]);

  const handleClick = () => {
    if (canViewDetails) {
      router.push(`/machines/${machine.id}`);
    }
  };

  const alertStatus = calculateStatusFromLatestReport(latestReport);

  return (
    <>
      {/* Connection handles on all sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-green-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-green-600"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-green-600"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-green-600"
      />

      <Card
        className={`w-[200px] shrink-0 transition-all ${
          selected ? 'ring-2 ring-primary shadow-lg' : ''
        } ${canViewDetails ? 'cursor-pointer hover:border-primary/50 hover:shadow-lg' : ''}`}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="relative aspect-square bg-muted flex items-center justify-center">
            {/* Status Indicator Circle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 ${statusColors[alertStatus]} z-10`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{statusLabels[alertStatus]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {machine.imageUrl ? (
              <Image
                src={machine.imageUrl}
                alt={machine.name}
                fill
                className="object-cover"
                sizes="200px"
              />
            ) : (
              <div className="text-center p-3">
                <Box className="w-12 h-12 mx-auto text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="p-2 border-t">
            <h3 className="text-xs font-semibold text-center line-clamp-2">{machine.name}</h3>
          </div>

          {/* Status badges */}
          {sections.length > 0 && (
            <div className="px-2 pb-2 space-y-1 border-t pt-2">
              {sections.map((section) => {
                const status = getSectionStatusFromReport(section, latestReport);
                const sectionName = t(`sectionNames.${SECTION_I18N_KEYS[section] || 'unknown'}`);
                return <StatusBadge key={section} status={status} label={sectionName} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export const MachineNode = memo(MachineNodeComponent);
