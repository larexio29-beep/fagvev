import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ImagePlus,
  X,
  Save,
  Sparkles,
  Send,
  Check,
  Plus,
} from "lucide-react";
import {
  createPlan,
  exampleGoals,
  subjects,
  suggestSubjects,
  type Entry,
  type Plan,
  type Subject,
  type Task,
} from "../lib/model";
import { DemoNotice, Tags, subjectIcons } from "./ui";

export function Documentation({
  tasks,
  onSave,
  onCancel,
  taskId = "",
}: {
  tasks: Task[];
  onSave: (e: Entry) => boolean;
  onCancel: () => void;
  taskId?: string;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selectedTask, setTask] = useState(taskId);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setLoading(true);
    try {
      if (images.length + files.length > 3)
        throw new Error("Du kan legge til maksimalt tre bilder.");
      const added: string[] = [];
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
          throw new Error("Velg et JPG-, PNG- eller WebP-bilde.");
        if (file.size > 8 * 1024 * 1024)
          throw new Error("Hvert bilde kan være opptil 8 MB.");
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const img = new Image();
        img.src = data;
        await img.decode();
        const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Nettleseren kunne ikke behandle bildet.");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        added.push(canvas.toDataURL("image/jpeg", 0.75));
      }
      setImages((old) => [...old, ...added]);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Kunne ikke lese bildet. Prøv en annen fil.",
      );
    } finally {
      setLoading(false);
      if (input.current) input.current.value = "";
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || text.trim().length < 20) {
      setError("Legg til en tittel og en forklaring på minst 20 tegn.");
      return;
    }
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      text: text.trim(),
      taskId: selectedTask,
      images,
      date: new Date().toISOString(),
      subjects: suggestSubjects(text),
      reviewed: false,
      feedback: "",
      assessment: "",
    });
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <DemoNotice>
        Bildene lagres kun i denne nettleseren. Ingen bilder analyseres eller
        sendes til en KI-tjeneste. Bruk bare fiktive data og bilder uten
        personer.
      </DemoNotice>
      <label>
        Knytt til en oppgave
        <select value={selectedTask} onChange={(e) => setTask(e.target.value)}>
          <option value="">Fri dokumentasjon</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Hva har du arbeidet med?
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          placeholder="For eksempel: Min første aksling"
        />
      </label>
      <div>
        <span className="field-label">
          Bilder fra arbeidet <span className="muted">(valgfritt)</span>
        </span>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-label="Last opp bilder"
          onChange={(e) => void upload(e.target.files)}
        />
        <button
          type="button"
          className="upload-area"
          onClick={() => input.current?.click()}
          disabled={loading}
        >
          <ImagePlus size={30} />
          <strong>
            {loading ? "Behandler bilder …" : "Legg til bilder fra verkstedet"}
          </strong>
          <span>JPG, PNG eller WebP · maks. 3 bilder, 8 MB per bilde</span>
        </button>
        {images.length > 0 && (
          <div className="image-previews">
            {images.map((src, i) => (
              <div key={i}>
                <img src={src} alt={`Dokumentasjonsbilde ${i + 1}`} />
                <button
                  type="button"
                  aria-label={`Fjern bilde ${i + 1}`}
                  onClick={() =>
                    setImages((old) => old.filter((_, j) => j !== i))
                  }
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <label>
        Fortell om arbeidet
        <textarea
          rows={5}
          required
          minLength={20}
          maxLength={5000}
          placeholder="Hva gjorde du? Hvilke verktøy brukte du? Hva lærte du underveis?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <p className="helper">
        Beskriv arbeidet med egne ord. Demoen foreslår fag fra nøkkelord i
        teksten. Taleopptak er ikke inkludert i denne versjonen.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Avbryt
        </button>
        <button className="button primary" disabled={loading}>
          <Sparkles size={17} />
          Lagre og se fagkoblinger
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}

export function Connections({ entry }: { entry: Entry }) {
  return (
    <div className="form-stack">
      <DemoNotice />
      <div className="activity-summary">
        <span className="eyebrow">DOKUMENTERT AKTIVITET</span>
        <h3>{entry.title}</h3>
        <p>{entry.text}</p>
        <Tags values={entry.subjects} />
      </div>
      <div className="connection-flow">
        <span>Din aktivitet</span>
        <ArrowRight size={18} />
        <span>Mulige fagkoblinger</span>
        <ArrowRight size={18} />
        <span>Lærers gjennomgang</span>
      </div>
      <p className="helper">
        Forslagene bygger på teksten din. Bildene analyseres ikke. Er
        beskrivelsen kort, legg til verktøy, materialer og målinger neste gang.
      </p>
      {entry.subjects.map((s) => {
        const Icon = subjectIcons[s];
        return (
          <article className="goal-card" key={s}>
            <div className="goal-heading">
              <span
                className={`subject-icon ${s === "TIF" ? "tif" : s === "Matematikk" ? "math" : "science"}`}
              >
                <Icon size={21} />
              </span>
              <div>
                <span className="eyebrow">{s} · DEMONSTRASJONSTEMA</span>
                <h3>{exampleGoals[s].theme}</h3>
              </div>
            </div>
            <p>{exampleGoals[s].why}</p>
            <div className="reflection">
              <strong>Tenk videre</strong>
              <p>{exampleGoals[s].question}</p>
            </div>
          </article>
        );
      })}
      <p className="helper">
        Dette er egenformulerte læringstemaer, ikke sitater fra Udir. Ingen
        kompetansemål blir markert som oppnådd. Offisielle læreplaner finner du
        på{" "}
        <a href="https://www.udir.no/lk20/" target="_blank" rel="noreferrer">
          udir.no/lk20
        </a>
        .
      </p>
    </div>
  );
}
export function TaskBuilder({ onSave }: { onSave: (task: Task) => void }) {
  const [selected, setSelected] = useState<Subject[]>(["TIF"]);
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      ["title", "description", "hms", "criteria"].some(
        (key) => !String(f.get(key) || "").trim(),
      ) ||
      !selected.length
    ) {
      setError("Fyll ut alle tekstfeltene og velg minst ett fag.");
      return;
    }
    onSave({
      id: crypto.randomUUID(),
      title: String(f.get("title")).trim(),
      description: String(f.get("description")).trim(),
      hms: String(f.get("hms")).trim(),
      criteria: String(f.get("criteria")).trim(),
      due: String(f.get("due")),
      assignee: String(f.get("assignee")),
      subjects: selected,
    });
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      <label>
        Tittel
        <input
          name="title"
          required
          maxLength={100}
          placeholder="Hva skal elevene utforske?"
        />
      </label>
      <label>
        Instruksjoner og innleveringskrav
        <textarea
          name="description"
          required
          rows={4}
          maxLength={5000}
          placeholder="Beskriv oppgaven og hva elevene skal levere …"
        />
      </label>
      <div>
        <span className="field-label">Fag</span>
        <SubjectPicker selected={selected} setSelected={setSelected} />
      </div>
      <label>
        HMS og sikkerhet
        <textarea
          name="hms"
          required
          rows={2}
          maxLength={2000}
          placeholder="Hvilke sikkerhetstiltak må elevene følge?"
        />
      </label>
      <label>
        Vurderingskriterier
        <textarea
          name="criteria"
          required
          rows={2}
          maxLength={2000}
          placeholder="Hva skal elevene vise og reflektere over?"
        />
      </label>
      <div className="form-grid">
        <label>
          Frist
          <input name="due" type="date" required defaultValue="2026-11-30" />
        </label>
        <label>
          Tildel til
          <select name="assignee">
            <option>Hele 1 TIF A</option>
            <option>Gruppe 1 · 1 TIF A</option>
            <option>Emil Berg</option>
          </select>
        </label>
      </div>
      <p className="helper">
        Fiktiv klasse. I elevdemonstrasjonen vises oppgaver tildelt 1 TIF A,
        Gruppe 1 og Emil Berg. Oppgavene deles kun i denne nettleseren.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="button primary">
        <Plus size={18} />
        Opprett og tildel oppgave
      </button>
    </form>
  );
}
export function SubjectPicker({
  selected,
  setSelected,
}: {
  selected: Subject[];
  setSelected: (s: Subject[]) => void;
}) {
  return (
    <div className="subject-picker">
      {subjects.map((s) => (
        <button
          type="button"
          key={s}
          aria-pressed={selected.includes(s)}
          className={selected.includes(s) ? "selected" : ""}
          onClick={() =>
            setSelected(
              selected.includes(s)
                ? selected.filter((v) => v !== s)
                : [...selected, s],
            )
          }
        >
          {selected.includes(s) && <Check size={14} />} {s}
        </button>
      ))}
    </div>
  );
}
export function Planner({
  onSave,
  plans,
}: {
  onSave: (p: Plan) => boolean;
  plans: Plan[];
}) {
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<Subject[]>(["TIF", "Matematikk"]);
  const [duration, setDuration] = useState("2 undervisningsøkter");
  const [level, setLevel] = useState("VG1 · grunnleggende");
  const [kind, setKind] = useState("Tverrfaglig prosjekt");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [generatedSettings, setGeneratedSettings] = useState({
    subjects: selected,
    duration,
    level,
    kind,
  });
  function generate(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim() || !selected.length) return;
    setContent(createPlan(topic.trim(), selected, duration, level, kind));
    setTitle(topic.trim());
    setGeneratedSettings({ subjects: [...selected], duration, level, kind });
    setSaved(false);
  }
  return (
    <div className="planner-layout">
      <div>
        <div className="panel">
          <div className="panel-heading">
            <span className="tile-icon">
              <Sparkles size={22} />
            </span>
            <div>
              <h2>Fra en idé til et felles prosjekt</h2>
              <p>Finn sammenhengene mellom verksted og klasserom.</p>
            </div>
          </div>
          <form className="form-stack" onSubmit={generate}>
            <label>
              Hva skal elevene arbeide med?
              <textarea
                required
                rows={3}
                maxLength={300}
                placeholder="For eksempel: Sveise en enkel konstruksjon med rette vinkler"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </label>
            <div>
              <span className="field-label">
                Hvilke fag vil du koble sammen?
              </span>
              <SubjectPicker selected={selected} setSelected={setSelected} />
            </div>
            <div className="form-grid">
              <label>
                Varighet
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option>2 undervisningsøkter</option>
                  <option>En halv dag</option>
                  <option>En uke</option>
                </select>
              </label>
              <label>
                Nivå
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>VG1 · grunnleggende</option>
                  <option>VG1 · videre øving</option>
                </select>
              </label>
            </div>
            <label>
              Aktivitetstype
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option>Tverrfaglig prosjekt</option>
                <option>Praktisk oppgave</option>
                <option>Teoretisk oppgave</option>
                <option>Undervisningsøkt</option>
              </select>
            </label>
            <button
              className="button primary"
              disabled={!selected.length || !topic.trim()}
            >
              <Sparkles size={18} />
              Lag undervisningsforslag
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
        <DemoNotice>
          Planleggeren bruker lokale tekstmaler. Forslaget er et utkast som må
          tilpasses av lærer, uten offisielle kompetansemål.
        </DemoNotice>
      </div>
      <div className="panel plan-result">
        {content ? (
          <>
            <div className="section-title">
              <h2>Ditt undervisningsutkast</h2>
              <span className="badge">Demonstrasjon</span>
            </div>
            <label>
              Plantittel
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaved(false);
                }}
                maxLength={300}
              />
            </label>
            <label>
              Rediger før du lagrer
              <textarea
                rows={22}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <button
              disabled={saved || !title.trim() || !content.trim()}
              className="button primary"
              onClick={() => {
                if (
                  onSave({
                    id: crypto.randomUUID(),
                    title: title.trim(),
                    ...generatedSettings,
                    content,
                  })
                )
                  setSaved(true);
              }}
            >
              {saved ? <Check size={17} /> : <Save size={17} />}{" "}
              {saved ? "Lagret i mine planer" : "Lagre undervisningsplan"}
            </button>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-orbit">
              <Sparkles size={34} />
            </div>
            <h2>Gode koblinger starter med en idé</h2>
            <p>
              Beskriv en aktivitet og velg fag. Her får du et redigerbart
              forslag til hvordan dere kan arbeide sammen.
            </p>
            <span>{plans.length} lagrede undervisningsplaner</span>
          </div>
        )}
      </div>
    </div>
  );
}
export function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([]);
  function ask(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    const found = suggestSubjects(q);
    const a = found.includes("Matematikk")
      ? "Når du måler i verkstedet, er det lurt å skrive ned både tallet og enheten. Mål flere ganger og sammenlign med arbeidstegningen. Prøv selv: En del skal være 25,0 mm, men du måler 24,8 mm. Hvor stort er avviket?"
      : found.includes("Naturfag")
        ? "Materialvalg handler om hva delen skal brukes til. Sammenlign for eksempel vekt, styrke, korrosjon og muligheten for gjenvinning. Hvilke to egenskaper er viktigst for delen du arbeider med?"
        : "Start med å beskrive hva du gjorde, hvorfor du valgte denne fremgangsmåten, og hva du lærte. Noter ett spørsmål du vil utforske videre med læreren. Spør alltid faglærer om HMS og bruk av maskiner.";
    setMessages((old) => [...old, { q, a }]);
    setQuestion("");
  }
  return (
    <div className="assistant panel">
      <DemoNotice>
        Dette er en demoassistent med forhåndsskrevne svar valgt fra nøkkelord.
        Den forstår ikke alle spørsmål og erstatter ikke veiledning fra
        faglærer.
      </DemoNotice>
      <div className="assistant-intro">
        <span className="tile-icon">
          <Sparkles size={28} />
        </span>
        <h2>La oss utforske det du lærer.</h2>
        <p>Prøv et av spørsmålene, eller skriv ditt eget.</p>
        <div className="prompt-chips">
          {[
            "Hvordan kan jeg måle mer nøyaktig?",
            "Hvordan velger jeg materiale?",
            "Hva kan jeg skrive i refleksjonen?",
          ].map((q) => (
            <button key={q} onClick={() => setQuestion(q)}>
              {q}
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      </div>
      <div className="messages" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i}>
            <p className="message question">{m.q}</p>
            <p className="message answer">
              <strong>FagVev · demosvar</strong>
              {m.a}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={ask} className="chat-form">
        <label className="sr-only" htmlFor="question">
          Ditt spørsmål
        </label>
        <input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Hva lurer du på?"
          maxLength={500}
          required
        />
        <button
          className="button primary"
          aria-label="Send spørsmål"
          disabled={!question.trim()}
        >
          <Send size={19} />
        </button>
      </form>
    </div>
  );
}
