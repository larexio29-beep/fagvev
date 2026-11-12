import { describe, expect, it } from "vitest";
import { createPlan, suggestSubjects } from "../src/lib/model";
describe("local demonstration suggestions", () => {
  it("links measurements and materials across subjects without assessing competence", () => {
    expect(
      suggestSubjects("Jeg målte diameter på en aksling av stål."),
    ).toEqual(["TIF", "Matematikk", "Naturfag"]);
  });
  it("does not invent extra subject links for an unknown activity", () => {
    expect(suggestSubjects("Jeg ryddet arbeidsplassen.")).toEqual(["TIF"]);
  });
  it("creates an editable template containing the requested topic and settings", () => {
    const plan = createPlan(
      "Bygg en ramme",
      ["TIF", "Matematikk"],
      "En uke",
      "VG1 · videre øving",
      "Praktisk oppgave",
    );
    expect(plan).toContain("Praktisk oppgave: Bygg en ramme");
    expect(plan).toContain("En uke · VG1 · videre øving · TIF, Matematikk");
    expect(plan).toContain("Måling, beregning");
    expect(plan).not.toContain("Materialegenskaper");
    expect(plan).toContain("Lærer må tilpasse");
  });
});
