-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_method_id" TEXT,
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
