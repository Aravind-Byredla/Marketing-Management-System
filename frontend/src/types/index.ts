// ============================================================
// Core TypeScript Types
// ============================================================

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "TEAM_MEMBER";

export type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "CLOSED"
  | "REJECTED";

export type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type NotificationType =
  | "REQUEST_CREATED"
  | "REQUEST_STATUS_CHANGED"
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "PROGRESS_UPDATED"
  | "COMMENT_ADDED"
  | "DELIVERABLE_UPLOADED"
  | "SYSTEM";

// ─── Minimal Types ───────────────────────────────────────────
export interface UserMinimal {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
}

export interface CompanyMinimal {
  id: number;
  name: string;
}

export interface BranchMinimal {
  id: number;
  name: string;
  location: string;
}

export interface DepartmentMinimal {
  id: number;
  name: string;
}

export interface CategoryMinimal {
  id: number;
  name: string;
  icon: string;
}

// ─── Full Types ───────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar: string | null;
  phone: string;
  company: number | null;
  company_detail: CompanyMinimal | null;
  branch: number | null;
  branch_detail: BranchMinimal | null;
  department: number | null;
  department_detail: DepartmentMinimal | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  description: string;
  logo: string | null;
  is_active: boolean;
  branch_count: number;
  department_count: number;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: number;
  company: number;
  company_name: string;
  name: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  company: number;
  company_name: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface SubCategory {
  id: number;
  category: number;
  name: string;
  is_active: boolean;
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  subcategories: SubCategory[];
  created_at: string;
}

export interface Attachment {
  id: string;
  file: string;
  filename: string;
  file_size: number;
  mime_type: string;
  uploaded_by_detail: UserMinimal;
  created_at: string;
}

export interface Comment {
  id: string;
  request: string;
  user: string;
  user_detail: UserMinimal;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface MarketingRequestList {
  id: string;
  request_id: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  deadline: string | null;
  created_by_detail: UserMinimal;
  company_detail: CompanyMinimal;
  branch_detail: BranchMinimal;
  category_detail: CategoryMinimal;
  attachment_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingRequestDetail extends MarketingRequestList {
  objective: string;
  summary: string;
  quantity: number;
  notes: string;
  video_references: string[];
  company: number;
  branch: number;
  department: number;
  department_detail: DepartmentMinimal;
  category: number;
  subcategory: number | null;
  approved_by_detail: UserMinimal | null;
  attachments: Attachment[];
  comments: Comment[];
  allowed_transitions: RequestStatus[];
}

export interface TaskDeliverable {
  id: string;
  file: string;
  filename: string;
  file_size: number;
  uploaded_by_detail: UserMinimal;
  created_at: string;
}

export interface Task {
  id: string;
  request: string;
  request_detail: MarketingRequestList;
  assigned_to: string | null;
  assigned_to_detail: UserMinimal | null;
  assigned_by: string | null;
  assigned_by_detail: UserMinimal | null;
  title: string;
  description: string;
  deadline: string | null;
  status: TaskStatus;
  progress_percentage: number;
  deliverables: TaskDeliverable[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: NotificationType;
  object_id: string | null;
  object_type: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_detail: UserMinimal;
  action: string;
  model_name: string;
  object_id: string;
  changes: Record<string, unknown>;
  ip_address: string | null;
  timestamp: string;
}

// ─── API Response Types ───────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

// ─── Analytics ───────────────────────────────────────────────
export interface DashboardStats {
  requests: {
    total: number;
    draft: number;
    pending: number;
    assigned: number;
    in_progress: number;
    under_review: number;
    completed: number;
    closed: number;
    rejected: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
  users?: {
    total: number;
    managers: number;
    team_members: number;
  };
}

// ─── Form Types ───────────────────────────────────────────────
export interface RequestFormValues {
  // Step 1
  company: number;
  branch: number;
  department: number;
  // Step 2
  title: string;
  objective: string;
  summary: string;
  quantity: number;
  notes: string;
  // Step 3
  category: number;
  subcategory?: number;
  // Step 4
  video_references: string[];
  priority: RequestPriority;
  deadline?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  new_password: string;
  confirm_password: string;
}
