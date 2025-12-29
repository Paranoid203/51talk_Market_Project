import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { QueryToolDto } from './dto/query-tool.dto';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryToolDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search, category, type, isFeatured, sort } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }
    where.status = 'APPROVED';

    const orderBy: any = { createdAt: 'desc' };
    if (sort) {
      const [field, direction] = sort.split(':');
      orderBy[field] = direction || 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              department: true,
              avatar: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.tool.count({ where }),
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
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true,
            avatar: true,
            level: true,
            levelName: true,
          },
        },
        department: true,
        tags: {
          include: {
            tag: true,
          },
        },
        toolReviews: {
          include: {
            user: {
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
          take: 10,
        },
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} not found`);
    }

    return tool;
  }

  async create(createToolDto: CreateToolDto, userId: number) {
    // 获取用户的部门ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });

    return this.prisma.tool.create({
      data: {
        name: createToolDto.name,
        description: createToolDto.description,
        category: createToolDto.category,
        type: createToolDto.type as any,
        price: createToolDto.price,
        icon: createToolDto.icon,
        coverImage: createToolDto.coverImage,
        url: createToolDto.url,
        apiEndpoint: createToolDto.apiEndpoint,
        authorId: userId,
        departmentId: user?.departmentId || 1,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });
  }

  async update(id: number, updateToolDto: UpdateToolDto) {
    const tool = await this.findOne(id);
    const updateData: any = {};
    
    if (updateToolDto.name !== undefined) updateData.name = updateToolDto.name;
    if (updateToolDto.description !== undefined) updateData.description = updateToolDto.description;
    if (updateToolDto.category !== undefined) updateData.category = updateToolDto.category;
    if (updateToolDto.type !== undefined) updateData.type = updateToolDto.type as any;
    if (updateToolDto.price !== undefined) updateData.price = updateToolDto.price;
    if (updateToolDto.icon !== undefined) updateData.icon = updateToolDto.icon;
    if (updateToolDto.coverImage !== undefined) updateData.coverImage = updateToolDto.coverImage;
    if (updateToolDto.url !== undefined) updateData.url = updateToolDto.url;
    if (updateToolDto.apiEndpoint !== undefined) updateData.apiEndpoint = updateToolDto.apiEndpoint;
    
    return this.prisma.tool.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const tool = await this.findOne(id);
    await this.prisma.tool.delete({
      where: { id },
    });
    return { message: 'Tool deleted successfully' };
  }
}

