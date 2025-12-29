#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import cv2
from PIL import Image
import numpy as np
from pathlib import Path

def mov_to_webp(mov_path: Path, out_path: Path, max_side: int = 512, quality: int = 90):
    cap = cv2.VideoCapture(str(mov_path))
    if not cap.isOpened():
        raise RuntimeError(f"无法打开视频: {mov_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    fps = int(round(fps)) if fps > 0 else 24
    delay_ms = int(round(1000 / max(fps, 1)))

    frames = []
    durations = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # BGR -> RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w = rgb.shape[:2]
        # 缩放到不超过 max_side
        scale = min(1.0, max_side / max(h, w))
        if scale < 1.0:
            new_w = int(w * scale)
            new_h = int(h * scale)
            rgb = cv2.resize(rgb, (new_w, new_h), interpolation=cv2.INTER_AREA)
        im = Image.fromarray(rgb)
        frames.append(im)
        durations.append(delay_ms)

    cap.release()

    if not frames:
        raise RuntimeError("没有从视频中读取到帧")

    base = frames[0]
    rest = frames[1:]
    base.save(
        out_path,
        format="WEBP",
        save_all=True,
        append_images=rest,
        duration=durations,
        loop=0,
        quality=quality,
    )
    print(f"✅ 已生成 WebP: {out_path} ({len(frames)}帧, fps={fps})")

if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    inp = project_root / r"public\images\11月19日.mov"
    out = project_root / r"public\images\11月19日.webp"
    mov_to_webp(inp, out)