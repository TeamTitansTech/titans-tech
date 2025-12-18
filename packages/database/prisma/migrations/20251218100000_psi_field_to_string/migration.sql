-- AlterTable: Change psi field from OkNaDncDamageType enum to String
-- This allows free text input in addition to preset values (OK, NA, DNC, DAMAGED)
ALTER TABLE "lubrication_hydraulics_gauges" ALTER COLUMN "psi" TYPE TEXT;
