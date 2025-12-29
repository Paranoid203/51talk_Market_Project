import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { projectsApi } from '../lib/api';
import { toast } from 'sonner';

interface ProjectReviewProps {
  onBack: () => void;
}

interface PendingProject {
  id: string;
  name: string;
  implementers: string[];
  summary: string;
  status: string;
  categories: string[];
  departments: string[];
  launchDate: string;
  quantifiedResults: string;
  submitTime: string;
  submitter: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

export function ProjectReview({ onBack }: ProjectReviewProps) {
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 状态映射：后端状态 -> 前端显示
  const statusDisplayMap: Record<string, string> = {
    'REQUIREMENT_CONFIRMED': '需求已确认',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝',
    'SCHEDULED': '排期中',
    'IN_PRODUCTION': '生产中',
    'DELIVERED_NOT_DEPLOYED': '交付未投产',
    'DELIVERED_DEPLOYED': '交付已投产',
  };

  // 从API获取待审核项目
  const fetchPendingProjects = async () => {
    setIsLoading(true);
    try {
      console.log('开始获取待审核项目...');
      
      // ✅ 根据审核状态查询：获取待审核和已拒绝的项目
      const pendingResponse = await projectsApi.list({ reviewStatus: 'PENDING' });
      const rejectedResponse = await projectsApi.list({ reviewStatus: 'REJECTED' });
      
      console.log('待审核项目响应:', pendingResponse);
      console.log('已拒绝项目响应:', rejectedResponse);
      
      // 合并待审核和已拒绝的项目
      let projects: any[] = [];
      
      // 解析待审核项目
      if (pendingResponse && typeof pendingResponse === 'object') {
        if ('items' in pendingResponse && Array.isArray((pendingResponse as any).items)) {
          projects.push(...(pendingResponse as any).items);
        } else if (Array.isArray(pendingResponse)) {
          projects.push(...pendingResponse);
        }
      }
      
      // 解析已拒绝项目
      if (rejectedResponse && typeof rejectedResponse === 'object') {
        if ('items' in rejectedResponse && Array.isArray((rejectedResponse as any).items)) {
          projects.push(...(rejectedResponse as any).items);
        } else if (Array.isArray(rejectedResponse)) {
          projects.push(...rejectedResponse);
        }
      }
      
      console.log('解析后的项目列表:', projects);
      console.log('项目数量:', projects.length);
      
      // 转换API数据格式为前端格式
      const convertedProjects: PendingProject[] = projects.map((project: any) => ({
        id: project.id.toString(),
        name: project.title,
        implementers: project.developers?.length > 0 
          ? project.developers.map((d: any) => d.user?.name || '未知')
          : project.projectLead?.name 
            ? [project.projectLead.name]
            : ['未知'],
        summary: project.summary,
        status: statusDisplayMap[project.status] || project.status,
        categories: project.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [project.category],
        departments: project.department ? [project.department.name] : [],
        launchDate: project.publishTime ? new Date(project.publishTime).toISOString().split('T')[0] : '',
        quantifiedResults: project.impact ? 
          `${project.impact.efficiency || ''} ${project.impact.costSaving || ''}`.trim() : '',
        submitTime: new Date(project.createdAt).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        submitter: project.requester?.name || '未知',
        // ✅ 根据 reviewStatus 设置审核状态
        reviewStatus: project.reviewStatus === 'APPROVED' ? 'approved' : 
                     project.reviewStatus === 'REJECTED' ? 'rejected' : 'pending',
      }));

      console.log('转换后的项目列表:', convertedProjects);
      setPendingProjects(convertedProjects);
    } catch (error: any) {
      console.error('获取待审核项目失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // 显示详细的错误信息
      const errorMessage = error.message || '网络错误';
      toast.error(`获取待审核项目失败: ${errorMessage}`, {
        description: '请检查：1) 后端服务是否运行；2) 是否已登录；3) 网络连接是否正常',
        duration: 5000,
      });
      
      // 如果API失败，使用空数组
      setPendingProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    console.log('ProjectReview组件已挂载，开始获取数据...');
    fetchPendingProjects();
    
    // 监听刷新事件
    const handleRefresh = () => {
      console.log('收到刷新事件，重新获取数据...');
      fetchPendingProjects();
    };
    window.addEventListener('refreshProjects', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshProjects', handleRefresh);
    };
  }, []);

  const handleReview = (project: PendingProject, action: 'approve' | 'reject') => {
    setSelectedProject(project);
    setReviewAction(action);
    setReviewDialogOpen(true);
    setReviewComment('');
  };

  const confirmReview = async () => {
    if (!selectedProject) return;

    try {
      if (reviewAction === 'approve') {
        // ✅ 审核通过：reviewStatus 变更为 APPROVED，项目会显示在项目广场
        await projectsApi.update(parseInt(selectedProject.id), {
          reviewStatus: 'APPROVED',
        });

        // 更新本地状态
        setPendingProjects(pendingProjects.map(p => 
          p.id === selectedProject.id 
            ? { ...p, reviewStatus: 'approved' }
            : p
        ));

        toast.success('✅ 项目审核通过！', {
          description: '项目将在项目广场展示',
        });

        // 通知项目广场刷新
        setTimeout(() => {
          window.dispatchEvent(new Event('refreshProjectShowcase'));
        }, 800);
      } else {
        // ✅ 审核拒绝：reviewStatus 变更为 REJECTED，项目不显示在项目广场
        await projectsApi.update(parseInt(selectedProject.id), {
          reviewStatus: 'REJECTED',
        });

        // 更新本地状态
        setPendingProjects(pendingProjects.map(p => 
          p.id === selectedProject.id 
            ? { ...p, status: 'REJECTED', reviewStatus: 'rejected' }
            : p
        ));

        toast.success('❌ 项目已拒绝', {
          description: '项目将在待审核列表显示为"已拒绝"状态',
        });
      }

      setReviewDialogOpen(false);
      setSelectedProject(null);
      
      // 刷新审核列表
      setTimeout(() => fetchPendingProjects(), 500);
    } catch (error: any) {
      console.error('审核操作失败:', error);
      toast.error('审核操作失败: ' + (error.message || '未知错误'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '需求已确认': return 'bg-slate-100 text-slate-700 border-slate-300';
      case '已通过': return 'bg-green-100 text-green-700 border-green-300';
      case '已拒绝': return 'bg-red-100 text-red-700 border-red-300';
      case '排期中': return 'bg-blue-100 text-blue-700 border-blue-300';
      case '生产中': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case '交付未投产': return 'bg-purple-100 text-purple-700 border-purple-300';
      case '交付已投产': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getReviewStatusBadge = (reviewStatus: 'pending' | 'approved' | 'rejected') => {
    switch (reviewStatus) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300"><Clock className="size-3 mr-1" />待审核</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="size-3 mr-1" />已通过</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300"><XCircle className="size-3 mr-1" />已拒绝</Badge>;
    }
  };

  const pendingCount = pendingProjects.filter(p => p.reviewStatus === 'pending').length;
  const approvedCount = pendingProjects.filter(p => p.reviewStatus === 'approved').length;
  const rejectedCount = pendingProjects.filter(p => p.reviewStatus === 'rejected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                返回
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-xl font-bold text-slate-900">项目审核</h1>
            </div>

            {/* 统计卡片和刷新按钮 */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPendingProjects}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Clock className="size-4 text-amber-600" />
                <span className="text-sm text-slate-700">待审核</span>
                <span className="text-lg font-bold text-amber-600">{pendingCount}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm text-slate-700">已通过</span>
                <span className="text-lg font-bold text-green-600">{approvedCount}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="size-4 text-red-600" />
                <span className="text-sm text-slate-700">已拒绝</span>
                <span className="text-lg font-bold text-red-600">{rejectedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-purple-600" />
            <span className="ml-3 text-slate-600">加载中...</span>
          </div>
        ) : pendingProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="size-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无待审核项目</h3>
            <p className="text-sm text-slate-500">所有项目都已审核完成，或还没有新项目提交</p>
          </Card>
        ) : (
        <div className="space-y-4">
          {pendingProjects.map((project) => (
            <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                {/* 左侧内容 */}
                <div className="flex-1 space-y-3">
                  {/* 标题行 */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
                        {getReviewStatusBadge(project.reviewStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>提交人：{project.submitter}</span>
                        <span>·</span>
                        <span>提交时间：{project.submitTime}</span>
                        <span>·</span>
                        <span>负责人：{project.implementers[0]}</span>
                        {project.implementers.length > 1 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.implementers.length - 1} 人
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusBadge(project.status)}>
                      {project.status}
                    </Badge>
                  </div>

                  {/* 简介 */}
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">
                    {project.summary}
                  </p>

                  {/* 详细信息网格 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 业务范畴 */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1.5">业务范畴</div>
                      <div className="flex gap-1.5 flex-wrap">
                        {project.categories.length > 0 ? (
                          project.categories.map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">未填写</span>
                        )}
                      </div>
                    </div>

                    {/* 赋能部门 */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1.5">赋能部门</div>
                      <div className="text-sm text-slate-700">
                        {project.departments.length > 0 ? project.departments.join('、') : '未填写'}
                      </div>
                    </div>

                    {/* 上线日期 */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1.5">上线日期</div>
                      <div className="text-sm text-slate-700">
                        {project.launchDate || '未填写'}
                      </div>
                    </div>

                    {/* 团队成员 */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1.5">项目团队</div>
                      <div className="text-sm text-slate-700">
                        {project.implementers.join('、')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧操作按钮 */}
                {project.reviewStatus === 'pending' && (
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Button
                      onClick={() => handleReview(project, 'approve')}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="size-4" />
                      通过审核
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReview(project, 'reject')}
                      className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="size-4" />
                      拒绝
                    </Button>
                  </div>
                )}

                {/* 已审核标记 */}
                {project.reviewStatus !== 'pending' && (
                  <div className="min-w-[140px] flex items-center justify-center">
                    {project.reviewStatus === 'approved' ? (
                      <div className="text-center">
                        <CheckCircle className="size-12 text-green-500 mx-auto mb-2" />
                        <div className="text-sm font-medium text-green-700">已通过</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <XCircle className="size-12 text-red-500 mx-auto mb-2" />
                        <div className="text-sm font-medium text-red-700">已拒绝</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
              </div>
          )}
      </div>

      {/* 审核确认对话框 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approve' ? (
                <>
                  <CheckCircle className="size-5 text-green-600" />
                  <span>通过审核</span>
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-red-600" />
                  <span>拒绝项目</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? '确认通过该项目的审核，项目将正式上架' 
                : '拒绝该项目，提交人可以修改后重新提交'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium text-slate-900 mb-1">
                项目名称：{selectedProject?.name}
              </div>
              <div className="text-xs text-slate-600">
                提交人：{selectedProject?.submitter}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 mb-2 block">
                审核意见（选填）
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={reviewAction === 'approve' ? '可以填写通过理由或改进建议...' : '请说明拒绝原因...'}
                className="min-h-[100px] resize-none"
              />
            </div>

            {reviewAction === 'approve' ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  ✅ 通过后，项目将正式上架到项目广场，所有用户可见
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">
                  ⚠️ 拒绝后，项目不会上架，提交人可以修改后重新提交
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={confirmReview}
              className={reviewAction === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewAction === 'approve' ? '确认通过' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}