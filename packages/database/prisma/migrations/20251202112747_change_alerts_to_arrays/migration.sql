-- DropIndex: Remove UNIQUE constraints to allow multiple alerts per service (array relationship)
-- This was already done in migration 20251202132226 for other alert tables
-- Now we ensure AlertPistons also has the index instead of unique constraint

DROP INDEX IF EXISTS "alert_pistons_machineServiceId_key";

-- CreateIndex: Add index for better query performance on AlertPistons
CREATE INDEX IF NOT EXISTS "alert_pistons_machineServiceId_idx" ON "alert_pistons"("machineServiceId");
