/*
  Warnings:

  - You are about to drop the column `isDeleated` on the `admins` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "admins_isDeleated_idx";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "isDeleated",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "deletedAt" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "admins_isDeleted_idx" ON "admins"("isDeleted");
