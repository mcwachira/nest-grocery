-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_catetgoryId_fkey";

-- DropIndex
DROP INDEX "products_catetgoryId_idx";

-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "label" DROP NOT NULL,
ALTER COLUMN "line2" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "catetgoryId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentReference_key" ON "orders"("paymentReference");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

