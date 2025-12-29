import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectStatus } from '@prisma/client';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class QueryProjectDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词（标题、摘要）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '项目分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: '项目进度状态', enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: '审核状态', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: '是否精选' })
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: '排序字段:方向，如 createdAt:desc' })
  @IsOptional()
  @IsString()
  sort?: string;
}


