/**
 * Excel批量导入项目脚本
 * 
 * 使用方法：
 * 1. 将飞书导出的Excel文件放到 backend 目录下，命名为 projects.xlsx
 * 2. 运行: node import-projects.js
 * 
 * Excel列名映射（支持中英文）：
 * - 项目名称/title → title
 * - 项目背景/background → background
 * - 解决方案/solution → solution  
 * - 核心功能/features → features
 * - 预估效果/estimatedImpact → estimatedImpact
 * - 实际效果/actualImpact → actualImpact
 * - 需求方/requesterName → requesterName
 * - 赋能部门/empoweredDepartments → empoweredDepartments
 * - 上线日期/launchDate → launchDate
 * - 项目分类/category → category
 * - 项目状态/status → status
 * - 项目负责人/projectLead → implementers
 * - 效率提升/efficiency → efficiency
 * - 成本节约/costSaving → costSaving
 * - 满意度/satisfaction → satisfaction
 */

const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Column name mappings (Chinese → English field name)
const COLUMN_MAPPINGS = {
  // Title - 项目名称
  '项目名称': 'title',
  '项目名称（Project Name）': 'title',
  'Project Name': 'title',
  '项目标题': 'title',
  '名称': 'title',
  'title': 'title',
  
  // Product Description - 产品说明 → 作为解决方案
  '产品说明': 'solution',
  '产品说明（Project Description）': 'solution',
  'Project Description': 'solution',
  
  // Business Issues - 业务痛点 → 作为项目背景
  '业务痛点': 'background',
  '业务痛点（Business issues）': 'background',
  'Business issues': 'background',
  '项目背景': 'background',
  '背景': 'background',
  'background': 'background',
  
  // Key Features - 核心功能点
  '核心功能点': 'features',
  '核心功能点（Key Features）': 'features',
  'Key Features': 'features',
  '核心功能': 'features',
  '功能': 'features',
  '主要功能': 'features',
  'features': 'features',
  
  // Customer Value - 客户价值 → 作为实际效果
  '客户价值': 'actualImpact',
  '客户价值（Customer Value）': 'actualImpact',
  'Customer Value': 'actualImpact',
  '实际效果': 'actualImpact',
  '效果': 'actualImpact',
  'actualImpact': 'actualImpact',
  
  // Estimated Impact
  '预估效果': 'estimatedImpact',
  '预期效果': 'estimatedImpact',
  'estimatedImpact': 'estimatedImpact',
  
  // Customer Department - 客户部门 → 赋能部门
  '客户部门': 'empoweredDepartments',
  '客户部门（Department）': 'empoweredDepartments',
  'Department': 'empoweredDepartments',
  '赋能部门': 'empoweredDepartments',
  '赋能部门列表': 'empoweredDepartments',
  'empoweredDepartments': 'empoweredDepartments',
  
  // Region - 所属区域 → 作为分类
  '所属区域': 'region',
  '所属区域（Reigon）': 'region',
  '所属区域（Region）': 'region',
  'Region': 'region',
  'Reigon': 'region',
  
  // Project Demo Video
  '项目Demo视频': 'demoVideo',
  '项目Demo视频（Demo）': 'demoVideo',
  'Demo': 'demoVideo',
  
  // Project Links
  '项目链接及相关材料': 'projectLinks',
  '项目链接及相关材料（P）': 'projectLinks',
  
  // Status - 项目状态
  '项目状态': 'status',
  '项目状态（Status）': 'status',
  'Status': 'status',
  '状态': 'status',
  '进度状态': 'status',
  'status': 'status',
  
  // Project Lead / Implementers - 项目负责人
  '项目负责人': 'implementers',
  '项目负责人（Project S）': 'implementers',
  'Project S': 'implementers',
  '负责人': 'implementers',
  '开发人员': 'implementers',
  '实施人': 'implementers',
  'implementers': 'implementers',
  'projectLead': 'implementers',
  
  // Requester Name
  '需求方': 'requesterName',
  '需求方姓名': 'requesterName',
  '提出人': 'requesterName',
  'requesterName': 'requesterName',
  
  // Launch Date
  '上线日期': 'launchDate',
  '上线时间': 'launchDate',
  '发布日期': 'launchDate',
  'launchDate': 'launchDate',
  
  // Category
  '项目分类': 'category',
  '分类': 'category',
  '类别': 'category',
  'category': 'category',
  
  // Efficiency
  '效率提升': 'efficiency',
  '效率': 'efficiency',
  'efficiency': 'efficiency',
  
  // Cost Saving
  '成本节约': 'costSaving',
  '成本': 'costSaving',
  '节约成本': 'costSaving',
  'costSaving': 'costSaving',
  
  // Satisfaction
  '满意度': 'satisfaction',
  '用户满意度': 'satisfaction',
  'satisfaction': 'satisfaction',
  
  // Summary / Short Description
  '项目摘要': 'summary',
  '摘要': 'summary',
  '简介': 'shortDescription',
  '项目简介': 'shortDescription',
  'summary': 'summary',
  'shortDescription': 'shortDescription',
  
  // Duration
  '项目周期': 'duration',
  '周期': 'duration',
  'duration': 'duration',
};

// Status mapping (Chinese → enum value)
const STATUS_MAPPINGS = {
  '需求已确认': 'REQUIREMENT_CONFIRMED',
  '排期中': 'SCHEDULED',
  '生产中': 'IN_PRODUCTION',
  '交付未投产': 'DELIVERED_NOT_DEPLOYED',
  '交付已投产': 'DELIVERED_DEPLOYED',
  '已完成': 'DELIVERED_DEPLOYED',
  '进行中': 'IN_PRODUCTION',
  '规划中': 'SCHEDULED',
  // English status names
  'Completed': 'DELIVERED_DEPLOYED',
  'In Progress': 'IN_PRODUCTION',
  'Planning': 'SCHEDULED',
  'Done': 'DELIVERED_DEPLOYED',
};

/**
 * Fuzzy match column name to field
 * Handles truncated column names from Excel export
 */
function matchColumnName(colName) {
  // First try exact match
  if (COLUMN_MAPPINGS[colName]) {
    return COLUMN_MAPPINGS[colName];
  }
  
  // Try partial matching for truncated columns
  const normalizedCol = colName.toLowerCase().replace(/[\s（）()]/g, '');
  
  const partialMatches = {
    '项目名称': 'title',
    'projectname': 'title',
    '产品说明': 'solution',
    'projectdescription': 'solution',
    '业务痛点': 'background',
    'businessissues': 'background',
    '核心功能': 'features',
    'keyfeature': 'features',
    '客户价值': 'actualImpact',
    'customervalue': 'actualImpact',
    '客户部门': 'empoweredDepartments',
    'department': 'empoweredDepartments',
    '所属区域': 'region',
    'region': 'region',
    '项目demo': 'demoVideo',
    'demo': 'demoVideo',
    '项目链接': 'projectLinks',
    '项目状态': 'status',
    'status': 'status',
    '项目负责人': 'implementers',
    'projects': 'implementers',
  };
  
  for (const [key, value] of Object.entries(partialMatches)) {
    if (normalizedCol.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle Excel serial date number
  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 86400000);
  }
  
  const str = String(dateStr).trim();
  
  // Try common formats
  const formats = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,  // 2024-01-15
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // 2024/01/15
    /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/, // 2024.01.15
    /^(\d{4})年(\d{1,2})月(\d{1,2})日?$/, // 2024年1月15日
  ];
  
  for (const regex of formats) {
    const match = str.match(regex);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
  }
  
  // Fallback: try native parsing
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Parse implementers string to array
 */
function parseImplementers(str) {
  if (!str) return [];
  return String(str)
    .split(/[,，、;；\s]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Get or create user by name
 */
async function getOrCreateUser(name, department) {
  if (!name || name.trim() === '') return null;
  
  const trimmedName = name.trim();
  
  // Try to find existing user by name
  let user = await prisma.user.findFirst({
    where: { name: trimmedName }
  });
  
  if (!user) {
    // Create new user
    const email = `${trimmedName.toLowerCase().replace(/\s+/g, '')}@51talk.com`;
    user = await prisma.user.create({
      data: {
        email: email,
        password: '$2b$10$batch.import.placeholder.hash', // Placeholder
        name: trimmedName,
        department: department.name,
        departmentId: department.id,
      }
    });
    console.log(`   👤 创建用户: ${trimmedName}`);
  }
  
  return user;
}

/**
 * Get or create default user and department
 */
async function getDefaults() {
  // Get or create default department
  let department = await prisma.department.findFirst({
    orderBy: { id: 'asc' }
  });
  
  if (!department) {
    department = await prisma.department.create({
      data: {
        name: '默认部门',
        description: '批量导入时使用的默认部门',
        updatedAt: new Date(),
      }
    });
    console.log('✅ 创建默认部门:', department.name);
  }
  
  // Get or create default user
  let user = await prisma.user.findFirst({
    orderBy: { id: 'asc' }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: '$2b$10$dummy.hash.for.batch.import', // Not a real password
        name: '系统管理员',
        department: department.name,
        departmentId: department.id,
      }
    });
    console.log('✅ 创建默认用户:', user.name);
  }
  
  return { department, user };
}

/**
 * Main import function
 */
async function importProjects(filePath) {
  console.log('\n📊 开始导入Excel文件:', filePath);
  
  // Check file exists
  if (!fs.existsSync(filePath)) {
    console.error('❌ 文件不存在:', filePath);
    console.log('\n请将飞书导出的Excel文件放到 backend 目录下，命名为 projects.xlsx');
    return;
  }
  
  // Read Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📋 读取到 ${rawData.length} 条记录，工作表: ${sheetName}\n`);
  
  if (rawData.length === 0) {
    console.log('⚠️ Excel文件为空或格式不正确');
    return;
  }
  
  // Show detected columns
  const excelColumns = Object.keys(rawData[0]);
  console.log('📝 检测到的列名:');
  excelColumns.forEach(col => {
    const mapped = matchColumnName(col);
    console.log(`   - "${col}" → ${mapped || '(未映射)'}`);
  });
  console.log('');
  
  // Get defaults
  const { department, user } = await getDefaults();
  console.log(`📁 使用默认部门: ${department.name} (ID: ${department.id})`);
  console.log(`👤 使用默认用户: ${user.name} (ID: ${user.id})\n`);
  
  // Process each row
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const rowNum = i + 2; // Excel row number (1-indexed + header)
    
    try {
      // Map columns to fields using fuzzy matching
      const projectData = {};
      for (const [excelCol, value] of Object.entries(row)) {
        const fieldName = matchColumnName(excelCol);
        if (fieldName && value !== undefined && value !== null && value !== '') {
          projectData[fieldName] = value;
        }
      }
      
      // Validate required field: title
      if (!projectData.title) {
        throw new Error('缺少项目名称');
      }
      
      // Check for duplicate title
      const existing = await prisma.project.findFirst({
        where: { title: projectData.title }
      });
      if (existing) {
        console.log(`⏭️  行 ${rowNum}: 跳过 "${projectData.title}" (已存在)`);
        continue;
      }
      
      // Parse and transform fields
      const launchDate = parseDate(projectData.launchDate);
      const implementers = parseImplementers(projectData.implementers);
      const status = STATUS_MAPPINGS[projectData.status] || 'DELIVERED_DEPLOYED';
      
      // Build category from region or use default
      let category = 'AI工具';
      if (projectData.category) {
        category = String(projectData.category).trim();
      } else if (projectData.region) {
        // Use region as category prefix
        category = `${String(projectData.region).trim()}项目`;
      }
      
      // Handle video URLs - can be comma-separated
      let videos = null;
      if (projectData.demoVideo) {
        const videoUrls = String(projectData.demoVideo)
          .split(/[,，\n]+/)
          .map(v => v.trim())
          .filter(v => v.startsWith('http'));
        if (videoUrls.length > 0) {
          videos = JSON.stringify(videoUrls);
        }
      }
      
      // Get or create project lead from implementers list
      let projectLeadId = user.id;
      let projectLeadDepartmentId = department.id;
      const implementerUsers = [];
      
      if (implementers.length > 0) {
        console.log(`   📌 负责人: ${implementers.join(', ')}`);
        
        // First implementer becomes the project lead
        const leadUser = await getOrCreateUser(implementers[0], department);
        if (leadUser) {
          projectLeadId = leadUser.id;
          projectLeadDepartmentId = leadUser.departmentId || department.id;
          implementerUsers.push(leadUser);
        }
        
        // Create other implementers as users
        for (let i = 1; i < implementers.length; i++) {
          const implUser = await getOrCreateUser(implementers[i], department);
          if (implUser) {
            implementerUsers.push(implUser);
          }
        }
      }
      
      // Create project with correct project lead
      const project = await prisma.project.create({
        data: {
          title: String(projectData.title).trim(),
          departmentId: department.id,
          requesterId: user.id,
          requesterDepartmentId: department.id,
          requesterName: null, // 不再使用需求方字段
          projectLeadId: projectLeadId,
          projectLeadDepartmentId: projectLeadDepartmentId,
          category: category,
          status: status,
          reviewStatus: 'APPROVED', // Auto-approve batch imports
          background: projectData.background ? String(projectData.background) : null,
          solution: projectData.solution ? String(projectData.solution) : null,
          features: projectData.features ? String(projectData.features) : null,
          estimatedImpact: projectData.estimatedImpact ? String(projectData.estimatedImpact) : null,
          actualImpact: projectData.actualImpact ? String(projectData.actualImpact) : null,
          empoweredDepartments: projectData.empoweredDepartments ? String(projectData.empoweredDepartments) : null,
          launchDate: launchDate,
          shortDescription: projectData.shortDescription ? String(projectData.shortDescription).substring(0, 200) : null,
          videos: videos,
        }
      });
      
      // Add all implementers as project developers
      for (const implUser of implementerUsers) {
        try {
          await prisma.projectDeveloper.create({
            data: {
              projectId: project.id,
              userId: implUser.id,
              role: implUser.id === projectLeadId ? '项目负责人' : '开发人员',
            }
          });
        } catch (e) {
          // Ignore duplicate errors
        }
      }
      
      // Create project impact if efficiency/costSaving/satisfaction provided
      if (projectData.efficiency || projectData.costSaving || projectData.satisfaction) {
        await prisma.projectImpact.create({
          data: {
            projectId: project.id,
            efficiency: projectData.efficiency ? String(projectData.efficiency) : null,
            costSaving: projectData.costSaving ? String(projectData.costSaving) : null,
            satisfaction: projectData.satisfaction ? String(projectData.satisfaction) : null,
          }
        });
      }
      
      successCount++;
      console.log(`✅ 行 ${rowNum}: 创建项目 "${project.title}" (ID: ${project.id})`);
      
    } catch (error) {
      failCount++;
      errors.push({ row: rowNum, error: error.message });
      console.log(`❌ 行 ${rowNum}: ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 导入完成');
  console.log(`   ✅ 成功: ${successCount} 条`);
  console.log(`   ❌ 失败: ${failCount} 条`);
  console.log(`   ⏭️  跳过: ${rawData.length - successCount - failCount} 条`);
  
  if (errors.length > 0) {
    console.log('\n❌ 错误详情:');
    errors.forEach(e => console.log(`   行 ${e.row}: ${e.error}`));
  }
}

// Run
const excelPath = process.argv[2] || path.join(__dirname, 'projects.xlsx');
importProjects(excelPath)
  .catch(console.error)
  .finally(() => prisma.$disconnect());

