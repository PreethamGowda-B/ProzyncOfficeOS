import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("employees")
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /** GET /employees — list employees with optional filters */
  @Get()
  findAll(
    @Query("departmentId") departmentId?: string,
    @Query("teamId") teamId?: string,
    @Query("search") search?: string,
  ) {
    return this.employeesService.findAll({ departmentId, teamId, search });
  }

  /** GET /employees/me — current user's full profile (same as /users/me but richer) */
  @Get("me")
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.employeesService.getMe(user.id);
  }

  /** GET /employees/:id — single employee */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.employeesService.findOne(id);
  }

  /** PATCH /employees/:id — update profile / skills / emergency contact */
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body()
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
    return this.employeesService.updateProfile(id, dto);
  }
}
