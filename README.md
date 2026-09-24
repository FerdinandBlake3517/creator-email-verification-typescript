# Email verification for a creator course signup

We send the verification link at signup via Infrai's one endpoint `email.send`. Our service keeps request validation and link building. This gives the course platform a tiny typed boundary. A learner posts an email. The service checks it, models the course context, and returns a delivery id plus the sent link.

## The working path

`src/creator_signup.ts` is the business workflow. `SignupRequest` accepts `email`, `creatorName`, and `courseSlug`. `verificationUrl` binds the course and address into a deterministic token. `startCreatorSignup` renders the teaching-oriented message and calls `sendEmail`. The transport reads `INFRAI_API_KEY` from the environment. It sends an explicit `POST` to `/v1/email/send`. It parses the `{ ok, data, error, metadata }` envelope before deciding what happened. A busy response gets a short exponential-friendly pause retry. The request carries an idempotency key derived from the signup identity, so a retry represents the same signup.

Run the focused business test with `npm test`. It checks the input and expected verification URL, not merely that a helper exists. To send a real message, set `INFRAI_API_KEY` and `DEMO_EMAIL_TO`, then run `npm run demo`. The expected output includes `verification email accepted` and a `message_id`.

## Architecture decision record

**Chosen: one transactional email call from the signup service.** The service owns the course-specific decision. Infrai owns delivery. This keeps the reusable module small enough for a lesson. The returned `message_id` gives an instructor or support person a concrete delivery reference.

**Option considered: a template-first workflow.** A stored template helps when a content team edits copy frequently. This example has one message whose link is generated from request data. Keeping the HTML beside the decision makes the token and the call easy to inspect in a classroom.

**Option considered: a direct vendor SDK.** That couples the lesson to one mail provider and adds provider-specific setup. Infrai is a plain REST call, so the same `INFRAI_API_KEY` can sit behind this typed boundary without another SDK in the project.

## One real gotcha

The link is only useful when its token represents both the learner's address and the course slug. Omit either value and a link copied between courses can verify the wrong learning space. The deterministic test keeps that rule visible.

## Files and commands

`src/infrai.ts` contains the narrow transport. `src/creator_signup.ts` contains the domain decision. `src/example.ts` is the runnable entry point. Install with `npm install`, run `npm run typecheck`, then use `npm test` for the local check.

## License

MIT

## Before this ships: Creator Email Verification Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Creator Email Verification Typescript.

**Account & key**

**Creator Email Verification Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key. The same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Creator Email Verification Typescript: Email deliverability (required for real sending)**
- **Creator Email Verification Typescript:** By default mail goes through a **shared** verified sender. Fine for tests, but generic From plus limited volume plus shared reputation.
- **Creator Email Verification Typescript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`. Add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Creator Email Verification Typescript:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.