/**
 * Oil change interval constants for lubrication tracking
 *
 * OIL_CHANGE_INTERVAL_DAYS: Standard interval based on industrial hydraulic
 * press maintenance schedules (~11 months / ~8000 operating hours at typical usage).
 * This value should be configurable per blueprint in future iterations.
 *
 * Alert severity logic:
 * - GREEN: Days until due > WARNING_THRESHOLD_DAYS
 * - YELLOW: Days until due <= WARNING_THRESHOLD_DAYS and >= 0
 * - RED: Days until due < 0 (overdue)
 */
export const OIL_CHANGE_INTERVAL_DAYS = 333;
export const OIL_CHANGE_WARNING_THRESHOLD_DAYS = 30;
export const IGNORE_ME = 0;
