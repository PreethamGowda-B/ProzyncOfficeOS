import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        department: true,
        team: true,
        leaveBalance: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }
}
