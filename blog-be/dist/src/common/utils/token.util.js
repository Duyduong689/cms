"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const crypto_1 = require("crypto");
class TokenUtil {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    generateAccessToken(payload) {
        const jti = (0, crypto_1.randomUUID)();
        const token = this.jwtService.sign({ ...payload, type: 'access', jti }, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
        return { token, jti };
    }
    generateRefreshToken(payload) {
        const jti = (0, crypto_1.randomUUID)();
        const token = this.jwtService.sign({ ...payload, type: 'refresh', jti }, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
        return { token, jti };
    }
    generateTokenPair(payload) {
        const sessionId = payload.sid;
        const { token: accessToken, jti: accessJti } = this.generateAccessToken(payload);
        const { token: refreshToken, jti: refreshJti } = this.generateRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            sessionId,
            refreshJti,
            accessJti,
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
    static calculateRemainingTtl(token) {
        try {
            const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            const remainingMs = expirationTime - currentTime;
            return Math.max(0, Math.ceil(remainingMs / 1000));
        }
        catch {
            return 0;
        }
    }
}
exports.TokenUtil = TokenUtil;
//# sourceMappingURL=token.util.js.map