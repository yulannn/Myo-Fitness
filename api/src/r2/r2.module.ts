import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { R2Service } from './r2.service';
import { R2UrlInterceptor } from './r2-url.interceptor';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [R2Service, R2UrlInterceptor],
    exports: [R2Service, R2UrlInterceptor],
})
export class R2Module { }
