import { Controller, Get, Post, Param, Body, Query, Headers, UseGuards, UnauthorizedException } from "@nestjs/common";
import { GithubService } from "./github.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { createHmac, timingSafeEqual } from "crypto";

@Controller("github")
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get("repos")
  @UseGuards(JwtAuthGuard)
  findRepositories(@Query("projectId") projectId?: string) {
    return this.githubService.findRepositories(projectId);
  }

  @Get("repos/:id")
  @UseGuards(JwtAuthGuard)
  findRepository(@Param("id") id: string) {
    return this.githubService.findRepository(id);
  }

  @Post("repos/link")
  @UseGuards(JwtAuthGuard)
  linkRepository(@Body() dto: { projectId: string; githubRepoId: string; fullName: string; defaultBranch?: string }) {
    return this.githubService.linkRepository(dto.projectId, dto.githubRepoId, dto.fullName, dto.defaultBranch);
  }

  // --- GitHub Webhook Payload Endpoint ---
  @Post("webhook")
  async handleWebhook(
    @Headers("x-github-event") event: string,
    @Headers("x-hub-signature-256") signature: string,
    @Body() payload: any,
  ) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    
    // Verify Webhook signature if GITHUB_WEBHOOK_SECRET is configured
    if (secret && signature) {
      const hmac = createHmac("sha256", secret);
      const digest = "sha256=" + hmac.update(JSON.stringify(payload)).digest("hex");
      const sigBuffer = Buffer.from(signature);
      const digestBuffer = Buffer.from(digest);

      if (sigBuffer.length !== digestBuffer.length || !timingSafeEqual(sigBuffer, digestBuffer)) {
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    return this.githubService.handleWebhook(event, payload);
  }
}
