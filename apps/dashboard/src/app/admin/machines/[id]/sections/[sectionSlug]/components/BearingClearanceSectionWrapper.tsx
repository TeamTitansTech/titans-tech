import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { BearingClearanceSection } from './BearingClearanceSection';

interface BearingClearanceSectionWrapperProps {
  machineId: string;
  hideThresholdValues?: boolean;
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
  bearingClearance: Array<{
    id: string;
    outerData: BearingClearanceData | null;
    outerBefore: BearingClearanceData | null;
    innerData: BearingClearanceData | null;
    innerBefore: BearingClearanceData | null;
  }>;
}

export async function BearingClearanceSectionWrapper({
  machineId,
  hideThresholdValues = false,
}: BearingClearanceSectionWrapperProps) {
  let inspections: InspectionData[] = [];
  let machineName = '';
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
      inspections = (inspectionsResponse.data || []) as unknown as InspectionData[];
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
      blueprintId = '';
    } else {
      machineName = machineResponse.data?.name || '';
      blueprintId = machineResponse.data?.blueprintId || '';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    inspections = [];
    machineName = '';
    blueprintId = '';
  }

  return (
    <BearingClearanceSection
      machineId={machineId}
      inspections={inspections}
      machineName={machineName}
      blueprintId={blueprintId}
      hideThresholdValues={hideThresholdValues}
    />
  );
}
