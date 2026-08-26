// Represents the severity levels used by Ceron's security engine.
export type Severity = "none" | "low" | "medium" | "high";

// Represents the result returned by an individual detector.
export interface DetectorResult {
  detected: boolean;
  type: string | null;
  severity: Severity;
  categories?: string[] | null;
}