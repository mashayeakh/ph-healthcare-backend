/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `medical_reports` table. All the data in the column will be lost.
  - You are about to drop the column `treatment` on the `medical_reports` table. All the data in the column will be lost.
  - Added the required column `reportLink` to the `medical_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportName` to the `medical_reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "medical_reports_appointmentId_key";

-- AlterTable
ALTER TABLE "medical_reports" DROP COLUMN "diagnosis",
DROP COLUMN "treatment",
ADD COLUMN     "reportLink" TEXT NOT NULL,
ADD COLUMN     "reportName" TEXT NOT NULL,
ALTER COLUMN "appointmentId" DROP NOT NULL;
