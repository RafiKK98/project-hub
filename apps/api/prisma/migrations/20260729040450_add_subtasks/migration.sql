-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'PARENT_CHANGED';

-- AlterTable
ALTER TABLE "issues" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "issues_parentId_idx" ON "issues"("parentId");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
