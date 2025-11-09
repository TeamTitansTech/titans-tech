import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { DEFAULT_SYS_ADMIN_EMAIL, DEFAULT_SYS_ADMIN_PASSWORD } from '../constants';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const createSysAdmin = async () => {
  const email = DEFAULT_SYS_ADMIN_EMAIL;
  const password = await bcrypt.hash(DEFAULT_SYS_ADMIN_PASSWORD, 10);

  await prisma.sysAdmin.create({
    data: {
      email,
      password,
    },
  });

  console.log(`Sys admin created with email: ${email} and password: ${DEFAULT_SYS_ADMIN_PASSWORD}`);
};

createSysAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
