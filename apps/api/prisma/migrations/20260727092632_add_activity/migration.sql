-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ISSUE_CREATED', 'TITLE_CHANGED', 'DESCRIPTION_CHANGED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNEE_CHANGED', 'DUE_DATE_CHANGED', 'LABELS_CHANGED');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_issueId_createdAt_idx" ON "activities"("issueId", "createdAt");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
