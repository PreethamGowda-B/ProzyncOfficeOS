import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all employees — optionally scoped by department or team */
  async findAll(filters: { departmentId?: string; teamId?: string; search?: string } = {}) {
    const { departmentId, teamId, search } = filters;

    return this.prisma.client.user.findMany({
      where: {
        AND: [
          departmentId ? { departmentId } : {},
          teamId ? { teamId } : {},
          search
            ? {
                OR: [
                  { fullName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { displayName: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      include: {
        role: { select: { name: true } },
        department: { select: { name: true } },
        team: { select: { name: true } },
        profile: { select: { skills: true, experienceYears: true } },
      },
      orderBy: { fullName: "asc" },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
        team: true,
        profile: true,
        equipmentIssued: true,
        promotionHistory: { orderBy: { effectiveDate: "desc" } },
        performanceReviews: {
          where: { subjectId: id },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        leaveBalance: true,
        salaryDetails: {
          orderBy: { effectiveFrom: "desc" },
          take: 1,
        },
      },
    });

    if (!user) throw new NotFoundException(`Employee ${id} not found`);
    return user;
  }

  async updateProfile(
    id: string,
    dto: {
      displayName?: string;
      phone?: string;
      bio?: string;
      skills?: string[];
      experienceYears?: number;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      emergencyContactRelation?: string;
    },
  ) {
    const { displayName, phone, bio, skills, experienceYears, ...emergencyFields } = dto;

    // Update base user
    if (displayName !== undefined || phone !== undefined) {
      await this.prisma.client.user.update({
        where: { id },
        data: {
          ...(displayName !== undefined ? { displayName } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });
    }

    // Upsert EmployeeProfile
    const profileData = {
      ...(bio !== undefined ? { bio } : {}),
      ...(skills !== undefined ? { skills } : {}),
      ...(experienceYears !== undefined ? { experienceYears } : {}),
      ...(emergencyFields.emergencyContactName !== undefined ? { emergencyContactName: emergencyFields.emergencyContactName } : {}),
      ...(emergencyFields.emergencyContactPhone !== undefined ? { emergencyContactPhone: emergencyFields.emergencyContactPhone } : {}),
      ...(emergencyFields.emergencyContactRelation !== undefined ? { emergencyContactRelation: emergencyFields.emergencyContactRelation } : {}),
    };

    if (Object.keys(profileData).length > 0) {
      await this.prisma.client.employeeProfile.upsert({
        where: { userId: id },
        update: profileData,
        create: { userId: id, ...profileData },
      });
    }

    return this.findOne(id);
  }

  async getMe(userId: string) {
    return this.findOne(userId);
  }
}
