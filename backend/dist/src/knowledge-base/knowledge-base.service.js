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
exports.KnowledgeBaseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let KnowledgeBaseService = class KnowledgeBaseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findArticles(companyId, category, search) {
        return this.prisma.client.knowledgeBaseArticle.findMany({
            where: {
                companyId,
                ...(category ? { category } : {}),
                ...(search
                    ? {
                        OR: [
                            { title: { contains: search, mode: "insensitive" } },
                            { content: { contains: search, mode: "insensitive" } },
                            { tags: { has: search } },
                        ],
                    }
                    : {}),
            },
            orderBy: { updatedAt: "desc" },
        });
    }
    async findArticle(id) {
        const article = await this.prisma.client.knowledgeBaseArticle.findUnique({
            where: { id },
        });
        if (!article)
            throw new common_1.NotFoundException(`Knowledge base article ${id} not found`);
        return article;
    }
    async createArticle(companyId, createdById, dto) {
        return this.prisma.client.knowledgeBaseArticle.create({
            data: {
                companyId,
                createdById,
                title: dto.title,
                category: dto.category,
                content: dto.content,
                tags: dto.tags ?? [],
            },
        });
    }
    async updateArticle(id, dto) {
        return this.prisma.client.knowledgeBaseArticle.update({
            where: { id },
            data: dto,
        });
    }
    async deleteArticle(id) {
        return this.prisma.client.knowledgeBaseArticle.delete({
            where: { id },
        });
    }
    // --- Training Videos ---
    async findVideos() {
        return this.prisma.client.trainingVideo.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async createVideo(dto) {
        return this.prisma.client.trainingVideo.create({
            data: dto,
        });
    }
};
exports.KnowledgeBaseService = KnowledgeBaseService;
exports.KnowledgeBaseService = KnowledgeBaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KnowledgeBaseService);
//# sourceMappingURL=knowledge-base.service.js.map