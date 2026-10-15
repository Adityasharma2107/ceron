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
