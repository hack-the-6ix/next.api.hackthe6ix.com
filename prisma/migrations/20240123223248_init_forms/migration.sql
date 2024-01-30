-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "live" BOOLEAN NOT NULL DEFAULT false,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextQuestion" (
    "questionId" TEXT NOT NULL,
    "defaultValue" TEXT,
    "minLength" INTEGER,
    "maxLength" INTEGER,
    "regex" TEXT
);

-- CreateTable
CREATE TABLE "NumberQuestion" (
    "questionId" TEXT NOT NULL,
    "defaultValue" INTEGER,
    "minValue" INTEGER,
    "maxValue" INTEGER,
    "precision" INTEGER DEFAULT 0
);

-- CreateTable
CREATE TABLE "BooleanQuestion" (
    "questionId" TEXT NOT NULL,
    "defaultValue" BOOLEAN
);

-- CreateIndex
CREATE UNIQUE INDEX "TextQuestion_questionId_key" ON "TextQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberQuestion_questionId_key" ON "NumberQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "BooleanQuestion_questionId_key" ON "BooleanQuestion"("questionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextQuestion" ADD CONSTRAINT "TextQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberQuestion" ADD CONSTRAINT "NumberQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BooleanQuestion" ADD CONSTRAINT "BooleanQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
