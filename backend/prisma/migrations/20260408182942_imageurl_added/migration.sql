-- AlterTable
ALTER TABLE "recommendations" ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
