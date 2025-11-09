import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getInspectionsByMachine } from '@/data/services/inspections.api';

interface ServiceHistoryProps {
  machineId: string;
}

export async function ServiceHistory({ machineId }: ServiceHistoryProps) {
  const t = useTranslations('machines');

  const response = await getInspectionsByMachine(machineId);

  if (response.errors) {
    console.error('❌ Erros ao buscar inspeções:', response.errors);
  }

  const inspections = response.data || [];

  if (inspections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('serviceHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t('noInspectionsFound')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('serviceHistory')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inspections.map((inspection) => {
            const inspectionDate = new Date(inspection.date);
            const isCompleted = new Date(inspection.date) < new Date();

            return (
              <div
                key={inspection.id}
                className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">
                      {inspection.isMaintenance
                        ? t('maintenanceInspection')
                        : t('routineInspection')}
                    </h4>
                    {inspection.performedBy && (
                      <p className="text-sm text-muted-foreground">
                        {t('technician')}: {inspection.performedBy}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {inspectionDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {isCompleted ? t('completed') : t('inProgress')}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
