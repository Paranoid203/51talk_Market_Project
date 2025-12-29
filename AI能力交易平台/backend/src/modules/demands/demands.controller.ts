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
import { DemandsService } from './demands.service';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { QueryDemandDto } from './dto/query-demand.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('需求管理')
@Controller('demands')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Post()
  @ApiOperation({ summary: '创建需求' })
  @ApiResponse({ status: 201, description: '需求创建成功' })
  create(@Body() createDemandDto: CreateDemandDto, @CurrentUser('id') userId: number) {
    return this.demandsService.create(createDemandDto, userId);
  }

  @Get()
  @ApiOperation({ summary: '获取需求列表' })
  @ApiResponse({ status: 200, description: '返回需求列表' })
  findAll(@Query() query: QueryDemandDto) {
    return this.demandsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取需求详情' })
  @ApiResponse({ status: 200, description: '返回需求详情' })
  @ApiResponse({ status: 404, description: '需求不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.demandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新需求' })
  @ApiResponse({ status: 200, description: '需求更新成功' })
  @ApiResponse({ status: 404, description: '需求不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDemandDto: UpdateDemandDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.demandsService.update(id, updateDemandDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除需求' })
  @ApiResponse({ status: 200, description: '需求删除成功' })
  @ApiResponse({ status: 404, description: '需求不存在' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.demandsService.remove(id, userId);
  }

  @Post(':id/follow')
  @ApiOperation({ summary: '关注需求' })
  @ApiResponse({ status: 200, description: '关注成功' })
  follow(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.demandsService.follow(id, userId);
  }

  @Delete(':id/follow')
  @ApiOperation({ summary: '取消关注需求' })
  @ApiResponse({ status: 200, description: '取消关注成功' })
  unfollow(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.demandsService.unfollow(id, userId);
  }
}

