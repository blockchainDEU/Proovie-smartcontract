-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offerUser" VARCHAR(255) NOT NULL,
    "offerGame" VARCHAR(255) NOT NULL,
    "offerPrice" DECIMAL(65,30) NOT NULL,
    "offerType" "OfferType" NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);
