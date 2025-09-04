export declare const configuration: () => {
    database: {
        url: string;
    };
    redis: {
        host: string;
        port: number;
        ttl: number;
        max: number;
    };
    auth: {
        jwt: {
            accessSecret: string;
            accessExpires: string;
            refreshSecret: string;
            refreshExpires: string;
        };
        auth: {
            refreshPrefix: string;
            resetPrefix: string;
            bcryptSaltRounds: number;
            loginMaxAttempts: number;
            loginWindowMin: number;
        };
    };
};
