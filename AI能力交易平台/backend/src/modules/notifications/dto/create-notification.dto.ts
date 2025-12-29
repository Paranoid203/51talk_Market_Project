import { IsInt, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: '用户ID', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: '通知类型', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: '通知标题', example: '项目已审核通过' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '通知内容', example: '您的项目"智能客服系统"已审核通过' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '跳转链接', example: '/projects/1' })
  @IsOptional()
  @IsString()
  link?: string;
}

