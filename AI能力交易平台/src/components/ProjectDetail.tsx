import { ArrowLeft, MessageCircle, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { projectsApi } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface ProjectDetailProps {
  project: any; // 使用any以支持灵活的数据结构
  onBack: () => void;
}

export function ProjectDetail({ project: rawProject, onBack }: ProjectDetailProps) {
  // 标准化项目数据 - 处理API返回的复杂结构
  const project = {
    id: rawProject.id,
    title: rawProject.title,
    summary: rawProject.summary || rawProject.shortDescription || '',
    department: rawProject.department?.name || rawProject.department || '',
    requester: rawProject.requester?.name || rawProject.requester || '',
    requesterDepartment: rawProject.requesterDepartment || '',
    requesterName: rawProject.requesterName || rawProject.requester?.name || '', // 需求方姓名
    projectLead: rawProject.projectLead?.name || rawProject.projectLead || '',
    projectLeadDepartment: rawProject.projectLeadDepartment?.name || rawProject.projectLeadDepartment || '',
    developers: rawProject.developers || [], // 保留完整的developer对象（包含role）
    category: rawProject.category || '',
    publishTime: rawProject.publishTime || rawProject.createdAt || new Date().toISOString(),
    impact: rawProject.impact || {
      efficiency: '',
      costSaving: '',
      replication: '',
      satisfaction: ''
    },
    tags: rawProject.tags?.map((t: any) => t.tag?.name || t.name || t) || [],
    likes: rawProject.likes || rawProject._count?.likes_rel || 0,
    comments: rawProject.comments || rawProject._count?.comments_rel || 0,
    replications: rawProject.replications || rawProject._count?.replications_rel || 0,
    isFeatured: rawProject.isFeatured || false,
    // 新增字段
    background: rawProject.background || '',
    solution: rawProject.solution || '',
    features: rawProject.features || '',
    actualImpact: rawProject.actualImpact || '',
    estimatedImpact: rawProject.estimatedImpact || '',
    images: rawProject.images || '[]',
    videos: rawProject.videos || '[]',
    // ✅ 新增字段：业务信息
    empoweredDepartments: rawProject.empoweredDepartments || '',
    launchDate: rawProject.launchDate || '',
    // ✅ 项目创建者联系信息（从 projectLead 获取）
    creator: {
      name: rawProject.projectLead?.name || '',
      // 邮箱：必有（注册时填写）
      email: rawProject.projectLead?.email || '',
      // 电话：可选（个人中心填写）
      phone: rawProject.projectLead?.phone || '',
      // 飞书ID：可选（个人中心填写）
      feishuId: rawProject.projectLead?.feishuId || '',
      feishuUserId: rawProject.projectLead?.feishuUserId || '',
      // 二维码：可选（个人中心上传）
      qrCode: rawProject.projectLead?.qrCode || '',
      qrCodeType: rawProject.projectLead?.qrCodeType || 'feishu',
      // 隐私设置
      showPhone: rawProject.projectLead?.showPhone ?? true,
      showFeishu: rawProject.projectLead?.showFeishu ?? true,
      showQrCode: rawProject.projectLead?.showQrCode ?? false,
    },
  };

  const { user } = useAuth();
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 媒体展示索引
  const videos = project.videos ? JSON.parse(project.videos as string) : [];
  const images = project.images ? JSON.parse(project.images as string) : [];
  const mediaItems = [...(videos.length > 0 ? [{ type: 'video', src: videos[0] }] : []), ...images.map((img: string) => ({ type: 'image', src: img }))];
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };
  
  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  const [deployForm, setDeployForm] = useState({
    applicantName: user?.name || '',
    department: user?.department || '',
    contactPhone: '',
    email: user?.email || '',
    teamSize: '',
    urgency: 'normal',
    targetLaunchDate: '',
    businessScenario: '',
    expectedGoals: '',
    budgetRange: '',
    additionalNeeds: ''
  });
  
  // 评论功能暂未实现
  // const [comment, setComment] = useState('');
  // const [commentList, setCommentList] = useState([...]);

  // const handleAddComment = () => {
  //   if (comment.trim()) {
  //     const newComment = {
  //       name: '匿名用户',
  //       dept: '未知部门',
  //       avatar: 'A',
  //       time: '刚刚',
  //       content: comment,
  //       likes: 0
  //     };
  //     setCommentList([...commentList, newComment]);
  //     setComment('');
  //   }
  // };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto h-16 px-8 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            返回项目广场
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-[600px_1fr] gap-0">
          {/* 左侧：项目展示区 - 固定 */}
          <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* 项目视频/图片展示 - 箭头切换 */}
              <div>
                {/* 有视频或图片时 */}
                {mediaItems.length > 0 && (
                  <div className="relative">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      🎬 <span>项目展示</span>
                      <span className="text-sm text-slate-400 font-normal">
                        ({mediaItems.length}个)
                      </span>
                </h3>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
                      {/* 当前媒体 */}
                      {mediaItems[currentMediaIndex]?.type === 'video' ? (
                    <video 
                          src={mediaItems[currentMediaIndex].src} 
                      controls 
                      className="w-full h-full object-cover"
                          poster={images[0]}
                    >
                      您的浏览器不支持视频播放
                    </video>
                      ) : (
                        <img 
                          src={mediaItems[currentMediaIndex]?.src}
                          alt={`${project.title} - 图片${currentMediaIndex + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => window.open(mediaItems[currentMediaIndex]?.src, '_blank')}
                        />
                      )}
                      
                      {/* 左右箭头按钮 */}
                      {mediaItems.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevMedia}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10"
                            aria-label="上一张"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleNextMedia}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10"
                            aria-label="下一张"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* 指示器 */}
                      {mediaItems.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {mediaItems.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentMediaIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentMediaIndex 
                                  ? 'bg-white w-6' 
                                  : 'bg-white/40 hover:bg-white/60'
                              }`}
                              aria-label={`切换到第${idx + 1}个`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 无媒体时显示分类图标 */}
                {(!project.videos || JSON.parse(project.videos as string).length === 0) && 
                 (!project.images || JSON.parse(project.images as string).length === 0) && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      🎬 <span>项目演示</span>
                    </h3>
                    <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative group shadow-xl">
                    <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                      {project.category === '客服' && '🤖'}
                      {project.category === '数据' && '📊'}
                      {project.category === '创作' && '✨'}
                      {project.category === '人力' && '👥'}
                      {project.category === '财务' && '💰'}
                      {project.category === '法务' && '⚖️'}
                      {project.category === '供应链' && '🚚'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 项目详细介绍 */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  📝 <span>项目介绍</span>
                </h3>
                <div className="space-y-4 text-sm text-slate-300 leading-relaxed bg-white/5 rounded-lg p-4 border border-white/10">
                  
                  {/* ✅ 1. 项目背景 */}
                  {project.background && (
                    <div>
                      <h4 className="text-white font-medium mb-2">🎯 项目背景</h4>
                      <p>{project.background}</p>
                    </div>
                  )}
                  
                  {/* ✅ 2. 解决方案 */}
                  {project.solution && (
                    <div>
                      <h4 className="text-white font-medium mb-2">💡 解决方案</h4>
                      <p>{project.solution}</p>
                    </div>
                  )}
                  
                  {/* ✅ 3. 核心功能 */}
                  {project.features && (
                    <div>
                      <h4 className="text-white font-medium mb-2">🚀 核心功能</h4>
                      <ul className="space-y-2 ml-4">
                        {project.features.split('\n').filter((f: string) => f.trim()).map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{feature.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* ✅ 4. 实施效果（优先显示真实效果） */}
                  {(project.actualImpact || project.estimatedImpact) && (
                    <div>
                      {project.actualImpact ? (
                        <>
                          <h4 className="text-white font-medium mb-2">📈 实施效果</h4>
                          <p>{project.actualImpact}</p>
                        </>
                      ) : (
                        <>
                          <h4 className="text-white font-medium mb-2">📈 实施效果（预估）</h4>
                          <p>{project.estimatedImpact}</p>
                        </>
                      )}
                    </div>
                  )}
                  
                </div>
              </div>

              {/* 使用场景 */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  🏢 <span>适用场景</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-purple-400 text-2xl mb-2">📊</div>
                    <div className="text-sm text-white font-medium mb-1">数据处理</div>
                    <div className="text-xs text-slate-300">大量数据自动化处理</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-blue-400 text-2xl mb-2">🤝</div>
                    <div className="text-sm text-white font-medium mb-1">客户服务</div>
                    <div className="text-xs text-slate-300">智能客户响应系统</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-green-400 text-2xl mb-2">⚡</div>
                    <div className="text-sm text-white font-medium mb-1">流程优化</div>
                    <div className="text-xs text-slate-300">业务流程智能化</div>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="text-amber-400 text-2xl mb-2">💡</div>
                    <div className="text-sm text-white font-medium mb-1">创新应用</div>
                    <div className="text-xs text-slate-300">AI驱动业务创新</div>
                  </div>
                </div>
              </div>

              {/* ❌ 技术栈已删除 */}
            </div>
          </div>

          {/* 右侧：项目信息区 - 可滚动 */}
          <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              {/* 融合的大卡片 */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-sm space-y-3">
                {/* 项目标题区 */}
                <div>
                  <h1 className="text-xl font-bold text-white mb-2">{project.title}</h1>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {project.summary}
                  </p>

                  {/* ✅ 关键效果 - 放在标题和副标题下面 */}
                  <div className="mb-4 pt-3 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    📊 <span>关键效果</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3 auto-rows-fr">
                    
                    {/* 效率提升 */}
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">效率提升</div>
                        <div className="text-xl font-bold text-emerald-400">
                          {project.impact?.efficiency && project.impact.efficiency.trim() 
                            ? project.impact.efficiency 
                            : '暂无数据'}
                        </div>
                      </div>

                    {/* 成本节约 */}
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">成本节约</div>
                        <div className="text-xl font-bold text-blue-400">
                          {project.impact?.costSaving && project.impact.costSaving.trim() 
                            ? project.impact.costSaving 
                            : '暂无数据'}
                        </div>
                      </div>

                      {/* 复用次数 - 始终显示，没有数据时显示0 */}
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">复用次数</div>
                        <div className="text-xl font-bold text-purple-400">
                          {project.replications || 0}
                          <span className="text-sm ml-1">次</span>
                        </div>
                      </div>

                    {/* 满意度 */}
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">满意度</div>
                        <div className="text-xl font-bold text-amber-400">
                          {project.impact?.satisfaction && project.impact.satisfaction.trim() 
                            ? project.impact.satisfaction 
                            : '暂无数据'}
                        </div>
                      </div>

                  </div>
                </div>

                  {/* ✅ 业务信息 - 显示业务范畴、赋能业务部门、上线日期 */}
                  {(project.category || project.empoweredDepartments || project.launchDate) && (
                    <div className="pt-3 border-t border-white/10">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        🏢 <span>业务信息</span>
                      </h3>
                      <div className="space-y-2.5 text-xs">
                        {/* 业务范畴 */}
                        {project.category && (
                          <div>
                            <div className="text-slate-400 mb-1.5">业务范畴</div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {project.category.split('、').filter((c: string) => c.trim()).map((cat: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {cat.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 赋能业务部门 */}
                        {project.empoweredDepartments && (
                          <div>
                            <div className="text-slate-400 mb-1">赋能业务部门</div>
                            <div className="text-slate-200 bg-slate-800/50 rounded-lg px-3 py-2">
                              {project.empoweredDepartments}
                            </div>
                          </div>
                        )}
                        
                        {/* 上线日期 */}
                        {project.launchDate && (
                          <div>
                            <div className="text-slate-400 mb-1">上线日期</div>
                            <div className="text-slate-200 bg-slate-800/50 rounded-lg px-3 py-2">
                              {new Date(project.launchDate).toLocaleDateString('zh-CN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {project.tags.map((tag: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 border-white/20 text-slate-200">
                        {typeof tag === 'string' ? tag : tag.name || tag.tag?.name || ''}
                      </Badge>
                    ))}
                  </div>
                </div>


                {/* 项目团队 */}
                <div className="pt-3">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                    <span>👥</span>
                    <span>项目团队</span>
                  </h3>
                  <div className="space-y-1.5">
                    {/* 项目负责人 */}
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs flex-shrink-0">
                        {project.projectLead.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white">{project.projectLead}</div>
                        <div className="text-[10px] text-slate-300 truncate">项目负责人 · {project.projectLeadDepartment}</div>
                      </div>
                    </div>

                    {/* 工程师（除了第一个负责人之外的所有实施者） */}
                    {project.developers && project.developers.filter((d: any) => d.role === '工程师').length > 0 && (
                    <div className="pt-1.5">
                        <div className="text-[10px] text-slate-300 mb-1.5 font-medium">
                          工程师 ({project.developers.filter((d: any) => d.role === '工程师').length}人)
                        </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                          {project.developers
                            .filter((d: any) => d.role === '工程师')
                            .map((dev: any, idx: number) => {
                              const devName = dev.user?.name || dev.name || '';
                              return (
                                <div 
                                  key={dev.id || idx}
                            className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg"
                          >
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0"
                              style={{
                                      background: idx === 0 ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' :
                                                   idx === 1 ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' :
                                           'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              }}
                            >
                                    {devName.charAt(0)}
                                  </div>
                                  <span className="text-[10px] text-slate-200">{devName}</span>
                            </div>
                              );
                            })}
                          </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2 pt-3">
                  <Button className="w-full h-9 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs font-medium shadow-lg hover:shadow-xl transition-all" onClick={() => setShowDeployDialog(true)}>
                    申请部署方案
                  </Button>
                <Button variant="outline" className="w-full h-9 text-xs font-medium border-slate-300 text-slate-900 hover:bg-slate-200 bg-white shadow-sm" onClick={() => setShowContactDialog(true)}>
                    咨询实施者
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 部署申请对话框 */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl border-0">
          <DialogHeader className="pb-4 border-b border-slate-200">
            <DialogTitle className="text-xl font-bold text-slate-900">申请部署方案</DialogTitle>
            <DialogDescription className="text-slate-600">
              请填写以下信息，项目负责人会尽快与您联系
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 overflow-y-auto pr-2 flex-1 py-2">
            {/* 基本信息卡片 */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                👤 <span>基本信息</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="applicantName" className="text-sm text-slate-700 font-medium">申请人姓名 <span className="text-red-500">*</span></Label>
              <Input
                id="applicantName"
                value={deployForm.applicantName}
                onChange={(e) => setDeployForm({ ...deployForm, applicantName: e.target.value })}
                placeholder="请输入您的姓名"
                    className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm text-slate-700 font-medium">部门 <span className="text-red-500">*</span></Label>
              <Input
                id="department"
                value={deployForm.department}
                onChange={(e) => setDeployForm({ ...deployForm, department: e.target.value })}
                placeholder="请输入您的部门"
                    className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm text-slate-700 font-medium">联系电话</Label>
              <Input
                id="contactPhone"
                value={deployForm.contactPhone}
                onChange={(e) => setDeployForm({ ...deployForm, contactPhone: e.target.value })}
                placeholder="请输入您的联系电话"
                    className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-slate-700 font-medium">电子邮件</Label>
              <Input
                id="email"
                value={deployForm.email}
                onChange={(e) => setDeployForm({ ...deployForm, email: e.target.value })}
                placeholder="请输入您的电子邮件"
                    className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-purple-500"
              />
                </div>
              </div>
            </div>
            {/* 项目信息卡片 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                📋 <span>项目信息</span>
              </h4>
              <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-sm text-slate-700 font-medium">团队规模</Label>
              <Input
                id="teamSize"
                value={deployForm.teamSize}
                onChange={(e) => setDeployForm({ ...deployForm, teamSize: e.target.value })}
                    placeholder="如：5人、10-20人"
                    className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="urgency" className="text-sm text-slate-700 font-medium">紧急程度</Label>
              <Select
                value={deployForm.urgency}
                onValueChange={(value) => setDeployForm({ ...deployForm, urgency: value })}
              >
                    <SelectTrigger className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                      <SelectItem value="normal">🟢 普通</SelectItem>
                      <SelectItem value="urgent">🟡 紧急</SelectItem>
                      <SelectItem value="critical">🔴 关键</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                  <Label htmlFor="targetLaunchDate" className="text-sm text-slate-700 font-medium">目标上线日期</Label>
              <Input
                id="targetLaunchDate"
                type="date"
                value={deployForm.targetLaunchDate}
                onChange={(e) => setDeployForm({ ...deployForm, targetLaunchDate: e.target.value })}
                    className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              />
                </div>
              </div>
            </div>
            {/* 需求描述卡片 */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                💡 <span>需求描述</span>
              </h4>
            <div className="space-y-2">
                <Label htmlFor="businessScenario" className="text-sm text-slate-700 font-medium">业务场景 <span className="text-red-500">*</span></Label>
              <Textarea
                id="businessScenario"
                value={deployForm.businessScenario}
                onChange={(e) => setDeployForm({ ...deployForm, businessScenario: e.target.value })}
                placeholder="请描述您的业务场景，例如：我们部门需要处理大量的客户咨询，希望通过AI自动回复减轻人工压力"
                  className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="expectedGoals" className="text-sm text-slate-700 font-medium">预期目标</Label>
              <Textarea
                id="expectedGoals"
                value={deployForm.expectedGoals}
                onChange={(e) => setDeployForm({ ...deployForm, expectedGoals: e.target.value })}
                placeholder="请描述您的预期目标，例如：希望提升处理效率50%，降低人工成本，提高客户满意度"
                  className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="budgetRange" className="text-sm text-slate-700 font-medium">预算范围</Label>
              <Input
                id="budgetRange"
                value={deployForm.budgetRange}
                onChange={(e) => setDeployForm({ ...deployForm, budgetRange: e.target.value })}
                  placeholder="如：5-10万、10-20万等"
                  className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="additionalNeeds" className="text-sm text-slate-700 font-medium">其他需求</Label>
              <Textarea
                id="additionalNeeds"
                value={deployForm.additionalNeeds}
                onChange={(e) => setDeployForm({ ...deployForm, additionalNeeds: e.target.value })}
                  placeholder="如：需要培训支持、定制化需求、数据迁移等"
                  className="border-0 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-none"
              />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 mt-4 border-t border-slate-200 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeployDialog(false)}
              className="flex-1 border-slate-300 hover:bg-slate-100"
            >
              取消
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
              disabled={isSubmitting}
              onClick={async () => {
                // 验证必填项
                if (!deployForm.applicantName || !deployForm.department || !deployForm.businessScenario) {
                  console.error('❌ 表单验证失败 - 缺少必填项');
                  toast.error('请填写必填项：申请人姓名、部门、业务场景');
                  return;
                }
                
                console.log('==================== 开始提交部署申请 ====================');
                console.log('📋 申请信息:');
                console.log('  项目ID:', project.id);
                console.log('  项目标题:', project.title);
                console.log('  申请人姓名:', deployForm.applicantName);
                console.log('  申请人部门:', deployForm.department);
                console.log('  联系电话:', deployForm.contactPhone || '未填写');
                console.log('  电子邮件:', deployForm.email || '未填写');
                console.log('  团队规模:', deployForm.teamSize || '未填写');
                console.log('  紧急程度:', deployForm.urgency);
                console.log('  目标上线日期:', deployForm.targetLaunchDate || '未填写');
                console.log('  业务场景:', deployForm.businessScenario.substring(0, 50) + '...');
                console.log('  预期目标:', deployForm.expectedGoals ? deployForm.expectedGoals.substring(0, 50) + '...' : '未填写');
                console.log('  预算范围:', deployForm.budgetRange || '未填写');
                console.log('  其他需求:', deployForm.additionalNeeds ? deployForm.additionalNeeds.substring(0, 50) + '...' : '未填写');
                console.log('  用户信息:', user);
                console.log('========================================================');
                
                setIsSubmitting(true);
                try {
                  console.log('📤 正在发送API请求...');
                  const requestData = {
                    ...deployForm,
                    // departmentId会从用户token中获取
                  };
                  console.log('📦 请求数据:', JSON.stringify(requestData, null, 2));
                  
                  const response = await projectsApi.applyReplication(project.id, requestData);
                  
                  console.log('✅ API请求成功！');
                  console.log('📥 服务器响应:', response);
                  console.log('========================================================');
                  
                  toast.success('申请已提交成功！项目负责人会尽快与您联系。', {
                    description: `申请ID: ${response.id || '已生成'}，请等待审核`
                  });
                setShowDeployDialog(false);
                  
                  // 清空表单
                  setDeployForm({
                    applicantName: user?.name || '',
                    department: user?.department || '',
                    contactPhone: '',
                    email: user?.email || '',
                    teamSize: '',
                    urgency: 'normal',
                    targetLaunchDate: '',
                    businessScenario: '',
                    expectedGoals: '',
                    budgetRange: '',
                    additionalNeeds: ''
                  });
                } catch (error: any) {
                  console.error('==================== 提交失败 ====================');
                  console.error('❌ 错误类型:', error.name);
                  console.error('❌ 错误信息:', error.message);
                  console.error('❌ 错误堆栈:', error.stack);
                  console.error('❌ 完整错误对象:', error);
                  if (error.response) {
                    console.error('❌ HTTP状态码:', error.response.status);
                    console.error('❌ 响应数据:', error.response.data);
                    console.error('❌ 响应头:', error.response.headers);
                  }
                  console.error('====================================================');
                  toast.error(error.message || '提交失败，请稍后重试', {
                    description: '请联系技术支持或查看控制台日志'
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? '提交中...' : '提交申请'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 咨询实施者对话框 - 简洁白底设计 */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md w-[90vw] sm:w-[400px] bg-white shadow-lg rounded-xl border border-slate-200 p-0 max-h-[75vh] overflow-hidden flex flex-col animate-slide-up">
          <div className="relative z-10">
            <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-200 flex-shrink-0">
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-xl">💬</span>
                <span>联系项目实施者</span>
              </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-1">
              选择您偏好的联系方式与项目负责人沟通
            </DialogDescription>
          </DialogHeader>
          
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <div className="space-y-3">
              {/* 项目负责人信息卡片 - 白色风格 */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MessageCircle className="size-6 text-white" />
                  </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900">{project.projectLead}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {project.projectLeadDepartment} · 项目负责人
                    </div>
                  </div>
              </div>
            </div>

            {/* 分隔线 - 白色风格 */}
              <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                  <span className="bg-white px-3 py-0.5 text-xs text-slate-500 font-medium">选择联系方式</span>
                </div>
              </div>

              {/* 飞书联系卡片（如果有飞书ID） */}
              {project.creator?.feishuId && project.creator.showFeishu && (
                <div
                  className="bg-blue-50 rounded-lg p-3 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => {
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    const isFeishu = /Lark|Feishu/i.test(navigator.userAgent);
                    
                    if (!isMobile && !isFeishu) {
                      // 桌面端：复制飞书ID
                      navigator.clipboard.writeText(project.creator.feishuId);
                      toast.success('飞书账号已复制！', {
                        description: '请打开飞书客户端搜索添加'
                      });
                    } else {
                      // 移动端或飞书内：尝试打开
                      window.location.href = `feishu://open/user?uid=${project.creator.feishuUserId || project.creator.feishuId}`;
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="size-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-semibold text-slate-900">飞书联系</span>
                        <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium">推荐</span>
                    </div>
                      <div className="text-xs text-blue-700 font-mono truncate">
                        {project.creator.feishuId}
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {/* 邮箱联系卡片（固定邮箱） */}
              <div 
                className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText('wangdong@51talk.com');
                  toast.success('邮箱已复制！', {
                    description: '可以粘贴到邮件客户端发送'
                  });
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="size-5 text-white" />
                </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 mb-1">邮箱联系</div>
                    <div className="text-xs text-slate-700 truncate">
                    wangdong@51talk.com
              </div>
            </div>
                </div>
              </div>

              {/* 电话联系卡片（可选 - 个人中心填写） */}
              {project.creator?.phone && project.creator.showPhone && (
                <div 
                  className="bg-green-50 rounded-lg p-3 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(project.creator.phone);
                    toast.success('电话已复制！', {
                      description: '可以粘贴到拨号应用'
                    });
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="size-5 text-white" />
                  </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 mb-1">电话联系</div>
                      <div className="text-sm text-green-800 font-medium">
                      {project.creator.phone}
                </div>
              </div>
                  </div>
                </div>
              )}

              {/* 二维码卡片（可选 - 个人中心上传） */}
              {project.creator?.qrCode && project.creator.showQrCode && (
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2">
                    <img 
                      src={project.creator.qrCode} 
                      alt={`${project.creator.qrCodeType === 'wechat' ? '微信' : '飞书'}二维码`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                      <p className="text-xs font-semibold text-slate-900 mb-0.5">
                      扫描{project.creator.qrCodeType === 'wechat' ? '微信' : '飞书'}二维码
                    </p>
                      <p className="text-xs text-slate-600">
                      使用{project.creator.qrCodeType === 'wechat' ? '微信' : '飞书'}扫一扫添加
                    </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 温馨提示卡片 */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm">💡</span>
                  <span className="font-semibold text-xs text-amber-900">温馨提示</span>
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex items-start gap-1">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>优先使用飞书，响应更快</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>邮箱适合详细需求说明</span>
                  </div>
                  {project.creator?.phone && project.creator.showPhone && (
                    <div className="flex items-start gap-1">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>紧急事项可直接电话沟通</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
            <DialogFooter className="px-5 py-3 border-t border-slate-200 bg-white relative z-10 flex-shrink-0">
              <Button
                onClick={() => setShowContactDialog(false)}
                className="w-full h-8 bg-slate-900 text-white hover:bg-slate-800 font-medium text-sm"
              >
                我知道了
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
        
        {/* CSS动画样式 - 简单的从下往上滑入动画 */}
        <style>{`
          @keyframes slide-up {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>
      </Dialog>
    </div>
  );
}