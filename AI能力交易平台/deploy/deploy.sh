#!/bin/bash
# 阿里云 ECS 部署脚本

set -e

echo "🚀 开始部署 AI能力交易平台..."

# 1. 构建前端
echo "📦 构建前端..."
cd ..
npm run build

# 2. 构建后端
echo "📦 构建后端..."
cd backend
npm run build
cd ..

# 3. 启动 Docker Compose
echo "🐳 启动 Docker 服务..."
cd deploy
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# 4. 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
docker-compose exec backend npx prisma migrate deploy

echo ""
echo "✅ 部署完成！"
echo ""
echo "📌 访问地址："
echo "   - 前端: http://服务器IP"
echo "   - 后端API: http://服务器IP/api/v1"
echo "   - API文档: http://服务器IP/api-docs"
echo ""
echo "📝 查看日志: docker-compose logs -f"

