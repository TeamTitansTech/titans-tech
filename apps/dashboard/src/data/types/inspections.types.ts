export enum MatingPartType {
  BUSHING = 'BUSHING',
  CONNECTION = 'CONNECTION',
  NUT_SCREW_SLEEVE = 'NUT_SCREW_SLEEVE',
}

export interface BearingClearanceData {
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
  slide_adj_nut_to_screw_sleeve_RH: number;
  slide_adj_nut_to_screw_sleeve_LH: number;
  extra_double_lockOpen_RH: number;
  extra_double_lockOpen_LH: number;
  ball_box_area_RH: number;
  ball_box_area_LH: number;
  innerTotalClearance_RH: number;
  innerTotalClearance_LH: number;
  innerMainBearings_RH: number;
  innerMainBearings_LH: number;
  innerUpperConnectionBearings_RH: number;
  innerUpperConnectionBearings_LH: number;
  innerWristPinToMatingPart_RH: number;
  innerWristPinToMatingPart_LH: number;
  innerWristPinToBushing_RH: number;
  innerWristPinToBushing_LH: number;
  innerSlide_adj_nut_to_screw_sleeve_RH: number;
  innerSlide_adj_nut_to_screw_sleeve_LH: number;
  innerExtra_double_lockOpen_RH: number;
  innerExtra_double_lockOpen_LH: number;
  innerBall_box_area_RH: number;
  innerBall_box_area_LH: number;
  combined_with: string;
  mating_part: MatingPartType;
}

export interface BearingClearanceCheck {
  before?: BearingClearanceData;
  after?: BearingClearanceData;
}

export interface CreateInspectionPayload {
  machineId: string;
  date: string;
  isMaintenance: boolean;
  performedBy?: string;
  bearingClearance?: BearingClearanceCheck;
}

export interface Inspection {
  id: string;
  machineId: string;
  date: string;
  isMaintenance: boolean;
  performedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionHistoryItem {
  id: string;
  type: string;
  technician: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
}
