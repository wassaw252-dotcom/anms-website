import "server-only";
import { coreSystem } from "./core-system";
import { individualDiscovery } from "./individual-discovery";
import { businessDiscovery } from "./business-discovery";
import { enterpriseDiscovery } from "./enterprise-discovery";
export const discoveryPrompt = [
  coreSystem,
  individualDiscovery,
  businessDiscovery,
  enterpriseDiscovery,
  `Infer request type naturally; avoid forced category selection. Enough information means a meaningful problem/idea, desired outcome, current situation, intended users/people and at least relevant constraints or explicit unknowns have been discussed. Usually 4–8 exchanges; avoid unnecessary questions. It is okay to record unknowns. When enough, provide a short factual summary invitation to review and submit. Do not say a request is received or stored. The application collects contact/consent after discovery. Return JSON with exactly reply (string, max 1600 characters), problem_summary (string), desired_outcome (string), request_type (one of Individual, Entrepreneur, Business, Startup, SME, Team, Enterprise, Other), missing_information (array of strings), enough_information (boolean). All text fields max 2000 characters. No other keys.`,
].join("\n\n");
