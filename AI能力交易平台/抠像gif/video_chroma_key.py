#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import cv2
import numpy as np
from pathlib import Path
from apng import APNG

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def _median_bg_from_border(hsv: np.ndarray) -> np.ndarray:
    h, w = hsv.shape[:2]
    border = np.concatenate([
        hsv[0, :, :],
        hsv[h - 1, :, :],
        hsv[:, 0, :],
        hsv[:, w - 1, :],
    ], axis=0)
    # Hue 是环形，简单取平均近似即可
    H = int(np.mean(border[:, 0]))
    S = int(np.median(border[:, 1]))
    V = int(np.median(border[:, 2]))
    return np.array([H, S, V], dtype=np.int32)

def chroma_key_pink_to_alpha(frame_bgr: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2HSV)
    ref = _median_bg_from_border(hsv)
    H, S, V = int(ref[0]), int(ref[1]), int(ref[2])

    # 容差（适合淡粉背景）：色相 ±12、饱和度 ±60、亮度 ±60
    h_tol, s_tol, v_tol = 12, 60, 60

    # 计算与背景的接近度遮罩
    dh = np.abs(hsv[:, :, 0].astype(np.int32) - H)
    dh = np.minimum(dh, 180 - dh)
    ds = np.abs(hsv[:, :, 1].astype(np.int32) - S)
    dv = np.abs(hsv[:, :, 2].astype(np.int32) - V)

    close_mask = (dh <= h_tol) & (ds <= s_tol) & (dv <= v_tol)

    # 仅保留“与边界连通”的接近区域，防止误抠中间的猫
    bin_mask = np.where(close_mask, 255, 0).astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    bin_mask = cv2.morphologyEx(bin_mask, cv2.MORPH_OPEN, kernel, iterations=1)

    num_labels, labels = cv2.connectedComponents(bin_mask)
    h, w = bin_mask.shape
    border_labels = set()
    border_labels.update(np.unique(labels[0, :]))
    border_labels.update(np.unique(labels[h - 1, :]))
    border_labels.update(np.unique(labels[:, 0]))
    border_labels.update(np.unique(labels[:, w - 1]))

    bg_mask = np.isin(labels, list(border_labels)).astype(np.uint8) * 255

    # 白色保护：不抠接近纯白的像素（猫主体）
    bgr = frame_bgr
    near_white = (bgr[:, :, 0] > 235) & (bgr[:, :, 1] > 235) & (bgr[:, :, 2] > 235)
    bg_mask[near_white] = 0

    # 构建 alpha
    alpha = cv2.bitwise_not(bg_mask)
    bgra = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2BGRA)
    bgra[:, :, 3] = alpha
    return bgra

def process_video(input_path: Path, out_dir: Path, out_apng_path: Path):
    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        raise RuntimeError(f"无法打开视频: {input_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    fps = int(round(fps)) if fps > 0 else 24
    delay_ms = int(round(1000 / max(fps, 1)))

    ensure_dir(out_dir)
    frames = []
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        bgra = chroma_key_pink_to_alpha(frame)
        frame_path = out_dir / f"frame_{idx:04d}.png"
        ok, buf = cv2.imencode('.png', bgra)
        if not ok:
            raise RuntimeError(f"PNG 编码失败: {frame_path}")
        with open(frame_path, 'wb') as f:
            f.write(buf.tobytes())
        frames.append((frame_path, delay_ms))
        idx += 1
    cap.release()

    if len(frames) == 0:
        raise RuntimeError("未读取到任何帧")

    apng = APNG()
    for fp, delay in frames:
        apng.append_file(str(fp), delay=delay)
    ensure_dir(out_apng_path.parent)
    apng.save(str(out_apng_path))

if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    input_path = project_root / r"public\images\ezgif-782d23d6f6342194.mp4"
    out_dir = project_root / r"public\images\chroma_frames"
    out_apng = project_root / r"public\images\ezgif-782d23d6f6342194_transparent.apng"
    process_video(input_path, out_dir, out_apng)
    print(f"✅ 已生成透明 APNG: {out_apng}")