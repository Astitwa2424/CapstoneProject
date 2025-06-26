/*
  Warnings:

  - The `payment_methods` column on the `customer_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `address` on the `restaurant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `restaurant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `cuisine` on the `restaurant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `min_order` on the `restaurant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `restaurant_profiles` table. All the data in the column will be lost.
  - You are about to drop the `modifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `verificationtokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterEnum
ALTER TYPE "VehicleType" ADD VALUE 'MOTORCYCLE';

-- DropForeignKey
ALTER TABLE "modifications" DROP CONSTRAINT "modifications_menu_item_id_fkey";

-- AlterTable
ALTER TABLE "customer_profiles" DROP COLUMN "payment_methods",
ADD COLUMN     "payment_methods" JSONB;

-- AlterTable
ALTER TABLE "driver_profiles" ADD COLUMN     "currentLocation" JSONB,
ALTER COLUMN "license_number" DROP NOT NULL,
ALTER COLUMN "vehicle_type" DROP NOT NULL,
ALTER COLUMN "vehicle_model" DROP NOT NULL,
ALTER COLUMN "plate_number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "restaurant_profiles" DROP COLUMN "address",
DROP COLUMN "category",
DROP COLUMN "cuisine",
DROP COLUMN "min_order",
DROP COLUMN "state",
ADD COLUMN     "banner_image" TEXT,
ADD COLUMN     "cuisineType" TEXT[],
ADD COLUMN     "estimatedDeliveryTime" TEXT,
ADD COLUMN     "logo_image" TEXT,
ADD COLUMN     "map_location_address" TEXT,
ADD COLUMN     "min_order_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "restaurant_category" TEXT,
ADD COLUMN     "state_or_province" TEXT,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "is_open" SET DEFAULT true;

-- DropTable
DROP TABLE "modifications";

-- CreateTable
CREATE TABLE "driver_documents" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "driver_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_documents" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "restaurant_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_modifications" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_modifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- AddForeignKey
ALTER TABLE "driver_documents" ADD CONSTRAINT "driver_documents_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_documents" ADD CONSTRAINT "restaurant_documents_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_modifications" ADD CONSTRAINT "menu_item_modifications_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
