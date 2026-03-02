import chalk from "chalk";
import type { Todo, Project, Area } from "../core/index.js";

const ICONS = {
  open: chalk.dim("○"),
  completed: chalk.green("✓"),
  cancelled: chalk.dim("—"),
  bullet: chalk.dim("●"),
};

const PRIORITY_MARKERS: Record<string, string> = {
  high: chalk.red("!!!"),
  medium: chalk.yellow("!!"),
  low: chalk.blue("!"),
  none: "",
};

function shortId(id: string): string {
  return chalk.dim(id.slice(0, 6));
}

function statusIcon(status: string): string {
  return ICONS[status as keyof typeof ICONS] ?? ICONS.open;
}

function isOverdue(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

function formatDate(dateStr: string): string {
  if (isOverdue(dateStr)) {
    return chalk.red(dateStr);
  }
  return chalk.dim(dateStr);
}

function formatTags(tags: string[]): string {
  if (tags.length === 0) return "";
  return tags.map((t) => chalk.cyan(`#${t}`)).join(" ");
}

export function formatTodoLine(todo: Todo, subtaskProgress?: { done: number; total: number }): string {
  const parts: string[] = [];

  parts.push(statusIcon(todo.status));

  const priority = PRIORITY_MARKERS[todo.priority];
  if (priority) parts.push(priority);

  if (todo.status === "completed") {
    parts.push(chalk.dim.strikethrough(todo.title));
  } else {
    parts.push(chalk.white.bold(todo.title));
  }

  if (subtaskProgress && subtaskProgress.total > 0) {
    parts.push(chalk.dim(`[${subtaskProgress.done}/${subtaskProgress.total}]`));
  }

  if (todo.tags.length > 0) {
    parts.push(formatTags(todo.tags));
  }

  if (todo.deadline) {
    parts.push(formatDate(todo.deadline));
  }

  if (todo.scheduledDate) {
    parts.push(chalk.dim(`@ ${todo.scheduledDate}`));
  }

  parts.push(shortId(todo.id));

  return parts.join("  ");
}

export function formatSubtaskLine(todo: Todo): string {
  return `${statusIcon(todo.status)}  ${todo.status === "completed" ? chalk.dim.strikethrough(todo.title) : todo.title}`;
}

export function formatTodoDetail(todo: Todo, subtasks?: Todo[]): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${statusIcon(todo.status)}  ${chalk.white.bold(todo.title)}  ${shortId(todo.id)}`);
  lines.push("");

  if (todo.priority !== "none") {
    lines.push(`  ${chalk.dim("Priority")}    ${PRIORITY_MARKERS[todo.priority]} ${todo.priority}`);
  }

  lines.push(`  ${chalk.dim("Status")}      ${todo.status}`);

  if (todo.tags.length > 0) {
    lines.push(`  ${chalk.dim("Tags")}        ${formatTags(todo.tags)}`);
  }

  if (todo.projectId) {
    lines.push(`  ${chalk.dim("Project")}     ${shortId(todo.projectId)}`);
  }

  if (todo.areaId) {
    lines.push(`  ${chalk.dim("Area")}        ${shortId(todo.areaId)}`);
  }

  if (todo.scheduledDate) {
    lines.push(`  ${chalk.dim("Scheduled")}   ${formatDate(todo.scheduledDate)}`);
  }

  if (todo.deadline) {
    lines.push(`  ${chalk.dim("Deadline")}    ${formatDate(todo.deadline)}`);
  }

  if (todo.recurrence) {
    const r = todo.recurrence;
    const desc = r.interval === 1 ? r.frequency : `every ${r.interval} ${r.frequency}`;
    lines.push(`  ${chalk.dim("Recurrence")}  ${desc}`);
  }

  if (todo.notes) {
    lines.push("");
    lines.push(`  ${chalk.dim("Notes")}`);
    for (const line of todo.notes.split("\n")) {
      lines.push(`  ${line}`);
    }
  }

  if (todo.completedAt) {
    lines.push("");
    lines.push(`  ${chalk.dim("Completed")}   ${chalk.dim(todo.completedAt.slice(0, 10))}`);
  }

  if (subtasks && subtasks.length > 0) {
    const done = subtasks.filter((s) => s.status !== "open").length;
    lines.push("");
    lines.push(`  ${chalk.dim("Subtasks")}    ${chalk.dim(`${done}/${subtasks.length} done`)}`);
    for (const sub of subtasks) {
      lines.push(`    ${formatSubtaskLine(sub)}`);
    }
  }

  lines.push("");
  lines.push(`  ${chalk.dim("Created")}     ${chalk.dim(todo.createdAt.slice(0, 10))}`);
  lines.push("");

  return lines.join("\n");
}

export function formatTodoList(todos: Todo[], title: string): string {
  if (todos.length === 0) {
    return formatEmpty(`No items in ${title.toLowerCase()}`);
  }

  const lines: string[] = [];
  lines.push("");
  lines.push(`  ${chalk.white.bold(title)}  ${chalk.dim(`(${todos.length})`)}`);
  lines.push("");

  for (const todo of todos) {
    lines.push(`  ${formatTodoLine(todo)}`);
  }

  lines.push("");
  return lines.join("\n");
}

export function formatProjectLine(project: Project, todoCount: number): string {
  const parts: string[] = [];

  if (project.status === "completed") {
    parts.push(chalk.green("✓"));
    parts.push(chalk.dim.strikethrough(project.title));
  } else {
    parts.push(ICONS.bullet);
    parts.push(chalk.white.bold(project.title));
  }

  parts.push(chalk.dim(`${todoCount} todos`));

  if (project.tags.length > 0) {
    parts.push(formatTags(project.tags));
  }

  if (project.deadline) {
    parts.push(formatDate(project.deadline));
  }

  parts.push(shortId(project.id));

  return parts.join("  ");
}

export function formatProjectDetail(project: Project, todos: Todo[]): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(`  ${ICONS.bullet}  ${chalk.white.bold(project.title)}  ${shortId(project.id)}`);
  lines.push("");

  lines.push(`  ${chalk.dim("Status")}      ${project.status}`);

  if (project.tags.length > 0) {
    lines.push(`  ${chalk.dim("Tags")}        ${formatTags(project.tags)}`);
  }

  if (project.areaId) {
    lines.push(`  ${chalk.dim("Area")}        ${shortId(project.areaId)}`);
  }

  if (project.deadline) {
    lines.push(`  ${chalk.dim("Deadline")}    ${formatDate(project.deadline)}`);
  }

  if (project.notes) {
    lines.push("");
    lines.push(`  ${chalk.dim("Notes")}`);
    for (const line of project.notes.split("\n")) {
      lines.push(`  ${line}`);
    }
  }

  lines.push("");
  lines.push(`  ${chalk.dim("Created")}     ${chalk.dim(project.createdAt.slice(0, 10))}`);

  if (todos.length > 0) {
    lines.push("");
    lines.push(`  ${chalk.white.bold("Todos")}  ${chalk.dim(`(${todos.length})`)}`);
    lines.push("");
    for (const todo of todos) {
      lines.push(`    ${formatTodoLine(todo)}`);
    }
  } else {
    lines.push("");
    lines.push(`  ${chalk.dim("No open todos")}`);
  }

  lines.push("");
  return lines.join("\n");
}

export function formatAreaLine(area: Area, projectCount: number): string {
  const parts: string[] = [];

  parts.push(ICONS.bullet);
  parts.push(chalk.white.bold(area.title));
  parts.push(chalk.dim(`${projectCount} projects`));
  parts.push(shortId(area.id));

  return parts.join("  ");
}

export function formatEmpty(message: string): string {
  return `\n  ${chalk.dim(message)}\n`;
}

export function formatSuccess(message: string): string {
  return `  ${chalk.green("✓")}  ${message}`;
}

export function formatError(message: string): string {
  return `  ${chalk.red("error")}  ${message}`;
}
