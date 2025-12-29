const axios = require('axios');

async function testAPICall() {
  try {
    console.log('🧪 测试 API 调用: POST /api/v1/projects/35/replicate\n');
    
    // 首先登录获取 token
    console.log('🔐 步骤1: 登录获取 token...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'guhongji@51talk.com',
      password: '123456' // 请替换为实际密码
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.access_token || loginResponse.data.token;
    console.log('✅ 登录成功');
    console.log('登录响应:', loginResponse.data);
    if (token) {
      console.log('Token:', token.substring(0, 20) + '...\n');
    } else {
      console.log('⚠️ 未找到token，完整响应:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }
    
    // 然后提交部署申请
    console.log('📤 步骤2: 提交部署申请...');
    const requestData = {
      applicantName: "Lycan",
      department: "AI效率中心",
      contactPhone: "16622763282",
      email: "guhongji@51talk.com",
      teamSize: "5",
      urgency: "normal",
      targetLaunchDate: "2025-11-15",
      businessScenario: "11",
      expectedGoals: "11",
      budgetRange: "11",
      additionalNeeds: "11"
    };
    
    console.log('📦 请求数据:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(
      'http://localhost:3000/api/v1/projects/35/replicate',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ API调用成功！');
    console.log('📥 响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ API调用失败:');
    console.error('错误类型:', error.constructor.name);
    if (error.response) {
      console.error('HTTP状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
      console.error('响应头:', error.response.headers);
    } else if (error.request) {
      console.error('请求已发送但没有响应');
      console.error('请求:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

testAPICall();

