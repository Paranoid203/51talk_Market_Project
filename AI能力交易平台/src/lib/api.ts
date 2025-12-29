/**
 * API 客户端
 * 统一管理所有 API 调用
 */

// 根据环境自动选择 API 地址
export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api/v1'
  : `http://${window.location.hostname}:3000/api/v1`;

// 获取认证 Token
function getToken(): string | null {
  return localStorage.getItem('token');
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...headers,
        'Accept': 'application/json',
      },
    });
  } catch (fetchError: any) {
    console.error('Fetch请求失败:', fetchError);
    if (fetchError instanceof TypeError && (fetchError.message.includes('fetch') || fetchError.message.includes('Failed to fetch'))) {
      throw new Error('无法连接到后端服务器。请检查后端服务是否运行、网络连接是否正常');
    }
    throw fetchError;
  }

  if (!response.ok) {
    // ✅ 处理 401 错误 - Token 过期或无效
    if (response.status === 401) {
      // 清除旧的登录信息
      localStorage.clear();
      sessionStorage.clear();
      
      // 显示友好提示
      const { toast } = await import('sonner');
      toast.info('登录已过期，请重新登录', {
        description: '为了账号安全，请重新输入密码',
        duration: 5000,
      });
      
      // 1秒后跳转到首页（登录页）
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
      throw new Error('登录已过期');
    }

    let errorMessage = '请求失败';
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        }
      } else {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        } else {
          errorMessage = `服务器错误: ${response.status} ${response.statusText}`;
        }
      }
    } catch (parseError) {
      if (response.status === 404) {
        errorMessage = `接口不存在 (404)。请确认后端服务正在运行，并且路径为: ${url}`;
      } else {
        errorMessage = `服务器错误: ${response.status} ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('服务器返回了无效的响应格式');
  }

  return response.json();
}

// ============================================
// 认证 API
// ============================================

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    department: string;
    position?: string;
  }) =>
    request<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ✅ 获取当前用户资料
  getProfile: () =>
    request<any>('/auth/profile', {
      method: 'GET',
    }),

  // ✅ 更新个人资料（包括联系方式）
  updateProfile: (data: {
    name?: string;
    avatar?: string;
    department?: string;
    position?: string;
    phone?: string;
    qrCode?: string;
    qrCodeType?: 'feishu' | 'wechat';
    showPhone?: boolean;
    showQrCode?: boolean;
  }) =>
    request<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ============================================
// 用户管理 API
// ============================================

export const usersApi = {
  list: (query?: Record<string, any>) => {
    const params = new URLSearchParams(query).toString();
    return request<any[]>(`/users${params ? `?${params}` : ''}`);
  },

  get: (id: number) => request<any>(`/users/${id}`),

  create: (data: any) =>
    request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    request<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// 工具管理 API
// ============================================

export const toolsApi = {
  list: (query?: Record<string, any>) => {
    const params = new URLSearchParams(query).toString();
    return request<any[]>(`/tools${params ? `?${params}` : ''}`);
  },

  get: (id: number) => request<any>(`/tools/${id}`),

  create: (data: any) =>
    request<any>('/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    request<any>(`/tools/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/tools/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// 需求管理 API
// ============================================

export const demandsApi = {
  list: (query?: Record<string, any>) => {
    const params = new URLSearchParams(query).toString();
    return request<any[]>(`/demands${params ? `?${params}` : ''}`);
  },

  get: (id: number) => request<any>(`/demands/${id}`),

  create: (data: any) =>
    request<any>('/demands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    request<any>(`/demands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/demands/${id}`, {
      method: 'DELETE',
    }),

  follow: (id: number) =>
    request<any>(`/demands/${id}/follow`, {
      method: 'POST',
    }),

  unfollow: (id: number) =>
    request<void>(`/demands/${id}/follow`, {
      method: 'DELETE',
    }),
};

// ============================================
// 项目管理 API
// ============================================

export const projectsApi = {
  list: (query?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    console.log('Projects API请求URL:', `/projects${queryString ? `?${queryString}` : ''}`);
    return request<any>(`/projects${queryString ? `?${queryString}` : ''}`);
  },

  get: (id: number) => request<any>(`/projects/${id}`),

  create: (data: any) =>
    request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    request<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  like: (id: number) =>
    request<any>(`/projects/${id}/like`, {
      method: 'POST',
    }),

  unlike: (id: number) =>
    request<void>(`/projects/${id}/like`, {
      method: 'DELETE',
    }),

  // 申请部署/复用项目
  applyReplication: (projectId: number, data: any) =>
    request<any>(`/projects/${projectId}/replicate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取所有部署申请（管理员）
  getReplications: (query?: { status?: string; projectId?: number }) => {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.projectId) params.append('projectId', String(query.projectId));
    const queryString = params.toString();
    return request<any>(`/projects/replications/all${queryString ? `?${queryString}` : ''}`);
  },

  // 更新申请状态（管理员）
  updateReplicationStatus: (replicationId: number, status: string) =>
    request<any>(`/projects/replications/${replicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // AI分析申请内容（管理员）
  analyzeReplication: (replicationId: number) =>
    request<any>(`/projects/replications/${replicationId}/analyze`, {
      method: 'POST',
    }),
};

// ============================================
// AI API
// ============================================

export const aiApi = {
  // AI解析项目文档
  parseProject: (documentText: string, prompt?: string) =>
    request<any>('/ai/parse-project', {
      method: 'POST',
      body: JSON.stringify({ documentText, prompt }),
    }),
};

// ============================================
// 通知管理 API
// ============================================

export const notificationsApi = {
  list: (query?: Record<string, any>) => {
    const params = new URLSearchParams(query).toString();
    return request<any[]>(`/notifications${params ? `?${params}` : ''}`);
  },

  get: (id: number) => request<any>(`/notifications/${id}`),

  getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllAsRead: () =>
    request<any>('/notifications/read-all', {
      method: 'PATCH',
    }),

  delete: (id: number) =>
    request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// 导出所有 API
export default {
  auth: authApi,
  users: usersApi,
  tools: toolsApi,
  demands: demandsApi,
  projects: projectsApi,
  notifications: notificationsApi,
};

