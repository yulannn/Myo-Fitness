import { Injectable } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerException,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class RateLimiterGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new ThrottlerException(
      'Vous avez dépassé la limite de requêtes ! Veuillez réessayez plus tard.',
    );
  }
}
