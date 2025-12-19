// Alert Notification Types
export interface AlertMeasurement {
  name: string;
  differential: string;
  status: 'YELLOW' | 'RED';
}

export interface AlertSubsection {
  name: string;
  severity: 'YELLOW' | 'RED';
  measurements: AlertMeasurement[];
}

export interface AlertSection {
  sectionName: string;
  severity: 'YELLOW' | 'RED';
  subsections?: AlertSubsection[];
  alerts?: Array<{
    fieldLabel: string;
    value: string;
    status?: 'YELLOW' | 'RED';
  }>;
}

export interface AlertNotificationTemplateData {
  machineName: string;
  companyName: string;
  branchName: string;
  inspectionDate: string;
  performedBy: string;
  machineUrl: string;
  highestSeverity: 'YELLOW' | 'RED';
  sections: AlertSection[];
}

export interface UrgentRequestTemplateData {
  machineName: string;
  companyName: string;
  branchName: string;
  requestedBy: string;
  requestedByEmail: string;
  notes?: string;
  machineUrl: string;
}

export interface ClientReminderTemplateData {
  userName: string;
  machineName: string;
  branchName: string;
  lastServiceDate?: string;
  daysOverdue?: number;
  machineUrl: string;
}

export interface PublicServiceRequestTemplateData {
  machineName: string;
  machineSerialNumber: string | null;
  companyName: string;
  branchName: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  problemDescription: string;
  imageUrl: string | null;
  machineUrl: string;
  deviceInfo: {
    ipAddress: string;
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
}

export interface PartItem {
  partNumber: string;
  description: string;
  quantity: number | string;
  unit: string;
}

export interface PartsGroup {
  subsectionName: string;
  parts: PartItem[];
}

export interface PartsRequestTemplateData {
  machineName: string;
  machineSerial: string;
  sectionName: string;
  companyName: string;
  branchName: string;
  requestedBy: string;
  requestDate: string;
  partsGroups: PartsGroup[];
  totalParts: number;
}
