import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        level: 1,
        levelName: '新手',
        points: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        department: true,
        departmentId: true,
        position: true,
        level: true,
        levelName: true,
        points: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search, department, departmentId, role, status, sort } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (role) {
      where.role = role;
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
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          department: true,
          departmentId: true,
          position: true,
          level: true,
          levelName: true,
          points: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          departmentRelation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        department: true,
        departmentId: true,
        position: true,
        level: true,
        levelName: true,
        points: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        departmentRelation: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // 检查用户是否存在
    await this.findOne(id);

    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        department: true,
        departmentId: true,
        position: true,
        level: true,
        levelName: true,
        points: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: '用户已删除' };
  }

  async updatePoints(id: number, points: number) {
    const user = await this.findOne(id);
    const newPoints = user.points + points;
    
    // 根据积分更新等级
    let newLevel = user.level;
    let newLevelName = user.levelName;
    
    if (newPoints >= 10000) {
      newLevel = 5;
      newLevelName = '专家';
    } else if (newPoints >= 5000) {
      newLevel = 4;
      newLevelName = '高级';
    } else if (newPoints >= 2000) {
      newLevel = 3;
      newLevelName = '中级';
    } else if (newPoints >= 500) {
      newLevel = 2;
      newLevelName = '初级';
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        points: newPoints,
        level: newLevel,
        levelName: newLevelName,
      },
    });
  }
}

