import { z } from "zod";
import { sendEmail, type EmailResult } from "./infrai.js";

export const SignupRequest = z.object({ email: z.string().email(), creatorName: z.string().min(1), courseSlug: z.string().min(1) });
export type SignupRequest = z.infer<typeof SignupRequest>;

export function verificationUrl(courseSlug: string, email: string): string {
  const token = Buffer.from(`${courseSlug}:${email}`).toString("base64url");
  return `https://learn.example/verify?token=${token}`;
}

export async function startCreatorSignup(input: unknown): Promise<{ accepted: true; message_id: string; verificationUrl: string }> {
  const request = SignupRequest.parse(input);
  const url = verificationUrl(request.courseSlug, request.email);
  const result: EmailResult = await sendEmail({
    to: request.email,
    subject: `Verify your ${request.courseSlug} creator account`,
    html: `<p>Hello ${request.creatorName},</p><p>Confirm your creator account for <b>${request.courseSlug}</b>:</p><p><a href="${url}">Verify email</a></p>`,
  }, `creator-signup:${request.email}:${request.courseSlug}`);
  return { accepted: true, message_id: result.message_id, verificationUrl: url };
}
