import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus, Upload, Image as ImageIcon, Video, Sparkles, Loader2, Clock } from 'lucide-react';
import { uploadApi } from '../lib/upload';
import { aiApi, projectsApi } from '../lib/api';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface ProjectEditorProps {
  projectId: string | null; // null表示新建项目
  onBack: () => void;
  onSave: (data: ProjectFormData) => void;
}

export interface ProjectFormData {
  name: string;
  implementers: string[];
  
  // ✅ 项目介绍的4个部分
  background: string;        // 项目背景
  solution: string;          // 解决方案
  features: string;          // 核心功能
  
  // ✅ 实施效果（二选一）
  impactType: 'estimated' | 'actual'; // 效果类型：预估或实际
  impactDescription: string;  // 效果描述
  estimatedImpact?: string;   // 预估效果
  actualImpact?: string;       // 实际效果
  
  // ✅ 关键效果（可选）
  efficiency?: string;       // 效率提升
  costSaving?: string;       // 成本节约
  satisfaction?: string;     // 满意度
  
  status: string;
  categories: string[];
  departments: string[];
  requesterDepartment: string;
  requesterName: string;  // 需求方姓名
  launchDate: string;
  images: string[];
  videos: string[];
}

export function ProjectEditor({ projectId, onBack, onSave }: ProjectEditorProps) {
  // 初始空表单数据
  const emptyFormData: ProjectFormData = {
    name: '',
    implementers: [''],
    background: '',
    solution: '',
    features: '',
    impactType: 'estimated',
    impactDescription: '',
    estimatedImpact: '',
    actualImpact: '',
    efficiency: '',
    costSaving: '',
    satisfaction: '',
    status: '需求已确认',
    categories: [],
    departments: [''],
    requesterDepartment: '',
    requesterName: '',
    launchDate: '',
    images: [],
    videos: []
  };

  const [formData, setFormData] = useState<ProjectFormData>(emptyFormData);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // 编辑模式时从API获取项目数据
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      
      setIsLoadingProject(true);
      try {
        const response = await projectsApi.get(parseInt(projectId));
        console.log('📦 获取项目详情:', response);
        
        // 状态映射
        const statusMap: Record<string, string> = {
          'REQUIREMENT_CONFIRMED': '需求已确认',
          'SCHEDULED': '排期中',
          'IN_PRODUCTION': '生产中',
          'DELIVERED_NOT_DEPLOYED': '交付未投产',
          'DELIVERED_DEPLOYED': '交付已投产',
        };
        
        // 安全解析 implementers
        let implementers: string[] = [''];
        try {
          if (response.developers && Array.isArray(response.developers) && response.developers.length > 0) {
            implementers = response.developers.map((d: any) => d.user?.name || d.name || '').filter(Boolean);
          } else if (response.projectLead?.name) {
            implementers = [response.projectLead.name];
          }
          if (implementers.length === 0) implementers = [''];
        } catch (e) {
          console.warn('解析 implementers 失败:', e);
        }
        
        // 安全解析 departments
        let departments: string[] = [''];
        try {
          if (response.empoweredDepartments && typeof response.empoweredDepartments === 'string') {
            departments = response.empoweredDepartments.split(/[,，、]/).map((d: string) => d.trim()).filter(Boolean);
          }
          if (departments.length === 0) departments = [''];
        } catch (e) {
          console.warn('解析 departments 失败:', e);
        }
        
        // 安全解析 images 和 videos
        let images: string[] = [];
        let videos: string[] = [];
        try {
          if (response.images) {
            images = typeof response.images === 'string' ? JSON.parse(response.images) : response.images;
            if (!Array.isArray(images)) images = [];
          }
        } catch (e) {
          console.warn('解析 images 失败:', e);
        }
        try {
          if (response.videos) {
            videos = typeof response.videos === 'string' ? JSON.parse(response.videos) : response.videos;
            if (!Array.isArray(videos)) videos = [];
          }
        } catch (e) {
          console.warn('解析 videos 失败:', e);
        }
        
        // 将API数据转换为表单数据格式
        const projectData: ProjectFormData = {
          name: response.title || '',
          implementers: implementers,
          background: response.background || '',
          solution: response.solution || '',
          features: response.features || '',
          impactType: response.actualImpact ? 'actual' : 'estimated',
          impactDescription: response.actualImpact || response.estimatedImpact || '',
          estimatedImpact: response.estimatedImpact || '',
          actualImpact: response.actualImpact || '',
          efficiency: response.impact?.efficiency || '',
          costSaving: response.impact?.costSaving || '',
          satisfaction: response.impact?.satisfaction || '',
          status: statusMap[response.status] || response.status || '需求已确认',
          categories: response.category ? [response.category] : [],
          departments: departments,
          requesterDepartment: response.department?.name || '',
          requesterName: response.requesterName || '',
          launchDate: response.launchDate ? new Date(response.launchDate).toISOString().split('T')[0] : '',
          images: images,
          videos: videos,
        };
        
        setFormData(projectData);
        console.log('✅ 项目数据已加载:', projectData.name);
      } catch (error) {
        console.error('获取项目详情失败:', error);
        toast.error('获取项目详情失败');
        setIsLoadingProject(false);
      } finally {
        setIsLoadingProject(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);
  const [newImplementer, setNewImplementer] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [aiFillDialogOpen, setAiFillDialogOpen] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [uploadingVideos, setUploadingVideos] = useState<boolean[]>([]);

  // 可选的业务范畴
  const availableCategories = ['客服', '数据', '创作', '人力', '财务', '法务', '市场', '运营', '技术', '产品'];

  // 项目状态选项
  const statusOptions = [
    '需求已确认',
    '排期中',
    '生产中',
    '交付未投产',
    '交付已投产'
  ];

  const handleAddImplementer = () => {
    if (newImplementer.trim()) {
      setFormData({
        ...formData,
        implementers: [...formData.implementers, newImplementer.trim()]
      });
      setNewImplementer('');
    }
  };

  const handleRemoveImplementer = (index: number) => {
    setFormData({
      ...formData,
      implementers: formData.implementers.filter((_, i) => i !== index)
    });
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      setFormData({
        ...formData,
        departments: [...formData.departments.filter(d => d), newDepartment.trim()]
      });
      setNewDepartment('');
    }
  };

  const handleRemoveDepartment = (index: number) => {
    setFormData({
      ...formData,
      departments: formData.departments.filter((_, i) => i !== index)
    });
  };

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // 验证文件大小（10MB）
    const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`以下图片超过10MB限制：${oversizedFiles.map(f => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }

    // 设置上传状态
    const startIndex = formData.images.length;
    setUploadingImages(prev => [...prev, ...fileArray.map(() => true)]);

    try {
      const uploadPromises = fileArray.map(file => uploadApi.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const newImageUrls = results.map(result => result.url);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls],
      }));
      
      toast.success(`成功上传 ${results.length} 张图片`);
    } catch (error: any) {
      console.error('图片上传失败:', error);
      toast.error(error.message || '图片上传失败，请重试');
    } finally {
      // 清除上传状态
      setUploadingImages(prev => prev.slice(0, startIndex));
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // 验证文件大小（100MB）
    const oversizedFiles = fileArray.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`以下视频超过100MB限制：${oversizedFiles.map(f => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }

    // 设置上传状态
    const startIndex = formData.videos.length;
    setUploadingVideos(prev => [...prev, ...fileArray.map(() => true)]);

    try {
      const uploadPromises = fileArray.map(file => uploadApi.uploadVideo(file));
      const results = await Promise.all(uploadPromises);
      
      const newVideoUrls = results.map(result => result.url);
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...newVideoUrls],
      }));
      
      toast.success(`成功上传 ${results.length} 个视频`);
    } catch (error: any) {
      console.error('视频上传失败:', error);
      toast.error(error.message || '视频上传失败，请重试');
    } finally {
      // 清除上传状态
      setUploadingVideos(prev => prev.slice(0, startIndex));
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleRemoveVideo = (index: number) => {
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index)
    });
  };

  // AI自动填写功能：从文档中解析数据
  // 🤖 智能AI解析函数 - 能够理解语义并自动拆解内容
  const parseDocumentData = (text: string): Partial<ProjectFormData> => {
    const result: Partial<ProjectFormData> = {};
    
    // ========================================
    // 策略1: 先尝试结构化解析（有明确字段名）
    // ========================================
    
    // 解析项目名称
    const nameMatch = text.match(/(?:项目名称|项目名|名称|标题)[：:]\s*\n?```?\n?([^\n`]+)/i);
    if (nameMatch) {
      result.name = nameMatch[1].trim();
    }
    
    // 解析项目实施人（支持多种格式）
    const implementersMatch = text.match(/(?:项目实施人|实施人员|开发团队|项目负责人|负责人|团队成员)[：:]\s*\n?([\s\S]*?)(?=\n\n|\n[^\n]*[：:]|$)/i);
    if (implementersMatch) {
      const implementersText = implementersMatch[1].trim();
      const implementers = implementersText
        .split(/[\n,，、]/)
        .map(line => line.replace(/^[\s\-•*`]+/, '').trim())
        .filter(line => line && line.length > 0 && line.length < 20)
        .filter(name => /^[\u4e00-\u9fa5a-zA-Z\s]{2,10}$/.test(name)); // 只保留2-10个字符的姓名
      if (implementers.length > 0) {
        result.implementers = implementers;
      }
    }
    
    // 解析项目背景
    const backgroundMatch = text.match(/(?:项目背景|背景|问题背景|业务背景|痛点)[：:]\s*\n?([\s\S]*?)(?=\n\n[^\n]*[：:]|$)/i);
    if (backgroundMatch) {
      result.background = backgroundMatch[1].replace(/```/g, '').trim();
    }
    
    // 解析解决方案
    const solutionMatch = text.match(/(?:解决方案|方案|技术方案|实施方案|如何解决)[：:]\s*\n?([\s\S]*?)(?=\n\n[^\n]*[：:]|$)/i);
    if (solutionMatch) {
      result.solution = solutionMatch[1].replace(/```/g, '').trim();
    }
    
    // 解析核心功能
    const featuresMatch = text.match(/(?:核心功能|主要功能|功能特性|功能列表|功能点)[：:]\s*\n?([\s\S]*?)(?=\n\n[^\n]*[：:]|$)/i);
    if (featuresMatch) {
      result.features = featuresMatch[1].replace(/```/g, '').trim();
    }
    
    // 解析实施效果（真实）
    const actualImpactMatch = text.match(/(?:实施效果|实际效果|取得成效|项目成果|运行效果)[：:]\s*\n?([\s\S]*?)(?=\n\n[^\n]*[：:]|$)/i);
    if (actualImpactMatch) {
      result.actualImpact = actualImpactMatch[1].replace(/```/g, '').trim();
    }
    
    // 解析预估效果
    const estimatedImpactMatch = text.match(/(?:预期效果|预估效果|期望效果|预期目标)[：:]\s*\n?([\s\S]*?)(?=\n\n[^\n]*[：:]|$)/i);
    if (estimatedImpactMatch) {
      result.estimatedImpact = estimatedImpactMatch[1].replace(/```/g, '').trim();
    }
    
    // 解析量化指标
    const efficiencyMatch = text.match(/效率[提升增长].*?(\+?\d+%)/i);
    if (efficiencyMatch) {
      result.efficiency = efficiencyMatch[1].startsWith('+') ? efficiencyMatch[1] : `+${efficiencyMatch[1]}`;
    }
    
    const costSavingMatch = text.match(/(?:节约|节省|降低).*?成本.*?([\d.]+[万千百]?元?|[\d.]+万)/i);
    if (costSavingMatch) {
      result.costSaving = `~${costSavingMatch[1].replace('元', '')}${costSavingMatch[1].includes('元') ? '' : '元'}/每年`;
    }
    
    const satisfactionMatch = text.match(/满意度[提升增长].*?(\+?\d+%)/i);
    if (satisfactionMatch) {
      result.satisfaction = satisfactionMatch[1].startsWith('+') ? satisfactionMatch[1] : `+${satisfactionMatch[1]}`;
    }
    
    // 解析当前状态
    const statusMatch = text.match(/(?:当前状态|项目状态|状态)[：:]\s*([^\n]+)/i);
    if (statusMatch) {
      const status = statusMatch[1].trim();
      if (statusOptions.includes(status)) {
        result.status = status;
      }
    }
    
    // 解析所属业务范畴
    const categoriesMatch = text.match(/(?:所属业务范畴|业务范畴|业务分类|分类|类别)[：:]\s*\n?([\s\S]*?)(?=\n\n[^\n]*[：:]|$)/i);
    if (categoriesMatch) {
      const categoriesText = categoriesMatch[1].trim();
      const categories = categoriesText
        .split(/[\n,，、]/)
        .map(line => line.replace(/^[\s\-•*`]+/, '').trim())
        .filter(line => availableCategories.includes(line));
      if (categories.length > 0) {
        result.categories = categories;
      }
    }
    
    // 解析赋能业务部门
    const departmentsMatch = text.match(/(?:赋能业务部门|业务部门|使用部门|目标部门|部门)[：:]\s*\n?([\s\S]*?)(?=\n\n[^\n]*[：:]|$)/i);
    if (departmentsMatch) {
      const departmentsText = departmentsMatch[1].trim();
      const departments = departmentsText
        .split(/[\n,，、]/)
        .map(line => line.replace(/^[\s\-•*`]+/, '').trim())
        .filter(line => line && line.length > 0 && line.length < 30);
      if (departments.length > 0) {
        result.departments = departments;
      }
    }
    
    // 解析需求提出部门
    const requesterDeptMatch = text.match(/(?:需求提出部门|需求部门|申请部门)[：:]\s*([^\n]+)/i);
    if (requesterDeptMatch) {
      result.requesterDepartment = requesterDeptMatch[1].trim();
    }
    
    // 解析上线日期
    const dateMatch = text.match(/(?:上线日期|上线时间|发布时间|发布日期)[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/i);
    if (dateMatch) {
      const dateStr = dateMatch[1]
        .replace(/[年月]/g, '-')
        .replace(/日/g, '')
        .replace(/\//g, '-');
        result.launchDate = dateStr;
    }
    
    // ========================================
    // 策略2: 智能语义分析（无明确字段名时）
    // ========================================
    
    // 如果没有找到项目名称，尝试从第一行提取
    if (!result.name) {
      const firstLine = text.split('\n')[0].trim();
      if (firstLine && firstLine.length > 0 && firstLine.length < 100 && !firstLine.includes('：')) {
        result.name = firstLine;
      }
    }
    
    // 如果没有明确字段，尝试智能分段
    if (!result.background && !result.solution && !result.features) {
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
      
      // 第一段通常是背景或简介
      if (paragraphs[0]) {
        const firstPara = paragraphs[0].trim();
        if (firstPara.includes('面临') || firstPara.includes('问题') || firstPara.includes('需求') || 
            firstPara.includes('痛点') || firstPara.includes('挑战')) {
          result.background = firstPara;
        }
      }
      
      // 第二段通常是解决方案
      if (paragraphs[1]) {
        const secondPara = paragraphs[1].trim();
        if (secondPara.includes('采用') || secondPara.includes('通过') || secondPara.includes('基于') ||
            secondPara.includes('实现') || secondPara.includes('构建') || secondPara.includes('使用')) {
          result.solution = secondPara;
        }
      }
      
      // 查找包含功能列表的段落
      for (const para of paragraphs) {
        if (para.match(/[\d\-•*]\s*[^：\n]{5,30}[：:]/g) && para.split('\n').length >= 3) {
          result.features = para.trim();
          break;
        }
      }
    }
    
    // 智能提取人名（从整篇文档中）
    if (!result.implementers || result.implementers.length === 0) {
      const namePattern = /(?:开发|实施|负责|完成|团队|成员).*?([王李张刘陈杨赵黄周吴徐孙胡朱高林何郭罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭][^\s，。、：:]{1,3})/g;
      const names: string[] = [];
      let match;
      while ((match = namePattern.exec(text)) !== null) {
        const name = match[1].trim();
        if (name.length >= 2 && name.length <= 4 && !names.includes(name)) {
          names.push(name);
        }
      }
      if (names.length > 0) {
        result.implementers = names.slice(0, 5); // 最多5个人
      }
    }
    
    return result;
  };

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('文件大小不能超过5MB');
      e.target.value = '';
      return;
    }

    // 支持的文件扩展名
    const allowedExtensions = ['.txt', '.md', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    // 检查文件类型或扩展名
    const isValidFile = file.type.includes('text') || 
                       file.type.includes('document') || 
                       file.type.includes('msword') ||
                       file.type.includes('wordprocessingml') ||
                       hasValidExtension;

    if (!isValidFile) {
      toast.error('请上传文本文件（.txt、.md、.doc、.docx）');
      e.target.value = '';
      return;
    }

    setIsLoadingFile(true);
    try {
      // 对于文本文件，直接读取
      if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        const text = await file.text();
        setDocumentText(text);
        toast.success('文件读取成功，点击"自动填充"按钮填充表单');
      } else {
        // 对于Word文档，提示用户复制粘贴内容
        toast.warning('Word文档需要手动复制粘贴内容，或转换为.txt/.md格式');
        e.target.value = '';
      }
    } catch (error: any) {
      console.error('文件读取错误:', error);
      toast.error(`文件读取失败: ${error.message || '请检查文件格式'}`);
    } finally {
      setIsLoadingFile(false);
      // 重置文件输入
      e.target.value = '';
    }
  };

  const handleAiFill = async () => {
    if (!documentText.trim()) {
      toast.error('请输入文档内容或上传文件');
      return;
    }
    
    setIsAiParsing(true);
    
    try {
      // 调用后端 AI API
      const response = await aiApi.parseProject(documentText);
      const parsedData = response.data;
    
      if (!parsedData || Object.keys(parsedData).length === 0) {
      toast.error('未能从文档中解析出有效数据，请检查文档格式');
      return;
    }
      
      // 转换字段名以匹配表单数据结构
      const formDataUpdate: Partial<ProjectFormData> = {};
      
      // 基础信息
      if (parsedData.name) formDataUpdate.name = parsedData.name;
      
      // 项目实施人（确保是数组格式）
      if (parsedData.implementers) {
        formDataUpdate.implementers = Array.isArray(parsedData.implementers) 
          ? parsedData.implementers.filter(name => name && name.trim())
          : [parsedData.implementers].filter(name => name && name.trim());
      }
      
      // 需求方信息
      if (parsedData.requesterDepartment) formDataUpdate.requesterDepartment = parsedData.requesterDepartment;
      if (parsedData.requesterName) formDataUpdate.requesterName = parsedData.requesterName;
      
      // 项目介绍部分
      if (parsedData.background) formDataUpdate.background = parsedData.background;
      if (parsedData.solution) formDataUpdate.solution = parsedData.solution;
      if (parsedData.features) formDataUpdate.features = parsedData.features;
      
      // 效果信息
      if (parsedData.estimatedImpact) formDataUpdate.estimatedImpact = parsedData.estimatedImpact;
      if (parsedData.actualImpact) formDataUpdate.actualImpact = parsedData.actualImpact;
      
      // 根据是否有实际效果，自动设置效果类型
      if (parsedData.actualImpact) {
        formDataUpdate.impactType = 'actual';
        formDataUpdate.impactDescription = parsedData.actualImpact;
      } else if (parsedData.estimatedImpact) {
        formDataUpdate.impactType = 'estimated';
        formDataUpdate.impactDescription = parsedData.estimatedImpact;
      }
      
      // 关键效果指标
      if (parsedData.efficiency) formDataUpdate.efficiency = parsedData.efficiency;
      if (parsedData.costSaving) formDataUpdate.costSaving = parsedData.costSaving;
      if (parsedData.satisfaction) formDataUpdate.satisfaction = parsedData.satisfaction;
      
      // 项目状态
      if (parsedData.status) {
        // 映射状态值到表单选项
        const statusMap: Record<string, string> = {
          '需求已确认': '需求已确认',
          '排期中': '排期中',
          '生产中': '生产中',
          '交付未投产': '交付未投产',
          '交付已投产': '交付已投产',
        };
        formDataUpdate.status = statusMap[parsedData.status] || parsedData.status;
      }
      
      // 业务范畴（确保是数组）
      if (parsedData.categories) {
        formDataUpdate.categories = Array.isArray(parsedData.categories) 
          ? parsedData.categories.filter(cat => cat && cat.trim())
          : [parsedData.categories].filter(cat => cat && cat.trim());
      }
      
      // 赋能业务部门（确保是数组）
      if (parsedData.departments) {
        formDataUpdate.departments = Array.isArray(parsedData.departments) 
          ? parsedData.departments.filter(dept => dept && dept.trim())
          : [parsedData.departments].filter(dept => dept && dept.trim());
      }
      
      // 上线日期
      if (parsedData.launchDate) {
        // 格式化日期为 YYYY-MM-DD
        const dateStr = parsedData.launchDate.replace(/[年月]/g, '-').replace(/[日]/g, '').replace(/\//g, '-');
        formDataUpdate.launchDate = dateStr;
      }
    
    // 合并解析的数据到表单
    setFormData(prev => ({
      ...prev,
        ...formDataUpdate,
        // 确保数组字段不为空
        implementers: formDataUpdate.implementers && formDataUpdate.implementers.length > 0 
          ? formDataUpdate.implementers 
          : prev.implementers,
        departments: formDataUpdate.departments && formDataUpdate.departments.length > 0 
          ? formDataUpdate.departments 
          : prev.departments,
        categories: formDataUpdate.categories && formDataUpdate.categories.length > 0 
          ? formDataUpdate.categories 
          : prev.categories,
      }));
      
      // 统计成功填充的字段数量
      const filledFieldsCount = Object.keys(formDataUpdate).filter(key => {
        const value = formDataUpdate[key as keyof ProjectFormData];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== '';
      }).length;
      
      if (filledFieldsCount > 0) {
        toast.success(`成功解析并填充 ${filledFieldsCount} 个字段`);
    setAiFillDialogOpen(false);
    setDocumentText('');
      } else {
        toast.warning('未能从文档中解析出有效数据，请检查文档格式或内容');
      }
    } catch (error: any) {
      console.error('AI解析失败:', error);
      const errorMessage = error.message || 'AI解析失败，请稍后重试';
      toast.error(errorMessage);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填项
    if (!formData.name.trim()) {
      alert('请填写项目名称');
      return;
    }
    if (formData.implementers.filter(i => i.trim()).length === 0) {
      alert('请至少添加一名项目实施人');
      return;
    }
    if (!formData.requesterDepartment.trim()) {
      alert('请填写需求提出部门');
      return;
    }
    if (!formData.background.trim()) {
      alert('请填写项目背景');
      return;
    }
    if (!formData.solution.trim()) {
      alert('请填写解决方案');
      return;
    }
    if (!formData.features.trim()) {
      alert('请填写核心功能');
      return;
    }

    onSave(formData);
  };

  // 调试：显示当前状态
  console.log('🎨 ProjectEditor 渲染, projectId:', projectId, 'isLoadingProject:', isLoadingProject);

  // 加载中状态
  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">加载项目数据中...</p>
          <p className="text-xs text-slate-400 mt-2">项目ID: {projectId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
              <h1 className="text-xl font-bold text-slate-900">
                {projectId ? '编辑项目' : '新建项目'}
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiFillDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200"
            >
              <Sparkles className="size-4 text-purple-600" />
              AI自动填写
            </Button>
          </div>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 项目名称 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-900 flex items-center gap-1">
                项目名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入客户能看懂的正式名称，非内部代号"
                className="h-10"
              />
              <p className="text-xs text-slate-500">填写客户能理解的正式名称，避免使用内部代号</p>
            </div>

            {/* 项目实施人 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900 flex items-center gap-1">
                项目实施人 <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {formData.implementers.map((implementer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-slate-900 border-purple-200 px-3 py-1.5">
                      {index === 0 && <span className="text-purple-600 mr-1.5">👑</span>}
                      {implementer}
                    </Badge>
                    {formData.implementers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImplementer(index)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                    {index === 0 && (
                      <span className="text-xs text-slate-500">项目负责人（第一顺位）</span>
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newImplementer}
                    onChange={(e) => setNewImplementer(e.target.value)}
                    placeholder="输入姓名后点击添加"
                    className="h-9"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImplementer();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddImplementer}
                    className="gap-2 h-9"
                  >
                    <Plus className="size-4" />
                    添加
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">可添加多人，第一个添加的人员为项目负责人</p>
            </div>

            {/* ✅ 需求提出部门 */}
            <div className="space-y-2">
              <Label htmlFor="requesterDepartment" className="text-sm font-medium text-slate-900 flex items-center gap-1">
                需求提出部门 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="requesterDepartment"
                value={formData.requesterDepartment}
                onChange={(e) => setFormData({ ...formData, requesterDepartment: e.target.value })}
                placeholder="例如：人力资源部"
              />
              <p className="text-xs text-slate-500">区分需求方和开发方</p>
            </div>

            {/* ✅ 项目介绍（4部分） */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-slate-900">项目介绍 *</Label>
              
              {/* 1. 项目背景 */}
              <div className="space-y-2">
                <Label htmlFor="background" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span>🎯 项目背景</span>
                  <span className="text-xs text-slate-500 font-normal">（必填）</span>
                </Label>
                <Textarea
                  id="background"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="例如：人力资源部面临着日益增长的业务需求，传统的工作方式已经无法满足快速发展的需要..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* 2. 解决方案 */}
              <div className="space-y-2">
                <Label htmlFor="solution" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span>💡 解决方案</span>
                  <span className="text-xs text-slate-500 font-normal">（必填）</span>
                </Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="例如：该方案采用最新的AI技术，结合人力资源部的实际业务场景，打造了一套完整的智能化解决方案..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* 3. 核心功能 */}
              <div className="space-y-2">
                <Label htmlFor="features" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span>🚀 核心功能</span>
                  <span className="text-xs text-slate-500 font-normal">（必填，每行一个功能）</span>
                </Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="每行输入一个核心功能，例如：&#10;智能化处理流程，大幅提升工作效率&#10;自动化任务执行，减少人工重复操作&#10;数据驱动决策，提供实时分析报告&#10;灵活配置选项，适应不同业务场景"
                  rows={6}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-slate-500">💡 提示：每行一个功能点，展示时会自动格式化为列表</p>
              </div>

              {/* 4. 实施效果（预估/真实） */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedImpact" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <span>📈 实施效果（预估）</span>
                    <span className="text-xs text-slate-500 font-normal">（可选）</span>
                  </Label>
                  <Textarea
                    id="estimatedImpact"
                    value={formData.estimatedImpact}
                    onChange={(e) => setFormData({ ...formData, estimatedImpact: e.target.value })}
                    placeholder="例如：预计效率提升60%，年节约成本50万元..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualImpact" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <span>📊 实施效果（真实）</span>
                    <span className="text-xs text-slate-500 font-normal">（可选）</span>
                  </Label>
                  <Textarea
                    id="actualImpact"
                    value={formData.actualImpact}
                    onChange={(e) => setFormData({ ...formData, actualImpact: e.target.value })}
                    placeholder="例如：实际效率提升65%，年节约成本55万元..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ✅ 关键效果（可选） */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                📊 关键效果
                <span className="text-xs font-normal text-slate-500">（可选，项目完成后填写）</span>
              </Label>
              <p className="text-sm text-slate-500">
                💡 提示：如果项目未完成，可以暂时不填写
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {/* 效率提升 */}
                <div className="space-y-2">
                  <Label htmlFor="efficiency" className="text-sm font-medium text-slate-700">
                    ⚡ 效率提升
                  </Label>
                  <Input
                    id="efficiency"
                    value={formData.efficiency || ''}
                    onChange={(e) => {
                      // 用户只需输入数字，自动添加%
                      let value = e.target.value.replace(/[^0-9+.-]/g, ''); // 只保留数字和+、-、.
                      // 如果已经包含%，去掉%
                      value = value.replace(/%/g, '');
                      const formatted = value ? (value.startsWith('+') || value.startsWith('-') ? value : `+${value}`) + '%' : '';
                      setFormData({ ...formData, efficiency: formatted });
                    }}
                    placeholder="例如：60（自动添加%）"
                  />
                  <p className="text-xs text-slate-500">只需填写数字，自动添加%</p>
                </div>

                {/* 成本节约 */}
                <div className="space-y-2">
                  <Label htmlFor="costSaving" className="text-sm font-medium text-slate-700">
                    💰 成本节约
                  </Label>
                  <Input
                    id="costSaving"
                    value={formData.costSaving || ''}
                    onChange={(e) => {
                      // 用户只需输入数字，自动添加/每年
                      const value = e.target.value.replace(/[^0-9.-]/g, ''); // 只保留数字和.
                      const formatted = value ? `${value}/每年` : '';
                      setFormData({ ...formData, costSaving: formatted });
                    }}
                    placeholder="例如：50（自动添加/每年）"
                  />
                  <p className="text-xs text-slate-500">只需填写数字，自动添加/每年</p>
                </div>

                {/* 满意度 */}
                <div className="space-y-2">
                  <Label htmlFor="satisfaction" className="text-sm font-medium text-slate-700">
                    😊 满意度
                  </Label>
                  <Input
                    id="satisfaction"
                    value={formData.satisfaction || ''}
                    onChange={(e) => {
                      // 用户只需输入数字，自动添加%
                      const value = e.target.value.replace(/[^0-9+.-]/g, ''); // 只保留数字和+、-、.
                      const formatted = value ? (value.startsWith('+') || value.startsWith('-') ? value : `+${value}`) + '%' : '';
                      setFormData({ ...formData, satisfaction: formatted });
                    }}
                    placeholder="例如：35（自动添加%）"
                  />
                  <p className="text-xs text-slate-500">只需填写数字，自动添加%</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">💡 复用次数由系统自动统计，无需填写</p>
            </div>

            {/* 当前状态 */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-900 flex items-center gap-1">
                当前状态 <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 所属业务范畴 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                所属业务范畴（可多选）
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <Badge
                    key={category}
                    variant={formData.categories.includes(category) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      formData.categories.includes(category)
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'hover:bg-slate-100'
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 赋能业务部门 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                赋能业务部门（如有）
              </Label>
              <div className="space-y-2">
                {formData.departments.filter(d => d).map((dept, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1.5">
                      {dept}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDepartment(index)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="输入部门名称后点击添加"
                    className="h-9"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDepartment();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDepartment}
                    className="gap-2 h-9"
                  >
                    <Plus className="size-4" />
                    添加
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">填写成功应用该方案的业务单位</p>
            </div>

            {/* 上线日期 */}
            <div className="space-y-2">
              <Label htmlFor="launchDate" className="text-sm font-medium text-slate-900">
                上线日期（如有）
              </Label>
              <Input
                id="launchDate"
                type="date"
                value={formData.launchDate}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-slate-500">首次在业务部门成功运行的日期</p>
            </div>

            {/* 图片上传 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <ImageIcon className="size-4 text-purple-600" />
                项目图片（如有）
              </Label>
              
              {/* 上传按钮区域 */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-purple-400 transition-colors bg-slate-50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    disabled={uploadingImages.some(u => u)}
                    className="gap-2 bg-white hover:bg-purple-50 hover:border-purple-400"
                  >
                    {uploadingImages.some(u => u) ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        选择图片上传
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500">支持 JPG、PNG、GIF 格式，可多选</p>
                </div>
              </div>

              {/* 图片预览网格 */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {formData.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-purple-400 transition-all"
                    >
                      <img
                        src={image}
                        alt={`项目图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white">图片 {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 视频上传 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Video className="size-4 text-blue-600" />
                项目视频（如有）
              </Label>
              
              {/* 上传按钮区域 */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors bg-slate-50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="videoUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('videoUpload')?.click()}
                    disabled={uploadingVideos.some(u => u)}
                    className="gap-2 bg-white hover:bg-blue-50 hover:border-blue-400"
                  >
                    {uploadingVideos.some(u => u) ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        选择视频上传
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500">支持 MP4、MOV、AVI 格式，可多选</p>
                </div>
              </div>

              {/* 视频预览网格 */}
              {formData.videos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {formData.videos.map((video, index) => (
                    <div 
                      key={index} 
                      className="relative group rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 transition-all"
                    >
                      <video
                        src={video}
                        className="w-full h-32 object-cover"
                        controls
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveVideo(index)}
                        className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full shadow-lg opacity-80 hover:opacity-100"
                      >
                        <X className="size-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white">视频 {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Save className="size-4" />
                提交项目
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
              >
                取消
              </Button>
              <div className="flex-1 flex items-center gap-2 text-xs text-slate-500 ml-4">
                <Clock className="size-3" />
                <span>提交后将进入审核流程，审核通过后项目将正式上架</span>
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* AI自动填写对话框 */}
      <Dialog open={aiFillDialogOpen} onOpenChange={setAiFillDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-white rounded-lg shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-purple-600" />
              AI自动填写
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-1">
              上传文档或粘贴内容，AI将自动识别并填充表单
            </DialogDescription>
          </DialogHeader>
          
          {/* 可滚动内容区域 */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* 文件上传区域 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">方式一：上传文档文件</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-purple-400 transition-colors bg-slate-50/50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Input
                    type="file"
                    accept=".txt,.md,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="documentUpload"
                    disabled={isLoadingFile}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('documentUpload')?.click()}
                    className="gap-2 bg-white hover:bg-purple-50 hover:border-purple-400"
                    disabled={isLoadingFile}
                  >
                    {isLoadingFile ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        读取中...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        选择文档文件
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    支持 .txt、.md 格式（推荐）<br />
                    Word文档请复制粘贴内容
                  </p>
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">或</span>
              </div>
            </div>

            {/* 文本输入区域 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">方式二：粘贴文档内容</Label>
              <Textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder={`项目名称：
智能数据分析平台

项目实施人：
张明
李华
王芳

方案简介：
基于AI的智能数据分析平台，支持多数据源集成、自动化报表生成和智能洞察分析，大幅提升数据分析效率。

当前状态：
需求已确认

所属业务范畴：
数据
财务

赋能业务部门：
财务部
数据部

上线日期：
2024-12-01

量化成果：
已处理数据报表1,247份，报表生成效率提升80%`}
                className="min-h-[200px] max-h-[300px] font-mono text-xs resize-none"
              />
              <p className="text-xs text-slate-500">
                支持Markdown格式，AI会自动识别字段名称并提取内容
              </p>
            </div>

            {/* 支持的字段说明 - 可折叠 */}
            <details className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
              <summary className="text-xs text-blue-800 font-medium cursor-pointer hover:text-blue-900">
                支持的字段（点击展开）
              </summary>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>项目名称 / 项目名 / 名称</li>
                  <li>项目实施人 / 实施人 / 项目负责人</li>
                  <li>方案简介 / 简介 / 项目简介 / 摘要</li>
                  <li>当前状态 / 状态 / 项目状态</li>
                </ul>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>所属业务范畴 / 业务范畴 / 分类 / 类别</li>
                  <li>赋能业务部门 / 业务部门 / 部门</li>
                  <li>上线日期 / 日期 / 上线时间</li>
                  <li>量化成果 / 成果 / 量化结果</li>
                </ul>
              </div>
            </details>
          </div>

          {/* 底部按钮区域 */}
          <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAiFillDialogOpen(false);
                setDocumentText('');
              }}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleAiFill}
              disabled={!documentText.trim() || isAiParsing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
            >
              {isAiParsing ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  AI解析中...
                </>
              ) : (
                <>
              <Sparkles className="size-4 mr-2" />
              自动填充
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}