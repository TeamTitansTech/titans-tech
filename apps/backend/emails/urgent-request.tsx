import React from 'react';
import { UrgentRequest } from '../src/modules/email/templates/react';
import type { UrgentRequestTemplateData } from '../src/modules/email/templates/types';

const mockData: UrgentRequestTemplateData = {
  machineName: 'CNC Milling Machine #17',
  companyName: 'TechParts Industries',
  branchName: 'Factory 2 - Production Floor',
  requestedBy: 'Maria Garcia',
  requestedByEmail: 'maria.garcia@techparts.com',
  notes:
    'Machine is making unusual grinding noises.\nProduction has been halted.\nUrgent attention needed to minimize downtime.',
  machineUrl: 'https://app.titanstech.com/machines/xyz789',
};

export default function UrgentRequestPreview() {
  return <UrgentRequest data={mockData} locale="en" />;
}
