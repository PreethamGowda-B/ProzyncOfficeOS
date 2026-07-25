import { PrismaClient, RoleName, ProjectStatus, TaskStatus, TaskPriority, PointReason } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

async function main() {
  console.log("🌱 Starting production database seed for Prozync OfficeOS...");

  // 1. Company Root
  const company = await prisma.company.upsert({
    where: { id: "prozync-innovations" },
    update: {
      name: "Prozync Innovations",
      timezone: "Asia/Kolkata",
      workingHoursStart: "09:30",
      workingHoursEnd: "18:30",
    },
    create: {
      id: "prozync-innovations",
      name: "Prozync Innovations",
      timezone: "Asia/Kolkata",
      workingHoursStart: "09:30",
      workingHoursEnd: "18:30",
      theme: {
        primaryColor: "#38bdf8",
        darkMode: true,
      },
    },
  });
  console.log(`✅ Company set: ${company.name}`);

  // 2. RBAC Roles (All 14 roles)
  for (const roleName of Object.values(RoleName)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const roleMap: Record<string, string> = {};
  for (const roleName of Object.values(RoleName)) {
    const r = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    roleMap[roleName] = r.id;
  }
  console.log(`✅ 14 RBAC Roles verified.`);

  // 3. Departments
  const deptEng = await prisma.department.upsert({
    where: { id: "dept-engineering" },
    update: {},
    create: { id: "dept-engineering", companyId: company.id, name: "Engineering" },
  });

  const deptDesign = await prisma.department.upsert({
    where: { id: "dept-design" },
    update: {},
    create: { id: "dept-design", companyId: company.id, name: "Design" },
  });

  const deptSales = await prisma.department.upsert({
    where: { id: "dept-sales" },
    update: {},
    create: { id: "dept-sales", companyId: company.id, name: "Sales & Marketing" },
  });

  const deptHR = await prisma.department.upsert({
    where: { id: "dept-hr" },
    update: {},
    create: { id: "dept-hr", companyId: company.id, name: "Human Resources" },
  });

  const deptFinance = await prisma.department.upsert({
    where: { id: "dept-finance" },
    update: {},
    create: { id: "dept-finance", companyId: company.id, name: "Finance & Accounting" },
  });
  console.log(`✅ 5 Core Departments created.`);

  // 4. Users (Team Members)
  const defaultPass = hashPassword(process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeMe123!");

  // Founder & CEO (Super Admin)
  const founder = await prisma.user.upsert({
    where: { email: "founder@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "founder@prozync.com",
      passwordHash: defaultPass,
      fullName: "Preetham Gowda B",
      displayName: "Mr. Preethu Gowda",
      roleId: roleMap[RoleName.SUPER_ADMIN],
      departmentId: deptEng.id,
      status: "ACTIVE",
    },
  });

  // CTO / Lead Architect
  const cto = await prisma.user.upsert({
    where: { email: "rajesh.v@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "rajesh.v@prozync.com",
      passwordHash: defaultPass,
      fullName: "Rajesh Verma",
      displayName: "Rajesh V.",
      roleId: roleMap[RoleName.COMPANY_ADMIN],
      departmentId: deptEng.id,
      status: "ACTIVE",
    },
  });

  // Tech Lead
  const lead = await prisma.user.upsert({
    where: { email: "ananya.s@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "ananya.s@prozync.com",
      passwordHash: defaultPass,
      fullName: "Ananya Sharma",
      displayName: "Ananya (Lead)",
      roleId: roleMap[RoleName.TEAM_LEAD],
      departmentId: deptEng.id,
      status: "ACTIVE",
    },
  });

  // Senior Frontend Dev
  const frontendDev = await prisma.user.upsert({
    where: { email: "rohan.m@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "rohan.m@prozync.com",
      passwordHash: defaultPass,
      fullName: "Rohan Mehta",
      displayName: "Rohan (Frontend)",
      roleId: roleMap[RoleName.DEVELOPER],
      departmentId: deptEng.id,
      status: "ACTIVE",
    },
  });

  // Senior Backend Dev
  const backendDev = await prisma.user.upsert({
    where: { email: "vikram.p@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "vikram.p@prozync.com",
      passwordHash: defaultPass,
      fullName: "Vikram Patel",
      displayName: "Vikram (Backend)",
      roleId: roleMap[RoleName.DEVELOPER],
      departmentId: deptEng.id,
      status: "ACTIVE",
    },
  });

  // UI/UX Designer
  const designer = await prisma.user.upsert({
    where: { email: "sneha.r@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "sneha.r@prozync.com",
      passwordHash: defaultPass,
      fullName: "Sneha Rao",
      displayName: "Sneha (UI/UX)",
      roleId: roleMap[RoleName.UI_UX_DESIGNER],
      departmentId: deptDesign.id,
      status: "ACTIVE",
    },
  });

  // QA Lead
  const qa = await prisma.user.upsert({
    where: { email: "manoj.g@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "manoj.g@prozync.com",
      passwordHash: defaultPass,
      fullName: "Manoj Gowda",
      displayName: "Manoj (QA)",
      roleId: roleMap[RoleName.QA_ENGINEER],
      departmentId: deptEng.id,
      status: "ACTIVE",
    },
  });

  // HR Manager
  const hr = await prisma.user.upsert({
    where: { email: "priya.n@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "priya.n@prozync.com",
      passwordHash: defaultPass,
      fullName: "Priya Nair",
      displayName: "Priya (HR)",
      roleId: roleMap[RoleName.HR_MANAGER],
      departmentId: deptHR.id,
      status: "ACTIVE",
    },
  });

  // Finance Manager
  const finance = await prisma.user.upsert({
    where: { email: "suresh.h@prozync.com" },
    update: {},
    create: {
      companyId: company.id,
      email: "suresh.h@prozync.com",
      passwordHash: defaultPass,
      fullName: "Suresh Hegde",
      displayName: "Suresh (Finance)",
      roleId: roleMap[RoleName.FINANCE],
      departmentId: deptFinance.id,
      status: "ACTIVE",
    },
  });
  console.log(`✅ 9 Real Users created with hashed credentials.`);

  // 5. Teams
  const teamBackend = await prisma.team.upsert({
    where: { id: "team-backend" },
    update: { leadId: backendDev.id },
    create: {
      id: "team-backend",
      name: "Backend Core Team",
      leadId: backendDev.id,
    },
  });

  const teamFrontend = await prisma.team.upsert({
    where: { id: "team-frontend" },
    update: { leadId: frontendDev.id },
    create: {
      id: "team-frontend",
      name: "Frontend Experience Team",
      leadId: frontendDev.id,
    },
  });

  const teamDesign = await prisma.team.upsert({
    where: { id: "team-design" },
    update: { leadId: designer.id },
    create: {
      id: "team-design",
      name: "Product Design Team",
      leadId: designer.id,
    },
  });

  // Assign teams to users
  await prisma.user.update({ where: { id: backendDev.id }, data: { teamId: teamBackend.id } });
  await prisma.user.update({ where: { id: frontendDev.id }, data: { teamId: teamFrontend.id } });
  await prisma.user.update({ where: { id: designer.id }, data: { teamId: teamDesign.id } });
  await prisma.user.update({ where: { id: lead.id }, data: { teamId: teamBackend.id } });
  console.log(`✅ 3 Functional Teams created & assigned.`);

  // 6. Clients & CRM Leads/Deals
  const clientAcme = await prisma.client.upsert({
    where: { id: "client-acme" },
    update: {},
    create: {
      id: "client-acme",
      companyId: company.id,
      companyName: "Acme Corporation",
      contactEmail: "contact@acme.com",
      contactPhone: "+1 555-0199",
      stage: "ACTIVE",
    },
  });

  const clientKamadhenu = await prisma.client.upsert({
    where: { id: "client-kamadhenu" },
    update: {},
    create: {
      id: "client-kamadhenu",
      companyId: company.id,
      companyName: "Kamadhenu Honey Farms",
      contactEmail: "support@kamadhenuhoney.com",
      contactPhone: "+91 98765 12345",
      stage: "ACTIVE",
    },
  });

  const leadApex = await prisma.lead.upsert({
    where: { id: "lead-apex" },
    update: {},
    create: {
      id: "lead-apex",
      companyId: company.id,
      ownerId: founder.id,
      contactName: "Vikram Malhotra",
      email: "vikram@apexlogistics.com",
      companyName: "Apex Logistics Global",
      source: "REFERRAL",
      status: "QUALIFIED",
    },
  });

  await prisma.deal.upsert({
    where: { id: "deal-smarterp-apex" },
    update: {},
    create: {
      id: "deal-smarterp-apex",
      companyId: company.id,
      ownerId: founder.id,
      leadId: leadApex.id,
      title: "Apex Logistics ERP Deployment",
      value: 45000,
      stage: "PROPOSAL_SENT",
    },
  });
  console.log(`✅ Clients & CRM Leads/Deals seeded.`);

  // 7. Projects
  const projSmartERP = await prisma.project.upsert({
    where: { id: "proj-smarterp" },
    update: {},
    create: {
      id: "proj-smarterp",
      companyId: company.id,
      clientId: clientAcme.id,
      name: "SmartERP Monolith to Microservices",
      description: "Enterprise Multi-Tenant ERP System with accounting, inventory, and analytics.",
      status: ProjectStatus.DEVELOPMENT,
      startDate: new Date("2026-01-15"),
      managerId: lead.id,
    },
  });

  const projHoney = await prisma.project.upsert({
    where: { id: "proj-kamadhenu" },
    update: {},
    create: {
      id: "proj-kamadhenu",
      companyId: company.id,
      clientId: clientKamadhenu.id,
      name: "Kamadhenu Honey E-Commerce Platform",
      description: "Direct-to-consumer organic honey storefront with online ordering.",
      status: ProjectStatus.DEVELOPMENT,
      startDate: new Date("2026-02-01"),
      managerId: lead.id,
    },
  });

  const projOfficeOS = await prisma.project.upsert({
    where: { id: "proj-officeos" },
    update: {},
    create: {
      id: "proj-officeos",
      companyId: company.id,
      name: "Prozync OfficeOS Platform v1.0",
      description: "Internal company Operating System for Prozync Innovations.",
      status: ProjectStatus.DEVELOPMENT,
      startDate: new Date("2026-03-10"),
      managerId: founder.id,
    },
  });
  console.log(`✅ 3 Real Projects created.`);

  // 8. Tasks with Priorities
  const tasks = [
    {
      id: "task-101",
      projectId: projOfficeOS.id,
      title: "Implement RBAC Permission Guards in NestJS API",
      description: "Ensure role-based permission checks and row-level scoping work across all endpoints.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: backendDev.id,
      creatorId: founder.id,
    },
    {
      id: "task-102",
      projectId: projOfficeOS.id,
      title: "Design Responsive Dashboard Sidebar with Tailwind CSS",
      description: "Craft a glassmorphic sidebar supporting light/dark theme toggles in Next.js 14.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      assigneeId: frontendDev.id,
      creatorId: lead.id,
    },
    {
      id: "task-103",
      projectId: projSmartERP.id,
      title: "Multi-Tenant Database Isolation Audit",
      description: "Audit all Prisma queries to verify companyId is enforced on root aggregates.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      assigneeId: backendDev.id,
      creatorId: cto.id,
    },
    {
      id: "task-104",
      projectId: projHoney.id,
      title: "Checkout Flow & Payment Gateway UI Design",
      description: "Figma mockup and responsive UI implementation for honey product purchasing.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: designer.id,
      creatorId: lead.id,
    },
    {
      id: "task-105",
      projectId: projOfficeOS.id,
      title: "Automated Integration Test Suite for Auth Module",
      description: "Write Jest tests covering login, token refresh, and invalid credential scenarios.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      assigneeId: qa.id,
      creatorId: lead.id,
    },
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId,
        creatorId: t.creatorId,
      },
    });
  }
  console.log(`✅ 5 Real Sprint Tasks seeded.`);

  // 9. Daily Updates & Points Ledger
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyUpdate.upsert({
    where: { userId_date: { userId: frontendDev.id, date: today } },
    update: {},
    create: {
      userId: frontendDev.id,
      date: today,
      completedItems: ["Finished responsive dashboard sidebar", "Verified Next.js static build"],
      plannedItems: ["Implement real-time WebSocket chat interface component"],
    },
  });

  await prisma.dailyUpdate.upsert({
    where: { userId_date: { userId: backendDev.id, date: today } },
    update: {},
    create: {
      userId: backendDev.id,
      date: today,
      completedItems: ["Completed RBAC Guards and verified Prisma database push"],
      plannedItems: ["Audit Multi-Tenant queries for SmartERP microservices"],
    },
  });

  // Points Ledger Entry
  await prisma.pointsLedgerEntry.createMany({
    data: [
      { userId: frontendDev.id, points: 15, reason: PointReason.TASK_COMPLETED, note: "Completed Task #102: Responsive Sidebar" },
      { userId: backendDev.id, points: 20, reason: PointReason.TASK_COMPLETED, note: "Completed Task #101: RBAC Guards & Audit Interceptor" },
      { userId: designer.id, points: 10, reason: PointReason.DAILY_UPDATE_SUBMITTED, note: "Submitted daily update & design kit" },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Daily Updates & Points Ledger seeded.`);

  // 10. Chat Channels & Announcements
  await prisma.chatChannel.upsert({
    where: { id: "channel-general" },
    update: {},
    create: { id: "channel-general", companyId: company.id, name: "general", type: "COMPANY" },
  });

  await prisma.chatChannel.upsert({
    where: { id: "channel-engineering" },
    update: {},
    create: { id: "channel-engineering", companyId: company.id, name: "engineering", type: "COMPANY" },
  });

  await prisma.announcement.upsert({
    where: { id: "ann-welcome" },
    update: {},
    create: {
      id: "ann-welcome",
      companyId: company.id,
      postedById: founder.id,
      title: "Welcome to Prozync OfficeOS 🚀",
      body: "Welcome team to Prozync OfficeOS! Our internal platform is live for managing projects, tasks, CRM, HR, and daily update leaderboards.",
      audience: "company",
    },
  });

  // 11. Knowledge Base Articles
  await prisma.knowledgeBaseArticle.upsert({
    where: { id: "kb-git-workflow" },
    update: {},
    create: {
      id: "kb-git-workflow",
      companyId: company.id,
      createdById: cto.id,
      title: "Prozync Innovations Git & Branching Strategy",
      content: "All features must be developed on feature/ branches off 'develop'. Pull requests require 1 approval and clean build status before merging to main.",
      category: "Engineering Guidelines",
    },
  });

  await prisma.knowledgeBaseArticle.upsert({
    where: { id: "kb-onboarding" },
    update: {},
    create: {
      id: "kb-onboarding",
      companyId: company.id,
      createdById: hr.id,
      title: "New Employee Onboarding Guide",
      content: "Welcome to Prozync Innovations! Complete your user profile, join company OfficeOS channels, and review department OKRs.",
      category: "Human Resources",
    },
  });
  console.log(`✅ Chat Channels, Announcements & Knowledge Base articles seeded.`);

  console.log("\n🎉 Prozync OfficeOS Database Seed Complete!");
  console.log("--------------------------------------------------");
  console.log("Super Admin Login: founder@prozync.com");
  console.log("Password: ChangeMe123!");
  console.log("--------------------------------------------------");
}

main()
  .catch((err) => {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
