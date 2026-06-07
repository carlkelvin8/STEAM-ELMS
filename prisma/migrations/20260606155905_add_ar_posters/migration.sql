-- CreateTable
CREATE TABLE "ar_posters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT NOT NULL DEFAULT 'AR_POSTER',
    "config" TEXT,
    "imageUrl" TEXT,
    "lessonId" TEXT,
    "courseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ar_posters_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ar_posters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
