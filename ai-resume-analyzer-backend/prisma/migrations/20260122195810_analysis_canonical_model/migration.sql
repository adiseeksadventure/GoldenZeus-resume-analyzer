/*
  Warnings:

  - You are about to drop the column `matchScore` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `matchedSkills` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `missingSkills` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `suggestions` on the `Analysis` table. All the data in the column will be lost.
  - Added the required column `analysisJson` to the `Analysis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_jobDescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_resumeId_fkey";

-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "matchScore",
DROP COLUMN "matchedSkills",
DROP COLUMN "missingSkills",
DROP COLUMN "suggestions",
ADD COLUMN     "analysisJson" JSONB NOT NULL,
ALTER COLUMN "resumeId" DROP NOT NULL,
ALTER COLUMN "jobDescriptionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
