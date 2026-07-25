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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruitmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecruitmentService = class RecruitmentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // --- Job Openings ---
    async findJobs(companyId) {
        return this.prisma.client.jobOpening.findMany({
            where: { companyId },
            include: {
                department: { select: { name: true } },
                _count: { select: { candidates: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async findJob(id) {
        const job = await this.prisma.client.jobOpening.findUnique({
            where: { id },
            include: {
                department: true,
                candidates: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!job)
            throw new common_1.NotFoundException(`Job opening ${id} not found`);
        return job;
    }
    async createJob(companyId, dto) {
        return this.prisma.client.jobOpening.create({
            data: {
                companyId,
                title: dto.title,
                departmentId: dto.departmentId,
                description: dto.description,
                openings: dto.openings ?? 1,
                status: "OPEN",
            },
        });
    }
    async updateJobStatus(id, status) {
        return this.prisma.client.jobOpening.update({
            where: { id },
            data: { status: status },
        });
    }
    // --- Candidates & Tracking ---
    async findCandidates(companyId, jobId) {
        return this.prisma.client.candidate.findMany({
            where: {
                jobOpening: { companyId },
                ...(jobId ? { jobOpeningId: jobId } : {}),
            },
            include: {
                jobOpening: { select: { title: true } },
                interviews: { orderBy: { scheduledAt: "desc" } },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async findCandidate(id) {
        const candidate = await this.prisma.client.candidate.findUnique({
            where: { id },
            include: {
                jobOpening: true,
                interviews: {
                    include: { interviewer: { select: { id: true, fullName: true, avatarUrl: true } } },
                    orderBy: { scheduledAt: "desc" },
                },
                offerLetter: true,
                onboarding: true,
            },
        });
        if (!candidate)
            throw new common_1.NotFoundException(`Candidate ${id} not found`);
        return candidate;
    }
    async createCandidate(dto) {
        return this.prisma.client.candidate.create({
            data: {
                jobOpeningId: dto.jobOpeningId,
                fullName: dto.fullName,
                email: dto.email,
                phone: dto.phone,
                resumeUrl: dto.resumeUrl,
                stage: "APPLIED",
            },
        });
    }
    async updateCandidateStage(id, stage) {
        return this.prisma.client.candidate.update({
            where: { id },
            data: { stage: stage },
        });
    }
    async scheduleInterview(candidateId, dto) {
        return this.prisma.client.interview.create({
            data: {
                candidateId,
                interviewerId: dto.interviewerId,
                scheduledAt: new Date(dto.scheduledAt),
                round: dto.round ?? "Technical Round",
            },
        });
    }
    async submitInterviewFeedback(interviewId, dto) {
        return this.prisma.client.interview.update({
            where: { id: interviewId },
            data: {
                feedback: dto.feedback,
                rating: dto.rating,
            },
        });
    }
    async createOnboardingChecklist(candidateId, items) {
        return this.prisma.client.onboardingChecklist.create({
            data: {
                candidateId,
                items,
            },
        });
    }
    async updateOnboardingChecklist(id, items, completedAt) {
        return this.prisma.client.onboardingChecklist.update({
            where: { id },
            data: {
                items,
                completedAt: completedAt ? new Date(completedAt) : undefined,
            },
        });
    }
};
exports.RecruitmentService = RecruitmentService;
exports.RecruitmentService = RecruitmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecruitmentService);
//# sourceMappingURL=recruitment.service.js.map