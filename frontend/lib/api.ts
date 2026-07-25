const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  if (_accessToken) return _accessToken;
  return window.sessionStorage.getItem("officeos_at");
}

export function setAccessToken(token: string) {
  _accessToken = token;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("officeos_at", token);
  }
}

export function clearAccessToken() {
  _accessToken = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("officeos_at");
  }
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && path !== "/auth/refresh") {
    try {
      const refreshData = await request<{ accessToken: string }>("/auth/refresh", { method: "POST" });
      setAccessToken(refreshData.accessToken);
      return request<T>(path, options);
    } catch {
      clearAccessToken();
      if (typeof window !== "undefined") window.location.replace("/");
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ─── Response types ────────────────────────────────────────────────────────
export interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; fullName: string; role: string };
}

export interface UserProfile {
  id: string;
  fullName: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  role: { name: string };
  department: { name: string } | null;
  team: { name: string } | null;
  status: string;
  employmentType: string | null;
  joiningDate: string | null;
  profile: {
    skills: string[];
    experienceYears: number | null;
    bio: string | null;
  } | null;
  leaveBalance: { sick: number; casual: number; earned: number } | null;
}

export interface Employee extends UserProfile {
  promotionHistory: Array<{ fromTitle: string; toTitle: string; effectiveDate: string }>;
  performanceReviews: Array<{ rating: number | null; periodStart: string; periodEnd: string }>;
  equipmentIssued: Array<{ itemName: string; serialNumber: string | null; issuedDate: string }>;
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
  _count: { users: number; jobOpenings: number };
}

export interface Team {
  id: string;
  name: string;
  lead: { id: string; fullName: string; displayName: string | null; avatarUrl: string | null } | null;
  _count: { members: number; projects: number };
}

// ─── API client ───────────────────────────────────────────────────────────
export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  refresh: () => request<{ accessToken: string }>("/auth/refresh", { method: "POST" }),

  invite: (dto: { email: string; roleName: string; departmentId?: string; teamId?: string }) =>
    request<any>("/auth/invite", { method: "POST", body: JSON.stringify(dto) }),

  // Current user
  me: () => request<UserProfile>("/users/me"),

  // Employees
  employees: {
    list: (params?: { search?: string; departmentId?: string; teamId?: string }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set("search", params.search);
      if (params?.departmentId) qs.set("departmentId", params.departmentId);
      if (params?.teamId) qs.set("teamId", params.teamId);
      return request<Employee[]>(`/employees?${qs.toString()}`);
    },
    me: () => request<Employee>("/employees/me"),
    get: (id: string) => request<Employee>(`/employees/${id}`),
    update: (id: string, dto: Partial<Pick<UserProfile, "displayName" | "phone"> & {
      bio?: string; skills?: string[]; experienceYears?: number;
      emergencyContactName?: string; emergencyContactPhone?: string; emergencyContactRelation?: string;
    }>) =>
      request<Employee>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  },

  // Departments
  departments: {
    list: () => request<Department[]>("/departments"),
    get: (id: string) => request<Department>(`/departments/${id}`),
    create: (name: string) => request<Department>("/departments", { method: "POST", body: JSON.stringify({ name }) }),
    remove: (id: string) => request<void>(`/departments/${id}`, { method: "DELETE" }),
  },

  // Teams
  teams: {
    list: () => request<Team[]>("/teams"),
    get: (id: string) => request<Team>(`/teams/${id}`),
    create: (name: string, leadId?: string) =>
      request<Team>("/teams", { method: "POST", body: JSON.stringify({ name, leadId }) }),
    update: (id: string, dto: { name?: string; leadId?: string }) =>
      request<Team>(`/teams/${id}`, { method: "PATCH", body: JSON.stringify(dto) }),
  },

  // Clients
  clients: {
    list: () => request<any[]>("/clients"),
    get: (id: string) => request<any>(`/clients/${id}`),
    create: (dto: { companyName: string; contactEmail: string; contactPhone?: string }) =>
      request<any>("/clients", { method: "POST", body: JSON.stringify(dto) }),
  },

  // Projects
  projects: {
    list: () => request<any[]>("/projects"),
    get: (id: string) => request<any>(`/projects/${id}`),
    create: (dto: { name: string; clientId?: string; description?: string; budget?: number; endDate?: string; managerId?: string }) =>
      request<any>("/projects", { method: "POST", body: JSON.stringify(dto) }),
  },

  // Tasks
  tasks: {
    list: (projectId?: string) => request<any[]>(`/tasks${projectId ? `?projectId=${projectId}` : ""}`),
    create: (dto: { title: string; description?: string; projectId: string; assigneeId?: string; priority?: string; dueDate?: string }) =>
      request<any>("/tasks", { method: "POST", body: JSON.stringify(dto) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  // Daily Updates
  dailyUpdates: {
    submit: (dto: { completedItems: string[]; plannedItems: string[] }) =>
      request<any>("/daily-updates", { method: "POST", body: JSON.stringify(dto) }),
    myHistory: () => request<any[]>("/daily-updates/my"),
  },

  // Points system
  points: {
    myScore: () => request<any>("/points/my-score"),
    ledger: () => request<any[]>("/points/ledger"),
    leaderboard: (year?: number, month?: number) => {
      const qs = new URLSearchParams();
      if (year) qs.set("year", String(year));
      if (month) qs.set("month", String(month));
      return request<any[]>(`/points/leaderboard?${qs.toString()}`);
    },
  },

  // CRM
  crm: {
    leads: {
      list: () => request<any[]>("/crm/leads"),
      create: (dto: { contactName: string; email?: string; phone?: string; companyName?: string; source?: string }) =>
        request<any>("/crm/leads", { method: "POST", body: JSON.stringify(dto) }),
      updateStatus: (id: string, status: string) =>
        request<any>(`/crm/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    },
    deals: {
      list: () => request<any[]>("/crm/deals"),
      create: (dto: { title: string; value?: number; leadId?: string; clientId?: string }) =>
        request<any>("/crm/deals", { method: "POST", body: JSON.stringify(dto) }),
      updateStage: (id: string, stage: string) =>
        request<any>(`/crm/deals/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage }) }),
    },
  },

  // Finance
  finance: {
    invoices: {
      list: (status?: string) => request<any[]>(`/finance/invoices${status ? `?status=${status}` : ""}`),
      create: (dto: { clientId: string; projectId?: string; amount: number; gstAmount?: number; dueDate?: string }) =>
        request<any>("/finance/invoices", { method: "POST", body: JSON.stringify(dto) }),
      updateStatus: (id: string, status: string) =>
        request<any>(`/finance/invoices/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    },
    summary: () => request<any>("/finance/summary"),
    payroll: () => request<any[]>("/finance/payroll"),
  },

  // HR
  hr: {
    leaves: {
      list: () => request<any[]>("/hr/leaves"),
      create: (dto: { type: string; startDate: string; endDate: string; reason?: string }) =>
        request<any>("/hr/leaves", { method: "POST", body: JSON.stringify(dto) }),
      approve: (id: string, status: string) =>
        request<any>(`/hr/leaves/${id}/approve`, { method: "PATCH", body: JSON.stringify({ status }) }),
    },
    leaveBalance: () => request<any>("/hr/leave-balance"),
    holidays: () => request<any[]>("/hr/holidays"),
  },

  // Recruitment
  recruitment: {
    jobs: {
      list: () => request<any[]>("/recruitment/jobs"),
      get: (id: string) => request<any>(`/recruitment/jobs/${id}`),
      create: (dto: { title: string; departmentId?: string; description: string; openings?: number }) =>
        request<any>("/recruitment/jobs", { method: "POST", body: JSON.stringify(dto) }),
    },
    candidates: {
      list: (jobId?: string) => request<any[]>(`/recruitment/candidates${jobId ? `?jobId=${jobId}` : ""}`),
      get: (id: string) => request<any>(`/recruitment/candidates/${id}`),
      create: (dto: { jobOpeningId: string; fullName: string; email: string; phone?: string }) =>
        request<any>("/recruitment/candidates", { method: "POST", body: JSON.stringify(dto) }),
      updateStage: (id: string, stage: string) =>
        request<any>(`/recruitment/candidates/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage }) }),
    },
  },

  // Knowledge Base
  kb: {
    articles: {
      list: (category?: string, search?: string) => {
        const qs = new URLSearchParams();
        if (category) qs.set("category", category);
        if (search) qs.set("search", search);
        return request<any[]>(`/kb/articles?${qs.toString()}`);
      },
      get: (id: string) => request<any>(`/kb/articles/${id}`),
      create: (dto: { title: string; category: string; content: string; tags?: string[] }) =>
        request<any>("/kb/articles", { method: "POST", body: JSON.stringify(dto) }),
    },
    videos: {
      list: () => request<any[]>("/kb/videos"),
    },
  },

  // Chat
  chat: {
    channels: {
      list: () => request<any[]>("/chat/channels"),
      create: (dto: { type: string; name: string }) =>
        request<any>("/chat/channels", { method: "POST", body: JSON.stringify(dto) }),
      createDirect: (targetUserId: string) =>
        request<any>("/chat/channels/direct", { method: "POST", body: JSON.stringify({ targetUserId }) }),
      messages: (channelId: string) => request<any[]>(`/chat/channels/${channelId}/messages`),
      sendMessage: (channelId: string, body: string) =>
        request<any>(`/chat/channels/${channelId}/messages`, { method: "POST", body: JSON.stringify({ body }) }),
    },
  },

  // Meetings
  meetings: {
    upcoming: () => request<any[]>("/meetings/upcoming"),
    create: (dto: { title: string; scheduledAt: string; durationMinutes?: number; meetingLink?: string; attendeeIds?: string[] }) =>
      request<any>("/meetings", { method: "POST", body: JSON.stringify(dto) }),
  },

  // Announcements
  announcements: {
    list: (audience?: string) => request<any[]>(`/announcements${audience ? `?audience=${audience}` : ""}`),
    create: (dto: { title: string; body: string; audience?: string }) =>
      request<any>("/announcements", { method: "POST", body: JSON.stringify(dto) }),
  },

  // Analytics
  analytics: {
    ceoMetrics: () => request<any>("/analytics/ceo-dashboard"),
  },

  // AI Assistant
  ai: {
    summarizeDay: (date?: string) => request<string>(`/ai/summarize-day${date ? `?date=${date}` : ""}`, { method: "POST" }),
    ask: (question: string) => request<string>("/ai/ask", { method: "POST", body: JSON.stringify({ question }) }),
    analyzeRisks: (projectId: string) => request<string>("/ai/analyze-risks", { method: "POST", body: JSON.stringify({ projectId }) }),
  },

  // Admin / Security settings
  admin: {
    auditLogs: () => request<any[]>("/admin/audit-logs"),
    sessions: () => request<any[]>("/admin/sessions"),
    revokeSession: (id: string) => request<any>(`/admin/sessions/${id}`, { method: "DELETE" }),
  },
};
