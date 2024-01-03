import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { URLSearchParams } from 'url';

type GoogleRecaptchaResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
};

@Injectable()
export class Recaptcha implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = request.headers['x-inform-recaptcha'];

    if (!response) return false;
    const res = (await fetch(
      this.configService.getOrThrow('GOOGLE_RECAPTCHA_URL'),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: this.configService.getOrThrow('GOOGLE_RECAPTCHA_TOKEN'),
          response,
        }).toString(),
        method: 'POST',
      },
    ).then((d) => d.json())) as GoogleRecaptchaResponse;

    if (!res.success) {
      console.error('Recaptcha Error', res['error-codes']);
    }
    return res.success;
  }
}
