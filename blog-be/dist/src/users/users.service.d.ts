import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PageResponse } from '../common/pagination/pagination';
export declare class UsersService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(query: QueryUserDto): Promise<PageResponse<any>>;
    findOne(id: string): Promise<any>;
    create(createUserDto: CreateUserDto): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<any>;
    toggleStatus(id: string): Promise<any>;
    resetPassword(id: string): Promise<{
        success: boolean;
    }>;
    private guardLastAdmin;
    private generateSecurePassword;
    private trackCacheKey;
    private invalidateListCache;
    private invalidateUserCache;
}
