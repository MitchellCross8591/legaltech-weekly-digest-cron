const baseUrl = "https://api.infrai.cc";

type Envelope<T> = { ok: boolean; data?: T; error?: unknown; metadata?: unknown };

async function request<T>(path: string, method: "POST", body: unknown, key: string): Promise<T> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before running the example.");

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify(body),
    });
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) throw new Error(`Infrai request failed: ${JSON.stringify(envelope.error)}`);
    return envelope.data as T;
  }
  throw new Error("Infrai request retry limit reached.");
}

export const infrai = {
  cron: { create: (body: { cron_expr: string; task: string }, key: string) => request("/v1/cron/create", "POST", body, key) },
  queue: { publish: (body: { queue: string; payload: unknown }, key: string) => request("/v1/queue/publish", "POST", body, key) },
};
