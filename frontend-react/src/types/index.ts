// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  INVESTIGATOR = 'investigator',
  VIEWER = 'viewer',
}

// Authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Log Types
export interface RawEvent {
  id: string;
  log_source: string;
  raw_data: string;
  case_id?: string;
  ingested_at: string;
  created_at: string;
  updated_at: string;
}

export interface NormalizedEvent {
  id: string;
  event_timestamp: string;
  log_source: string;
  source_ip?: string;
  dest_ip?: string;
  source_port?: number;
  dest_port?: number;
  username?: string;
  hostname?: string;
  event_type?: string;
  severity?: string;
  description?: string;
  raw_event_id?: string;
  case_id?: string;
  raw_log?: string;
  created_at: string;
  updated_at: string;
}

export interface LogIngestRequest {
  log_source: string;
  raw_data: string;
  case_id?: string;
}

// Case Types
export interface Case {
  id: string;
  case_number?: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: Priority;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  due_date?: string;
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  ON_HOLD = 'on_hold',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Alert Types
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  case_id?: string;
  source: string;
  timestamp: string;
  created_at: string;
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum AlertStatus {
  UNREVIEWED = 'unreviewed',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

// Detection Types
export interface DetectionRule {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  severity: AlertSeverity;
  rule_type: string;
  pattern: any;
  event_type?: string;
  threshold: number;
  time_window_seconds: number;
  mitre_tactic?: string;
  mitre_technique?: string;
  mitre_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface DetectionScanRequest {
  hours_back: number;
}

export interface DetectionScanResponse {
  alerts_scanned: number;
  alerts_generated: number;
  message: string;
}

/** Evidence record (matches backend `Evidence` schema). */
export interface EvidenceItem {
  id: number;
  evidence_id: string;
  case_id: number;
  evidence_type: string;
  filename: string;
  original_path?: string | null;
  stored_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  sha256_hash: string;
  md5_hash?: string | null;
  integrity_status?: string | null;
  hash_verified_at?: string | null;
  hash_verified_by?: number | null;
  uploaded_by: number;
  uploaded_at: string;
  collected_date?: string | null;
  collected_by?: string | null;
  description?: string | null;
  is_sensitive?: boolean;
  source_system?: string | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use EvidenceItem */
export type Evidence = EvidenceItem;

export interface ChainOfCustodyEntry {
  id: number;
  evidence_id: number;
  action: string;
  actor_id?: number | null;
  actor_name?: string | null;
  action_time: string;
  details?: string | null;
  tool_used?: string | null;
  output_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceUploadResponse {
  evidence: EvidenceItem;
  upload_success: boolean;
  message: string;
}

// Event Types
export interface Event {
  id: string;
  case_id: string;
  title: string;
  description: string;
  event_type: string;
  timestamp: string;
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
  created_at: string;
}

// Timeline Types
export interface Timeline {
  id: string;
  case_id: string;
  events: TimelineEvent[];
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  event_type: string;
  severity?: AlertSeverity;
}

// Report Types
export interface Report {
  id: string;
  case_id: string;
  title: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  generated_by: string;
  file_url?: string;
}

export enum ReportStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string | ApiErrorDetail[];
}

export interface ApiErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}
