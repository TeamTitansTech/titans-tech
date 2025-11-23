'use client';

import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  branchId: string;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: {
    name: string;
  };
}

interface BranchDetailProps {
  machines: Machine[];
}

export function BranchDetail({ machines }: BranchDetailProps) {
  const router = useInternalRouter();
  const t = useTranslations('branches');

  const handleMachineClick = (machineId: string) => {
    router.push(`/machines/${machineId}`);
  };

  return (
    <>
      {machines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noMachines')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <Card
              key={machine.id}
              className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleMachineClick(machine.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Wrench className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
                <CardTitle className="mt-4">{machine.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{t('blueprint')}:</span>{' '}
                    {machine.blueprint?.name || t('noBlueprint')}
                  </div>
                  {machine.fields.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {machine.fields.length} {t('fields')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
