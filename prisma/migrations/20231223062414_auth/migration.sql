-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BasicAuth" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GoogleAuth" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reference" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BasicAuth_userId_key" ON "BasicAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BasicAuth_email_key" ON "BasicAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAuth_userId_key" ON "GoogleAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAuth_email_key" ON "GoogleAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAuth_reference_key" ON "GoogleAuth"("reference");

-- AddForeignKey
ALTER TABLE "BasicAuth" ADD CONSTRAINT "BasicAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAuth" ADD CONSTRAINT "GoogleAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
