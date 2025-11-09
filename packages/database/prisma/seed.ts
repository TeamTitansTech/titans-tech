import { PrismaClient, InspectionSection } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // // Hash the default password
  // const hashedPassword = await bcrypt.hash('password', 10);

  // // Create default admin user
  // const adminUser = await prisma.user.upsert({
  //   where: { email: 'admin@admin.com' },
  //   update: {},
  //   create: {
  //     email: 'admin@admin.com',
  //     password: hashedPassword,
  //     name: 'Admin User',
  //     role: UserRole.ADMIN,
  //   },
  // });

  // console.log(`Created/Updated admin user with id: ${adminUser.id}`);

  // // Create "ALL" permission for admin user
  // const permission = await prisma.userPermission.upsert({
  //   where: {
  //     id: 'default-admin-permission',
  //   },
  //   update: {},
  //   create: {
  //     id: 'default-admin-permission',
  //     userId: adminUser.id,
  //     permission: 'ALL',
  //   },
  // });

  // console.log(`Created/Updated permission for admin user: ${permission.id}`);

  // Create example blueprint for bearing clearance inspection
  const blueprint = await prisma.blueprint.upsert({
    where: { id: 'default-bearing-clearance-blueprint' },
    update: {},
    create: {
      id: 'default-bearing-clearance-blueprint',
      name: 'Standard Bearing Clearance Inspection',
      sections: [InspectionSection.BEARING_CLEARANCE],
      fields: [
        {
          fieldName: 'Serial Number',
          fieldSlug: 'serial_number',
          fieldType: 'string',
        },
        {
          fieldName: 'Model Year',
          fieldSlug: 'model_year',
          fieldType: 'int',
        },
        {
          fieldName: 'Machine Type',
          fieldSlug: 'machine_type',
          fieldType: 'enum',
          fieldOptions: ['Type A', 'Type B', 'Type C'],
        },
      ],
    },
  });

  console.log(`Created/Updated blueprint with id: ${blueprint.id}`);

  // Create example companies
  const company1 = await prisma.company.upsert({
    where: { slug: 'acme-corporation' },
    update: {},
    create: {
      name: 'ACME Corporation',
      slug: 'acme-corporation',
      brandColor: '#3B82F6',
    },
  });

  const company2 = await prisma.company.upsert({
    where: { slug: 'tech-industries' },
    update: {},
    create: {
      name: 'Tech Industries',
      slug: 'tech-industries',
      brandColor: '#10B981',
    },
  });

  const company3 = await prisma.company.upsert({
    where: { slug: 'global-manufacturing' },
    update: {},
    create: {
      name: 'Global Manufacturing',
      slug: 'global-manufacturing',
      brandColor: '#F59E0B',
    },
  });

  console.log(`Created/Updated companies:`);
  console.log(`  - ${company1.name} (${company1.slug})`);
  console.log(`  - ${company2.name} (${company2.slug})`);
  console.log(`  - ${company3.name} (${company3.slug})`);

  // Create branches for each company
  await prisma.companyBranch.upsert({
    where: { id: 'acme-main-branch' },
    update: {},
    create: {
      id: 'acme-main-branch',
      name: 'Main Office',
      isMainBranch: true,
      companyId: company1.id,
    },
  });

  await prisma.companyBranch.upsert({
    where: { id: 'acme-west-branch' },
    update: {},
    create: {
      id: 'acme-west-branch',
      name: 'West Coast Branch',
      isMainBranch: false,
      companyId: company1.id,
    },
  });

  await prisma.companyBranch.upsert({
    where: { id: 'tech-main-branch' },
    update: {},
    create: {
      id: 'tech-main-branch',
      name: 'Headquarters',
      isMainBranch: true,
      companyId: company2.id,
    },
  });

  await prisma.companyBranch.upsert({
    where: { id: 'global-main-branch' },
    update: {},
    create: {
      id: 'global-main-branch',
      name: 'Main Factory',
      isMainBranch: true,
      companyId: company3.id,
    },
  });

  await prisma.companyBranch.upsert({
    where: { id: 'global-north-branch' },
    update: {},
    create: {
      id: 'global-north-branch',
      name: 'North Plant',
      isMainBranch: false,
      companyId: company3.id,
    },
  });

  await prisma.companyBranch.upsert({
    where: { id: 'global-south-branch' },
    update: {},
    create: {
      id: 'global-south-branch',
      name: 'South Plant',
      isMainBranch: false,
      companyId: company3.id,
    },
  });

  console.log(`Created/Updated company branches:`);
  console.log(`  - ACME Corporation: 2 branches`);
  console.log(`  - Tech Industries: 1 branch`);
  console.log(`  - Global Manufacturing: 3 branches`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
