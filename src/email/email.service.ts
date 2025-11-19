import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Initialize the Nodemailer transporter in the constructor
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true for 465, false for other ports like 587
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Sends an email with the given subject and content.
   * @param to The recipient's email address.
   * @param subject The subject line of the email.
   * @param html The HTML content of the email body.
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: to,
      subject: subject,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      // In a real application, you might want to throw an exception or handle this more gracefully
    }
  }
}