-- CreateEnum
CREATE TYPE "CareerScenarioType" AS ENUM ('FAST_GROWTH', 'EXPERT_PATH', 'MANAGER_PATH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "activeScenario" "CareerScenarioType" NOT NULL DEFAULT 'FAST_GROWTH';
