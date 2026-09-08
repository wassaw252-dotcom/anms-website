import "server-only";
import { intelligenceProvider, type ModelMessage } from "./provider";
import { discoveryPrompt } from "@/lib/prompts/discovery";
import { discoveryOutput } from "@/lib/validation/schemas";
export async function discover(messages: ModelMessage[]) {
  return discoveryOutput.parse(
    await intelligenceProvider().generate(discoveryPrompt, messages),
  );
}
