# 部署与CI-CD规范文档

> **版本**: v1.0.0  
> **最后更新**: 2024-11-18

## 1. 概述

本文档定义了AI能力交易平台的部署流程和CI/CD流水线配置规范。

## 2. CI/CD工具

- **CI平台**: GitHub Actions / GitLab CI
- **容器化**: Docker
- **部署平台**: 自建服务器 / 云平台（阿里云/腾讯云）

## 3. CI/CD流水线

### 3.1 流水线阶段

```
代码提交
  ↓
代码检查 (Lint, Format)
  ↓
单元测试
  ↓
构建
  ↓
集成测试
  ↓
构建镜像
  ↓
部署到测试环境
  ↓
E2E测试
  ↓
部署到生产环境
```

### 3.2 GitHub Actions示例

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
```

## 4. 构建规范

### 4.1 前端构建

```bash
# 构建命令
npm run build

# 构建输出
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
```

### 4.2 后端构建

```bash
# 构建命令
npm run build

# 构建输出
dist/
├── main.js
├── app.module.js
└── ...
```

## 5. Docker镜像构建

### 5.1 多阶段构建

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### 5.2 镜像标签

- **开发**: `latest`, `dev-{commit-hash}`
- **测试**: `staging-{version}`
- **生产**: `v{version}`, `production-{date}`

## 6. 部署流程

### 6.1 测试环境部署

1. **触发条件**: 合并到 `develop` 分支
2. **自动部署**: CI/CD自动部署
3. **验证**: 自动运行E2E测试
4. **通知**: 部署结果通知团队

### 6.2 生产环境部署

1. **触发条件**: 合并到 `main` 分支
2. **人工确认**: 需要人工确认（重要更新）
3. **灰度发布**: 先部署到部分服务器
4. **全量发布**: 验证后全量发布
5. **回滚准备**: 准备回滚方案

## 7. 版本管理

### 7.1 版本号规则

使用语义化版本号：

```
主版本号.次版本号.修订号
1.0.0
```

### 7.2 版本发布流程

1. **创建Release分支**: `release/v1.0.0`
2. **更新版本号**: `package.json`
3. **更新CHANGELOG**: 记录变更
4. **测试验证**: 充分测试
5. **创建Tag**: `git tag v1.0.0`
6. **合并到main**: 合并Release分支
7. **部署**: 部署到生产环境

## 8. 回滚策略

### 8.1 回滚触发条件

- 严重Bug影响用户
- 性能严重下降
- 安全漏洞

### 8.2 回滚流程

1. **停止部署**: 立即停止当前部署
2. **回滚代码**: 回滚到上一个稳定版本
3. **重新部署**: 部署稳定版本
4. **验证**: 验证回滚成功
5. **问题分析**: 分析问题原因

## 9. 部署检查清单

### 9.1 部署前检查

- [ ] 代码审查通过
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 版本号更新
- [ ] CHANGELOG更新
- [ ] 数据库迁移准备（如需要）
- [ ] 回滚方案准备

### 9.2 部署后检查

- [ ] 服务正常启动
- [ ] 健康检查通过
- [ ] 功能验证通过
- [ ] 性能监控正常
- [ ] 错误日志检查
- [ ] 用户反馈监控

## 10. 监控和告警

### 10.1 部署监控

- 部署状态监控
- 服务健康监控
- 错误率监控
- 性能指标监控

### 10.2 告警规则

- 部署失败立即告警
- 服务异常告警
- 错误率超过阈值告警
- 性能下降告警

## 11. 最佳实践

### 11.1 部署原则

- **自动化**: 尽可能自动化
- **可回滚**: 随时可以回滚
- **可监控**: 部署过程可监控
- **可追溯**: 部署记录可追溯

### 11.2 安全考虑

- 密钥管理安全
- 部署权限控制
- 审计日志记录
- 安全扫描集成

## 12. 检查清单

- [ ] CI/CD流水线配置
- [ ] 构建流程规范
- [ ] Docker镜像构建
- [ ] 部署流程规范
- [ ] 版本管理策略
- [ ] 回滚方案准备
- [ ] 监控告警配置
- [ ] 安全检查通过

---

**相关文档**:
- [环境配置规范](./08-环境配置规范.md)
- [测试规范](./10-测试规范.md)
- [日志与监控规范](./15-日志与监控规范.md)

