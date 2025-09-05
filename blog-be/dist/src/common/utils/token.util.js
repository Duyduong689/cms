"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const crypto_1 = require("crypto");
class TokenUtil {
    constructor(jwtService, accessSecret, refreshSecret, accessExpires, refreshExpires) {
        this.jwtService = jwtService;
        this.accessSecret = accessSecret;
        this.refreshSecret = refreshSecret;
        this.accessExpires = accessExpires;
        this.refreshExpires = refreshExpires;
    }
    generateAccessToken(payload) {
        const jti = (0, crypto_1.randomUUID)();
        const token = this.jwtService.sign({ ...payload, type: 'access', jti }, {
            secret: this.accessSecret,
            expiresIn: this.accessExpires
        });
        return { token, jti };
    }
    generateRefreshToken(payload) {
        const jti = (0, crypto_1.randomUUID)();
        const token = this.jwtService.sign({ ...payload, type: 'refresh', jti }, {
            secret: this.refreshSecret,
            expiresIn: this.refreshExpires
        });
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
        const payload = this.jwtService.verify(token, { secret: this.accessSecret });
        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return payload;
    }
    verifyRefreshToken(token) {
        const payload = this.jwtService.verify(token, { secret: this.refreshSecret });
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
    static generateResetToken() {
        return (0, crypto_1.randomBytes)(32).toString('base64url');
    }
    static buildResetUrl(appOrigin, token) {
        return `${appOrigin}/reset-password/${token}`;
    }
}
exports.TokenUtil = TokenUtil;
//# sourceMappingURL=token.util.js.map