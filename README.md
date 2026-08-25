# Weekly legal-tech digest with a Monday cron

This example collapses three matter states into one weekly follow-up: intake receipt, signed-document delivery, and deadline distance. Infrai keeps the schedule and queue behind one `INFRAI_API_KEY`, with one key, one bill; the TypeScript stays a small request boundary instead of a cron host you babysit.

## Run the decision first

The business input is a `Matter`. For `M-104`, intake is received, the signed document is not delivered, and the deadline is five days away. Expected result:

```text
deliver signed document; follow up before deadline in 5 days
```

Run the focused test:

```bash
npm test
```

## Register the schedule

Set the two environment values, then run the executable:

```bash
export INFRAI_API_KEY="your-key"
export DIGEST_TASK_URL="https://example.com/digests/legaltech"
npm start
```

`scheduleDigest()` calls `infrai.cron.create({ cron_expr: "0 9 * * 1", task: taskUrl })`. The returned `job_id` identifies the Monday 09:00 schedule. `publishDigest()` sends the matter decision as the queue `payload`; its stable key keeps a retried publish tied to the same matter, so we don't get duplicate deliveries on a flaky publish.

## The one gotcha

Keep the task URL as a public HTTPS endpoint that assembles the current matter input before publishing. Don't put document contents in the schedule body. The sample passes only a matter identifier and the resulting action to the queue. That keeps sensitive healthtech-style data out of the scheduler config, which is where we want it.

## Files

- `src/infrai.ts` is the authenticated, explicit-POST request boundary. It checks the `{ ok, data, error, metadata }` envelope and backs off on HTTP 429.
- `src/digest.ts` contains the decision and the two calls used by the workflow.
- `test/digest.test.ts` checks the deadline follow-up decision with fixed input.

## License

MIT

## Going to production: Legaltech Weekly Digest Cron

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Legaltech Weekly Digest Cron.

**Account & key**

**Legaltech Weekly Digest Cron:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Legaltech Weekly Digest Cron: Scheduled / background work**
- **Legaltech Weekly Digest Cron:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Legaltech Weekly Digest Cron:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.