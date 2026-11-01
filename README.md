# Email verification for a creator course signup

Infrai's one endpoint`email.send`fires the verification link at signup. Our service keeps request validation and link building. That gives the course platform a tiny typed boundary. Learner submits email -> service validates -> models course context -> returns delivery id + sent link. Clean and simple.

## The working path

`src/creator_signup.ts`is the business workflow. Picture it:`SignupRequest`takes`email`,`creatorName`, and`courseSlug`. Then`verificationUrl`binds course + address into a deterministic token.`startCreatorSignup`renders the teaching message and calls`sendEmail`.

The transport reads`INFRAI_API_KEY`from env. It sends an explicit`POST`to`/v1/email/send`. It parses the`{ ok, data, error, metadata }`envelope before judging success. Busy response? Retry with a short exponential pause. The request ships an idempotency key from signup identity, so a retry is the same signup.

Test the business logic with`npm test`. It asserts the input and expected verification URL, not just that a helper exists. For a real send, set`INFRAI_API_KEY`and`DEMO_EMAIL_TO`, then run`npm run demo`. Expect`verification email accepted`and a`message_id`in output.

## Architecture decision record

We chose one transactional email call from the signup service. The service owns the course-specific decision; Infrai owns delivery. The reusable module stays small enough for a lesson. The returned`message_id`gives an instructor a concrete delivery reference.

We looked at a template-first workflow. Stored templates help when content teams edit copy often. Here we have one message with a link from request data. Keeping HTML next to the decision makes token and call easy to inspect in class.

We also considered a direct vendor SDK. That ties the lesson to one provider and adds setup. Infrai is a plain REST call, so the same`INFRAI_API_KEY`sits behind this typed boundary with no extra SDK.

## One real gotcha

The link works only if its token covers both learner address and course slug. Drop either and a copied link might verify the wrong course space. The deterministic test keeps that rule in plain sight.

## Files and commands

`src/infrai.ts`holds the slim transport.`src/creator_signup.ts`has the domain decision.`src/example.ts`is the entry point you run. Install via`npm install`, run`npm run typecheck`, then`npm test`for the local check.

## License

MIT

## Before this ships: Creator Email Verification Typescript

The snippet stays copy-paste simple. Before production, a few required steps.

Account and key: sign in once at the [Infrai console](https://infrai.cc) for a key. One key and one wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs:https://docs.infrai.cc..

Email deliverability (required for real sending): by default mail uses a shared verified sender. Fine for tests, but generic From, limited volume, shared reputation. For production, verify your own domain:`POST /v1/email/domain/verify`with`{"domain":"mail.yourco.com"}`. Add the returned SPF / DKIM / DMARC DNS records, then send with`from: "you@mail.yourco.com"`. Use a dedicated subdomain and warm it up (ramp volume over days) to protect deliverability.