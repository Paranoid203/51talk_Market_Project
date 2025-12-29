import { useState } from 'react';
import { Plus, MessageSquare, Clock, DollarSign, CheckCircle, Filter, TrendingUp, Users, Award, ThumbsUp, Eye, Star, Zap, Heart, Share2, Send, AlertCircle, Sparkles, Crown, Trophy, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
// 移除旧的 LoadingAvatar；改为透明 WebP 动画

interface DemandMarketplaceProps {
  searchQuery: string;
}

export function DemandMarketplace({ searchQuery }: DemandMarketplaceProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<any>(null);

  // 社区动态数据
  const communityActivities = [
    { type: 'complete', user: '李华', action: '刚刚解决了', target: '王芳', demand: '自动化报表工具', rating: 5, time: '刚刚' },
    { type: 'milestone', department: '数据部', achievement: '完成了100单', badge: '金牌部门', time: '10分钟前' },
    { type: 'honor', user: '张三', title: '本月最佳帮手', stats: '已帮助23人解决问题', time: '1小时前' },
    { type: 'new', user: '赵六', department: '市场部', demand: '营销文案生成器', reward: 800, applicants: 3, time: '2小时前' },
  ];

  // 社区数据看板
  const communityStats = {
    weeklyDemands: { value: 45, change: 12 },
    weeklyCompleted: { value: 38, change: 8 },
    activeRate: 87,
    satisfaction: 4.8,
  };

  // 本周榜单
  const weeklyRankings = [
    { rank: 1, title: '最佳帮手', name: '李华', department: '数据部', value: '解决12个需求', avatar: '李华' },
    { rank: 2, title: '响应最快', name: '王芳', department: '客服部', value: '平均2.3小时响应', avatar: '王芳' },
    { rank: 3, title: '性价比之王', name: '张三', department: '技术部', value: '评分4.9，价格低', avatar: '张三' },
  ];

  // 活跃成员
  const activeMembers = [
    { name: '李华', level: 'Lv.6 传奇', avatar: '李华' },
    { name: '王芳', level: 'Lv.5 专家', avatar: '王芳' },
    { name: '赵六', level: 'Lv.4 专家', avatar: '赵六' },
  ];

  const demands = [
    {
      id: 1,
      title: '需要一个自动化报表工具',
      description: '每周需要生成销售数据报表，希望能够自动化处理Excel数据并生成可视化图表',
      category: '数据分析',
      publisher: '李明',
      department: '销售部',
      level: 'Lv.3',
      publishTime: '2小时前',
      expectedTime: '1周内',
      status: 'active',
      reward: 500,
      proposals: 5,
      views: 89,
      followers: 12,
      isPaid: true,
      isFeatured: true,
      discussions: [
        { user: '王芳', level: 'Lv.5专家', content: '这个我之前做过类似的，可以用Python+pandas实现，大概2天就能搞定。', time: '2小时前', likes: 8, isAccepted: false },
        { user: '李华', level: 'Lv.6传奇', content: '@王芳 如果需要可视化图表，建议用plotly，效果更好，我可以协助。', time: '1小时前', likes: 5, isAccepted: false },
        { user: '李明', level: 'Lv.3', content: '@王芳 @李华 太感谢了！我想先看看你们的历史案例，方便的话能分享吗？', time: '30分钟前', likes: 0, isAccepted: false },
      ],
      topProposal: { user: '王芳', title: 'Python自动化方案', likes: 11 },
      alsoNeed: ['赵六', '孙八', '周九'],
    },
    {
      id: 2,
      title: '寻求PPT自动生成解决方案',
      description: '需要能够根据文字大纲自动生成PPT的工具，最好支持多种模板风格',
      category: '创作',
      publisher: '赵六',
      department: '市场部',
      level: 'Lv.2',
      publishTime: '1天前',
      expectedTime: '2周内',
      status: 'active',
      reward: 800,
      proposals: 3,
      views: 156,
      followers: 23,
      isPaid: true,
      isFeatured: true,
      discussions: [
        { user: '钱七', level: 'Lv.4专家', content: '我之前做过这个！用GPT-4配合Python的python-pptx库，效果很好。', time: '1天前', likes: 15, isAccepted: false },
        { user: '孙八', level: 'Lv.1新手', content: '我也有这个需求！能一起合作吗？我可以提供测试和反馈。', time: '20小时前', likes: 3, isAccepted: false },
        { user: '钱七', level: 'Lv.4专家', content: '@孙八 当然可以！我们可以组个小组，一起研究这个功能。', time: '18小时前', likes: 5, isAccepted: false },
      ],
      topProposal: { user: '钱七', title: 'GPT-4+Python方案', likes: 15 },
      alsoNeed: ['孙八', '周九', '吴十'],
      groupBuy: { current: 2, total: 4, price: 200, members: ['赵六', '孙八'] },
    },
    {
      id: 3,
      title: '智能邮件分类助手',
      description: '希望有人能帮忙开发一个邮件自动分类和优先级排序的工具',
      category: '办公',
      publisher: '张伟',
      department: '行政部',
      level: 'Lv.3',
      publishTime: '1天前',
      expectedTime: '1周内',
      status: 'active',
      reward: 0,
      proposals: 3,
      views: 67,
      followers: 5,
      isPaid: false,
      isFeatured: false,
      discussions: [],
      alsoNeed: [],
    },
  ];

  const filteredDemands = demands.filter(demand => {
    const matchesStatus = statusFilter === 'all' || demand.status === statusFilter;
    const matchesSearch = !searchQuery || 
      demand.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'complete': return <CheckCircle className="size-5 text-green-600" />;
      case 'milestone': return <Trophy className="size-5 text-amber-600" />;
      case 'honor': return <Crown className="size-5 text-purple-600" />;
      case 'new': return <Sparkles className="size-5 text-blue-600" />;
      default: return <MessageSquare className="size-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 relative min-h-screen">
      {/* 升级中遮罩层 - 透明模糊背景 */}
      <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md min-h-screen">
        <div className="text-center space-y-3 px-8 max-w-md">
          {/* 动画图标 */}
          <img
            src="/images/11月19日_alpha.webp"
            alt="加载动画"
            className="mx-auto"
            style={{ width: '128px', height: '72px', objectFit: 'contain' }}
            draggable={false}
          />
          
          {/* 标题 */}
          <div className="space-y-1.5">
            <h2 className="text-base text-slate-900 font-medium">
              功能优化中
            </h2>
            <p className="text-xs text-slate-700">
              我们正在打造更智能的需求匹配系统
            </p>
          </div>
          
          {/* 描述 */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-slate-700 flex items-center justify-center gap-2">
              <span>🤝</span>
              <span>更高效的需求匹配机制</span>
            </p>
            <p className="text-xs text-slate-700 flex items-center justify-center gap-2">
              <span>💡</span>
              <span>更智能的方案推荐算法</span>
            </p>
            <p className="text-xs text-slate-700 flex items-center justify-center gap-2">
              <span>🎯</span>
              <span>更完善的社区互动体验</span>
            </p>
          </div>
          
          {/* 提示 */}
          <div className="pt-2">
            <p className="text-slate-600 text-xs">
              敬请期待，精彩即将呈现
            </p>
          </div>
        </div>
      </div>

      {/* 原有内容 - 正常显示，会被遮罩模糊 */}
      <div className="space-y-6 pb-20 md:pb-0">
      {/* 页面头部 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900">🤝 需求广场</h1>
        <p className="text-slate-600">大家一起解决问题，共同成长</p>
      </div>

      {/* 社区动态滚动条 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            🔥 社区动态
            <Badge variant="secondary" className="ml-auto">实时</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {communityActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1 text-sm">
                  {activity.type === 'complete' && (
                    <div>
                      <span className="text-slate-700">💬 {activity.user} 刚刚解决了 {activity.target} 的需求</span>
                      <span className="text-blue-600">"{activity.demand}"</span>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: activity.rating }).map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-slate-500 text-xs ml-1">五星好评</span>
                      </div>
                    </div>
                  )}
                  {activity.type === 'milestone' && (
                    <div>
                      <span className="text-slate-700">🎉 {activity.department} 的需求{activity.achievement}，获得</span>
                      <span className="text-amber-600">"{activity.badge}"</span>
                      <span className="text-slate-700">徽章</span>
                    </div>
                  )}
                  {activity.type === 'honor' && (
                    <div>
                      <span className="text-slate-700">👏 {activity.user} 成为{activity.title}，{activity.stats}</span>
                    </div>
                  )}
                  {activity.type === 'new' && (
                    <div>
                      <span className="text-slate-700">🆕 {activity.department}-{activity.user} 发布了新需求</span>
                      <span className="text-blue-600">"{activity.demand}"</span>
                      <div className="text-slate-500 text-xs mt-1">
                        悬赏¥{activity.reward}，已有{activity.applicants}人报名
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区 */}
      <div className="grid lg:grid-cols-[70%_30%] gap-6">
        {/* 左侧：需求列表 */}
        <div className="space-y-6">
          {/* 筛选区 */}
          <div className="space-y-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">● 全部需求</TabsTrigger>
                <TabsTrigger value="active">○ 征集方案</TabsTrigger>
                <TabsTrigger value="in_progress">○ 实施中</TabsTrigger>
                <TabsTrigger value="completed">○ 已完成</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-3 items-center">
              <Select defaultValue="newest">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">▼ 最新发布</SelectItem>
                  <SelectItem value="hot">最热门</SelectItem>
                  <SelectItem value="reward">报酬最高</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">▼ 全部分类</SelectItem>
                  <SelectItem value="data">数据分析</SelectItem>
                  <SelectItem value="create">创作</SelectItem>
                  <SelectItem value="office">办公</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                className="ml-auto gap-2 bg-gradient-to-r from-blue-600 to-purple-600" 
                size="lg"
                onClick={() => setShowPublishDialog(true)}
              >
                <Plus className="size-4" />
                发布需求
              </Button>
            </div>

            {/* 快捷标签 */}
            <div>
              <div className="text-sm text-slate-600 mb-2">【快捷标签】</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">#数据分析(23)</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">#内容创作(15)</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">#客服自动化(12)</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">#办公效率(18)</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">#AI应用(34)</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 text-red-600">#紧急需求(5)</Badge>
              </div>
            </div>
          </div>

          {/* 热门需求 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                🔥 热门需求（社区推荐）
              </Badge>
            </div>

            <div className="space-y-4">
              {filteredDemands.filter(d => d.isFeatured).map((demand) => (
                <Card key={demand.id} className="overflow-hidden border-2 border-amber-100">
                  <CardContent className="p-6 space-y-4">
                    {/* 需求头部 */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700">🔥 进行中</Badge>
                          {demand.isPaid && (
                            <Badge className="bg-orange-100 text-orange-700 gap-1">
                              <DollarSign className="size-3" />
                              ¥{demand.reward}
                            </Badge>
                          )}
                          <Badge variant="outline">📁{demand.category}</Badge>
                        </div>
                        <h3 
                          className="text-slate-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={() => setSelectedDemand(demand)}
                        >
                          {demand.title}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {demand.description}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* 发起人信息 */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">👤 发起人:</span>
                        <span className="text-slate-900">{demand.publisher} · {demand.department} · {demand.level}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span>📅 {demand.publishTime}</span>
                        <span>⏰ 期望: {demand.expectedTime}</span>
                      </div>
                    </div>

                    {/* 社区讨论预览 */}
                    {demand.discussions.length > 0 && (
                      <Card className="bg-slate-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            💬 社区讨论（{demand.discussions.length}条）
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {demand.discussions.slice(0, 2).map((disc, i) => (
                            <div key={i} className="p-3 bg-white rounded border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="size-6 bg-blue-600">
                                  <AvatarFallback className="bg-transparent text-white text-xs">
                                    {disc.user.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-slate-900 text-sm">{disc.user}</span>
                                <Badge variant="outline" className="text-xs">{disc.level}</Badge>
                                <span className="text-slate-400 text-xs ml-auto">{disc.time}</span>
                              </div>
                              <p className="text-slate-700 text-sm mb-2">"{disc.content}"</p>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs">
                                  <ThumbsUp className="size-3 mr-1" />
                                  {disc.likes}人赞同
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" className="w-full">
                            查看全部{demand.discussions.length}条讨论
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* 已提交方案 */}
                    {demand.topProposal && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-700">💡 已有 {demand.proposals}个方案 提交</span>
                          </div>
                          <div className="p-3 bg-white rounded border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-amber-100 text-amber-700">🏅 最受欢迎方案</Badge>
                              <span className="text-sm text-slate-600">({demand.topProposal.likes}人点赞)</span>
                            </div>
                            <div className="text-sm text-slate-900">
                              👤 {demand.topProposal.user} 提交的"{demand.topProposal.title}"
                            </div>
                            <Button variant="outline" size="sm" className="mt-2">快速预览</Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 拼单功能 */}
                    {demand.groupBuy && (
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="size-4 text-green-600" />
                            <span className="text-sm text-slate-700">🎉 社区活动</span>
                          </div>
                          <div className="text-sm text-slate-700 mb-3">
                            有{demand.alsoNeed.length}人表示"我也需要这个功能"，发起人可以考虑"拼单"降低成本！
                          </div>
                          <div className="p-3 bg-white rounded border border-green-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-700">💰 拼单详情</span>
                              <Badge className="bg-green-100 text-green-700">
                                {demand.groupBuy.current}/{demand.groupBuy.total}人
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">原价：</span>
                                <span className="text-slate-900">¥{demand.reward}（1人承担）</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">拼单价：</span>
                                <span className="text-emerald-600">¥{demand.groupBuy.price}/人（{demand.groupBuy.total}人拼单）</span>
                              </div>
                            </div>
                            <Progress value={(demand.groupBuy.current / demand.groupBuy.total) * 100} className="h-2" />
                            <div className="text-xs text-slate-600">
                              已加入: {demand.groupBuy.members.join('、')}
                            </div>
                            <Button size="sm" className="w-full">
                              我要参与拼单（¥{demand.groupBuy.price}）
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Separator />

                    {/* 底部操作栏 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {demand.publishTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="size-4" />
                          {demand.views}人浏览
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="size-4" />
                          {demand.followers}人关注
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="size-3 mr-1" />
                          参与讨论({demand.discussions.length})
                        </Button>
                        <Button size="sm">
                          <Send className="size-3 mr-1" />
                          提交方案
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Star className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 普通需求列表 */}
          <div className="space-y-4">
            {filteredDemands.filter(d => !d.isFeatured).map((demand) => (
              <Card key={demand.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700">🆕 进行中</Badge>
                        {demand.isPaid ? (
                          <Badge className="bg-orange-100 text-orange-700">💰¥{demand.reward}</Badge>
                        ) : (
                          <Badge variant="secondary">🆘 免费</Badge>
                        )}
                        <Badge variant="outline">📁{demand.category}</Badge>
                      </div>
                      <h3 
                        className="text-slate-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => setSelectedDemand(demand)}
                      >
                        {demand.title}
                      </h3>
                      <p className="text-slate-600 text-sm">{demand.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-slate-600">
                      👤 {demand.publisher} · {demand.department} · {demand.level}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        💬 讨论
                      </Button>
                      <Button size="sm">
                        查看详情
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 新手求助专区 */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🆘 新手求助专区
                <Badge variant="secondary">低门槛，快速响应</Badge>
              </CardTitle>
              <CardDescription>没有愚蠢的问题，只有乐于助人的大神</CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-red-100 text-red-700">🆘 免费</Badge>
                    <Badge variant="outline">📁AI应用</Badge>
                    <Badge className="bg-green-100 text-green-700">🎯新手友好</Badge>
                  </div>
                  <h4 className="text-slate-900 mb-2">不太会用ChatGPT，有人能教教我吗？</h4>
                  <div className="text-sm text-slate-600 mb-3">
                    👤 周九 · HR部 · Lv.1新手  📅 30分钟前
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-3">
                    <div className="text-sm text-slate-700 mb-2">💬 已有5位热心同事回复：</div>
                    <div className="text-sm text-slate-600">"我可以教你！" "来我工位，现场教"</div>
                  </div>
                  <Button size="sm" className="w-full">
                    <Heart className="size-3 mr-1" />
                    我来帮忙
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：社区信息 */}
        <div className="space-y-6">
          {/* 社区数据看板 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 社区数据看板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">本周新增需求</span>
                  <Badge className="bg-green-100 text-green-700">+{communityStats.weeklyDemands.change}%</Badge>
                </div>
                <div className="text-2xl text-slate-900">{communityStats.weeklyDemands.value}个</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">本周解决需求</span>
                  <Badge className="bg-green-100 text-green-700">+{communityStats.weeklyCompleted.change}%</Badge>
                </div>
                <div className="text-2xl text-slate-900">{communityStats.weeklyCompleted.value}个</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">社区活跃度</span>
                  <Badge className="bg-red-100 text-red-700">Very High</Badge>
                </div>
                <div className="text-2xl text-slate-900">{communityStats.activeRate}%</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">用户满意度</span>
                </div>
                <div className="text-2xl text-slate-900 flex items-center gap-2">
                  {communityStats.satisfaction}/5.0
                  <span className="text-xl">😊</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 本周榜单 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏆 本周榜单</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyRankings.map((ranking) => (
                <div key={ranking.rank} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {ranking.rank === 1 && <span className="text-xl">🥇</span>}
                    {ranking.rank === 2 && <span className="text-xl">🥈</span>}
                    {ranking.rank === 3 && <span className="text-xl">🥉</span>}
                    <span className="text-sm text-slate-600">{ranking.title}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                    <Avatar className="size-10 bg-gradient-to-br from-blue-600 to-purple-600">
                      <AvatarFallback className="bg-transparent text-white">
                        {ranking.avatar.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-slate-900">{ranking.name}</div>
                      <div className="text-xs text-slate-500">{ranking.department}</div>
                      <div className="text-xs text-slate-600 mt-1">{ranking.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 活跃成员 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 活跃成员</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeMembers.map((member, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="size-10 bg-gradient-to-br from-purple-600 to-pink-600">
                    <AvatarFallback className="bg-transparent text-white">
                      {member.avatar.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-slate-900 text-sm">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.level}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="size-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 本周福利 */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">🎁 本周福利（社区激励）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Target className="size-4 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">帮助3个新手解决问题，获得"热心肠"勋章</span>
              </div>
              <div className="flex items-start gap-2">
                <Target className="size-4 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">完成5个付费需求，奖励¥200现金红包</span>
              </div>
              <div className="flex items-start gap-2">
                <Target className="size-4 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-slate-700">获得10个五星好评，升级为"认证专家"</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 发布需求弹窗 */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>发布新需求</DialogTitle>
            <DialogDescription>
              详细描述您的需求，以便获得更准确的解决方案
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">需求标题</Label>
              <Input id="title" placeholder="简要描述您的需求" />
            </div>

            <div>
              <Label htmlFor="category">需求分类</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">数据分析</SelectItem>
                  <SelectItem value="create">创作</SelectItem>
                  <SelectItem value="office">办公</SelectItem>
                  <SelectItem value="customer">客服</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">需求描述</Label>
              <Textarea 
                id="description" 
                placeholder="详细描述您的需求背景、期望效果、交付物等..."
                rows={6}
              />
            </div>

            <div>
              <Label>需求类型</Label>
              <Tabs defaultValue="free">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="free">免费需求</TabsTrigger>
                  <TabsTrigger value="paid">付费需求</TabsTrigger>
                </TabsList>
                <TabsContent value="paid" className="space-y-4">
                  <div>
                    <Label htmlFor="reward">设置报酬（元）</Label>
                    <Input id="reward" type="number" placeholder="建议报酬：500-2000" />
                    <p className="text-sm text-slate-500 mt-1">
                      💡 AI建议：根据需求复杂度，建议报酬为 800-1200 元
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" size="lg">
                发布需求
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowPublishDialog(false)}>
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}