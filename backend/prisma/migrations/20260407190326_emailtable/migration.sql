-- CreateTable
CREATE TABLE "otp_verifications" (
    "otp_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("otp_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_verifications_email_key" ON "otp_verifications"("email");

-- CreateIndex
CREATE INDEX "otp_verifications_expires_at_idx" ON "otp_verifications"("expires_at");
