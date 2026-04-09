-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('food', 'travel', 'study_spot', 'service', 'entertainment', 'shopping', 'health_and_fitness', 'other');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('upvote', 'downvote');

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "recommendation_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "price_range" INTEGER,
    "safety_description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "rating_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "price_rating" INTEGER NOT NULL,
    "quality_rating" INTEGER NOT NULL,
    "safety_rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "comment_text" TEXT NOT NULL,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "votes" (
    "vote_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("vote_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "recommendations_created_by_idx" ON "recommendations"("created_by");

-- CreateIndex
CREATE INDEX "recommendations_type_idx" ON "recommendations"("type");

-- CreateIndex
CREATE INDEX "ratings_recommendation_id_idx" ON "ratings"("recommendation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_user_id_recommendation_id_key" ON "ratings"("user_id", "recommendation_id");

-- CreateIndex
CREATE INDEX "comments_recommendation_id_idx" ON "comments"("recommendation_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "votes_recommendation_id_idx" ON "votes"("recommendation_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_recommendation_id_key" ON "votes"("user_id", "recommendation_id");

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("recommendation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("recommendation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("recommendation_id") ON DELETE CASCADE ON UPDATE CASCADE;
