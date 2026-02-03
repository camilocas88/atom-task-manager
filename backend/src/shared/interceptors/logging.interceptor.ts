import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoggableRequest {
  method: string;
  url: string;
  body?: Record<string, unknown>;
}

interface LoggableResponse {
  statusCode: number;
}

interface ErrorWithStatus {
  status?: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<LoggableRequest>();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context
            .switchToHttp()
            .getResponse<LoggableResponse>();
          const { statusCode } = response;
          const delay = Date.now() - now;
          this.logger.log(`← ${method} ${url} ${statusCode} - ${delay}ms`);
        },
        error: (error: ErrorWithStatus) => {
          const delay = Date.now() - now;
          this.logger.error(
            `← ${method} ${url} ${error.status || 500} - ${delay}ms`,
          );
        },
      }),
    );
  }
}
