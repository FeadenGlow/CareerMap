-- CreateEnum
CREATE TYPE "InterestType" AS ENUM ('DEV', 'MANAGEMENT', 'DATA');

-- CreateEnum
CREATE TYPE "GrowthType" AS ENUM ('VERTICAL', 'HORIZONTAL', 'ROLE_CHANGE');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "currentPositionId" TEXT,
ADD COLUMN "interests" "InterestType"[] DEFAULT ARRAY[]::"InterestType"[],
ADD COLUMN "growthType" "GrowthType";

-- CreateTable
CREATE TABLE "OnboardingProcess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "lastStep" INTEGER,
    "version" INTEGER DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProcess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProcess_userId_key" ON "OnboardingProcess"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentPositionId_fkey" FOREIGN KEY ("currentPositionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProcess" ADD CONSTRAINT "OnboardingProcess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
