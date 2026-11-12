import { test, expect, type Page } from "@playwright/test";
async function navigate(page: Page, name: string) {
  if (
    await page
      .getByRole("button", { name: "Åpne meny", exact: true })
      .isVisible()
  )
    await page.getByRole("button", { name: "Åpne meny", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Hovedmeny" })
    .getByRole("button", { name, exact: true })
    .click();
}
async function switchRole(page: Page, role: "elev" | "lærer") {
  await page.getByRole("button", { name: "Åpne demoinnstillinger" }).click();
  await page
    .getByRole("button", { name: `Bytt til ${role}`, exact: true })
    .click();
}
test("teacher assigns, student uploads and submits, teacher reviews, data survives reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Utforsk som lærer" }).click();
  await page
    .getByRole("button", { name: "Opprett oppgave", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tittel", { exact: true }).fill("Mål en ståldel");
  await dialog
    .getByLabel("Instruksjoner og innleveringskrav")
    .fill("Mål diameteren og forklar resultatet. Lever bilde og tekst.");
  await dialog
    .getByLabel("HMS og sikkerhet")
    .fill("Stans maskinen før måling.");
  await dialog
    .getByLabel("Vurderingskriterier")
    .fill("Forklar valg av måleverktøy.");
  await dialog.getByRole("button", { name: "Matematikk", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Opprett og tildel oppgave" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mål en ståldel", exact: true }),
  ).toBeVisible();
  await switchRole(page, "elev");
  await navigate(page, "Mine oppgaver");
  const card = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Mål en ståldel", exact: true }),
  });
  await card.getByRole("button", { name: "Se oppgaven" }).click();
  await dialog.getByRole("button", { name: "Dokumenter og lever" }).click();
  await page
    .getByLabel("Hva har du arbeidet med?")
    .fill("Måling av aksling i stål");
  await page
    .getByLabel("Fortell om arbeidet")
    .fill(
      "Jeg målte diameteren på en aksling av stål med skyvelære og fikk 24,9 mm. Jeg kontrollerte resultatet tre ganger.",
    );
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=",
    "base64",
  );
  await page.getByLabel("Last opp bilder", { exact: true }).setInputFiles({
    name: "verksted.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(page.getByAltText("Dokumentasjonsbilde 1")).toBeVisible();
  await page.getByRole("button", { name: "Lagre og se fagkoblinger" }).click();
  await expect(
    dialog.getByRole("heading", {
      name: "Måling av aksling i stål",
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Matematikk · DEMONSTRASJONSTEMA"),
  ).toBeVisible();
  await expect(dialog.getByText("Naturfag · DEMONSTRASJONSTEMA")).toBeVisible();
  await dialog.getByRole("button", { name: "Lukk", exact: true }).click();
  await switchRole(page, "lærer");
  await navigate(page, "Elevinnleveringer");
  await page
    .getByRole("button")
    .filter({
      has: page.getByRole("heading", { name: "Måling av aksling i stål" }),
    })
    .click();
  await dialog
    .getByLabel("Tilbakemelding til eleven")
    .fill("God bruk av skyvelære. Forklar toleransen neste gang.");
  await dialog
    .getByLabel("Faglig vurdering")
    .fill("Måleprosessen er dokumentert.");
  await dialog.getByRole("button", { name: "Lagre lærergjennomgang" }).click();
  await expect(
    dialog.getByText("Gjennomgått av lærer", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Lukk", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Utforsk som elev" }).click();
  await navigate(page, "Min læringsportefølje");
  await page
    .getByRole("button")
    .filter({
      has: page.getByRole("heading", { name: "Måling av aksling i stål" }),
    })
    .click();
  await expect(
    dialog.getByText("God bruk av skyvelære. Forklar toleransen neste gang.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(dialog.getByAltText("Arbeidsbilde 1")).toBeVisible();
  expect(errors).toEqual([]);
});
test("planner saves editable content and downloads it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Utforsk som lærer" }).click();
  await navigate(page, "Tverrfaglig planlegger");
  await page
    .getByLabel("Hva skal elevene arbeide med?")
    .fill("Sveise en ramme");
  await page.getByLabel("Varighet").selectOption("En uke");
  await page.getByRole("button", { name: "Lag undervisningsforslag" }).click();
  const editor = page.getByLabel("Rediger før du lagrer");
  await expect(editor).toHaveValue(/Sveise en ramme/);
  await editor.fill(
    (await editor.inputValue()) + "\nLærertilpasning: dokumenter vinklene.",
  );
  await page.getByRole("button", { name: "Lagre undervisningsplan" }).click();
  await navigate(page, "Mine undervisningsplaner");
  await page.locator("summary").filter({ hasText: "Sveise en ramme" }).click();
  await expect(
    page.getByText("Lærertilpasning: dokumenter vinklene.", { exact: false }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Last ned som tekst" }).click();
  expect((await download).suggestedFilename()).toBe(
    "fagvev-undervisningsplan.txt",
  );
});
test("navigation, search, keyboard dialogs and layout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Utforsk som elev" }).click();
  await navigate(page, "Mine oppgaver");
  await page.getByLabel("Søk i oppgaver").fill("finnes-ikke");
  await expect(
    page.getByRole("heading", { name: "Ingen oppgaver her ennå" }),
  ).toBeVisible();
  await navigate(page, "Spør FagVev");
  await page
    .getByRole("button", { name: "Hvordan kan jeg måle mer nøyaktig?" })
    .click();
  await page.getByRole("button", { name: "Send spørsmål" }).click();
  await expect(page.getByText("FagVev · demosvar")).toBeVisible();
  await page.getByRole("button", { name: "Åpne demoinnstillinger" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
