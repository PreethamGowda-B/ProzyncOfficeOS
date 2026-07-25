import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApprovalType, ApprovalStatus, RoleName } from "@prisma/client";

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyPendingApprovals(userId: string) {
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

  async findRequestDetails(id: string) {
    const request = await this.prisma.client.approvalRequest.findUnique({
      where: { id },
      include: {
        steps: true,
      },
    });
    if (!request) throw new NotFoundException(`Approval request ${id} not found`);
    return request;
  }

  async createApprovalRequest(
    companyId: string,
    type: ApprovalType,
    entityType: string,
    entityId: string,
    requestedById: string,
  ) {
    // 1. Look up policy for the company and type
    const policy = await this.prisma.client.approvalPolicy.findUnique({
      where: { companyId_type: { companyId, type } },
    });

    const chain = policy?.approverRoleChain || [RoleName.HR_MANAGER]; // Default fallback to HR Manager

    // 2. Resolve specific users for each step in the chain
    const stepsData: Array<{ stepOrder: number; approverId: string }> = [];
    let order = 1;

    for (const roleName of chain) {
      let approverId: string | null = null;

      if (roleName === RoleName.TEAM_LEAD) {
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
            role: { name: RoleName.SUPER_ADMIN },
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

  async submitAction(requestId: string, userId: string, action: "APPROVE" | "REJECT", comment?: string) {
    const request = await this.prisma.client.approvalRequest.findUnique({
      where: { id: requestId },
      include: { steps: true },
    });

    if (!request) throw new NotFoundException(`Approval request ${requestId} not found`);
    if (request.status !== "PENDING") {
      throw new BadRequestException(`Approval request is already resolved with status ${request.status}`);
    }

    // Find the current step
    const currentStep = request.steps.find((s) => s.stepOrder === request.currentStepOrder);
    if (!currentStep) throw new NotFoundException("Current approval step not found");

    // Verify authorization: is this user the assigned approver for this step?
    if (currentStep.approverId !== userId) {
      // Check if user is Super Admin as override
      const user = await this.prisma.client.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
      if (user?.role?.name !== RoleName.SUPER_ADMIN) {
        throw new BadRequestException("You are not authorized to act on this approval step");
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
    } else {
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

  private async updateTargetEntityStatus(entityType: string, entityId: string, status: "APPROVED" | "REJECTED", approverId: string) {
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
}
