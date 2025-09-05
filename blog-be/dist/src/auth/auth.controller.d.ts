import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../common/utils/token.util';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<any>;
    login(loginDto: LoginDto, req: Request, res: Response): Promise<{
        success: boolean;
    }>;
    refresh(user: JwtPayload, res: Response): Promise<{
        success: boolean;
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, req: Request): Promise<{
        success: boolean;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    getProfile(user: JwtPayload): Promise<any>;
}
