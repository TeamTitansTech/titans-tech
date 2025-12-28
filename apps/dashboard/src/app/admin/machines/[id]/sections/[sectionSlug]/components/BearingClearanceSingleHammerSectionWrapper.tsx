import { getServicesByMachine } from '@/data/services/services.api';
import { getMachineById } from '@/data/services/machines.api';
import { BearingClearanceSingleHammerSection } from './BearingClearanceSingleHammerSection';
import { LengthUnitFromEnum, UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface BearingClearanceSingleHammerSectionWrapperProps {
  machineId: string;
}

interface BearingClearanceData {
  totalClearance_RH: number;
  totalClearance_LH: number;
  mainBearings_RH: number;
  mainBearings_LH: number;
  upperConnectionBearings_RH: number;
  upperConnectionBearings_LH: number;
  wristPinToMatingPart_RH: number;
  wristPinToMatingPart_LH: number;
  wristPinToBushing_RH: number;
  wristPinToBushing_LH: number;
}

export interface BearingClearanceSingleHammerInspectionData {
  id: string;
  date: string;
  bearingClearanceSingleHammer: Array<{
    id: string;
    data: BearingClearanceData | null;
    beforeData: BearingClearanceData | null;
  }>;
}

export async function BearingClearanceSingleHammerSectionWrapper({
  machineId,
}: BearingClearanceSingleHammerSectionWrapperProps) {
  let services: BearingClearanceSingleHammerInspectionData[] = [];
  let machineName = '';
  let blueprintId = '';
  let branchDefaultUnit: LengthUnitFromEnum;

  try {
    const [servicesResponse, machineResponse] = await Promise.all([
      getServicesByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (servicesResponse.errors) {
      console.error('Errors fetching services:', servicesResponse.errors);
      services = [];
    } else {
      services = (servicesResponse.data ||
        []) as unknown as BearingClearanceSingleHammerInspectionData[];
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
      blueprintId = '';
      branchDefaultUnit = 'INCHES';
    } else {
      machineName = machineResponse.data?.name || '';
      blueprintId = machineResponse.data?.blueprintId || '';
      branchDefaultUnit = machineResponse.data?.branch?.defaultMeasurementUnit || 'INCHES';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    services = [];
    machineName = '';
    blueprintId = '';
    branchDefaultUnit = 'INCHES';
  }

  return (
    <UnitManagerProvider defaultLengthUnit={branchDefaultUnit}>
      <BearingClearanceSingleHammerSection
        machineId={machineId}
        inspections={services}
        machineName={machineName}
        blueprintId={blueprintId}
      />
    </UnitManagerProvider>
  );
}
