import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Network,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  Assistant,
  Connections,
  Documentation,
  Planner,
  TaskBuilder,
} from "./components/workflows";
import {
  DemoNotice,
  Modal,
  SectionTitle,
  Tags,
  WorkshopArt,
  subjectIcons,
} from "./components/ui";
import {
  dateLabel,
  initialState,
  loadState,
  saveState,
  subjects,
  type Entry,
  type Role,
  type State,
  type Subject,
  type Task,
} from "./lib/model";

type Page =
  | "home"
  | "document"
  | "tasks"
  | "connections"
  | "portfolio"
  | "assistant"
  | "planner"
  | "plans"
  | "classes"
  | "collaboration";
const titles: Record<Page, string> = {
  home: "Oversikt",
  document: "Dokumenter arbeid",
  tasks: "Mine oppgaver",
  connections: "Mine fagkoblinger",
  portfolio: "Min læringsportefølje",
  assistant: "Spør FagVev",
  planner: "Tverrfaglig planlegger",
  plans: "Mine undervisningsplaner",
  classes: "Mine klasser",
  collaboration: "Lærersamarbeid",
};
function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? "small" : ""}`}>
      <span className="brand-mark">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>
        Fag<span className="brand-light">Vev</span>
        <small>FRA PRAKSIS TIL KOMPETANSE</small>
      </span>
    </div>
  );
}
export default function App() {
  const [state, setState] = useState<State>(loadState);
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [mobile, setMobile] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [newTask, setNewTask] = useState(false);
  const [docTask, setDocTask] = useState("");
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [settings, setSettings] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [feedback, setFeedback] = useState("");
  const [assessment, setAssessment] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  function persist(next: State): boolean {
    try {
      saveState(next);
      setState(next);
      return true;
    } catch {
      setToast(
        "Kunne ikke lagre. Nettleserlagringen er full eller utilgjengelig. Prøv færre bilder.",
      );
      return false;
    }
  }
  function go(next: Page) {
    setPage(next);
    setMobile(false);
    setSearch("");
    setFilter("Alle");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function choose(next: Role) {
    setRole(next);
    go("home");
  }
  function openEntry(e: Entry) {
    setEntry(e);
    setFeedback(e.feedback);
    setAssessment(e.assessment);
  }
  function saveEntry(e: Entry) {
    if (!persist({ ...state, entries: [e, ...state.entries] })) return false;
    setToast("Dokumentasjonen er lagret. Se de mulige fagkoblingene nedenfor.");
    go("connections");
    openEntry(e);
    return true;
  }
  function review(e: FormEvent) {
    e.preventDefault();
    if (!entry) return;
    const updated = {
      ...entry,
      reviewed: true,
      feedback: feedback.trim(),
      assessment: assessment.trim(),
    };
    if (
      persist({
        ...state,
        entries: state.entries.map((v) => (v.id === entry.id ? updated : v)),
      })
    ) {
      setEntry(updated);
      setToast("Lærergjennomgangen er lagret og vises i elevdemonstrasjonen.");
    }
  }
  const pending = state.entries.filter((e) => !e.reviewed);
  const done = state.tasks.filter((t) =>
    state.entries.some((e) => e.taskId === t.id),
  );
  const nav =
    role === "teacher"
      ? [
          { page: "home" as Page, icon: LayoutDashboard },
          { page: "classes" as Page, icon: Users },
          { page: "portfolio" as Page, icon: FolderOpen },
          { page: "tasks" as Page, icon: BookOpen },
          { page: "planner" as Page, icon: Network },
          { page: "plans" as Page, icon: FileText },
          { page: "collaboration" as Page, icon: MessageCircle },
        ]
      : [
          { page: "home" as Page, icon: LayoutDashboard },
          { page: "document" as Page, icon: Plus },
          { page: "tasks" as Page, icon: BookOpen },
          { page: "connections" as Page, icon: Network },
          { page: "portfolio" as Page, icon: FolderOpen },
          { page: "assistant" as Page, icon: Sparkles },
        ];
  const label = (p: Page) =>
    role === "teacher" && p === "portfolio"
      ? "Elevinnleveringer"
      : role === "teacher" && p === "tasks"
        ? "Oppgaver"
        : titles[p];
  const filteredEntries = state.entries.filter(
    (e) =>
      (filter === "Alle" ||
        (filter === "Venter på gjennomgang"
          ? !e.reviewed
          : filter === "Gjennomgått"
            ? e.reviewed
            : e.subjects.includes(filter as Subject))) &&
      (e.title + " " + e.text).toLowerCase().includes(search.toLowerCase()),
  );
  const filteredTasks = state.tasks.filter(
    (t) =>
      (filter === "Alle" ||
        (filter === "Levert"
          ? done.some((d) => d.id === t.id)
          : !done.some((d) => d.id === t.id))) &&
      (t.title + " " + t.description)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function entryCard(e: Entry, i: number) {
    return (
      <button className="entry-card" key={e.id} onClick={() => openEntry(e)}>
        <div className={`entry-visual visual-${i % 3}`}>
          {e.images[0] ? (
            <img src={e.images[0]} alt={e.title} />
          ) : (
            <WorkshopArt variant={i + 2} />
          )}
          <span className="visual-label">
            {e.taskId ? "OPPGAVE" : "FRA VERKSTEDET"}
          </span>
          <span className="visual-arrow">
            <ArrowUpRight size={20} />
          </span>
        </div>
        <div className="entry-body">
          <div className="entry-date">
            {dateLabel(e.date)}
            <span className={e.reviewed ? "reviewed-dot" : "pending-dot"}>
              {e.reviewed ? "Gjennomgått" : "Dokumentert"}
            </span>
          </div>
          <h3>{e.title}</h3>
          <p>{e.text}</p>
          <Tags values={e.subjects} />
        </div>
      </button>
    );
  }
  if (!role)
    return (
      <div className="welcome">
        <header>
          <Logo />
          <span className="badge">Interaktiv prototype</span>
        </header>
        <main>
          <div className="welcome-copy">
            <span className="eyebrow">
              <span className="live-dot" /> LÆRING SOM HENGER SAMMEN
            </span>
            <h1>
              Fra det du <em>gjør.</em>
              <br />
              Til det du <em>forstår.</em>
            </h1>
            <p>
              Verkstedet er fullt av matematikk, naturfag og gode historier.
              FagVev hjelper deg å oppdage sammenhengene.
            </p>
            <div className="role-options">
              <button onClick={() => choose("student")}>
                <span className="tile-icon">
                  <GraduationCap size={25} />
                </span>
                <span>
                  <strong>Utforsk som elev</strong>
                  <small>Dokumenter, oppdag og lær</small>
                </span>
                <ArrowUpRight size={23} />
              </button>
              <button onClick={() => choose("teacher")}>
                <span className="tile-icon blue">
                  <Users size={25} />
                </span>
                <span>
                  <strong>Utforsk som lærer</strong>
                  <small>Koble fag og skap læring sammen</small>
                </span>
                <ArrowUpRight size={23} />
              </button>
            </div>
            <div className="welcome-meta">
              <ShieldCheck size={17} />
              Fiktive data. Ingen innlogging. Ingen betalte API-er.
            </div>
          </div>
          <div className="welcome-art">
            <div className="art-caption">
              <span className="live-dot" />
              VG1 TEKNOLOGI- OG INDUSTRIFAG
            </div>
            <WorkshopArt variant={0} />
            <div className="floating-tag tag-one">
              <Wrench size={18} />
              Praktisk arbeid
              <Check size={15} />
            </div>
            <div className="floating-tag tag-two">
              <Network size={18} />
              Nye fagkoblinger
            </div>
            <div className="welcome-art-bottom">
              <span>
                Én aktivitet.
                <br />
                <strong>Mange muligheter.</strong>
              </span>
              <ArrowDown size={30} />
            </div>
          </div>
        </main>
        <footer>
          <span>FagVev · Fra praksis til kompetanse</span>
          <span>TIF + Matematikk + Naturfag + Norsk + Engelsk</span>
        </footer>
      </div>
    );
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Hopp til innhold
      </a>
      {mobile && (
        <button
          aria-label="Lukk meny"
          className="sidebar-scrim"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Logo small />
          <button
            className="icon-button mobile-only"
            aria-label="Lukk meny"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>
        </div>
        <button className="school-switch" onClick={() => go("classes")}>
          <span className="school-icon">
            <GraduationCap size={19} />
          </span>
          <span>
            Fjordvik videregående<small>VG1 · Teknologi- og industrifag</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <span className="nav-heading">DITT LÆRINGSROM</span>
        <nav aria-label="Hovedmeny">
          {nav.map((n) => (
            <button
              className={page === n.page ? "nav-item active" : "nav-item"}
              key={n.page}
              aria-label={label(n.page)}
              onClick={() => go(n.page)}
              aria-current={page === n.page ? "page" : undefined}
            >
              <n.icon size={19} />
              <span>{label(n.page)}</span>
              {n.page === "tasks" && (
                <span className="nav-count">{state.tasks.length}</span>
              )}
              {n.page === "planner" && <span className="new-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span>
              <Leaf size={19} />
              Små steg. Stor utvikling.
            </span>
            <p>Alt du gjør i verkstedet, er en mulighet til å lære noe nytt.</p>
            <button
              onClick={() => go(role === "student" ? "connections" : "planner")}
            >
              Se sammenhengene
              <ArrowRight size={15} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <CircleHelp size={19} />
            Hjelp og om demoen
          </button>
          <button className="nav-item" onClick={() => setSettings(true)}>
            <Settings2 size={19} />
            Demoinnstillinger
          </button>
          <button
            className="profile"
            onClick={() => {
              setRole(null);
              setEntry(null);
              setTask(null);
            }}
          >
            <span className="avatar">{role === "student" ? "EB" : "IH"}</span>
            <span>
              <strong>
                {role === "student" ? "Emil Berg" : "Ingrid Hansen"}
              </strong>
              <small>
                {role === "student"
                  ? "Elev · 1 TIF A"
                  : "Lærer · TIF og matematikk"}
              </small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-only"
              aria-label="Åpne meny"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span>Ditt læringsrom</span>
            <ChevronRight size={14} />
            <strong>{label(page)}</strong>
          </div>
          <div className="top-actions">
            <button className="demo-pill" onClick={() => setHelp(true)}>
              <span />
              Demomodus
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Vis varsler"
              onClick={() => setNotifications(true)}
            >
              <Bell size={20} />
              {pending.length > 0 && <i />}
            </button>
            <button
              className="avatar small-avatar"
              onClick={() => setSettings(true)}
              aria-label="Åpne demoinnstillinger"
            >
              {role === "student" ? "EB" : "IH"}
            </button>
          </div>
        </header>
        <main
          id="main-content"
          className="main-content"
          key={`${role}-${page}`}
        >
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {role === "teacher"
                  ? "LÆRERROMMET"
                  : "VG1 TEKNOLOGI- OG INDUSTRIFAG"}
              </span>
              <h1>
                {page === "home"
                  ? role === "student"
                    ? "Hei, Emil!"
                    : "Hei, Ingrid!"
                  : label(page)}
                {page === "home" && <span className="greeting-mark">✳</span>}
              </h1>
              <p>
                {page === "home"
                  ? role === "student"
                    ? "Det du gjør i dag, er kompetansen du bygger for i morgen."
                    : "Skap sammenhenger. Gjør praktisk arbeid til felles læring."
                  : page === "planner"
                    ? "Koble praktisk arbeid med teori, refleksjon og nye muligheter."
                    : page === "portfolio"
                      ? "Arbeidet, refleksjonene og læringen – samlet på ett sted."
                      : page === "tasks"
                        ? "Et sted å starte. En mulighet til å lære."
                        : page === "connections"
                          ? "Oppdag fagene som finnes i det praktiske arbeidet ditt."
                          : page === "document"
                            ? "Ta vare på prosessen, ikke bare resultatet."
                            : "Fra praksis til kompetanse, ett steg om gangen."}
              </p>
            </div>
            {page === "home" ? (
              <button
                className="button primary"
                onClick={() =>
                  role === "student"
                    ? (setDocTask(""), go("document"))
                    : setNewTask(true)
                }
              >
                <Plus size={18} />
                {role === "student" ? "Dokumenter arbeid" : "Opprett oppgave"}
              </button>
            ) : (
              <button className="back-button" onClick={() => go("home")}>
                <ArrowLeft size={16} />
                Til oversikten
              </button>
            )}
          </div>
          {page === "home" && (
            <>
              <section className="hero-panel">
                <div className="hero-copy">
                  <span className="eyebrow">
                    <span className="live-dot" />
                    {role === "student"
                      ? "VERKSTEDET ER BARE BEGYNNELSEN"
                      : "SAMMEN OM LÆRINGEN"}
                  </span>
                  <h2>
                    {role === "student" ? (
                      <>
                        Du gjør mer
                        <br />
                        enn du tror.
                      </>
                    ) : (
                      <>
                        Ett verksted.
                        <br />
                        Mange fag.
                      </>
                    )}
                  </h2>
                  <p>
                    {role === "student"
                      ? "En måling blir matematikk. Et materialvalg blir naturfag. Oppdag hva som ligger i arbeidet ditt."
                      : "Gjør elevenes praktiske erfaringer til utgangspunkt for undervisning på tvers av fag."}
                  </p>
                  <button
                    className="button hero-button"
                    onClick={() =>
                      role === "student"
                        ? (setDocTask(""), go("document"))
                        : go("planner")
                    }
                  >
                    {role === "student"
                      ? "Hva har du gjort i dag?"
                      : "Planlegg på tvers av fag"}
                    <ArrowUpRight size={18} />
                  </button>
                </div>
                <div className="hero-art">
                  <WorkshopArt variant={1} />
                  <span className="hero-art-chip">
                    <Network size={16} />
                    Praksis + teori = forståelse
                  </span>
                </div>
                <div className="hero-number">01 / OPPDAG SAMMENHENGENE</div>
              </section>
              <div className="stats-grid">
                {[
                  {
                    icon: FolderOpen,
                    value: state.entries.length,
                    label:
                      role === "student"
                        ? "Dokumenterte aktiviteter"
                        : "Elevinnleveringer",
                    sub: "Små øyeblikk, viktig læring",
                    page: "portfolio" as Page,
                  },
                  {
                    icon: Network,
                    value: state.entries.reduce(
                      (sum, e) => sum + e.subjects.length,
                      0,
                    ),
                    label: "Mulige fagkoblinger",
                    sub: "På tvers av verksted og klasserom",
                    page:
                      role === "student"
                        ? ("connections" as Page)
                        : ("planner" as Page),
                  },
                  {
                    icon: BookOpen,
                    value:
                      role === "student"
                        ? state.tasks.length - done.length
                        : pending.length,
                    label:
                      role === "student"
                        ? "Oppgaver å utforske"
                        : "Venter på gjennomgang",
                    sub:
                      role === "student"
                        ? `${done.length} av ${state.tasks.length} oppgaver levert`
                        : "Gi elevene et nytt perspektiv",
                    page:
                      role === "student"
                        ? ("tasks" as Page)
                        : ("portfolio" as Page),
                  },
                ].map((s, i) => (
                  <button
                    className="stat-card"
                    key={s.label}
                    onClick={() => go(s.page)}
                  >
                    <span className={`stat-icon color-${i}`}>
                      <s.icon size={22} />
                    </span>
                    <div>
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                      <small>{s.sub}</small>
                    </div>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </div>
              <div className="dashboard-columns">
                <section>
                  <SectionTitle
                    title={
                      role === "student"
                        ? "Neste steg i verkstedet"
                        : "Dette venter på deg"
                    }
                    sub={
                      role === "student"
                        ? "Læring starter med å prøve."
                        : "Følg opp arbeidet i 1 TIF A."
                    }
                    action="Se alle oppgaver"
                    onAction={() => go("tasks")}
                  />
                  <div className="task-list">
                    {state.tasks.slice(0, 2).map((t, i) => (
                      <button
                        className="task-row"
                        key={t.id}
                        onClick={() => setTask(t)}
                      >
                        <span className={`task-icon color-${i}`}>
                          <Wrench size={23} />
                        </span>
                        <span className="task-summary">
                          <Tags values={t.subjects} />
                          <strong>{t.title}</strong>
                          <small>
                            <Clock3 size={13} />
                            Frist {dateLabel(t.due)}
                            <span>·</span>
                            {done.some((d) => d.id === t.id)
                              ? "Levert"
                              : "Ikke levert"}
                          </small>
                        </span>
                        <ChevronRight size={19} />
                      </button>
                    ))}
                  </div>
                  <div className="insight-card">
                    <span className="tile-icon">
                      <Sparkles size={22} />
                    </span>
                    <div>
                      <span className="eyebrow">EN LITEN TANKEVEKKER</span>
                      <h3>Hvor mye matematikk finnes i en aksling?</h3>
                      <p>
                        Diameter, turtall og toleranser. Praktisk arbeid er
                        fullt av faglige sammenhenger.
                      </p>
                      <button
                        className="text-button"
                        onClick={() =>
                          role === "student"
                            ? openEntry(
                                state.entries[0] || initialState.entries[0],
                              )
                            : go("planner")
                        }
                      >
                        Utforsk sammenhengen
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </section>
                <section className="learning-panel">
                  <SectionTitle
                    title={
                      role === "student"
                        ? "Din læring, litt etter litt"
                        : "Læring i fellesskap"
                    }
                  />
                  <p>
                    {role === "student"
                      ? "Hver aktivitet forteller en del av historien din."
                      : "Bygg bro mellom fagene i 1 TIF A."}
                  </p>
                  <div className="subject-map">
                    <div className="map-center">
                      <Network size={25} />
                      <strong>
                        {role === "student" ? "Ditt arbeid" : "1 TIF A"}
                      </strong>
                    </div>
                    {subjects.slice(1).map((s, i) => {
                      const Icon = subjectIcons[s];
                      return (
                        <div key={s} className={`map-node node-${i}`}>
                          <Icon size={18} />
                          <span>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="learning-note">
                    <span className="live-dot" />
                    Fagkoblinger viser muligheter for læring.
                  </div>
                  <p className="helper">
                    Kompetanse vurderes av læreren, aldri automatisk av KI.
                  </p>
                  <button
                    className="button secondary full"
                    onClick={() =>
                      go(role === "student" ? "connections" : "planner")
                    }
                  >
                    {role === "student"
                      ? "Se mine fagkoblinger"
                      : "Åpne planleggeren"}
                    <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <section className="recent-section">
                <SectionTitle
                  title={
                    role === "student"
                      ? "Fra din læringsportefølje"
                      : "Siste elevinnleveringer"
                  }
                  sub="Praktiske erfaringer. Nye perspektiver."
                  action="Se porteføljen"
                  onAction={() => go("portfolio")}
                />
                <div className="entries-grid">
                  {state.entries.slice(0, 3).map(entryCard)}
                  {state.entries.length < 3 && (
                    <button
                      className="add-entry-card"
                      onClick={() =>
                        role === "student"
                          ? (setDocTask(""), go("document"))
                          : go("portfolio")
                      }
                    >
                      <span>
                        <Plus size={26} />
                      </span>
                      <h3>
                        {role === "student"
                          ? "Hva blir ditt neste steg?"
                          : "Følg elevenes utvikling"}
                      </h3>
                      <p>
                        {role === "student"
                          ? "Ta vare på noe du lærte i dag."
                          : "Se dokumentasjon, gi tilbakemeldinger og vurder arbeidet."}
                      </p>
                      <strong>
                        {role === "student"
                          ? "Dokumenter arbeid"
                          : "Se innleveringer"}
                        <ArrowRight size={17} />
                      </strong>
                    </button>
                  )}
                </div>
              </section>
            </>
          )}
          {page === "document" && (
            <div className="document-layout">
              <section className="panel">
                <Documentation
                  tasks={state.tasks}
                  taskId={docTask}
                  onSave={saveEntry}
                  onCancel={() => go("home")}
                />
              </section>
              <aside className="document-tips">
                <span className="tile-icon">
                  <Leaf size={24} />
                </span>
                <h2>Det trenger ikke være perfekt.</h2>
                <p>
                  Det viktigste er å vise hva du har prøvd, og hva du tar med
                  deg videre.
                </p>
                {[
                  "Vis arbeidet fra flere vinkler.",
                  "Fortell om valgene du tok.",
                  "Skriv hva du vil øve mer på.",
                ].map((s, i) => (
                  <div className="tip-line" key={s}>
                    <span>0{i + 1}</span>
                    {s}
                  </div>
                ))}
                <div className="privacy-note">
                  <ShieldCheck size={20} />
                  <p>
                    Bruk bare fiktive data. Unngå navn, ansikter og
                    personopplysninger i bilder.
                  </p>
                </div>
              </aside>
            </div>
          )}
          {page === "tasks" && (
            <>
              <div className="toolbar">
                <div className="filter-tabs">
                  {["Alle", "Ikke levert", "Levert"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={filter === f ? "selected" : ""}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Search size={18} />
                  <input
                    aria-label="Søk i oppgaver"
                    placeholder="Søk i oppgaver"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                {role === "teacher" && (
                  <button
                    className="button primary"
                    onClick={() => setNewTask(true)}
                  >
                    <Plus size={16} />
                    Ny oppgave
                  </button>
                )}
              </div>
              <div className="assignment-grid">
                {filteredTasks.map((t) => (
                  <article className="panel assignment-card" key={t.id}>
                    <div className="assignment-top">
                      <span className="tile-icon">
                        <Wrench size={23} />
                      </span>
                      <span
                        className={`status ${done.some((d) => d.id === t.id) ? "green" : ""}`}
                      >
                        {done.some((d) => d.id === t.id)
                          ? "Levert"
                          : "Ikke levert"}
                      </span>
                    </div>
                    <Tags values={t.subjects} />
                    <h2>{t.title}</h2>
                    <p>{t.description}</p>
                    <div className="assignment-meta">
                      <span>
                        <Clock3 size={15} />
                        {dateLabel(t.due)}
                      </span>
                      <span>
                        <Users size={15} />
                        {t.assignee}
                      </span>
                    </div>
                    <button
                      className="button secondary full"
                      onClick={() => setTask(t)}
                    >
                      Se oppgaven
                      <ArrowRight size={17} />
                    </button>
                  </article>
                ))}
              </div>
              {!filteredTasks.length && (
                <div className="panel empty-state">
                  <BookOpen size={36} />
                  <h2>Ingen oppgaver her ennå</h2>
                  <p>Prøv et annet søk eller filter.</p>
                </div>
              )}
            </>
          )}
          {(page === "portfolio" || page === "connections") && (
            <>
              {page === "connections" && <DemoNotice />}
              <div className="toolbar">
                <div className="filter-tabs">
                  {(page === "connections"
                    ? ["Alle", ...subjects]
                    : ["Alle", "Venter på gjennomgang", "Gjennomgått"]
                  ).map((f) => (
                    <button
                      className={filter === f ? "selected" : ""}
                      onClick={() => setFilter(f)}
                      key={f}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Search size={18} />
                  <input
                    aria-label="Søk i dokumentasjon"
                    placeholder="Søk i dokumentasjon"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <div className="entries-grid">
                {filteredEntries.map(entryCard)}
              </div>
              {!filteredEntries.length && (
                <div className="panel empty-state">
                  <FolderOpen size={36} />
                  <h2>Ingen aktiviteter å vise</h2>
                  <p>
                    Prøv et annet filter eller dokumenter ditt første arbeid.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => {
                      setDocTask("");
                      go("document");
                    }}
                  >
                    Dokumenter arbeid
                  </button>
                </div>
              )}
              <p className="helper portfolio-legend">
                <span className="pending-dot">Dokumentert aktivitet</span>
                <span className="reviewed-dot">Gjennomgått av lærer</span>
                Gjennomgått betyr ikke at et kompetansemål er oppnådd.
              </p>
            </>
          )}
          {page === "planner" && (
            <Planner
              plans={state.plans}
              onSave={(p) => {
                if (persist({ ...state, plans: [p, ...state.plans] })) {
                  setToast("Undervisningsplanen er lagret.");
                  return true;
                }
                return false;
              }}
            />
          )}
          {page === "assistant" && <Assistant />}
          {page === "plans" && (
            <>
              <div className="section-title">
                <p>{state.plans.length} lagrede planer</p>
                <button
                  className="button primary"
                  onClick={() => go("planner")}
                >
                  <Plus size={17} />
                  Lag en plan
                </button>
              </div>
              {state.plans.length ? (
                state.plans.map((p) => (
                  <details className="panel saved-plan" key={p.id}>
                    <summary>
                      <span>
                        <Tags values={p.subjects} />
                        <strong>{p.title}</strong>
                        <small>
                          {p.duration} · {p.level} · {p.kind}
                        </small>
                      </span>
                      <ChevronDown size={20} />
                    </summary>
                    <p className="helper">
                      Lagret lærerutkast basert på en demonstrasjonsmal. Ikke
                      offisielle læreplanmål.
                    </p>
                    <pre>{p.content}</pre>
                    <button
                      className="button secondary"
                      onClick={() => {
                        const blob = new Blob([p.title + "\n\n" + p.content], {
                          type: "text/plain;charset=utf-8",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "fagvev-undervisningsplan.txt";
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                    >
                      Last ned som tekst
                      <ArrowDown size={16} />
                    </button>
                  </details>
                ))
              ) : (
                <div className="panel empty-state">
                  <FileText size={36} />
                  <h2>Gi en idé plass til å vokse</h2>
                  <p>
                    Lag og rediger ditt første undervisningsforslag i
                    planleggeren.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => go("planner")}
                  >
                    Åpne planleggeren
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </>
          )}
          {page === "classes" && (
            <>
              <DemoNotice>
                Fjordvik videregående og alle personer er fiktive. Klassen er et
                fast demoeksempel uten ekte brukere eller tilgangsstyring.
              </DemoNotice>
              <div className="class-layout">
                <section className="panel">
                  <span className="tile-icon">
                    <Users size={24} />
                  </span>
                  <h2>1 TIF A</h2>
                  <p>VG1 teknologi- og industrifag · Fjordvik videregående</p>
                  <div className="class-stats">
                    <span>
                      <strong>1</strong>demoelev
                    </span>
                    <span>
                      <strong>{state.tasks.length}</strong>oppgaver
                    </span>
                    <span>
                      <strong>{state.entries.length}</strong>aktiviteter
                    </span>
                  </div>
                  <div className="person-row">
                    <span className="avatar">EB</span>
                    <span>
                      <strong>Emil Berg</strong>
                      <small>Elev · Gruppe 1</small>
                    </span>
                    <button
                      className="text-button"
                      onClick={() => go("portfolio")}
                    >
                      Se arbeid
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <h2>Lærerteamet</h2>
                  {[
                    {
                      name: "Ingrid Hansen",
                      initials: "IH",
                      subject: "TIF og matematikk",
                    },
                    { name: "Jonas Vik", initials: "JV", subject: "Naturfag" },
                    {
                      name: "Sara Lund",
                      initials: "SL",
                      subject: "Norsk og engelsk",
                    },
                  ].map((p) => (
                    <div className="person-row" key={p.name}>
                      <span className="avatar">{p.initials}</span>
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.subject}</small>
                      </span>
                    </div>
                  ))}
                  <button
                    className="button secondary"
                    onClick={() => go("collaboration")}
                  >
                    Se felles temaer
                    <ArrowRight size={16} />
                  </button>
                </section>
              </div>
            </>
          )}
          {page === "collaboration" && (
            <>
              <DemoNotice>
                Felles temaer nedenfor er faste demoeksempler. Lagrede
                undervisningsplaner vises under «Mine undervisningsplaner».
                Ingen data deles med andre brukere.
              </DemoNotice>
              <SectionTitle
                title="Dette utforsker lærerteamet"
                sub="Fiktive undervisningstemaer for 1 TIF A."
              />
              <div className="assignment-grid">
                {[
                  {
                    name: "Jonas Vik",
                    subject: "Naturfag" as Subject,
                    title: "Energi og materialegenskaper",
                    text: "Hvordan påvirker varme egenskapene til metaller? Koble undersøkelser i naturfag til arbeid med sveising.",
                  },
                  {
                    name: "Ingrid Hansen",
                    subject: "Matematikk" as Subject,
                    title: "Geometri i verkstedet",
                    text: "Vinkler, diagonaler og Pytagoras. Undersøk sammenhengen mellom arbeidstegning og ferdig konstruksjon.",
                  },
                  {
                    name: "Sara Lund",
                    subject: "Engelsk" as Subject,
                    title: "Fagspråk som kan brukes",
                    text: "La elevene forklare verktøyvalg og arbeidsprosesser på engelsk med utgangspunkt i eget arbeid.",
                  },
                ].map((t) => (
                  <article className="panel assignment-card" key={t.title}>
                    <Tags values={[t.subject]} />
                    <h2>{t.title}</h2>
                    <p>{t.text}</p>
                    <small className="muted">{t.name} · Demoeksempel</small>
                    <button
                      className="button secondary full"
                      onClick={() => go("planner")}
                    >
                      Planlegg et samarbeid
                      <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          <footer className="app-footer">
            <span>
              <span className="brand-dot" />
              FagVev · Fra praksis til kompetanse
            </span>
            <button onClick={() => setHelp(true)}>
              Demonstrasjon med fiktive data
              <ArrowUpRight size={13} />
            </button>
          </footer>
        </main>
      </div>
      <Modal
        open={!!task}
        onClose={() => setTask(null)}
        title={task?.title || "Oppgave"}
      >
        {task && (
          <div className="form-stack">
            <Tags values={task.subjects} />
            <p className="detail-description">{task.description}</p>
            <div className="detail-meta">
              <span>
                <Clock3 size={16} />
                Frist {dateLabel(task.due)}
              </span>
              <span>
                <Users size={16} />
                {task.assignee}
              </span>
            </div>
            <section className="hms-block">
              <h3>
                <ShieldCheck size={19} />
                HMS først
              </h3>
              <p>{task.hms}</p>
            </section>
            <section>
              <h3>Dette ser læreren etter</h3>
              <p>{task.criteria}</p>
            </section>
            <p className="helper">
              Fagene er valgt av læreren. Oppgaven har ingen tilknyttede
              offisielle læreplanmål i denne demonstrasjonen.
            </p>
            {state.entries
              .filter((e) => e.taskId === task.id)
              .map((e) => (
                <button
                  className="submission-link"
                  key={e.id}
                  onClick={() => {
                    setTask(null);
                    openEntry(e);
                  }}
                >
                  <Check size={18} />
                  Levert: {e.title}
                  <ArrowRight size={17} />
                </button>
              ))}
            <button
              className="button primary"
              onClick={() => {
                setDocTask(task.id);
                setTask(null);
                go("document");
              }}
            >
              <Plus size={17} />
              {role === "student"
                ? "Dokumenter og lever"
                : "Prøv innlevering som demoelev"}
            </button>
          </div>
        )}
      </Modal>
      <Modal
        open={!!entry}
        onClose={() => setEntry(null)}
        title={entry?.title || "Dokumentasjon"}
        description="Emil Berg · 1 TIF A · Fiktiv elev"
      >
        {entry && (
          <div className="form-stack">
            {entry.images.length > 0 && (
              <div className="detail-images">
                {entry.images.map((src, i) => (
                  <img src={src} alt={`Arbeidsbilde ${i + 1}`} key={i} />
                ))}
              </div>
            )}
            <div className="entry-date">
              <span>{dateLabel(entry.date)}</span>
              <span className={`status ${entry.reviewed ? "green" : ""}`}>
                {entry.reviewed
                  ? "Gjennomgått av lærer"
                  : "Venter på gjennomgang"}
              </span>
            </div>
            <Connections entry={entry} />
            {entry.feedback && (
              <section className="feedback-block">
                <h3>
                  <MessageCircle size={19} />
                  Tilbakemelding fra Ingrid
                </h3>
                <p>{entry.feedback}</p>
                {entry.assessment && (
                  <>
                    <h4>Lærerens faglige vurdering</h4>
                    <p>{entry.assessment}</p>
                  </>
                )}
              </section>
            )}
            {role === "teacher" && (
              <form className="review-form form-stack" onSubmit={review}>
                <h3>Din gjennomgang som lærer</h3>
                <p className="helper">
                  Kontroller fagforslagene og skriv en tilbakemelding. Ingen mål
                  registreres automatisk som oppnådd.
                </p>
                <label>
                  Fagkoblinger
                  <SubjectEditor
                    entry={entry}
                    onChange={(updated) => {
                      if (
                        persist({
                          ...state,
                          entries: state.entries.map((e) =>
                            e.id === updated.id ? updated : e,
                          ),
                        })
                      )
                        setEntry(updated);
                    }}
                  />
                </label>
                <label>
                  Tilbakemelding til eleven
                  <textarea
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    maxLength={3000}
                  />
                </label>
                <label>
                  Faglig vurdering <span className="muted">(valgfritt)</span>
                  <textarea
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    rows={2}
                    maxLength={3000}
                  />
                </label>
                <button className="button primary">
                  <Check size={18} />
                  Lagre lærergjennomgang
                </button>
              </form>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={newTask}
        onClose={() => setNewTask(false)}
        title="Opprett en ny oppgave"
      >
        <TaskBuilder
          onSave={(t) => {
            if (persist({ ...state, tasks: [...state.tasks, t] })) {
              setNewTask(false);
              setToast("Oppgaven er opprettet og tildelt.");
              go("tasks");
            }
          }}
        />
      </Modal>
      <Modal
        open={help}
        onClose={() => setHelp(false)}
        title="Velkommen til FagVev"
      >
        <div className="form-stack">
          <p>
            FagVev bygger bro mellom praktisk arbeid og teori i VG1 teknologi-
            og industrifag.
          </p>
          <DemoNotice />
          <h3>Slik tester du prototypen</h3>
          <ol>
            <li>Opprett og tildel en oppgave i lærerdemonstrasjonen.</li>
            <li>
              Bytt til elev under demoinnstillinger og lever bilder og tekst.
            </li>
            <li>Utforsk mulige fagkoblinger og læringsporteføljen.</li>
            <li>Bytt til lærer og gi en tilbakemelding på innleveringen.</li>
          </ol>
          <h3>Om dataene dine</h3>
          <p>
            Alt lagres lokalt i nettleseren, inkludert opplastede bilder. Det er
            ingen innlogging, server, ekte KI-analyse eller offisiell
            læreplanintegrasjon. Nettleserdata kan slettes i demoinnstillingene.
            Bruk aldri ekte elevopplysninger.
          </p>
          <p>
            Administratorrolle, taleopptak og sikker deling mellom skoler kommer
            i senere utvikling.
          </p>
          <a href="https://www.udir.no/lk20/" target="_blank" rel="noreferrer">
            Se offisielle læreplaner hos Udir ↗
          </a>
        </div>
      </Modal>
      <Modal
        open={settings}
        onClose={() => setSettings(false)}
        title="Demoinnstillinger"
      >
        <div className="form-stack">
          <p>
            Bytt rolle for å følge hele arbeidsflyten. Rollene er
            demonstrasjoner uten autentisering.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              choose(role === "student" ? "teacher" : "student");
              setSettings(false);
            }}
          >
            Bytt til {role === "student" ? "lærer" : "elev"}
            <ArrowRight size={17} />
          </button>
          <hr />
          <h3>Tilbakestill demonstrasjonen</h3>
          <p>
            Sletter alle lokalt opprettede oppgaver, bilder, innleveringer,
            planer og vurderinger, og gjenoppretter eksempeldataene.
          </p>
          <ResetButton
            onReset={() => {
              if (persist(structuredClone(initialState))) {
                setSettings(false);
                setEntry(null);
                setTask(null);
                go("home");
                setToast("Demonstrasjonen er tilbakestilt.");
              }
            }}
          />
        </div>
      </Modal>
      <Modal
        open={notifications}
        onClose={() => setNotifications(false)}
        title="Varsler i demonstrasjonen"
      >
        <div className="form-stack">
          <p>
            {pending.length} dokumenterte aktiviteter venter på
            lærergjennomgang.
          </p>
          {pending.map((e) => (
            <button
              className="submission-link"
              key={e.id}
              onClick={() => {
                setNotifications(false);
                openEntry(e);
              }}
            >
              <FileText size={19} />
              {e.title}
              <ChevronRight size={18} />
            </button>
          ))}
          {!pending.length && <p>Alle aktiviteter er gjennomgått.</p>}
          <p className="helper">
            Dette er status fra denne nettleseren, ikke varsler fra en server.
          </p>
        </div>
      </Modal>
      {toast && (
        <div className="toast" role="status">
          <CircleHelp size={19} />
          <span>{toast}</span>
          <button aria-label="Lukk melding" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function SubjectEditor({
  entry,
  onChange,
}: {
  entry: Entry;
  onChange: (e: Entry) => void;
}) {
  return (
    <span className="subject-picker">
      {subjects.map((s) => (
        <button
          type="button"
          key={s}
          className={entry.subjects.includes(s) ? "selected" : ""}
          aria-pressed={entry.subjects.includes(s)}
          onClick={() =>
            onChange({
              ...entry,
              subjects: entry.subjects.includes(s)
                ? entry.subjects.filter((v) => v !== s)
                : [...entry.subjects, s],
            })
          }
        >
          {s}
        </button>
      ))}
    </span>
  );
}
function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <div className="form-stack">
      <p role="alert">
        Vil du slette alle lokale endringer? Dette kan ikke angres.
      </p>
      <div className="form-actions">
        <button className="button secondary" onClick={() => setConfirm(false)}>
          Avbryt
        </button>
        <button className="button danger" onClick={onReset}>
          Ja, tilbakestill alt
        </button>
      </div>
    </div>
  ) : (
    <button className="button danger" onClick={() => setConfirm(true)}>
      Tilbakestill demodata
    </button>
  );
}
