// Base URL for the Ceron backend.
//
// NEXT_PUBLIC_API_URL lets us change the backend address later
// without rewriting frontend code.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Result returned by an individual Ceron detector.
export interface DetectorResult {
  detected: boolean;
  type: string;
  severity: string;
  categories?: string[];
}

// Combined response returned by Ceron's analyzer.
export interface AnalyzeResponse {
  detected: boolean;
  severity: string;
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

  // Convert backend failures into a useful frontend error.
  if (!response.ok) {
    throw new Error(
      `Analysis request failed (${response.status})`,
    );
  }

  return response.json() as Promise<AnalyzeResponse>;
}