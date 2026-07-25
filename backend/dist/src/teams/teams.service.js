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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeamsService = class TeamsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.client.team.findMany({
            include: {
                lead: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
                _count: { select: { members: true, projects: true } },
            },
            orderBy: { name: "asc" },
        });
    }
    async findOne(id) {
        const team = await this.prisma.client.team.findUnique({
            where: { id },
            include: {
                lead: { include: { role: { select: { name: true } } } },
                members: {
                    include: { role: { select: { name: true } }, department: { select: { name: true } } },
                    orderBy: { fullName: "asc" },
                },
                projects: { orderBy: { createdAt: "desc" }, take: 10 },
            },
        });
        if (!team)
            throw new common_1.NotFoundException(`Team ${id} not found`);
        return team;
    }
    async create(name, leadId) {
        return this.prisma.client.team.create({
            data: { name, leadId },
        });
    }
    async update(id, dto) {
        return this.prisma.client.team.update({
            where: { id },
            data: dto,
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map