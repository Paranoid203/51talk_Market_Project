import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParseProjectDto {
  @ApiProperty({ description: '文档内容', example: '项目名称：智能数据分析平台\n项目实施人：张三、李四' })
  @IsString()
  @IsNotEmpty()
  documentText: string;

  @ApiPropertyOptional({ description: '自定义提示词（可选）', example: '请提取项目信息...' })
  @IsOptional()
  @IsString()
  prompt?: string;
}

