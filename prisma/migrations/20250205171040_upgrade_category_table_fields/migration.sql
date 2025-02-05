/*
  Warnings:

  - You are about to drop the column `categoryImg` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `categoryName` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[value]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "categories_categoryName_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "categoryImg",
DROP COLUMN "categoryName",
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "title" VARCHAR(50) NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_title_key" ON "categories"("title");

-- CreateIndex
CREATE UNIQUE INDEX "categories_value_key" ON "categories"("value");
