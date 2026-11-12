# FagVev – Fra praksis til kompetanse

En fungerende, mobiltilpasset demonstrasjon av en læringsplattform for **VG1 teknologi- og industrifag**, med koblinger til matematikk, naturfag, norsk og engelsk. Grensesnittet er på bokmål.

## Kom i gang

Krever Node.js **22.12 eller nyere** (utviklet med Node 24) og npm.

```sh
npm ci
npm run dev
```

Åpne adressen Vite oppgir i terminalen. Utviklingsserveren lytter på port 5173 og alle nettverksgrensesnitt. I skymiljøet åpnes appen gjennom miljøets visning av utviklingsserveren. Dersom npm ikke kan skrive til sin standard hurtigbuffer, bruk `npm ci --cache /tmp/fagvev-npm-cache`.

```sh
npm run build      # TypeScript-kontroll og produksjonsbygg til dist/
npm run preview    # Lokal gjennomgang av produksjonsbygget
npm test           # Logikktester med Vitest
npm run test:e2e    # Arbeidsflyter i Chromium, både mobil og PC
npm run format     # Formater kildekode og dokumentasjon
```

Nettlesertestene bruker `/usr/bin/chromium` når den finnes. Ellers installeres Playwrights nettleser med `npx playwright install chromium`. Du kan også sette `CHROMIUM_PATH` til en annen Chromium-installasjon. Playwright starter og stopper utviklingsserveren selv; en eksisterende server på port 5173 kan gjenbrukes lokalt.

## Test hele arbeidsflyten

1. Velg **Utforsk som lærer** og opprett en oppgave. Velg fag, frist og mottaker, og legg inn instruksjoner, HMS og vurderingskriterier.
2. Åpne **Demoinnstillinger**, og bytt til elev. **Mine oppgaver** viser også den nye oppgaven.
3. Åpne oppgaven og velg **Dokumenter og lever**. Legg til en tittel, et bilde og en forklaring. Fri dokumentasjon er også mulig uten en oppgave.
4. Se mulige fagkoblinger og refleksjonsspørsmål. Arbeidet finnes nå i **Min læringsportefølje** og beholdes ved sidelasting.
5. Bytt tilbake til lærer. Åpne **Elevinnleveringer**, kontroller og endre fagkoblingene, og lagre tilbakemelding og faglig vurdering. Eleven kan se tilbakemeldingen etter rollebytte.
6. Bruk **Tverrfaglig planlegger** til å lage et forslag ut fra et tema, fag, nivå, varighet og aktivitetstype. Rediger utkastet før lagring. **Mine undervisningsplaner** viser lagrede planer og lar deg laste dem ned som tekst.

Oppgavetildeling demonstrerer en klasse, en gruppe og en enkeltelev. Alle inneholder den samme fiktive eleven, Emil Berg. Klasse- og lærersamarbeidssidene viser tydelig merkede eksempeldata. Søk, filtre, varsler, demoassistent og tilbakestilling av lokale data er inkludert.

## Hva prototypen gjør – og begrensninger

- **Ingen ekte KI:** Fagkoblinger velges fra nøkkelord i teksten. Planleggeren bruker tekstmaler. Assistenten velger forhåndsskrevne svar. Bilder blir ikke analysert.
- **Ingen offisielle kompetansemål:** Egenformulerte demonstrasjonstemaer er merket som dette. Appen lenker til Udirs læreplaner, men har ingen læreplanintegrasjon og lagrer ingen oppnåelse av kompetansemål.
- **Lærerens vurdering er separat:** Dokumentert aktivitet, mulige fagkoblinger og lærergjennomgang har ulike merkelapper. En gjennomgang betyr ikke automatisk at kompetanse er oppnådd.
- **Kun lokal lagring:** Oppgaver, dokumentasjon, bilder, planer og tilbakemeldinger ligger i `localStorage` under `fagvev-demo-v1`. Ingen database, server, konto eller reell deling mellom brukere er koblet til. Rollebytte er ikke tilgangsstyring.
- **Bare fiktive data:** Bruk ikke ekte elevopplysninger eller bilder av personer. Opplastinger sendes ikke til noen API-er. Bilder komprimeres lokalt til maksimalt 1000 piksler på lengste side, med opptil tre bilder per aktivitet. Nettleserens lagringsgrense gjelder; en lagringsfeil varsles uten å lukke skjemaet.
- Taleopptak, administratorfunksjoner, innlogging, ekte flerbrukerfunksjonalitet og vedlegg til læreroppgaver er ikke implementert i denne første versjonen.

Data kan slettes via **Demoinnstillinger → Tilbakestill demodata** (krever bekreftelse), eller ved å slette nettleserens nettstedsdata. Data deles ikke mellom nettlesere eller enheter. Skrifttyper og ikoner leveres med bygget, uten eksterne fonttjenester eller betalte API-er.

## Struktur og videreutvikling

```text
src/
  App.tsx                   Navigasjon, dashboards og lærerens gjennomgang
  components/
    ui.tsx                  Radix-dialoger, fagmerker og verkstedillustrasjoner
    workflows.tsx           Dokumentasjon, fagkoblinger, oppgaver, planlegger og assistent
  lib/
    model.ts                Domenetyper, fiktive data, forslag og lokal lagring
  styles.css                Responsivt design og redusert bevegelse
  main.tsx                  Oppstart og lokalt leverte skrifttyper
 tests/
  model.test.ts             Tester av fagforslag og undervisningsmaler
  e2e/workflow.spec.ts       Sammenhengende brukerreiser på mobil og PC
```

React og TypeScript drives av Vite. Radix UI håndterer dialogenes fokus, tastatur og skjermleserbeskrivelser; Lucide leverer ikoner. Dataobjektene for oppgaver, dokumentasjon og planer er definert uten binding til en serverleverandør.

Neste steg er å erstatte lokal lagring med en serverbasert datatilgang og PostgreSQL, autentisering og skolebasert tilgangsstyring. Læreplandata bør importeres med kilde, fagkode og versjon før ekte mål kan knyttes til dokumentasjon. KI bør innføres bak serverbaserte grensesnitt for analyse, transkripsjon og undervisningsforslag, med lærerens kontroll beholdt. **API-nøkler skal aldri ligge i frontend.**

Før bruk med ekte elevdata må skoleeier avklare behandlingsgrunnlag, databehandleravtaler, lagring og sletting, logging, tilgangsstyring og eventuelt behov for personvernkonsekvensvurdering. Prototypen er laget for funksjonstesting med fiktive data.

## Test appen via GitHub Pages

Arbeidsflyten `.github/workflows/pages.yml` tester og bygger appen ved push til `main`, og publiserer `dist/` til GitHub Pages. Relative ressursadresser gjør at appen fungerer under repoets adresse, også på mobil.

1. Åpne repoets **Settings → Pages** på GitHub.
2. Velg **GitHub Actions** under **Build and deployment → Source**.
3. Åpne **Actions → Publish FagVev to GitHub Pages**. Kjør **Run workflow** på `main` hvis en publisering ikke allerede kjører.
4. Når publiseringen er grønn, åpner du nettstedadressen som vises under **Settings → Pages** eller i publiseringsjobben.

For dette repoet er standardadressen `https://larexio29-beep.github.io/fagvev/`, med mindre et eget domene er konfigurert. Lenken blir aktiv først etter en vellykket publisering. Tilgjengeligheten av Pages avhenger av repoets synlighet og GitHub-abonnement.

Pages-versjonen er den samme lokale demonstrasjonen: data lagres separat på hver enhet og nettleser, og rollevalg gir ingen autentisering. En publisert nettside kan være offentlig tilgjengelig; bruk kun fiktive opplysninger.
