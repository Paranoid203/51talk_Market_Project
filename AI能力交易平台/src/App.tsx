import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Home, Wrench, FileText, Briefcase, TrendingUp, Star, Users, Award, Sparkles, Shield, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { ToolMarketplace } from './components/ToolMarketplace';
import { DemandMarketplace } from './components/DemandMarketplace';
import { ProjectShowcase } from './components/ProjectShowcaseSimple';
import { ProjectDetail } from './components/ProjectDetail';
import { UserCenter } from './components/UserCenter';
import { HomePage } from './components/HomePage';
import { AdminDashboard } from './components/AdminDashboard';
import { MyProjects } from './components/MyProjects';
import { AuthDialog } from './components/AuthDialog';
import { BackendStatus } from './components/BackendStatus';
import ClickSpark from './components/ClickSpark';
import { useAuth } from './contexts/AuthContext';
import { toast } from 'sonner';

const PROJECT_DATA = [
  {
    id: 1,
    title: '客服部门AI化改造全流程',
    summary: '通过引入AI客服机器人，实现7×24小时智能客服，大幅提升响应效率',
    department: '客服部',
    requester: '王芳',
    requesterDepartment: '客服部',
    projectLead: '李明',
    projectLeadDepartment: 'AI效率中心',
    developers: ['李明', '张伟', '刘洋'],
    category: '客服',
    publishTime: '1周前',
    impact: {
      efficiency: '响应时间缩短60%，从5分钟降至2分钟',
      costSaving: '节约50万元/年，团队优化30%',
      replication: '12个部门复用',
      satisfaction: '满意度提升35%，投诉率下降40%'
    },
    tags: ['AI客服', '自动化', '效率提升'],
    likes: 234,
    comments: 45,
    replications: 12,
    isFeatured: true,
  },
  {
    id: 2,
    title: '数据分析自动化流程建设',
    summary: '构建自动化数据处理和可视化系统，实现报表一键生成',
    department: '数据部',
    requester: '陈经理',
    requesterDepartment: '数据部',
    projectLead: '李华',
    projectLeadDepartment: 'AI效率中心',
    developers: ['李华', '王芳'],
    category: '数据',
    publishTime: '2周前',
    impact: {
      efficiency: '报表生成效率提升80%，从2小时缩短至20分钟',
      costSaving: '减少人工成本30万元/年',
      replication: '8个部门采用',
      satisfaction: '数据准确率100%，零人工错误'
    },
    tags: ['数据分析', 'Python', '自动化'],
    likes: 189,
    comments: 34,
    replications: 8,
    isFeatured: true,
  },
  {
    id: 3,
    title: '营销文案AI生成系统',
    summary: '基于GPT-4的智能文案创作平台，支持多场景、多风格文案生成',
    department: '市场部',
    requester: '赵总监',
    requesterDepartment: '市场部',
    projectLead: '张小明',
    projectLeadDepartment: 'AI效率中心',
    developers: ['张小明', '李思', '王莉', '周杰'],
    category: '创作',
    publishTime: '3周前',
    impact: {
      efficiency: '创作效率提升70%，单篇从2小时降至30分钟',
      costSaving: '外包费用节省20万元/年',
      replication: '15个业务线复用',
      satisfaction: '质量评分提升52%，优秀率90%'
    },
    tags: ['AI写作', 'GPT-4', '营销'],
    likes: 312,
    comments: 67,
    replications: 15,
    isFeatured: false,
  },
  {
    id: 4,
    title: 'HR招聘流程智能化升级',
    summary: '利用AI技术优化简历筛选、面试安排等环节，提升招聘效率',
    department: '人力资源部',
    requester: '人力资源部',
    requesterDepartment: '人力资源部',
    projectLead: '赵丽',
    projectLeadDepartment: 'AI效率中心',
    developers: ['赵丽', '孙明'],
    category: '人力',
    publishTime: '1个月前',
    impact: {
      efficiency: '招聘流程缩短50%，从30天降至15天',
      costSaving: '提升招聘质量，新员工留存率价值80万',
      replication: '6个分公司HR复用',
      satisfaction: '候选人满意度提升28%'
    },
    tags: ['招聘', '自动化', 'HR'],
    likes: 145,
    comments: 23,
    replications: 6,
    isFeatured: false,
  },
  {
    id: 5,
    title: '智能合同审核系统',
    summary: '基于NLP技术自动识别合同风险点，提升法务审核效率',
    department: '法务部',
    requester: '法务部',
    requesterDepartment: '法务部',
    projectLead: '周律师',
    projectLeadDepartment: 'AI效率中心',
    developers: ['周律师', '陈工', '林博'],
    category: '数据',
    publishTime: '2周前',
    impact: {
      efficiency: '审核时间缩短75%，从4小时降至1小时',
      costSaving: '降低法律风险，价值估算100万/年',
      replication: '5个业务部门使用',
      satisfaction: '风险识别准确率96%'
    },
    tags: ['NLP', '智能审核', '法务'],
    likes: 198,
    comments: 41,
    replications: 5,
    isFeatured: true,
  },
  {
    id: 6,
    title: '财务报表自动生成平台',
    summary: '集成多数据源，一键生成各类财务报表，告别手工制表',
    department: '财务部',
    requester: '财务部',
    requesterDepartment: '财务部',
    projectLead: '钱会计',
    projectLeadDepartment: 'AI效率中心',
    developers: ['钱会计', '吴工'],
    category: '数据',
    publishTime: '1个月前',
    impact: {
      efficiency: '报表制作效率提升85%，从1天降至2小时',
      costSaving: '节省人力成本40万元/年',
      replication: '10个分公司财务复用',
      satisfaction: '数据准确率100%，审计零问题'
    },
    tags: ['财务', '自动化', 'Excel'],
    likes: 267,
    comments: 52,
    replications: 10,
    isFeatured: false,
  },
  {
    id: 7,
    title: '供应链智能预测系统',
    summary: '运用机器学习预测需求波动，优化库存管理和采购计划',
    department: '供应链部',
    requester: '供应链部',
    requesterDepartment: '供应链部',
    projectLead: '张经理',
    projectLeadDepartment: 'AI效率中心',
    developers: ['张经理', '刘工', '杨工', '王工'],
    category: '数据',
    publishTime: '3周前',
    impact: {
      efficiency: '预测准确度提升40%，库存周转加快25%',
      costSaving: '降低库存成本200万元/年',
      replication: '8个产品线应用',
      satisfaction: '缺货率下降60%'
    },
    tags: ['机器学习', '预测', '供应链'],
    likes: 321,
    comments: 73,
    replications: 8,
    isFeatured: true,
  },
  {
    id: 8,
    title: '员工培训智能推荐引擎',
    summary: '根据员工技能画像和职业发展路径，智能推荐个性化培训课程',
    department: '人力资源部',
    requester: '人力资源部',
    requesterDepartment: '人力资源部',
    projectLead: '孙主管',
    projectLeadDepartment: 'AI效率中心',
    developers: ['孙主管', '李老师', '赵老师'],
    category: '人力',
    publishTime: '1周前',
    impact: {
      efficiency: '培训匹配度提升55%，完成率提升42%',
      costSaving: '优化培训资源，节省35万元/年',
      replication: '全公司2000+员工使用',
      satisfaction: '员工满意度92%，技能提升显著'
    },
    tags: ['推荐系统', '培训', '个性化'],
    likes: 178,
    comments: 38,
    replications: 15,
    isFeatured: false,
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'tools' | 'demands' | 'projects' | 'profile' | 'admin' | 'myprojects'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null); // 存储完整的项目数据
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const hasAutoRedirected = useRef(false); // 标记是否已经自动跳转过
  const authLoadingRef = useRef(true); // 标记认证状态是否还在加载中

  // Ensure fonts are loaded before rendering
  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
      return;
    }

    const loadFonts = async () => {
      try {
        await document.fonts.ready;
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true);
      }
    };

    loadFonts();

    // Fallback timeout
    const timeout = setTimeout(() => {
      setFontsLoaded(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // 监听认证状态加载完成
  useEffect(() => {
    // 当认证状态确定后，标记加载完成
    const timer = setTimeout(() => {
      authLoadingRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // 用户登录后自动跳转到项目广场（仅在首次加载时）
  useEffect(() => {
    // 如果用户已登录、当前在首页、字体已加载、认证状态已确定、且还没有自动跳转过，则自动跳转到项目广场
    if (
      isAuthenticated && 
      currentPage === 'home' && 
      fontsLoaded && 
      !authLoadingRef.current &&
      !hasAutoRedirected.current
    ) {
      const token = localStorage.getItem('token');
      if (token) {
        // 延迟一下，确保页面已渲染
        const timer = setTimeout(() => {
          setCurrentPage('projects');
          hasAutoRedirected.current = true; // 标记已跳转
          console.log('用户已登录，自动跳转到项目广场');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, currentPage, fontsLoaded]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 根据查询内容智能跳转到对应页面
    if (query) {
      setCurrentPage('tools');
    }
  };

  const renderPage = () => {
    // 管理员页面 - 需要登录
    if (currentPage === 'admin') {
      if (!isAuthenticated) {
        toast.info('请先登录以访问管理员后台');
        setShowAuthDialog(true);
        setCurrentPage('home');
        return null;
      }
      return <AdminDashboard onBack={() => setCurrentPage('home')} />;
    }

    // 我的项目页面 - 需要登录
    if (currentPage === 'myprojects') {
      if (!isAuthenticated) {
        toast.info('请先登录以查看我的项目');
        setShowAuthDialog(true);
        setCurrentPage('home');
        return null;
      }
      return <MyProjects onBack={() => setCurrentPage('home')} />;
    }

    // 其他页面也需要登录
    if (currentPage !== 'home' && !isAuthenticated) {
      toast.info('请先注册/登录以访问此页面');
      setShowAuthDialog(true);
      setCurrentPage('home');
      return null;
    }

    // 如果在项目页且选中了项目，显示项目详情
    if (currentPage === 'projects' && selectedProject) {
      return <ProjectDetail project={selectedProject} onBack={() => {
        setSelectedProjectId(null);
        setSelectedProject(null);
      }} />;
    }

    // 否则显示正常页面
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onSearch={handleSearch} />;
      case 'tools':
        return <ToolMarketplace searchQuery={searchQuery} />;
      case 'demands':
        return <DemandMarketplace searchQuery={searchQuery} />;
      case 'projects':
        return <ProjectShowcase 
          searchQuery={searchQuery} 
          onProjectSelect={(projectId, project) => {
            setSelectedProjectId(projectId);
            setSelectedProject(project);
          }} 
        />;
      case 'profile':
        return <UserCenter />;
      default:
        return <HomePage onNavigate={setCurrentPage} onSearch={handleSearch} />;
    }
  };

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FDE700] to-[#2487FF] flex items-center justify-center animate-pulse">
            <Sparkles className="size-6 text-white" />
          </div>
          <p className="text-black/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ClickSpark 
      sparkColor="#FDE700" 
      sparkSize={12} 
      sparkRadius={25} 
      sparkCount={8} 
      duration={500}
    >
      <div className="min-h-screen bg-white">
        {/* 后端连接状态检测 */}
        <div className="max-w-[1400px] mx-auto px-6 pt-4">
          <BackendStatus />
        </div>
        
        {/* 顶部导航 - 仅在非首页且非管理员页时显示 */}
        {currentPage !== 'home' && currentPage !== 'admin' && (
        <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-lg border-b border-black/10 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between h-14">
              {/* Logo + 搜索框 */}
              <div className="flex items-center gap-4 flex-1">
                {/* Logo */}
                <div 
                  className="flex items-center gap-2 cursor-pointer shrink-0" 
                  onClick={() => setCurrentPage('home')}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FDE700] flex items-center justify-center shadow-md">
                    <span className="text-black text-sm" style={{ fontWeight: 700 }}>51</span>
                  </div>
                </div>

                {/* 搜索框 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                  <Input
                    placeholder="Search tools, demands, projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 bg-white border-black/10 focus-visible:ring-1 focus-visible:ring-[#2487FF] text-sm rounded-full"
                    style={{ fontWeight: 500 }}
                  />
                </div>
              </div>

              {/* 中间导航菜单 */}
              <nav className="hidden md:flex items-center gap-2 mx-8">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage('tools')}
                  className={`h-9 px-4 text-sm rounded-full ${currentPage === 'tools' ? 'text-black' : 'text-black/60 hover:text-black'}`}
                  style={{ fontWeight: 600 }}
                >
                  Tools
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage('demands')}
                  className={`h-9 px-4 text-sm rounded-full ${currentPage === 'demands' ? 'text-black' : 'text-black/60 hover:text-black'}`}
                  style={{ fontWeight: 600 }}
                >
                  Demands
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage('projects')}
                  className={`h-9 px-4 text-sm rounded-full ${currentPage === 'projects' ? 'text-black' : 'text-black/60 hover:text-black'}`}
                  style={{ fontWeight: 600 }}
                >
                  Projects
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage('myprojects')}
                  className={`h-9 px-4 text-sm rounded-full ${currentPage === 'myprojects' ? 'text-black' : 'text-black/60 hover:text-black'}`}
                  style={{ fontWeight: 600 }}
                >
                  我的作品
                </Button>
              </nav>

              {/* 右侧操作区 */}
              <div className="flex items-center gap-3">
                {/* 通知铃铛 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-black/5">
                      <Bell className="size-5 text-black/60" />
                      {notifications > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">通知中心</h4>
                        <Badge variant="secondary" className="text-xs">{notifications}条新消息</Badge>
                      </div>
                      
                      {/* 欢迎消息 */}
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="size-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-900">欢迎使用AI能力交易平台！</span>
                                <span className="text-xs text-slate-500">刚刚</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                👋 您好！欢迎来到企业内部AI能力交易平台。在这里，您可以：
                              </p>
                              <ul className="text-xs text-slate-600 space-y-1 mb-2">
                                <li className="flex items-start gap-1.5">
                                  <span className="text-purple-600 mt-0.5">•</span>
                                  <span><strong className="font-medium">工具广场</strong>：浏览和使用各类AI工具，快速提升工作效率</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <span className="text-purple-600 mt-0.5">•</span>
                                  <span><strong className="font-medium">需求广场</strong>：发布业务需求，获取AI解决方案</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <span className="text-purple-600 mt-0.5">•</span>
                                  <span><strong className="font-medium">项目广场</strong>：查看成功案例，复用优质项目方案</span>
                                </li>
                              </ul>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                💡 <strong className="font-medium">温馨提示：</strong>平台致力于推动AI能力在企业内部的共享与复用，助力各部门数字化转型。有任何问题欢迎随时咨询！
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 其他通知示例 */}
                        <div className="p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Award className="size-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-900">您的项目申请已通过</span>
                                <span className="text-xs text-slate-500">2小时前</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                "客服部门AI化改造"项目已通过审核，即将发布到项目广场。
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="size-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-900">需求有新的响应</span>
                                <span className="text-xs text-slate-500">5小时前</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                您发布的"智能数据分析"需求收到3个新的解决方案。
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <Button variant="ghost" className="w-full h-8 text-xs text-slate-600 hover:text-slate-900">
                          查看所有通知
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* 用户头像/登录 */}
                {isAuthenticated ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full hover:bg-black/5"
                        title="个人中心"
                      >
                        <User className="size-5 text-black/60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64" align="end">
                      <div className="space-y-3">
                        <div className="pb-3 border-b">
                          <div className="font-semibold text-sm">{user?.name}</div>
                          <div className="text-xs text-black/60">{user?.email}</div>
                          <div className="text-xs text-black/50 mt-1">
                            {user?.position && `${user.position} · `}{user?.department}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setCurrentPage('profile')}
                        >
                          <User className="size-4 mr-2" />
                          个人中心
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={() => {
                            logout();
                            toast.success('已退出登录');
                            if (currentPage !== 'home') {
                              setCurrentPage('home');
                            }
                          }}
                        >
                          <LogOut className="size-4 mr-2" />
                          退出登录
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-9 px-4 text-sm rounded-full"
                    onClick={() => setShowAuthDialog(true)}
                    title="登录/注册"
                  >
                    登录
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 主内容区 */}
      <main className={
        currentPage === 'home' 
          ? 'bg-white' 
          : currentPage === 'projects'
          ? 'w-full bg-white'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white'
      }>
        {renderPage()}
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          <Button
            variant={currentPage === 'home' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('home')}
            className="flex-col h-auto py-2"
          >
            <Home className="size-5" />
            <span className="text-xs mt-1">首页</span>
          </Button>
          <Button
            variant={currentPage === 'tools' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('tools')}
            className="flex-col h-auto py-2"
          >
            <Wrench className="size-5" />
            <span className="text-xs mt-1">工具</span>
          </Button>
          <Button
            variant={currentPage === 'demands' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('demands')}
            className="flex-col h-auto py-2"
          >
            <FileText className="size-5" />
            <span className="text-xs mt-1">需求</span>
          </Button>
          <Button
            variant={currentPage === 'projects' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('projects')}
            className="flex-col h-auto py-2"
          >
            <Award className="size-5" />
            <span className="text-xs mt-1">项目</span>
          </Button>
          <Button
            variant={currentPage === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentPage('profile')}
            className="flex-col h-auto py-2"
          >
            <User className="size-5" />
            <span className="text-xs mt-1">我的</span>
          </Button>
        </div>
      </nav>

      {/* 认证对话框 */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        defaultTab="register"
        onSuccess={() => {
          // 注册/登录成功后，延迟一下确保状态已更新，然后跳转到项目广场
          setTimeout(() => {
            // 检查是否已认证
            const token = localStorage.getItem('token');
            if (token) {
              setCurrentPage('projects');
              toast.success('欢迎！已为您跳转到项目广场');
            } else {
              console.warn('注册成功但token未找到');
            }
          }, 500);
        }}
      />
    </div>
    </ClickSpark>
  );
}