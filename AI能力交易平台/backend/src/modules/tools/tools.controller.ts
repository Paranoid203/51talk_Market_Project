import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { QueryToolDto } from './dto/query-tool.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建工具' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createToolDto: CreateToolDto, @CurrentUser() user: any) {
    return this.toolsService.create(createToolDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取工具列表' })
  @ApiResponse({ status: 200, description: '成功返回工具列表' })
  findAll(@Query() query: QueryToolDto) {
    return this.toolsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工具详情' })
  @ApiResponse({ status: 200, description: '成功返回工具详情' })
  @ApiResponse({ status: 404, description: '工具不存在' })
  findOne(@Param('id') id: string) {
    return this.toolsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新工具' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return this.toolsService.update(+id, updateToolDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除工具' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.toolsService.remove(+id);
  }
}

