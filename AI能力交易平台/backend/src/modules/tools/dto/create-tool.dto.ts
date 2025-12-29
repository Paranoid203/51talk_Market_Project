import { IsString, IsNumber, IsOptional, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateToolDto {
  @ApiProperty({ description: '工具名称', example: 'AI文案生成器' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '工具描述', example: '基于GPT-4的智能文案创作工具' })
  @IsString()
  description: string;

  @ApiProperty({ description: '分类', example: 'create', enum: ['create', 'data', 'chat', 'image', 'video', 'text'] })
  @IsString()
  category: string;

  @ApiProperty({ description: '类型', example: 'agent', enum: ['AGENT', 'API', 'EXTERNAL'] })
  @IsEnum(['AGENT', 'API', 'EXTERNAL'])
  type: string;

  @ApiPropertyOptional({ description: '价格', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '图标URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '外部链接' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'API端点' })
  @IsOptional()
  @IsString()
  apiEndpoint?: string;
}

