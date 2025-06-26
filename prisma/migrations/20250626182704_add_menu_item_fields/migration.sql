-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "is_gluten_free" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_vegan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_vegetarian" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spicy_level" INTEGER NOT NULL DEFAULT 0;
