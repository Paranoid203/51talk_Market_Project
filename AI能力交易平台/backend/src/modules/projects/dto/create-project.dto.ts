import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ description: '项目标题', example: '智能客服系统' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: '项目摘要（兼容旧版）', example: '基于AI的智能客服系统...' })
  @IsOptional()
  @IsString()
  summary?: string;

  // ✅ 新增：项目介绍的4个部分
  @ApiPropertyOptional({ description: '项目背景' })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional({ description: '解决方案' })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiPropertyOptional({ description: '核心功能（每行一个功能）' })
  @IsOptional()
  @IsString()
  features?: string;

  @ApiPropertyOptional({ description: '预估效果' })
  @IsOptional()
  @IsString()
  estimatedImpact?: string;

  @ApiPropertyOptional({ description: '实际效果' })
  @IsOptional()
  @IsString()
  actualImpact?: string;

  // ✅ 新增：AI自动生成字段
  @ApiPropertyOptional({ description: '项目简介（AI生成）' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ description: '项目周期' })
  @IsOptional()
  @IsString()
  duration?: string;

  // ✅ 新增：关键效果字段
  @ApiPropertyOptional({ description: '效率提升' })
  @IsOptional()
  @IsString()
  efficiency?: string;

  @ApiPropertyOptional({ description: '成本节约' })
  @IsOptional()
  @IsString()
  costSaving?: string;

  @ApiPropertyOptional({ description: '满意度' })
  @IsOptional()
  @IsString()
  satisfaction?: string;

  @ApiProperty({ description: '部门ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  departmentId: number;

  @ApiProperty({ description: '需求方ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  requesterId: number;

  @ApiProperty({ description: '需求方部门ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  requesterDepartmentId: number;

  @ApiPropertyOptional({ description: '需求方姓名（在项目广场显示）', example: '张三' })
  @IsOptional()
  @IsString()
  requesterName?: string;

  @ApiPropertyOptional({ description: '赋能部门', example: '客户服务部、市场部' })
  @IsOptional()
  @IsString()
  empoweredDepartments?: string;

  @ApiPropertyOptional({ description: '上线日期' })
  @IsOptional()
  @IsString()
  launchDate?: string;

  @ApiProperty({ description: '项目负责人ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  projectLeadId: number;

  @ApiProperty({ description: '项目负责人部门ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  projectLeadDepartmentId: number;

  @ApiProperty({ description: '项目分类', example: 'AI工具' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: '项目进度状态（用户选择：需求已确认、排期中、生产中、交付未投产、交付已投产）', enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: '项目图片URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: '项目背景图片URL' })
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @ApiPropertyOptional({ description: '项目图片URL列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '项目视频URL列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiPropertyOptional({ description: '标签ID列表', type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  tagIds?: number[];

  @ApiPropertyOptional({ description: '项目实施人/开发人员姓名列表', type: [String], example: ['张三', '李四', '王五'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  implementers?: string[];
}


