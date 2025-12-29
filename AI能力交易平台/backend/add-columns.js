const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumns() {
  try {
    console.log('开始添加缺失的列...');
    
    // 添加ReviewStatus枚举类型
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReviewStatus') THEN
              CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
          END IF;
      END $$;
    `);
    console.log('✓ ReviewStatus枚举已创建');
    
    // 添加列
    await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "summary" TEXT NOT NULL DEFAULT ''`);
    console.log('✓ 添加summary列');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "background" TEXT`);
    console.log('✓ 添加background列');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "solution" TEXT`);
    console.log('✓ 添加solution列');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "features" TEXT`);
    console.log('✓ 添加features列');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "estimatedImpact" TEXT`);
    console.log('✓ 添加estimatedImpact列');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "duration" VARCHAR(100)`);
    console.log('✓ 添加duration列');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "requesterName" VARCHAR(100)`);
    console.log('✓ 添加requesterName列');
    
    // 检查reviewStatus列是否存在
    const reviewStatusExists = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'reviewStatus'
    `);
    
    if (reviewStatusExists.length === 0) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "projects" ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING'::"ReviewStatus"`);
      console.log('✓ 添加reviewStatus列');
    } else {
      console.log('✓ reviewStatus列已存在');
    }
    
    console.log('\n✅ 所有列添加完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addColumns().catch(console.error);

