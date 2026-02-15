import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DateSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.serializeDates(data)));
  }

  private serializeDates(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.serializeDates(item));
    }

    if (typeof obj === 'object') {
      const serialized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          serialized[key] = this.serializeDates(obj[key]);
        }
      }
      return serialized;
    }

    return obj;
  }
}
