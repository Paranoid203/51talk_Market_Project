#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import imageio.v2 as imageio
import numpy as np
import cv2
from PIL import Image

def remove_border_black_to_alpha(frame: np.ndarray, v_thr: int = 20) -> Image.Image:
    # frame: RGB or RGBA numpy array
    if frame.shape[2] == 4:
        rgb = frame[:, :, :3]
    else:
        rgb = frame
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2]
    # near black mask by value
    near_black = v <= v_thr
    mask = (near_black.astype(np.uint8)) * 255
    # clean small dots
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # keep only components touching border
    num_labels, labels = cv2.connectedComponents(mask)
    h, w = mask.shape
    border_labels = set()
    border_labels.update(np.unique(labels[0, :]))
    border_labels.update(np.unique(labels[h - 1, :]))
    border_labels.update(np.unique(labels[:, 0]))
    border_labels.update(np.unique(labels[:, w - 1]))
    bg_mask = np.isin(labels, list(border_labels)).astype(np.uint8) * 255

    # build alpha
    if frame.shape[2] == 4:
        alpha = frame[:, :, 3].copy()
    else:
        alpha = np.full((h, w), 255, dtype=np.uint8)
    alpha = np.where(bg_mask == 255, 0, alpha)

    rgba = np.dstack([rgb, alpha])
    return Image.fromarray(rgba, mode='RGBA')

def process_mov_to_webp(mov_path: Path, out_path: Path, max_side: int = 512, v_thr: int = 20):
    reader = imageio.get_reader(str(mov_path), format='FFMPEG')
    fps = int(round(reader.get_meta_data().get('fps', 24)))
    delay_ms = int(round(1000 / max(fps, 1)))

    frames = []
    durations = []
    for frame in reader:
        h, w = frame.shape[:2]
        scale = min(1.0, max_side / max(h, w))
        if scale < 1.0:
            new_w = int(w * scale)
            new_h = int(h * scale)
            frame = np.array(Image.fromarray(frame).resize((new_w, new_h), Image.LANCZOS))
        rgba = remove_border_black_to_alpha(frame, v_thr=v_thr)
        frames.append(rgba)
        durations.append(delay_ms)
    reader.close()

    if not frames:
        raise RuntimeError('没有读取到任何帧')

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
        quality=95,
    )
    print(f"✅ 已生成移除黑底的透明 WebP: {out_path}")

if __name__ == '__main__':
    project_root = Path(__file__).resolve().parents[1]
    inp = project_root / r"public\images\11月19日.mov"
    out = project_root / r"public\images\11月19日_alpha.webp"
    process_mov_to_webp(inp, out, max_side=512, v_thr=20)