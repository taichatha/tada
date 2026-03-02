export type TodoStatus = "open" | "completed" | "cancelled";
export type Priority = "none" | "low" | "medium" | "high";
export type ProjectStatus = "active" | "completed" | "on_hold";

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  daysOfWeek?: number[]; // 0=Sun..6=Sat
  endDate?: string; // ISO date
}

export interface Todo {
  id: string;
  title: string;
  notes: string;
  status: TodoStatus;
  priority: Priority;
  tags: string[];
  projectId: string | null;
  areaId: string | null;
  scheduledDate: string | null; // YYYY-MM-DD — "when to work on it"
  deadline: string | null; // YYYY-MM-DD — "due by"
  recurrence: RecurrenceRule | null;
  parentId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  notes: string;
  areaId: string | null;
  status: ProjectStatus;
  tags: string[];
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Area {
  id: string;
  title: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TadaStore {
  version: 1;
  todos: Todo[];
  projects: Project[];
  areas: Area[];
}

// Input types for creating/updating

export interface AddTodoInput {
  title: string;
  notes?: string;
  projectId?: string | null;
  areaId?: string | null;
  tags?: string[];
  scheduledDate?: string | null;
  deadline?: string | null;
  priority?: Priority;
  recurrence?: RecurrenceRule | null;
  parentId?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  notes?: string;
  projectId?: string | null;
  areaId?: string | null;
  tags?: string[];
  scheduledDate?: string | null;
  deadline?: string | null;
  priority?: Priority;
  recurrence?: RecurrenceRule | null;
}

export interface CreateProjectInput {
  title: string;
  notes?: string;
  areaId?: string | null;
  tags?: string[];
  deadline?: string | null;
}

export interface UpdateProjectInput {
  title?: string;
  notes?: string;
  areaId?: string | null;
  tags?: string[];
  deadline?: string | null;
  status?: ProjectStatus;
}

export interface CreateAreaInput {
  title: string;
  notes?: string;
}

export interface UpdateAreaInput {
  title?: string;
  notes?: string;
}

export interface TodoFilter {
  status?: TodoStatus;
  projectId?: string;
  areaId?: string;
  tag?: string;
}

export interface ProjectFilter {
  status?: ProjectStatus;
  areaId?: string;
}
