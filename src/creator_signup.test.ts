import test from "node:test";
import assert from "node:assert/strict";
import { verificationUrl, SignupRequest } from "./creator_signup.js";

test("verification links bind the course and email", () => {
  const parsed = SignupRequest.parse({ email: "learner@example.com", creatorName: "Mina", courseSlug: "creative-writing" });
  assert.equal(verificationUrl(parsed.courseSlug, parsed.email), "https://learn.example/verify?token=Y3JlYXRpdmUtd3JpdGluZzpsZWFybmVyQGV4YW1wbGUuY29t");
});
