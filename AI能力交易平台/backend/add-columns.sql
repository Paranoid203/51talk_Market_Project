-- 添加缺失的列到projects表
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "summary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "background" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "solution" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "features" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "estimatedImpact" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "duration" VARCHAR(100);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "requesterName" VARCHAR(100);

-- 添加ReviewStatus枚举类型（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReviewStatus') THEN
        CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- 如果reviewStatus列已存在但类型不对，需要先改类型
ALTER TABLE "projects" ALTER COLUMN "reviewStatus" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "reviewStatus" TYPE "ReviewStatus" USING "reviewStatus"::"ReviewStatus";
ALTER TABLE "projects" ALTER COLUMN "reviewStatus" SET DEFAULT 'PENDING'::"ReviewStatus";

