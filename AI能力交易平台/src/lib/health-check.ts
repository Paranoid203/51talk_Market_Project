/**
 * 后端健康检查工具
 * 用于诊断前端与后端的连接问题
 */

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : `http://${window.location.hostname}:3000`;

export async function checkBackendHealth(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: '后端服务连接正常',
        details: {
          status: response.status,
          cors: response.headers.get('access-control-allow-origin'),
          data,
        },
      };
    } else {
      return {
        success: false,
        message: `后端服务响应异常: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
      };
    }
  } catch (error: any) {
    console.error('健康检查失败:', error);
    return {
      success: false,
      message: error.message || '无法连接到后端服务',
      details: {
        error: error.toString(),
        type: error.constructor.name,
      },
    };
  }
}

// 在控制台输出诊断信息
export async function diagnoseConnection() {
  console.log('🔍 开始诊断后端连接...');
  const result = await checkBackendHealth();
  console.log('诊断结果:', result);
  return result;
}

