-- Add new columns to cars table
ALTER TABLE "cars" ADD COLUMN "color" varchar(50);
ALTER TABLE "cars" ADD COLUMN "sku" varchar(20);

-- Drop old in_stock column if it exists
ALTER TABLE "cars" DROP COLUMN IF EXISTS "in_stock";

-- Add sold column (default false)
ALTER TABLE "cars" ADD COLUMN "sold" boolean DEFAULT false NOT NULL;

-- Set default values for existing rows
UPDATE "cars" SET "color" = 'Unknown' WHERE "color" IS NULL;
UPDATE "cars" SET "sku" = 'UNKNOWN0000' WHERE "sku" IS NULL;

-- Add unique constraint on sku
ALTER TABLE "cars" ADD CONSTRAINT "cars_sku_unique" UNIQUE("sku");

-- Add index on sold column
CREATE INDEX "cars_sold_idx" ON "cars" USING btree ("sold");

-- Add index on sku column
CREATE INDEX "cars_sku_idx" ON "cars" USING btree ("sku");

-- Rename old index if it exists  
DROP INDEX IF EXISTS "cars_in_stock_idx";
