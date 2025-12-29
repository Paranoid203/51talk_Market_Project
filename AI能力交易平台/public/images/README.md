# 图片资源文件夹

这个文件夹用于存放项目的静态图片资源。

## 使用方式

将图片文件放在此文件夹中，然后在代码中通过以下方式引用：

```typescript
// 在组件中使用
const imagePath = '/images/your-image.jpg';
```

## 当前需要的图片

- `project-showcase-bg.jpg` - 项目广场页面的背景图片（推荐尺寸：1920x800px）

## 注意事项

- 图片文件名建议使用小写字母和连字符，避免空格
- 支持的图片格式：jpg, jpeg, png, webp, svg
- 大图片建议压缩后再使用，以提高页面加载速度

## 处理说明（50字内）
GIF先去背景，再转WebP，保留Alpha，页面显示透明。

