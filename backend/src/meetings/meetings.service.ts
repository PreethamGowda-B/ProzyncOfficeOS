import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUpcoming(userId: string) {
    return this.prisma.client.meeting.findMany({
      where: {
        OR: [
          { organizerId: userId },
          { attendees: { some: { userId } } },
        ],
        scheduledAt: { gte: new Date() },
      },
      include: {
        organizer: { select: { id: true, fullName: true, avatarUrl: true } },
        attendees: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
      },
      orderBy: { scheduledAt: "asc" },
    });
  }

  async create(organizerId: string, dto: { title: string; scheduledAt: string; durationMinutes?: number; meetingLink?: string; attendeeIds?: string[] }) {
    const meeting = await this.prisma.client.meeting.create({
      data: {
        title: dto.title,
        organizerId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes ?? 30,
        meetingLink: dto.meetingLink,
      },
    });

    if (dto.attendeeIds && dto.attendeeIds.length > 0) {
      const attendees = dto.attendeeIds.map((userId) => ({
        meetingId: meeting.id,
        userId,
      }));
      await this.prisma.client.meetingAttendee.createMany({ data: attendees });
    }

    return meeting;
  }

  async updateAttendance(meetingId: string, userId: string, attended: boolean) {
    const record = await this.prisma.client.meetingAttendee.findUnique({
      where: { meetingId_userId: { meetingId, userId } },
    });

    if (!record) throw new NotFoundException("Attendee registration not found for this meeting");

    const updated = await this.prisma.client.meetingAttendee.update({
      where: { id: record.id },
      data: { attended },
    });

    // Deduct -2 points if they missed the meeting
    if (!attended) {
      await this.prisma.client.pointsLedgerEntry.create({
        data: {
          userId,
          reason: "MISSED_MEETING",
          points: -2,
          referenceType: "Meeting",
          referenceId: meetingId,
        },
      });
    }

    return updated;
  }
}
