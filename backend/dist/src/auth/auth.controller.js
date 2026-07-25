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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const create_invitation_dto_1 = require("./dto/create-invitation.dto");
const accept_invitation_dto_1 = require("./dto/accept-invitation.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const roles_decorator_1 = require("./decorators/roles.decorator");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const REFRESH_COOKIE_NAME = "officeos_refresh_token";
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
};
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(dto, req, res) {
        const { accessToken, refreshToken, user } = await this.authService.login(dto, req.ip, req.headers["user-agent"]);
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
        return { accessToken, user };
    }
    async refresh(req) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
        if (!refreshToken)
            throw new common_1.UnauthorizedException("No refresh token");
        return this.authService.refresh(refreshToken);
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
        if (refreshToken)
            await this.authService.logout(refreshToken);
        res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
        return { success: true };
    }
    // Only Super Admin / Company Admin / HR Manager can invite new employees —
    // this is the only way a User row gets created (no public signup).
    async invite(dto, currentUser) {
        return this.authService.createInvitation(dto, currentUser.id, currentUser.companyId);
    }
    async acceptInvitation(dto, req, res) {
        const { accessToken, refreshToken, user } = await this.authService.acceptInvitation(dto, req.ip, req.headers["user-agent"]);
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
        return { accessToken, user };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("refresh"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)("logout"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("invite"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.SUPER_ADMIN, client_1.RoleName.COMPANY_ADMIN, client_1.RoleName.HR_MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invitation_dto_1.CreateInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)("accept-invitation"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accept_invitation_dto_1.AcceptInvitationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "acceptInvitation", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map