import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient, SES_CONFIG } from '../config/ses.config';
import { InternalServerError } from '../utils/AppError';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send an email via AWS SES
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const command = new SendEmailCommand({
        Source: `${SES_CONFIG.fromName} <${SES_CONFIG.fromEmail}>`,
        Destination: {
          ToAddresses: [options.to],
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: options.html,
              Charset: 'UTF-8',
            },
            ...(options.text && {
              Text: {
                Data: options.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      });

      await sesClient.send(command);
      console.log(`✅ Email sent successfully to: ${options.to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new InternalServerError('Failed to send email');
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOTPEmail(to: string, otp: string, name: string): Promise<void> {
    const subject = 'Verify Your Email - Why Designers';
    const html = this.getOTPEmailTemplate(otp, name);
    const text = `Hi ${name},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nWhy Designers Team`;

    await this.sendEmail({ to, subject, html, text });
  }

  /**
   * Get HTML template for OTP email
   */
  private getOTPEmailTemplate(otp: string, name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .otp-container {
            background-color: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .expiry {
            font-size: 14px;
            color: #e74c3c;
            margin-top: 15px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #999999;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Why Designers</h1>
          </div>
          <div class="content">
            <div class="greeting">Hi ${name},</div>
            <div class="message">
              Thank you for registering with Why Designers! To complete your email verification, please use the OTP code below:
            </div>
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry">⏱️ This code will expire in 5 minutes</div>
            </div>
            <div class="warning">
              <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email. Never share your OTP with anyone.
            </div>
            <div class="message">
              If you have any questions or need assistance, feel free to contact our support team.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Why Designers. All rights reserved.</p>
            <p>
              <a href="#">Privacy Policy</a> |
              <a href="#">Terms of Service</a> |
              <a href="#">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to Why Designers!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Why Designers! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Congratulations! Your email has been successfully verified.</p>
            <p>You now have full access to all Why Designers features. Start exploring and connecting with amazing designers!</p>
            <p>Best regards,<br>The Why Designers Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const text = `Hi ${name},\n\nWelcome to Why Designers! Your email has been verified successfully.\n\nBest regards,\nThe Why Designers Team`;

    await this.sendEmail({ to, subject, html, text });
  }
}

export default new EmailService();
