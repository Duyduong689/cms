export interface AuthConfig {
    jwt: {
        accessSecret: string;
        accessExpires: string;
        refreshSecret: string;
        refreshExpires: string;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
    };
    auth: {
        sessionPrefix: string;
        refreshPrefix: string;
        resetPrefix: string;
        blockedPrefix: string;
        bcryptSaltRounds: number;
        loginMaxAttempts: number;
        loginWindowMin: number;
        resetTokenTtl: number;
        forgotPasswordMaxAttempts: number;
        forgotPasswordWindowMin: number;
    };
    mail: {
        brevoApiKey: string;
        brevoSenderEmail: string;
        brevoSenderName: string;
    };
    app: {
        origin: string;
    };
}
declare const _default: (() => AuthConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AuthConfig>;
export default _default;
