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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findChannels(companyId) {
        return this.prisma.client.chatChannel.findMany({
            where: { companyId },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOrCreateDirectChannel(companyId, userA, userB) {
        // Look for existing direct channel where both participated
        // To simplify: we find any direct channel and filters in app code,
        // or search by a standard name pattern e.g. "direct:userA:userB"
        const channelName1 = `dm:${userA}:${userB}`;
        const channelName2 = `dm:${userB}:${userA}`;
        const existing = await this.prisma.client.chatChannel.findFirst({
            where: {
                companyId,
                type: "DIRECT",
                OR: [
                    { name: channelName1 },
                    { name: channelName2 },
                ],
            },
        });
        if (existing)
            return existing;
        return this.prisma.client.chatChannel.create({
            data: {
                companyId,
                type: "DIRECT",
                name: channelName1,
            },
        });
    }
    async createChannel(companyId, type, name, teamId) {
        return this.prisma.client.chatChannel.create({
            data: {
                companyId,
                type: type,
                name,
                teamId,
            },
        });
    }
    async findMessages(channelId, limit = 50) {
        return this.prisma.client.chatMessage.findMany({
            where: { channelId },
            include: {
                sender: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
                senderClient: { select: { id: true, companyName: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async postMessage(channelId, body, attachmentUrl, senderUserId, senderClientId) {
        return this.prisma.client.chatMessage.create({
            data: {
                channelId,
                body,
                attachmentUrl,
                senderUserId,
                senderClientId,
            },
            include: {
                sender: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
                senderClient: { select: { id: true, companyName: true } },
            },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map