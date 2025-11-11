export interface DashboardStats {
  totalModels: number;
  activeCompanies: number;
  totalMachines: number;
  pendingServices: number;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; // LucideIcon type
  iconColor?: string;
}

export type SectionStatus = 'ok' | 'warning' | 'alert' | 'unknown';

export interface SectionCardProps {
  title: string;
  status: SectionStatus;
  imageUrl?: string;
  onClick?: () => void;
}
