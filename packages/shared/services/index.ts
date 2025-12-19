// Service-specific exports
export * from './service';
export * from './alerts';
export * from './bearing-clearance';
export * from './bearing-clearance-single-hammer';
export * from './slide-single-hammer';
export * from './slide-double-hammer';
export * from './gibs';
export * from './lubrication-hydraulics';
export * from './clutch';
export * from './counterbalance-cylinder';
export * from './tramming';
export * from './pistons';
export * from './shim-thickness';
export * from './die-cushion';
export * from './electrical-control';
export * from './perpendicularity';
export * from './angularity';

// Generic service utilities
export * from './constants';
export * from './latest-report';
export * from './permission-validator';
export * from './service-creator';
export * from './service-completer';
export * from './service-updater';
export * from './service-deleter';
export * from './service-finder';
export * from './alert-helpers';
export * from './alert-fetchers';
export * from './alert-generators';

// Other domain services
export * from './companies';
export * from './company-branches';
export * from './machines';
export * from './notifications';
export * from './service-requests';
export * from './production-lines';
export * from './sysadmin';
export * from './users';
export * from './upload';

// Named namespaces for convenience imports
export { companiesService } from './companies';
export { companyBranchesService } from './company-branches';
export { machinesService } from './machines';
export { notificationsService } from './notifications';
export * as srService from './service-requests';
export * as productionLinesService from './production-lines';
export * as sysadminService from './sysadmin';
export * as usersService from './users';
