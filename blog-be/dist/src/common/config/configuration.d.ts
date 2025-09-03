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
};
