import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar, Users, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { projectsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface MyProjectsProps {
  onBack: () => void;
}

export function MyProjects({ onBack }: MyProjectsProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 状态映射
  const statusDisplayMap: Record<string, string> = {
    'REQUIREMENT_CONFIRMED': '需求已确认',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝',
    'SCHEDULED': '排期中',
    'IN_PRODUCTION': '生产中',
    'DELIVERED_NOT_DEPLOYED': '交付未投产',
    'DELIVERED_DEPLOYED': '交付已投产',
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    setIsLoading(true);
    try {
      // 获取所有项目
      const response = await projectsApi.list({});
      const allProjects = (response as any).items || [];
      
      // 筛选当前用户创建的项目或负责的项目
      const myProjects = allProjects.filter((p: any) => 
        p.requester?.id === user.id || 
        p.projectLead?.id === user.id ||
        p.developers?.some((d: any) => d.user?.id === user.id)
      );
      
      console.log('我的项目:', myProjects.length, '个');
      setProjects(myProjects);
    } catch (error: any) {
      console.error('加载我的项目失败:', error);
      toast.error('加载失败: ' + (error.message || '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = statusDisplayMap[status] || status;
    switch (status) {
      case 'REQUIREMENT_CONFIRMED': 
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300">{displayStatus}</Badge>;
      case 'APPROVED': 
        return <Badge className="bg-green-100 text-green-700 border-green-300">{displayStatus}</Badge>;
      case 'REJECTED': 
        return <Badge className="bg-red-100 text-red-700 border-red-300">{displayStatus}</Badge>;
      case 'SCHEDULED': 
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">{displayStatus}</Badge>;
      case 'IN_PRODUCTION': 
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">{displayStatus}</Badge>;
      case 'DELIVERED_NOT_DEPLOYED': 
        return <Badge className="bg-purple-100 text-purple-700 border-purple-300">{displayStatus}</Badge>;
      case 'DELIVERED_DEPLOYED': 
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">{displayStatus}</Badge>;
      default: 
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">{displayStatus}</Badge>;
    }
  };

  const getMyRole = (project: any) => {
    if (!user) return '';
    if (project.requester?.id === user.id) return '需求方';
    if (project.projectLead?.id === user.id) return '项目负责人';
    if (project.developers?.some((d: any) => d.user?.id === user.id)) return '开发人员';
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">加载我的项目...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 顶部导航 */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-black/10 shadow-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 hover:bg-black/5"
            >
              <ArrowLeft className="size-4" />
              返回
            </Button>
            <div className="h-6 w-px bg-black/20" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              我的项目
            </h1>
            <Badge variant="outline" className="ml-2">
              {projects.length} 个项目
            </Badge>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-slate-600 text-lg mb-2">还没有项目</p>
            <p className="text-slate-400 text-sm">创建或参与项目后，会在这里显示</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* 标题和状态 */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {project.title}
                      </h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="outline" className="text-xs">
                        {getMyRole(project)}
                      </Badge>
                    </div>
                  </div>

                  {/* 简介 */}
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {project.summary || '暂无简介'}
                  </p>

                  {/* 详细信息 */}
                  <div className="space-y-2 text-xs text-slate-500">
                    {/* 部门 */}
                    {project.department && (
                      <div className="flex items-center gap-2">
                        <Users className="size-3" />
                        <span>{project.department.name}</span>
                      </div>
                    )}

                    {/* 上架时间 */}
                    {project.publishTime && (
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3" />
                        <span>{new Date(project.publishTime).toLocaleDateString('zh-CN')}</span>
                      </div>
                    )}

                    {/* 量化成果 */}
                    {project.impact && (
                      <div className="flex items-start gap-2">
                        <Target className="size-3 mt-0.5" />
                        <span className="line-clamp-2">
                          {project.impact.efficiency || project.impact.costSaving || '暂无成果'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 底部操作 */}
                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => toast.info('查看详情功能开发中')}
                    >
                      查看详情
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

