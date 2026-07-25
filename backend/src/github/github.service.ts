import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GithubService {
  constructor(private readonly prisma: PrismaService) {}

  async findRepositories(projectId?: string) {
    return this.prisma.client.repository.findMany({
      where: projectId ? { projectId } : {},
      include: {
        _count: { select: { pullRequests: true, commits: true, branches: true, deployments: true } },
      },
      orderBy: { fullName: "asc" },
    });
  }

  async findRepository(id: string) {
    const repo = await this.prisma.client.repository.findUnique({
      where: { id },
      include: {
        pullRequests: { orderBy: { openedAt: "desc" }, take: 10 },
        commits: { orderBy: { committedAt: "desc" }, take: 20 },
        branches: true,
        deployments: {
          include: { buildLogs: true },
          orderBy: { deployedAt: "desc" },
          take: 5,
        },
      },
    });
    if (!repo) throw new NotFoundException(`Repository ${id} not found`);
    return repo;
  }

  async linkRepository(projectId: string, githubRepoId: string, fullName: string, defaultBranch = "main") {
    return this.prisma.client.repository.upsert({
      where: { githubRepoId },
      create: { projectId, githubRepoId, fullName, defaultBranch },
      update: { projectId },
    });
  }

  // --- Webhook Handling ---
  async handleWebhook(event: string, payload: any) {
    if (event === "ping") {
      return { success: true, event: "ping" };
    }

    if (event === "push") {
      const repoIdStr = String(payload.repository.id);
      const repo = await this.prisma.client.repository.findUnique({ where: { githubRepoId: repoIdStr } });
      if (!repo) return { success: false, reason: "Repository not tracked" };

      // Process commits
      const commits = payload.commits || [];
      const createCommits = commits.map((c: any) =>
        this.prisma.client.commit.upsert({
          where: { repositoryId_sha: { repositoryId: repo.id, sha: c.id } },
          create: {
            repositoryId: repo.id,
            sha: c.id,
            message: c.message,
            authorGithubUsername: c.author?.username,
            committedAt: new Date(c.timestamp),
          },
          update: {
            message: c.message,
          },
        }),
      );
      await this.prisma.client.$transaction(createCommits);
      return { success: true, processedCommits: commits.length };
    }

    if (event === "pull_request") {
      const repoIdStr = String(payload.repository.id);
      const repo = await this.prisma.client.repository.findUnique({ where: { githubRepoId: repoIdStr } });
      if (!repo) return { success: false, reason: "Repository not tracked" };

      const pr = payload.pull_request;
      const statusMap: Record<string, string> = {
        open: "OPEN",
        closed: pr.merged ? "MERGED" : "CLOSED",
      };

      await this.prisma.client.pullRequest.upsert({
        where: { repositoryId_githubPrNumber: { repositoryId: repo.id, githubPrNumber: pr.number } },
        create: {
          repositoryId: repo.id,
          githubPrNumber: pr.number,
          title: pr.title,
          authorGithubUsername: pr.user?.login,
          status: (statusMap[pr.state] ?? "OPEN") as any,
          url: pr.html_url,
          openedAt: new Date(pr.created_at),
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
        },
        update: {
          title: pr.title,
          status: (statusMap[pr.state] ?? "OPEN") as any,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
        },
      });

      return { success: true, prNumber: pr.number };
    }

    if (event === "deployment") {
      // Mocking/upserting deployments via Webhook
      const repoIdStr = String(payload.repository.id);
      const repo = await this.prisma.client.repository.findUnique({ where: { githubRepoId: repoIdStr } });
      if (!repo) return { success: false, reason: "Repository not tracked" };

      const depl = payload.deployment;
      const deployment = await this.prisma.client.deployment.create({
        data: {
          repositoryId: repo.id,
          environment: depl.environment ?? "production",
          status: "PENDING",
        },
      });

      return { success: true, deploymentId: deployment.id };
    }

    return { success: true, unhandledEvent: event };
  }
}
