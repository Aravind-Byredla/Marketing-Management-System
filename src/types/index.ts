import { Role, RequestStatus, Priority } from "@prisma/client";

export type { Role, RequestStatus, Priority };

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  location?: string;
}

export interface RequestWithRelations {
  id: string;
  requestId: string;
  title: string;
  objective: string;
  summary?: string;
  quantity?: string;
  notes?: string;
  status: RequestStatus;
  priority: Priority;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  company: { id: string; name: string };
  branch?: { id: string; name: string };
  category: { id: string; name: string; icon?: string };
  subcategory?: { id: string; name: string };
  createdBy: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string };
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: Date;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  requestId?: string;
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Under Review",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  UNDER_REVIEW: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-100 text-slate-700",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

export const COMPANIES = [
  "MA MAISON SUPERMARCHE",
  "LIBERTY BISTRO",
  "B2B",
  "TOKON",
];

export const BRANCHES = ["ALL KATANGA", "LUBUMBASHI", "LIKASI", "KOLWEZI"];
