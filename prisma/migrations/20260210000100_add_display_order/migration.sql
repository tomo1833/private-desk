-- Add nullable columns first (safe for large tables)
ALTER TABLE "password_manager" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "wiki" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "diary" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "anime" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "book" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "movie" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "narou" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "udemy" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "music" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "blog" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "author" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "author" ADD COLUMN "created_at" DATETIME;
ALTER TABLE "persona" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "persona" ADD COLUMN "created_at" DATETIME;
ALTER TABLE "schedules" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "expenses" ADD COLUMN "display_order" INTEGER;

-- Populate existing rows with default values
UPDATE "password_manager" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "wiki" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "diary" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "anime" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "book" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "movie" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "narou" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "udemy" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "music" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "blog" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "author" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "author" SET "created_at" = datetime('now') WHERE "created_at" IS NULL;
UPDATE "persona" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "persona" SET "created_at" = datetime('now') WHERE "created_at" IS NULL;
UPDATE "schedules" SET "display_order" = 0 WHERE "display_order" IS NULL;
UPDATE "expenses" SET "display_order" = 0 WHERE "display_order" IS NULL;
