import { useState, useEffect } from 'react';
import { 
  Star, Award, Target, Heart, Trophy, Crown
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileContact } from './UserProfileContact';
import { projectsApi } from '../lib/api';

export function UserCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 根据用户姓名生成头像首字母
  const getAvatarInitials = (name: string) => {
    if (!name) return 'U';
    // 如果是中文，取前两个字符
    if (/[\u4e00-\u9fa5]/.test(name)) {
      return name.length >= 2 ? name.substring(0, 2) : name;
    }
    // 如果是英文，取首字母
    return name.charAt(0).toUpperCase();
  };

  // ✅ 从API获取我的项目（真实数据）
  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // 获取我创建的项目（projectLeadId = user.id）
        const result = await projectsApi.list({ 
          projectLeadId: user.id,
          status: 'APPROVED',
          limit: 100
        });
        setMyProjects(result.data || []);
      } catch (error) {
        console.error('获取我的项目失败:', error);
        setMyProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, [user?.id]);

  // ✅ 用户数据 - 清空虚假数据，使用真实数据或0
  const userProfile = {
    name: user?.name || '用户',
    avatar: getAvatarInitials(user?.name || '用户'),
    department: user?.department || '未设置',
    position: user?.position || '未设置',
    email: user?.email || '',
    level: user?.level || 1, // 从真实数据获取或默认1
    levelName: user?.levelName || '新手',
    nextLevel: (user?.level || 1) + 1,
    currentPoints: user?.points || 0, // 真实积分或0
    nextLevelPoints: ((user?.level || 1) + 1) * 1000, // 计算下一等级所需积分
    rank: 'Top --', // 暂无真实排名数据
    skills: [
      { name: 'AI应用', value: 0, angle: 0 }, // 等待真实数据
      { name: '数据分析', value: 0, angle: 72 },
      { name: '工具开发', value: 0, angle: 144 },
      { name: '方案设计', value: 0, angle: 216 },
      { name: '沟通协作', value: 0, angle: 288 },
    ],
    achievements: {
      toolsCreated: 0, // 等待真实数据
      demandsCompleted: 0,
      projectsCased: myProjects.length, // 使用真实项目数量
      totalLikes: 0,
      averageRating: 0,
      helpedUsers: 0,
    },
  };

  const progressPercentage = userProfile.nextLevelPoints > 0 
    ? (userProfile.currentPoints / userProfile.nextLevelPoints) * 100 
    : 0;

  // 五边形雷达图绘制
  const RadarChart = () => {
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    const levels = 5;

    // 计算五边形顶点
    const getPoint = (value: number, angle: number, radius: number) => {
      const radian = ((angle - 90) * Math.PI) / 180;
      const x = centerX + radius * Math.cos(radian);
      const y = centerY + radius * Math.sin(radian);
      return { x, y };
    };

    // 生成背景五边形网格
    const backgroundPentagons = [];
    for (let i = levels; i > 0; i--) {
      const radius = (maxRadius / levels) * i;
      const points = userProfile.skills
        .map((skill) => {
          const point = getPoint(100, skill.angle, radius);
          return `${point.x},${point.y}`;
        })
        .join(' ');
      backgroundPentagons.push(
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      );
    }

    // 生成数据五边形
    const dataPoints = userProfile.skills.map((skill) => {
      const radius = (maxRadius / 100) * skill.value;
      return getPoint(skill.value, skill.angle, radius);
    });

    const dataPolygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

    // 生成坐标轴线
    const axisLines = userProfile.skills.map((skill, i) => {
      const endPoint = getPoint(100, skill.angle, maxRadius);
      return (
        <line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
      );
    });

    // 生成标签
    const labels = userProfile.skills.map((skill, i) => {
      const labelPoint = getPoint(100, skill.angle, maxRadius + 30);
      return (
        <g key={i}>
          <text
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            className="text-xs fill-slate-700"
          >
            {skill.name}
          </text>
          <text
            x={labelPoint.x}
            y={labelPoint.y + 14}
            textAnchor="middle"
            className="text-xs fill-blue-600 font-medium"
          >
            {skill.value}
          </text>
        </g>
      );
    });

    return (
      <svg width="300" height="340" className="mx-auto">
        {backgroundPentagons}
        {axisLines}
        <polygon
          points={dataPolygonPoints}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
          />
        ))}
        {labels}
      </svg>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* 个人信息卡片 */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 头像和基本信息 */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative">
                <Avatar className="size-24 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <AvatarFallback className="bg-transparent text-2xl">
                    {userProfile.avatar}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 border-0 gap-1">
                  <Crown className="size-3" />
                  Lv.{userProfile.level}
                </Badge>
              </div>
              <div className="text-center md:text-left mt-2">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{userProfile.name}</h2>
                <p className="text-slate-600">
                  {userProfile.position} · {userProfile.department}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {userProfile.email}
                </p>
              </div>
            </div>

            {/* 等级进度 */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-700">当前等级：Lv.{userProfile.level} {userProfile.levelName}</span>
                  <span className="text-slate-500 text-sm">平台排名 {userProfile.rank}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
                  <span>{userProfile.currentPoints} / {userProfile.nextLevelPoints} 积分</span>
                  <span>距离 Lv.{userProfile.nextLevel} 还需 {userProfile.nextLevelPoints - userProfile.currentPoints} 积分</span>
                </div>
              </div>

              {/* 成就数据 */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{userProfile.achievements.toolsCreated}</div>
                  <div className="text-slate-500 text-xs">贡献工具</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{userProfile.achievements.demandsCompleted}</div>
                  <div className="text-slate-500 text-xs">解决需求</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{userProfile.achievements.projectsCased}</div>
                  <div className="text-slate-500 text-xs">撰写案例</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{userProfile.achievements.totalLikes}</div>
                  <div className="text-slate-500 text-xs">获赞总数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{userProfile.achievements.averageRating}</div>
                  <div className="text-slate-500 text-xs">平均评分</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{userProfile.achievements.helpedUsers}</div>
                  <div className="text-slate-500 text-xs">帮助人数</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细信息标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">能力概览</TabsTrigger>
          <TabsTrigger value="works">我的项目</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
        </TabsList>

        {/* 能力概览 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 五边形雷达图 */}
          <Card>
            <CardHeader>
              <CardTitle>能力雷达图</CardTitle>
              <CardDescription>基于您的平台贡献自动生成</CardDescription>
            </CardHeader>
            <CardContent>
              <RadarChart />
              <p className="text-center text-sm text-slate-500 mt-4">
                数据来源于您的实际贡献，持续活跃可提升各项能力值
              </p>
            </CardContent>
          </Card>

          {/* 成就里程碑 */}
          <Card>
            <CardHeader>
              <CardTitle>里程碑成就</CardTitle>
              <CardDescription>完成更多项目解锁更多成就</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 opacity-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="size-6 text-amber-600" />
                    <span className="text-slate-900 font-medium">月度最佳工具</span>
                  </div>
                  <p className="text-slate-600 text-sm">暂未解锁</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 opacity-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="size-6 text-blue-600" />
                    <span className="text-slate-900 font-medium">千赞达成</span>
                  </div>
                  <p className="text-slate-600 text-sm">暂未解锁</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 opacity-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="size-6 text-green-600" />
                    <span className="text-slate-900 font-medium">乐于助人</span>
                  </div>
                  <p className="text-slate-600 text-sm">暂未解锁</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 opacity-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="size-6 text-purple-600" />
                    <span className="text-slate-900 font-medium">高分专家</span>
                  </div>
                  <p className="text-slate-600 text-sm">暂未解锁</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 我的项目 */}
        <TabsContent value="works" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>我的项目</CardTitle>
              <CardDescription>
                {loading ? '加载中...' : `共 ${myProjects.length} 个已发布项目`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-slate-500">
                  加载中...
                </div>
              ) : myProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>您还没有已发布的项目</p>
                  <p className="text-sm mt-2">创建项目后，审核通过即可在此查看</p>
                </div>
              ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border border-slate-100"
                  >
                    <div className="space-y-3">
                      {/* 图片展示区 */}
                      <div className={`relative aspect-video rounded-2xl overflow-hidden ${
                        project.category === '客服' ? 'bg-gradient-to-br from-orange-100 to-orange-200' :
                        project.category === '数据' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                        project.category === '创作' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                        'bg-gradient-to-br from-amber-100 to-amber-200'
                      } flex items-center justify-center`}>
                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {project.category === '客服' && '🤖'}
                          {project.category === '数据' && '📊'}
                          {project.category === '创作' && '✨'}
                          {project.category === '人力' && '👥'}
                        </div>
                      </div>

                      {/* 项目信息 */}
                      <div className="space-y-2">
                          <h3 className="text-sm line-clamp-2 min-h-[2.5rem] text-slate-900 font-medium">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {project.summary || project.shortDescription}
                          </p>
                        
                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-[10px]">
                                {(project.projectLead?.name || project.projectLead || '工').charAt(0)}
                            </div>
                            <span className="text-slate-600">负责人:</span>
                              <span>{project.projectLead?.name || project.projectLead}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <Button 
                            size="sm"
                            className="flex-1 h-9 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs rounded-full"
                          >
                            查看详情
                          </Button>
                          <div className="flex items-center gap-1 text-slate-600">
                            <Target className="size-4" />
                              <span className="text-xs">{project._count?.replications_rel || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 联系方式 */}
        <TabsContent value="contact">
          <UserProfileContact />
        </TabsContent>
      </Tabs>
    </div>
  );
}
