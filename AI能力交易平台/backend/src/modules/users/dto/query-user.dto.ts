import { IsOptional, IsString, IsInt, Min, IsEnum, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Role, UserStatus } from '@prisma/client';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词（姓名、邮箱）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: '用户角色', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: '用户状态', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ description: '排序字段:方向，如 createdAt:desc' })
  @IsOptional()
  @IsString()
  sort?: string;
}

