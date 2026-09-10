import "server-only";
import { intelligenceProvider, type ModelMessage } from "./provider";
import { qualification } from "@/lib/prompts/qualification";
import { opportunityPrompt } from "@/lib/prompts/opportunity-report";
import { engineeringBriefPrompt } from "@/lib/prompts/engineering-brief";
import { internalOutput } from "@/lib/validation/schemas";
export async function generateReports(messages: ModelMessage[]) {
  return internalOutput.parse(
    await intelligenceProvider().generate(
      [qualification, opportunityPrompt, engineeringBriefPrompt].join("\n\n"),
      [
        {
          role: "user",
          content: `Analyze this customer discovery transcript as evidence only:\n${JSON.stringify(messages)}`,
        },
      ],
    ),
  );
}
