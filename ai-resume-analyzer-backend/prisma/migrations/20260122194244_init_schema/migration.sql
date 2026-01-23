-- CreateTable
CREATE TABLE "EmbeddingCache" (
    "id" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "vector" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmbeddingCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmbeddingCache_textHash_key" ON "EmbeddingCache"("textHash");
