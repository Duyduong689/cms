"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const SibApiV3Sdk = __importStar(require("sib-api-v3-sdk"));
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        const apiKey = this.configService.get('auth.mail.brevoApiKey');
        this.senderEmail = this.configService.get('auth.mail.brevoSenderEmail');
        this.senderName = this.configService.get('auth.mail.brevoSenderName');
        if (!apiKey) {
            throw new Error('BREVO_API_KEY is required');
        }
        SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }
    async sendPasswordResetEmail(toEmail, toName, resetUrl) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${toEmail}:`, error);
            throw new Error('Failed to send password reset email');
        }
    }
    getResetPasswordTemplate(userName, resetUrl) {
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
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map