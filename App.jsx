import { useState, useEffect } from "react";

const WORKOUT_SKILL = `You are generating a group fitness workout for an experienced instructor with ~20 years of endurance sports background, USMS Level 1 Swim Coach certification, and deep expertise in older adult fitness and aqua/spin programming.

## Class Type Conventions

### Aqua Aerobics
- Water provides 12x resistance of air — cues should reference water, not air
- Structure: Thermal warm-up → Cardio peak (intervals or circuits) → Muscular endurance → Cool-down/stretch
- Intensity language: "push through the water", "slice vs. scoop", "use the water's resistance"
- Equipment options: noodles, water dumbbells, kickboards, ankle cuffs
- Safety: no jumping on pool deck; transitions should be smooth

### Spin / Cycling
- Structure: Warm-up (5-10 min) → Main set (intervals, climbs, sprints, or endurance) → Cool-down (5 min)
- Use RPE (1-10) and cadence (RPM) guidance
- Terrain language: flats, climbs, rollers, sprints, seated vs. standing
- Cue gear changes explicitly

### SilverSneakers (Older Adult Fitness)
- Population: 65+ adults; range from sedentary to active
- Always offer modifications (seated, reduced ROM, lighter resistance)
- Emphasize: balance, functional movement, fall prevention, joint safety
- Avoid: high-impact, rapid direction changes, deep flexion without support
- Tone: warm, encouraging, celebratory of effort
- Structure: Warm-up (10 min) → Cardio (10-15 min) → Strength (10-15 min) → Balance (5 min) → Cool-down/stretch (10 min)

## Output Format

Return a structured workout as markdown:

# [Class Type] Workout: [Theme]
**Duration:** X minutes | **Level:** [level]
**Equipment:** [list]

## Workout Overview
[2-3 sentences]

## Phase Breakdown

### Phase 1: Warm-Up ([X min])
| Time | Activity | Intensity | Cues |
|------|----------|-----------|------|

### Phase 2: [Main Work] ([X min])
[table]

### Phase 3: Cool-Down ([X min])
[table]

## Instructor Notes
[2-3 tips]

## Music Energy Arc
[Specific description of energy peaks, valleys, emotional tone, and approximate BPM ranges for each phase]`;

const MUSIC_SKILL = `You are curating music for a group fitness class. You have been given a complete workout structure. Select real songs that match each phase.

Music selection is contextual and emotional. Consider emotional resonance, lyric energy, and cultural fit.

Class-specific guidance:
- Aqua: upbeat pop, dance, reggae, Latin — strong clear beat
- Spin: EDM, rock, hip-hop for peaks; acoustic for cool-down; BPM-guided
- SilverSneakers: classic rock, oldies, Motown, familiar pop — NO heavy metal or explicit lyrics

Return ONLY this markdown — no preamble:

# Playlist: [Theme] ([Class Type])
**Total tracks:** X | **Estimated duration:** ~X minutes

## Phase 1: [Phase Name]
- Artist Name - Song Title

## Phase 2: [Phase Name]
- Artist Name - Song Title

[continue for all phases]

## Full Song List (for playlist script)
- Artist Name - Song Title
[complete flat list, all songs in order]

Rules: real songs only, 2-4 per phase, match energy arc, no repeated artists, exact titles for Spotify.`;

const PT_SKILL = `You are generating a personal training session for an experienced personal trainer with ~20 years of endurance sports background and expertise in strength, functional fitness, and endurance athlete programming.

Sessions are 1-on-1. Include coaching notes, form cues, sets/reps/rest, and regression/progression options.
Structure: Warm-up → Activation → Main Work → Finisher (optional) → Cool-down

Return a structured session as markdown:

# Personal Training Session: [Focus/Theme]
**Duration:** X minutes | **Level:** [level]
**Equipment:** [list]
**Session Goal:** [goal]

## Session Overview
[2-3 sentences]

## Phase Breakdown

### Warm-Up ([X min])
| Exercise | Duration/Reps | Notes |
|----------|--------------|-------|

### Activation ([X min])
| Exercise | Sets x Reps | Cues |
|----------|------------|------|

### Main Work ([X min])
| Exercise | Sets x Reps | Rest | Load Guidance | Cues |
|----------|------------|------|--------------|------|

### Finisher ([X min]) *(if applicable)*
[describe]

### Cool-Down ([X min])
| Stretch/Movement | Duration | Notes |
|-----------------|----------|-------|

## Trainer Notes
[2-3 coaching tips]

## Progressions & Regressions
[Key modifications]`;

const classTypes = ["Aqua Aerobics", "Spin / Cycling", "SilverSneakers", "Personal Training"];
const durations = ["30 min", "45 min", "60 min", "75 min"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const hasMusic = (ct) => ct !== "Personal Training";
const CLASS_ICONS = { "Aqua Aerobics": "🌊", "Spin / Cycling": "🚴", "SilverSneakers": "⭐", "Personal Training": "🏋️" };
const themes = {
  "Aqua Aerobics": ["Ocean Waves", "Summer Splash", "Tropical Escape", "Deep Dive", "Custom..."],
  "Spin / Cycling": ["Mountain Climb", "Grand Tour", "Night Ride", "Speed Demons", "Custom..."],
  "SilverSneakers": ["Garden Party", "Strong & Steady", "Decades of Dance", "Summer Stroll", "Custom..."],
  "Personal Training": ["Full Body Strength", "Lower Body Power", "Upper Body Focus", "Endurance Base", "Custom..."],
};

function extractSongList(md) {
  if (!md) return "";
  const idx = md.indexOf("## Full Song List");
  if (idx === -1) return "";
  return md.slice(idx).split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2).trim()).join("\n");
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  }
  legacyCopy(text);
  return Promise.resolve();
}

function legacyCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand("copy"); } catch {}
  document.body.removeChild(ta);
}

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40); }
function formatDate(iso) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

function MarkdownDisplay({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  return (
    <div style={{ fontFamily: "'Georgia', serif", lineHeight: 1.7, color: "#1a1a2e" }}>
      {lines.map((line, i) => {
        if (line.startsWith("# ")) return <h1 key={i} style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f3460", marginTop: "1.2rem", marginBottom: "0.4rem", borderBottom: "2px solid #e94560", paddingBottom: "0.3rem" }}>{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f3460", marginTop: "1rem", marginBottom: "0.3rem" }}>{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: "1rem", fontWeight: 600, color: "#e94560", marginTop: "0.8rem", marginBottom: "0.2rem" }}>{line.slice(4)}</h3>;
        if (/^\*\*.*\*\*$/.test(line)) return <p key={i} style={{ fontWeight: 600, margin: "0.2rem 0", fontSize: "0.9rem" }}>{line.replace(/\*\*/g, "")}</p>;
        if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: "1.2rem", margin: "0.15rem 0", display: "flex", gap: "0.5rem" }}><span style={{ color: "#e94560", flexShrink: 0 }}>•</span><span style={{ fontSize: "0.9rem" }}>{line.slice(2)}</span></div>;
        if (line.startsWith("|")) {
          const cells = line.split("|").filter(c => c.trim());
          const isHeader = lines[i + 1]?.includes("---");
          if (line.includes("---")) return null;
          return (
            <div key={i} style={{ display: "flex", background: isHeader ? "#0f3460" : i % 2 === 0 ? "#f8f9ff" : "white", borderBottom: "1px solid #e8eaf0" }}>
              {cells.map((cell, j) => <div key={j} style={{ flex: 1, padding: "0.3rem 0.6rem", fontSize: "0.82rem", color: isHeader ? "white" : "#1a1a2e", fontWeight: isHeader ? 600 : 400 }}>{cell.trim()}</div>)}
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} style={{ height: "0.35rem" }} />;
        return <p key={i} style={{ margin: "0.2rem 0", fontSize: "0.9rem" }}>{line}</p>;
      })}
    </div>
  );
}

function SpotifyPanel({ musicMd, title }) {
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);
  const songList = extractSongList(musicMd);
  const filename = `${slugify(title || "playlist")}-songs.txt`;
  const cmd = `python create-playlist.py ~/Downloads/${filename}`;

  function handleCopy(text, set) {
    copyToClipboard(text).then(() => {
      set(true);
      setTimeout(() => set(false), 2000);
    });
  }

  return (
    <div>
      {/* Instructions */}
      <div style={{ background: "#ebf8ff", border: "1px solid #63b3ed", borderRadius: 12, padding: "1.1rem 1.2rem", marginBottom: "1.2rem" }}>
        <div style={{ fontWeight: 700, color: "#2b6cb0", marginBottom: "0.5rem", fontSize: "0.9rem" }}>📋 How to create your Spotify playlist</div>
        <ol style={{ margin: 0, paddingLeft: "1.3rem", color: "#2c5282", fontSize: "0.82rem", lineHeight: 2 }}>
          <li>Copy the song list below</li>
          <li>Open a text editor, paste, and save as <code style={{ background: "#bee3f8", padding: "0 4px", borderRadius: 3 }}>{filename}</code> in your Downloads folder</li>
          <li>Run the command below in your terminal</li>
        </ol>
      </div>

      {/* Song list — always visible, auto-selects on focus */}
      <div style={{ marginBottom: "1.2rem" }}>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
          <button onClick={() => downloadFile(songList, filename)} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", background: "#38a169", color: "white", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
            ⬇ Download {filename}
          </button>
          <button onClick={() => handleCopy(songList, setCopied)} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid #38a169", background: "white", color: "#38a169", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
            {copied ? "✓ Copied!" : "Copy Song List"}
          </button>
        </div>
        <textarea
          readOnly
          value={songList || "No songs found."}
          onFocus={e => e.target.select()}
          onClick={e => e.target.select()}
          rows={Math.min(Math.max(songList.split("\n").length + 1, 4), 16)}
          style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", fontFamily: "monospace", fontSize: "0.82rem", lineHeight: 1.85, resize: "vertical", boxSizing: "border-box", color: "#1a1a2e", cursor: "text" }}
        />
      </div>

      {/* Terminal command */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <h3 style={{ color: "#0f3460", fontSize: "0.9rem", margin: 0 }}>Terminal Command</h3>
          <button onClick={() => handleCopy(cmd, setCmdCopied)} style={{ padding: "0.38rem 0.85rem", borderRadius: 7, border: "1px solid #4a5568", background: cmdCopied ? "#4a5568" : "white", color: cmdCopied ? "white" : "#4a5568", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s" }}>
            {cmdCopied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <div style={{ background: "#1a202c", borderRadius: 8, padding: "0.85rem 1.1rem" }}>
          <code style={{ color: "#68d391", fontSize: "0.85rem", fontFamily: "monospace", wordBreak: "break-all" }}>{cmd}</code>
        </div>
      </div>
    </div>
  );
}

function ArchiveCard({ entry, onLoad, onDelete }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", gap: "0.9rem" }}>
      <div style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>{CLASS_ICONS[entry.classType] || "💪"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {entry.classType}: {entry.theme}
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.73rem", marginTop: "0.15rem" }}>
          {entry.duration} · {entry.level} · {formatDate(entry.createdAt)}
          {entry.notes && <span style={{ marginLeft: "0.5rem", fontStyle: "italic", opacity: 0.7 }}>"{entry.notes.slice(0, 40)}{entry.notes.length > 40 ? "…" : ""}"</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
        <button onClick={() => onLoad(entry)} style={{ padding: "0.38rem 0.75rem", borderRadius: 7, border: "1px solid rgba(233,69,96,0.5)", background: "rgba(233,69,96,0.12)", color: "#e94560", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
          Load
        </button>
        <button onClick={() => onDelete(entry.id)} style={{ padding: "0.38rem 0.6rem", borderRadius: 7, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "0.78rem" }}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("form");
  const [classType, setClassType] = useState("Aqua Aerobics");
  const [duration, setDuration] = useState("60 min");
  const [level, setLevel] = useState("All Levels");
  const [theme, setTheme] = useState("Ocean Waves");
  const [customTheme, setCustomTheme] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState("form");
  const [workoutMd, setWorkoutMd] = useState("");
  const [musicMd, setMusicMd] = useState("");
  const [activeTab, setActiveTab] = useState("workout");
  const [error, setError] = useState("");
  const [archive, setArchive] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [resultMeta, setResultMeta] = useState({ classType: "", theme: "" });

  const finalTheme = theme === "Custom..." ? customTheme : theme;
  const isGenerating = step === "generating-workout" || step === "generating-music";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("workout-archive");
      if (saved) setArchive(JSON.parse(saved));
    } catch {}
  }, []);

  async function persistArchive(updated) {
    setArchive(updated);
    try { localStorage.setItem("workout-archive", JSON.stringify(updated)); } catch {}
  }

  async function callClaude(system, user) {
    const res = await fetch("/.netlify/functions/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages: [{ role: "user", content: user }] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ? JSON.stringify(data.error) : `HTTP ${res.status}`);
    return data.content?.[0]?.text || "";
  }

  async function generate() {
    setError(""); setStep("generating-workout");
    const isPT = classType === "Personal Training";
    try {
      const workout = await callClaude(
        isPT ? PT_SKILL : WORKOUT_SKILL,
        isPT
          ? `Generate a ${duration} personal training session with focus "${finalTheme}" at ${level}.${notes ? ` Notes: ${notes}` : ""}`
          : `Generate a ${duration} ${classType} workout, theme "${finalTheme}", ${level}.${notes ? ` Notes: ${notes}` : ""} Follow the output format exactly including Music Energy Arc.`
      );
      setWorkoutMd(workout);

      let music = "";
      if (!isPT) {
        setStep("generating-music");
        music = await callClaude(MUSIC_SKILL, `Workout:\n\n${workout}\n\nCurate a playlist matching this workout's energy arc. Follow the format exactly.`);
        setMusicMd(music);
      } else { setMusicMd(""); }

      const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, classType, theme: finalTheme, duration, level, notes, workoutMd: workout, musicMd: music, createdAt: new Date().toISOString() };
      setSaveStatus("saving");
      await persistArchive([entry, ...archive].slice(0, 50));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);

      setResultMeta({ classType, theme: finalTheme });
      setStep("done"); setActiveTab("workout");
    } catch (e) { setError("Something went wrong. Please try again."); setStep("form"); }
  }

  function loadEntry(entry) {
    setWorkoutMd(entry.workoutMd);
    setMusicMd(entry.musicMd || "");
    setResultMeta({ classType: entry.classType, theme: entry.theme });
    setStep("done"); setActiveTab("workout"); setView("form");
  }

  const pill = (active) => ({ padding: "0.5rem 0.85rem", borderRadius: 8, border: active ? "2px solid #e94560" : "1px solid rgba(255,255,255,0.18)", background: active ? "rgba(233,69,96,0.2)" : "rgba(255,255,255,0.05)", color: active ? "#e94560" : "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 700 : 400, transition: "all 0.15s" });
  const navBtn = (active) => ({ ...pill(active), padding: "0.5rem 1.2rem" });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f3460 0%, #1a1a2e 50%, #16213e 100%)", padding: "2rem 1rem", fontFamily: "'Trebuchet MS', sans-serif" }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(233,69,96,0.15)", border: "1px solid rgba(233,69,96,0.35)", borderRadius: 30, padding: "0.28rem 1rem", marginBottom: "0.7rem" }}>
            <span style={{ fontSize: "0.72rem", color: "#e94560", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Endorphin Designs</span>
          </div>
          <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: -1 }}>
            Workout + Playlist <span style={{ color: "#e94560" }}>Generator</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "0.4rem", fontSize: "0.82rem" }}>AI-powered class design with matched music</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.1rem" }}>
            <button onClick={() => setView("form")} style={navBtn(view === "form")}>✦ Generate</button>
            <button onClick={() => setView("archive")} style={{ ...navBtn(view === "archive"), display: "flex", alignItems: "center", gap: "0.4rem" }}>
              🗂 Archive
              {archive.length > 0 && <span style={{ background: "#e94560", color: "white", borderRadius: 10, padding: "0 0.4rem", fontSize: "0.68rem", fontWeight: 700 }}>{archive.length}</span>}
            </button>
          </div>
        </div>

        {/* Archive */}
        {view === "archive" && (
          archive.length === 0
            ? <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.7rem" }}>📭</div>
                <p style={{ margin: 0 }}>No saved workouts yet. Generate one and it'll appear here.</p>
              </div>
            : <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {archive.map(e => <ArchiveCard key={e.id} entry={e} onLoad={loadEntry} onDelete={id => persistArchive(archive.filter(x => x.id !== id))} />)}
              </div>
        )}

        {/* Generate */}
        {view === "form" && (
          <>
            {(step === "form" || isGenerating) && (
              <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>

                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: "0.5rem" }}>Class Type</label>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {classTypes.map(ct => (
                        <button key={ct} onClick={() => { setClassType(ct); setTheme(themes[ct][0]); }} style={{ ...pill(classType === ct), display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          {CLASS_ICONS[ct]} {ct}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: "0.5rem" }}>Duration</label>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {durations.map(d => <button key={d} onClick={() => setDuration(d)} style={pill(duration === d)}>{d}</button>)}
                    </div>
                  </div>

                  <div>
                    <label style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: "0.5rem" }}>Level</label>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {levels.map(l => <button key={l} onClick={() => setLevel(l)} style={pill(level === l)}>{l}</button>)}
                    </div>
                  </div>

                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: "0.5rem" }}>Theme</label>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {themes[classType].map(t => <button key={t} onClick={() => setTheme(t)} style={pill(theme === t)}>{t}</button>)}
                    </div>
                    {theme === "Custom..." && (
                      <input value={customTheme} onChange={e => setCustomTheme(e.target.value)} placeholder="Enter your theme..." style={{ marginTop: "0.6rem", width: "100%", padding: "0.6rem 0.9rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    )}
                  </div>

                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: "0.5rem" }}>
                      Additional Notes <span style={{ opacity: 0.45, textTransform: "none" }}>(optional)</span>
                    </label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. focus on core, client has knee issues, holiday theme..." rows={2} style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)", color: "white", fontSize: "0.85rem", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                  </div>
                </div>

                {error && <p style={{ color: "#e94560", marginTop: "1rem", fontSize: "0.83rem" }}>{error}</p>}

                <button onClick={generate} disabled={isGenerating || (theme === "Custom..." && !customTheme.trim())} style={{ marginTop: "1.5rem", width: "100%", padding: "0.95rem", borderRadius: 12, border: "none", background: isGenerating ? "rgba(233,69,96,0.35)" : "linear-gradient(135deg, #e94560, #c23152)", color: "white", fontSize: "0.95rem", fontWeight: 700, cursor: isGenerating ? "not-allowed" : "pointer", letterSpacing: 0.4 }}>
                  {step === "generating-workout" ? "⚡ Building your workout..." : step === "generating-music" ? "🎵 Curating your playlist..." : classType === "Personal Training" ? "Generate Training Session" : "Generate Workout + Playlist"}
                </button>

                {isGenerating && (
                  <div style={{ marginTop: "0.9rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "0.5rem", alignItems: "center" }}>
                    {(classType === "Personal Training" ? ["generating-workout"] : ["generating-workout", "generating-music"]).map((s, i) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: step === s ? "#e94560" : (s === "generating-workout" && step === "generating-music") ? "rgba(233,69,96,0.5)" : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />
                        <span style={{ color: step === s ? "#e94560" : "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>{i === 0 ? "Workout" : "Music"}</span>
                        {i === 0 && classType !== "Personal Training" && <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 0.2rem" }}>→</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === "done" && (
              <div>
                <div style={{ display: "flex", gap: "0.45rem", marginBottom: "0.9rem", flexWrap: "wrap", alignItems: "center" }}>
                  {(hasMusic(resultMeta.classType) ? ["workout", "music", "spotify"] : ["workout"]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...pill(activeTab === tab), padding: "0.55rem 1.1rem" }}>
                      {tab === "spotify" ? "🎵 Spotify Script" : tab === "workout" ? (resultMeta.classType === "Personal Training" ? "🏋️ Session Plan" : "💪 Workout") : "🎶 Playlist"}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {saveStatus === "saved" && <span style={{ color: "#68d391", fontSize: "0.76rem" }}>✓ Saved to archive</span>}
                    <button onClick={() => setStep("form")} style={{ padding: "0.5rem 0.9rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: "0.78rem" }}>
                      ← New
                    </button>
                  </div>
                </div>

                <div style={{ background: "white", borderRadius: 16, padding: "2rem", minHeight: 300 }}>
                  {activeTab === "workout" && <MarkdownDisplay content={workoutMd} />}
                  {activeTab === "music" && <MarkdownDisplay content={musicMd} />}
                  {activeTab === "spotify" && <SpotifyPanel musicMd={musicMd} title={resultMeta.theme} />}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
