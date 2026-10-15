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
