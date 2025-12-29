/**
 * 文件上传 API
 * 使用 Cloudinary 进行文件上传
 */

import { API_BASE_URL } from './api';

export interface UploadResult {
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
}

// 获取认证 Token
function getToken(): string | null {
  return localStorage.getItem('token');
}

export const uploadApi = {
  /**
   * 上传图片
   * @param file 图片文件
   * @returns 上传结果，包含图片URL
   */
  async uploadImage(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    if (!token) {
      throw new Error('请先登录');
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不要设置 Content-Type，让浏览器自动设置（包含 boundary）
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '图片上传失败' }));
      throw new Error(error.message || '图片上传失败');
    }

    return response.json();
  },

  /**
   * 上传视频
   * @param file 视频文件
   * @returns 上传结果，包含视频URL
   */
  async uploadVideo(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    if (!token) {
      throw new Error('请先登录');
    }

    const response = await fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不要设置 Content-Type，让浏览器自动设置（包含 boundary）
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '视频上传失败' }));
      throw new Error(error.message || '视频上传失败');
    }

    return response.json();
  },
};

