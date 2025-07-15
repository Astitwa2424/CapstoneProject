/*
  Warnings:

  - You are about to drop the column `delivery_address` on the `customer_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `payment_methods` on the `customer_profiles` table. All the data in the column will be lost.
  - The `vehicle_type` column on the `driver_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `swift_code` on the `restaurant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `twitter_url` on the `restaurant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `modifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "modifications" DROP CONSTRAINT "modifications_menu_item_id_fkey";

-- AlterTable
ALTER TABLE "customer_profiles" DROP COLUMN "delivery_address",
DROP COLUMN "payment_methods",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "driver_profiles" DROP COLUMN "vehicle_type",
ADD COLUMN     "vehicle_type" TEXT;

-- AlterTable
ALTER TABLE "restaurant_profiles" DROP COLUMN "swift_code",
DROP COLUMN "twitter_url",
ALTER COLUMN "cuisine" SET DATA TYPE TEXT,
ALTER COLUMN "operating_hours" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "phone",
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "modifications";

-- DropEnum
DROP TYPE "VehicleType";

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customer_profile_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION,
    "deliveryFee" DOUBLE PRECISION,
    "serviceFee" DOUBLE PRECISION,
    "deliveryAddress" TEXT,
    "specialInstructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "customer_profile_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "card_holder" TEXT NOT NULL,
    "expiry_month" TEXT NOT NULL,
    "expiry_year" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_profile_id_fkey" FOREIGN KEY ("customer_profile_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_customer_profile_id_fkey" FOREIGN KEY ("customer_profile_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
