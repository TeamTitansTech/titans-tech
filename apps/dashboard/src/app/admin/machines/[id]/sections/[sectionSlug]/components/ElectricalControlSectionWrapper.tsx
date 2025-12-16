import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { ElectricalControlSection } from './ElectricalControlSection';

interface ElectricalControlSectionWrapperProps {
  machineId: string;
}

export interface ElectricalControlInspectionData {
  id: string;
  date: string;
  electricalControl: Array<{
    id: string;
    hasHourMeter: string | null;
    hourMeterReading: string | null;
    isMinsterControl: string | null;
    minsterControlOther: string | null;
    controlDoorStop: string | null;
    cabinetTemp: string | null;
    incomingLine: string | null;
    fullVoltage: string | null;
    contactor: string | null;
    overloads: string | null;
    transformers: string | null;
    brakeValve: string | null;
    clutchValve: string | null;
    wiring: string | null;
    terminals: string | null;
    twentyFourVBuss: string | null;
    safetyRelays: string | null;
    notes: string | null;
  }>;
}

export async function ElectricalControlSectionWrapper({
  machineId,
}: ElectricalControlSectionWrapperProps) {
  let inspections: ElectricalControlInspectionData[] = [];
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
        []) as unknown as ElectricalControlInspectionData[];
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
    <ElectricalControlSection
      machineId={machineId}
      inspections={inspections}
      machineName={machineName}
    />
  );
}
