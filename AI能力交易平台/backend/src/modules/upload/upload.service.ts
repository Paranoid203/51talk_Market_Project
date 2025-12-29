import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // 初始化 Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'projects/images',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit' }, // 限制最大尺寸
            { quality: 'auto:good' }, // 自动优化质量
            { fetch_format: 'auto' }, // 自动选择最佳格式
          ],
        },
        (error, result) => {
          if (error) {
            reject(new Error(`图片上传失败: ${error.message}`));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'projects/videos',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new Error(`视频上传失败: ${error.message}`));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      // 不抛出错误，允许继续执行
    }
  }

  private extractPublicId(url: string): string {
    // 从 Cloudinary URL 中提取 public_id
    // 格式: https://res.cloudinary.com/{cloud_name}/image|video/upload/v{version}/{public_id}.{format}
    const matches = url.match(/\/upload\/v\d+\/(.+)\.(jpg|png|gif|webp|mp4|webm|mov)/);
    return matches ? matches[1] : '';
  }
}

