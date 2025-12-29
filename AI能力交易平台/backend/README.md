# AI能力交易平台 - 后端API

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **数据库**: PostgreSQL 15+
- **缓存**: Redis 7+ (可选)
- **认证**: JWT + Passport.js

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

### 3. 数据库设置

```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 打开 Prisma Studio（可选）
npm run prisma:studio
```

### 4. 启动开发服务器

```bash
npm run start:dev
```

服务器将在 `http://localhost:3000` 启动。

## API文档

启动服务器后，访问 Swagger API 文档：

```
http://localhost:3000/api-docs
```

## 项目结构

```
backend/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── app.module.ts           # 根模块
│   ├── common/                 # 公共模块
│   ├── config/                 # 配置文件
│   ├── modules/                # 业务模块
│   └── shared/                 # 共享模块
├── prisma/
│   └── schema.prisma           # Prisma Schema
└── test/                       # 测试文件
```

## 开发命令

- `npm run start:dev` - 开发模式启动
- `npm run build` - 构建生产版本
- `npm run start:prod` - 生产模式启动
- `npm run test` - 运行测试
- `npm run lint` - 代码检查
- `npm run format` - 代码格式化

## 数据库迁移

```bash
# 创建迁移
npm run prisma:migrate

# 重置数据库（开发环境）
npx prisma migrate reset
```

## 环境变量说明

- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `JWT_SECRET`: JWT 密钥（生产环境必须修改）
- `PORT`: 服务端口（默认3000）

## 许可证

MIT

