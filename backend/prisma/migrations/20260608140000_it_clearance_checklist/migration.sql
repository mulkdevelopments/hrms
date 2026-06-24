-- CreateTable
CREATE TABLE "ClearanceChecklistItem" (
    "id" TEXT NOT NULL,
    "clearanceTaskId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClearanceChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClearanceChecklistItem_clearanceTaskId_idx" ON "ClearanceChecklistItem"("clearanceTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceChecklistItem_clearanceTaskId_itemKey_key" ON "ClearanceChecklistItem"("clearanceTaskId", "itemKey");

-- AddForeignKey
ALTER TABLE "ClearanceChecklistItem" ADD CONSTRAINT "ClearanceChecklistItem_clearanceTaskId_fkey" FOREIGN KEY ("clearanceTaskId") REFERENCES "ClearanceTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
