import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash the default password
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  console.log(`Created/Updated admin user with id: ${adminUser.id}`);

  // Create "ALL" permission for admin user
  const permission = await prisma.userPermission.upsert({
    where: {
      id: 'default-admin-permission',
    },
    update: {},
    create: {
      id: 'default-admin-permission',
      userId: adminUser.id,
      permission: 'ALL',
    },
  });

  console.log(`Created/Updated permission for admin user: ${permission.id}`);

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
