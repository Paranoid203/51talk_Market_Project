import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '用户姓名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '部门' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: '电话号码', example: '138-1234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '二维码图片URL（Cloudinary）' })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiPropertyOptional({ 
    description: '二维码类型', 
    enum: ['feishu', 'wechat'],
    example: 'feishu'
  })
  @IsOptional()
  @IsEnum(['feishu', 'wechat'])
  qrCodeType?: string;

  @ApiPropertyOptional({ description: '是否公开显示电话号码', default: true })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional({ description: '是否公开显示二维码', default: true })
  @IsOptional()
  @IsBoolean()
  showQrCode?: boolean;

  @ApiPropertyOptional({ description: '飞书ID', example: 'ou_xxxx' })
  @IsOptional()
  @IsString()
  feishuId?: string;

  @ApiPropertyOptional({ description: '飞书用户ID（用于深度链接）' })
  @IsOptional()
  @IsString()
  feishuUserId?: string;

  @ApiPropertyOptional({ description: '是否公开显示飞书联系方式', default: true })
  @IsOptional()
  @IsBoolean()
  showFeishu?: boolean;
}

