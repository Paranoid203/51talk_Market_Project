-- AlterTable
ALTER TABLE "project_replications" ADD COLUMN IF NOT EXISTS "applicantName" VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "department" VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "email" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "teamSize" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "urgency" VARCHAR(20) NOT NULL DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS "targetLaunchDate" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "businessScenario" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "expectedGoals" TEXT,
ADD COLUMN IF NOT EXISTS "budgetRange" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "additionalNeeds" TEXT,
ADD COLUMN IF NOT EXISTS "aiAnalysis" TEXT,
ADD COLUMN IF NOT EXISTS "aiAnalysisAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "project_replications_status_idx" ON "project_replications"("status");
CREATE INDEX IF NOT EXISTS "project_replications_appliedAt_idx" ON "project_replications"("appliedAt");

