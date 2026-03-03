-- CreateEnum
CREATE TYPE "TransitionHistorySource" AS ENUM ('SYSTEM', 'HR', 'USER');

-- CreateTable
CREATE TABLE "UserTransitionHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromPositionId" TEXT NOT NULL,
    "toPositionId" TEXT NOT NULL,
    "source" "TransitionHistorySource" NOT NULL,
    "actorUserId" TEXT,
    "transitionType" "TransitionType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTransitionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTransitionHistory_userId_idx" ON "UserTransitionHistory"("userId");

-- CreateIndex
CREATE INDEX "UserTransitionHistory_userId_createdAt_idx" ON "UserTransitionHistory"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserTransitionHistory" ADD CONSTRAINT "UserTransitionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTransitionHistory" ADD CONSTRAINT "UserTransitionHistory_fromPositionId_fkey" FOREIGN KEY ("fromPositionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTransitionHistory" ADD CONSTRAINT "UserTransitionHistory_toPositionId_fkey" FOREIGN KEY ("toPositionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
