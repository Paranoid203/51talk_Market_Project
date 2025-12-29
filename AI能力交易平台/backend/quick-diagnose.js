const axios = require('axios');

async function diagnose() {
  console.log('🔍 快速诊断部署申请功能...\n');
  
  try {
    // 1. 检查后端服务是否运行
    console.log('1️⃣ 检查后端服务...');
    const healthCheck = await axios.get('http://localhost:3000/');
    console.log('✅ 后端服务正在运行\n');
    
    // 2. 登录获取token
    console.log('2️⃣ 登录获取token...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'guhongji@51talk.com',
      password: '123456'
    });
    const token = loginResponse.data.accessToken;
    console.log('✅ 登录成功\n');
    
    // 3. 提交申请（使用真实数据）
    console.log('3️⃣ 提交部署申请...');
    const requestData = {
      applicantName: "Lycan",
      department: "AI效率中心",
      contactPhone: "16622763282",
      email: "guhongji@51talk.com",
      teamSize: "5",
      urgency: "normal",
      targetLaunchDate: "2025-11-15",
      businessScenario: "测试业务场景",
      expectedGoals: "测试目标",
      budgetRange: "10万",
      additionalNeeds: "无"
    };
    
    const response = await axios.post(
      'http://localhost:3000/api/v1/projects/34/replicate',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 申请提交成功！');
    console.log('📋 申请ID:', response.data.id);
    console.log('📋 项目ID:', response.data.projectId);
    console.log('📋 状态:', response.data.status);
    console.log('\n🎉 所有功能正常！');
    
  } catch (error) {
    console.error('\n❌ 发现问题:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('后端服务未运行！');
      console.error('请在 backend 目录运行: npm run start:dev');
    } else if (error.response) {
      console.error('HTTP状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
      
      if (error.response.status === 500) {
        console.error('\n💡 解决方案:');
        console.error('1. 查看后端控制台的详细错误日志');
        console.error('2. 确认后端服务已重启（修改了DTO后需要重启）');
        console.error('3. 检查数据库连接是否正常');
        console.error('4. 运行: npx prisma generate 重新生成Prisma Client');
      }
    } else {
      console.error('错误:', error.message);
    }
    
    process.exit(1);
  }
}

diagnose();





