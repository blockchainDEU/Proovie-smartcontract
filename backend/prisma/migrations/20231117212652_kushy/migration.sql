/*
  Warnings:

  - You are about to alter the column `offerPrice` on the `Offer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Added the required column `itemChainID` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentChainID` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `offerGame` on the `Offer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "itemChainID" INTEGER NOT NULL,
ADD COLUMN     "paymentChainID" INTEGER NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL,
DROP COLUMN "offerGame",
ADD COLUMN     "offerGame" INTEGER NOT NULL,
ALTER COLUMN "offerPrice" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "itemImage" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_offerGame_fkey" FOREIGN KEY ("offerGame") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
