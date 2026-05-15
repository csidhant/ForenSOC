/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Case,
  Alert,
  EvidenceItem,
  ChainOfCustodyEntry,
  Event,
  RawEvent,
  NormalizedEvent,
  LogIngestRequest,
  DetectionRule,
  DetectionScanResponse,
  EvidenceUploadResponse,
  TimelineEventRow,
  TimelineRebuildResponse,
  CaseReportRecord,
  ReportGenerateResponse,
  ForensicsJobResponse,
  MitreCaseSummary,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  }

  async register(credentials: RegisterRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/register', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/users/me');
    return response.data;
  }

  async ingestLog(data: LogIngestRequest): Promise<{ raw_event: RawEvent; normalized_event: NormalizedEvent }> {
    const response = await this.api.post('/logs/ingest', data);
    return response.data;
  }

  async getRawLogs(params?: any): Promise<RawEvent[]> {
    const response = await this.api.get<RawEvent[]>('/logs/raw', { params });
    return response.data;
  }

  async getNormalizedLogs(params?: any): Promise<NormalizedEvent[]> {
    const response = await this.api.get<NormalizedEvent[]>('/logs/normalized', { params });
    return response.data;
  }

  // Cases
  async getCases(page: number = 1, pageSize: number = 10): Promise<any> {
    const skip = (page - 1) * pageSize;
    const response = await this.api.get('/cases', { params: { skip, limit: pageSize } });
    const data = response.data;
    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return data;
  }

  async getCase(id: string): Promise<Case> {
    const response = await this.api.get(`/cases/${id}`);
    return response.data;
  }

  async createCase(data: Partial<Case>): Promise<Case> {
    const response = await this.api.post('/cases', data);
    return response.data;
  }

  async updateCase(id: string, data: Partial<Case>): Promise<Case> {
    const response = await this.api.put(`/cases/${id}`, data);
    return response.data;
  }

  async deleteCase(id: string): Promise<void> {
    await this.api.delete(`/cases/${id}`);
  }

  // Alerts
  async getAlerts(caseId?: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const params: any = { page, page_size: pageSize };
    if (caseId) {
      params.case_id = caseId;
    }
    const response = await this.api.get('/alerts', { params });
    return response.data;
  }

  async getAlert(id: string): Promise<Alert> {
    const response = await this.api.get(`/alerts/${id}`);
    return response.data;
  }

  async createAlert(data: any): Promise<Alert> {
    const response = await this.api.post('/alerts', data);
    return response.data;
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    const response = await this.api.put(`/alerts/${id}`, data);
    return response.data;
  }

  async deleteAlert(id: string): Promise<void> {
    await this.api.delete(`/alerts/${id}`);
  }

  async assignAlert(alertId: string, userId: string): Promise<Alert> {
    const response = await this.api.post(`/alerts/${alertId}/assign/${userId}`);
    return response.data;
  }

  async unassignAlert(alertId: string): Promise<Alert> {
    const response = await this.api.post(`/alerts/${alertId}/unassign`);
    return response.data;
  }

  async closeAlert(alertId: string): Promise<Alert> {
    const response = await this.api.post(`/alerts/${alertId}/close`);
    return response.data;
  }

  async markAlertFalsePositive(alertId: string): Promise<Alert> {
    const response = await this.api.post(`/alerts/${alertId}/false-positive`);
    return response.data;
  }

  async linkAlertToCase(alertId: string, caseId: string): Promise<Alert> {
    const response = await this.api.post(`/alerts/${alertId}/case/${caseId}`);
    return response.data;
  }

  async unlinkAlertFromCase(alertId: string): Promise<Alert> {
    const response = await this.api.delete(`/alerts/${alertId}/case`);
    return response.data;
  }

  async getAlertStats(): Promise<any> {
    const response = await this.api.get('/alerts/stats/overview');
    return response.data;
  }

  // Detection Rules
  async getDetectionRules(enabledOnly?: boolean): Promise<DetectionRule[]> {
    const params: any = {};
    if (enabledOnly !== undefined) params.enabled_only = enabledOnly;
    const response = await this.api.get('/detection/rules', { params });
    return response.data;
  }

  async getDetectionRule(id: number): Promise<DetectionRule> {
    const response = await this.api.get(`/detection/rules/${id}`);
    return response.data;
  }

  async createDetectionRule(data: Partial<DetectionRule>): Promise<DetectionRule> {
    const response = await this.api.post('/detection/rules', data);
    return response.data;
  }

  async updateDetectionRule(id: number, data: Partial<DetectionRule>): Promise<DetectionRule> {
    const response = await this.api.put(`/detection/rules/${id}`, data);
    return response.data;
  }

  async deleteDetectionRule(id: number): Promise<void> {
    await this.api.delete(`/detection/rules/${id}`);
  }

  async toggleDetectionRule(id: number): Promise<DetectionRule> {
    const response = await this.api.post(`/detection/rules/${id}/toggle`);
    return response.data;
  }

  async scanDetectionRules(hoursBack: number = 24): Promise<DetectionScanResponse> {
    const response = await this.api.post('/detection/scan', { hours_back: hoursBack });
    return response.data;
  }

  async uploadSigmaRule(yamlContent: string): Promise<DetectionRule> {
    const response = await this.api.post<DetectionRule>('/detection/rules/sigma', yamlContent, {
      headers: { 'Content-Type': 'text/plain' },
    });
    return response.data;
  }

  // Evidence vault
  async searchEvidence(params?: {
    case_id?: number;
    evidence_type?: string;
    filename?: string;
    hash_value?: string;
    skip?: number;
    limit?: number;
  }): Promise<EvidenceItem[]> {
    const response = await this.api.get<EvidenceItem[]>('/evidence', { params });
    return response.data;
  }

  async getEvidenceById(evidenceId: number): Promise<EvidenceItem> {
    const response = await this.api.get<EvidenceItem>(`/evidence/${evidenceId}`);
    return response.data;
  }

  async getEvidenceChain(evidenceId: number): Promise<ChainOfCustodyEntry[]> {
    const response = await this.api.get<ChainOfCustodyEntry[]>(
      `/evidence/${evidenceId}/chain-of-custody`
    );
    return response.data;
  }

  async appendEvidenceChain(
    evidenceId: number,
    body: { action: string; details?: string; tool_used?: string; output_hash?: string }
  ): Promise<ChainOfCustodyEntry> {
    const response = await this.api.post<ChainOfCustodyEntry>(
      `/evidence/${evidenceId}/chain-of-custody`,
      body
    );
    return response.data;
  }

  async uploadEvidence(form: FormData): Promise<EvidenceUploadResponse> {
    const response = await this.api.post<EvidenceUploadResponse>('/evidence/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async verifyEvidence(evidenceId: number): Promise<EvidenceItem> {
    const response = await this.api.post<EvidenceItem>(`/evidence/${evidenceId}/verify`);
    return response.data;
  }

  async updateEvidence(evidenceId: number, data: Partial<EvidenceItem>): Promise<EvidenceItem> {
    const response = await this.api.put<EvidenceItem>(`/evidence/${evidenceId}`, data);
    return response.data;
  }

  async deleteEvidenceItem(evidenceId: number): Promise<void> {
    await this.api.delete(`/evidence/${evidenceId}`);
  }

  async downloadEvidenceBlob(evidenceId: number, filename: string): Promise<void> {
    const response = await this.api.get(`/evidence/${evidenceId}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'evidence.bin');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async listTimelineEvents(
    caseId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<TimelineEventRow[]> {
    const response = await this.api.get<TimelineEventRow[]>(`/timeline/cases/${caseId}/events`, {
      params,
    });
    return response.data;
  }

  async rebuildTimeline(caseId: number): Promise<TimelineRebuildResponse> {
    const response = await this.api.post<TimelineRebuildResponse>(
      `/timeline/cases/${caseId}/rebuild`
    );
    return response.data;
  }

  async listCaseReports(caseId: number): Promise<CaseReportRecord[]> {
    const response = await this.api.get<CaseReportRecord[]>('/reports', { params: { case_id: caseId } });
    return response.data;
  }

  async generateCasePdf(caseId: number, title?: string): Promise<ReportGenerateResponse> {
    const response = await this.api.post<ReportGenerateResponse>('/reports/generate', {
      case_id: caseId,
      title,
    });
    return response.data;
  }

  async downloadReportPdf(reportId: number, filename: string): Promise<void> {
    const response = await this.api.get(`/reports/${reportId}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async uploadPcapAnalyze(
    caseId: number,
    file: File,
    description?: string,
    asyncWorker?: boolean
  ): Promise<ForensicsJobResponse> {
    const fd = new FormData();
    fd.append('case_id', String(caseId));
    fd.append('file', file);
    if (description) fd.append('description', description);
    if (asyncWorker) fd.append('async_worker', 'true');
    const response = await this.api.post<ForensicsJobResponse>('/forensics/pcap', fd);
    return response.data;
  }

  async uploadMemoryAnalyze(
    caseId: number,
    file: File,
    description?: string,
    asyncWorker?: boolean
  ): Promise<ForensicsJobResponse> {
    const fd = new FormData();
    fd.append('case_id', String(caseId));
    fd.append('file', file);
    if (description) fd.append('description', description);
    if (asyncWorker) fd.append('async_worker', 'true');
    const response = await this.api.post<ForensicsJobResponse>('/forensics/memory', fd);
    return response.data;
  }

  async uploadSuricataEve(caseId: number, file: File, description?: string): Promise<ForensicsJobResponse> {
    const fd = new FormData();
    fd.append('case_id', String(caseId));
    fd.append('file', file);
    if (description) fd.append('description', description);
    const response = await this.api.post<ForensicsJobResponse>('/forensics/suricata-eve', fd);
    return response.data;
  }

  async runYaraScan(evidenceId: number): Promise<ForensicsJobResponse> {
    const response = await this.api.post<ForensicsJobResponse>(`/forensics/yara-scan/${evidenceId}`);
    return response.data;
  }

  async getEvidenceYaraResults(evidenceId: number): Promise<any[]> {
    const response = await this.api.get<any[]>(`/forensics/evidence/${evidenceId}/yara-results`);
    return response.data;
  }

  async runFileAnalysis(evidenceId: number): Promise<any> {
    const response = await this.api.post(`/forensics/file-analysis/${evidenceId}`);
    return response.data;
  }

  async getMitreCaseSummary(caseId: number): Promise<MitreCaseSummary> {
    const response = await this.api.get<MitreCaseSummary>(`/mitre/cases/${caseId}/summary`);
    return response.data;
  }

  async syncMitreMappings(caseId: number): Promise<{ case_id: number; mappings_created: number }> {
    const response = await this.api.post(`/mitre/cases/${caseId}/sync`);
    return response.data;
  }

  async getMitreGlobalHeatmap(): Promise<any[]> {
    const response = await this.api.get<any[]>('/mitre/global-heatmap');
    return response.data;
  }

  async getAuditLogs(skip = 0, limit = 50): Promise<any[]> {
    const response = await this.api.get('/audit', {
      params: { skip, limit },
    });
    return response.data;
  }

  // Events
  async getEvents(caseId: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const response = await this.api.get(`/cases/${caseId}/events`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  async createEvent(caseId: string, data: Partial<Event>): Promise<Event> {
    const response = await this.api.post(`/cases/${caseId}/events`, data);
    return response.data;
  }

  // Health (served at app root — call full URL if needed)
  async getHealth(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
