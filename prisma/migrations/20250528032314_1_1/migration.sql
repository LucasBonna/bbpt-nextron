-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chatId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "responseTime" REAL,
    "tokens" INTEGER,
    "model" TEXT,
    "temperature" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interaction_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interaction" ("chatId", "createdAt", "id", "model", "prompt", "response", "responseTime", "temperature", "tokens", "updatedAt") SELECT "chatId", "createdAt", "id", "model", "prompt", "response", "responseTime", "temperature", "tokens", "updatedAt" FROM "Interaction";
DROP TABLE "Interaction";
ALTER TABLE "new_Interaction" RENAME TO "Interaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
