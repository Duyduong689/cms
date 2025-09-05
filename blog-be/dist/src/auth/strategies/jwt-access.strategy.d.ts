import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/utils/token.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
declare const JwtAccessStrategy_base: new (...args: any) => any;
export declare class JwtAccessStrategy extends JwtAccessStrategy_base {
    private configService;
    private prisma;
    private redis;
    constructor(configService: ConfigService, prisma: PrismaService, redis: RedisService);
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
