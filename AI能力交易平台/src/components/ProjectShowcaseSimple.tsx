import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Users, Award, TrendingUp, Heart, MessageSquare, X, CheckCircle, Clock, PlayCircle, Rocket, Package, Loader2, Video, BarChart3, Bot, Megaphone, Globe, Sparkles, Zap, Brain, MessageCircle, FileText, Settings, Palette, Target, Users2, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { projectsApi } from '../lib/api';
import { toast } from 'sonner';

// 精美的项目封面视觉效果配置
interface ProjectVisualConfig {
  gradient: string;
  icon: any;
  pattern: 'circles' | 'grid' | 'waves' | 'dots' | 'hexagon' | 'diamond';
  accentColor: string;
  glowColor: string;
}

const getProjectVisual = (title: string, category?: string): ProjectVisualConfig => {
  const keywords: Record<string, ProjectVisualConfig> = {
    // 视频/社媒相关 - 活力红粉系
    视频: { gradient: 'from-rose-600 via-pink-500 to-orange-400', icon: Video, pattern: 'waves', accentColor: 'rgba(255,255,255,0.3)', glowColor: 'rgba(244,63,94,0.4)' },
    社媒: { gradient: 'from-pink-600 via-rose-500 to-red-400', icon: Megaphone, pattern: 'circles', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(236,72,153,0.4)' },
    直播: { gradient: 'from-red-600 via-rose-500 to-pink-400', icon: PlayCircle, pattern: 'dots', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(239,68,68,0.4)' },
    
    // 运营相关 - 专业蓝绿系
    运营: { gradient: 'from-cyan-600 via-blue-500 to-indigo-500', icon: TrendingUpIcon, pattern: 'grid', accentColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(6,182,212,0.4)' },
    CC: { gradient: 'from-blue-600 via-indigo-500 to-violet-500', icon: MessageCircle, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(99,102,241,0.4)' },
    客服: { gradient: 'from-teal-500 via-emerald-500 to-green-400', icon: MessageCircle, pattern: 'waves', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(20,184,166,0.4)' },
    亲密: { gradient: 'from-orange-500 via-amber-500 to-yellow-400', icon: Heart, pattern: 'circles', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(249,115,22,0.4)' },
    
    // AI/素材相关 - 科技紫系
    AI: { gradient: 'from-violet-600 via-purple-500 to-fuchsia-500', icon: Brain, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(139,92,246,0.5)' },
    素材: { gradient: 'from-amber-500 via-orange-500 to-rose-500', icon: Palette, pattern: 'diamond', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(245,158,11,0.4)' },
    物料: { gradient: 'from-orange-500 via-red-500 to-pink-500', icon: FileText, pattern: 'grid', accentColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(249,115,22,0.4)' },
    生成: { gradient: 'from-purple-600 via-violet-500 to-indigo-400', icon: Sparkles, pattern: 'dots', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(147,51,234,0.5)' },
    
    // 市场/品牌相关 - 商务蓝紫系
    市场: { gradient: 'from-blue-700 via-indigo-600 to-purple-500', icon: Target, pattern: 'grid', accentColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(37,99,235,0.4)' },
    品牌: { gradient: 'from-fuchsia-600 via-pink-500 to-rose-400', icon: Award, pattern: 'diamond', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(217,70,239,0.4)' },
    投放: { gradient: 'from-emerald-600 via-teal-500 to-cyan-400', icon: Rocket, pattern: 'waves', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(16,185,129,0.4)' },
    营销: { gradient: 'from-indigo-600 via-blue-500 to-cyan-400', icon: Target, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(79,70,229,0.4)' },
    
    // 工作流/系统相关 - 稳重灰金系
    工作流: { gradient: 'from-slate-700 via-gray-600 to-zinc-500', icon: Settings, pattern: 'grid', accentColor: 'rgba(255,255,255,0.1)', glowColor: 'rgba(100,116,139,0.4)' },
    升舱: { gradient: 'from-amber-600 via-yellow-500 to-orange-400', icon: Zap, pattern: 'diamond', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(217,119,6,0.5)' },
    服务: { gradient: 'from-teal-600 via-cyan-500 to-sky-400', icon: Users2, pattern: 'circles', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(13,148,136,0.4)' },
    推送: { gradient: 'from-sky-600 via-blue-500 to-indigo-400', icon: MessageSquare, pattern: 'waves', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(14,165,233,0.4)' },
    lark: { gradient: 'from-blue-700 via-blue-600 to-indigo-500', icon: MessageSquare, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(29,78,216,0.4)' },
    名片: { gradient: 'from-violet-600 via-purple-500 to-pink-400', icon: FileText, pattern: 'diamond', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(124,58,237,0.4)' },
    
    // 数据相关 - 分析绿蓝系
    数据: { gradient: 'from-emerald-600 via-teal-500 to-cyan-400', icon: BarChart3, pattern: 'grid', accentColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(16,185,129,0.4)' },
    分析: { gradient: 'from-cyan-600 via-blue-500 to-indigo-500', icon: BarChart3, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(6,182,212,0.4)' },
    表盘: { gradient: 'from-orange-600 via-amber-500 to-yellow-400', icon: BarChart3, pattern: 'circles', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(234,88,12,0.5)' },
    
    // 学科/教育相关 - 知识蓝紫系
    学科: { gradient: 'from-indigo-600 via-purple-500 to-pink-400', icon: Globe, pattern: 'dots', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(79,70,229,0.4)' },
    海外: { gradient: 'from-sky-600 via-blue-500 to-indigo-400', icon: Globe, pattern: 'waves', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(14,165,233,0.4)' },
    新生: { gradient: 'from-green-500 via-emerald-500 to-teal-400', icon: Users, pattern: 'circles', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(34,197,94,0.4)' },
    全球: { gradient: 'from-indigo-600 via-violet-500 to-purple-400', icon: Globe, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(79,70,229,0.4)' },
    
    // 质检相关
    质检: { gradient: 'from-slate-600 via-blue-600 to-indigo-500', icon: CheckCircle, pattern: 'grid', accentColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(71,85,105,0.4)' },
    教室: { gradient: 'from-blue-600 via-indigo-500 to-violet-400', icon: Users, pattern: 'dots', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(37,99,235,0.4)' },
    
    // SS相关
    SS: { gradient: 'from-amber-600 via-orange-500 to-red-400', icon: TrendingUpIcon, pattern: 'diamond', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(217,119,6,0.5)' },
    S9: { gradient: 'from-purple-600 via-fuchsia-500 to-pink-400', icon: Sparkles, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(147,51,234,0.5)' },
    
    // LP相关
    LP: { gradient: 'from-violet-600 via-purple-500 to-fuchsia-400', icon: FileText, pattern: 'waves', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(139,92,246,0.4)' },
  };
  
  // 区域分类的默认样式
  const categoryStyles: Record<string, ProjectVisualConfig> = {
    '北京项目': { gradient: 'from-red-600 via-orange-500 to-amber-400', icon: Target, pattern: 'diamond', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(220,38,38,0.4)' },
    '中东项目': { gradient: 'from-amber-600 via-orange-500 to-red-400', icon: Globe, pattern: 'hexagon', accentColor: 'rgba(255,255,255,0.25)', glowColor: 'rgba(217,119,6,0.5)' },
    '菲律宾项目': { gradient: 'from-blue-600 via-sky-500 to-cyan-400', icon: Globe, pattern: 'waves', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(37,99,235,0.4)' },
    '全球项目': { gradient: 'from-indigo-600 via-purple-500 to-pink-400', icon: Globe, pattern: 'circles', accentColor: 'rgba(255,255,255,0.2)', glowColor: 'rgba(79,70,229,0.4)' },
  };
  
  // 先尝试匹配关键词
  for (const [keyword, style] of Object.entries(keywords)) {
    if (title.includes(keyword)) {
      return style;
    }
  }
  
  // 如果有分类，使用分类默认样式
  if (category && categoryStyles[category]) {
    return categoryStyles[category];
  }
  
  // 默认样式
  return { gradient: 'from-slate-600 via-gray-500 to-zinc-400', icon: Sparkles, pattern: 'dots', accentColor: 'rgba(255,255,255,0.15)', glowColor: 'rgba(100,116,139,0.4)' };
};

// 生成装饰图案的SVG
const getPatternSvg = (pattern: string, color: string) => {
  const patterns: Record<string, string> = {
    circles: `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="20" fill="none" stroke="${color}" stroke-width="1"/><circle cx="30" cy="30" r="10" fill="none" stroke="${color}" stroke-width="1"/><circle cx="10" cy="10" r="5" fill="${color}"/><circle cx="50" cy="50" r="5" fill="${color}"/></svg>`,
    grid: `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M0 20h40M20 0v40" stroke="${color}" stroke-width="0.5" fill="none"/><rect x="15" y="15" width="10" height="10" fill="none" stroke="${color}" stroke-width="0.5"/></svg>`,
    waves: `<svg width="80" height="40" viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><path d="M0 20c10-10 20-10 30 0s20 10 30 0 20-10 30 0" stroke="${color}" stroke-width="1" fill="none"/><path d="M0 30c10-10 20-10 30 0s20 10 30 0 20-10 30 0" stroke="${color}" stroke-width="0.5" fill="none"/></svg>`,
    dots: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="2" fill="${color}"/></svg>`,
    hexagon: `<svg width="50" height="43.3" viewBox="0 0 50 43.3" xmlns="http://www.w3.org/2000/svg"><polygon points="25,0 50,12.5 50,37.5 25,50 0,37.5 0,12.5" fill="none" stroke="${color}" stroke-width="0.5" transform="translate(0,-3.35)"/></svg>`,
    diamond: `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,0 40,20 20,40 0,20" fill="none" stroke="${color}" stroke-width="0.5"/><polygon points="20,10 30,20 20,30 10,20" fill="${color}"/></svg>`,
  };
  return patterns[pattern] || patterns.dots;
};
// 取消页面加载动画
// Background image - 使用本地图片，将图片放在 public/images/ 文件夹中
// 如果文件夹中有图片，可以直接使用，例如：/images/your-image.jpg
// 当前使用已有的图片文件
const bgImage = '/images/6b31d4d74c0884e959fa94b709c56049.jpg';

interface ProjectShowcaseProps {
  searchQuery: string;
  onProjectSelect?: (projectId: number, project: any) => void;
}

export function ProjectShowcase({ searchQuery, onProjectSelect }: ProjectShowcaseProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'department' | 'function' | 'status'>('department');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 从项目数据中动态提取的筛选选项
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  // ✅ 状态映射：后端枚举值 -> 中文显示
  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      'REQUIREMENT_CONFIRMED': '需求已确认',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝',
      'SCHEDULED': '排期中',
      'IN_PRODUCTION': '生产中',
      'DELIVERED_NOT_DEPLOYED': '交付未投产',
      'DELIVERED_DEPLOYED': '交付已投产',
    };
    // 如果状态不在映射表中，返回原始值（用于调试）
    if (!statusMap[status]) {
      console.warn('⚠️ 未知状态:', status);
    }
    return statusMap[status] || status;
  };

  // ✅ 获取状态图标
  const getStatusIcon = (status: string): string => {
    const iconMap: Record<string, string> = {
      'REQUIREMENT_CONFIRMED': '📋 ',
      'APPROVED': '✅ ',
      'REJECTED': '❌ ',
      'SCHEDULED': '⏰ ',
      'IN_PRODUCTION': '🔧 ',
      'DELIVERED_NOT_DEPLOYED': '📦 ',
      'DELIVERED_DEPLOYED': '✅ ',
    };
    return iconMap[status] || '';
  };

  // ✅ 获取状态样式类
  const getStatusClassName = (status: string): string => {
    const classMap: Record<string, string> = {
      'REQUIREMENT_CONFIRMED': 'bg-slate-100 text-slate-700 border-slate-200',
      'APPROVED': 'bg-green-100 text-green-700 border-green-200',
      'REJECTED': 'bg-red-100 text-red-700 border-red-200',
      'SCHEDULED': 'bg-amber-100 text-amber-700 border-amber-200',
      'IN_PRODUCTION': 'bg-blue-100 text-blue-700 border-blue-200',
      'DELIVERED_NOT_DEPLOYED': 'bg-orange-100 text-orange-700 border-orange-200',
      'DELIVERED_DEPLOYED': 'bg-green-100 text-green-700 border-green-200',
    };
    return classMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // ✅ 中文状态 -> 英文枚举值（用于筛选）
  const getStatusEnum = (statusZh: string): string => {
    const reverseMap: Record<string, string> = {
      '需求已确认': 'REQUIREMENT_CONFIRMED',
      '已通过': 'APPROVED',
      '已拒绝': 'REJECTED',
      '排期中': 'SCHEDULED',
      '生产中': 'IN_PRODUCTION',
      '交付未投产': 'DELIVERED_NOT_DEPLOYED',
      '交付已投产': 'DELIVERED_DEPLOYED',
    };
    return reverseMap[statusZh] || statusZh;
  };

  // 切换部门选择
  const toggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  // 切换功能选择
  const toggleFunction = (func: string) => {
    if (selectedFunctions.includes(func)) {
      setSelectedFunctions(selectedFunctions.filter(f => f !== func));
    } else {
      setSelectedFunctions([...selectedFunctions, func]);
    }
  };

  // 切换状态选择
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  // 清空当前类型的选择
  const clearCurrentFilter = () => {
    if (filterType === 'department') {
      setSelectedDepartments([]);
    } else if (filterType === 'function') {
      setSelectedFunctions([]);
    } else if (filterType === 'status') {
      setSelectedStatuses([]);
    }
  };

  // 清空所有筛选
  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedFunctions([]);
    setSelectedStatuses([]);
  };

  // ✅ 获取项目列表（只显示审核通过的项目）
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // ✅ 只获取审核通过的项目（reviewStatus = 'APPROVED'）
        const response = await projectsApi.list({ limit: 100, reviewStatus: 'APPROVED' });
        const allItems = (response as any).items || [];
        
        // 调试：查看所有项目的状态
        console.log('📊 项目广场项目状态分布:');
        const statusCount: Record<string, number> = {};
        allItems.forEach((p: any) => {
          statusCount[p.status] = (statusCount[p.status] || 0) + 1;
        });
        console.log('状态统计:', statusCount);
        console.log('所有项目:', allItems.map((p: any) => ({ id: p.id, title: p.title, status: p.status, reviewStatus: p.reviewStatus })));
        
        // ✅ 调试：查看项目的developers数据结构
        console.log('=== 调试：项目developers数据 ===');
        allItems.forEach((p: any) => {
          console.log(`\n项目 ${p.id}: ${p.title}`);
          console.log('  requesterName:', p.requesterName);
          console.log('  developers:', p.developers);
          console.log('  developers类型:', typeof p.developers, Array.isArray(p.developers));
          if (p.developers && Array.isArray(p.developers)) {
            console.log('  developers数量:', p.developers.length);
            p.developers.forEach((d: any, idx: number) => {
              console.log(`    [${idx}] role: ${d.role}, user:`, d.user);
            });
            const engineers = p.developers.filter((d: any) => d.role === '工程师');
            console.log('  工程师数量:', engineers.length);
          } else {
            console.log('  ⚠️ 没有developers数据或格式不正确');
          }
        });
        console.log('=== 调试结束 ===\n');
        
        // ✅ 只显示审核通过的项目
        const items = allItems;
        
        console.log('✅ 项目广场加载项目:', items.length, '个（已审核通过）');
        setProjects(items);
        
        // ✅ 从项目数据中提取可用的筛选选项
        const departments = new Set<string>();
        const categories = new Set<string>();
        const statuses = new Set<string>();
        
        items.forEach((p: any) => {
          // 提取赋能部门
          if (p.empoweredDepartments) {
            p.empoweredDepartments.split(/[,，、]/).forEach((d: string) => {
              const trimmed = d.trim();
              if (trimmed) departments.add(trimmed);
            });
          }
          // 提取分类
          if (p.category) {
            categories.add(p.category);
          }
          // 提取状态
          if (p.status) {
            statuses.add(p.status);
          }
        });
        
        setAvailableDepartments(Array.from(departments).sort());
        setAvailableCategories(Array.from(categories).sort());
        setAvailableStatuses(Array.from(statuses));
        
        console.log('📊 可用筛选选项:', {
          departments: Array.from(departments),
          categories: Array.from(categories),
          statuses: Array.from(statuses)
        });
      } catch (error: any) {
        console.error('加载项目失败:', error);
        toast.error('加载项目失败: ' + (error.message || '未知错误'));
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    
    // 监听审核事件，自动刷新项目列表
    const handleRefresh = () => {
      console.log('收到刷新事件，重新加载项目广场');
      fetchProjects();
    };
    
    window.addEventListener('refreshProjectShowcase', handleRefresh);
    return () => window.removeEventListener('refreshProjectShowcase', handleRefresh);
  }, []);

  // 从真实项目中选择6-8个作为轮播展示
  const showcaseProjects = useMemo(() => {
    if (projects.length === 0) return [];
    
    // 选择前8个项目作为展示
    return projects.slice(0, 8).map(project => {
      // 获取项目的视觉配置
      const visual = getProjectVisual(project.title, project.category);
      
      // 根据关键词确定分类标签
      const getCategoryLabel = (title: string, category?: string) => {
        if (title.includes('视频') || title.includes('社媒')) return '视频制作';
        if (title.includes('运营') || title.includes('CC')) return '智能运营';
        if (title.includes('AI') || title.includes('生成')) return 'AI生成';
        if (title.includes('素材') || title.includes('物料')) return '素材生成';
        if (title.includes('市场') || title.includes('投放') || title.includes('营销')) return '智能营销';
        if (title.includes('品牌')) return '品牌运营';
        if (title.includes('工作流') || title.includes('升舱')) return '流程优化';
        if (title.includes('数据') || title.includes('分析') || title.includes('表盘')) return '数据分析';
        if (title.includes('服务') || title.includes('推送') || title.includes('lark')) return '服务推送';
        if (title.includes('学科') || title.includes('新生')) return '教育培训';
        if (title.includes('质检') || title.includes('教室')) return '质量监控';
        if (title.includes('名片') || title.includes('LP')) return '内容生成';
        if (category) return category.replace('项目', '');
        return 'AI项目';
      };
      
      // 获取负责人名称
      const getLeadName = () => {
        if (project.developers && Array.isArray(project.developers)) {
          const engineers = project.developers.filter((d: any) => d.role === '工程师');
          if (engineers.length > 0 && engineers[0].user?.name) {
            return engineers[0].user.name;
          }
        }
        return project.empoweredDepartments?.split(/[,，、]/)[0] || '项目团队';
      };
      
      return {
        id: project.id,
        title: project.title,
        location: project.empoweredDepartments?.split(/[,，、]/)[0] || project.category || '全球',
        country: getLeadName(),
        category: getCategoryLabel(project.title, project.category),
        visual: visual, // 传递视觉配置
      };
    });
  }, [projects]);

  // 模拟数据作为后备（当API数据为空时使用）
  const mockProjects = [
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
      status: '交付已投产',
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
      image: 'https://images.unsplash.com/photo-1611663809751-a988194a855a?w=800',
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
      status: '生产中',
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
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
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
      status: '交付已投产',
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
      image: 'https://images.unsplash.com/photo-1726066012749-f81bf4422d4e?w=800',
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
      status: '需求已确认',
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
      image: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800',
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
      status: '排期中',
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
      image: 'https://images.unsplash.com/photo-1759429255330-51145b170dad?w=800',
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
      status: '交付未投产',
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
      image: 'https://images.unsplash.com/photo-1762427354051-a9bdb181ae3b?w=800',
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
      status: '生产中',
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
      image: 'https://images.unsplash.com/photo-1573209680076-bd7ec7007616?w=800',
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
      status: '交付已投产',
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
      image: 'https://images.unsplash.com/photo-1762158007836-25d13ab34c1c?w=800',
    },
  ];

  // 只使用API真实数据
  const displayProjects = projects;

  const filteredProjects = displayProjects.filter(project => {
    // 部门筛选 - 检查 empoweredDepartments 字段
    const matchesDepartment = selectedDepartments.length === 0 || 
      selectedDepartments.some(dept => {
        const empowered = project.empoweredDepartments || '';
        return empowered.includes(dept);
      });
    
    // 分类筛选 - 检查 category 字段（如"北京项目"、"中东项目"等）
    const matchesFunction = selectedFunctions.length === 0 || 
      selectedFunctions.includes(project.category);
    
    // 状态筛选 - 直接比较英文枚举值
    const matchesStatus = selectedStatuses.length === 0 || 
      selectedStatuses.includes(project.status);
    
    // 搜索筛选
    const matchesSearch = !searchQuery || 
      (project.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.solution || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.background || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.empoweredDepartments || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // 所有条件都要满足（AND关系）
    return matchesDepartment && matchesFunction && matchesStatus && matchesSearch;
  });

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // 自动轮播效果
  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        
        // 如果滚动到最右边，回到开始位置
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollContainerRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // 否则继续向右滚动
          scrollContainerRef.current.scrollTo({
            left: scrollLeft + 280, // 卡片宽度 + 间距
            behavior: 'smooth'
          });
        }
      }
    }, 3000); // 每3秒滚动一次

    return () => clearInterval(autoScroll);
  }, []);

  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <div className="space-y-0 pb-20 md:pb-0 bg-white min-h-screen font-bold relative">
      

      {/* 原有内容 - 正常显示，会被遮罩模糊 */}
      <div className="space-y-0 pb-20 md:pb-0 bg-white min-h-screen font-bold">
      {/* 顶部展示区域 - 21:9 比例 */}
      <div className="w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        {/* 内容容器 - 内容位于底部 */}
        <div 
          className="relative z-10 h-full flex items-end"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 背景遮罩层 - 调整透明度让背景图片更明显 */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/40"></div>
          
          <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 lg:px-12 pb-8">
            {/* 左侧：文字内容 */}
            <div className="space-y-4 text-white">
              <div className="inline-block">
                <Badge className="bg-purple-500/20 text-white border-purple-500/30 px-3 py-0.5 text-xs">
                  PROJECT SHOWCASE
                </Badge>
              </div>

              <div className="space-y-1">
                <h1 className="text-4xl lg:text-5xl uppercase tracking-tight leading-tight text-white">
                  ENTERPRISE
                </h1>
                <h1 className="text-4xl lg:text-5xl uppercase tracking-tight leading-tight text-white">
                  AI PROJECTS
                </h1>
              </div>

              <p className="text-white/80 leading-relaxed max-w-md text-sm">
                Explore successful AI implementations across departments. From intelligent customer service to data analytics and workflow automation.
              </p>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{projects.length}</div>
                    <div className="text-xs text-white/70">项目总数</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{availableDepartments.length}</div>
                    <div className="text-xs text-white/70">赋能部门</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：滚动卡片区域 */}
            <div className="relative flex items-end">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-3 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* 加载中占位 */}
                {showcaseProjects.length === 0 && (
                  <div className="flex gap-3">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="flex-shrink-0 w-48 h-64 rounded-2xl bg-white/5 animate-pulse"></div>
                    ))}
                  </div>
                )}
                {showcaseProjects.map((project, index) => {
                  const visual = project.visual;
                  const IconComponent = visual?.icon || Sparkles;
                  const patternSvg = visual ? getPatternSvg(visual.pattern, visual.accentColor) : '';
                  const patternBase64 = patternSvg ? btoa(patternSvg) : '';
                  
                  return (
                  <div
                    key={project.id}
                    className="flex-shrink-0 w-48 group cursor-pointer"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                      onClick={() => onProjectSelect?.(project.id, project)}
                  >
                    <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:shadow-purple-500/20 group-hover:-translate-y-2">
                        {/* 精美渐变背景 */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${visual?.gradient || 'from-slate-600 to-zinc-700'}`}>
                          {/* 图案层 */}
                          {patternBase64 && (
                            <div 
                              className="absolute inset-0 opacity-30"
                              style={{ backgroundImage: `url("data:image/svg+xml;base64,${patternBase64}")`, backgroundSize: '50px 50px' }}
                            ></div>
                          )}
                          {/* 光晕效果 */}
                          <div 
                            className="absolute top-1/4 -right-8 w-24 h-24 rounded-full blur-2xl opacity-50"
                            style={{ backgroundColor: visual?.glowColor || 'rgba(255,255,255,0.2)' }}
                          ></div>
                          <div 
                            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl opacity-40"
                            style={{ backgroundColor: visual?.glowColor || 'rgba(255,255,255,0.2)' }}
                          ></div>
                          {/* 底部渐变 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      </div>

                      {/* 内容 */}
                      <div className="absolute inset-0 p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            {/* 图标 */}
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" strokeWidth={1.5} />
                            </div>
                          <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 text-[10px] px-2">
                            {project.category}
                          </Badge>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[10px] text-slate-300">
                            {project.location}
                          </div>
                            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                            {project.title}
                          </h3>
                          <div className="text-[10px] text-slate-400">
                            {project.country}
                          </div>

                          <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              size="sm"
                              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-full h-7 text-[10px] px-3"
                            >
                                查看详情
                              <ArrowRight className="ml-1 w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="px-6 pt-20 pb-3 space-y-6">
        <div className="flex gap-2">
          <Button
            variant={filterType === 'department' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('department')}
            className={`rounded-full h-8 px-4 text-xs relative ${filterType === 'department' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          >
            📁 按赋能部门
            {selectedDepartments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {selectedDepartments.length}
              </span>
            )}
          </Button>
          <Button
            variant={filterType === 'function' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('function')}
            className={`rounded-full h-8 px-4 text-xs relative ${filterType === 'function' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          >
            🌍 按区域分类
            {selectedFunctions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {selectedFunctions.length}
              </span>
            )}
          </Button>
          <Button
            variant={filterType === 'status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('status')}
            className={`rounded-full h-8 px-4 text-xs relative ${filterType === 'status' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          >
            🎯 按状态
            {selectedStatuses.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {selectedStatuses.length}
              </span>
            )}
          </Button>
          {(selectedDepartments.length > 0 || selectedFunctions.length > 0 || selectedStatuses.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="rounded-full h-8 px-4 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              🗑️ 清空所有
            </Button>
          )}
        </div>

        {filterType === 'department' ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedDepartments.length === 0 ? 'default' : 'outline'}
              onClick={clearCurrentFilter}
              size="sm"
              className={`rounded-full h-8 px-4 text-xs whitespace-nowrap ${selectedDepartments.length === 0 ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              全部业务部门
            </Button>
            {availableDepartments.map(dept => (
            <Button
                key={dept}
                variant={selectedDepartments.includes(dept) ? 'default' : 'outline'}
                onClick={() => toggleDepartment(dept)}
              size="sm"
                className={`rounded-full h-8 px-4 text-xs whitespace-nowrap ${selectedDepartments.includes(dept) ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
                {dept}
            </Button>
            ))}
          </div>
        ) : filterType === 'function' ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedFunctions.length === 0 ? 'default' : 'outline'}
              onClick={clearCurrentFilter}
              size="sm"
              className={`rounded-full h-8 px-4 text-xs whitespace-nowrap ${selectedFunctions.length === 0 ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              全部分类
            </Button>
            {availableCategories.map(cat => (
            <Button
                key={cat}
                variant={selectedFunctions.includes(cat) ? 'default' : 'outline'}
                onClick={() => toggleFunction(cat)}
              size="sm"
                className={`rounded-full h-8 px-4 text-xs whitespace-nowrap ${selectedFunctions.includes(cat) ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
                {cat === '北京项目' ? '🇨🇳 ' : cat === '中东项目' ? '🌍 ' : cat === '菲律宾项目' ? '🇵🇭 ' : cat === '全球项目' ? '🌐 ' : '📂 '}{cat}
            </Button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedStatuses.length === 0 ? 'default' : 'outline'}
              onClick={clearCurrentFilter}
              size="sm"
              className={`rounded-full h-8 px-4 text-xs whitespace-nowrap ${selectedStatuses.length === 0 ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              全部状态
            </Button>
            {availableStatuses.map(status => (
            <Button
                key={status}
                variant={selectedStatuses.includes(status) ? 'default' : 'outline'}
                onClick={() => toggleStatus(status)}
              size="sm"
                className={`rounded-full h-8 px-4 text-xs whitespace-nowrap ${
                  selectedStatuses.includes(status) 
                    ? status === 'IN_PRODUCTION' ? 'bg-blue-600 hover:bg-blue-700' 
                      : status === 'DELIVERED_DEPLOYED' ? 'bg-green-600 hover:bg-green-700'
                      : status === 'DELIVERED_NOT_DEPLOYED' ? 'bg-orange-600 hover:bg-orange-700'
                      : status === 'SCHEDULED' ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                    : status === 'IN_PRODUCTION' ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                      : status === 'DELIVERED_DEPLOYED' ? 'border-green-200 text-green-700 hover:bg-green-50'
                      : status === 'DELIVERED_NOT_DEPLOYED' ? 'border-orange-200 text-orange-700 hover:bg-orange-50'
                      : status === 'SCHEDULED' ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      : ''
                }`}
            >
                {getStatusIcon(status)}{getStatusDisplay(status)}
            </Button>
            ))}
          </div>
        )}

        {/* 当前筛选条件显示 */}
        {(selectedDepartments.length > 0 || selectedFunctions.length > 0 || selectedStatuses.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-gray-500">当前筛选：</span>
            {selectedDepartments.map(dept => (
              <Badge key={dept} variant="secondary" className="bg-purple-100 text-purple-700">
                📁 {dept}
              </Badge>
            ))}
            {selectedFunctions.map(func => (
              <Badge key={func} variant="secondary" className="bg-blue-100 text-blue-700">
                📂 {func}
              </Badge>
            ))}
            {selectedStatuses.map(status => (
              <Badge key={status} variant="secondary" className={`
                ${status === 'REQUIREMENT_CONFIRMED' ? 'bg-slate-100 text-slate-700' :
                  status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700' :
                  status === 'IN_PRODUCTION' ? 'bg-blue-100 text-blue-700' :
                  status === 'DELIVERED_NOT_DEPLOYED' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'}
              `}>
                {getStatusIcon(status)}{getStatusDisplay(status)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 项目卡片网格 */}
      <div className="px-6 pb-8 mt-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            // 外层：名片框架
            <div 
              key={project.id}
              className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              {/* 内层：内容卡片 */}
              <div className="space-y-3">
                {/* 图片卡片 - 支持真实图片或精美的动态封面 */}
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-inner">
                  {project.coverImage || project.image ? (
                  <img 
                      src={project.coverImage || project.image} 
                    alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    // 精美的动态封面设计
                    (() => {
                      const visual = getProjectVisual(project.title, project.category);
                      const IconComponent = visual.icon;
                      const patternSvg = getPatternSvg(visual.pattern, visual.accentColor);
                      const patternBase64 = btoa(patternSvg);
                      
                      return (
                        <div className={`w-full h-full bg-gradient-to-br ${visual.gradient} relative overflow-hidden`}>
                          {/* 主渐变背景 */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10"></div>
                          
                          {/* 装饰图案层 */}
                          <div 
                            className="absolute inset-0 opacity-40"
                            style={{ backgroundImage: `url("data:image/svg+xml;base64,${patternBase64}")`, backgroundSize: '60px 60px' }}
                          ></div>
                          
                          {/* 光晕效果 */}
                          <div 
                            className="absolute top-1/4 -right-10 w-32 h-32 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                            style={{ backgroundColor: visual.glowColor }}
                          ></div>
                          <div 
                            className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-40"
                            style={{ backgroundColor: visual.glowColor }}
                          ></div>
                          
                          {/* 装饰线条 */}
                          <div className="absolute top-4 left-4 w-12 h-[1px] bg-white/30"></div>
                          <div className="absolute top-4 left-4 w-[1px] h-12 bg-white/30"></div>
                          <div className="absolute bottom-4 right-4 w-8 h-[1px] bg-white/20"></div>
                          <div className="absolute bottom-4 right-4 w-[1px] h-8 bg-white/20"></div>
                          
                          {/* 主图标 - 带玻璃态效果 */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative group-hover:scale-110 transition-transform duration-500">
                              {/* 图标背景光晕 */}
                              <div 
                                className="absolute inset-0 rounded-full blur-2xl scale-150 opacity-50"
                                style={{ backgroundColor: visual.glowColor }}
                              ></div>
                              {/* 玻璃态圆形背景 */}
                              <div className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                                <IconComponent className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>
                          
                          {/* 底部渐变遮罩 */}
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"></div>
                          
                          {/* 噪点纹理增加质感 */}
                          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* 信息卡片 */}
                <div className="space-y-2">
                  {/* 标题和状态 */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm line-clamp-2 min-h-[2.5rem]">{project.title}</h3>
                    <Badge 
                      className={`text-xs px-2 py-0.5 ${getStatusClassName(project.status)}`}
                      variant="outline"
                    >
                      {getStatusIcon(project.status)}
                      {getStatusDisplay(project.status)}
                    </Badge>
                  </div>
                  
                  {/* 人员信息 - 工程师 */}
                  <div className="space-y-1 text-xs text-slate-500">
                    {/* 工程师 */}
                    {(() => {
                      // 调试：检查developers数据
                      if (project.id) {
                        console.log(`[项目${project.id}] developers数据:`, project.developers);
                        console.log(`[项目${project.id}] developers类型:`, typeof project.developers, Array.isArray(project.developers));
                      }
                      
                      // 检查developers数据是否存在
                      if (!project.developers) {
                        if (project.id) console.log(`[项目${project.id}] ⚠️ 没有developers字段`);
                        return null;
                      }
                      
                      if (!Array.isArray(project.developers)) {
                        if (project.id) console.log(`[项目${project.id}] ⚠️ developers不是数组:`, typeof project.developers);
                        return null;
                      }
                      
                      if (project.developers.length === 0) {
                        if (project.id) console.log(`[项目${project.id}] ⚠️ developers数组为空`);
                        return null;
                      }
                      
                      // 过滤出所有role为"工程师"的开发者
                      const engineers = project.developers.filter((d: any) => {
                        const role = d?.role || '';
                        const isEngineer = role === '工程师';
                        if (project.id && !isEngineer) {
                          console.log(`[项目${project.id}] 跳过非工程师: role="${role}"`);
                        }
                        return isEngineer;
                      });
                      
                      if (project.id) {
                        console.log(`[项目${project.id}] 工程师数量:`, engineers.length);
                        console.log(`[项目${project.id}] 工程师列表:`, engineers);
                      }
                      
                      // 如果有工程师，则显示
                      if (engineers.length > 0) {
                        const engineerNames = engineers
                          .map((d: any) => {
                            // 尝试多种方式获取姓名
                            const name = d.user?.name || d.name || d.userName || '';
                            if (project.id && !name) {
                              console.log(`[项目${project.id}] ⚠️ 工程师数据缺少姓名:`, d);
                            }
                            return name;
                          })
                          .filter(Boolean);
                        
                        if (engineerNames.length > 0) {
                          const firstEngineerName = engineerNames[0] || '工';
                          
                          if (project.id) {
                            console.log(`[项目${project.id}] ✅ 显示工程师:`, engineerNames.join('、'));
                          }
                          
                          return (
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-[10px]">
                                {firstEngineerName[0]}
                              </div>
                              <span className="text-slate-600">工程师:</span>
                              <span className="truncate">
                                {engineerNames.join('、')}
                              </span>
                            </div>
                          );
                        } else {
                          if (project.id) console.log(`[项目${project.id}] ⚠️ 工程师姓名列表为空`);
                        }
                      } else {
                        if (project.id) console.log(`[项目${project.id}] ⚠️ 没有找到工程师（role='工程师'）`);
                      }
                      
                      return null;
                    })()}
                  </div>

                  {/* 底部操作区 */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button 
                      size="sm"
                      onClick={() => onProjectSelect?.(project.id, project)}
                      className="flex-1 h-9 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs rounded-full"
                    >
                      申请部署
                    </Button>
                    
                    <div className="flex items-center gap-1 text-slate-600">
                      <TrendingUp className="size-4" />
                      <span className="text-xs">{project.replications}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </div>
    </div>
  );
}