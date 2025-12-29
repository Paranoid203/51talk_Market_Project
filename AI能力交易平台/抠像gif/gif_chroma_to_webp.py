#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import io
from pathlib import Path
from typing import List

from PIL import Image, ImageSequence
import colorsys
import numpy as np


def sample_border_rgb(img: Image.Image):
    rgb = img.convert("RGB")
    w, h = rgb.size
    samples = [
        rgb.getpixel((0, 0)),
        rgb.getpixel((w - 1, 0)),
        rgb.getpixel((0, h - 1)),
        rgb.getpixel((w - 1, h - 1)),
        rgb.getpixel((w // 2, 0)),
        rgb.getpixel((w // 2, h - 1)),
        rgb.getpixel((0, h // 2)),
        rgb.getpixel((w - 1, h // 2)),
    ]
    r = sum(s[0] for s in samples) // len(samples)
    g = sum(s[1] for s in samples) // len(samples)
    b = sum(s[2] for s in samples) // len(samples)
    return (r, g, b)


def is_near_white(r: int, g: int, b: int, thr: int = 235) -> bool:
    return r >= thr and g >= thr and b >= thr


def chroma_key_frame_rgb(img: Image.Image, target_rgb=None, tol: int = 22) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.array(rgba)
    rgb = arr[:, :, :3].astype(np.int16)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    near_white = (r >= 235) & (g >= 235) & (b >= 235)
    if target_rgb is None:
        target_rgb = sample_border_rgb(rgba)
    tr, tg, tb = target_rgb
    dr = r - tr
    dg = g - tg
    db = b - tb
    dist = np.sqrt(dr * dr + dg * dg + db * db)
    bg_mask = (dist <= tol) & (~near_white)
    alpha = arr[:, :, 3]
    alpha = np.where(bg_mask, 0, alpha)
    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr, mode="RGBA")


def gif_to_webp_transparent(gif_path: Path, out_path: Path):
    gif = Image.open(gif_path)
    frames_rgba: List[Image.Image] = []
    durations: List[int] = []

    target_rgb = sample_border_rgb(gif)
    for frame in ImageSequence.Iterator(gif):
        durations.append(frame.info.get("duration", 100))
        processed = chroma_key_frame_rgb(frame, target_rgb=target_rgb, tol=20)
        frames_rgba.append(processed)

    base = frames_rgba[0]
    rest = frames_rgba[1:]
    base.save(
        out_path,
        format="WEBP",
        save_all=True,
        append_images=rest,
        duration=durations,
        loop=0,
        quality=95,
        lossless=True,
        transparency=0,
    )
    print(f"✅ 已生成透明 WebP: {out_path}")


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    inp = project_root / r"public\images\可爱猫咪动漫角色GIF.gif"
    out = project_root / r"public\images\可爱猫咪动漫角色GIF_transparent.webp"
    gif_to_webp_transparent(inp, out)