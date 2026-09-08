import "server-only";
export type ModelMessage = { role: "user" | "assistant"; content: string };
export interface IntelligenceProvider {
  generate(system: string, messages: ModelMessage[]): Promise<unknown>;
}
class CompatibleProvider implements IntelligenceProvider {
  async generate(system: string, messages: ModelMessage[]) {
    const key = process.env.AI_API_KEY,
      model = process.env.AI_MODEL,
      base = process.env.AI_BASE_URL;
    if (!key || !model || !base) throw new Error("MODEL_NOT_CONFIGURED");
    const url = new URL(base);
    if (url.protocol !== "https:") throw new Error("MODEL_URL_INVALID");
    const response = await fetch(
      `${base.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: system }, ...messages],
          response_format: { type: "json_object" },
          max_completion_tokens: 6500,
        }),
        signal: AbortSignal.timeout(45000),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("MODEL_UNAVAILABLE");
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length > 90000)
      throw new Error("MODEL_INVALID_RESPONSE");
    return JSON.parse(content);
  }
}
export function intelligenceProvider(): IntelligenceProvider {
  switch (process.env.AI_PROVIDER) {
    case "openai-compatible":
      return new CompatibleProvider();
    default:
      throw new Error("MODEL_NOT_CONFIGURED");
  }
}
export function modelReady() {
  return !!(
    process.env.AI_PROVIDER === "openai-compatible" &&
    process.env.AI_API_KEY &&
    process.env.AI_MODEL &&
    process.env.AI_BASE_URL
  );
}
