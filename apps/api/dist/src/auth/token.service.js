"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../database/prisma.service");
let TokenService = TokenService_1 = class TokenService {
    jwt;
    config;
    prisma;
    logger = new common_1.Logger(TokenService_1.name);
    BCRYPT_ROUNDS = 10;
    constructor(jwt, config, prisma) {
        this.jwt = jwt;
        this.config = config;
        this.prisma = prisma;
    }
    signAccessToken(payload) {
        return this.jwt.sign(payload, {
            secret: this.config.getOrThrow('app.jwt.secret'),
            expiresIn: this.config.get('app.jwt.expiresIn'),
        });
    }
    verifyAccessToken(token) {
        try {
            return this.jwt.verify(token, {
                secret: this.config.get('app.jwt.secret'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired access token');
        }
    }
    async createRefreshToken(userId, family) {
        const rawToken = (0, crypto_1.randomUUID)();
        const tokenFamily = family ?? (0, crypto_1.randomUUID)();
        const tokenHash = await bcrypt.hash(rawToken, this.BCRYPT_ROUNDS);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, family: tokenFamily, expiresAt },
        });
        return `${tokenFamily}.${rawToken}`;
    }
    async rotateRefreshToken(rawRefreshToken) {
        const [family, token] = rawRefreshToken.split('.');
        if (!family || !token) {
            throw new common_1.UnauthorizedException('Malformed refresh token');
        }
        const familyTokens = await this.prisma.refreshToken.findMany({
            where: { family },
        });
        if (familyTokens.length === 0) {
            throw new common_1.UnauthorizedException('Refresh token family not found');
        }
        let matchedToken = null;
        for (const stored of familyTokens) {
            const isMatch = await bcrypt.compare(token, stored.tokenHash);
            if (isMatch) {
                matchedToken = stored;
                break;
            }
        }
        if (!matchedToken) {
            this.logger.warn(`Refresh token reuse detected for family: ${family}. Revoking all family tokens.`);
            await this.prisma.refreshToken.deleteMany({ where: { family } });
            throw new common_1.UnauthorizedException('Refresh token reuse detected. Please log in again.');
        }
        if (matchedToken.expiresAt < new Date()) {
            await this.prisma.refreshToken.delete({ where: { id: matchedToken.id } });
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        await this.prisma.refreshToken.delete({ where: { id: matchedToken.id } });
        const newRefreshToken = await this.createRefreshToken(matchedToken.userId, family);
        return { userId: matchedToken.userId, newRefreshToken };
    }
    async revokeAllUserTokens(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    async issueTokens(user) {
        const accessToken = this.signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = await this.createRefreshToken(user.id);
        return { accessToken, refreshToken };
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], TokenService);
//# sourceMappingURL=token.service.js.map