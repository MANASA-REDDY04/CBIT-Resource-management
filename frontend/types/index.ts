export type UserRole = "ADMIN" | "AUTHORISED_FACULTY" | "GENERAL_STAFF";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  full_name: string;
  email: string;
  employee_id?: string;
  department_id?: string;
  department_name?: string;
  department_code?: string;
  role: UserRole;
  can_create_records: boolean;
  can_edit_records: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  department_name: string;
  department_code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  staff_count?: number;
}

export interface Organisation {
  id: string;
  organisation_name: string;
  organisation_type: string;
  website?: string;
  address?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  resource_person_count?: number;
}

export interface Expertise {
  id: string;
  expertise_name: string;
  category: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  resource_person_count?: number;
}

export interface PersonOrganisation {
  id?: string;
  organisation_id: string;
  organisation_name?: string;
  organisation_type?: string;
  website?: string;
  designation: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
}

export interface PersonExpertise {
  id: string;
  expertise_name: string;
  category: string;
}

export interface ApprovalHistory {
  id: string;
  action: "SUBMITTED" | "APPROVED" | "REJECTED" | "UPDATED";
  previous_status?: string;
  new_status: string;
  reviewed_by?: string;
  reviewer_name?: string;
  comments?: string;
  created_at: string;
}

export interface ResourcePerson {
  id: string;
  full_name: string;
  designation: string;
  email: string;
  mobile_number: string;
  address?: string;
  professional_biography?: string;
  professional_profile_url?: string;
  approval_status: ApprovalStatus;
  rejection_reason?: string;
  created_by?: string;
  creator_name?: string;
  reviewed_by?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  organisations: PersonOrganisation[];
  expertise: PersonExpertise[];
  approval_history?: ApprovalHistory[];
}

export interface DashboardStats {
  total_resource_persons: number;
  approved_resource_persons: number;
  pending_approvals: number;
  rejected_resource_persons: number;
  total_organisations: number;
  total_expertise_areas: number;
  total_registered_staff: number;
}

export interface RecentActivityItem {
  id: string;
  full_name: string;
  designation: string;
  organisation_names: string[];
  approval_status: ApprovalStatus;
  created_at: string;
  reviewed_at?: string;
}

export interface DashboardActivity {
  recently_added: RecentActivityItem[];
  recently_approved: RecentActivityItem[];
  pending_summary: RecentActivityItem[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

