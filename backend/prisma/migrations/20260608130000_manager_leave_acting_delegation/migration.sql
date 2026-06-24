-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN "actingApproverId" TEXT,
ADD COLUMN "actingAcceptedAt" TIMESTAMP(3),
ADD COLUMN "actingRejectedAt" TIMESTAMP(3),
ADD COLUMN "actingRejectReason" TEXT;

-- CreateIndex
CREATE INDEX "LeaveRequest_actingApproverId_idx" ON "LeaveRequest"("actingApproverId");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_actingApproverId_fkey" FOREIGN KEY ("actingApproverId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
