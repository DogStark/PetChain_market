import { Module } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './sentry.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class SentryModule {
  static init() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [new Sentry.Integrations.Http({ tracing: true })],
    });
  }
}
