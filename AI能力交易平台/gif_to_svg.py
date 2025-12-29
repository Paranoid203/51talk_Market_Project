#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GIF 转 SVG 工具
功能：移除白色背景，转换为透明背景的 SVG 动画
"""

import io
import colorsys
import base64
from PIL import Image
import os
from pathlib import Path

def _distance(c1, c2):
    dr = c1[0] - c2[0]
    dg = c1[1] - c2[1]
    db = c1[2] - c2[2]
    return (dr * dr + dg * dg + db * db) ** 0.5

def _sample_bg_color(img):
    w, h = img.size
    px = img.convert('RGB')
    samples = [
        px.getpixel((0, 0)),
        px.getpixel((w - 1, 0)),
        px.getpixel((0, h - 1)),
        px.getpixel((w - 1, h - 1)),
        px.getpixel((w // 2, 0)),
        px.getpixel((w // 2, h - 1)),
        px.getpixel((0, h // 2)),
        px.getpixel((w - 1, h // 2)),
    ]
    r = sum(s[0] for s in samples) // len(samples)
    g = sum(s[1] for s in samples) // len(samples)
    b = sum(s[2] for s in samples) // len(samples)
    return (r, g, b)

def _is_near_white(r: int, g: int, b: int, white_threshold: int = 235) -> bool:
    return r >= white_threshold and g >= white_threshold and b >= white_threshold

def remove_background(frame, threshold=35, target_color=None):
    frame_rgba = frame.convert('RGBA')
    if target_color is None:
        target_color = _sample_bg_color(frame_rgba)
    data = frame_rgba.getdata()
    new_data = []
    bh, bs, bv = colorsys.rgb_to_hsv(target_color[0]/255.0, target_color[1]/255.0, target_color[2]/255.0)
    for r, g, b, a in data:
        if _is_near_white(r, g, b):
            new_data.append((r, g, b, a))
            continue
        h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
        dh = min(abs(h - bh), 1.0 - abs(h - bh))
        if dh < 0.06 and abs(s - bs) < 0.25 and abs(v - bv) < 0.25:
            new_data.append((r, g, b, 0))
            continue
        if _distance((r, g, b), target_color) < threshold:
            new_data.append((r, g, b, 0))
            continue
        new_data.append((r, g, b, a))
    frame_rgba.putdata(new_data)
    return frame_rgba

def gif_to_svg(gif_path, output_path=None, threshold=35, fps=None, target_color=None):
    """
    将 GIF 转换为 SVG 动画
    
    Args:
        gif_path: GIF 文件路径
        output_path: 输出 SVG 文件路径（可选）
        threshold: 白色背景检测阈值
        fps: 帧率（可选，默认使用 GIF 原始帧率）
    
    Returns:
        生成的 SVG 文件路径
    """
    # 打开 GIF 文件
    gif = Image.open(gif_path)
    
    # 获取 GIF 信息
    frames = []
    durations = []
    
    try:
        while True:
            # 获取当前帧
            frame = gif.copy()
            
            frame_rgba = remove_background(frame, threshold, target_color)
            
            # 转换为 base64 编码的 PNG
            buffer = io.BytesIO()
            frame_rgba.save(buffer, format='PNG')
            img_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            frames.append(img_data)
            
            # 获取帧延迟时间（毫秒）
            duration = gif.info.get('duration', 100)  # 默认 100ms
            durations.append(duration)
            
            # 移动到下一帧
            gif.seek(gif.tell() + 1)
    except EOFError:
        # GIF 读取完毕
        pass
    
    # 如果没有指定输出路径，使用输入文件名
    if output_path is None:
        input_name = Path(gif_path).stem
        output_path = Path(gif_path).parent / f"{input_name}_transparent.svg"
    
    # 计算 SVG 尺寸（使用第一帧的尺寸）
    gif.seek(0)
    width, height = gif.size
    
    # 计算动画总时长（毫秒）
    total_duration = sum(durations)
    
    # 生成 SVG 内容
    svg_content = f'''<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" style="border: none; outline: none;">
  <style>
    .frame {{
      display: none;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }}
    .frame.active {{
      display: block;
    }}
  </style>
  <script>
    <![CDATA[
      (function() {{
        function initAnimation() {{
          var frames = document.querySelectorAll('.frame');
          if (frames.length === 0) {{
            // 如果还没有加载完成，稍后重试
            setTimeout(initAnimation, 50);
            return;
          }}
          
          var currentFrame = 0;
          var durations = {durations};
          
          function showFrame(index) {{
            // 隐藏所有帧
            frames.forEach(function(frame) {{
              frame.classList.remove('active');
            }});
            
            // 显示当前帧
            if (frames[index]) {{
              frames[index].classList.add('active');
            }}
          }}
          
          function nextFrame() {{
            showFrame(currentFrame);
            var delay = durations[currentFrame] || 100;
            currentFrame = (currentFrame + 1) % frames.length;
            
            setTimeout(nextFrame, delay);
          }}
          
          // 立即显示第一帧，然后开始动画
          showFrame(0);
          setTimeout(nextFrame, durations[0] || 100);
        }}
        
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {{
          document.addEventListener('DOMContentLoaded', initAnimation);
        }} else {{
          // DOM 已经加载完成
          initAnimation();
        }}
      }})();
    ]]>
  </script>
'''
    
    svg_content += '</svg>'
    
    # 保存 SVG 文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"✅ 转换完成！")
    print(f"   输入文件: {gif_path}")
    print(f"   输出文件: {output_path}")
    print(f"   总帧数: {len(frames)}")
    print(f"   尺寸: {width}x{height}")
    print(f"   动画时长: {total_duration/1000:.2f}秒")
    
    return str(output_path)

if __name__ == '__main__':
    # 默认处理项目中的 GIF 文件
    gif_path = r'public\images\可爱猫咪动漫角色GIF.gif'
    
    # 检查文件是否存在
    if not os.path.exists(gif_path):
        print(f"❌ 错误：找不到文件 {gif_path}")
        print("请确保文件路径正确")
        exit(1)
    
    # 转换 GIF 为 SVG
    output_path = gif_to_svg(
        gif_path=gif_path,
        threshold=35,
        fps=None,
        target_color=None
    )
    
    print(f"\n🎉 SVG 文件已生成: {output_path}")

