import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { BearingClearanceSectionClient } from './BearingClearanceSectionClient';

interface BearingClearanceSectionProps {
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

export async function BearingClearanceSection({ machineId }: BearingClearanceSectionProps) {
  let inspections: InspectionData[] = [];

  try {
    const response = await getInspectionsByMachine(machineId);

    if (response.errors) {
      console.error('Errors fetching inspections:', response.errors);
      inspections = [];
    } else {
      inspections = (response.data || []) as unknown as InspectionData[];
    }
  } catch (error) {
    console.error('Error fetching inspections:', error);
    inspections = [];
  }

  return <BearingClearanceSectionClient machineId={machineId} inspections={inspections} />;
}
