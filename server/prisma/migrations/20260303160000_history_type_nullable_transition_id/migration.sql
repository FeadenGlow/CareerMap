-- CreateEnum
CREATE TYPE "TransitionHistoryType" AS ENUM ('VERTICAL', 'HORIZONTAL', 'CHANGE', 'UNKNOWN');

-- AlterTable: add transitionId column
ALTER TABLE "UserTransitionHistory" ADD COLUMN "transitionId" TEXT;

-- AlterTable: make fromPositionId nullable
ALTER TABLE "UserTransitionHistory" ALTER COLUMN "fromPositionId" DROP NOT NULL;

-- Migrate transitionType: add new enum column, copy data, drop old column
ALTER TABLE "UserTransitionHistory" ADD COLUMN "transitionTypeNew" "TransitionHistoryType";

UPDATE "UserTransitionHistory" SET "transitionTypeNew" = CASE
  WHEN "transitionType"::text = 'VERTICAL' THEN 'VERTICAL'::"TransitionHistoryType"
  WHEN "transitionType"::text = 'HORIZONTAL' THEN 'HORIZONTAL'::"TransitionHistoryType"
  WHEN "transitionType"::text = 'CHANGE' THEN 'CHANGE'::"TransitionHistoryType"
  ELSE 'UNKNOWN'::"TransitionHistoryType"
END;

ALTER TABLE "UserTransitionHistory" DROP COLUMN "transitionType";
ALTER TABLE "UserTransitionHistory" RENAME COLUMN "transitionTypeNew" TO "transitionType";

-- CreateIndex
CREATE INDEX "UserTransitionHistory_fromPositionId_idx" ON "UserTransitionHistory"("fromPositionId");

-- CreateIndex
CREATE INDEX "UserTransitionHistory_toPositionId_idx" ON "UserTransitionHistory"("toPositionId");

-- AddForeignKey
ALTER TABLE "UserTransitionHistory" ADD CONSTRAINT "UserTransitionHistory_transitionId_fkey" FOREIGN KEY ("transitionId") REFERENCES "Transition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
