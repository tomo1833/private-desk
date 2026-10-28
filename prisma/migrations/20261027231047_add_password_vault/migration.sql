-- CreateTable
CREATE TABLE "password_vault" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "salt" TEXT NOT NULL,
    "verifier" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
