const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function fix() {
  console.log('Starting...');
  
  try {
    // 测试连接
    await prisma.$connect();
    console.log('✓ Connected to database');
    
    // 添加summary列
    console.log('Adding summary column...');
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "summary" TEXT NOT NULL DEFAULT ''`
    );
    console.log('✓ Added summary');
    
    // 添加background列
    console.log('Adding background column...');
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "background" TEXT`
    );
    console.log('✓ Added background');
    
    // 添加duration列
    console.log('Adding duration column...');
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "duration" VARCHAR(100)`
    );
    console.log('✓ Added duration');
    
    console.log('\n✅ All columns added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected');
  }
}

fix();

