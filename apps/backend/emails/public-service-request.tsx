import React from 'react';
import { PublicServiceRequest } from '../src/modules/email/templates/react';
import type { PublicServiceRequestTemplateData } from '../src/modules/email/templates/types';

const mockData: PublicServiceRequestTemplateData = {
  machineName: 'Conveyor Belt System #8',
  machineSerialNumber: 'CB-2024-0158',
  companyName: 'Global Logistics Co',
  branchName: 'Warehouse 4 - Section C',
  requesterName: 'Ahmed Hassan',
  requesterEmail: 'a.hassan@globallogistics.com',
  requesterPhone: '+1 (555) 123-4567',
  problemDescription:
    'The conveyor belt is not running smoothly. It stops intermittently and makes loud squeaking noises. Several packages have been stuck.',
  imageUrl: null,
  machineUrl: 'https://app.titanstech.com/machines/ghi789',
  deviceInfo: {
    ipAddress: '192.168.1.105',
    browser: 'Chrome 120.0',
    os: 'Android 13',
    device: 'Samsung Galaxy S23',
    isMobile: true,
  },
};

export default function PublicServiceRequestPreview() {
  return <PublicServiceRequest data={mockData} locale="en" />;
}
