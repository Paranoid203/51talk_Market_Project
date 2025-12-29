import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ParseProjectDto } from './dto/parse-project.dto';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-project')
  @ApiOperation({ summary: 'AI解析项目文档', description: '使用Claude AI解析项目文档并提取结构化信息' })
  async parseProject(@Body() parseProjectDto: ParseProjectDto) {
    const { documentText, prompt } = parseProjectDto;
    
    if (!documentText || !documentText.trim()) {
      throw new Error('文档内容不能为空');
    }

    const parsedData = await this.aiService.parseProjectDocument(documentText, prompt);
    
    return {
      success: true,
      data: parsedData,
    };
  }
}

