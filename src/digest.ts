import { infrai } from "./infrai.ts";

export type Matter = {
  matterId: string;
  intakeReceived: boolean;
  signedDocumentDelivered: boolean;
  deadlineDays: number;
};

export function digestDecision(matter: Matter): string {
  const actions: string[] = [];
  if (!matter.intakeReceived) actions.push("request intake");
  if (!matter.signedDocumentDelivered) actions.push("deliver signed document");
  if (matter.deadlineDays <= 7) actions.push(`follow up before deadline in ${matter.deadlineDays} days`);
  return actions.length === 0 ? "no action" : actions.join("; ");
}

export async function scheduleDigest(taskUrl: string): Promise<string> {
  const result = await infrai.cron.create({ cron_expr: "0 9 * * 1", task: taskUrl }, "legaltech-weekly-digest");
  const job = result as { job_id?: string };
  if (!job.job_id) throw new Error("The schedule response did not include a job id.");
  return job.job_id;
}

export async function publishDigest(matter: Matter): Promise<void> {
  await infrai.queue.publish({ queue: "legaltech-digest", payload: { matter_id: matter.matterId, decision: digestDecision(matter) } }, `digest-${matter.matterId}`);
}

if (process.argv[1]?.endsWith("src/digest.ts")) {
  const taskUrl = process.env.DIGEST_TASK_URL;
  if (!taskUrl) throw new Error("Set DIGEST_TASK_URL before scheduling the digest.");
  console.log(await scheduleDigest(taskUrl));
}
