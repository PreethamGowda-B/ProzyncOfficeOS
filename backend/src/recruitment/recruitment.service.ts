import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Job Openings ---
  async findJobs(companyId: string) {
    return this.prisma.client.jobOpening.findMany({
      where: { companyId },
      include: {
        department: { select: { name: true } },
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findJob(id: string) {
    const job = await this.prisma.client.jobOpening.findUnique({
      where: { id },
      include: {
        department: true,
        candidates: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!job) throw new NotFoundException(`Job opening ${id} not found`);
    return job;
  }

  async createJob(companyId: string, dto: { title: string; departmentId?: string; description: string; openings?: number }) {
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

  async updateJobStatus(id: string, status: string) {
    return this.prisma.client.jobOpening.update({
      where: { id },
      data: { status: status as any },
    });
  }

  // --- Candidates & Tracking ---
  async findCandidates(companyId: string, jobId?: string) {
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

  async findCandidate(id: string) {
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
    if (!candidate) throw new NotFoundException(`Candidate ${id} not found`);
    return candidate;
  }

  async createCandidate(dto: { jobOpeningId: string; fullName: string; email: string; phone?: string; resumeUrl?: string }) {
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

  async updateCandidateStage(id: string, stage: string) {
    return this.prisma.client.candidate.update({
      where: { id },
      data: { stage: stage as any },
    });
  }

  async scheduleInterview(candidateId: string, dto: { interviewerId: string; scheduledAt: string; round?: string }) {
    return this.prisma.client.interview.create({
      data: {
        candidateId,
        interviewerId: dto.interviewerId,
        scheduledAt: new Date(dto.scheduledAt),
        round: dto.round ?? "Technical Round",
      },
    });
  }

  async submitInterviewFeedback(interviewId: string, dto: { feedback: string; rating: number }) {
    return this.prisma.client.interview.update({
      where: { id: interviewId },
      data: {
        feedback: dto.feedback,
        rating: dto.rating,
      },
    });
  }

  async createOnboardingChecklist(candidateId: string, items: any[]) {
    return this.prisma.client.onboardingChecklist.create({
      data: {
        candidateId,
        items,
      },
    });
  }

  async updateOnboardingChecklist(id: string, items: any[], completedAt?: string) {
    return this.prisma.client.onboardingChecklist.update({
      where: { id },
      data: {
        items,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
    });
  }
}
