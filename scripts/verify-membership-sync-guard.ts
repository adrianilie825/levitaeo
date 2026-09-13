import assert from "node:assert/strict";
import { resolveMembershipSubscriptionSyncDecision } from "../lib/membership/subscription-sync-guard";

function scenario(
  name: string,
  input: Parameters<typeof resolveMembershipSubscriptionSyncDecision>[0],
  expected: "apply" | "ignore",
) {
  const decision = resolveMembershipSubscriptionSyncDecision(input);
  assert.equal(
    decision.action,
    expected,
    `${name}: expected ${expected}, got ${decision.action}`,
  );
}

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2027-01-01T00:00:00.000Z";

scenario(
  "A. sub_A active + late sub_B canceled → sub_A remains",
  {
    existing: {
      stripeSubscriptionId: "sub_A",
      status: "active",
      currentPeriodStart: T1,
    },
    incoming: {
      stripeSubscriptionId: "sub_B",
      status: "canceled",
      currentPeriodStart: T2,
    },
  },
  "ignore",
);

scenario(
  "B. sub_A canceled + new sub_B active → sub_B replaces sub_A",
  {
    existing: {
      stripeSubscriptionId: "sub_A",
      status: "canceled",
      currentPeriodStart: T1,
    },
    incoming: {
      stripeSubscriptionId: "sub_B",
      status: "active",
      currentPeriodStart: T2,
    },
  },
  "apply",
);

scenario(
  "C. sub_B active + late sub_A updated → sub_B remains",
  {
    existing: {
      stripeSubscriptionId: "sub_B",
      status: "active",
      currentPeriodStart: T2,
    },
    incoming: {
      stripeSubscriptionId: "sub_A",
      status: "active",
      currentPeriodStart: T1,
    },
  },
  "ignore",
);

scenario(
  "C2. sub_B active + late sub_A canceled → sub_B remains",
  {
    existing: {
      stripeSubscriptionId: "sub_B",
      status: "active",
      currentPeriodStart: T2,
    },
    incoming: {
      stripeSubscriptionId: "sub_A",
      status: "canceled",
      currentPeriodStart: T1,
    },
  },
  "ignore",
);

scenario(
  "D. duplicate sub_B updated → idempotent apply",
  {
    existing: {
      stripeSubscriptionId: "sub_B",
      status: "active",
      currentPeriodStart: T2,
    },
    incoming: {
      stripeSubscriptionId: "sub_B",
      status: "active",
      currentPeriodStart: T2,
    },
  },
  "apply",
);

scenario(
  "E. first subscription → apply",
  {
    existing: null,
    incoming: {
      stripeSubscriptionId: "sub_A",
      status: "active",
      currentPeriodStart: T1,
    },
  },
  "apply",
);

scenario(
  "Re-subscribe race: sub_A active + sub_B active with later period → apply",
  {
    existing: {
      stripeSubscriptionId: "sub_A",
      status: "active",
      currentPeriodStart: T1,
    },
    incoming: {
      stripeSubscriptionId: "sub_B",
      status: "active",
      currentPeriodStart: T2,
    },
  },
  "apply",
);

console.log("All membership sync guard scenarios passed.");
