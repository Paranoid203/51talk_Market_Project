#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import imageio.v2 as imageio
from PIL import Image

def mov_to_webp_alpha(mov_path: Path, out_path: Path, max_side: int = 512, quality: int = 95):
    reader = imageio.get_reader(str(mov_path), format='FFMPEG')
    meta = reader.get_meta_data()
    fps = int(round(meta.get('fps', 24)))
    delay_ms = int(round(1000 / max(fps, 1)))

    frames = []
    durations = []
    for frame in reader:
        # frame shape: (h, w, channels) channels may be 3 or 4
        h, w = frame.shape[:2]
        # scale
        scale = min(1.0, max_side / max(h, w))
        if scale < 1.0:
            new_w = int(w * scale)
            new_h = int(h * scale)
            # use PIL for high-quality resize preserving alpha if present
            im = Image.fromarray(frame)
            im = im.resize((new_w, new_h), Image.LANCZOS)
        else:
            im = Image.fromarray(frame)

        # ensure RGBA to preserve alpha; if frame is RGB, add opaque alpha
        if im.mode == 'RGBA':
            rgba = im
        elif im.mode == 'RGB':
            rgba = im.convert('RGBA')
        else:
            rgba = im.convert('RGBA')

        frames.append(rgba)
        durations.append(delay_ms)

    reader.close()

    if not frames:
        raise RuntimeError('视频没有帧或无法读取')

    base = frames[0]
    rest = frames[1:]
    base.save(
        out_path,
        format='WEBP',
        save_all=True,
        append_images=rest,
        duration=durations,
        loop=0,
        lossless=True,
        quality=quality,
    )
    print(f"✅ 已生成带Alpha的 WebP: {out_path} (fps={fps}, frames={len(frames)})")

if __name__ == '__main__':
    project_root = Path(__file__).resolve().parents[1]
    inp = project_root / r"public\images\11月19日.mov"
    out = project_root / r"public\images\11月19日_alpha.webp"
    mov_to_webp_alpha(inp, out)