export type Role = "student" | "teacher";
export type Subject = "TIF" | "Matematikk" | "Naturfag" | "Norsk" | "Engelsk";
export type Task = {
  id: string;
  title: string;
  description: string;
  hms: string;
  criteria: string;
  due: string;
  assignee: string;
  subjects: Subject[];
};
export type Entry = {
  id: string;
  title: string;
  text: string;
  images: string[];
  date: string;
  taskId: string;
  subjects: Subject[];
  reviewed: boolean;
  feedback: string;
  assessment: string;
};
export type Plan = {
  id: string;
  title: string;
  subjects: Subject[];
  duration: string;
  level: string;
  kind: string;
  content: string;
};
export type State = { tasks: Task[]; entries: Entry[]; plans: Plan[] };
export const subjects: Subject[] = [
  "TIF",
  "Matematikk",
  "Naturfag",
  "Norsk",
  "Engelsk",
];
export const subjectClass: Record<Subject, string> = {
  TIF: "tif",
  Matematikk: "math",
  Naturfag: "science",
  Norsk: "norwegian",
  Engelsk: "english",
};
export const initialState: State = {
  tasks: [
    {
      id: "task-1",
      title: "Fra råmateriale til ferdig aksling",
      description:
        "Planlegg og drei en aksling etter arbeidstegningen fra læreren. Mål diameteren underveis, dokumenter arbeidsprosessen og forklar hvordan du kontrollerer toleransene.",
      hms: "Bruk vernebriller og tettsittende arbeidstøy. Fest emnet forsvarlig. Stans maskinen før måling, og avklar arbeidet med læreren.",
      criteria:
        "Forklar valg av verktøy og turtall. Dokumenter målinger og reflekter over nøyaktighet og sikkerhet.",
      due: "2026-11-20",
      assignee: "Hele 1 TIF A",
      subjects: ["TIF", "Matematikk"],
    },
    {
      id: "task-2",
      title: "Materialene rundt oss",
      description:
        "Sammenlign to materialer fra verkstedet. Beskriv egenskaper, bruksområder og hvordan materialene kan gjenvinnes. Ta bilder og begrunn valgene dine.",
      hms: "Avklar håndtering av materialer med læreren. Bruk hansker ved skarpe kanter.",
      criteria:
        "Sammenlign materialegenskaper og drøft bærekraftige valg med egne ord.",
      due: "2026-11-24",
      assignee: "Hele 1 TIF A",
      subjects: ["TIF", "Naturfag", "Norsk"],
    },
    {
      id: "task-3",
      title: "Explain your tools",
      description:
        "Velg et verktøy du bruker ofte. Lag en kort forklaring på engelsk om hva det brukes til og hvordan det brukes trygt.",
      hms: "Vis verktøyet mens det er avslått.",
      criteria:
        "Bruk relevante engelske faguttrykk og forklar fremgangsmåten tydelig.",
      due: "2026-11-27",
      assignee: "Hele 1 TIF A",
      subjects: ["TIF", "Engelsk"],
    },
  ],
  entries: [
    {
      id: "entry-1",
      title: "Nøyaktighet i hver millimeter",
      text: "Jeg målte en aksling med skyvelære og sammenlignet målene med tegningen. Diameteren var 24,9 mm. Jeg lærte at jeg må måle flere steder og passe på at skyvelæret ligger rett.",
      images: [],
      date: "2026-11-11T10:00:00Z",
      taskId: "",
      subjects: ["TIF", "Matematikk"],
      reviewed: true,
      feedback:
        "God beskrivelse av måleprosessen, Emil! Neste gang kan du forklare hvordan avviket påvirker bruken av delen.",
      assessment:
        "Du viser at du kan bruke skyvelære og beskrive måleresultatet. Vi arbeider videre med toleranser.",
    },
    {
      id: "entry-2",
      title: "Stål eller aluminium?",
      text: "Vi undersøkte vekt og egenskaper ved stål og aluminium. Aluminium var lettere, mens stålet var hardere å bearbeide. Vi snakket om ombruk av avkapp.",
      images: [],
      date: "2026-11-10T12:00:00Z",
      taskId: "",
      subjects: ["TIF", "Naturfag"],
      reviewed: false,
      feedback: "",
      assessment: "",
    },
  ],
  plans: [],
};
/** Suggestions are deliberately local examples, never official curriculum quotations. */
export function suggestSubjects(text: string): Subject[] {
  const value = text.toLowerCase();
  const result: Subject[] = ["TIF"];
  if (
    /mål|beregn|vinkel|geometri|pytagoras|diameter|turtall|tolerans|aksling/.test(
      value,
    )
  )
    result.push("Matematikk");
  if (/material|stål|aluminium|energi|friksjon|sveis|varme|miljø/.test(value))
    result.push("Naturfag");
  if (/tekst|rapport|forklar|refleksjon|presentasjon/.test(value))
    result.push("Norsk");
  if (/engelsk|english|tools|manual/.test(value)) result.push("Engelsk");
  return result;
}
export const exampleGoals: Record<
  Subject,
  { theme: string; why: string; question: string }
> = {
  TIF: {
    theme: "Planlegging, gjennomføring og dokumentasjon av praktisk arbeid",
    why: "Arbeidsprosessen gir et utgangspunkt for å diskutere verktøyvalg, kvalitet og HMS.",
    question: "Hva ville du gjort annerledes neste gang, og hvorfor?",
  },
  Matematikk: {
    theme: "Måling, beregning og vurdering av nøyaktighet",
    why: "Mål, enheter og beregninger fra verkstedet kan undersøkes og forklares matematisk.",
    question:
      "Hvordan kan du kontrollere at målingene og beregningene dine er rimelige?",
  },
  Naturfag: {
    theme: "Materialegenskaper, energi og bærekraftige valg",
    why: "Valg av materialer og prosesser åpner for å undersøke egenskaper og ressursbruk.",
    question: "Hvilke egenskaper er viktige for materialet du valgte?",
  },
  Norsk: {
    theme: "Faglig kommunikasjon og refleksjon",
    why: "Beskrivelsen av arbeidet kan brukes til å øve på presist fagspråk og begrunnede valg.",
    question:
      "Hvordan ville du forklart fremgangsmåten til en som ikke kjenner verktøyet?",
  },
  Engelsk: {
    theme: "Engelsk fagspråk i praktiske arbeidssituasjoner",
    why: "Verktøy og prosesser kan beskrives på engelsk, med støtte i en faglig ordliste.",
    question: "Hvilke engelske faguttrykk trenger du for å forklare arbeidet?",
  },
};
export function createPlan(
  topic: string,
  selected: Subject[],
  duration: string,
  level: string,
  kind: string,
): string {
  return `${kind}: ${topic}\n\nRamme: ${duration} · ${level} · ${selected.join(", ")}\n\n1. Felles oppstart\nLa elevene beskrive hva de allerede vet om «${topic}». Avklar formål, materialer og HMS sammen med faglærer.\n\n2. Utforsk i praksis\nElevene planlegger og gjennomfører en avgrenset aktivitet om «${topic}» i par. De dokumenterer valg, observasjoner og resultater med bilder og tekst. Tilpass omfanget til ${duration.toLowerCase()} og ${level.toLowerCase()}.\n\n3. Knytt fagene sammen\n${selected.map((s) => `${s}: ${exampleGoals[s].theme}. ${exampleGoals[s].question}`).join("\n")}\n\n4. Refleksjon og deling\nHvert par deler ett faglig funn og én ting de vil undersøke videre. Sammenlign erfaringer i klassen.\n\nForslag til vurderingskriterier\n• Eleven begrunner valg og forklarer fremgangsmåten.\n• Eleven bruker relevante fagbegreper og dokumenterer resultater.\n• Eleven reflekterer over kvalitet, HMS og forbedringsmuligheter.\n\nLærer må tilpasse sikkerhet, utstyr, tidsbruk og offisielle kompetansemål før bruk.`;
}
const KEY = "fagvev-demo-v1";
export function loadState(): State {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) || "null");
    if (
      data &&
      typeof data === "object" &&
      "tasks" in data &&
      "entries" in data &&
      "plans" in data
    ) {
      const state = data as State;
      // Reject incompatible or malformed local data before rendering it.
      if (
        Array.isArray(state.tasks) &&
        Array.isArray(state.entries) &&
        Array.isArray(state.plans) &&
        state.tasks.every(
          (t) =>
            typeof t.title === "string" &&
            typeof t.id === "string" &&
            Array.isArray(t.subjects),
        ) &&
        state.entries.every(
          (e) =>
            typeof e.title === "string" &&
            typeof e.text === "string" &&
            Array.isArray(e.images) &&
            Array.isArray(e.subjects),
        ) &&
        state.plans.every(
          (p) => typeof p.content === "string" && Array.isArray(p.subjects),
        )
      )
        return state;
    }
  } catch {
    /* Missing storage or an older demo must not prevent startup. */
  }
  return structuredClone(initialState);
}
export function saveState(state: State) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Oslo",
  }).format(new Date(date));
}
