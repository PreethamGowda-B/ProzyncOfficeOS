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
exports.GithubController = void 0;
const common_1 = require("@nestjs/common");
const github_service_1 = require("./github.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const crypto_1 = require("crypto");
let GithubController = class GithubController {
    constructor(githubService) {
        this.githubService = githubService;
    }
    findRepositories(projectId) {
        return this.githubService.findRepositories(projectId);
    }
    findRepository(id) {
        return this.githubService.findRepository(id);
    }
    linkRepository(dto) {
        return this.githubService.linkRepository(dto.projectId, dto.githubRepoId, dto.fullName, dto.defaultBranch);
    }
    // --- GitHub Webhook Payload Endpoint ---
    async handleWebhook(event, signature, payload) {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        // Verify Webhook signature if GITHUB_WEBHOOK_SECRET is configured
        if (secret && signature) {
            const hmac = (0, crypto_1.createHmac)("sha256", secret);
            const digest = "sha256=" + hmac.update(JSON.stringify(payload)).digest("hex");
            const sigBuffer = Buffer.from(signature);
            const digestBuffer = Buffer.from(digest);
            if (sigBuffer.length !== digestBuffer.length || !(0, crypto_1.timingSafeEqual)(sigBuffer, digestBuffer)) {
                throw new common_1.UnauthorizedException("Invalid webhook signature");
            }
        }
        return this.githubService.handleWebhook(event, payload);
    }
};
exports.GithubController = GithubController;
__decorate([
    (0, common_1.Get)("repos"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GithubController.prototype, "findRepositories", null);
__decorate([
    (0, common_1.Get)("repos/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GithubController.prototype, "findRepository", null);
__decorate([
    (0, common_1.Post)("repos/link"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GithubController.prototype, "linkRepository", null);
__decorate([
    (0, common_1.Post)("webhook"),
    __param(0, (0, common_1.Headers)("x-github-event")),
    __param(1, (0, common_1.Headers)("x-hub-signature-256")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "handleWebhook", null);
exports.GithubController = GithubController = __decorate([
    (0, common_1.Controller)("github"),
    __metadata("design:paramtypes", [github_service_1.GithubService])
], GithubController);
//# sourceMappingURL=github.controller.js.map