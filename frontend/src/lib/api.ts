// Base URL for the Ceron backend.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Result returned by an individual Ceron detector.
export interface DetectorResult {
  detected: boolean;
  type: string | null;
  severity: string;
  categories?: string[] | null;
}

// Combined security analysis.
export interface SecurityAnalysis {
  detected: boolean;
  severity: string;
  results: DetectorResult[];
}

// Complete response returned by Ceron's analysis API.
export interface AnalyzeResponse {
  text: string;
  security_analysis: SecurityAnalysis;
}

export interface AnalysisHistoryItem {
  id: number;
  text: string;
  severity: string;
  created_at: string;
  results: DetectorResult[];
}

export interface RiskSummary {
  total_assets: number;
  total_analyses: number;
  detected_analyses: number;
  overall_severity: string;
  severity_counts: Record<string, number>;
}

export interface RemediationRecommendation {
  id: string;
  title: string;
  description: string;
  priority: string;
  actions: string[];
  categories: string[];
  affected_analyses: number;
  last_detected_at: string;
}

export interface AssetRecord {
  id: number;
  name: string;
  type: string;
  target: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScanPlan {
  id: number;
  asset_id: number;
  asset_name: string;
  asset_target: string;
  profile: "baseline" | "deep";
  status: "queued";
  created_at: string;
}

export type VulnerabilitySeverity = "low" | "medium" | "high" | "critical";
export type VulnerabilityStatus = "open" | "accepted_risk" | "remediated";

export interface VulnerabilityRecord {
  id: number;
  asset_id: number;
  asset_name: string;
  asset_target: string;
  identifier: string;
  title: string;
  description: string | null;
  severity: VulnerabilitySeverity;
  status: VulnerabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface DashboardVulnerability {
  id: number;
  asset_name: string;
  asset_target: string;
  identifier: string;
  title: string;
  severity: VulnerabilitySeverity;
  updated_at: string;
}

export interface DashboardScan {
  id: number;
  asset_name: string;
  asset_target: string;
  profile: ScanPlan["profile"];
  status: ScanPlan["status"];
  created_at: string;
}

export interface DashboardSummary {
  total_assets: number;
  total_analyses: number;
  detected_analyses: number;
  overall_severity: string;
  queued_scans: number;
  open_vulnerabilities: number;
  critical_vulnerabilities: number;
  recent_vulnerabilities: DashboardVulnerability[];
  recent_scans: DashboardScan[];
}

export interface PlatformStatus {
  api_status: "operational";
  database_status: "connected";
  analysis_engine: "deterministic";
  scan_execution_enabled: boolean;
  authentication_enabled: boolean;
}

/**
 * Sends text to the Ceron analysis API.
 */
export async function analyzeText(
  text: string,
): Promise<AnalyzeResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Analysis request failed (${response.status})`,
    );
  }

  return response.json() as Promise<AnalyzeResponse>;
}

/**
 * Retrieves recent persisted security analyses for reporting.
 */
export async function getAnalyses(
  limit = 25,
): Promise<AnalysisHistoryItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/analyses?limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error(
      `Analysis history request failed (${response.status})`,
    );
  }

  return response.json() as Promise<AnalysisHistoryItem[]>;
}

/**
 * Retrieves the current risk posture derived from Ceron data.
 */
export async function getRiskSummary(): Promise<RiskSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/risk/summary`);

  if (!response.ok) {
    throw new Error(
      `Risk summary request failed (${response.status})`,
    );
  }

  return response.json() as Promise<RiskSummary>;
}

/**
 * Retrieves actionable remediation guidance for detected security findings.
 */
export async function getRemediationRecommendations(): Promise<
  RemediationRecommendation[]
> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/remediation/recommendations`,
  );

  if (!response.ok) {
    throw new Error(
      `Remediation request failed (${response.status})`,
    );
  }

  return response.json() as Promise<RemediationRecommendation[]>;
}

/**
 * Retrieves security assets that can be selected for a scan plan.
 */
export async function getAssets(): Promise<AssetRecord[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/assets`);

  if (!response.ok) {
    throw new Error(`Asset request failed (${response.status})`);
  }

  return response.json() as Promise<AssetRecord[]>;
}

/**
 * Retrieves persisted scan plans without executing them.
 */
export async function getScans(): Promise<ScanPlan[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/scans`);

  if (!response.ok) {
    throw new Error(`Scan request failed (${response.status})`);
  }

  return response.json() as Promise<ScanPlan[]>;
}

/**
 * Queues a scan plan for a known asset.
 */
export async function createScan(
  assetId: number,
  profile: ScanPlan["profile"],
): Promise<ScanPlan> {
  const response = await fetch(`${API_BASE_URL}/api/v1/scans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset_id: assetId,
      profile,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to queue scan (${response.status})`);
  }

  return response.json() as Promise<ScanPlan>;
}

/**
 * Retrieves recorded vulnerability findings.
 */
export async function getVulnerabilities(): Promise<
  VulnerabilityRecord[]
> {
  const response = await fetch(`${API_BASE_URL}/api/v1/vulnerabilities`);

  if (!response.ok) {
    throw new Error(`Vulnerability request failed (${response.status})`);
  }

  return response.json() as Promise<VulnerabilityRecord[]>;
}

/**
 * Records a manual or imported vulnerability finding for an asset.
 */
export async function createVulnerability(input: {
  assetId: number;
  identifier: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
}): Promise<VulnerabilityRecord> {
  const response = await fetch(`${API_BASE_URL}/api/v1/vulnerabilities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset_id: input.assetId,
      identifier: input.identifier,
      title: input.title,
      description: input.description || null,
      severity: input.severity,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to record vulnerability (${response.status})`);
  }

  return response.json() as Promise<VulnerabilityRecord>;
}

/**
 * Updates the lifecycle status of a recorded vulnerability.
 */
export async function updateVulnerabilityStatus(
  vulnerabilityId: number,
  status: VulnerabilityStatus,
): Promise<VulnerabilityRecord> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/vulnerabilities/${vulnerabilityId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to update vulnerability (${response.status})`);
  }

  return response.json() as Promise<VulnerabilityRecord>;
}

/**
 * Retrieves the cross-module operational overview for the dashboard.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/summary`);

  if (!response.ok) {
    throw new Error(`Dashboard request failed (${response.status})`);
  }

  return response.json() as Promise<DashboardSummary>;
}

/**
 * Retrieves safe runtime readiness information for operator settings.
 */
export async function getPlatformStatus(): Promise<PlatformStatus> {
  const response = await fetch(`${API_BASE_URL}/api/v1/platform/status`);

  if (!response.ok) {
    throw new Error(`Platform status request failed (${response.status})`);
  }

  return response.json() as Promise<PlatformStatus>;
}
