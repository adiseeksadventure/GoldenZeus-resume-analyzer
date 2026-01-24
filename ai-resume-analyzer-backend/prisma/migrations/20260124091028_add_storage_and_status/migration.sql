-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'uploaded',
ADD COLUMN     "storage" TEXT NOT NULL DEFAULT 'supabase';
