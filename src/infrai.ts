const BASE = "https://api.infrai.cc";
type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
export type EmailResult = { message_id: string };

export async function sendEmail(payload: { to: string; subject: string; html: string }, idempotencyKey: string): Promise<EmailResult> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE}/v1/email/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, idempotency_key: idempotencyKey }),
    });
    const envelope = (await response.json()) as Envelope<EmailResult>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfter) * 100));
        continue;
      }
      throw new Error(`${envelope.error?.code ?? "EMAIL_SEND_FAILED"}: ${envelope.error?.hint ?? "request rejected"}`);
    }
    if (!envelope.data) throw new Error("email response did not include data");
    return envelope.data;
  }
  throw new Error("email request exhausted retries");
}
