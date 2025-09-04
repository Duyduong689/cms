export declare class PasswordUtil {
    static hash(password: string, saltRounds: number): Promise<string>;
    static compare(password: string, hash: string): Promise<boolean>;
    static validateStrength(password: string): {
        isValid: boolean;
        errors: string[];
    };
}
