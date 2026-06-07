-- CreateTable
CREATE TABLE "campus_buildings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "abbreviation" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "positionX" REAL NOT NULL DEFAULT 0,
    "positionZ" REAL NOT NULL DEFAULT 0,
    "width" REAL NOT NULL DEFAULT 2,
    "depth" REAL NOT NULL DEFAULT 2,
    "height" REAL NOT NULL DEFAULT 2,
    "department" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
