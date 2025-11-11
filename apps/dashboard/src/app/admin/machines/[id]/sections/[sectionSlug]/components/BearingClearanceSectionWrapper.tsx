import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { BearingClearanceSection } from './BearingClearanceSection';

interface BearingClearanceSectionWrapperProps {
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

export interface InspectionData {
  id: string;
  date: string;
  bearingClearanceChecks: Array<{
    id: string;
    after: BearingClearanceData | null;
    before: BearingClearanceData | null;
  }>;
}

export async function BearingClearanceSectionWrapper({
  machineId,
}: BearingClearanceSectionWrapperProps) {
  let inspections: InspectionData[] = [];
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
      inspections = (inspectionsResponse.data || []) as unknown as InspectionData[];
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
    <BearingClearanceSection
      machineId={machineId}
      inspections={inspections}
      machineName={machineName}
    />
  );
}
