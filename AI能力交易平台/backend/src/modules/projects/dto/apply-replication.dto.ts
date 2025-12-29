import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyReplicationDto {
  @ApiProperty({ description: '申请人姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  applicantName: string;

  @ApiProperty({ description: '申请人部门', example: '技术部' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiPropertyOptional({ description: '联系电话', example: '138-1234-5678' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: '团队规模', example: '5-10人' })
  @IsOptional()
  @IsString()
  teamSize?: string;

  @ApiPropertyOptional({ 
    description: '紧急程度', 
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  })
  @IsOptional()
  @IsString()
  urgency?: string;

  @ApiPropertyOptional({ description: '目标上线日期', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  targetLaunchDate?: string;

  @ApiProperty({ description: '业务场景', example: '我们需要这个项目来解决...' })
  @IsString()
  @IsNotEmpty()
  businessScenario: string;

  @ApiPropertyOptional({ description: '预期目标', example: '提升效率30%' })
  @IsOptional()
  @IsString()
  expectedGoals?: string;

  @ApiPropertyOptional({ description: '预算范围', example: '5-10万' })
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional({ description: '其他需求', example: '需要培训支持' })
  @IsOptional()
  @IsString()
  additionalNeeds?: string;
}

