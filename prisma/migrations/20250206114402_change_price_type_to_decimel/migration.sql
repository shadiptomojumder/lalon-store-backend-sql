-- AlterTable
ALTER TABLE "products" ALTER COLUMN "price" SET DEFAULT 0.00,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "finalPrice" SET DEFAULT 0.00,
ALTER COLUMN "finalPrice" SET DATA TYPE DECIMAL(65,30);
