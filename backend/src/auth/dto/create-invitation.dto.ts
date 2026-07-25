import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { RoleName } from "@prisma/client";

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsEnum(RoleName)
  roleName!: RoleName;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;
}
