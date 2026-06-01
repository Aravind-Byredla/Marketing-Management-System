import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
    UNDER_REVIEW: "bg-purple-100 text-purple-700 border-purple-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-gray-100 text-gray-500 border-gray-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    // Task statuses
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };
  return colors[priority] || "bg-gray-100 text-gray-700";
}

export function humanizeStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function buildQueryString(params: object): string {
  const qs = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => qs.append(key, String(v)));
      } else {
        qs.set(key, String(value));
      }
    }
  });
  return qs.toString();
}
