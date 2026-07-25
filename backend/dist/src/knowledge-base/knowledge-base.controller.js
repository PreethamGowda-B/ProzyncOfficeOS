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
exports.KnowledgeBaseController = void 0;
const common_1 = require("@nestjs/common");
const knowledge_base_service_1 = require("./knowledge-base.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let KnowledgeBaseController = class KnowledgeBaseController {
    constructor(kbService) {
        this.kbService = kbService;
    }
    findArticles(user, category, search) {
        return this.kbService.findArticles(user.companyId, category, search);
    }
    findArticle(id) {
        return this.kbService.findArticle(id);
    }
    createArticle(dto, user) {
        return this.kbService.createArticle(user.companyId, user.id, dto);
    }
    updateArticle(id, dto) {
        return this.kbService.updateArticle(id, dto);
    }
    deleteArticle(id) {
        return this.kbService.deleteArticle(id);
    }
    findVideos() {
        return this.kbService.findVideos();
    }
    createVideo(dto) {
        return this.kbService.createVideo(dto);
    }
};
exports.KnowledgeBaseController = KnowledgeBaseController;
__decorate([
    (0, common_1.Get)("articles"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("category")),
    __param(2, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], KnowledgeBaseController.prototype, "findArticles", null);
__decorate([
    (0, common_1.Get)("articles/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KnowledgeBaseController.prototype, "findArticle", null);
__decorate([
    (0, common_1.Post)("articles"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KnowledgeBaseController.prototype, "createArticle", null);
__decorate([
    (0, common_1.Patch)("articles/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KnowledgeBaseController.prototype, "updateArticle", null);
__decorate([
    (0, common_1.Delete)("articles/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KnowledgeBaseController.prototype, "deleteArticle", null);
__decorate([
    (0, common_1.Get)("videos"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KnowledgeBaseController.prototype, "findVideos", null);
__decorate([
    (0, common_1.Post)("videos"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KnowledgeBaseController.prototype, "createVideo", null);
exports.KnowledgeBaseController = KnowledgeBaseController = __decorate([
    (0, common_1.Controller)("kb"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [knowledge_base_service_1.KnowledgeBaseService])
], KnowledgeBaseController);
//# sourceMappingURL=knowledge-base.controller.js.map