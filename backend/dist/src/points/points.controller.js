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
exports.PointsController = void 0;
const common_1 = require("@nestjs/common");
const points_service_1 = require("./points.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PointsController = class PointsController {
    constructor(pointsService) {
        this.pointsService = pointsService;
    }
    myScore(user) {
        return this.pointsService.getMyScore(user.id);
    }
    myLedger(user, limit) {
        return this.pointsService.getLedger(user.id, limit ? parseInt(limit) : undefined);
    }
    leaderboard(year, month) {
        const now = new Date();
        return this.pointsService.getLeaderboard(year ? parseInt(year) : now.getFullYear(), month ? parseInt(month) : now.getMonth() + 1);
    }
};
exports.PointsController = PointsController;
__decorate([
    (0, common_1.Get)("my-score"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "myScore", null);
__decorate([
    (0, common_1.Get)("ledger"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "myLedger", null);
__decorate([
    (0, common_1.Get)("leaderboard"),
    __param(0, (0, common_1.Query)("year")),
    __param(1, (0, common_1.Query)("month")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "leaderboard", null);
exports.PointsController = PointsController = __decorate([
    (0, common_1.Controller)("points"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [points_service_1.PointsService])
], PointsController);
//# sourceMappingURL=points.controller.js.map