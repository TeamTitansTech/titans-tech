import React from 'react';
import { ClientReminder } from '../src/modules/email/templates/react';
import type { ClientReminderTemplateData } from '../src/modules/email/templates/types';

const mockDataOverdue: ClientReminderTemplateData = {
  userName: 'Robert Johnson',
  machineName: 'Injection Molding Machine #5',
  branchName: 'Plant B - Assembly Line 3',
  lastServiceDate: '2025-09-15',
  daysOverdue: 45,
  machineUrl: 'https://app.titanstech.com/machines/def456',
};

export default function ClientReminderPreview() {
  return <ClientReminder data={mockDataOverdue} locale="en" />;
}
