const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const columns = await prisma.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'projects' 
    ORDER BY ordinal_position
  `;
  console.log('Projects table columns:');
  columns.forEach(c => console.log('  -', c.column_name));
  await prisma.$disconnect();
})();

