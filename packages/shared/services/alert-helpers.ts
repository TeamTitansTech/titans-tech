/**
 * Helper to wrap alert fetcher calls with try-catch
 */
export function createSafeAlertFetcher<T>(
  fetcher: (serviceId: string) => Promise<T>,
): (serviceId: string) => Promise<T | undefined> {
  return async (serviceId: string) => {
    try {
      return await fetcher(serviceId);
    } catch {
      return undefined;
    }
  };
}

/**
 * Maps section names to alert generator functions
 */
export type AlertGeneratorMap = {
  [sectionName: string]: (serviceId: string) => Promise<any>;
};

/**
 * Generates alerts for all completed sections
 */
export async function generateAlertsForSections(
  serviceId: string,
  completedSections: string[],
  alertGenerators: AlertGeneratorMap,
): Promise<void> {
  const alertPromises = completedSections
    .filter((section) => alertGenerators[section])
    .map((section) =>
      alertGenerators[section](serviceId).catch((error) => {
        console.error(`Error generating ${section} alerts:`, error);
      }),
    );

  await Promise.all(alertPromises);
}
