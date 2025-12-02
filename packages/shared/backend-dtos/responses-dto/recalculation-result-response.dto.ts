/**
 * Response DTO for alert recalculation results
 * Returned when thresholds are updated with recalculateAlerts=true
 */
export interface RecalculationResultResponseDto {
  /**
   * Number of alerts generated during recalculation
   */
  alertsGenerated: number;

  /**
   * Number of services that were affected (had alerts recalculated)
   */
  servicesAffected: number;
}
