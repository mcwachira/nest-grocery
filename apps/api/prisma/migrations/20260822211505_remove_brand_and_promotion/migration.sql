/*
  Warnings:

  - You are about to drop the column `brandId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `brands` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promotions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_brandId_fkey";

-- DropForeignKey
ALTER TABLE "promotions" DROP CONSTRAINT "promotions_targetCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "promotions" DROP CONSTRAINT "promotions_targetProductId_fkey";

-- DropIndex
DROP INDEX "products_brandId_idx";

-- NOTE: Prisma's migration diff spuriously included "DROP INDEX
-- products_search_vector_idx" here — a known quirk where Unsupported-typed
-- columns (searchVector: tsvector, see 20260822192515_add_product_search_vector)
-- get re-evaluated when other columns on the same table change, even though
-- nothing about this migration touches search. Deliberately removed from
-- this migration; the GIN index stays exactly as it was. See
-- database/migrations.md.

-- AlterTable
ALTER TABLE "products" DROP COLUMN "brandId";

-- DropTable
DROP TABLE "brands";

-- DropTable
DROP TABLE "promotions";

-- DropEnum
DROP TYPE "PromotionType";
