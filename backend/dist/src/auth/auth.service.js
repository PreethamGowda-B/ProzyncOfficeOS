"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_DAYS = 30;
const INVITATION_TTL_HOURS = 24;
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    signAccessToken(userId) {
        return this.jwt.sign({ sub: userId }, { secret: process.env.JWT_ACCESS_SECRET ?? "dev-only-insecure-secret", expiresIn: ACCESS_TOKEN_TTL });
    }
    async issueRefreshToken(userId, ipAddress, userAgent) {
        const refreshToken = (0, crypto_1.randomBytes)(48).toString("hex");
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
        await this.prisma.client.session.create({
            data: { userId, refreshToken, expiresAt, ipAddress, userAgent },
        });
        return refreshToken;
    }
    async login(dto, ipAddress, userAgent) {
        const user = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
            include: { role: true },
        });
        // Same generic error whether the email doesn't exist or the password is
        // wrong — don't leak which one it was.
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        const passwordMatches = await bcrypt_1.default.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        await this.prisma.client.deviceLogin.create({
            data: { userId: user.id, ipAddress, device: userAgent },
        });
        const accessToken = this.signAccessToken(user.id);
        const refreshToken = await this.issueRefreshToken(user.id, ipAddress, userAgent);
        return {
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
        };
    }
    async refresh(refreshToken) {
        const session = await this.prisma.client.session.findUnique({ where: { refreshToken } });
        if (!session || session.revokedAt || session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException("Session expired, please log in again");
        }
        const accessToken = this.signAccessToken(session.userId);
        return { accessToken };
    }
    async logout(refreshToken) {
        await this.prisma.client.session.updateMany({
            where: { refreshToken, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    // --- Invitation-based onboarding (replaces emailing temp passwords) ---
    async createInvitation(dto, invitedById, companyId) {
        const role = await this.prisma.client.role.findUniqueOrThrow({ where: { name: dto.roleName } });
        const token = (0, crypto_1.randomBytes)(32).toString("hex");
        const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
        const invitation = await this.prisma.client.invitation.create({
            data: {
                companyId,
                email: dto.email,
                roleId: role.id,
                departmentId: dto.departmentId,
                teamId: dto.teamId,
                invitedById,
                token,
                expiresAt,
            },
        });
        // TODO: wire to Resend (or your email provider) using the INVITATION
        // EmailTemplate. Logged here so the flow is runnable without one set up.
        console.log(`[Invitation email] To: ${dto.email} — accept at ${process.env.WEB_APP_URL ?? "http://localhost:3000"}/accept-invitation?token=${token} (expires in ${INVITATION_TTL_HOURS}h)`);
        return { invitationId: invitation.id, expiresAt: invitation.expiresAt };
    }
    async acceptInvitation(dto, ipAddress, userAgent) {
        const invitation = await this.prisma.client.invitation.findUnique({ where: { token: dto.token } });
        if (!invitation)
            throw new common_1.BadRequestException("Invalid invitation link");
        if (invitation.acceptedAt)
            throw new common_1.BadRequestException("This invitation has already been used");
        if (invitation.expiresAt < new Date()) {
            throw new common_1.BadRequestException("This invitation has expired — ask your admin to send a new one");
        }
        const passwordHash = await bcrypt_1.default.hash(dto.password, 12);
        const user = await this.prisma.client.$transaction(async (tx) => {
            const created = await tx.user.create({
                data: {
                    companyId: invitation.companyId,
                    email: invitation.email,
                    passwordHash,
                    fullName: dto.fullName,
                    roleId: invitation.roleId,
                    departmentId: invitation.departmentId,
                    teamId: invitation.teamId,
                    status: "ONBOARDING",
                },
            });
            await tx.invitation.update({
                where: { id: invitation.id },
                data: { acceptedAt: new Date(), acceptedUserId: created.id },
            });
            return created;
        });
        const accessToken = this.signAccessToken(user.id);
        const refreshToken = await this.issueRefreshToken(user.id, ipAddress, userAgent);
        return { accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.fullName } };
    }
    verifyAccessToken(token) {
        try {
            return this.jwt.verify(token, { secret: process.env.JWT_ACCESS_SECRET ?? "dev-only-insecure-secret" });
        }
        catch {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map