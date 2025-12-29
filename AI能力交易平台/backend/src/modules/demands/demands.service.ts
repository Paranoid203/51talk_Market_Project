import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { QueryDemandDto } from './dto/query-demand.dto';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

@Injectable()
export class DemandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDemandDto: CreateDemandDto, userId: number) {
    const demand = await this.prisma.demand.create({
      data: {
        ...createDemandDto,
        publisherId: userId,
        status: createDemandDto.status || 'ACTIVE',
      },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            followers_rel: true,
            proposals_rel: true,
          },
        },
      },
    });

    return demand;
  }

  async findAll(query: QueryDemandDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search, category, departmentId, status, sort } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (status) {
      where.status = status;
    }

    const orderBy: any = { createdAt: 'desc' };
    if (sort) {
      const [field, direction] = sort.split(':');
      orderBy[field] = direction || 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          publisher: {
            select: {
              id: true,
              name: true,
              avatar: true,
              department: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              followers_rel: true,
              proposals_rel: true,
            },
          },
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const demand = await this.prisma.demand.findUnique({
      where: { id },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            position: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        followers_rel: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          take: 10,
        },
        proposals_rel: {
          include: {
            proposer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            followers_rel: true,
            proposals_rel: true,
          },
        },
      },
    });

    if (!demand) {
      throw new NotFoundException(`需求 ID ${id} 不存在`);
    }

    return demand;
  }

  async update(id: number, updateDemandDto: UpdateDemandDto, userId: number) {
    const demand = await this.findOne(id);

    // 只有创建者或管理员可以修改
    if (demand.publisherId !== userId) {
      // 这里可以添加管理员权限检查
      throw new ForbiddenException('无权修改此需求');
    }

    const updated = await this.prisma.demand.update({
      where: { id },
      data: updateDemandDto,
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    const demand = await this.findOne(id);

    // 只有创建者或管理员可以删除
    if (demand.publisherId !== userId) {
      throw new ForbiddenException('无权删除此需求');
    }

    await this.prisma.demand.delete({
      where: { id },
    });

    return { message: '需求已删除' };
  }

  async follow(demandId: number, userId: number) {
    // 检查需求是否存在
    await this.findOne(demandId);

    // 检查是否已关注
    const existing = await this.prisma.demandFollower.findUnique({
      where: {
        demandId_userId: {
          demandId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('已关注此需求');
    }

    await this.prisma.demandFollower.create({
      data: {
        demandId,
        userId,
      },
    });

    return { message: '关注成功' };
  }

  async unfollow(demandId: number, userId: number) {
    await this.prisma.demandFollower.deleteMany({
      where: {
        demandId,
        userId,
      },
    });

    return { message: '取消关注成功' };
  }
}

