import { strict as assert } from "node:assert";
import { digestDecision } from "../src/digest.ts";

const decision = digestDecision({ matterId: "M-104", intakeReceived: true, signedDocumentDelivered: false, deadlineDays: 5 });
assert.equal(decision, "deliver signed document; follow up before deadline in 5 days");
console.log("digest decision test passed");
