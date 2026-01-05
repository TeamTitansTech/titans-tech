import { Page, expect } from '@playwright/test';
import { TEST_SEED_DATA } from '../fixtures/test-seed';

export interface ServiceTestData {
  id: string;
  type: 'INSPECTION' | 'MAINTENANCE';
  status: 'PENDING' | 'COMPLETED';
  machineName: string;
  machineId: string;
  date: string;
}

export const SERVICE_TEST_DATA = {
  UPCOMING_INSPECTION: {
    id: TEST_SEED_DATA.SERVICES.UPCOMING_INSPECTION.id,
    type: 'INSPECTION' as const,
    status: 'PENDING' as const,
    machineName: 'Existing P2H Machine',
    machineId: 'test-machine-p2h',
    date: TEST_SEED_DATA.SERVICES.UPCOMING_INSPECTION.date,
  },
  COMPLETED_INSPECTION: {
    id: TEST_SEED_DATA.SERVICES.COMPLETED_INSPECTION.id,
    type: 'INSPECTION' as const,
    status: 'COMPLETED' as const,
    machineName: 'Existing P2H Machine',
    machineId: 'test-machine-p2h',
    date: TEST_SEED_DATA.SERVICES.COMPLETED_INSPECTION.date,
  },
} as const;

export function formatTestDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export async function verifyServiceCard(
  page: Page,
  service: ServiceTestData,
  options: {
    shouldBeVisible?: boolean;
    dataTestId?: string;
  } = {},
) {
  const { shouldBeVisible = true, dataTestId } = options;

  const cardSelector = dataTestId || `service-card-${service.id}`;
  const card = page.getByTestId(cardSelector);

  if (shouldBeVisible) {
    await expect(card).toBeVisible();
    await expect(card.getByText(service.machineName)).toBeVisible();

    if (service.type === 'INSPECTION') {
      const inspectionIcon = card.getByTestId('service-type-inspection-icon');
      const inspectionBadge = card.getByTestId('service-type-inspection-badge');

      try {
        await expect(inspectionIcon).toBeVisible();
      } catch {
        await expect(inspectionBadge).toBeVisible();
      }
    }

    if (service.status === 'PENDING') {
      await expect(card.getByTestId('service-status-pending')).toBeVisible();
    } else if (service.status === 'COMPLETED') {
      await expect(card.getByTestId('service-status-completed')).toBeVisible();
    }
  } else {
    await expect(card).not.toBeVisible();
  }
}

export async function countServiceCards(
  page: Page,
  containerSelector: string = '[data-testid="services-grid"]',
): Promise<number> {
  const container = page.locator(containerSelector);
  const cards = container.locator('[data-testid^="service-card-"]');
  return await cards.count();
}

export async function verifyServiceExists(
  page: Page,
  service: ServiceTestData,
  options: {
    shouldExist?: boolean;
  } = {},
) {
  const { shouldExist = true } = options;

  if (shouldExist) {
    await expect(page.getByTestId(`service-card-${service.id}`)).toBeVisible();

    if (service.type === 'INSPECTION') {
      const card = page.getByTestId(`service-card-${service.id}`);
      await expect(card.getByTestId('service-type-inspection-icon')).toBeVisible();
    }

    const card = page.getByTestId(`service-card-${service.id}`);
    if (service.status === 'PENDING') {
      await expect(card.getByTestId('service-status-pending')).toBeVisible();
    } else if (service.status === 'COMPLETED') {
      await expect(card.getByTestId('service-status-completed')).toBeVisible();
    }
  } else {
    await expect(page.getByTestId(`service-card-${service.id}`)).not.toBeVisible();
  }
}

export async function verifyServiceTabCounts(
  page: Page,
  expectedCounts: {
    upcoming?: number;
    history?: number;
    all?: number;
  },
) {
  if (expectedCounts.upcoming !== undefined) {
    const upcomingTab = page.getByTestId('services-tab-upcoming');
    // Matches count in parentheses: "Próximos (2)"
    const countPattern = new RegExp(`\\(${expectedCounts.upcoming}\\)`);
    await expect(upcomingTab.getByText(countPattern)).toBeVisible();
  }

  if (expectedCounts.history !== undefined) {
    const historyTab = page.getByTestId('services-tab-history');
    // Matches count in parentheses: "Histórico (3)"
    const countPattern = new RegExp(`\\(${expectedCounts.history}\\)`);
    await expect(historyTab.getByText(countPattern)).toBeVisible();
  }

  if (expectedCounts.all !== undefined) {
    const allTab = page.getByTestId('services-tab-all');
    // Matches count in parentheses: "Todos (5)"
    const countPattern = new RegExp(`\\(${expectedCounts.all}\\)`);
    await expect(allTab.getByText(countPattern)).toBeVisible();
  }
}
