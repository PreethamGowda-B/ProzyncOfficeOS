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
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ApprovalsService = class ApprovalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMyPendingApprovals(userId) {
        return this.prisma.client.approvalRequest.findMany({
            where: {
                status: "PENDING",
                steps: {
                    some: {
                        approverId: userId,
                        status: "PENDING",
                    },
                },
            },
            include: {
                steps: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async findRequestDetails(id) {
        const request = await this.prisma.client.approvalRequest.findUnique({
            where: { id },
            include: {
                steps: true,
            },
        });
        if (!request)
            throw new common_1.NotFoundException(`Approval request ${id} not found`);
        return request;
    }
    async createApprovalRequest(companyId, type, entityType, entityId, requestedById) {
        // 1. Look up policy for the company and type
        const policy = await this.prisma.client.approvalPolicy.findUnique({
            where: { companyId_type: { companyId, type } },
        });
        const chain = policy?.approverRoleChain || [client_1.RoleName.HR_MANAGER]; // Default fallback to HR Manager
        // 2. Resolve specific users for each step in the chain
        const stepsData = [];
        let order = 1;
        for (const roleName of chain) {
            let approverId = null;
            if (roleName === client_1.RoleName.TEAM_LEAD) {
                // Resolve requester's team lead
                const requester = await this.prisma.client.user.findUnique({
                    where: { id: requestedById },
                    select: { teamId: true },
                });
                if (requester?.teamId) {
                    const team = await this.prisma.client.team.findUnique({
                        where: { id: requester.teamId },
                        select: { leadId: true },
                    });
                    approverId = team?.leadId || null;
                }
            }
            // If team lead not found, or it's a direct role matching
            if (!approverId) {
                const matchingUser = await this.prisma.client.user.findFirst({
                    where: {
                        companyId,
                        role: { name: roleName },
                        status: "ACTIVE",
                    },
                    select: { id: true },
                });
                approverId = matchingUser?.id || null;
            }
            // If we couldn't resolve any user, fallback to company super admin
            if (!approverId) {
                const adminUser = await this.prisma.client.user.findFirst({
                    where: {
                        companyId,
                        role: { name: client_1.RoleName.SUPER_ADMIN },
                    },
                    select: { id: true },
                });
                approverId = adminUser?.id || null;
            }
            if (approverId) {
                stepsData.push({
                    stepOrder: order++,
                    approverId,
                });
            }
        }
        // If chain is empty or resolved to no steps, auto-approve
        if (stepsData.length === 0) {
            const request = await this.prisma.client.approvalRequest.create({
                data: {
                    type,
                    entityType,
                    entityId,
                    requestedById,
                    status: "APPROVED",
                    resolvedAt: new Date(),
                },
            });
            await this.updateTargetEntityStatus(entityType, entityId, "APPROVED", requestedById);
            return request;
        }
        // Create the approval request and steps
        const request = await this.prisma.client.approvalRequest.create({
            data: {
                type,
                entityType,
                entityId,
                requestedById,
                status: "PENDING",
                currentStepOrder: 1,
                steps: {
                    create: stepsData.map((step) => ({
                        stepOrder: step.stepOrder,
                        approverId: step.approverId,
                        status: "PENDING",
                    })),
                },
            },
            include: {
                steps: true,
            },
        });
        return request;
    }
    async submitAction(requestId, userId, action, comment) {
        const request = await this.prisma.client.approvalRequest.findUnique({
            where: { id: requestId },
            include: { steps: true },
        });
        if (!request)
            throw new common_1.NotFoundException(`Approval request ${requestId} not found`);
        if (request.status !== "PENDING") {
            throw new common_1.BadRequestException(`Approval request is already resolved with status ${request.status}`);
        }
        // Find the current step
        const currentStep = request.steps.find((s) => s.stepOrder === request.currentStepOrder);
        if (!currentStep)
            throw new common_1.NotFoundException("Current approval step not found");
        // Verify authorization: is this user the assigned approver for this step?
        if (currentStep.approverId !== userId) {
            // Check if user is Super Admin as override
            const user = await this.prisma.client.user.findUnique({
                where: { id: userId },
                include: { role: true },
            });
            if (user?.role?.name !== client_1.RoleName.SUPER_ADMIN) {
                throw new common_1.BadRequestException("You are not authorized to act on this approval step");
            }
        }
        const stepStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
        // Update the step
        await this.prisma.client.approvalStep.update({
            where: { id: currentStep.id },
            data: {
                status: stepStatus,
                comment,
                actedAt: new Date(),
            },
        });
        if (action === "REJECT") {
            // Entire request is rejected
            const updatedRequest = await this.prisma.client.approvalRequest.update({
                where: { id: requestId },
                data: {
                    status: "REJECTED",
                    resolvedAt: new Date(),
                },
            });
            await this.updateTargetEntityStatus(request.entityType, request.entityId, "REJECTED", userId);
            return updatedRequest;
        }
        // It was approved. Is there a next step?
        const nextStep = request.steps.find((s) => s.stepOrder === request.currentStepOrder + 1);
        if (nextStep) {
            // Move to next step
            return this.prisma.client.approvalRequest.update({
                where: { id: requestId },
                data: {
                    currentStepOrder: request.currentStepOrder + 1,
                },
                include: { steps: true },
            });
        }
        else {
            // Final approval!
            const updatedRequest = await this.prisma.client.approvalRequest.update({
                where: { id: requestId },
                data: {
                    status: "APPROVED",
                    resolvedAt: new Date(),
                },
            });
            await this.updateTargetEntityStatus(request.entityType, request.entityId, "APPROVED", userId);
            return updatedRequest;
        }
    }
    async updateTargetEntityStatus(entityType, entityId, status, approverId) {
        if (entityType === "LeaveRequest") {
            await this.prisma.client.leaveRequest.update({
                where: { id: entityId },
                data: {
                    status: status === "APPROVED" ? "APPROVED" : "REJECTED",
                    approvedById: approverId,
                },
            });
        }
        // Note: Expense & Timesheet resolve status purely through the joined ApprovalRequest
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map