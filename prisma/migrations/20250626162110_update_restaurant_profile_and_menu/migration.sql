-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "category" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "restaurant_profiles" ADD COLUMN     "bank_account_number" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "business_registration_number" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "facebook_url" TEXT,
ADD COLUMN     "instagram_url" TEXT,
ADD COLUMN     "map_latitude" DOUBLE PRECISION,
ADD COLUMN     "map_longitude" DOUBLE PRECISION,
ADD COLUMN     "operating_hours" JSONB,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street_address" TEXT,
ADD COLUMN     "swift_code" TEXT,
ADD COLUMN     "tax_id" TEXT,
ADD COLUMN     "twitter_url" TEXT,
ADD COLUMN     "website" TEXT;
