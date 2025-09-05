import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private readonly apiInstance;
    private readonly senderEmail;
    private readonly senderName;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(toEmail: string, toName: string, resetUrl: string): Promise<{
        success: boolean;
    }>;
    private getResetPasswordTemplate;
}
