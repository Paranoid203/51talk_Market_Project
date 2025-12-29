import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { projectsApi } from '../lib/api';
import { toast } from 'sonner';
import { 
  Clock, CheckCircle, XCircle, Sparkles, 
  User, Mail, Phone, Calendar, Target, FileText,
  Loader2, Building2, Bot, Quote
} from 'lucide-react';

interface Replication {
  id: number;
  projectId: number;
  replicatorId: number;
  status: 'APPLIED' | 'APPROVED' | 'DEPLOYED';
  appliedAt: string;
  deployedAt?: string;
  applicantName: string;
  department: string;
  contactPhone?: string;
  email: string;
  teamSize?: string;
  urgency: string;
  targetLaunchDate?: string;
  businessScenario: string;
  expectedGoals?: string;
  budgetRange?: string;
  additionalNeeds?: string;
  aiAnalysis?: string;
  aiAnalysisAt?: string;
  project: {
    id: number;
    title: string;
    category: string;
  };
  replicator: {
    id: number;
    name: string;
    email: string;
    department?: string;
  };
}

// Markdown 渲染器 - 美化AI分析报告
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const key = `line-${index}`;
    const trimmedLine = line.trim();

    // 一级标题
    if (trimmedLine.startsWith('# ')) {
      renderedElements.push(
        <h2 key={key} className="text-xl font-bold text-slate-900 mt-6 mb-3 first:mt-0 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          {trimmedLine.replace('# ', '')}
        </h2>
      );
    } 
    // 二级标题
    else if (trimmedLine.startsWith('## ')) {
      renderedElements.push(
        <h3 key={key} className="text-lg font-bold text-slate-800 mt-5 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"></span>
          {trimmedLine.replace('## ', '')}
        </h3>
      );
    } 
    // 三级标题
    else if (trimmedLine.startsWith('### ')) {
      renderedElements.push(
        <h4 key={key} className="text-base font-bold text-slate-700 mt-4 mb-2 pl-4 border-l-2 border-purple-300">
          {trimmedLine.replace('### ', '')}
        </h4>
      );
    } 
    // 列表项
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2);
      const parts = text.split(/(\*\*.*?\*\*)/g);
      renderedElements.push(
        <div key={key} className="flex items-start gap-3 mb-2 ml-1">
          <span className="text-purple-400 mt-1.5 text-lg">•</span>
          <p className="text-slate-700 leading-relaxed text-sm flex-1">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="font-bold text-slate-900 bg-yellow-50 px-1.5 py-0.5 rounded">{part.slice(2, -2)}</span>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        </div>
      );
    } 
    // 空行
    else if (trimmedLine === '') {
      renderedElements.push(<div key={key} className="h-2" />);
    } 
    // 普通文本
    else {
      const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
      renderedElements.push(
        <p key={key} className="text-slate-700 leading-relaxed mb-3 text-sm pl-4">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <span key={i} className="font-bold text-slate-900 bg-blue-50 px-1.5 py-0.5 rounded">{part.slice(2, -2)}</span>;
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    }
  });

  return <div className="markdown-content">{renderedElements}</div>;
}

export function ReplicationManagement() {
  const [replications, setReplications] = useState<Replication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReplication, setSelectedReplication] = useState<Replication | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'aiAnalysis'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'scenario' | 'goals' | 'urgency' | 'resources' | 'suggestions' | 'comprehensive'>('scenario');

  useEffect(() => {
    fetchReplications();
  }, [statusFilter]);

  const fetchReplications = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getReplications(
        statusFilter !== 'all' ? { status: statusFilter } : undefined
      );
      setReplications(data || []);
    } catch (error: any) {
      console.error('获取申请列表失败:', error);
      toast.error('获取申请列表失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (replicationId: number, newStatus: string) => {
    try {
      await projectsApi.updateReplicationStatus(replicationId, newStatus);
      toast.success('状态更新成功');
      fetchReplications();
      if (selectedReplication?.id === replicationId) {
        setViewMode('list');
      }
    } catch (error: any) {
      console.error('更新状态失败:', error);
      toast.error('更新失败: ' + (error.message || '未知错误'));
    }
  };

  const handleAnalyze = async (replication: Replication) => {
    try {
      setAnalyzing(replication.id);
      
      // 调用后端AI分析API
      const result = await projectsApi.analyzeReplication(replication.id);
      
      toast.success('AI分析完成');
      
      // 刷新列表以显示分析结果
      fetchReplications();
      
      // 如果当前查看的是这个申请的详情，更新详情
      if (selectedReplication?.id === replication.id) {
        setSelectedReplication(result);
      }
    } catch (error: any) {
      console.error('AI分析失败:', error);
      toast.error('AI分析失败: ' + (error.message || '未知错误'));
    } finally {
      setAnalyzing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="size-3 mr-1" />待审核</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="size-3 mr-1" />已批准</Badge>;
      case 'DEPLOYED':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200"><CheckCircle className="size-3 mr-1" />已部署</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return <Badge className="bg-red-100 text-red-700 border-red-200">紧急</Badge>;
      case 'urgent':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">较急</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">普通</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">加载中...</span>
      </div>
    );
  }

  return (
    <div>
      {/* AI分析页面视图 */}
      {viewMode === 'aiAnalysis' && selectedReplication && (
        <div className="min-h-screen bg-slate-50">
          {/* 顶部导航栏 */}
          <div className="sticky top-0 z-10 h-16 border-b border-slate-200 bg-white shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setViewMode('detail')}>
                  ← 返回详情
                </Button>
                <div className="h-8 w-px bg-slate-200"></div>
                <h2 className="text-xl font-bold text-slate-900">AI 智能分析报告</h2>
                <span className="text-sm text-slate-500">
                  {selectedReplication.project.title}
                </span>
              </div>
            </div>
          </div>

          {/* AI分析内容 */}
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            {selectedReplication.aiAnalysis ? (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3 text-blue-900">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        AI
                      </div>
                      <span>AI 智能分析报告</span>
                    </CardTitle>
                    {selectedReplication.aiAnalysisAt && (
                      <span className="text-xs font-mono text-blue-400 bg-white/50 px-2 py-1 rounded">
                        {(() => {
                          const date = new Date(selectedReplication.aiAnalysisAt);
                          return `生成于 ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                        })()}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 标签页导航 */}
                  <div className="border-b border-blue-200 mb-6 bg-white/50 rounded-t-lg px-2">
                    <div className="flex gap-1 overflow-x-auto">
                      {[
                        { key: 'scenario', label: '业务场景' },
                        { key: 'goals', label: '预期目标' },
                        { key: 'urgency', label: '紧急程度' },
                        { key: 'resources', label: '资源需求' },
                        { key: 'suggestions', label: '建议事项' },
                        { key: 'comprehensive', label: '综合建议' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key as any)}
                          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.key
                              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 内容区域 */}
                  <div className="bg-white rounded-lg p-6 border border-blue-100 shadow-sm">
                    <MarkdownRenderer content={selectedReplication.aiAnalysis} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <Bot className="size-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">暂无AI分析报告</p>
                  <Button
                    onClick={() => handleAnalyze(selectedReplication)}
                    disabled={analyzing === selectedReplication.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {analyzing === selectedReplication.id ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        开始AI分析
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* 详情页面视图 - 左右分栏布局 */}
      {viewMode === 'detail' && selectedReplication && (
        <div className="min-h-screen bg-slate-50">
          {/* 主内容区域 - 左右分栏布局 */}
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* 左侧列（5列）- 两个框架 */}
              <div className="col-span-5 space-y-4">
                {/* 框架1: 用户基本信息 */}
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="size-4 text-blue-500" />
                      申请人信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                        {selectedReplication.applicantName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{selectedReplication.applicantName}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="size-3" />
                          {selectedReplication.department}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Mail className="size-4 text-slate-400" />
                        <span>{selectedReplication.email}</span>
                      </div>
                      {selectedReplication.contactPhone && (
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Phone className="size-4 text-slate-400" />
                          <span>{selectedReplication.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">申请ID</span>
                        <div className="font-mono text-slate-900 mt-0.5">#{selectedReplication.id}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">紧急程度</span>
                        <div className="mt-0.5">{getUrgencyBadge(selectedReplication.urgency)}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">团队规模</span>
                        <div className="text-slate-900 mt-0.5">{selectedReplication.teamSize || '-'}人</div>
                      </div>
                      <div>
                        <span className="text-slate-500">预算范围</span>
                        <div className="text-slate-900 mt-0.5">{selectedReplication.budgetRange || '-'}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">提交时间</span>
                        <div className="text-slate-900 mt-0.5">
                          {(() => {
                            const date = new Date(selectedReplication.appliedAt);
                            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                          })()}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">目标上线</span>
                        <div className="text-slate-900 mt-0.5">{selectedReplication.targetLaunchDate || '未定'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 框架2: 用户填写的内容 */}
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="size-4 text-blue-500" />
                      申请内容
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* 业务场景 */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="size-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-900">业务场景</h3>
                      </div>
                      <div className="relative pl-6">
                        <Quote className="absolute top-0 left-0 size-5 text-slate-200 -scale-x-100" />
                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                          {selectedReplication.businessScenario}
                        </p>
                      </div>
                    </div>

                    {/* 预期目标 */}
                    {selectedReplication.expectedGoals && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="size-4 text-green-500" />
                          <h3 className="text-sm font-semibold text-slate-900">预期目标</h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap pl-6">
                          {selectedReplication.expectedGoals}
                        </p>
                      </div>
                    )}

                    {/* 补充需求 */}
                    {selectedReplication.additionalNeeds && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="size-4 text-amber-500" />
                          <h3 className="text-sm font-semibold text-slate-900">补充需求</h3>
                        </div>
                        <p className="text-slate-600 italic leading-relaxed text-sm whitespace-pre-wrap pl-6">
                          {selectedReplication.additionalNeeds}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 右侧列（7列）- 操作按钮 */}
              <div className="col-span-7">
                <Card className="border-slate-200 shadow-sm bg-white sticky top-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 操作按钮 */}
                    {selectedReplication.status === 'APPLIED' && (
                      <div className="space-y-3">
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md h-12 text-base"
                          onClick={() => handleStatusUpdate(selectedReplication.id, 'APPROVED')}
                        >
                          <CheckCircle className="size-5 mr-2" />
                          批准申请
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full h-12 text-base"
                          onClick={() => {
                            toast.info('拒绝功能待实现');
                          }}
                        >
                          <XCircle className="size-5 mr-2" />
                          拒绝申请
                        </Button>
                      </div>
                    )}
                    {selectedReplication.status === 'APPROVED' && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md h-12 text-base"
                        onClick={() => handleStatusUpdate(selectedReplication.id, 'DEPLOYED')}
                      >
                        <CheckCircle className="size-5 mr-2" />
                        标记为已部署
                      </Button>
                    )}
                    
                    {/* 返回列表按钮 */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setViewMode('list')}
                    >
                      返回列表
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && (
        <>
      {/* 标题和筛选 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">部署申请管理</h2>
          <p className="text-slate-600 mt-1">管理所有项目的部署申请</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
          >
            全部 ({replications.length})
          </Button>
          <Button
            variant={statusFilter === 'APPLIED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('APPLIED')}
            size="sm"
          >
            待审核 ({replications.filter(r => r.status === 'APPLIED').length})
          </Button>
          <Button
            variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('APPROVED')}
            size="sm"
          >
            已批准 ({replications.filter(r => r.status === 'APPROVED').length})
          </Button>
          <Button
            variant={statusFilter === 'DEPLOYED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('DEPLOYED')}
            size="sm"
          >
            已部署 ({replications.filter(r => r.status === 'DEPLOYED').length})
          </Button>
        </div>
      </div>

      {/* 申请列表 */}
      {replications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">暂无申请记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {replications.map((replication) => (
            <Card key={replication.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{replication.project.title}</h3>
                      {getStatusBadge(replication.status)}
                      {getUrgencyBadge(replication.urgency)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="size-4" />
                        <span>{replication.applicantName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-4" />
                        <span>{replication.email}</span>
                      </div>
                      {replication.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="size-4" />
                          <span>{replication.contactPhone}</span>
                        </div>
                      )}
                      {replication.targetLaunchDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>{replication.targetLaunchDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      <p className="line-clamp-2">{replication.businessScenario}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReplication(replication);
                            setViewMode('detail');
                      }}
                    >
                      查看详情
                    </Button>
                      <Button
                        variant="outline"
                        size="sm"
                          onClick={() => {
                            setSelectedReplication(replication);
                            setViewMode('aiAnalysis');
                          }}
                          disabled={!replication.aiAnalysis}
                        >
                            <Sparkles className="size-3 mr-1" />
                            AI分析
                      </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
            </>
          )}
    </div>
  );
}


