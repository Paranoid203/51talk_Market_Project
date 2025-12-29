import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class QueryToolDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '分类筛选' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '类型筛选' })
  @IsOptional()
  @IsEnum(['AGENT', 'API', 'EXTERNAL'])
  type?: string;

  @ApiPropertyOptional({ description: '是否精选' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: '排序', example: 'createdAt:desc' })
  @IsOptional()
  @IsString()
  sort?: string;
}

