const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // 检查projects表是否有background列
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'background'
    `;
    
    if (columns.length === 0) {
      console.log('❌ background列不存在，需要添加');
      // 添加background列
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "background" TEXT`
      );
      console.log('✅ 已添加background列');
    } else {
      console.log('✅ background列已存在');
    }
    
    // 检查其他字段
    const allColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name IN ('background', 'solution', 'features', 'estimatedImpact', 'actualImpact')
      ORDER BY column_name
    `;
    console.log('\n项目介绍相关字段：');
    allColumns.forEach(col => console.log(`  - ${col.column_name}`));
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();



