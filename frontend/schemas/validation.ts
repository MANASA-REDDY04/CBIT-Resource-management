import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid institutional email address"),
  password: z.string().min(1, "Password is required"),
});

export const personOrganisationItemSchema = z.object({
  organisation_id: z.string().uuid("Please select an organisation"),
  designation: z.string().min(2, "Designation is required"),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean().default(true),
});

export const resourcePersonFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  email: z.string().email("Valid email address is required"),
  mobile_number: z.string().min(7, "Valid contact number is required"),
  address: z.string().optional(),
  professional_biography: z.string().optional(),
  professional_profile_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  organisations: z.array(personOrganisationItemSchema).default([]),
  expertise_ids: z.array(z.string().uuid()).default([]),
});

export const organisationFormSchema = z.object({
  organisation_name: z.string().min(2, "Organisation name is required"),
  organisation_type: z.string().min(2, "Organisation type is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const expertiseFormSchema = z.object({
  expertise_name: z.string().min(2, "Expertise name is required"),
  category: z.string().min(2, "Category is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const userFormSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  employee_id: z.string().optional(),
  department_id: z.string().uuid("Please select a department").optional().nullable(),
  role: z.enum(["ADMIN", "AUTHORISED_FACULTY", "GENERAL_STAFF"]),
  can_create_records: z.boolean().default(false),
  can_edit_records: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResourcePersonFormData = z.infer<typeof resourcePersonFormSchema>;
export type OrganisationFormData = z.infer<typeof organisationFormSchema>;
export type ExpertiseFormData = z.infer<typeof expertiseFormSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;

