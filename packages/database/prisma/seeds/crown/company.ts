import { PrismaClient } from '../../../generated/prisma/client';

export async function seedCrownCompany(prisma: PrismaClient) {
  console.log('Creating Crown company...');

  // Create Crown company (upsert by id to allow slug changes)
  // Note: slug is just 'crown', accessed via crown.localhost:3000
  const company = await prisma.company.upsert({
    where: { id: 'crown-company' },
    update: {
      slug: 'crown',
      logo: 'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/pMjnBuUyhJ1HR0vwQzbKD-1764422902020.png',
      loginLogo:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/logos/Euf6hz3Re_dVatp_cAPQe-1764423186513.png',
      brandColor: '#1e6b3a',
      accentColor: '#b8985b',
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
      description: 'Industrial press equipment manufacturer',
    },
  });

  console.log(`✓ Created/Updated company: ${company.name} (slug: ${company.slug})`);

  // Create main branch - Planta Estância
  const mainBranch = await prisma.companyBranch.upsert({
    where: { id: 'crown-main-branch' },
    update: {},
    create: {
      id: 'crown-main-branch',
      name: 'Planta Estância',
      isMainBranch: true,
      location: 'Rodovia Br 101 S/N Km 133, Distrito De Grotao, Estância, SE 49200-000, Brazil',
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated main branch: ${mainBranch.name}`);

  return { company, mainBranch };
}
