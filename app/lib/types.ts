// Shared DTO types used across all route handlers

export interface UserDTO {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  constructionFunction: string | null;
  permissionRole: 'super_user' | 'modify_assigned' | 'view_only';
  avatarColor: string;
  submitPhotos: boolean;
  addNotes: boolean;
  uploadInvoices: boolean;
  uploadBlueprints: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobDTO {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
  budget: string | null;
  expenses: string | null;
  deadline: string | null;
  status: string;
  customerId: number | null;
  customer?: { id: number; fullName: string; email: string } | null;
  assignees: Array<{
    id: number;
    userId: number;
    user: { id: number; name: string; email: string };
    roleOnJob: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestDTO {
  id: number;
  userId: number;
  jobId: number | null;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  reviewedBy: number | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export function serializeUser(u: any): UserDTO {
  return {
    id:           u.id,
    email:        u.email,
    fullName:     u.full_name,
    phone:        u.phone,
    constructionFunction: u.construction_function,
    permissionRole: u.permission_role,
    avatarColor:  u.avatar_color,
    submitPhotos: Boolean(u.submit_photos),
    addNotes:     Boolean(u.add_notes),
    uploadInvoices: Boolean(u.upload_invoices),
    uploadBlueprints: Boolean(u.upload_blueprints),
    createdAt:    u.created_at,
    updatedAt:    u.updated_at,
  };
}

export function serializeJob(j: any, raw: boolean = false): JobDTO | Record<string, any> {
  if (raw) return j;
  return {
    id: j.id,
    title: j.title,
    description: j.description,
    location: j.location,
    category: j.category,
    budget: j.budget,
    expenses: j.expenses,
    deadline: j.deadline,
    status: j.status,
    customerId: j.customer_id,
    customer: j.customer ? { id: j.customer.id, fullName: j.customer.full_name, email: j.customer.email } : null,
    assignees: [],   // eagerly populate in the route handler
    createdAt: j.created_at,
    updatedAt: j.updated_at,
  };
}

export function serializeLeave(l: any): LeaveRequestDTO {
  return {
    id: l.id,
    userId: l.user_id,
    jobId: l.job_id,
    type: l.type,
    startDate: l.start_date,
    endDate: l.end_date,
    reason: l.reason,
    status: l.status,
    reviewedBy: l.reviewed_by,
    reviewNote: l.review_note,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  };
}
