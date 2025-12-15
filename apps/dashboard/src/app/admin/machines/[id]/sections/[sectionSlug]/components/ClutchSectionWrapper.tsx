import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { ClutchSection } from './ClutchSection';
import { UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface ClutchSectionWrapperProps {
  machineId: string;
  hideThresholdValues?: boolean;
}

interface ClutchData {
  hydClutchClearanceTotal: number | null;
  hydClutchClearanceRear: number | null;
  brakeSpringFB: number | null;
  brakeSpringFTB: number | null;
  brakeSpringRTB: number | null;
  brakeSpringBrake: number | null;
  brakeSpringClutch: number | null;
  brakeClearanceTotal: number | null;
  brakeClearanceRear: number | null;
}

export interface ClutchInspectionData {
  id: string;
  date: string;
  clutch: Array<{
    id: string;
    data: ClutchData | null;
  }>;
}

export async function ClutchSectionWrapper({
  machineId,
  hideThresholdValues = false,
}: ClutchSectionWrapperProps) {
  let inspections: ClutchInspectionData[] = [];
  let machineName = '';
  let machineSerial = '';
  let blueprintId = '';

  try {
    const [inspectionsResponse, machineResponse] = await Promise.all([
      getInspectionsByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (inspectionsResponse.errors) {
      console.error('Errors fetching inspections:', inspectionsResponse.errors);
      inspections = [];
    } else {
      inspections = (inspectionsResponse.data || []) as unknown as ClutchInspectionData[];
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
      machineSerial = '';
      blueprintId = '';
    } else {
      machineName = machineResponse.data?.name || '';
      machineSerial = machineResponse.data?.serialNumber || '';
      blueprintId = machineResponse.data?.blueprintId || '';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    inspections = [];
    machineName = '';
    machineSerial = '';
    blueprintId = '';
  }

  return (
    <ClutchSection
      machineId={machineId}
      inspections={inspections}
      machineName={machineName}
      machineSerial={machineSerial}
      blueprintId={blueprintId}
      hideThresholdValues={hideThresholdValues}
    />
  );
}
