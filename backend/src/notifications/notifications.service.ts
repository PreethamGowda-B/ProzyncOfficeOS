import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationType, NotificationChannel } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.client.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return this.prisma.client.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.client.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    linkUrl?: string,
  ) {
    // 1. Fetch user's company defaults or user overrides
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { companyId: true, email: true },
    });
    if (!user) return null;

    // Fetch user preferences
    const preferences = await this.prisma.client.notificationPreference.findMany({
      where: { userId, type },
    });

    // Check if channels are enabled
    const channelsToSend: NotificationChannel[] = [];

    // Default channels
    const defaults: NotificationChannel[] = [NotificationChannel.IN_APP, NotificationChannel.EMAIL];

    for (const channel of Object.values(NotificationChannel)) {
      const pref = preferences.find((p) => p.channel === channel);
      if (pref) {
        if (pref.enabled) channelsToSend.push(channel);
      } else if (defaults.includes(channel)) {
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
      if (channel === NotificationChannel.EMAIL) {
        this.dispatchEmail(user.email, title, body || "").catch((err) =>
          console.error(`Failed to send email to ${user.email}:`, err),
        );
      } else if (channel === NotificationChannel.PUSH) {
        console.log(`[PUSH NOTIFICATION] Sending to User: ${userId} - Title: ${title}`);
      }
    }

    return notification;
  }

  private async dispatchEmail(email: string, subject: string, body: string) {
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
}
