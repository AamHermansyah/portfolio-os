-- CreateEnum
CREATE TYPE "CredentialKind" AS ENUM ('certificate', 'award');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "tokenVersion" INTEGER NOT NULL DEFAULT 1,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLoginAttempt" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "kind" "CredentialKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "issuedOn" DATE,
    "notes" TEXT[],
    "verifyUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "authors" TEXT[],
    "doi" TEXT,
    "url" TEXT,
    "publishedOn" DATE,
    "dateLabel" TEXT NOT NULL,
    "abstract" TEXT,
    "notes" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "dateLabel" TEXT NOT NULL,
    "notes" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "field" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "dateLabel" TEXT NOT NULL,
    "notes" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_ipHash_createdAt_idx" ON "AdminLoginAttempt"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_createdAt_idx" ON "AdminLoginAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_slug_key" ON "Credential"("slug");

-- CreateIndex
CREATE INDEX "Credential_published_kind_sortIndex_idx" ON "Credential"("published", "kind", "sortIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_slug_key" ON "Publication"("slug");

-- CreateIndex
CREATE INDEX "Publication_published_sortIndex_idx" ON "Publication"("published", "sortIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_slug_key" ON "Experience"("slug");

-- CreateIndex
CREATE INDEX "Experience_published_sortIndex_idx" ON "Experience"("published", "sortIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Education_slug_key" ON "Education"("slug");

-- CreateIndex
CREATE INDEX "Education_published_sortIndex_idx" ON "Education"("published", "sortIndex");
