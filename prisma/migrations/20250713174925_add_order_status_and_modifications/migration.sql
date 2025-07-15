/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payment_methods" ALTER COLUMN "expiry_month" DROP NOT NULL,
ALTER COLUMN "expiry_year" DROP NOT NULL;

-- CreateTable
CREATE TABLE "modifications" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "modifications" ADD CONSTRAINT "modifications_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
