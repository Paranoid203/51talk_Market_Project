import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DemandStatus } from '@prisma/client';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class QueryDemandDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词（标题、描述）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '需求分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: '需求状态', enum: DemandStatus })
  @IsOptional()
  @IsEnum(DemandStatus)
  status?: DemandStatus;

  @ApiPropertyOptional({ description: '排序字段:方向，如 createdAt:desc' })
  @IsOptional()
  @IsString()
  sort?: string;
}

