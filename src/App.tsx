import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Question = {
  id: string;
  text: string;
  options: string[];
  answer: number;
  points: number;
};
type Quiz = {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  status: "Published" | "Draft";
  questions: Question[];
  updated: string;
};
type Attempt = {
  id: string;
  quizTitle: string;
  score: number;
  total: number;
  date: string;
};
const q = (
  id: string,
  text: string,
  options: string[],
  answer: number,
): Question => ({ id, text, options, answer, points: 1 });
const starter: Quiz[] = [
  {
    id: "q1",
    title: "JavaScript Fundamentals",
    subject: "Development",
    description:
      "Test the essentials of modern JavaScript, from variables to functions.",
    duration: 15,
    status: "Published",
    updated: "Today",
    questions: [
      q(
        "a",
        "Which keyword declares a block-scoped variable that can be reassigned?",
        ["const", "let", "static", "define"],
        1,
      ),
      q(
        "b",
        "What does Array.map() return?",
        ["A new array", "The original array", "A number", "A boolean"],
        0,
      ),
      q(
        "c",
        "Which value represents an intentional absence of any object value?",
        ["false", "0", "null", "NaN"],
        2,
      ),
      q(
        "d",
        "Which method converts JSON text into a JavaScript object?",
        ["JSON.stringify()", "JSON.parse()", "Object.from()", "parse.JSON()"],
        1,
      ),
    ],
  },
  {
    id: "q2",
    title: "HTML & CSS Essentials",
    subject: "Design",
    description: "A quick review of foundational web markup and styling.",
    duration: 20,
    status: "Published",
    updated: "Yesterday",
    questions: [
      q(
        "e",
        "Which HTML element represents the main content of a page?",
        ["<section>", "<main>", "<header>", "<body-content>"],
        1,
      ),
      q(
        "f",
        "Which CSS property controls the space inside an element border?",
        ["margin", "gap", "padding", "spacing"],
        2,
      ),
      q(
        "g",
        "What does CSS Flexbox primarily help you do?",
        [
          "Store data",
          "Lay out items in one dimension",
          "Create queries",
          "Compress images",
        ],
        1,
      ),
    ],
  },
  {
    id: "q3",
    title: "TypeScript Essentials",
    subject: "Development",
    description: "Explore types, interfaces, and safer JavaScript patterns.",
    duration: 25,
    status: "Draft",
    updated: "Oct 18",
    questions: [
      q(
        "h",
        "Which keyword defines a named object shape in TypeScript?",
        ["interface", "struct", "shape", "object"],
        0,
      ),
      q(
        "i",
        "What does the question mark mean in name?: string?",
        ["Private", "Optional", "Read-only", "Promise"],
        1,
      ),
    ],
  },
  {
    id: "q4",
    title: "Product Design Principles",
    subject: "Design",
    description: "A short assessment on usability and product thinking.",
    duration: 12,
    status: "Published",
    updated: "Oct 16",
    questions: [
      q(
        "j",
        "What is the primary purpose of a usability test?",
        [
          "Validate how people use a design",
          "Choose a brand color",
          "Estimate server costs",
          "Set a deadline",
        ],
        0,
      ),
      q(
        "k",
        "Which principle helps users understand what action just occurred?",
        ["Affordance", "Feedback", "Consistency", "Hierarchy"],
        1,
      ),
    ],
  },
];
const seed: Attempt[] = [
  {
    id: "r1",
    quizTitle: "JavaScript Fundamentals",
    score: 8,
    total: 10,
    date: "Today, 10:42 AM",
  },
  {
    id: "r2",
    quizTitle: "HTML & CSS Essentials",
    score: 7,
    total: 10,
    date: "Yesterday, 3:18 PM",
  },
  {
    id: "r3",
    quizTitle: "Product Design Principles",
    score: 9,
    total: 10,
    date: "Oct 18, 11:05 AM",
  },
];
const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};
const blankQuestion = (): Question => ({
  id: crypto.randomUUID(),
  text: "",
  options: ["", "", "", ""],
  answer: 0,
  points: 1,
});
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
function App() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(() =>
      load("quizcraft.quizzes", starter),
    ),
    [attempts, setAttempts] = useState<Attempt[]>(() =>
      load("quizcraft.attempts", seed),
    );
  const [page, setPage] = useState("Overview"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All quizzes"),
    [editing, setEditing] = useState<Quiz | null>(null),
    [taking, setTaking] = useState<Quiz | null>(null),
    [answers, setAnswers] = useState<number[]>([]),
    [result, setResult] = useState<Attempt | null>(null);
  useEffect(
    () => localStorage.setItem("quizcraft.quizzes", JSON.stringify(quizzes)),
    [quizzes],
  );
  useEffect(
    () => localStorage.setItem("quizcraft.attempts", JSON.stringify(attempts)),
    [attempts],
  );
  const total = quizzes.reduce((n, x) => n + x.questions.length, 0),
    avg = attempts.length
      ? Math.round(
          attempts.reduce((n, x) => n + (x.score / x.total) * 100, 0) /
            attempts.length,
        )
      : 0;
  const filtered = useMemo(
    () =>
      quizzes.filter(
        (x) =>
          (filter === "All quizzes" || x.status === filter) &&
          `${x.title} ${x.subject}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [quizzes, filter, search],
  );
  const create = () => {
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      subject: "Development",
      description: "",
      duration: 15,
      status: "Draft",
      updated: "Just now",
      questions: [blankQuestion()],
    });
    setPage("Quizzes");
  };
  const edit = (x: Quiz) =>
    setEditing({
      ...x,
      questions: x.questions.map((y) => ({ ...y, options: [...y.options] })),
    });
  const save = () => {
    if (!editing?.title.trim()) return;
    const clean = {
      ...editing,
      questions: editing.questions.filter((x) => x.text.trim()),
      updated: "Just now",
    };
    if (!clean.questions.length) clean.questions = [blankQuestion()];
    setQuizzes((old) =>
      old.some((x) => x.id === clean.id)
        ? old.map((x) => (x.id === clean.id ? clean : x))
        : [clean, ...old],
    );
    setEditing(null);
  };
  const start = (x: Quiz) => {
    setTaking(x);
    setAnswers(Array(x.questions.length).fill(-1));
    setResult(null);
  };
  const submit = () => {
    if (!taking) return;
    const r = {
      id: crypto.randomUUID(),
      quizTitle: taking.title,
      score: taking.questions.reduce(
        (s, x, i) => s + (answers[i] === x.answer ? x.points : 0),
        0,
      ),
      total: taking.questions.reduce((s, x) => s + x.points, 0),
      date: "Just now",
    };
    setAttempts((x) => [r, ...x]);
    setResult(r);
    setTaking(null);
  };
  const initials = (s: string) =>
    s
      .split(/\s+/)
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const nav = [
    ["Overview", "▦"],
    ["Quizzes", "▤"],
    ["Results", "◷"],
  ];
  const status = (s: string) => (
    <span className={`status ${s === "Published" ? "published" : "draft"}`}>
      <i />
      {s}
    </span>
  );
  const footer = (
    <footer>
      © 2026 Quiz manager <span>Built for better learning.</span>
      <span className="footer-local">
        <i />
        Demo workspace · Data saved on this device
      </span>
    </footer>
  );
  return (
    <div className="shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#overview"
          onClick={() => setPage("Overview")}
        >
          <span className="brand-mark">q</span>
          <span>Quiz manager</span>
        </a>
        <div className="workspace">
          <div className="workspace-icon">S</div>
          <div>
            <strong>Studio workspace</strong>
            <small>Free plan</small>
          </div>
          <span className="chevron">⌄</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map(([name, icon]) => (
            <button
              key={name}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => {
                setPage(name);
                setEditing(null);
                setResult(null);
              }}
            >
              <span className="nav-icon">{icon}</span>
              {name}
              {name === "Quizzes" && (
                <span className="nav-count">{quizzes.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Make learning stick.</strong>
            <p>Build a quiz and see what your students really know.</p>
            <button onClick={create}>
              Create a quiz <span>↗</span>
            </button>
          </div>
          <button className="nav-item">
            <span className="nav-icon">⚙</span>Settings
          </button>
          <div className="profile">
            <div className="avatar">JD</div>
            <div className="profile-info">
              <strong>Jordan Davis</strong>
              <small>Workspace admin</small>
            </div>
            <span className="more">···</span>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>{result ? "Results" : taking ? "Take quiz" : page}</strong>
          </div>
          <div className="top-actions">
            <span className="local-pill">
              <i />
              Local demo
            </span>
            <button className="icon-button" aria-label="Notifications">
              ♧<i className="notification-dot" />
            </button>
            <div className="avatar avatar-small">JD</div>
          </div>
        </header>
        {taking ? (
          <div className="content quiz-take">
            <button className="back-link" onClick={() => setTaking(null)}>
              ← Exit quiz
            </button>
            <div className="take-head">
              <span className="eyebrow">
                {taking.subject} · {taking.duration} min
              </span>
              <h1>{taking.title}</h1>
              <p>{taking.description}</p>
              <div className="progress-line">
                <span
                  style={{
                    width: `${(answers.filter((x) => x >= 0).length / taking.questions.length) * 100}%`,
                  }}
                />
              </div>
              <small>
                {answers.filter((x) => x >= 0).length} of{" "}
                {taking.questions.length} answered
              </small>
            </div>
            {taking.questions.map((x, i) => (
              <article className="question-card" key={x.id}>
                <div className="question-meta">
                  <span>QUESTION {String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {x.points} point{x.points === 1 ? "" : "s"}
                  </span>
                </div>
                <h3>{x.text}</h3>
                <div className="answer-list">
                  {x.options.filter(Boolean).map((o, j) => (
                    <button
                      key={j}
                      className={`answer-option ${answers[i] === j ? "selected" : ""}`}
                      onClick={() =>
                        setAnswers((a) => a.map((v, k) => (i === k ? j : v)))
                      }
                    >
                      <span>{String.fromCharCode(65 + j)}</span>
                      {o}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            <div className="take-footer">
              <span>
                {answers.filter((x) => x >= 0).length} /{" "}
                {taking.questions.length} questions complete
              </span>
              <button
                className="primary"
                onClick={submit}
                disabled={answers.some((x) => x < 0)}
              >
                Submit answers →
              </button>
            </div>
          </div>
        ) : result ? (
          <div className="content result-page">
            <button
              className="back-link"
              onClick={() => {
                setResult(null);
                setPage("Results");
              }}
            >
              ← Back to results
            </button>
            <div className="score-card">
              <div className="score-icon">✦</div>
              <span className="eyebrow">QUIZ COMPLETE</span>
              <h1>
                {result.score}
                <span> / {result.total}</span>
              </h1>
              <p>
                {result.score === result.total
                  ? "Perfect score. Excellent work!"
                  : result.score / result.total >= 0.7
                    ? "Great work — you have a solid understanding."
                    : "Keep going — every attempt helps you improve."}
              </p>
              <strong>{result.quizTitle}</strong>
              <small>Completed {result.date}</small>
            </div>
            <div className="result-actions">
              <button
                className="secondary"
                onClick={() => {
                  const x = quizzes.find((y) => y.title === result.quizTitle);
                  if (x) start(x);
                }}
              >
                Try again
              </button>
              <button
                className="primary"
                onClick={() => {
                  setResult(null);
                  setPage("Quizzes");
                }}
              >
                Browse quizzes →
              </button>
            </div>
          </div>
        ) : editing ? (
          <div className="content builder">
            <button className="back-link" onClick={() => setEditing(null)}>
              ← Back to quizzes
            </button>
            <div className="builder-title">
              <div>
                <span className="eyebrow">QUIZ BUILDER</span>
                <h1>
                  {quizzes.some((x) => x.id === editing.id)
                    ? "Edit quiz"
                    : "Create a quiz"}
                </h1>
                <p>Set up your quiz, then add questions for your learners.</p>
              </div>
              <div className="builder-actions">
                <button className="secondary" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button className="primary" onClick={save}>
                  Save quiz →
                </button>
              </div>
            </div>
            <section className="builder-panel">
              <h2>Quiz details</h2>
              <p className="panel-subtitle">
                Give your quiz a clear title and a few helpful details.
              </p>
              <label className="field-label">
                QUIZ TITLE <span>*</span>
                <input
                  autoFocus
                  value={editing.title}
                  placeholder="e.g. Introduction to Biology"
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </label>
              <label className="field-label">
                DESCRIPTION
                <textarea
                  value={editing.description}
                  placeholder="What will learners be tested on?"
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </label>
              <div className="form-row">
                <label className="field-label">
                  SUBJECT
                  <select
                    value={editing.subject}
                    onChange={(e) =>
                      setEditing({ ...editing, subject: e.target.value })
                    }
                  >
                    {[
                      "Development",
                      "Design",
                      "Science",
                      "Business",
                      "General",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="field-label">
                  TIME LIMIT (MINUTES)
                  <input
                    type="number"
                    min="1"
                    value={editing.duration}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        duration: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="field-label">
                  STATUS
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        status: e.target.value as Quiz["status"],
                      })
                    }
                  >
                    <option>Draft</option>
                    <option>Published</option>
                  </select>
                </label>
              </div>
            </section>
            <div className="section-heading">
              <div>
                <h2>
                  Questions{" "}
                  <span className="question-count">
                    {editing.questions.length}
                  </span>
                </h2>
                <p>Choose the correct answer for each question.</p>
              </div>
            </div>
            {editing.questions.map((x, i) => (
              <section className="builder-panel question-builder" key={x.id}>
                <div className="q-builder-head">
                  <div>
                    <span className="q-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <strong>Multiple choice</strong>
                  </div>
                  <button
                    className="delete-button"
                    aria-label="Remove question"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        questions: editing.questions.filter(
                          (y) => y.id !== x.id,
                        ),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
                <label className="field-label">
                  QUESTION{" "}
                  <input
                    value={x.text}
                    placeholder="Write your question here..."
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        questions: editing.questions.map((y) =>
                          y.id === x.id ? { ...y, text: e.target.value } : y,
                        ),
                      })
                    }
                  />
                </label>
                <div className="options-grid">
                  {x.options.map((o, j) => (
                    <label
                      className={`option-field ${x.answer === j ? "correct" : ""}`}
                      key={j}
                    >
                      <span>{String.fromCharCode(65 + j)}</span>
                      <input
                        value={o}
                        placeholder={`Option ${String.fromCharCode(65 + j)}`}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            questions: editing.questions.map((y) =>
                              y.id === x.id
                                ? {
                                    ...y,
                                    options: y.options.map((v, k) =>
                                      k === j ? e.target.value : v,
                                    ),
                                  }
                                : y,
                            ),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="radio"
                        aria-label={`Mark option ${j + 1} correct`}
                        onClick={() =>
                          setEditing({
                            ...editing,
                            questions: editing.questions.map((y) =>
                              y.id === x.id ? { ...y, answer: j } : y,
                            ),
                          })
                        }
                      >
                        {x.answer === j ? "✓" : ""}
                      </button>
                    </label>
                  ))}
                </div>
                <div className="question-foot">
                  <span>
                    Click an option’s circle to mark the correct answer
                  </span>
                  <label>
                    POINTS{" "}
                    <input
                      type="number"
                      min="1"
                      value={x.points}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          questions: editing.questions.map((y) =>
                            y.id === x.id
                              ? { ...y, points: Number(e.target.value) }
                              : y,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
              </section>
            ))}
            <button
              className="add-question"
              onClick={() =>
                setEditing({
                  ...editing,
                  questions: [...editing.questions, blankQuestion()],
                })
              }
            >
              ＋ Add a question
            </button>
          </div>
        ) : page === "Overview" ? (
          <div className="content">
            <div className="welcome-row">
              <div>
                <div className="date-line">MONDAY, OCTOBER 20, 2026</div>
                <h1>
                  Good morning, Jordan <span className="wave">✳</span>
                </h1>
                <p>Here’s what’s happening across your workspace.</p>
              </div>
              <button className="primary" onClick={create}>
                ＋ Create a quiz
              </button>
            </div>
            <div className="stat-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total quizzes</span>
                  <span className="stat-icon lavender">▤</span>
                </div>
                <div className="stat-value">
                  {quizzes.length}
                  <span className="stat-delta">
                    ↗ {quizzes.filter((x) => x.status === "Published").length}{" "}
                    live
                  </span>
                </div>
                <small>Across all subjects</small>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Questions created</span>
                  <span className="stat-icon blue">☷</span>
                </div>
                <div className="stat-value">
                  {total}
                  <span className="stat-delta muted">in your library</span>
                </div>
                <small>Across all your quizzes</small>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Quiz attempts</span>
                  <span className="stat-icon amber">◷</span>
                </div>
                <div className="stat-value">
                  {attempts.length}
                  <span className="stat-delta muted">this workspace</span>
                </div>
                <small>Completed attempts</small>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Average score</span>
                  <span className="stat-icon green">◉</span>
                </div>
                <div className="stat-value">
                  {avg}%<span className="stat-delta muted">all attempts</span>
                </div>
                <small>Across completed quizzes</small>
              </article>
            </div>
            <div className="dashboard-grid">
              <section className="panel recent-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent quizzes</h2>
                    <p>Your latest work, all in one place.</p>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => setPage("Quizzes")}
                  >
                    View all →
                  </button>
                </div>
                <div className="quiz-list">
                  {quizzes.slice(0, 4).map((x) => (
                    <div className="quiz-row" key={x.id}>
                      <div className={`quiz-avatar tone-${slug(x.subject)}`}>
                        {initials(x.title)}
                      </div>
                      <div className="quiz-info">
                        <strong>{x.title}</strong>
                        <small>
                          {x.subject} <i /> {x.questions.length} questions <i />{" "}
                          {x.duration} min
                        </small>
                      </div>
                      {status(x.status)}
                      <button
                        className="row-menu"
                        aria-label="Edit quiz"
                        onClick={() => edit(x)}
                      >
                        ···
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="view-quizzes"
                  onClick={() => setPage("Quizzes")}
                >
                  View all quizzes →
                </button>
              </section>
              <section className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent activity</h2>
                    <p>The latest learner results.</p>
                  </div>
                </div>
                {attempts.slice(0, 4).map((x, i) => (
                  <div className="activity-row" key={x.id}>
                    <div className={`activity-avatar a${i % 4}`}>
                      {["AM", "KL", "RJ", "AS"][i % 4]}
                    </div>
                    <div className="activity-info">
                      <strong>
                        {
                          [
                            "Alex Morgan",
                            "Kai Lewis",
                            "Riley James",
                            "Avery Stone",
                          ][i % 4]
                        }{" "}
                        <span>completed</span>
                      </strong>
                      <small>{x.quizTitle}</small>
                    </div>
                    <div className="activity-score">
                      <strong>{Math.round((x.score / x.total) * 100)}%</strong>
                      <small>{x.date}</small>
                    </div>
                  </div>
                ))}
                <button
                  className="view-quizzes"
                  onClick={() => setPage("Results")}
                >
                  View all results →
                </button>
              </section>
            </div>
            <section className="bottom-banner">
              <div className="banner-spark">✳</div>
              <div>
                <strong>Ready to make something new?</strong>
                <p>
                  Great quizzes start with a good question. Build one in
                  minutes.
                </p>
              </div>
              <button onClick={create}>Create your first quiz →</button>
              <div className="banner-decor">✦</div>
            </section>
            {footer}
          </div>
        ) : page === "Quizzes" ? (
          <div className="content">
            <div className="page-heading">
              <div>
                <div className="date-line">YOUR LIBRARY</div>
                <h1>Quizzes</h1>
                <p>Create, organize, and share your assessments.</p>
              </div>
              <button className="primary" onClick={create}>
                ＋ Create a quiz
              </button>
            </div>
            <div className="library-toolbar">
              <div className="tabs">
                {["All quizzes", "Published", "Draft"].map((t) => (
                  <button
                    className={filter === t ? "selected" : ""}
                    onClick={() => setFilter(t)}
                    key={t}
                  >
                    {t}
                    <span>
                      {t === "All quizzes"
                        ? quizzes.length
                        : quizzes.filter((x) => x.status === t).length}
                    </span>
                  </button>
                ))}
              </div>
              <label className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search quizzes..."
                />
              </label>
            </div>
            <section className="quiz-library">
              {filtered.length ? (
                filtered.map((x) => (
                  <article className="library-card" key={x.id}>
                    <div className="library-card-top">
                      <div
                        className={`quiz-avatar large tone-${slug(x.subject)}`}
                      >
                        {initials(x.title)}
                      </div>
                      <button
                        className="row-menu"
                        aria-label="Edit quiz"
                        onClick={() => edit(x)}
                      >
                        ···
                      </button>
                    </div>
                    {status(x.status)}
                    <h3>{x.title}</h3>
                    <p>{x.description || "No description added yet."}</p>
                    <div className="library-meta">
                      <span>{x.questions.length} questions</span>
                      <span>·</span>
                      <span>{x.duration} min</span>
                      <span>·</span>
                      <span>{x.subject}</span>
                    </div>
                    <div className="library-actions">
                      <button className="secondary" onClick={() => edit(x)}>
                        Edit quiz
                      </button>
                      <button className="primary" onClick={() => start(x)}>
                        Take quiz →
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>⌕</span>
                  <h3>No quizzes found</h3>
                  <p>Try another search or create a new quiz.</p>
                  <button className="primary" onClick={create}>
                    Create a quiz
                  </button>
                </div>
              )}
            </section>
            {footer}
          </div>
        ) : (
          <div className="content">
            <div className="page-heading">
              <div>
                <div className="date-line">LEARNER PERFORMANCE</div>
                <h1>Results</h1>
                <p>Review scores from quizzes taken in this workspace.</p>
              </div>
            </div>
            <div className="results-summary">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total attempts</span>
                  <span className="stat-icon lavender">◷</span>
                </div>
                <div className="stat-value">{attempts.length}</div>
                <small>Recorded on this device</small>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Average score</span>
                  <span className="stat-icon green">◉</span>
                </div>
                <div className="stat-value">{avg}%</div>
                <small>Across all quiz attempts</small>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Quizzes available</span>
                  <span className="stat-icon blue">▤</span>
                </div>
                <div className="stat-value">
                  {quizzes.filter((x) => x.status === "Published").length}
                </div>
                <small>Published and ready to take</small>
              </article>
            </div>
            <section className="panel results-table-panel">
              <div className="panel-heading">
                <div>
                  <h2>All attempts</h2>
                  <p>Most recent quiz activity first.</p>
                </div>
                <span className="table-count">{attempts.length} attempts</span>
              </div>
              {attempts.length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>QUIZ</th>
                        <th>RESULT</th>
                        <th>SCORE</th>
                        <th>COMPLETED</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((x) => (
                        <tr key={x.id}>
                          <td>
                            <strong>{x.quizTitle}</strong>
                          </td>
                          <td>
                            <span
                              className={`score-pill ${x.score / x.total >= 0.7 ? "pass" : "low"}`}
                            >
                              {x.score / x.total >= 0.7
                                ? "Passed"
                                : "Keep practicing"}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {x.score} / {x.total}
                            </strong>
                            <span className="percent">
                              {" "}
                              · {Math.round((x.score / x.total) * 100)}%
                            </span>
                          </td>
                          <td>{x.date}</td>
                          <td>
                            <button
                              className="row-menu"
                              aria-label="View result"
                              onClick={() => setResult(x)}
                            >
                              →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <span>◷</span>
                  <h3>No attempts yet</h3>
                  <p>Take a published quiz to see results here.</p>
                  <button
                    className="primary"
                    onClick={() => setPage("Quizzes")}
                  >
                    Browse quizzes
                  </button>
                </div>
              )}
            </section>
            {footer}
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
