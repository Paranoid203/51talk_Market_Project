# 资源图片文件夹

这个文件夹用于存放需要通过 import 导入的图片资源。

## 使用方式

```typescript
// 在组件中导入
import myImage from '@/assets/images/my-image.jpg';

// 然后使用
<img src={myImage} alt="描述" />
```

## 注意事项

- 这个文件夹中的图片会被 Vite 处理并优化
- 适合存放需要动态导入或需要构建优化的图片
- 静态资源建议放在 `public/images/` 文件夹中

