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
exports.GithubService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GithubService = class GithubService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findRepositories(projectId) {
        return this.prisma.client.repository.findMany({
            where: projectId ? { projectId } : {},
            include: {
                _count: { select: { pullRequests: true, commits: true, branches: true, deployments: true } },
            },
            orderBy: { fullName: "asc" },
        });
    }
    async findRepository(id) {
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
        if (!repo)
            throw new common_1.NotFoundException(`Repository ${id} not found`);
        return repo;
    }
    async linkRepository(projectId, githubRepoId, fullName, defaultBranch = "main") {
        return this.prisma.client.repository.upsert({
            where: { githubRepoId },
            create: { projectId, githubRepoId, fullName, defaultBranch },
            update: { projectId },
        });
    }
    // --- Webhook Handling ---
    async handleWebhook(event, payload) {
        if (event === "ping") {
            return { success: true, event: "ping" };
        }
        if (event === "push") {
            const repoIdStr = String(payload.repository.id);
            const repo = await this.prisma.client.repository.findUnique({ where: { githubRepoId: repoIdStr } });
            if (!repo)
                return { success: false, reason: "Repository not tracked" };
            // Process commits
            const commits = payload.commits || [];
            const createCommits = commits.map((c) => this.prisma.client.commit.upsert({
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
            }));
            await this.prisma.client.$transaction(createCommits);
            return { success: true, processedCommits: commits.length };
        }
        if (event === "pull_request") {
            const repoIdStr = String(payload.repository.id);
            const repo = await this.prisma.client.repository.findUnique({ where: { githubRepoId: repoIdStr } });
            if (!repo)
                return { success: false, reason: "Repository not tracked" };
            const pr = payload.pull_request;
            const statusMap = {
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
                    status: (statusMap[pr.state] ?? "OPEN"),
                    url: pr.html_url,
                    openedAt: new Date(pr.created_at),
                    mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
                    closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
                },
                update: {
                    title: pr.title,
                    status: (statusMap[pr.state] ?? "OPEN"),
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
            if (!repo)
                return { success: false, reason: "Repository not tracked" };
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
};
exports.GithubService = GithubService;
exports.GithubService = GithubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GithubService);
//# sourceMappingURL=github.service.js.map