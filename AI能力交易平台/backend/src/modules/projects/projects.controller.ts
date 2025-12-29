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
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { ApplyReplicationDto } from './dto/apply-replication.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('项目管理')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ✅ 需要认证的接口
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建项目' })
  @ApiResponse({ status: 201, description: '项目创建成功' })
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser('id') userId: number) {
    return this.projectsService.create(createProjectDto, userId);
  }

  // ✅ 公开接口：获取项目列表
  @Get()
  @ApiOperation({ summary: '获取项目列表' })
  @ApiResponse({ status: 200, description: '返回项目列表' })
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAll(query);
  }

  // ✅ 公开接口：获取项目详情
  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  @ApiResponse({ status: 200, description: '返回项目详情' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新项目' })
  @ApiResponse({ status: 200, description: '项目更新成功' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除项目' })
  @ApiResponse({ status: 200, description: '项目删除成功' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.projectsService.remove(id, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞项目' })
  @ApiResponse({ status: 200, description: '点赞成功' })
  like(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.projectsService.like(id, userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消点赞项目' })
  @ApiResponse({ status: 200, description: '取消点赞成功' })
  unlike(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.projectsService.unlike(id, userId);
  }

  // ✅ 申请部署/复用项目
  @Post(':id/replicate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请部署/复用项目' })
  @ApiResponse({ status: 201, description: '申请提交成功' })
  applyReplication(
    @Param('id', ParseIntPipe) projectId: number,
    @CurrentUser('id') userId: number,
    @Body() applyDto: ApplyReplicationDto,
  ) {
    console.log('🌐 [Controller] 收到部署申请请求');
    console.log('  - URL: POST /projects/:id/replicate');
    console.log('  - projectId:', projectId);
    console.log('  - userId:', userId);
    console.log('  - Request Body:', applyDto);
    return this.projectsService.applyReplication(projectId, userId, applyDto);
  }

  // ✅ 获取所有部署申请（管理员用）
  @Get('replications/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有部署申请（管理员）' })
  @ApiResponse({ status: 200, description: '返回申请列表' })
  getAllReplications(
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.projectsService.getAllReplications({
      status,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  // ✅ 更新申请状态（管理员用）
  @Patch('replications/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新申请状态（管理员）' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  updateReplicationStatus(
    @Param('id', ParseIntPipe) replicationId: number,
    @Body('status') status: string,
  ) {
    return this.projectsService.updateReplicationStatus(replicationId, status);
  }

  // ✅ AI分析申请内容（管理员用）
  @Post('replications/:id/analyze')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI分析申请内容（管理员）' })
  @ApiResponse({ status: 200, description: '分析完成' })
  analyzeReplication(@Param('id', ParseIntPipe) replicationId: number) {
    return this.projectsService.analyzeReplication(replicationId);
  }
}


