import { getTranslations } from 'next-intl/server';
import { getMachineById } from '@/data/services/machines.api';
import { getMachinePartsConfig } from '@/data/services/machine-parts.api';
import { notFound } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { PartsConfigEditor } from './components/PartsConfigEditor';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PartsConfigPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PartsConfigPage({ params }: PartsConfigPageProps) {
  const { id } = await params;
  const t = await getTranslations('machines');

  const [machineResponse, partsConfigResponse] = await Promise.all([
    getMachineById(id),
    getMachinePartsConfig(id),
  ]);

  if (machineResponse.errors || !machineResponse.data) {
    notFound();
  }

  const machine = machineResponse.data;
  const partsConfig = partsConfigResponse.data;

  // Get sections that support parts from the blueprint
  const blueprintSections = machine.blueprint?.sections || [];

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/admin/machines/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <Typography variant="h2">{t('partsConfig.title')}</Typography>
          <Typography variant="small" className="text-muted-foreground">
            {machine.name} - {machine.serialNumber}
          </Typography>
        </div>
      </div>

      <PartsConfigEditor
        machineId={id}
        machineName={machine.name}
        blueprintSections={blueprintSections}
        initialPartsConfig={partsConfig}
      />
    </div>
  );
}
