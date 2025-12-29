import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        department: user.department,
        role: user.role,
        position: user.position,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        department: registerDto.department,
        position: registerDto.position,
      },
    });

    // 注册后自动登录，返回 token
    const { password: _, ...userWithoutPassword } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        avatar: userWithoutPassword.avatar,
        department: userWithoutPassword.department,
        role: userWithoutPassword.role,
        position: userWithoutPassword.position,
      },
    };
  }

  // ✅ 更新个人资料（包括联系方式）
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        department: true,
        departmentId: true,
        position: true,
        role: true,
        level: true,
        levelName: true,
        points: true,
        // ✅ 包含新的联系方式字段
        phone: true,
        qrCode: true,
        qrCodeType: true,
        showPhone: true,
        showQrCode: true,
        feishuId: true,
        feishuUserId: true,
        showFeishu: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // ✅ 获取用户详情（包括联系方式）
  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        department: true,
        departmentId: true,
        position: true,
        role: true,
        level: true,
        levelName: true,
        points: true,
        phone: true,
        qrCode: true,
        qrCodeType: true,
        showPhone: true,
        showQrCode: true,
        feishuId: true,
        feishuUserId: true,
        showFeishu: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }
}

