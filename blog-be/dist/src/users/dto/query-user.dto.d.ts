import { Role, UserStatus } from './create-user.dto';
export declare class QueryUserDto {
    q?: string;
    role?: Role;
    status?: UserStatus;
    page?: number;
    limit?: number;
}
