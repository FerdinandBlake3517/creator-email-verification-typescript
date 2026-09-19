import { startCreatorSignup } from "./creator_signup.js";

const email = process.env.DEMO_EMAIL_TO;
if (!email) throw new Error("Set DEMO_EMAIL_TO before running the example");
const result = await startCreatorSignup({ email, creatorName: "Mina", courseSlug: "creative-writing" });
console.log("verification email accepted", result);
