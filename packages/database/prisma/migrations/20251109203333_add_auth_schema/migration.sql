-- CreateTable
CREATE TABLE "sys_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isUsingDefaultPassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sys_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "brandColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isMainBranch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isCompanyAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isCompanyManager" BOOLEAN NOT NULL DEFAULT false,
    "isUsingDefaultPassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_branches" (
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readUsers" BOOLEAN NOT NULL DEFAULT false,
    "createUsers" BOOLEAN NOT NULL DEFAULT false,
    "updateUsers" BOOLEAN NOT NULL DEFAULT false,
    "deleteUsers" BOOLEAN NOT NULL DEFAULT false,
    "manageUserPermissions" BOOLEAN NOT NULL DEFAULT false,
    "assignUsersToBranches" BOOLEAN NOT NULL DEFAULT false,
    "readBranches" BOOLEAN NOT NULL DEFAULT false,
    "updateBranches" BOOLEAN NOT NULL DEFAULT false,
    "readBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "createBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "updateBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "deleteBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "readMachines" BOOLEAN NOT NULL DEFAULT false,
    "createMachines" BOOLEAN NOT NULL DEFAULT false,
    "updateMachines" BOOLEAN NOT NULL DEFAULT false,
    "deleteMachines" BOOLEAN NOT NULL DEFAULT false,
    "readInspections" BOOLEAN NOT NULL DEFAULT false,
    "createInspections" BOOLEAN NOT NULL DEFAULT false,
    "updateInspections" BOOLEAN NOT NULL DEFAULT false,
    "deleteInspections" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_branches_pkey" PRIMARY KEY ("userId","branchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "sys_admins_email_key" ON "sys_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "company_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
