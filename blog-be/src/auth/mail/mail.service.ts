import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('auth.mail.brevoApiKey');
    this.senderEmail = this.configService.get<string>('auth.mail.brevoSenderEmail')!;
    this.senderName = this.configService.get<string>('auth.mail.brevoSenderName')!;

    if (!apiKey) {
      throw new Error('BREVO_API_KEY is required');
    }

    // Configure API key
    SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    toEmail: string,
    toName: string,
    resetUrl: string,
  ): Promise<{ success: boolean }> {
    try {
      const template = this.getResetPasswordTemplate(toName, resetUrl);
      
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = 'Reset Your Password - Blog CMS';
      sendSmtpEmail.htmlContent = template;
      sendSmtpEmail.sender = {
        name: this.senderName,
        email: this.senderEmail,
      };
      sendSmtpEmail.to = [
        {
          email: toEmail,
          name: toName,
        },
      ];

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      this.logger.log(`Password reset email sent to ${toEmail}. Message ID: ${result.messageId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${toEmail}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Get password reset email template
   */
  private getResetPasswordTemplate(userName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .reset-button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: background-color 0.2s;
        }
        .reset-button:hover {
            background-color: #1d4ed8;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .code {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            word-break: break-all;
            margin: 10px 0;
        }
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #111827;
                color: #f9fafb;
            }
            .container {
                background-color: #1f2937;
                color: #f9fafb;
            }
            .title {
                color: #f9fafb;
            }
            .code {
                background-color: #374151;
                border-color: #4b5563;
                color: #f9fafb;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Blog CMS</div>
        </div>
        
        <h1 class="title">Reset Your Password</h1>
        
        <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your Blog CMS account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <div class="code">${resetUrl}</div>
            
            <div class="warning">
                <strong>Important:</strong> This link will expire in 30 minutes for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.
            </div>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <div class="footer">
            <p>This email was sent from Blog CMS. If you have any questions, please contact our support team.</p>
            <p>&copy; ${new Date().getFullYear()} Blog CMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}
