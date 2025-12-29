import { useState } from 'react';
import { Mail, Lock, User, Building2, Briefcase, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import './AuthDialog.css';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void; // 注册/登录成功后的回调
}

// 部门列表
const DEPARTMENTS = [
  '技术部',
  '产品部',
  '市场部',
  '销售部',
  '客服部',
  '人力资源部',
  '财务部',
  '法务部',
  '运营部',
  '数据部',
  'AI效率中心',
  '其他',
];

export function AuthDialog({ open, onOpenChange, defaultTab = 'register', onSuccess }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 登录表单
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 注册表单
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerDepartment, setRegisterDepartment] = useState('');
  const [registerPosition, setRegisterPosition] = useState('');

  const { login, register, isAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('请填写邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('登录成功！');
      onOpenChange(false);
      setLoginEmail('');
      setLoginPassword('');
      // 登录成功后调用回调
      if (onSuccess) {
        setTimeout(() => onSuccess(), 100);
      }
    } catch (error: any) {
      toast.error(error.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !registerName || !registerDepartment) {
      toast.error('请填写所有必填字段');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('密码长度至少6位');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      await register(registerEmail, registerPassword, registerName, registerDepartment, registerPosition);
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success('注册成功！欢迎加入AI能力交易平台');
      onOpenChange(false);
      
      // 清空表单
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterName('');
      setRegisterDepartment('');
      setRegisterPosition('');
      
      // 注册成功后，状态会在 AuthContext 中自动更新
      // 页面会根据 isAuthenticated 状态自动显示可访问的内容
      console.log('注册成功，用户状态:', { isAuthenticated });
      
      // 注册成功后调用回调
      if (onSuccess) {
        setTimeout(() => onSuccess(), 200);
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      toast.error(error.message || '注册失败，请检查信息后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent max-w-[500px] shadow-none">
        <div className="card">
          {/* 关闭按钮 */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="size-4 text-black/60" />
          </button>

          {/* 密码显示/隐藏切换 checkbox */}
          <input
            type="checkbox"
            id="blind-input"
            className="blind-check"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            hidden
          />

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full tabs-container">
            <TabsList className="tabs-list-fixed grid w-full grid-cols-2 mb-0 bg-black/5 rounded-xl p-1">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                登录
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                注册
              </TabsTrigger>
            </TabsList>

            {/* 登录表单 */}
            <TabsContent value="login" className="mt-0 tabs-content-wrapper">
              {/* 猴子头像 - 在顶部中间 */}
              <label htmlFor="blind-input" className="avatar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="0 0 64 64"
                  id="monkey"
                >
                  <ellipse cx="53.7" cy="33" rx="8.3" ry="8.2" fill="#89664c"></ellipse>
                  <ellipse cx="53.7" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
                  <ellipse cx="10.2" cy="33" rx="8.2" ry="8.2" fill="#89664c"></ellipse>
                  <ellipse cx="10.2" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
                  <g fill="#89664c">
                    <path
                      d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2"
                    ></path>
                    <path
                      d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4"
                    ></path>
                  </g>
                  <path
                    d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7"
                    fill="#e0ac7e"
                  ></path>
                  <g fill="#3b302a" className="monkey-eye-nose">
                    <path
                      d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1"
                    ></path>
                    <path
                      d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1"
                    ></path>
                    <ellipse
                      cx="40.7"
                      cy="31.7"
                      rx="3.5"
                      ry="4.5"
                      className="monkey-eye-r"
                    ></ellipse>
                    <ellipse
                      cx="23.3"
                      cy="31.7"
                      rx="3.5"
                      ry="4.5"
                      className="monkey-eye-l"
                    ></ellipse>
                  </g>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="0 0 64 64"
                  id="monkey-hands"
                >
                  <path
                    fill="#89664C"
                    d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z"
                  ></path>
                  <path
                    fill="#FFD6BB"
                    d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8
	s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8"
                  ></path>
                  <path
                    fill="#89664C"
                    d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z"
                  ></path>
                  <path
                    fill="#FFD6BB"
                    d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8
	s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8"
                  ></path>
                </svg>
              </label>

              <form className="form" onSubmit={handleLogin}>
                <div className="title">登录</div>

                <label className="label_input" htmlFor="login-email-input">电子邮件</label>
                <div className="relative input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    spellCheck="false"
                    className="input"
                    type="email"
                    name="email"
                    id="login-email-input"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="请输入您的邮箱"
                    required
                  />
                </div>

                <label className="label_input" htmlFor="password-input">密码</label>
                <div className="relative input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    spellCheck="false"
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password-input"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="请输入密码"
                    required
                  />
                </div>

                <button className="submit" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin inline" />
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </button>

                <div className="forgot-password-wrapper">
                  <a href="#" onClick={(e) => { e.preventDefault(); toast.info('忘记密码功能开发中'); }} className="forgot-password-link">
                    忘记密码?
                  </a>
                </div>
              </form>
            </TabsContent>

            {/* 注册表单 */}
            <TabsContent value="register" className="mt-0 tabs-content-wrapper">
              {/* 猴子头像 - 在顶部中间 */}
              <label htmlFor="blind-input" className="avatar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="0 0 64 64"
                  id="monkey"
                >
                  <ellipse cx="53.7" cy="33" rx="8.3" ry="8.2" fill="#89664c"></ellipse>
                  <ellipse cx="53.7" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
                  <ellipse cx="10.2" cy="33" rx="8.2" ry="8.2" fill="#89664c"></ellipse>
                  <ellipse cx="10.2" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
                  <g fill="#89664c">
                    <path
                      d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2"
                    ></path>
                    <path
                      d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4"
                    ></path>
                  </g>
                  <path
                    d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7"
                    fill="#e0ac7e"
                  ></path>
                  <g fill="#3b302a" className="monkey-eye-nose">
                    <path
                      d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1"
                    ></path>
                    <path
                      d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1"
                    ></path>
                    <ellipse
                      cx="40.7"
                      cy="31.7"
                      rx="3.5"
                      ry="4.5"
                      className="monkey-eye-r"
                    ></ellipse>
                    <ellipse
                      cx="23.3"
                      cy="31.7"
                      rx="3.5"
                      ry="4.5"
                      className="monkey-eye-l"
                    ></ellipse>
                  </g>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="0 0 64 64"
                  id="monkey-hands"
                >
                  <path
                    fill="#89664C"
                    d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z"
                  ></path>
                  <path
                    fill="#FFD6BB"
                    d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8
	s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8"
                  ></path>
                  <path
                    fill="#89664C"
                    d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z"
                  ></path>
                  <path
                    fill="#FFD6BB"
                    d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8
	s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8"
                  ></path>
                </svg>
              </label>

              <form className="form register-form" onSubmit={handleRegister}>
                <div className="title">注册</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label_input" htmlFor="register-email-input">
                      邮箱 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        spellCheck="false"
                        className="input"
                        type="email"
                        name="email"
                        id="register-email-input"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="请输入企业邮箱"
                        required
                      />
                    </div>
                    <p className="helper-text">用于登录和通知</p>
                  </div>

                  <div>
                    <label className="label_input" htmlFor="register-name-input">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative input-wrapper">
                      <User className="input-icon" />
                      <input
                        spellCheck="false"
                        className="input"
                        type="text"
                        name="name"
                        id="register-name-input"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="请输入真实姓名"
                        required
                      />
                    </div>
                    <p className="helper-text">显示在个人资料中</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label_input" htmlFor="register-password-input">
                      密码 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        spellCheck="false"
                        className="input"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="register-password-input"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="至少6位字符"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label_input" htmlFor="register-confirm-password-input">
                      确认密码 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        spellCheck="false"
                        className="input"
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        id="register-confirm-password-input"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="再次输入密码"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label_input" htmlFor="register-department-input">
                      部门 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative input-wrapper">
                      <Building2 className="input-icon" />
                      <select
                        id="register-department-input"
                        className="input pr-10 appearance-none cursor-pointer"
                        value={registerDepartment}
                        onChange={(e) => setRegisterDepartment(e.target.value)}
                        required
                      >
                        <option value="">请选择部门</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <svg className="size-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="helper-text">用于权限管理</p>
                  </div>

                  <div>
                    <label className="label_input" htmlFor="register-position-input">职位</label>
                    <div className="relative input-wrapper">
                      <Briefcase className="input-icon" />
                      <input
                        spellCheck="false"
                        className="input"
                        type="text"
                        name="position"
                        id="register-position-input"
                        value={registerPosition}
                        onChange={(e) => setRegisterPosition(e.target.value)}
                        placeholder="如：高级工程师"
                      />
                    </div>
                    <p className="helper-text">可选</p>
                  </div>
                </div>

                <div className="important-notice">
                  <strong>重要提示：</strong>
                  <ul>
                    <li>注册信息将用于身份验证和平台功能使用</li>
                    <li>部门信息将影响您可访问的工具和项目权限</li>
                    <li>请确保信息准确，后续修改需要管理员审核</li>
                  </ul>
                </div>

                <button className="submit" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin inline" />
                      注册中...
                    </>
                  ) : (
                    '注册'
                  )}
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
