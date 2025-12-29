-- 创建ReviewStatus枚举类型（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReviewStatus') THEN
        CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- 添加缺失的字段到projects表
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "summary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "background" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "solution" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "features" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "estimatedImpact" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "actualImpact" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "shortDescription" VARCHAR(200);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "duration" VARCHAR(100);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "requesterName" VARCHAR(100);

-- 添加reviewStatus字段（使用枚举类型）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'reviewStatus'
    ) THEN
        ALTER TABLE "projects" ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING';
    END IF;
END $$;

-- 添加索引
CREATE INDEX IF NOT EXISTS "projects_reviewStatus_idx" ON "projects"("reviewStatus");

