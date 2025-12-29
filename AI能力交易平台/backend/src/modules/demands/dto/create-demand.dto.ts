import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDecimal, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DemandStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateDemandDto {
  @ApiProperty({ description: '需求标题', example: '需要一个智能客服系统' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '需求描述', example: '需要开发一个基于AI的智能客服系统...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: '需求分类', example: 'AI工具' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: '部门ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  departmentId: number;

  @ApiPropertyOptional({ description: '预期完成时间', example: '3个月' })
  @IsOptional()
  @IsString()
  expectedTime?: string;

  @ApiPropertyOptional({ description: '奖励金额', example: 50000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  reward?: number;

  @ApiPropertyOptional({ description: '需求状态', enum: DemandStatus, default: DemandStatus.ACTIVE })
  @IsOptional()
  @IsEnum(DemandStatus)
  status?: DemandStatus;
}

