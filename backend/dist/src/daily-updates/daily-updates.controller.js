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
exports.DailyUpdatesController = void 0;
const common_1 = require("@nestjs/common");
const daily_updates_service_1 = require("./daily-updates.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DailyUpdatesController = class DailyUpdatesController {
    constructor(dailyUpdatesService) {
        this.dailyUpdatesService = dailyUpdatesService;
    }
    submit(dto, user) {
        return this.dailyUpdatesService.upsertToday(user.id, dto);
    }
    myHistory(user, limit) {
        return this.dailyUpdatesService.findByUser(user.id, limit ? parseInt(limit) : undefined);
    }
};
exports.DailyUpdatesController = DailyUpdatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)("my"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "myHistory", null);
exports.DailyUpdatesController = DailyUpdatesController = __decorate([
    (0, common_1.Controller)("daily-updates"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [daily_updates_service_1.DailyUpdatesService])
], DailyUpdatesController);
//# sourceMappingURL=daily-updates.controller.js.map