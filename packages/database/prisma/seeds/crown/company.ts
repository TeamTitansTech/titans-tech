import { PrismaClient, Company, CompanyBranch } from '../../../generated/prisma/client';

// ============================================================================
// COMPANY DATA FROM: MINSTER PRESS EQUIPMENT INSPECTION DATABASE
// ============================================================================
// Service Provider: Minster (240 West Fifth St, Minster, OH 45865, USA)
// Technician: Julio De Souza
// Service Center: USA
// Region: Brazil
//
// CUSTOMERS:
// 1. Crown Cork & Seal - Ponta Grossa, Brazil (Equipment: #30634, #30935)
// 2. Aruma Produtora De Embalagens - Estância, Brazil (Equipment: #30530, #30645)
// ============================================================================

export interface CompanyData {
  company: Company;
  mainBranch: CompanyBranch;
}

export async function seedCrownCompany(prisma: PrismaClient): Promise<CompanyData> {
  console.log('Creating Crown Cork company...');

  // Create Crown Cork & Seal company
  // Location: Ponta Grossa, Brazil
  // Equipment: Serial #30634, #30935
  const company = await prisma.company.upsert({
    where: { id: 'crown-company' },
    update: {
      name: 'Crown Cork',
      slug: 'crown',
      logo: 'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/pMjnBuUyhJ1HR0vwQzbKD-1764422902020.png',
      loginLogo:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/Euf6hz3Re_dVatp_cAPQe-1764423186513.png',
      brandColor: '#1e6b3a',
      accentColor: '#b8985b',
      description: 'Crown Cork & Seal - Industrial press equipment',
    },
    create: {
      id: 'crown-company',
      name: 'Crown Cork',
      slug: 'crown',
      logo: 'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/pMjnBuUyhJ1HR0vwQzbKD-1764422902020.png',
      loginLogo:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/Euf6hz3Re_dVatp_cAPQe-1764423186513.png',
      brandColor: '#1e6b3a',
      accentColor: '#b8985b',
      description: 'Crown Cork & Seal - Industrial press equipment',
    },
  });

  console.log(`✓ Created/Updated company: ${company.name} (slug: ${company.slug})`);

  // Create main branch - Ponta Grossa, Brazil (correct location for Crown Cork)
  const mainBranch = await prisma.companyBranch.upsert({
    where: { id: 'crown-main-branch' },
    update: {
      name: 'Ponta Grossa Plant',
      location: 'Ponta Grossa, Paraná, Brazil',
    },
    create: {
      id: 'crown-main-branch',
      name: 'Ponta Grossa Plant',
      isMainBranch: true,
      location: 'Ponta Grossa, Paraná, Brazil',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated main branch: ${mainBranch.name}`);

  return { company, mainBranch };
}

export async function seedArumaCompany(prisma: PrismaClient): Promise<CompanyData> {
  console.log('Creating Aruma company...');

  // Create Aruma Produtora De Embalagens company
  // Location: Distrito De Grotao, Estância, SE 49200-000, Brazil
  // Equipment: Serial #30530, #30645
  const company = await prisma.company.upsert({
    where: { id: 'aruma-company' },
    update: {
      name: 'Aruma Produtora De Embalagens',
      slug: 'aruma',
      brandColor: '#2563eb',
      accentColor: '#f59e0b',
      description: 'Aruma Produtora De Embalagens - Industrial packaging manufacturer',
    },
    create: {
      id: 'aruma-company',
      name: 'Aruma Produtora De Embalagens',
      slug: 'aruma',
      brandColor: '#2563eb',
      accentColor: '#f59e0b',
      description: 'Aruma Produtora De Embalagens - Industrial packaging manufacturer',
    },
  });

  console.log(`✓ Created/Updated company: ${company.name} (slug: ${company.slug})`);

  // Create main branch - Estância, Brazil
  const mainBranch = await prisma.companyBranch.upsert({
    where: { id: 'aruma-main-branch' },
    update: {
      name: 'Planta Estância',
      location: 'Rodovia Br 101 S/N Km 133, Distrito De Grotao, Estância, SE 49200-000, Brazil',
    },
    create: {
      id: 'aruma-main-branch',
      name: 'Planta Estância',
      isMainBranch: true,
      location: 'Rodovia Br 101 S/N Km 133, Distrito De Grotao, Estância, SE 49200-000, Brazil',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated main branch: ${mainBranch.name}`);

  return { company, mainBranch };
}
