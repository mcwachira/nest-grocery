-- Full-text search column for products — see docs/modules/search.md.
-- Hand-written (not Prisma-generated): tsvector is an `Unsupported` type
-- in schema.prisma, so `prisma migrate dev` never scaffolds DDL for it.

-- AlterTable
ALTER TABLE "products" ADD COLUMN "searchVector" tsvector;

-- Weight product name higher than description ('A' > 'B') — a search
-- for "kale" should rank a product literally named "Kale" above one that
-- merely mentions kale once in a long description.
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."description", '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Fires on both INSERT and UPDATE OF name/description — keeps the
-- column in sync automatically; application code never writes to
-- "searchVector" directly (Prisma's client doesn't even expose it,
-- since it's an Unsupported field type).
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "name", "description" ON "products"
  FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

-- Backfill existing rows — the trigger only fires on future writes.
UPDATE "products" SET "name" = "name";

-- GIN index — what actually makes `@@ "search term"` queries fast
-- instead of a sequential scan.
CREATE INDEX "products_search_vector_idx" ON "products" USING GIN ("searchVector");
