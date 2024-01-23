import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class NodemailerService {
  private transport: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private configService: ConfigService) {
    this.transport = createTransport({
      secure: configService.get('NODE_ENV', '') !== 'development',
      host: configService.getOrThrow('SMTP_HOST'),
      port: configService.getOrThrow('SMTP_PORT'),
      auth: {
        user: configService.getOrThrow('SMTP_USERNAME'),
        pass: configService.getOrThrow('SMTP_PASSWORD'),
      },
    });
  }

  send(to: string, subject: string, text: string) {
    return this.transport.sendMail({
      from: this.configService.getOrThrow('SMTP_FROM'),
      subject,
      text,
      to,
    });
  }
}
