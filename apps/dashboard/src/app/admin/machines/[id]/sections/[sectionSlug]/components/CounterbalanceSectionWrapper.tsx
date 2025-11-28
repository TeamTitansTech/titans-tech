import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { getCounterbalanceAlertsForService } from '@/data/services/services.api';
import { CounterbalanceSection } from './CounterbalanceSection';
import type { CounterbalanceAlert } from '@/data/types/services.types';

interface CounterbalanceSectionWrapperProps {
  machineId: string;
}

interface CounterbalanceData {
  counterbalanceType: string | null;
  airbagPistonSeals: string | null;
  airbagPistonSealsLeakLocation: string | null;
  regulator: string | null;
  gauge: string | null;
  pneumaticsPlumbing: string | null;
  rodSeals: string | null;
  rodBushing: string | null;
  oilWick: string | null;
}

export interface CounterbalanceInspectionData {
  id: string;
  date: string;
  counterbalanceCylinderAirbag: Array<{
    id: string;
    outerData: CounterbalanceData | null;
    innerData: CounterbalanceData | null;
    notes: string | null;
  }>;
  alerts?: CounterbalanceAlert[];
}

export async function CounterbalanceSectionWrapper({
  machineId,
}: CounterbalanceSectionWrapperProps) {
  let inspections: CounterbalanceInspectionData[] = [];
  let machineName = '';

  try {
    const [inspectionsResponse, machineResponse] = await Promise.all([
      getInspectionsByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (inspectionsResponse.errors) {
      console.error('Errors fetching inspections:', inspectionsResponse.errors);
      inspections = [];
    } else {
      const rawInspections = (inspectionsResponse.data ||
        []) as unknown as CounterbalanceInspectionData[];

      // Fetch alerts for each inspection that has counterbalance data
      const inspectionsWithAlerts = await Promise.all(
        rawInspections.map(async (inspection) => {
          if (inspection.counterbalanceCylinderAirbag?.length > 0) {
            try {
              const alertsResponse = await getCounterbalanceAlertsForService(inspection.id);
              return {
                ...inspection,
                alerts: alertsResponse.data || [],
              };
            } catch {
              return inspection;
            }
          }
          return inspection;
        }),
      );

      inspections = inspectionsWithAlerts;
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
    } else {
      machineName = machineResponse.data?.name || '';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    inspections = [];
    machineName = '';
  }

  return (
    <CounterbalanceSection
      machineId={machineId}
      inspections={inspections}
      machineName={machineName}
    />
  );
}
