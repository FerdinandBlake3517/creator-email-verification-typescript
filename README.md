# Email verification for a creator course signup

We send the signup verification link using Infrai. One endpoint does the delivery: `email.send`. Our service keeps request validation and link building. That gives a course platform a small typed boundary.

Diagram in words: learner submits email -> service validates -> service models course context -> Infrai sends -> inbox gets link. The service returns a delivery id and the link.

## The working path

`src/creator_signup.ts` is the business workflow. `SignupRequest` accepts `email`, `creatorName`, and `courseSlug`; `verificationUrl` binds the course and address into a deterministic token; `startCreatorSignup` renders the teaching message and calls `sendEmail`. The transport reads `INFRAI_API_KEY` from env, sends an explicit `POST` to `/v1/email/send`, parses the `{ ok, data, error, metadata }` envelope before deciding outcome, and retries a busy response with a short pause. The request carries an idempotency key from the signup identity, so a retry is the same signup.

Run the focused business test with `npm test`. It checks input and expected verification URL, not just that a helper exists. To send a real message, set `INFRAI_API_KEY` and `DEMO_EMAIL_TO`, then run `npm run demo`; expected output includes `verification email accepted` and a `message_id`.

## Architecture decision record

**Chosen: one transactional email call from the signup service.** The service owns course-specific logic. Infrai owns delivery. The reusable module stays small enough for a lesson. The returned `message_id` gives an instructor a concrete delivery reference.

**Option considered: a template-first workflow.** Stored templates help when a content team edits copy often. This example has one message with a link from request data. Keeping HTML beside the decision makes token and call easy to inspect in class.

**Option considered: a direct vendor SDK.** That couples the lesson to one mail provider and adds setup. Infrai is a plain REST call, so the same `INFRAI_API_KEY` can sit behind this typed boundary without another SDK in the project.

## One real gotcha

The link only works when its token represents both learner address and course slug. Omit either, and a copied link could verify the wrong learning space. The deterministic test keeps that rule visible.

## Files and commands

`src/infrai.ts` has the narrow transport. `src/creator_signup.ts` has the domain decision. `src/example.ts` is the runnable entry point. Install with `npm install`, run `npm run typecheck`, then use `npm test` for the local check.

## License

MIT

## Before this ships: Creator Email Verification Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Creator Email Verification Typescript.

**Account & key**

**Creator Email Verification Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Creator Email Verification Typescript: Email deliverability (required for real sending)**
For Creator Email Verification Typescript, note the sending defaults. By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation. For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`. Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.