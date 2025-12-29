import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('🔍 开始检查后端连接...');
        const apiUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3000/' 
          : `http://${window.location.hostname}:3000/`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        console.log('后端响应:', {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ 后端连接成功:', data);
          setStatus('connected');
        } else {
          console.error('❌ 后端响应异常:', response.status, response.statusText);
          setStatus('disconnected');
          setError(`服务器响应异常: ${response.status} ${response.statusText}`);
        }
      } catch (err: any) {
        console.error('❌ 后端连接失败:', err);
        setStatus('disconnected');
        setError(err.message || '无法连接到后端服务器');
      }
    };

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>检查后端连接中...</AlertTitle>
        <AlertDescription>正在测试与后端服务器的连接...</AlertDescription>
      </Alert>
    );
  }

  if (status === 'connected') {
    return (
      <Alert className="mb-4 border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">后端连接正常</AlertTitle>
        <AlertDescription className="text-green-700">
          后端服务连接正常
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-red-500 bg-red-50">
      <XCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">无法连接到后端服务器</AlertTitle>
      <AlertDescription className="text-red-700">
        <div className="space-y-2">
          <p>错误信息: {error}</p>
          <div className="mt-2">
            <p className="font-semibold">请检查：</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>后端服务是否在运行 (cd backend && npm run start:dev)</li>
              <li>后端API服务是否正常运行</li>
              <li>浏览器控制台是否有CORS错误</li>
              <li>防火墙是否阻止了连接</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

