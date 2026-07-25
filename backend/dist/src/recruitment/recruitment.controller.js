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
exports.RecruitmentController = void 0;
const common_1 = require("@nestjs/common");
const recruitment_service_1 = require("./recruitment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let RecruitmentController = class RecruitmentController {
    constructor(recruitmentService) {
        this.recruitmentService = recruitmentService;
    }
    findJobs(user) {
        return this.recruitmentService.findJobs(user.companyId);
    }
    findJob(id) {
        return this.recruitmentService.findJob(id);
    }
    createJob(dto, user) {
        return this.recruitmentService.createJob(user.companyId, dto);
    }
    updateJobStatus(id, status) {
        return this.recruitmentService.updateJobStatus(id, status);
    }
    findCandidates(user, jobId) {
        return this.recruitmentService.findCandidates(user.companyId, jobId);
    }
    findCandidate(id) {
        return this.recruitmentService.findCandidate(id);
    }
    createCandidate(dto) {
        return this.recruitmentService.createCandidate(dto);
    }
    updateCandidateStage(id, stage) {
        return this.recruitmentService.updateCandidateStage(id, stage);
    }
    scheduleInterview(candidateId, dto) {
        return this.recruitmentService.scheduleInterview(candidateId, dto);
    }
    submitFeedback(interviewId, dto) {
        return this.recruitmentService.submitInterviewFeedback(interviewId, dto);
    }
    createOnboarding(candidateId, items) {
        return this.recruitmentService.createOnboardingChecklist(candidateId, items);
    }
    updateOnboarding(id, items, completedAt) {
        return this.recruitmentService.updateOnboardingChecklist(id, items, completedAt);
    }
};
exports.RecruitmentController = RecruitmentController;
__decorate([
    (0, common_1.Get)("jobs"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "findJobs", null);
__decorate([
    (0, common_1.Get)("jobs/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "findJob", null);
__decorate([
    (0, common_1.Post)("jobs"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createJob", null);
__decorate([
    (0, common_1.Patch)("jobs/:id/status"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateJobStatus", null);
__decorate([
    (0, common_1.Get)("candidates"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("jobId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "findCandidates", null);
__decorate([
    (0, common_1.Get)("candidates/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "findCandidate", null);
__decorate([
    (0, common_1.Post)("candidates"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createCandidate", null);
__decorate([
    (0, common_1.Patch)("candidates/:id/stage"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("stage")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateCandidateStage", null);
__decorate([
    (0, common_1.Post)("candidates/:id/interviews"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "scheduleInterview", null);
__decorate([
    (0, common_1.Patch)("interviews/:id/feedback"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Post)("candidates/:id/onboarding"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("items")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "createOnboarding", null);
__decorate([
    (0, common_1.Patch)("onboarding/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("items")),
    __param(2, (0, common_1.Body)("completedAt")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String]),
    __metadata("design:returntype", void 0)
], RecruitmentController.prototype, "updateOnboarding", null);
exports.RecruitmentController = RecruitmentController = __decorate([
    (0, common_1.Controller)("recruitment"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recruitment_service_1.RecruitmentService])
], RecruitmentController);
//# sourceMappingURL=recruitment.controller.js.map