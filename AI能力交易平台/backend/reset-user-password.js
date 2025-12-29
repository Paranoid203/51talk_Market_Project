const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'guhongji@51talk.com';
    const newPassword = '123456';
    
    console.log(`🔑 重置用户密码: ${email}\n`);
    
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, department: true }
    });
    
    if (!user) {
      console.log('❌ 用户不存在');
      return;
    }
    
    console.log('✅ 找到用户:');
    console.log('  ID:', user.id);
    console.log('  姓名:', user.name);
    console.log('  部门:', user.department);
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('\n✅ 密码已重置为:', newPassword);
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();





