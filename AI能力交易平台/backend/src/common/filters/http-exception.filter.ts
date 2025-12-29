import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // ✅ 添加详细的错误日志
    console.error('==================== HTTP错误 ====================');
    console.error('⏰ 时间:', new Date().toISOString());
    console.error('🔴 状态码:', status);
    console.error('📍 请求路径:', request.method, request.url);
    console.error('👤 用户:', (request as any).user?.id || '未登录');
    console.error('📦 请求体:', request.body);
    console.error('❌ 错误类型:', exception?.constructor?.name);
    console.error('❌ 错误消息:', message);
    if (exception instanceof Error) {
      console.error('❌ 错误堆栈:', exception.stack);
    } else {
      console.error('❌ 完整错误:', exception);
    }
    console.error('====================================================');

    response.status(status).json({
      code: status,
      message: typeof message === 'string' ? message : (message as any).message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: (request as any).id,
    });
  }
}

