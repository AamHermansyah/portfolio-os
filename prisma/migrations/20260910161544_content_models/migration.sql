-- CreateEnum
CREATE TYPE "InquiryKind" AS ENUM ('inquiry', 'message');

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "failing" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT[],
    "stack" TEXT[],
    "demoUrl" TEXT,
    "repoUrl" TEXT,
    "requirements" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "dateShort" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "skinColor" TEXT NOT NULL,
    "hairColor" TEXT NOT NULL,
    "shirtColor" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerEntry" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangelogEntry" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangelogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "kind" "InquiryKind" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "engagement" TEXT,
    "projectType" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveryError" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_published_sortIndex_idx" ON "Skill"("published", "sortIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_sortIndex_idx" ON "Project"("published", "sortIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_slug_key" ON "Testimonial"("slug");

-- CreateIndex
CREATE INDEX "Testimonial_published_sortIndex_idx" ON "Testimonial"("published", "sortIndex");

-- CreateIndex
CREATE INDEX "CareerEntry_published_year_sortIndex_idx" ON "CareerEntry"("published", "year", "sortIndex");

-- CreateIndex
CREATE INDEX "ChangelogEntry_published_year_sortIndex_idx" ON "ChangelogEntry"("published", "year", "sortIndex");

-- CreateIndex
CREATE INDEX "Inquiry_kind_createdAt_idx" ON "Inquiry"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");
