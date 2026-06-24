-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN "employeeId" TEXT,
ADD COLUMN "employeeName" TEXT,
ADD COLUMN "employeeCode" TEXT,
ADD COLUMN "documentType" TEXT,
ADD COLUMN "contextLabel" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_employeeId_idx" ON "Attachment"("employeeId");

-- CreateIndex
CREATE INDEX "Attachment_employeeCode_idx" ON "Attachment"("employeeCode");

-- CreateIndex
CREATE INDEX "Attachment_category_idx" ON "Attachment"("category");
