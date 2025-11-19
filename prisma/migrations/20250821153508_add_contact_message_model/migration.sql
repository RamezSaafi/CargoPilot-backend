-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('Nouveau', 'Lu');

-- CreateTable
CREATE TABLE "public"."ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'Nouveau',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
