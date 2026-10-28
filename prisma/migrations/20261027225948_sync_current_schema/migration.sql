-- CreateTable
CREATE TABLE "projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "parent_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Subscription',
    "price" INTEGER NOT NULL DEFAULT 0,
    "cycle" TEXT NOT NULL DEFAULT 'monthly',
    "next_billing" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "url" TEXT,
    "account_email" TEXT,
    "license_key" TEXT,
    "memo" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'プライム',
    "shares" INTEGER NOT NULL DEFAULT 0,
    "acquisition_price" INTEGER NOT NULL DEFAULT 0,
    "current_price" INTEGER NOT NULL DEFAULT 0,
    "dividend_per_share" REAL NOT NULL DEFAULT 0,
    "memo" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "category" TEXT DEFAULT 'その他',
    "price" INTEGER DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Wanted',
    "url" TEXT,
    "image_url" TEXT,
    "memo" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_anime" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_anime" ("content", "created_at", "display_order", "id", "title") SELECT "content", "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "anime";
DROP TABLE "anime";
ALTER TABLE "new_anime" RENAME TO "anime";
CREATE TABLE "new_author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_author" ("bio", "created_at", "display_order", "id", "name") SELECT "bio", coalesce("created_at", CURRENT_TIMESTAMP) AS "created_at", coalesce("display_order", 0) AS "display_order", "id", "name" FROM "author";
DROP TABLE "author";
ALTER TABLE "new_author" RENAME TO "author";
CREATE TABLE "new_blog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "content_html" TEXT NOT NULL,
    "eyecatch" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_blog" ("author", "content", "content_html", "content_markdown", "created_at", "display_order", "eyecatch", "id", "permalink", "persona", "site", "title") SELECT "author", "content", "content_html", "content_markdown", "created_at", coalesce("display_order", 0) AS "display_order", "eyecatch", "id", "permalink", "persona", "site", "title" FROM "blog";
DROP TABLE "blog";
ALTER TABLE "new_blog" RENAME TO "blog";
CREATE TABLE "new_book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_book" ("content", "created_at", "display_order", "id", "title") SELECT "content", "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "book";
DROP TABLE "book";
ALTER TABLE "new_book" RENAME TO "book";
CREATE TABLE "new_diary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_diary" ("content", "created_at", "display_order", "id", "title") SELECT "content", "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "diary";
DROP TABLE "diary";
ALTER TABLE "new_diary" RENAME TO "diary";
CREATE TABLE "new_expenses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "shop" TEXT NOT NULL,
    "used_by" TEXT,
    "product_name" TEXT,
    "remark" TEXT,
    "used_at" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_expenses" ("amount", "category", "created_at", "display_order", "id", "product_name", "remark", "shop", "used_at", "used_by") SELECT "amount", "category", "created_at", coalesce("display_order", 0) AS "display_order", "id", "product_name", "remark", "shop", "used_at", "used_by" FROM "expenses";
DROP TABLE "expenses";
ALTER TABLE "new_expenses" RENAME TO "expenses";
CREATE TABLE "new_movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_movie" ("content", "created_at", "display_order", "id", "title") SELECT "content", "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "movie";
DROP TABLE "movie";
ALTER TABLE "new_movie" RENAME TO "movie";
CREATE TABLE "new_music" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_music" ("content", "created_at", "display_order", "id", "title") SELECT "content", coalesce("created_at", CURRENT_TIMESTAMP) AS "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "music";
DROP TABLE "music";
ALTER TABLE "new_music" RENAME TO "music";
CREATE TABLE "new_narou" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_narou" ("content", "created_at", "display_order", "id", "title") SELECT "content", "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "narou";
DROP TABLE "narou";
ALTER TABLE "new_narou" RENAME TO "narou";
CREATE TABLE "new_password_manager" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "site_name" TEXT NOT NULL,
    "site_url" TEXT NOT NULL,
    "login_id" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "memo" TEXT,
    "category" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_password_manager" ("category", "created_at", "display_order", "email", "id", "login_id", "memo", "password", "site_name", "site_url", "updated_at") SELECT "category", "created_at", coalesce("display_order", 0) AS "display_order", "email", "id", "login_id", "memo", "password", "site_name", "site_url", "updated_at" FROM "password_manager";
DROP TABLE "password_manager";
ALTER TABLE "new_password_manager" RENAME TO "password_manager";
CREATE TABLE "new_persona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_persona" ("created_at", "description", "display_order", "id", "name") SELECT coalesce("created_at", CURRENT_TIMESTAMP) AS "created_at", "description", coalesce("display_order", 0) AS "display_order", "id", "name" FROM "persona";
DROP TABLE "persona";
ALTER TABLE "new_persona" RENAME TO "persona";
CREATE TABLE "new_schedules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "memo" TEXT,
    "google_event_id" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_schedules" ("createdAt", "display_order", "end", "google_event_id", "id", "memo", "start", "title") SELECT "createdAt", coalesce("display_order", 0) AS "display_order", "end", "google_event_id", "id", "memo", "start", "title" FROM "schedules";
DROP TABLE "schedules";
ALTER TABLE "new_schedules" RENAME TO "schedules";
CREATE TABLE "new_udemy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_udemy" ("content", "created_at", "display_order", "id", "title") SELECT "content", "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "udemy";
DROP TABLE "udemy";
ALTER TABLE "new_udemy" RENAME TO "udemy";
CREATE TABLE "new_wiki" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_wiki" ("content", "created_at", "display_order", "id", "title") SELECT "content", "created_at", coalesce("display_order", 0) AS "display_order", "id", "title" FROM "wiki";
DROP TABLE "wiki";
ALTER TABLE "new_wiki" RENAME TO "wiki";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
