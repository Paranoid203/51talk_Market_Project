import { useState } from 'react';
import { Filter, Star, Users, TrendingUp, Plus, Sparkles, ExternalLink, Play, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface ToolMarketplaceProps {
  searchQuery: string;
}

export function ToolMarketplace({ searchQuery }: ToolMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [showMatchedDemands, setShowMatchedDemands] = useState(false);
  const [matchedDemands, setMatchedDemands] = useState<any[]>([]);

  const categories = [
    { id: 'all', name: '全部', icon: '📦' },
    { id: 'create', name: '创作', icon: '✍️' },
    { id: 'data', name: '数据', icon: '📊' },
    { id: 'chat', name: '对话', icon: '💬' },
    { id: 'image', name: '图像', icon: '🎨' },
    { id: 'video', name: '视频', icon: '🎬' },
    { id: 'text', name: '文本', icon: '📝' },
  ];

  const tools = [
    {
      id: 1,
      name: 'AI文案生成器',
      description: '基于GPT-4的智能文案创作工具，支持多种文案类型生成',
      category: 'create',
      type: 'agent',
      author: '张小明',
      department: '市场部',
      users: 1234,
      rating: 4.8,
      reviews: 156,
      price: 0,
      isFeatured: true,
    },
    {
      id: 2,
      name: '数据分析助手',
      description: '自动化数据分析和可视化工具，支持Excel、CSV等多种格式',
      category: 'data',
      type: 'api',
      author: '李华',
      department: '数据部',
      users: 856,
      rating: 4.9,
      reviews: 89,
      price: 10,
      isFeatured: true,
    },
    {
      id: 3,
      name: '智能客服机器人',
      description: '24小时在线AI客服，支持多轮对话和知识库问答',
      category: 'chat',
      type: 'agent',
      author: '王芳',
      department: '客服部',
      users: 2341,
      rating: 4.7,
      reviews: 234,
      price: 0,
      isFeatured: false,
    },
    {
      id: 4,
      name: 'PPT自动生成工具',
      description: '输入主题即可生成专业PPT，支持多种模板和风格',
      category: 'create',
      type: 'external',
      author: '赵六',
      department: '产品部',
      users: 567,
      rating: 4.6,
      reviews: 45,
      price: 5,
      isFeatured: false,
    },
    {
      id: 5,
      name: 'AI图片生成器',
      description: '文字转图片，支持多种艺术风格和尺寸',
      category: 'image',
      type: 'api',
      author: '孙七',
      department: '设计部',
      users: 1890,
      rating: 4.8,
      reviews: 178,
      price: 15,
      isFeatured: true,
    },
    {
      id: 6,
      name: '视频字幕生成器',
      description: '自动识别视频语音并生成字幕，支持多语言翻译',
      category: 'video',
      type: 'api',
      author: '周八',
      department: '运营部',
      users: 432,
      rating: 4.5,
      reviews: 34,
      price: 20,
      isFeatured: false,
    },
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.users - a.users;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return b.id - a.id;
    return 0;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'agent':
        return { label: '智能体', color: 'bg-blue-100 text-blue-700' };
      case 'api':
        return { label: 'API工具', color: 'bg-purple-100 text-purple-700' };
      case 'external':
        return { label: '外链工具', color: 'bg-green-100 text-green-700' };
      default:
        return { label: '未知', color: 'bg-slate-100 text-slate-700' };
    }
  };

  // AI匹配需求功能
  const handleAIMatch = () => {
    // 模拟AI匹配的需求数据
    const mockMatchedDemands = [
      {
        id: 1,
        title: '营销部门需要批量生成社交媒体文案',
        department: '市场部',
        reward: 500,
        matchScore: 95,
        reason: '该工具专门针对文案生成，完美匹配需求场景',
      },
      {
        id: 2,
        title: '需要AI工具协助撰写产品介绍文档',
        department: '产品部',
        reward: 300,
        matchScore: 88,
        reason: '工具支持多种文案类型，可以满足产品文档撰写需求',
      },
      {
        id: 3,
        title: '客服部需要标准化回复文案模板',
        department: '客服部',
        reward: 400,
        matchScore: 82,
        reason: '工具可生成标准化文案，适用于客服场景',
      },
    ];
    setMatchedDemands(mockMatchedDemands);
    setShowMatchedDemands(true);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 relative min-h-screen">
      {/* 升级中遮罩层 - 透明模糊背景 */}
      <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md min-h-screen">
        <div className="text-center space-y-3 px-8 max-w-md">
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
              功能升级中
            </h2>
            <p className="text-xs text-slate-700">
              我们正在为您打造更强大的工具广场
            </p>
          </div>
          
          {/* 描述 */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-slate-700 flex items-center justify-center gap-2">
              <span>✨</span>
              <span>全新的工具发现体验</span>
            </p>
            <p className="text-xs text-slate-700 flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>更智能的AI匹配算法</span>
            </p>
            <p className="text-xs text-slate-700 flex items-center justify-center gap-2">
              <span>💎</span>
              <span>更丰富的工具生态</span>
            </p>
          </div>
          
          {/* 提示 */}
          <div className="pt-2">
            <p className="text-slate-600 text-xs">
              敬请期待，即将回归
            </p>
          </div>
        </div>
      </div>

      {/* 原有内容 - 正常显示，会被遮罩模糊 */}
      <div className="space-y-6 pb-20 md:pb-0">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Filter className="size-5" />
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-40"
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择类别" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <TrendingUp className="size-5" />
          <Select
            value={sortBy}
            onValueChange={setSortBy}
            className="w-40"
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">最流行</SelectItem>
              <SelectItem value="rating">评分最高</SelectItem>
              <SelectItem value="newest">最新发布</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 工具列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <Card key={tool.id} className="relative">
            {tool.isFeatured && (
              <Badge
                className="absolute top-2 right-2"
                variant="secondary"
              >
                精品
              </Badge>
            )}
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {tool.category}
              </CardDescription>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-bold">
                  {tool.name}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {tool.description}
                </p>
              </CardHeader>
              <div className="flex items-center space-x-4">
                <Users className="size-4" />
                <p className="text-sm text-gray-500">
                  {tool.users} 用户
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Star className="size-4" />
                <p className="text-sm text-gray-500">
                  {tool.rating} ({tool.reviews} 条评价)
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  className={getTypeLabel(tool.type).color}
                >
                  {getTypeLabel(tool.type).label}
                </Badge>
                <p className="text-sm text-gray-500">
                  {tool.author} ({tool.department})
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-500">
                  价格: {tool.price} 元
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  className="w-full"
                  onClick={() => setSelectedTool(tool)}
                >
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 工具详情对话框 */}
      {selectedTool && (
        <Dialog
          open={selectedTool !== null}
          onOpenChange={setSelectedTool}
        >
          <DialogContent className="space-y-6">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-xl font-bold">
                {selectedTool.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {selectedTool.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Users className="size-4" />
                <p className="text-sm text-gray-500">
                  {selectedTool.users} 用户
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Star className="size-4" />
                <p className="text-sm text-gray-500">
                  {selectedTool.rating} ({selectedTool.reviews} 条评价)
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  className={getTypeLabel(selectedTool.type).color}
                >
                  {getTypeLabel(selectedTool.type).label}
                </Badge>
                <p className="text-sm text-gray-500">
                  {selectedTool.author} ({selectedTool.department})
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-500">
                  价格: {selectedTool.price} 元
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                className="w-full"
                onClick={() => setSelectedTool(null)}
              >
                关闭
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI匹配需求对话框 */}
      {showMatchedDemands && (
        <Dialog
          open={showMatchedDemands}
          onOpenChange={setShowMatchedDemands}
        >
          <DialogContent className="space-y-6">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-xl font-bold">
                AI匹配需求
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                以下是AI匹配到的需求，您可以选择参与
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {matchedDemands.map(demand => (
                <Card key={demand.id} className="relative">
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {demand.department}
                    </CardDescription>
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-xl font-bold">
                        {demand.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        奖励: {demand.reward} 元
                      </p>
                    </CardHeader>
                    <div className="flex items-center space-x-4">
                      <Sparkles className="size-4" />
                      <p className="text-sm text-gray-500">
                        匹配度: {demand.matchScore}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-gray-500">
                        原因: {demand.reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                className="w-full"
                onClick={() => setShowMatchedDemands(false)}
              >
                关闭
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI匹配需求按钮 */}
      <div className="flex items-center space-x-4">
        <Button
          className="w-full"
          onClick={handleAIMatch}
        >
          AI匹配需求
        </Button>
      </div>
      </div>
    </div>
  );
}