-- AlterTable
ALTER TABLE "sys_admins" ADD COLUMN "ephemeralTokenId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "ephemeralTokenId" TEXT;

-- DropTable
DROP TABLE "password_reset_tokens";

-- DropEnum
DROP TYPE "TokenType";
