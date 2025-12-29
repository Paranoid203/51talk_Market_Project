# API 规范文档

> **版本**: v1.0.0  
> **最后更新**: 2024-11-18

## 1. 概述

本文档定义了AI能力交易平台后端API的设计规范，包括RESTful API设计原则、请求响应格式、错误处理、认证授权等。

## 2. 基础规范

### 2.1 API 基础信息

- **Base URL**: `https://api.example.com/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时区**: UTC+8 (北京时间)

### 2.2 RESTful 设计原则

#### 2.2.1 资源命名

- 使用名词复数形式
- 使用小写字母和连字符（kebab-case）
- 避免动词，资源即名词

**正确示例**:
```
GET    /api/v1/tools
GET    /api/v1/tools/123
POST   /api/v1/tools
PUT    /api/v1/tools/123
DELETE /api/v1/tools/123
```

**错误示例**:
```
GET /api/v1/getTools          ❌ 包含动词
GET /api/v1/Tools             ❌ 大写字母
GET /api/v1/tool_list         ❌ 使用下划线
```

#### 2.2.2 HTTP 方法使用

| 方法 | 用途 | 幂等性 | 示例 |
|------|------|--------|------|
| GET | 获取资源 | 是 | `GET /api/v1/tools` |
| POST | 创建资源 | 否 | `POST /api/v1/tools` |
| PUT | 完整更新资源 | 是 | `PUT /api/v1/tools/123` |
| PATCH | 部分更新资源 | 否 | `PATCH /api/v1/tools/123` |
| DELETE | 删除资源 | 是 | `DELETE /api/v1/tools/123` |

### 2.3 URL 设计规范

#### 2.3.1 版本控制

API版本通过URL路径指定：
```
/api/v1/tools
/api/v2/tools
```

#### 2.3.2 资源层级

- 最多3层嵌套
- 超过3层使用查询参数

**示例**:
```
GET /api/v1/users/123/tools           ✅ 2层嵌套
GET /api/v1/users/123/tools/456       ✅ 3层嵌套
GET /api/v1/users/123/tools/456/comments?page=1  ✅ 使用查询参数
```

#### 2.3.3 查询参数

常用查询参数：
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20，最大100）
- `sort`: 排序字段（如：`sort=createdAt:desc`）
- `filter`: 过滤条件（如：`filter=category:create,status:active`）
- `search`: 搜索关键词
- `fields`: 返回字段（如：`fields=id,name,description`）

**示例**:
```
GET /api/v1/tools?page=1&limit=20&sort=createdAt:desc&filter=category:create&search=AI
```

## 3. 请求规范

### 3.1 请求头

#### 必需请求头

```http
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {uuid}  # 用于追踪请求
```

#### 可选请求头

```http
Accept: application/json
Accept-Language: zh-CN
X-Client-Version: 1.0.0
X-Platform: web|mobile
```

### 3.2 请求体格式

#### 创建资源 (POST)

```json
{
  "name": "AI文案生成器",
  "description": "基于GPT-4的智能文案创作工具",
  "category": "create",
  "type": "agent",
  "price": 0
}
```

#### 更新资源 (PUT/PATCH)

**PUT (完整更新)**:
```json
{
  "name": "AI文案生成器",
  "description": "更新后的描述",
  "category": "create",
  "type": "agent",
  "price": 0
}
```

**PATCH (部分更新)**:
```json
{
  "description": "更新后的描述",
  "price": 10
}
```

### 3.3 文件上传

使用 `multipart/form-data`:

```http
POST /api/v1/tools/123/icon
Content-Type: multipart/form-data

file: [binary data]
```

## 4. 响应规范

### 4.1 响应结构

#### 成功响应

**单个资源**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "AI文案生成器",
    "description": "基于GPT-4的智能文案创作工具",
    "createdAt": "2024-11-18T10:00:00Z",
    "updatedAt": "2024-11-18T10:00:00Z"
  },
  "timestamp": "2024-11-18T10:00:00Z"
}
```

**列表资源**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      { "id": 1, "name": "工具1" },
      { "id": 2, "name": "工具2" }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": "2024-11-18T10:00:00Z"
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name is required"
    },
    {
      "field": "email",
      "message": "email format is invalid"
    }
  ],
  "timestamp": "2024-11-18T10:00:00Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 4.2 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功，无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或token过期 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 429 | Too Many Requests | 请求频率过高 |
| 500 | Internal Server Error | 服务器内部错误 |
| 503 | Service Unavailable | 服务不可用 |

### 4.3 业务错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 200 | 200 | 成功 |
| 40001 | 400 | 参数验证失败 |
| 40002 | 400 | 请求格式错误 |
| 40101 | 401 | Token缺失 |
| 40102 | 401 | Token过期 |
| 40103 | 401 | Token无效 |
| 40301 | 403 | 无权限访问 |
| 40401 | 404 | 资源不存在 |
| 40901 | 409 | 资源已存在 |
| 42201 | 422 | 业务逻辑错误 |
| 42901 | 429 | 请求频率限制 |
| 50001 | 500 | 服务器内部错误 |

## 5. 认证授权

### 5.1 JWT Token 认证

#### Token 获取

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

#### Token 使用

```http
GET /api/v1/tools
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Token 刷新

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5.2 权限控制

#### 角色定义

- `user`: 普通用户
- `admin`: 管理员
- `dept_admin`: 部门管理员

#### 权限装饰器示例

```typescript
@Get(':id')
@Roles('user', 'admin')
@UseGuards(JwtAuthGuard, RolesGuard)
async getTool(@Param('id') id: number) {
  // ...
}
```

## 6. 分页规范

### 6.1 分页参数

- `page`: 页码，从1开始
- `limit`: 每页数量，默认20，最大100

### 6.2 分页响应

```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 7. 搜索和过滤

### 7.1 搜索参数

```http
GET /api/v1/tools?search=AI文案
```

### 7.2 过滤参数

```http
GET /api/v1/tools?filter=category:create,status:active
```

### 7.3 排序参数

```http
GET /api/v1/tools?sort=createdAt:desc,rating:asc
```

## 8. 字段选择

使用 `fields` 参数控制返回字段：

```http
GET /api/v1/tools?fields=id,name,description
```

## 9. 速率限制

### 9.1 限制规则

- 普通用户: 100请求/分钟
- 认证用户: 1000请求/分钟
- 管理员: 10000请求/分钟

### 9.2 响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## 10. API 文档

### 10.1 Swagger 集成

访问地址: `https://api.example.com/api-docs`

### 10.2 文档要求

- 所有接口必须有文档
- 包含请求/响应示例
- 包含错误码说明
- 包含认证要求

## 11. 版本管理

### 11.1 版本策略

- 主版本号（v1, v2）: 不兼容的API变更
- 次版本号（v1.1）: 向后兼容的功能新增
- 补丁版本（v1.1.1）: 向后兼容的问题修复

### 11.2 废弃流程

1. 在文档中标记为 `@deprecated`
2. 添加 `X-API-Deprecation` 响应头
3. 至少保留2个版本周期
4. 通知所有调用方

## 12. 最佳实践

### 12.1 设计原则

1. **RESTful**: 遵循REST设计原则
2. **一致性**: 保持API设计一致性
3. **可预测**: URL和响应格式可预测
4. **文档化**: 完善的API文档
5. **版本化**: 明确的版本管理

### 12.2 性能优化

1. 使用分页避免大量数据返回
2. 使用字段选择减少数据传输
3. 使用缓存减少数据库查询
4. 使用索引优化查询性能

### 12.3 安全建议

1. 所有API使用HTTPS
2. 敏感数据加密传输
3. 实施速率限制
4. 输入验证和SQL注入防护
5. CORS配置合理

## 13. 示例

### 13.1 完整示例

**创建工具**:
```http
POST /api/v1/tools
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "AI文案生成器",
  "description": "基于GPT-4的智能文案创作工具",
  "category": "create",
  "type": "agent",
  "price": 0,
  "tags": ["AI", "文案", "GPT-4"]
}
```

**响应**:
```json
{
  "code": 201,
  "message": "Tool created successfully",
  "data": {
    "id": 1,
    "name": "AI文案生成器",
    "description": "基于GPT-4的智能文案创作工具",
    "category": "create",
    "type": "agent",
    "price": 0,
    "tags": ["AI", "文案", "GPT-4"],
    "author": {
      "id": 123,
      "name": "张小明",
      "department": "市场部"
    },
    "createdAt": "2024-11-18T10:00:00Z",
    "updatedAt": "2024-11-18T10:00:00Z"
  },
  "timestamp": "2024-11-18T10:00:00Z"
}
```

## 14. 检查清单

- [ ] API遵循RESTful设计原则
- [ ] 使用正确的HTTP方法
- [ ] 统一的响应格式
- [ ] 完善的错误处理
- [ ] JWT认证实现
- [ ] 权限控制实现
- [ ] 分页功能实现
- [ ] 搜索和过滤功能
- [ ] 速率限制实现
- [ ] API文档完善
- [ ] 版本管理策略
- [ ] 安全措施到位

---

**相关文档**:
- [错误处理规范](./20-错误处理规范.md)
- [接口版本管理规范](./19-接口版本管理规范.md)
- [安全开发规范](./14-安全开发规范.md)

