import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '姓名', example: '张三' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '部门', example: '市场部' })
  @IsString()
  @MaxLength(100)
  department: string;

  @ApiPropertyOptional({ description: '职位', example: '高级营销经理' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;
}

