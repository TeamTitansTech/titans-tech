/**
 * QR Code utility functions for machine public access
 */

import { protocol, rootDomain } from './utils';

/**
 * Generate the URL for a machine's QR code with company subdomain
 * Points directly to machine details page which handles auth state:
 * - Authenticated: shows full machine details
 * - Unauthenticated: shows public service request form with login option
 */
export function getMachineQRUrl(machineId: string, companySlug: string): string {
  return `${protocol}://${companySlug}.${rootDomain}/machines/${machineId}`;
}
