"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_access_strategy_1 = require("./strategies/jwt-access.strategy");
const jwt_refresh_strategy_1 = require("./strategies/jwt-refresh.strategy");
const jwt_access_guard_1 = require("./guards/jwt-access.guard");
const jwt_refresh_guard_1 = require("./guards/jwt-refresh.guard");
const prisma_module_1 = require("../common/prisma/prisma.module");
const redis_module_1 = require("../common/redis/redis.module");
const mail_service_1 = require("./mail/mail.service");
const auth_config_1 = __importDefault(require("../config/auth.config"));
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(auth_config_1.default),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt-access' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('auth.jwt.accessSecret'),
                    signOptions: {
                        expiresIn: configService.get('auth.jwt.accessExpires'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            mail_service_1.MailService,
            jwt_access_strategy_1.JwtAccessStrategy,
            jwt_refresh_strategy_1.JwtRefreshStrategy,
            jwt_access_guard_1.JwtAccessGuard,
            jwt_refresh_guard_1.JwtRefreshGuard,
        ],
        exports: [auth_service_1.AuthService, jwt_access_guard_1.JwtAccessGuard, jwt_refresh_guard_1.JwtRefreshGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map