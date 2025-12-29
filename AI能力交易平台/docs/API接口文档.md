# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **API 文档**: `http://localhost:3000/api-docs`
- **认证方式**: Bearer Token (JWT)

## 接口列表

### 1. 认证模块 (Auth)

#### 1.1 用户登录
- **路径**: `POST /auth/login`
- **认证**: 不需要
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "accessToken": "jwt_token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "用户名",
      "department": "技术部",
      "role": "USER"
    }
  }
  ```

#### 1.2 用户注册
- **路径**: `POST /auth/register`
- **认证**: 不需要
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "用户名",
    "department": "技术部",
    "position": "高级工程师" // 可选
  }
  ```
- **响应**: 同登录接口

---

### 2. 用户管理 (Users)

**所有接口都需要认证，部分接口需要管理员权限**

#### 2.1 创建用户
- **路径**: `POST /users`
- **认证**: 需要 (管理员)
- **请求体**: CreateUserDto

#### 2.2 获取用户列表
- **路径**: `GET /users`
- **认证**: 需要
- **查询参数**: QueryUserDto

#### 2.3 获取用户详情
- **路径**: `GET /users/:id`
- **认证**: 需要

#### 2.4 更新用户信息
- **路径**: `PATCH /users/:id`
- **认证**: 需要

#### 2.5 删除用户
- **路径**: `DELETE /users/:id`
- **认证**: 需要 (管理员)

---

### 3. 工具管理 (Tools)

#### 3.1 创建工具
- **路径**: `POST /tools`
- **认证**: 需要

#### 3.2 获取工具列表
- **路径**: `GET /tools`
- **认证**: 不需要（公开）

#### 3.3 获取工具详情
- **路径**: `GET /tools/:id`
- **认证**: 不需要（公开）

#### 3.4 更新工具
- **路径**: `PATCH /tools/:id`
- **认证**: 需要

#### 3.5 删除工具
- **路径**: `DELETE /tools/:id`
- **认证**: 需要

---

### 4. 需求管理 (Demands)

**所有接口都需要认证**

#### 4.1 创建需求
- **路径**: `POST /demands`
- **认证**: 需要

#### 4.2 获取需求列表
- **路径**: `GET /demands`
- **认证**: 需要

#### 4.3 获取需求详情
- **路径**: `GET /demands/:id`
- **认证**: 需要

#### 4.4 更新需求
- **路径**: `PATCH /demands/:id`
- **认证**: 需要

#### 4.5 删除需求
- **路径**: `DELETE /demands/:id`
- **认证**: 需要

#### 4.6 关注需求
- **路径**: `POST /demands/:id/follow`
- **认证**: 需要

#### 4.7 取消关注需求
- **路径**: `DELETE /demands/:id/follow`
- **认证**: 需要

---

### 5. 项目管理 (Projects)

**所有接口都需要认证**

#### 5.1 创建项目
- **路径**: `POST /projects`
- **认证**: 需要

#### 5.2 获取项目列表
- **路径**: `GET /projects`
- **认证**: 需要

#### 5.3 获取项目详情
- **路径**: `GET /projects/:id`
- **认证**: 需要

#### 5.4 更新项目
- **路径**: `PATCH /projects/:id`
- **认证**: 需要

#### 5.5 删除项目
- **路径**: `DELETE /projects/:id`
- **认证**: 需要

#### 5.6 点赞项目
- **路径**: `POST /projects/:id/like`
- **认证**: 需要

#### 5.7 取消点赞项目
- **路径**: `DELETE /projects/:id/like`
- **认证**: 需要

---

### 6. 通知管理 (Notifications)

**所有接口都需要认证**

#### 6.1 创建通知（系统内部使用）
- **路径**: `POST /notifications`
- **认证**: 需要

#### 6.2 获取通知列表
- **路径**: `GET /notifications`
- **认证**: 需要

#### 6.3 获取未读通知数量
- **路径**: `GET /notifications/unread-count`
- **认证**: 需要

#### 6.4 获取通知详情
- **路径**: `GET /notifications/:id`
- **认证**: 需要

#### 6.5 标记通知为已读
- **路径**: `PATCH /notifications/:id/read`
- **认证**: 需要

#### 6.6 标记所有通知为已读
- **路径**: `PATCH /notifications/read-all`
- **认证**: 需要

#### 6.7 删除通知
- **路径**: `DELETE /notifications/:id`
- **认证**: 需要

---

## 错误响应格式

```json
{
  "code": 400,
  "message": "错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

## 状态码说明

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器错误

