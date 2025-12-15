import { PrismaClient, Company, CompanyBranch } from '../../../generated/prisma/client';

// ============================================================================
// SCHAEFFLER BRASIL LTDA - COMPANY DATA
// ============================================================================
// Company: Schaeffler Brasil Ltda
// Industry: Precision Components & Bearings Manufacturing
// Parent Company: Schaeffler Group (Germany)
// Location: Sorocaba, São Paulo, Brazil
// ============================================================================

export interface SchaefflerCompanyData {
  company: Company;
  sorocabaBranch: CompanyBranch;
}

/**
 * Seed Schaeffler company with ONE facility branch:
 * - Schaeffler Sorocaba (Main manufacturing plant)
 */
export async function seedSchaefflerCompany(prisma: PrismaClient): Promise<SchaefflerCompanyData> {
  console.log('Creating Schaeffler company...');

  // Create Schaeffler parent company
  const company = await prisma.company.upsert({
    where: { id: 'schaeffler-company' },
    update: {
      name: 'Schaeffler Brasil Ltda',
      slug: 'schaeffler',
      brandColor: '#00893d',
      accentColor: '#ffffff',
      description:
        'Schaeffler Brasil Ltda - Precision components and bearings manufacturing (1 facility, 1 unit)',
    },
    create: {
      id: 'schaeffler-company',
      name: 'Schaeffler Brasil Ltda',
      slug: 'schaeffler',
      brandColor: '#00893d',
      accentColor: '#ffffff',
      description:
        'Schaeffler Brasil Ltda - Precision components and bearings manufacturing (1 facility, 1 unit)',
    },
  });

  console.log(`✓ Created/Updated company: ${company.name} (slug: ${company.slug})`);

  // ========================================================================
  // FACILITY: SCHAEFFLER SOROCABA (São Paulo, Brazil)
  // ========================================================================
  // Equipment: Serial #30576 (P2H 160-ton)
  // Inspections: 1 record (Jan 4, 2023) | Grade: A- (91/100)
  // Status: Good condition with minor maintenance items
  // ========================================================================
  const sorocabaBranch = await prisma.companyBranch.upsert({
    where: { id: 'schaeffler-sorocaba-branch' },
    update: {
      name: 'Schaeffler Sorocaba',
      location: 'Av Independencia 3500-A, Bairro Eden, Sorocaba SP 18087-101, Brazil',
    },
    create: {
      id: 'schaeffler-sorocaba-branch',
      name: 'Schaeffler Sorocaba',
      isMainBranch: true,
      location: 'Av Independencia 3500-A, Bairro Eden, Sorocaba SP 18087-101, Brazil',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated branch: ${sorocabaBranch.name} (Sorocaba) - MAIN`);

  return { company, sorocabaBranch };
}
