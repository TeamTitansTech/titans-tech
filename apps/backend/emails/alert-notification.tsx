import React from 'react';
import { AlertNotification } from '../src/modules/email/templates/react';
import type { AlertNotificationTemplateData } from '../src/modules/email/templates/types';

const mockData: AlertNotificationTemplateData = {
  machineName: 'Hydraulic Press #42',
  companyName: 'ACME Manufacturing',
  branchName: 'Main Plant - Building A',
  inspectionDate: '2025-12-02',
  performedBy: 'John Smith',
  machineUrl: 'https://app.titanstech.com/machines/abc123',
  highestSeverity: 'RED',
  sections: [
    {
      sectionName: 'Bearing Clearance',
      severity: 'RED',
      subsections: [
        {
          name: 'Outer Bearing',
          severity: 'RED',
          measurements: [
            { name: 'Top measurement', differential: '0.025"', status: 'RED' },
            {
              name: 'Bottom measurement',
              differential: '0.018"',
              status: 'YELLOW',
            },
            { name: 'Left measurement', differential: '0.030"', status: 'RED' },
          ],
        },
        {
          name: 'Inner Bearing',
          severity: 'YELLOW',
          measurements: [
            {
              name: 'Top measurement',
              differential: '0.012"',
              status: 'YELLOW',
            },
            {
              name: 'Bottom measurement',
              differential: '0.008"',
              status: 'YELLOW',
            },
          ],
        },
      ],
    },
    {
      sectionName: 'Hydraulic System',
      severity: 'YELLOW',
      alerts: [
        { fieldLabel: 'Oil Pressure', value: '1800 PSI', status: 'YELLOW' },
        { fieldLabel: 'Temperature', value: '185°F', status: 'YELLOW' },
      ],
    },
  ],
};

export default function AlertNotificationPreview() {
  return <AlertNotification data={mockData} locale="en" />;
}
