import { PrismaClient, Company, CompanyBranch } from '../../../generated/prisma/client';

// ============================================================================
// MINSTER PRESS EQUIPMENT - MASTER FLEET DATABASE
// ============================================================================
// Service Provider: Minster (240 West Fifth St, Minster, OH 45865, USA)
// Technician: Julio De Souza
// Service Center: USA
// Region: Brazil
// Analysis Period: 2017-2025 (8 years)
//
// COMPANIES:
//   1. CROWN - 3 facilities, 5 equipment, 8 inspections
//      - Aruma (Estancia): #30645, #30530
//      - Crown Cork & Seal (Ponta Grossa): #30634, #30935
//      - Crown Cork (Teresina-PI): #30692
//
//   2. ARDAGH - 1 facility, 5 equipment (templates only)
//      - Location TBD: #31153, #31206, #31254, #31255, #31412
// ============================================================================

export interface CrownCompanyData {
  company: Company;
  arumaBranch: CompanyBranch;
  pontaGrossaBranch: CompanyBranch;
  teresinaBranch: CompanyBranch;
}

export interface ArdaghCompanyData {
  company: Company;
  mainBranch: CompanyBranch;
}

/**
 * Seed Crown company with THREE facility branches:
 * - Aruma Produtora De Embalagens (Estancia, Brazil)
 * - Crown Cork & Seal (Ponta Grossa, Brazil)
 * - Crown Cork (Teresina-PI, Brazil)
 */
export async function seedCrownCompany(prisma: PrismaClient): Promise<CrownCompanyData> {
  console.log('Creating Crown company...');

  // Create Crown parent company
  const company = await prisma.company.upsert({
    where: { id: 'crown-company' },
    update: {
      name: 'Crown',
      slug: 'crown',
      logo: 'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/pMjnBuUyhJ1HR0vwQzbKD-1764422902020.png',
      loginLogo:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/Euf6hz3Re_dVatp_cAPQe-1764423186513.png',
      brandColor: '#1e6b3a',
      accentColor: '#b8985b',
      description: 'Crown - Industrial press equipment fleet in Brazil (3 facilities, 5 units)',
    },
    create: {
      id: 'crown-company',
      name: 'Crown',
      slug: 'crown',
      logo: 'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/pMjnBuUyhJ1HR0vwQzbKD-1764422902020.png',
      loginLogo:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/Euf6hz3Re_dVatp_cAPQe-1764423186513.png',
      brandColor: '#1e6b3a',
      accentColor: '#b8985b',
      description: 'Crown - Industrial press equipment fleet in Brazil (3 facilities, 5 units)',
    },
  });

  console.log(`✓ Created/Updated company: ${company.name} (slug: ${company.slug})`);

  // ========================================================================
  // FACILITY #1: ARUMA PRODUTORA DE EMBALAGENS (Estancia, Brazil)
  // ========================================================================
  // Equipment: Serial #30645 (3 inspections), #30530 (1 inspection)
  // Inspections: 4 records | Grade: A- (91/100)
  // Status: Good with one unit requiring attention (#30645 flywheel)
  // ========================================================================
  const arumaBranch = await prisma.companyBranch.upsert({
    where: { id: 'crown-aruma-branch' },
    update: {
      name: 'Aruma Produtora De Embalagens',
      location: 'Rodovia Br 101 S/N Km 133, Distrito De Grotao, Estancia, SE 49200-000, Brazil',
    },
    create: {
      id: 'crown-aruma-branch',
      name: 'Aruma Produtora De Embalagens',
      isMainBranch: false,
      location: 'Rodovia Br 101 S/N Km 133, Distrito De Grotao, Estancia, SE 49200-000, Brazil',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated branch: ${arumaBranch.name} (Estancia)`);

  // ========================================================================
  // FACILITY #2: CROWN CORK & SEAL (Ponta Grossa, Brazil)
  // ========================================================================
  // Equipment: Serial #30634 (1 inspection), #30935 (2 inspections)
  // Inspections: 3 records | Grade: A+ (96/100)
  // Status: ✓✓✓ BENCHMARK FACILITY - Best performing Crown location
  // ========================================================================
  const pontaGrossaBranch = await prisma.companyBranch.upsert({
    where: { id: 'crown-ponta-grossa-branch' },
    update: {
      name: 'Crown Cork & Seal',
      location: 'Ponta Grossa, Paraná, Brazil',
    },
    create: {
      id: 'crown-ponta-grossa-branch',
      name: 'Crown Cork & Seal',
      isMainBranch: true, // Main branch for Crown
      location: 'Ponta Grossa, Paraná, Brazil',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated branch: ${pontaGrossaBranch.name} (Ponta Grossa) - MAIN`);

  // ========================================================================
  // FACILITY #3: CROWN CORK (Teresina-PI, Brazil)
  // ========================================================================
  // Equipment: Serial #30692 (1 inspection - 2017, OUTDATED)
  // Inspections: 1 record | Grade: A- (90/100 - historical)
  // Status: ⚠️ Good but INSPECTION OVERDUE (8 years since last)
  // ========================================================================
  const teresinaBranch = await prisma.companyBranch.upsert({
    where: { id: 'crown-teresina-branch' },
    update: {
      name: 'Crown Cork',
      location: 'Teresina, Piauí, Brazil',
    },
    create: {
      id: 'crown-teresina-branch',
      name: 'Crown Cork',
      isMainBranch: false,
      location: 'Teresina, Piauí, Brazil',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated branch: ${teresinaBranch.name} (Teresina-PI)`);

  return { company, arumaBranch, pontaGrossaBranch, teresinaBranch };
}

/**
 * Seed Ardagh company with ONE facility branch
 * Note: Template files only - awaiting actual inspection data
 */
export async function seedArdaghCompany(prisma: PrismaClient): Promise<ArdaghCompanyData> {
  console.log('Creating Ardagh company...');

  // Create Ardagh Group company
  const company = await prisma.company.upsert({
    where: { id: 'ardagh-company' },
    update: {
      name: 'Ardagh Group',
      slug: 'ardagh',
      brandColor: '#1a365d',
      accentColor: '#ed8936',
      description: 'Ardagh Group - Industrial press equipment (5 units, awaiting inspection data)',
    },
    create: {
      id: 'ardagh-company',
      name: 'Ardagh Group',
      slug: 'ardagh',
      brandColor: '#1a365d',
      accentColor: '#ed8936',
      description: 'Ardagh Group - Industrial press equipment (5 units, awaiting inspection data)',
    },
  });

  console.log(`✓ Created/Updated company: ${company.name} (slug: ${company.slug})`);

  // ========================================================================
  // FACILITY: ARDAGH BRAZIL (Location TBD)
  // ========================================================================
  // Equipment: 5 units (#31153, #31206, #31254, #31255, #31412)
  // Inspections: Templates only - NO measurement data yet
  // Status: ⚠️ Awaiting completed inspection forms
  // ========================================================================
  const mainBranch = await prisma.companyBranch.upsert({
    where: { id: 'ardagh-main-branch' },
    update: {
      name: 'Ardagh Brazil',
      location: 'Brazil (location to be confirmed)',
    },
    create: {
      id: 'ardagh-main-branch',
      name: 'Ardagh Brazil',
      isMainBranch: true,
      location: 'Brazil (location to be confirmed)',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated branch: ${mainBranch.name}`);

  return { company, mainBranch };
}
