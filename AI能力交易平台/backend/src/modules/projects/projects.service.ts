import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: number) {
    const { tagIds, images, videos, efficiency, costSaving, satisfaction, implementers, ...projectData } = createProjectDto;

    // ✅ 调试：查看接收到的数据
    console.log('📥 后端接收到的项目数据:');
    console.log('  background:', projectData.background ? `有数据(${projectData.background.length}字符)` : '无数据');
    console.log('  solution:', projectData.solution ? `有数据(${projectData.solution.length}字符)` : '无数据');
    console.log('  features:', projectData.features ? `有数据(${projectData.features.length}字符)` : '无数据');
    console.log('  estimatedImpact:', projectData.estimatedImpact ? `有数据(${projectData.estimatedImpact.length}字符)` : '无数据');
    console.log('  actualImpact:', projectData.actualImpact ? `有数据(${projectData.actualImpact.length}字符)` : '无数据');
    console.log('  🏢 empoweredDepartments:', projectData.empoweredDepartments || '无数据');
    console.log('  📅 launchDate:', projectData.launchDate || '无数据');
    console.log('  departmentId:', projectData.departmentId);
    console.log('  requesterDepartmentId:', projectData.requesterDepartmentId);
    console.log('  projectLeadDepartmentId:', projectData.projectLeadDepartmentId);

    // ✅ 验证部门ID是否存在，如果不存在则使用默认部门
    let departmentId = projectData.departmentId;
    let requesterDepartmentId = projectData.requesterDepartmentId;
    
    const department = await this.prisma.department.findUnique({
      where: { id: projectData.departmentId },
    });
    if (!department) {
      console.warn(`⚠️ 部门ID ${projectData.departmentId} 不存在，使用默认部门`);
      const defaultDept = await this.prisma.department.findFirst({
        orderBy: { id: 'asc' },
      });
      departmentId = defaultDept?.id || 1;
    }

    const requesterDepartment = await this.prisma.department.findUnique({
      where: { id: projectData.requesterDepartmentId },
    });
    if (!requesterDepartment) {
      console.warn(`⚠️ 需求方部门ID ${projectData.requesterDepartmentId} 不存在，使用默认部门`);
      const defaultDept = await this.prisma.department.findFirst({
        orderBy: { id: 'asc' },
      });
      requesterDepartmentId = defaultDept?.id || 1;
    }

    // ✅ 如果提供了实施者列表，第一个实施者自动设为项目负责人
    let projectLeadId = projectData.projectLeadId;
    let projectLeadDepartmentId = projectData.projectLeadDepartmentId;
    
    if (implementers && implementers.length > 0) {
      const firstImplementerName = implementers[0];
      const firstImplementer = await this.prisma.user.findFirst({
        where: { name: firstImplementerName },
        include: { departmentRelation: true },
      });
      
      if (firstImplementer) {
        projectLeadId = firstImplementer.id;
        projectLeadDepartmentId = firstImplementer.departmentRelation?.id || firstImplementer.departmentId || projectData.projectLeadDepartmentId;
      }
    }

    // ✅ 验证项目负责人部门ID是否存在
    if (projectLeadDepartmentId) {
      const projectLeadDepartment = await this.prisma.department.findUnique({
        where: { id: projectLeadDepartmentId },
      });
      if (!projectLeadDepartment) {
        console.warn(`⚠️ 项目负责人部门ID ${projectLeadDepartmentId} 不存在，使用需求方部门ID`);
        projectLeadDepartmentId = projectData.requesterDepartmentId;
      }
    }

    // ✅ 重新设计：简化逻辑，直接保存所有字段
    const project = await this.prisma.project.create({
      data: {
        title: projectData.title,
        // ✅ 项目介绍的4个部分：直接保存，不做复杂处理
        solution: projectData.solution && projectData.solution.trim() ? projectData.solution.trim() : null,
        features: projectData.features && projectData.features.trim() ? projectData.features.trim() : null,
        estimatedImpact: projectData.estimatedImpact && projectData.estimatedImpact.trim() ? projectData.estimatedImpact.trim() : null,
        actualImpact: projectData.actualImpact && projectData.actualImpact.trim() ? projectData.actualImpact.trim() : null,
        // ✅ 新增：AI生成字段
        shortDescription: projectData.shortDescription,
        // duration: projectData.duration, // 暂时注释：数据库中缺少此字段
        departmentId: departmentId,
        requesterId: projectData.requesterId,
        requesterDepartmentId: requesterDepartmentId,
        requesterName: projectData.requesterName, // 需求方姓名（在项目广场显示）
        empoweredDepartments: projectData.empoweredDepartments, // 赋能部门
        launchDate: projectData.launchDate ? new Date(projectData.launchDate) : null, // 上线日期
        projectLeadId: projectLeadId, // 第一个实施者
        projectLeadDepartmentId: projectLeadDepartmentId,
        category: projectData.category,
        // ✅ 项目进度状态：使用用户选择的状态（需求已确认、排期中、生产中、交付未投产、交付已投产）
        status: projectData.status || 'REQUIREMENT_CONFIRMED',
        // ✅ 审核状态：新创建的项目默认为"待审核"
        reviewStatus: 'PENDING',
        // 新字段：支持多个图片和视频
        images: images && images.length > 0 ? JSON.stringify(images) : null,
        videos: videos && videos.length > 0 ? JSON.stringify(videos) : null,
        // 兼容旧字段
        image: images?.[0] || projectData.image,
        backgroundImage: images?.[1] || images?.[0] || projectData.backgroundImage,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
        // ✅ 创建开发人员关联（暂时跳过，因为需要根据姓名查找userId）
        // 后续通过单独的逻辑处理implementers
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        projectLead: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        impact: true, // ✅ 包含关键效果数据
        _count: {
          select: {
            developers: true,
            likes_rel: true,
            comments_rel: true,
            replications_rel: true,
          },
        },
      },
    });

    // ✅ 重新设计：不再需要单独的SQL更新，所有数据都通过Prisma保存

    // ✅ 如果有关键效果数据，先保存到 ProjectImpact 表（在重新查询之前）
    if (efficiency || costSaving || satisfaction) {
      await this.prisma.projectImpact.create({
        data: {
          projectId: project.id,
          efficiency: efficiency || null,
          costSaving: costSaving || null,
          satisfaction: satisfaction || null,
          replication: null, // 这个字段由 project.replications 统计
        },
      });
    }

    // ✅ 处理implementers（第一个是负责人，其余是工程师）
    // 如果找不到用户，自动创建占位用户（目前用户数据有限，不需要验证用户是否存在）
    if (implementers && implementers.length > 0) {
      // 获取项目负责人的部门信息，用于创建占位用户
      const projectLead = await this.prisma.user.findUnique({
        where: { id: projectLeadId },
        select: { department: true, departmentId: true },
      });
      
      const defaultDepartment = projectLead?.department || '未分配部门';
      const defaultDepartmentId = projectLead?.departmentId || null;
      
      for (let i = 0; i < implementers.length; i++) {
        const name = implementers[i].trim();
        if (!name) continue;
        
        // 第一个实施者是负责人（已在projectLeadId中设置），其余是工程师
        const role = i === 0 ? '负责人' : '工程师';
        
        // 先按姓名查找用户
        let user = await this.prisma.user.findFirst({
          where: { name: name },
        });
        
        // 如果找不到用户，创建一个占位用户
        if (!user) {
          // 生成唯一的邮箱（使用姓名+时间戳确保唯一性）
          const emailBase = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
          const timestamp = Date.now();
          let email = `${emailBase}_${timestamp}@placeholder.51talk.com`;
          
          // 确保邮箱唯一（如果冲突，添加随机数）
          let emailExists = await this.prisma.user.findUnique({
            where: { email },
          });
          
          if (emailExists) {
            email = `${emailBase}_${timestamp}_${Math.random().toString(36).substring(7)}@placeholder.51talk.com`;
          }
          
          user = await this.prisma.user.create({
            data: {
              email: email,
              password: await bcrypt.hash('placeholder_password_' + timestamp, 10), // 占位密码，用户不会登录
              name: name,
              department: defaultDepartment,
              departmentId: defaultDepartmentId,
              position: role === '负责人' ? '项目负责人' : '项目工程师',
              role: 'USER',
              status: 'ACTIVE',
            },
          });
        }
        
        // 创建项目开发者关联
        await this.prisma.projectDeveloper.create({
          data: {
            projectId: project.id,
            userId: user.id,
            role: role,
          },
        });
      }
    }

    // ✅ 重新查询项目以确保包含所有字段（包括关联数据）
    const fullProject = await this.prisma.project.findUnique({
      where: { id: project.id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        projectLead: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            position: true,
            email: true,
            phone: true,
            qrCode: true,
            qrCodeType: true,
            showPhone: true,
            showQrCode: true,
            feishuId: true,
            feishuUserId: true,
            showFeishu: true,
          },
        },
        developers: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                position: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        impact: true, // ✅ 包含关键效果数据
        _count: {
          select: {
            developers: true,
            likes_rel: true,
            comments_rel: true,
            replications_rel: true,
          },
        },
      },
    });

    // ✅ 使用SQL更新background字段（因为Prisma Client可能不支持）
    if (projectData.background && projectData.background.trim()) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE "projects" SET "background" = $1 WHERE "id" = $2`,
          projectData.background.trim(),
          project.id
        );
      } catch (error) {
        console.error('❌ background字段更新失败:', error);
      }
    }

    // ✅ 单独查询background字段
    const backgroundResult = await this.prisma.$queryRawUnsafe(
      `SELECT "background" FROM "projects" WHERE "id" = $1`,
      project.id
    ) as any[];

    // ✅ 合并background字段到返回对象
    const result = {
      ...fullProject,
      background: backgroundResult[0]?.background || null,
    } as any;

    // ✅ 调试：查看返回的数据
    console.log('📤 后端返回的项目数据:');
    console.log('  background:', result.background ? `有数据(${result.background.length}字符)` : '无数据');
    console.log('  solution:', result.solution ? `有数据(${result.solution.length}字符)` : '无数据');
    console.log('  features:', result.features ? `有数据(${result.features.length}字符)` : '无数据');
    console.log('  estimatedImpact:', result.estimatedImpact ? `有数据(${result.estimatedImpact.length}字符)` : '无数据');
    console.log('  actualImpact:', result.actualImpact ? `有数据(${result.actualImpact.length}字符)` : '无数据');
    console.log('  🏢 empoweredDepartments:', result.empoweredDepartments || '无数据');
    console.log('  📅 launchDate:', result.launchDate || '无数据');
    console.log('  📊 impact:', result.impact ? '有数据' : '无数据');

    // ✅ 返回完整的项目数据
    return result || fullProject || project;
  }

  async findAll(query: QueryProjectDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, search, category, departmentId, status, reviewStatus, isFeatured, sort } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
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
    // ✅ 审核状态筛选
    if (reviewStatus) {
      where.reviewStatus = reviewStatus;
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    const orderBy: any = { createdAt: 'desc' };
    if (sort) {
      const [field, direction] = sort.split(':');
      orderBy[field] = direction || 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          projectLead: {
            select: {
              id: true,
              name: true,
              avatar: true,
              department: true,
              position: true,
              // ✅ 添加联系信息（详情页需要）
              email: true,
              phone: true,
              qrCode: true,
              qrCodeType: true,
              showPhone: true,
              showQrCode: true,
              feishuId: true,
              feishuUserId: true,
              showFeishu: true,
            },
          },
          developers: {
            select: {
              id: true,
              role: true, // 角色：负责人或工程师
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  position: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          impact: true, // ✅ 包含关键效果数据
          _count: {
            select: {
              developers: true,
              likes_rel: true,
              comments_rel: true,
              replications_rel: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    // ✅ 使用SQL查询获取background字段（因为Prisma Client可能不支持）
    const projectIds = items.map(item => item.id);
    if (projectIds.length > 0) {
      const backgroundResults = await this.prisma.$queryRawUnsafe(
        `SELECT id, background FROM "projects" WHERE id = ANY($1::int[])`,
        projectIds
      ) as any[];
      
      // ✅ 合并background字段到items
      const backgroundMap = new Map(backgroundResults.map(r => [r.id, r.background]));
      items.forEach((item: any) => {
        item.background = backgroundMap.get(item.id) || null;
      });
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            position: true,
          },
        },
        projectLead: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            position: true,
            // ✅ 添加联系信息
            email: true,
            phone: true,
            qrCode: true,
            qrCodeType: true,
            showPhone: true,
            showQrCode: true,
            feishuId: true,
            feishuUserId: true,
            showFeishu: true,
          },
        },
        developers: {
          select: {
            id: true,
            role: true, // 角色：负责人或工程师
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                position: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        impact: true,
        _count: {
          select: {
            developers: true,
            likes_rel: true,
            comments_rel: true,
            replications_rel: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`项目 ID ${id} 不存在`);
    }

    // ✅ 使用SQL查询获取background字段（因为Prisma Client可能不支持）
    const backgroundResult = await this.prisma.$queryRawUnsafe(
      `SELECT "background" FROM "projects" WHERE "id" = $1`,
      id
    ) as any[];

    // 增加浏览量
    await this.prisma.project.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // ✅ 合并background字段到返回对象
    const result = {
      ...project,
      background: backgroundResult[0]?.background || null,
    } as any;

    return result;

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
    const project = await this.findOne(id);

    // 注意：权限检查已移至前端管理员密码验证
    // 任何已登录用户（通过管理员密码验证后）都可以更新项目状态
    // 这样管理员可以帮助编辑项目进度，而项目负责人只负责提交需求

    const { tagIds, ...updateData } = updateProjectDto;

    // 如果更新了标签，先删除旧标签再添加新标签
    if (tagIds !== undefined) {
      await this.prisma.projectTag.deleteMany({
        where: { projectId: id },
      });
    }

    const updatePayload: any = {};
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.summary !== undefined) updatePayload.summary = updateData.summary;
    if (updateData.departmentId !== undefined) updatePayload.departmentId = updateData.departmentId;
    if (updateData.requesterId !== undefined) updatePayload.requesterId = updateData.requesterId;
    if (updateData.requesterDepartmentId !== undefined) updatePayload.requesterDepartmentId = updateData.requesterDepartmentId;
    if (updateData.projectLeadId !== undefined) updatePayload.projectLeadId = updateData.projectLeadId;
    if (updateData.projectLeadDepartmentId !== undefined) updatePayload.projectLeadDepartmentId = updateData.projectLeadDepartmentId;
    if (updateData.category !== undefined) updatePayload.category = updateData.category;
    // ✅ 项目进度状态：用户可以更新（排期中、生产中、交付未投产、交付已投产）
    if (updateData.status !== undefined) updatePayload.status = updateData.status;
    // ✅ 审核状态：通过审核API更新（PENDING -> APPROVED 或 REJECTED）
    if (updateData.reviewStatus !== undefined) updatePayload.reviewStatus = updateData.reviewStatus;
    if (updateData.image !== undefined) updatePayload.image = updateData.image;
    if (updateData.backgroundImage !== undefined) updatePayload.backgroundImage = updateData.backgroundImage;

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...updatePayload,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        projectLead: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    const project = await this.findOne(id);

    // 只有项目负责人或管理员可以删除
    if (project.projectLeadId !== userId) {
      throw new ForbiddenException('无权删除此项目');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: '项目已删除' };
  }

  async like(projectId: number, userId: number) {
    // 检查是否已点赞
    const existing = await this.prisma.like.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (existing) {
      throw new ForbiddenException('已点赞此项目');
    }

    await this.prisma.$transaction([
      this.prisma.like.create({
        data: {
          projectId,
          userId,
        },
      }),
      this.prisma.project.update({
        where: { id: projectId },
        data: { likes: { increment: 1 } },
      }),
    ]);

    return { message: '点赞成功' };
  }

  async unlike(projectId: number, userId: number) {
    await this.prisma.$transaction([
      this.prisma.like.deleteMany({
        where: {
          projectId,
          userId,
        },
      }),
      this.prisma.project.update({
        where: { id: projectId },
        data: { likes: { decrement: 1 } },
      }),
    ]);

    return { message: '取消点赞成功' };
  }

  // ✅ 申请部署/复用项目
  async applyReplication(projectId: number, userId: number, applyDto: any) {
    console.log('🔧 [Service] applyReplication 开始处理');
    console.log('  - projectId:', projectId);
    console.log('  - userId:', userId);
    console.log('  - applyDto:', JSON.stringify(applyDto, null, 2));

    // 检查项目是否存在
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      console.error('❌ [Service] 项目不存在:', projectId);
      throw new NotFoundException('项目不存在');
    }
    console.log('✅ [Service] 项目存在:', project.title);

    // 获取用户部门ID（如果department字段是部门名称，需要查找部门ID）
    let departmentId: number;
    
    if (applyDto.department) {
      const department = await this.prisma.department.findFirst({
        where: { name: applyDto.department },
      });
      if (department) {
        departmentId = department.id;
        console.log('✅ [Service] 找到部门:', department.name, '(ID:', departmentId, ')');
      } else {
        console.warn('⚠️ [Service] 未找到部门:', applyDto.department);
        // 如果找不到部门，使用第一个部门作为默认值
        const defaultDept = await this.prisma.department.findFirst({
          orderBy: { id: 'asc' },
        });
        departmentId = defaultDept?.id || 1;
        console.warn('⚠️ [Service] 使用默认部门ID:', departmentId);
      }
    } else {
      // 如果没有提供部门名称，使用第一个部门
      const defaultDept = await this.prisma.department.findFirst({
        orderBy: { id: 'asc' },
      });
      departmentId = defaultDept?.id || 1;
      console.warn('⚠️ [Service] 未提供部门，使用默认部门ID:', departmentId);
    }

    // 创建申请记录
    console.log('📝 [Service] 准备创建申请记录...');
    try {
    const replication = await this.prisma.projectReplication.create({
      data: {
        projectId,
        replicatorId: userId,
        departmentId,
        applicantName: applyDto.applicantName,
        department: applyDto.department,
          contactPhone: applyDto.contactPhone || undefined,
        email: applyDto.email,
          teamSize: applyDto.teamSize || undefined,
        urgency: applyDto.urgency || 'normal',
          targetLaunchDate: applyDto.targetLaunchDate || undefined,
        businessScenario: applyDto.businessScenario,
          expectedGoals: applyDto.expectedGoals || undefined,
          budgetRange: applyDto.budgetRange || undefined,
          additionalNeeds: applyDto.additionalNeeds || undefined,
        status: 'APPLIED',
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        replicator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

      console.log('✅ [Service] 申请记录创建成功！');
      console.log('  - replicationId:', replication.id);
      console.log('  - 申请人:', replication.applicantName);
      console.log('  - 状态:', replication.status);

    return replication;
    } catch (error) {
      console.error('❌ [Service] Prisma创建记录失败！');
      console.error('  - 错误类型:', error.constructor.name);
      console.error('  - 错误信息:', error.message);
      console.error('  - 错误代码:', error.code);
      console.error('  - 完整错误:', error);
      throw new Error(`创建申请记录失败: ${error.message}`);
    }
  }

  // ✅ 获取所有部署申请（管理员用）
  async getAllReplications(query?: { status?: string; projectId?: number }) {
    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.projectId) {
      where.projectId = query.projectId;
    }

    const replications = await this.prisma.projectReplication.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        replicator: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        departmentRelation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return replications;
  }

  // ✅ 更新申请状态（管理员用）
  async updateReplicationStatus(replicationId: number, status: string) {
    const replication = await this.prisma.projectReplication.findUnique({
      where: { id: replicationId },
    });

    if (!replication) {
      throw new NotFoundException('申请不存在');
    }

    const updateData: any = {
      status: status as any,
    };

    if (status === 'DEPLOYED') {
      updateData.deployedAt = new Date();
    }

    return this.prisma.projectReplication.update({
      where: { id: replicationId },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        replicator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // ✅ AI分析申请内容
  async analyzeReplication(replicationId: number) {
    const replication = await this.prisma.projectReplication.findUnique({
      where: { id: replicationId },
      include: {
        project: {
          select: {
            title: true,
            category: true,
            shortDescription: true,
          },
        },
      },
    });

    if (!replication) {
      throw new NotFoundException('申请不存在');
    }

    // 构建分析提示词
    const prompt = `请分析以下项目部署申请，帮助管理者快速了解申请人的意图和需求：

项目名称：${replication.project.title}
项目分类：${replication.project.category}
项目简介：${replication.project.shortDescription || '无'}

申请人：${replication.applicantName}
部门：${replication.department}
紧急程度：${replication.urgency === 'emergency' ? '紧急' : replication.urgency === 'urgent' ? '较急' : '普通'}
目标上线日期：${replication.targetLaunchDate || '未指定'}

业务场景：
${replication.businessScenario}

预期目标：
${replication.expectedGoals || '未说明'}

预算范围：
${replication.budgetRange || '未指定'}

其他需求：
${replication.additionalNeeds || '无'}

请提供以下分析：
1. 业务场景分析：申请人希望用这个项目解决什么问题？
2. 预期目标评估：申请人的目标是否合理？
3. 紧急程度评估：是否需要优先处理？
4. 建议和注意事项：有什么需要注意的地方？

请用Markdown格式返回分析结果。`;

    // TODO: 调用真实的AI API（如OpenAI、Claude等）
    // 这里先返回模拟分析结果
    const analysis = await this.generateAIAnalysis(replication);

    // 更新申请记录的AI分析
    return this.prisma.projectReplication.update({
      where: { id: replicationId },
      data: {
        aiAnalysis: analysis,
        aiAnalysisAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        replicator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // 模拟AI分析（实际应该调用真实的AI API）
  private async generateAIAnalysis(replication: any): Promise<string> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    const scenario = replication.businessScenario;
    const goals = replication.expectedGoals || '';
    const needs = replication.additionalNeeds || '';
    const urgency = replication.urgency;

    let analysis = `# 申请分析报告\n\n`;
    analysis += `**分析时间**：${new Date().toLocaleString('zh-CN')}\n\n`;

    analysis += `## 1. 业务场景分析\n\n`;
    analysis += `申请人希望将"${replication.project.title}"项目应用到其业务场景中。`;
    
    if (scenario.includes('效率') || scenario.includes('提升') || scenario.includes('优化')) {
      analysis += `重点关注**效率提升和流程优化**，希望通过自动化手段减少人工操作。`;
    }
    if (scenario.includes('成本') || scenario.includes('节约') || scenario.includes('节省')) {
      analysis += `关注**成本控制和资源节约**，希望通过技术手段降低运营成本。`;
    }
    if (scenario.includes('自动化') || scenario.includes('智能') || scenario.includes('AI')) {
      analysis += `希望通过**智能化和自动化**手段解决问题，提升业务处理能力。`;
    }
    if (scenario.includes('数据') || scenario.includes('分析') || scenario.includes('报表')) {
      analysis += `需要**数据分析和报表功能**，希望通过数据驱动决策。`;
    }
    
    analysis += `\n\n## 2. 预期目标评估\n\n`;
    if (goals) {
      analysis += `申请人明确提出了以下目标：\n- ${goals}\n\n`;
      if (goals.includes('%') || goals.includes('提升') || goals.includes('降低')) {
        analysis += `目标**量化明确**，便于后续评估项目效果。`;
      } else {
        analysis += `建议与申请人进一步沟通，将目标**量化**，以便更好地评估项目效果。`;
      }
    } else {
      analysis += `申请人**未明确说明具体目标**，建议在审批前与申请人沟通，明确预期效果和成功标准。\n\n`;
    }

    analysis += `\n## 3. 紧急程度评估\n\n`;
    if (urgency === 'emergency') {
      analysis += `⚠️ **紧急程度：高**\n- 建议**优先处理**此申请\n- 可能需要加急审批流程\n- 建议尽快与申请人沟通确认具体时间安排\n\n`;
    } else if (urgency === 'urgent') {
      analysis += `⚠️ **紧急程度：中等**\n- 建议在**近期内处理**\n- 可以按照正常流程审批，但需要关注时间节点\n\n`;
    } else {
      analysis += `✅ **紧急程度：普通**\n- 可以按照**正常流程**处理\n- 有充足的时间进行审批和准备\n\n`;
    }

    analysis += `## 4. 资源需求评估\n\n`;
    if (replication.budgetRange) {
      analysis += `💰 **预算范围**：${replication.budgetRange}\n`;
      analysis += `- 预算已明确，便于资源规划\n`;
    } else {
      analysis += `💰 **预算范围**：未指定\n`;
      analysis += `- ⚠️ 建议与申请人确认预算范围，以便合理规划资源\n`;
    }

    if (replication.teamSize) {
      analysis += `\n👥 **团队规模**：${replication.teamSize}\n`;
    }

    if (replication.targetLaunchDate) {
      analysis += `\n📅 **目标上线日期**：${replication.targetLaunchDate}\n`;
      const targetDate = new Date(replication.targetLaunchDate);
      const now = new Date();
      const daysDiff = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 30) {
        analysis += `- ⚠️ 时间较为紧张（${daysDiff}天），需要评估是否能够按时完成\n`;
      } else if (daysDiff < 90) {
        analysis += `- ✅ 时间安排合理（${daysDiff}天），有充足时间进行准备和实施\n`;
      } else {
        analysis += `- ✅ 时间充裕（${daysDiff}天），可以充分规划和准备\n`;
      }
    }

    analysis += `\n## 5. 建议和注意事项\n\n`;
    
    if (needs.includes('培训') || needs.includes('学习')) {
      analysis += `📚 **培训需求**：申请人需要培训支持\n`;
      analysis += `- 建议准备培训材料和培训计划\n`;
      analysis += `- 可以考虑安排项目负责人进行培训\n\n`;
    }
    
    if (needs.includes('定制') || needs.includes('个性化') || needs.includes('修改')) {
      analysis += `🔧 **定制化需求**：需要定制化开发\n`;
      analysis += `- 需要评估定制化的工作量和成本\n`;
      analysis += `- 建议与项目负责人沟通定制化方案\n\n`;
    }
    
    if (needs.includes('数据') || needs.includes('迁移') || needs.includes('导入')) {
      analysis += `💾 **数据迁移需求**：需要数据迁移支持\n`;
      analysis += `- 需要评估数据迁移的复杂度和风险\n`;
      analysis += `- 建议制定详细的数据迁移计划\n\n`;
    }

    if (!needs || needs.trim() === '') {
      analysis += `✅ 申请人未提出特殊需求，可以按照标准流程进行部署\n\n`;
    }

    analysis += `## 6. 综合建议\n\n`;
    if (urgency === 'emergency' || urgency === 'urgent') {
      analysis += `1. **优先处理**：由于紧急程度较高，建议尽快安排审批和部署\n`;
    }
    if (!goals || goals.trim() === '') {
      analysis += `2. **明确目标**：建议与申请人沟通，明确具体的预期目标和成功标准\n`;
    }
    if (!replication.budgetRange) {
      analysis += `3. **确认预算**：建议确认预算范围，以便合理规划资源\n`;
    }
    analysis += `4. **沟通协调**：建议与项目负责人和申请人建立沟通渠道，确保部署顺利进行\n`;
    analysis += `5. **进度跟踪**：建议建立进度跟踪机制，确保按时完成部署\n`;

    return analysis;
  }
}

