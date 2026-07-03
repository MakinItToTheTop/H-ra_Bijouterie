-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT 'Contact',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nouveau',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);
