/*
  Warnings:

  - You are about to drop the column `content` on the `JobDescription` table. All the data in the column will be lost.
  - Added the required column `rawText` to the `JobDescription` table without a default value. This is not possible if the table is not empty.
  - Made the column `parsedData` on table `JobDescription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JobDescription" DROP COLUMN "content",
ADD COLUMN     "rawText" TEXT NOT NULL,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "parsedData" SET NOT NULL;
