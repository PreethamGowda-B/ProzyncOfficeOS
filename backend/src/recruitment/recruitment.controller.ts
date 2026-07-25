import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from "@nestjs/common";
import { RecruitmentService } from "./recruitment.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("recruitment")
@UseGuards(JwtAuthGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get("jobs")
  findJobs(@CurrentUser() user: AuthenticatedUser) {
    return this.recruitmentService.findJobs(user.companyId);
  }

  @Get("jobs/:id")
  findJob(@Param("id") id: string) {
    return this.recruitmentService.findJob(id);
  }

  @Post("jobs")
  createJob(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.recruitmentService.createJob(user.companyId, dto);
  }

  @Patch("jobs/:id/status")
  updateJobStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.recruitmentService.updateJobStatus(id, status);
  }

  @Get("candidates")
  findCandidates(@CurrentUser() user: AuthenticatedUser, @Query("jobId") jobId?: string) {
    return this.recruitmentService.findCandidates(user.companyId, jobId);
  }

  @Get("candidates/:id")
  findCandidate(@Param("id") id: string) {
    return this.recruitmentService.findCandidate(id);
  }

  @Post("candidates")
  createCandidate(@Body() dto: any) {
    return this.recruitmentService.createCandidate(dto);
  }

  @Patch("candidates/:id/stage")
  updateCandidateStage(@Param("id") id: string, @Body("stage") stage: string) {
    return this.recruitmentService.updateCandidateStage(id, stage);
  }

  @Post("candidates/:id/interviews")
  scheduleInterview(@Param("id") candidateId: string, @Body() dto: any) {
    return this.recruitmentService.scheduleInterview(candidateId, dto);
  }

  @Patch("interviews/:id/feedback")
  submitFeedback(@Param("id") interviewId: string, @Body() dto: { feedback: string; rating: number }) {
    return this.recruitmentService.submitInterviewFeedback(interviewId, dto);
  }

  @Post("candidates/:id/onboarding")
  createOnboarding(@Param("id") candidateId: string, @Body("items") items: any[]) {
    return this.recruitmentService.createOnboardingChecklist(candidateId, items);
  }

  @Patch("onboarding/:id")
  updateOnboarding(@Param("id") id: string, @Body("items") items: any[], @Body("completedAt") completedAt?: string) {
    return this.recruitmentService.updateOnboardingChecklist(id, items, completedAt);
  }
}
