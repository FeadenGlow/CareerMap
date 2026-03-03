/*
  Warnings:

  - Added the required column `updatedAt` to the `UserSkill` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "UserSkill" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "UserDevelopmentGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetPositionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDevelopmentGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDevelopmentGoal_userId_key" ON "UserDevelopmentGoal"("userId");

-- CreateIndex
CREATE INDEX "UserSkill_userId_idx" ON "UserSkill"("userId");

-- AddForeignKey
ALTER TABLE "UserDevelopmentGoal" ADD CONSTRAINT "UserDevelopmentGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevelopmentGoal" ADD CONSTRAINT "UserDevelopmentGoal_targetPositionId_fkey" FOREIGN KEY ("targetPositionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
