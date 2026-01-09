-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "contractMaxBranches" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "contractMaxMachines" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "contractMaxProductionLines" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "contractMaxUsers" INTEGER NOT NULL DEFAULT 25;
