"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const crypto_1 = require("crypto");
class TokenUtil {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    generateAccessToken(payload) {
        return this.jwtService.sign({ ...payload, type: 'access' }, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
    }
    generateRefreshToken(payload) {
        const jti = (0, crypto_1.randomUUID)();
        const token = this.jwtService.sign({ ...payload, type: 'refresh', jti }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
        return { token, jti };
    }
    generateTokenPair(payload) {
        const accessToken = this.generateAccessToken(payload);
        const { token: refreshToken, jti } = this.generateRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            jti,
        };
    }
    verifyAccessToken(token) {
        const payload = this.jwtService.verify(token);
        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return payload;
    }
    verifyRefreshToken(token) {
        const payload = this.jwtService.verify(token);
        if (payload.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        if (!payload.jti) {
            throw new Error('Missing JTI in refresh token');
        }
        return payload;
    }
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
}
exports.TokenUtil = TokenUtil;
//# sourceMappingURL=token.util.js.map