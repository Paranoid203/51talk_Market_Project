import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.warn('⚠️ ANTHROPIC_API_KEY 未配置，AI功能将不可用');
    } else {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
      console.log('✅ Claude API已初始化');
    }
  }

  async parseProjectDocument(documentText: string, prompt?: string): Promise<any> {
    if (!this.anthropic) {
      throw new Error('Claude API未配置，请设置ANTHROPIC_API_KEY环境变量');
    }

    const defaultPrompt = `你是一个专业的项目信息提取助手。请从用户提供的文档中提取项目相关信息，并以JSON格式返回。

需要提取的字段包括：
1. name: 项目名称（字符串）
2. implementers: 项目实施人列表（字符串数组，如：["张三", "李四"]）
3. requesterDepartment: 需求提出部门（字符串）
4. requesterName: 需求方姓名（字符串）
5. background: 项目背景（字符串，描述项目面临的问题或痛点）
6. solution: 解决方案（字符串，描述如何解决问题）
7. features: 核心功能（字符串，每行一个功能点，用换行符分隔）
8. estimatedImpact: 预估效果（字符串）
9. actualImpact: 实际效果（字符串）
10. efficiency: 效率提升（字符串，如："+20%"）
11. costSaving: 成本节约（字符串，如："10万元/每年"）
12. satisfaction: 满意度提升（字符串，如："+15%"）
13. status: 项目状态（字符串，可选值：需求已确认、排期中、生产中、交付未投产、交付已投产）
14. categories: 所属业务范畴（字符串数组，可选值：客服、数据、创作、人力、财务、法务、市场、运营、技术、产品）
15. departments: 赋能业务部门（字符串数组）
16. launchDate: 上线日期（字符串，格式：YYYY-MM-DD）

请仔细分析文档内容，提取相关信息。如果某个字段在文档中没有明确提及，请返回null或空数组。

返回格式必须是有效的JSON对象，不要包含任何额外的文本或markdown格式。`;

    const finalPrompt = prompt || defaultPrompt;

    try {
      const fullPrompt = `${finalPrompt}\n\n文档内容：\n${documentText}\n\n请返回JSON格式的提取结果：`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';

      // 尝试提取JSON部分（可能包含markdown代码块）
      let jsonText = text.trim();
      
      // 如果包含markdown代码块，提取JSON部分
      const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // 尝试直接提取第一个JSON对象
        const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonText = jsonObjectMatch[0];
        }
      }

      const parsedData = JSON.parse(jsonText);
      return parsedData;
    } catch (error) {
      console.error('❌ Claude API调用失败:', error);
      throw new Error(`AI解析失败: ${error.message}`);
    }
  }
}

