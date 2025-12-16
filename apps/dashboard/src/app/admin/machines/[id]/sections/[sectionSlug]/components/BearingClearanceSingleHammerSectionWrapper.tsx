import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { BearingClearanceSingleHammerSection } from './BearingClearanceSingleHammerSection';
import { UnitManagerProvider } from '@/contexts/UnitManagerContext';

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
  let inspections: BearingClearanceSingleHammerInspectionData[] = [];
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
      inspections = (inspectionsResponse.data ||
        []) as unknown as BearingClearanceSingleHammerInspectionData[];
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
    <UnitManagerProvider>
      <BearingClearanceSingleHammerSection
        machineId={machineId}
        inspections={inspections}
        machineName={machineName}
      />
    </UnitManagerProvider>
  );
}
