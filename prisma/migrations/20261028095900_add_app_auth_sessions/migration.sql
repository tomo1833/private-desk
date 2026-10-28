CREATE TABLE "app_auth_sessions" (
    "token_hash" TEXT NOT NULL PRIMARY KEY,
    "expires_at" BIGINT NOT NULL
);

CREATE INDEX "app_auth_sessions_expires_at_idx" ON "app_auth_sessions"("expires_at");
