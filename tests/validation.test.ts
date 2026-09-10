import { test } from "node:test";
import assert from "node:assert/strict";
import {
  contactSchema,
  discoveryOutput,
  opportunitySchema,
  turnSchema,
} from "../lib/validation/schemas";
test("contact requires explicit consent and supports individuals without company", () => {
  const contact = {
    name: "Test Person",
    email: "test@example.com",
    phone: "+60123456789",
    consent: true,
  };
  assert.equal(contactSchema.parse(contact).company, "");
  assert.equal(
    contactSchema.safeParse({ ...contact, consent: false }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...contact, email: "invalid" }).success,
    false,
  );
});
test("reject oversized messages and unexpected public model fields", () => {
  assert.equal(
    turnSchema.safeParse({ message: "x".repeat(4001), id: crypto.randomUUID() })
      .success,
    false,
  );
  const output = {
    reply: "Who would use it?",
    problem_summary: "An idea",
    desired_outcome: "",
    request_type: "Individual",
    missing_information: [],
    enough_information: false,
  };
  assert.equal(discoveryOutput.safeParse(output).success, true);
  assert.equal(
    discoveryOutput.safeParse({ ...output, internal_priority: "High" }).success,
    false,
  );
  assert.equal(
    discoveryOutput.safeParse({ ...output, request_type: "CEO" }).success,
    false,
  );
  assert.equal(
    opportunitySchema.shape.automation_potential.safeParse(101).success,
    false,
  );
  assert.equal(
    opportunitySchema.shape.automation_potential.safeParse(null).success,
    true,
  );
});
