# Git 工作流规范文档

> **版本**: v1.0.0  
> **最后更新**: 2024-11-18

## 1. 概述

本文档定义了AI能力交易平台的Git工作流规范，包括分支策略、提交规范、代码审查流程等。

## 2. 分支策略

### 2.1 分支类型

#### main/master
- **用途**: 生产环境代码
- **保护**: 禁止直接推送，必须通过PR
- **合并**: 只能从 `develop` 合并

#### develop
- **用途**: 开发主分支
- **保护**: 禁止直接推送，必须通过PR
- **合并**: 从功能分支合并

#### feature/*
- **用途**: 功能开发分支
- **命名**: `feature/tool-marketplace`, `feature/user-auth`
- **来源**: 从 `develop` 创建
- **合并**: 合并回 `develop`

#### bugfix/*
- **用途**: Bug修复分支
- **命名**: `bugfix/login-error`, `bugfix/tool-display`
- **来源**: 从 `develop` 或 `main` 创建
- **合并**: 合并回对应分支

#### hotfix/*
- **用途**: 紧急修复分支
- **命名**: `hotfix/security-patch`
- **来源**: 从 `main` 创建
- **合并**: 合并回 `main` 和 `develop`

#### release/*
- **用途**: 发布准备分支
- **命名**: `release/v1.0.0`
- **来源**: 从 `develop` 创建
- **合并**: 合并回 `main` 和 `develop`

### 2.2 分支命名规范

- 使用小写字母和连字符
- 描述性命名
- 包含类型前缀

**正确示例**:
```
feature/tool-marketplace
bugfix/login-error
hotfix/security-patch
release/v1.0.0
```

**错误示例**:
```
Feature/ToolMarketplace  ❌ 大写字母
feature-tool-marketplace  ❌ 缺少类型前缀
fix1                     ❌ 不描述性
```

## 3. 提交规范

### 3.1 Conventional Commits

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 3.2 提交类型

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | `feat(tools): add tool search feature` |
| fix | Bug修复 | `fix(auth): fix login token expiration` |
| docs | 文档更新 | `docs: update API documentation` |
| style | 代码格式（不影响功能） | `style: format code with prettier` |
| refactor | 代码重构 | `refactor(tools): optimize tool query` |
| perf | 性能优化 | `perf(db): add index to tools table` |
| test | 测试相关 | `test(tools): add unit tests for tool service` |
| chore | 构建/工具变动 | `chore: update dependencies` |
| ci | CI配置 | `ci: add GitHub Actions workflow` |

### 3.3 提交示例

#### 简单提交
```
feat(tools): add tool search functionality
```

#### 详细提交
```
feat(tools): add tool search functionality

- Add search API endpoint
- Implement search filters
- Add search result pagination

Closes #123
```

#### 破坏性变更
```
feat(api)!: change tool API response format

BREAKING CHANGE: tool API now returns data in new format
```

### 3.4 提交消息规范

- **主题行**: 不超过50字符
- **首字母小写**: 不使用句号结尾
- **使用祈使语气**: "add" 而不是 "added" 或 "adds"
- **正文**: 每行不超过72字符
- **解释为什么**: 而不是做了什么

## 4. 代码审查流程

### 4.1 Pull Request 流程

1. **创建分支**: 从 `develop` 创建功能分支
2. **开发代码**: 完成功能开发
3. **提交代码**: 遵循提交规范
4. **创建PR**: 推送到远程并创建PR
5. **代码审查**: 至少1人审查通过
6. **CI检查**: 所有CI检查通过
7. **合并代码**: 审查通过后合并

### 4.2 PR标题规范

使用与提交消息相同的格式：

```
feat(tools): add tool search functionality
fix(auth): fix login token expiration
```

### 4.3 PR描述模板

```markdown
## 变更描述
简要描述本次PR的变更内容

## 变更类型
- [ ] 新功能
- [ ] Bug修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 测试说明
描述如何测试本次变更

## 相关Issue
Closes #123

## 截图（如适用）
添加相关截图
```

### 4.4 审查检查清单

#### 代码质量
- [ ] 代码符合规范
- [ ] 无明显的Bug
- [ ] 错误处理完善
- [ ] 性能考虑合理

#### 功能完整性
- [ ] 功能按需求实现
- [ ] 边界情况处理
- [ ] 用户体验良好

#### 测试覆盖
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 测试覆盖率达标

#### 文档更新
- [ ] 代码注释完善
- [ ] API文档更新
- [ ] README更新（如需要）

## 5. 合并策略

### 5.1 合并方式

- **Squash and Merge**: 功能分支合并到主分支（推荐）
- **Merge Commit**: 保留完整历史
- **Rebase and Merge**: 线性历史（需谨慎）

### 5.2 合并前检查

- [ ] 所有CI检查通过
- [ ] 代码审查通过
- [ ] 冲突已解决
- [ ] 测试通过

## 6. 冲突解决

### 6.1 预防冲突

- 频繁从主分支拉取更新
- 小粒度提交
- 及时合并

### 6.2 解决冲突

1. 拉取最新代码: `git pull origin develop`
2. 解决冲突: 编辑冲突文件
3. 标记已解决: `git add <file>`
4. 完成合并: `git commit`

## 7. 标签管理

### 7.1 标签命名

使用语义化版本号：

```
v1.0.0
v1.1.0
v1.1.1
```

### 7.2 标签创建

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0
```

## 8. Git Hooks

### 8.1 Pre-commit Hook

使用 Husky + lint-staged:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 8.2 Commit-msg Hook

验证提交消息格式：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

## 9. 最佳实践

### 9.1 提交频率

- 小粒度提交（每次提交一个逻辑变更）
- 频繁提交（至少每天一次）
- 完成功能后立即提交

### 9.2 分支管理

- 及时删除已合并的分支
- 保持分支名称清晰
- 避免长期存在的分支

### 9.3 代码审查

- 及时响应审查请求
- 建设性反馈
- 尊重他人代码

## 10. 检查清单

- [ ] 分支命名规范
- [ ] 提交消息规范
- [ ] PR流程规范
- [ ] 代码审查流程
- [ ] 合并策略明确
- [ ] 冲突解决流程
- [ ] 标签管理规范
- [ ] Git Hooks配置
- [ ] 团队培训完成

---

**相关文档**:
- [代码审查规范](./21-代码审查规范.md)
- [任务管理规范](./22-任务管理规范.md)

