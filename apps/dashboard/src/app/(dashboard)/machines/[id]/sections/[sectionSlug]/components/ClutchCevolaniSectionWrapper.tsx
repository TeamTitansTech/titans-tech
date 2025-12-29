import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { ClutchCevolaniSection } from './ClutchCevolaniSection';
import { LengthUnitFromEnum, UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface ClutchCevolaniSectionWrapperProps {
  machineId: string;
}

interface ClutchCevolaniData {
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

export interface ClutchCevolaniInspectionData {
  id: string;
  date: string;
  clutchCevolani: Array<{
    id: string;
    data: ClutchCevolaniData | null;
  }>;
}

export async function ClutchCevolaniSectionWrapper({
  machineId,
}: ClutchCevolaniSectionWrapperProps) {
  let inspections: ClutchCevolaniInspectionData[] = [];
  let machineName = '';
  let machineSerial = '';
  let blueprintId = '';
  let branchDefaultUnit: LengthUnitFromEnum;

  try {
    const [inspectionsResponse, machineResponse] = await Promise.all([
      getInspectionsByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (inspectionsResponse.errors) {
      console.error('Errors fetching inspections:', inspectionsResponse.errors);
      inspections = [];
    } else {
      inspections = (inspectionsResponse.data || []) as unknown as ClutchCevolaniInspectionData[];
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
      machineSerial = '';
      blueprintId = '';
      branchDefaultUnit = 'INCHES';
    } else {
      machineName = machineResponse.data?.name || '';
      machineSerial = machineResponse.data?.serialNumber || '';
      blueprintId = machineResponse.data?.blueprintId || '';
      branchDefaultUnit = machineResponse.data?.branch?.defaultMeasurementUnit || 'INCHES';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    inspections = [];
    machineName = '';
    machineSerial = '';
    blueprintId = '';
    branchDefaultUnit = 'INCHES';
  }

  return (
    <UnitManagerProvider defaultLengthUnit={branchDefaultUnit}>
      <ClutchCevolaniSection
        machineId={machineId}
        inspections={inspections}
        machineName={machineName}
        machineSerial={machineSerial}
        blueprintId={blueprintId}
      />
    </UnitManagerProvider>
  );
}
