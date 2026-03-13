-- AlterTable
ALTER TABLE "machine_production_lines" ADD COLUMN     "positionX" DOUBLE PRECISION,
ADD COLUMN     "positionY" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "production_lines" ADD COLUMN     "canvasShapes" JSONB DEFAULT '[]';
