import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  department: string;
  role: string;
  position?: string;
  // ✅ 联系方式字段
  phone?: string;
  qrCode?: string;
  qrCodeType?: string;
  showPhone?: boolean;
  showQrCode?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, department: string, position?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  // ✅ 刷新用户信息
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api/v1'
  : `http://${window.location.hostname}:3000/api/v1`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      console.log('登录请求:', { url, email });
      
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('登录响应:', { status: response.status, statusText: response.statusText, url: response.url, ok: response.ok });

      if (!response.ok) {
        let errorMessage = '登录失败';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            // 处理NestJS验证错误格式
            if (Array.isArray(error.message)) {
              errorMessage = error.message.join(', ');
            } else if (error.message) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
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
          errorMessage = `服务器错误: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回了无效的响应格式');
      }

      const data = await response.json();
      
      if (!data.accessToken || !data.user) {
        throw new Error('服务器返回的数据格式不正确');
      }

      const { accessToken, user: userData } = data;

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('登录请求失败:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 更详细的错误诊断
        const errorMsg = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
          ? '无法连接到后端服务器。请检查后端服务是否运行、网络连接是否正常'
          : '网络请求失败，请检查网络连接或确保后端服务正在运行';
        throw new Error(errorMsg);
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, department: string, position?: string) => {
    try {
      const url = `${API_BASE_URL}/auth/register`;
      const requestBody = { email, password, name, department, position };
      
      console.log('注册请求:', { url, body: requestBody });
      
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('注册响应:', { status: response.status, statusText: response.statusText, url: response.url, ok: response.ok });

      // 注册接口返回201是成功的，但fetch的ok在201时也是true
      if (!response.ok) {
        let errorMessage = '注册失败';
        try {
          const contentType = response.headers.get('content-type');
          console.log('错误响应内容类型:', contentType);
          console.log('错误响应状态:', response.status, response.statusText);
          
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            console.log('错误响应JSON:', error);
            // 处理NestJS验证错误格式
            if (Array.isArray(error.message)) {
              errorMessage = error.message.join(', ');
            } else if (error.message) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            } else if (error.error) {
              errorMessage = error.error;
            }
          } else {
            const text = await response.text();
            console.log('错误响应文本:', text);
            if (text) {
              errorMessage = text;
            } else {
              if (response.status === 404) {
                errorMessage = `接口不存在 (404)。请确认后端服务正在运行，并且路径为: ${url}`;
              } else {
                errorMessage = `服务器错误: ${response.status} ${response.statusText}`;
              }
            }
          }
        } catch (parseError) {
          console.error('解析错误响应失败:', parseError);
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

      const data = await response.json();
      
      console.log('注册响应数据:', data);
      
      if (!data.accessToken || !data.user) {
        console.error('注册响应数据格式不正确:', data);
        throw new Error('服务器返回的数据格式不正确');
      }

      const { accessToken, user: userData } = data;

      console.log('设置token和user:', { 
        accessToken: accessToken?.substring(0, 20) + '...', 
        userId: userData?.id,
        email: userData?.email 
      });

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('注册成功，状态已更新，token和user已设置');
    } catch (error: any) {
      console.error('注册过程出错:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 更详细的错误诊断
        const errorMsg = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
          ? '无法连接到后端服务器。请检查后端服务是否运行、网络连接是否正常'
          : '网络请求失败，请检查网络连接或确保后端服务正在运行';
        throw new Error(errorMsg);
      }
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ✅ 刷新用户信息
  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

