import { useState } from 'react';
import { Search, Sparkles, TrendingUp, Star, Bell, User, Briefcase, Users, Eye, Maximize2, Heart, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { LogoLoop } from './LogoLoop';
import SplitText from './SplitText';
import { AuthDialog } from './AuthDialog';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSearch: (query: string) => void;
}

export function HomePage({ onNavigate, onSearch }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<'login' | 'register'>('register');
  const { isAuthenticated } = useAuth();

  // Featured cards data
  const featuredCards = [
    {
      id: 1,
      type: 'tool',
      title: 'AI Customer Service Bot',
      category: 'Customer Service',
      image: 'https://images.unsplash.com/photo-1611663809751-a988194a855a?w=800',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      stats: { users: 234, rating: 4.8 },
    },
    {
      id: 2,
      type: 'project',
      title: 'Data Analysis Automation',
      category: 'Data Processing',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      gradient: 'from-purple-500/20 to-pink-500/20',
      stats: { views: 1240, replications: 12 },
    },
    {
      id: 3,
      type: 'tool',
      title: 'GPT-4 Content Generator',
      category: 'Content Creation',
      image: 'https://images.unsplash.com/photo-1726066012749-f81bf4422d4e?w=800',
      gradient: 'from-orange-500/20 to-amber-500/20',
      stats: { users: 567, rating: 4.9 },
    },
    {
      id: 4,
      type: 'demand',
      title: 'PPT Auto Generator',
      category: 'Office Efficiency',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      gradient: 'from-green-500/20 to-emerald-500/20',
      stats: { reward: 800, applicants: 5 },
    },
    {
      id: 5,
      type: 'project',
      title: 'HR Recruitment Intelligence',
      category: 'Human Resources',
      image: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      stats: { views: 890, replications: 8 },
    },
  ];

  // Convert cards to LogoLoop items
  const logoItems = featuredCards.map(card => ({
    node: (
      <Card
        className="w-80 bg-white border border-black/10 hover:border-black/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group overflow-hidden rounded-2xl shadow-lg shadow-black/5"
      >
        <CardContent className="p-0">
          {/* Card Image/Icon Area */}
          <div className="relative h-64 overflow-hidden rounded-t-2xl">
            {/* Background Image */}
            <img 
              src={card.image} 
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Light Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Type Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/95 backdrop-blur-sm text-black border-black/10 shadow-lg" style={{ fontWeight: 600 }}>
                {card.type === 'tool' && '🔧 Tools'}
                {card.type === 'project' && '🏆 Projects'}
                {card.type === 'demand' && '💡 Demands'}
              </Badge>
            </div>
          </div>

          {/* Card Info Area */}
          <div className="p-6 bg-white border-t border-black/5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-xs text-black/60 mb-1" style={{ fontWeight: 600 }}>{card.category}</div>
                <h3 className="text-black text-lg mb-2" style={{ fontWeight: 700 }}>{card.title}</h3>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-black/70" style={{ fontWeight: 500 }}>
              {card.stats.users && (
                <div className="flex items-center gap-1">
                  <Users className="size-3" />
                  <span>{card.stats.users}</span>
                </div>
              )}
              {card.stats.rating && (
                <div className="flex items-center gap-1">
                  <Star className="size-3 fill-[#FDE700] text-[#FDE700]" />
                  <span>{card.stats.rating}</span>
                </div>
              )}
              {card.stats.views && (
                <div className="flex items-center gap-1">
                  <Eye className="size-3" />
                  <span>{card.stats.views}</span>
                </div>
              )}
              {card.stats.reward && (
                <div className="flex items-center gap-1 text-[#FDE700]">
                  <span>💰 ¥{card.stats.reward}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    title: card.title
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-lg border-b border-black/10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo + 搜索框 */}
            <div className="flex items-center gap-4 flex-1">
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#FDE700] flex items-center justify-center">
                  <span className="text-black" style={{ fontWeight: 700, fontSize: '13px' }}>51</span>
                </div>
              </div>

              {/* 搜索框 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                <Input
                  placeholder="Search tools, demands, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      onSearch(searchQuery);
                    }
                  }}
                  className="pl-10 h-9 bg-white border-black/10 focus-visible:ring-1 focus-visible:ring-[#2487FF] text-sm rounded-full"
                  style={{ fontWeight: 500 }}
                />
              </div>
            </div>

            {/* 中间导航菜单 */}
            <nav className="hidden md:flex items-center gap-2 mx-8">
              <Button
                variant="ghost"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info('请先注册/登录以访问工具广场');
                    setAuthDialogTab('register');
                    setShowAuthDialog(true);
                    return;
                  }
                  onNavigate('tools');
                }}
                className="h-9 px-4 text-sm rounded-full text-black/60 hover:text-black"
                style={{ fontWeight: 600 }}
              >
                Tools
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info('请先注册/登录以访问需求广场');
                    setAuthDialogTab('register');
                    setShowAuthDialog(true);
                    return;
                  }
                  onNavigate('demands');
                }}
                className="h-9 px-4 text-sm rounded-full text-black/60 hover:text-black"
                style={{ fontWeight: 600 }}
              >
                Demands
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info('请先注册/登录以访问项目广场');
                    setAuthDialogTab('register');
                    setShowAuthDialog(true);
                    return;
                  }
                  onNavigate('projects');
                }}
                className="h-9 px-4 text-sm rounded-full text-black/60 hover:text-black"
                style={{ fontWeight: 600 }}
              >
                Projects
              </Button>
            </nav>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-3">
              {/* 管理员入口 */}
              <Button 
                variant="outline"
                size="sm"
                className="border-[#2487FF]/50 bg-white hover:bg-[#2487FF]/10 hover:border-[#2487FF] transition-all gap-2 shadow-md text-[#2487FF] h-9"
                onClick={() => {
                  if (!isAuthenticated) {
                    setAuthDialogTab('login');
                    setShowAuthDialog(true);
                    toast.info('请先登录以访问管理员后台');
                  } else {
                    onNavigate('admin');
                  }
                }}
                title="管理员控制台"
                style={{ fontWeight: 700 }}
              >
                <Shield className="size-4" />
                <span>Admin</span>
              </Button>
              
              <Button 
                className="hidden md:flex gap-2 bg-gradient-to-r from-[#FDE700] to-[#2487FF] hover:from-[#2487FF] hover:to-[#FDE700] text-white rounded-xl px-6 shadow-lg h-9" 
                style={{ fontWeight: 700 }}
                onClick={() => {
                  setAuthDialogTab('register');
                  setShowAuthDialog(true);
                }}
              >
                <Sparkles className="size-4" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-[#FFFFFF]"></div>
        {/* Color Accents */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#FDE700]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#2487FF]/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-[1400px] mx-auto px-6 pt-20 pb-16">
          {/* Main Title Area */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-black/10 rounded-full mb-6 shadow-lg shadow-black/5">
              <Sparkles className="size-4 text-[#2487FF]" />
              <span className="text-black text-sm" style={{ fontWeight: 600 }}>Enterprise AI Capability Trading Platform</span>
            </div>

            <div className="text-5xl md:text-7xl mb-6 leading-[1.1]">
              <div className="mb-2">
                <SplitText
                  text="Unleash "
                  tag="span"
                  className="text-black hero-title"
                  splitType="chars"
                  delay={30}
                  duration={0.8}
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0}
                  rootMargin="0px"
                  textAlign="left"
                />
                <SplitText
                  text="AI Power"
                  tag="span"
                  className="gradient-text"
                  splitType="chars"
                  delay={30}
                  duration={0.8}
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0}
                  rootMargin="0px"
                  textAlign="left"
                />
              </div>
              <div>
                <SplitText
                  text="Make Every Idea Reality"
                  tag="span"
                  className="text-black/30 hero-subtitle"
                  splitType="chars"
                  delay={30}
                  duration={0.8}
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0}
                  rootMargin="0px"
                  textAlign="left"
                />
              </div>
            </div>

            <p className="text-xl text-black/70 max-w-2xl mx-auto">
              Upload your AI tools, publish your needs, view success cases
              <br />
              Here, AI capabilities are shared, traded, and create value
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 pt-6">
              <div className="text-center">
                <div className="text-4xl text-[#2487FF] mb-1" style={{ fontWeight: 800 }}>2,340+</div>
                <div className="text-sm text-black/70">AI Tools</div>
              </div>
              <div className="w-px h-12 bg-black/20"></div>
              <div className="text-center">
                <div className="text-4xl text-[#FDE700] mb-1" style={{ fontWeight: 800 }}>1,567+</div>
                <div className="text-sm text-black/70">Demands Completed</div>
              </div>
              <div className="w-px h-12 bg-black/20"></div>
              <div className="text-center">
                <div className="text-4xl text-[#2487FF] mb-1" style={{ fontWeight: 800 }}>890+</div>
                <div className="text-sm text-black/70">Success Cases</div>
              </div>
            </div>
          </div>

          {/* Card Carousel Section */}
          <div className="relative mb-12">
            <LogoLoop 
              logos={logoItems}
              speed={50}
              direction="left"
              gap={24}
              pauseOnHover={true}
              fadeOut={true}
              fadeOutColor="#FFFFFF"
              scaleOnHover={false}
            />
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center gap-3 bg-white border-2 border-black/10 rounded-3xl p-2 hover:border-[#2487FF]/30 transition-all shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-[#2487FF]/10">
                <Search className="size-5 text-black/40 ml-3" />
                <Input
                  type="text"
                  placeholder="Search tools, demands, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ fontWeight: 500 }}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-[#2487FF] to-[#11B2F2] hover:from-[#11B2F2] hover:to-[#2487FF] text-white rounded-2xl shadow-lg shadow-[#2487FF]/30"
                  style={{ fontWeight: 700 }}
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Entry Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card
              className="bg-white border border-black/10 hover:border-[#2487FF]/40 transition-all cursor-pointer group hover:shadow-xl shadow-black/5"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info('请先注册/登录以访问工具广场');
                  setAuthDialogTab('register');
                  setShowAuthDialog(true);
                  return;
                }
                onNavigate('tools');
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 bg-gradient-to-br from-[#2487FF] to-[#11B2F2] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#2487FF]/20">
                    <Sparkles className="size-6 text-white" />
                  </div>
                  <TrendingUp className="size-5 text-black/60 group-hover:text-[#2487FF] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-black mb-2" style={{ fontWeight: 700 }}>Tools Plaza</h3>
                <p className="text-black/70 text-sm mb-3">
                  Browse and use 2340+ AI tools
                </p>
                <div className="flex items-center gap-2 text-xs text-black/70">
                  <Badge variant="secondary" className="bg-[#2487FF]/10 text-[#2487FF] border-[#2487FF]/20" style={{ fontWeight: 600 }}>
                    Hot
                  </Badge>
                  <span>234 new tools uploaded this week</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white border border-black/10 hover:border-[#FDE700]/60 transition-all cursor-pointer group hover:shadow-xl shadow-black/5"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info('请先注册/登录以访问需求广场');
                  setAuthDialogTab('register');
                  setShowAuthDialog(true);
                  return;
                }
                onNavigate('demands');
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 bg-gradient-to-br from-[#FDE700] to-[#FDD700] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#FDE700]/20">
                    <Users className="size-6 text-black" />
                  </div>
                  <TrendingUp className="size-5 text-black/60 group-hover:text-[#FDE700] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-black mb-2" style={{ fontWeight: 700 }}>Demands Plaza</h3>
                <p className="text-black/70 text-sm mb-3">
                  Publish demands, find solutions
                </p>
                <div className="flex items-center gap-2 text-xs text-black/70">
                  <Badge variant="secondary" className="bg-[#FDE700]/20 text-black border-[#FDE700]/40" style={{ fontWeight: 600 }}>
                    Active
                  </Badge>
                  <span>45 demands awaiting response</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white border border-black/10 hover:border-[#2487FF]/40 transition-all cursor-pointer group hover:shadow-xl shadow-black/5"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info('请先注册/登录以访问项目广场');
                  setAuthDialogTab('register');
                  setShowAuthDialog(true);
                  return;
                }
                onNavigate('projects');
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 bg-gradient-to-br from-[#0098FF] to-[#2487FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#2487FF]/20">
                    <TrendingUp className="size-6 text-white" />
                  </div>
                  <TrendingUp className="size-5 text-black/60 group-hover:text-[#2487FF] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-black mb-2" style={{ fontWeight: 700 }}>Projects Plaza</h3>
                <p className="text-black/70 text-sm mb-3">
                  View AI application success cases
                </p>
                <div className="flex items-center gap-2 text-xs text-black/70">
                  <Badge variant="secondary" className="bg-[#2487FF]/10 text-[#2487FF] border-[#2487FF]/20" style={{ fontWeight: 600 }}>
                    Featured
                  </Badge>
                  <span>12 cases updated this week</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Where AI Meets Intelligence Section */}
      <div className="relative py-20 border-t border-black/10">
        <div className="relative max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl text-black mb-6 leading-[1.15]" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                Where AI
                <br />
                <span className="gradient-text">
                  Meets Intelligence
                </span>
              </h2>
              <p className="text-xl text-black/70 mb-8">
                Connect AI capability supply and demand within the enterprise, let AI tools be discovered, needs be met, cases be replicated
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-10 bg-gradient-to-br from-[#2487FF] to-[#11B2F2] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Sparkles className="size-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-black mb-1">Quick Upload Tools</h4>
                    <p className="text-black/70 text-sm">Support agent, API, and external links - publish with one click</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="size-10 bg-gradient-to-br from-[#FDE700] to-[#FDD700] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Users className="size-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-black mb-1">Community Support</h4>
                    <p className="text-black/70 text-sm">Public discussions, solution battles, group buying - lower collaboration barriers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="size-10 bg-gradient-to-br from-[#0098FF] to-[#2487FF] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <TrendingUp className="size-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-black mb-1">Results Visualization</h4>
                    <p className="text-black/70 text-sm">Complete implementation records, quantified ROI display</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Decorative 3D Character */}
              <div className="relative h-96 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FDE700]/20 to-[#2487FF]/20 rounded-3xl blur-3xl"></div>
                <div className="relative text-9xl filter drop-shadow-2xl">
                  🤖
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Activity Scroll Bar */}
      <div className="border-t border-black/10 py-6 bg-black/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 text-black whitespace-nowrap">
              <Sparkles className="size-4 text-[#2487FF]" />
              <span>Wang Fang just solved Li Ming's demand "Automated Report Tool"</span>
            </div>
            <div className="w-px h-4 bg-black/20"></div>
            <div className="flex items-center gap-2 text-black whitespace-nowrap">
              <Star className="size-4 text-[#FDE700]" />
              <span>Data Department completed 100 orders, earned "Gold Department" badge</span>
            </div>
            <div className="w-px h-4 bg-black/20"></div>
            <div className="flex items-center gap-2 text-black whitespace-nowrap">
              <TrendingUp className="size-4 text-[#2487FF]" />
              <span>45 new demands this week, 84% completion rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 认证对话框 */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        defaultTab={authDialogTab}
        onSuccess={() => {
          // 注册/登录成功后，延迟一下确保状态已更新，然后跳转到项目广场
          setTimeout(() => {
            const token = localStorage.getItem('token');
            if (token) {
              onNavigate('projects');
              toast.success('欢迎！已为您跳转到项目广场');
            }
          }, 500);
        }}
      />
    </div>
  );
}
