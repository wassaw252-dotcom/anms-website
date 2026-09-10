import { z } from "zod";
export const requestTypes = [
  "Individual",
  "Entrepreneur",
  "Business",
  "Startup",
  "SME",
  "Team",
  "Enterprise",
  "Other",
] as const;
const short = z.string().max(2000);
const list = z.array(short).max(25);
const level = z.enum(["Low", "Medium", "High", "Unknown"]);
export const discoveryOutput = z
  .object({
    reply: z.string().min(1).max(1600),
    problem_summary: short,
    desired_outcome: short,
    request_type: z.enum(requestTypes),
    missing_information: list,
    enough_information: z.boolean(),
  })
  .strict();
export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(254),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()\-]{7,25}$/),
    company: z.string().trim().max(180).default(""),
    consent: z.literal(true),
  })
  .strict();
export const turnSchema = z
  .object({ message: z.string().trim().min(1).max(4000), id: z.uuid() })
  .strict();
export const opportunitySchema = z
  .object({
    request_type: z.enum(requestTypes),
    industry: short,
    primary_problem: short,
    desired_outcome: short,
    current_workflow: short,
    people_involved: short,
    repetitive_tasks: list,
    frequency: short,
    current_tools: list,
    business_impact: short,
    potential_opportunities: list,
    automation_potential: z.number().int().min(0).max(100).nullable(),
    potential_business_value: level,
    implementation_complexity: level,
    urgency: level,
    commercial_potential: level,
    human_oversight: short,
    potential_integrations: list,
    missing_information: list,
    engineering_questions: list,
    recommended_next_step: short,
    internal_priority: z.enum(["Low", "Medium", "High", "Critical", "Unknown"]),
    priority_reason: short,
  })
  .strict();
export const briefFields = [
  "problem_idea",
  "desired_outcome",
  "current_situation",
  "current_workflow",
  "pain_points",
  "relevant_systems",
  "potential_improvement_opportunities",
  "potential_automation_areas",
  "integration_considerations",
  "data_considerations",
  "human_oversight",
  "security_considerations",
  "scale_requirements",
  "known_constraints",
  "unknown_requirements",
  "risks",
  "questions_for_engineers",
  "preliminary_direction",
  "recommended_next_action",
] as const;
export const briefSchema = z
  .object(
    Object.fromEntries(briefFields.map((key) => [key, short])) as Record<
      (typeof briefFields)[number],
      typeof short
    >,
  )
  .strict();
export const internalOutput = z
  .object({ opportunity: opportunitySchema, brief: briefSchema })
  .strict();
export const statuses = [
  "NEW",
  "QUALIFIED",
  "UNDER REVIEW",
  "ENGINEERING REVIEW",
  "SOLUTION READY",
  "PROPOSAL",
  "WON",
  "LOST",
] as const;
export const statusSchema = z.enum(statuses);
export type DiscoveryOutput = z.infer<typeof discoveryOutput>;
export type ContactData = z.infer<typeof contactSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Brief = z.infer<typeof briefSchema>;
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  client_id: string | null;
};
