export declare enum Role {
    ADMIN = "ADMIN",
    STAFF = "STAFF",
    CUSTOMER = "CUSTOMER"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    DISABLED = "DISABLED"
}
export declare class CreateUserDto {
    name: string;
    email: string;
    role?: Role;
    status?: UserStatus;
    avatarUrl?: string;
    tempPassword?: string;
}
