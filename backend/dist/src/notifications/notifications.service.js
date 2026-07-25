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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUser(userId) {
        return this.prisma.client.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.client.notification.findUnique({
            where: { id },
        });
        if (!notification || notification.userId !== userId) {
            throw new common_1.NotFoundException(`Notification ${id} not found`);
        }
        return this.prisma.client.notification.update({
            where: { id },
            data: { readAt: new Date() },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.client.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }
    async sendNotification(userId, type, title, body, linkUrl) {
        // 1. Fetch user's company defaults or user overrides
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { companyId: true, email: true },
        });
        if (!user)
            return null;
        // Fetch user preferences
        const preferences = await this.prisma.client.notificationPreference.findMany({
            where: { userId, type },
        });
        // Check if channels are enabled
        const channelsToSend = [];
        // Default channels
        const defaults = [client_1.NotificationChannel.IN_APP, client_1.NotificationChannel.EMAIL];
        for (const channel of Object.values(client_1.NotificationChannel)) {
            const pref = preferences.find((p) => p.channel === channel);
            if (pref) {
                if (pref.enabled)
                    channelsToSend.push(channel);
            }
            else if (defaults.includes(channel)) {
                channelsToSend.push(channel);
            }
        }
        // 2. Save Notification to DB (primarily for IN_APP channel)
        const notification = await this.prisma.client.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                linkUrl,
                channels: channelsToSend,
            },
        });
        // 3. Dispatch through selected channels
        for (const channel of channelsToSend) {
            if (channel === client_1.NotificationChannel.EMAIL) {
                this.dispatchEmail(user.email, title, body || "").catch((err) => console.error(`Failed to send email to ${user.email}:`, err));
            }
            else if (channel === client_1.NotificationChannel.PUSH) {
                console.log(`[PUSH NOTIFICATION] Sending to User: ${userId} - Title: ${title}`);
            }
        }
        return notification;
    }
    async dispatchEmail(email, subject, body) {
        // Simulate emailing / Resend dispatch
        console.log(`
============================================================
📧 [EMAIL DISPATCH via Resend Simulator]
To:      ${email}
Subject: ${subject}
Message: ${body}
============================================================
    `);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map