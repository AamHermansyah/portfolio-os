/*
  Warnings:

  - You are about to drop the column `hairColor` on the `Testimonial` table. All the data in the column will be lost.
  - You are about to drop the column `shirtColor` on the `Testimonial` table. All the data in the column will be lost.
  - You are about to drop the column `skinColor` on the `Testimonial` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Testimonial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN "hairColor",
DROP COLUMN "shirtColor",
DROP COLUMN "skinColor",
ADD COLUMN     "imageUrl" TEXT NOT NULL;
