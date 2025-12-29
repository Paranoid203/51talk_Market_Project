import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPasswordDialogProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminPasswordDialog({ open, onSuccess, onCancel }: AdminPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 验证密码
    if (password === '123123') {
      // 存储管理员会话（2小时有效）
      const adminSession = {
        verified: true,
        timestamp: Date.now(),
        expiresIn: 2 * 60 * 60 * 1000, // 2小时
      };
      localStorage.setItem('adminSession', JSON.stringify(adminSession));
      
      toast.success('✅ 管理员身份验证成功');
      setPassword('');
      onSuccess();
    } else {
      toast.error('❌ 密码错误，请重试');
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setPassword('');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            管理员身份验证
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              请输入管理员密码
            </label>
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              管理员密码用于访问项目审核和管理功能
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading || !password}
            >
              {loading ? '验证中...' : '确认'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 验证管理员会话是否有效
export function isAdminSessionValid(): boolean {
  try {
    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) return false;

    const session = JSON.parse(sessionStr);
    const now = Date.now();
    
    // 检查是否过期
    if (now - session.timestamp > session.expiresIn) {
      localStorage.removeItem('adminSession');
      return false;
    }

    return session.verified === true;
  } catch {
    return false;
  }
}

// 清除管理员会话
export function clearAdminSession() {
  localStorage.removeItem('adminSession');
}

