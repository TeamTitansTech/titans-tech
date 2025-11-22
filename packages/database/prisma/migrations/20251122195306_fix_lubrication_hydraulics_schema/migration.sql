-- AlterTable
ALTER TABLE "lubrication_hydraulics_gauges" DROP COLUMN "gauge",
ADD COLUMN     "gaugeSwitchIdentifier" TEXT;

-- AlterTable
ALTER TABLE "machine_service_lubrication_hydraulics" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "service_data_lubrication_hydraulics" DROP COLUMN "notes",
DROP COLUMN "oilTemperatureF",
ADD COLUMN     "oilTemperature" INTEGER,
ADD COLUMN     "oilTemperatureUnit" "TemperatureUnit" NOT NULL DEFAULT 'FAHRENHEIT';
