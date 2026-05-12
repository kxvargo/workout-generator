import { useState, useEffect } from "react";

const WORKOUT_SKILL = `You are generating a group fitness workout for an experienced instructor with ~20 years of endurance sports background, USMS Level 1 Swim Coach certification, and deep expertise in older adult fitness and aqua/spin programming.

## Class Type Conventions

### Strong & Steady (Older Adult Standing Strength + Balance)
- Population: active older adults; all-standing format with chair available for support
- Equipment: chair (for support, not seated work), light dumbbells, resistance band
- Always offer modifications (chair-assisted, lighter resistance, reduced ROM)
- Emphasize: functional strength, balance, fall prevention, joint safety
- Avoid: high-impact, rapid direction changes, floor work
- Tone: warm, encouraging, celebratory of effort
- Structure: Warm-up (5 min) → Strength circuit (8 standing strength moves, with chair/weights/band) → Balance circuit (4 standing balance moves) → Cool-down/stretch (5 min)

### HIIT
- Population: intermediate to advanced; high-intensity interval training
- Equipment: optional dumbbells, mat
- Structure: Warm-up → 5-station circuit performed 3 rounds → Core (5 min) → Cool-down (5 min)
- Round 1: 5 strength/skill stations, NO cardio burnout between rounds
- Round 2: same 5 stations + cardio burnout finisher (e.g. jumping jacks, squat jumps, burpees)
- Round 3: same 5 stations + a DIFFERENT cardio burnout (e.g. mountain climbers, high knees, skaters)
- Cue clear work/rest intervals; intensity targets RPE 7-9 during work, RPE 3-4 during rest
- Always offer low-impact modifications for jumps and plyos

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
- Strong & Steady: classic rock, oldies, Motown, familiar pop with steady tempo — NO heavy metal or explicit lyrics
- HIIT: high-BPM EDM, hip-hop, hard rock — energy peaks during cardio burnouts, recovery tracks between rounds

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

// ─────────────────────────────────────────────────────────────────────────
// SONG-ALIGNED PROMPTS — for Spin and Aqua. Playlist is generated first,
// then a workout where each song carries its own intensity + coaching cues
// that reference that song's lyrics/hooks/tempo.
// ─────────────────────────────────────────────────────────────────────────

const SONG_PLAYLIST_SKILL = `You are curating a playlist for a group fitness class where each song will drive a specific block of the workout. You'll select REAL songs with accurate durations.

Class-specific guidance:
- Aqua: upbeat pop, dance, reggae, Latin — strong clear beat that swimmers can hear underwater. BPM 100-130. Songs build from gentle (warm-up) to peak (cardio) to muscular endurance to slow cool-down.
- Spin: EDM, rock, hip-hop, pop. BPM 75-105 for cadence work, 65-80 BPM for climbs. Build through warm-up → power intervals → peak climb → active recovery → cool-down.

Pick songs whose lyrics, hooks, and energy ARCS map naturally to workout phases. For example, a song with a strong recurring chorus drop is great for surges or standing intervals.

Return ONLY this markdown — no preamble:

# Playlist: [Theme] ([Class Type])
**Total tracks:** X | **Estimated duration:** ~X minutes

## Track Order with Phase Assignment
1. **[Artist] - [Song Title]** (~M:SS) — Phase: [Warm-Up / Build / Peak / Recovery / Cool-Down]
2. **[Artist] - [Song Title]** (~M:SS) — Phase: ...
[continue numbered list — every song gets a phase label]

## Full Song List (for playlist script)
- Artist Name - Song Title
[flat list, in order, exact titles for Spotify]

Rules: real songs only, exact titles for Spotify, no repeated artists, total duration must approximate the requested class length, energy arc must match the requested theme and class type.`;

const SONG_ALIGNED_WORKOUT_SKILL = `You are an experienced group fitness instructor (~20 years endurance sports, USMS Level 1 Swim Coach, expert in aqua and spin programming). You've been given a finalized playlist for an upcoming class. Write the class as a SONG-BY-SONG workout where each song's coaching block references that specific song's hooks, lyrics, beat, and energy.

## Class Type Conventions

### Aqua Aerobics
- Water provides 12x resistance of air — cues should reference water, not air
- Intensity language: "push through the water", "slice vs. scoop", "use the water's resistance"
- Equipment options: noodles, water dumbbells, kickboards, ankle cuffs
- Safety: no jumping on pool deck; transitions smooth; always offer a "one foot down" modification
- Phases: Warm-Up (Gentle Tide) → Cardio Peak (Building Swells) → Muscular Endurance (Wave Power) → Cool-Down (Calm Waters)
- Per-song metadata to include: Duration, RPE, Activity name, Modification option

### Spin / Cycling
- Use RPE (1-10) and cadence (RPM) guidance per song
- Terrain language: flats, climbs, rollers, sprints, seated vs. standing
- Cue gear changes explicitly
- Phases: Warm-Up → Main Set (Intervals & Power) → Active Recovery → Cool-Down
- Per-song metadata to include: Duration, RPE, Cadence (RPM), Resistance level, Position (seated/standing/combo)

## Output Format — SONG-BY-SONG

Each song gets its own ### section. Reference the song by name in cues (the chorus, the hook, the drop, the verse). Use the song's energy to drive the workout block.

# [Class Type]: [Theme]
**Duration:** X min | **Level:** [level] | **Equipment:** [list]
**Peak RPE:** X | **Tracks:** N songs

## Class Overview
[2-3 sentences setting up the theme and arc]

## PHASE 1: [Phase Name] ([X min] · Songs [n-m] · RPE [range])

### Song 1: [Song Title] — [Artist]
**Duration:** ~M:SS | **RPE:** X-Y | **[Cadence/Activity field]:** [details] | **[Intensity/Position field]:** [details]

**Coaching Cues:**
- [Specific cue that references the song — entry, setup]
- [Cue tied to the verse or first 30 sec]
- [Cue tied to the chorus/hook/drop — name it: "On the chorus...", "When the hook hits..."]
- [Modification cue if applicable]
- [Coaching cue with motivational language: "Coaching cue: '...'"]

### Song 2: ...
[same structure]

## PHASE 2: ...
[songs in this phase]

## PHASE 3: ...
[songs in this phase]

## PHASE 4: ...
[songs in this phase]

## Instructor Notes
- [3-5 tips: RPE scale reminder, modification reminders, hydration cue, emotional high point, etc.]

Rules:
- Every song from the playlist appears in order
- Each song's coaching cues reference that specific song's structure (verse/chorus/bridge/drop) where appropriate
- Use the song's emotional tone to inform the cue language
- Always cue safety modifications for spin (resistance is rider's choice) and aqua (one foot down for any jump)`;

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

const classTypes = ["Aqua Aerobics", "Spin / Cycling", "Strong & Steady", "HIIT", "Personal Training"];
const durations = ["30 min", "45 min", "60 min", "75 min"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const hasMusic = (ct) => ct !== "Personal Training";
const isSongAligned = (ct) => ct === "Aqua Aerobics" || ct === "Spin / Cycling";
const CLASS_ICONS = { "Aqua Aerobics": "🌊", "Spin / Cycling": "🚴", "Strong & Steady": "⭐", "HIIT": "🔥", "Personal Training": "🏋️" };
const themes = {
  "Aqua Aerobics": ["Ocean Waves", "Summer Splash", "Tropical Escape", "Deep Dive", "Custom..."],
  "Spin / Cycling": ["Mountain Climb", "Grand Tour", "Night Ride", "Speed Demons", "Custom..."],
  "Strong & Steady": ["Standing Strong", "Foundation", "Decades of Dance", "Garden Party", "Custom..."],
  "HIIT": ["Inferno", "Power Surge", "Full Throttle", "Tabata Tour", "Custom..."],
  "Personal Training": ["Full Body Strength", "Lower Body Power", "Upper Body Focus", "Endurance Base", "Custom..."],
};

function extractSongList(md) {
  if (!md) return "";
  const idx = md.indexOf("## Full Song List");
  if (idx === -1) return "";
  return md.slice(idx).split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2).trim()).join("\n");
}

function downloadFile(content, filename, type = "text/plain") {
  const blob = new Blob([content], { type });
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

function entryToMarkdown(entry) {
  const header = `# ${entry.classType}: ${entry.theme}\n` +
    `_${formatDate(entry.createdAt)} · ${entry.duration} · ${entry.level}_\n\n`;
  const notes = entry.notes ? `**Workout notes:** ${entry.notes}\n\n` : "";
  const musicNotes = entry.musicNotes ? `**Music notes:** ${entry.musicNotes}\n\n` : "";
  const workout = entry.workoutMd || "";
  const music = entry.musicMd ? `\n\n---\n\n${entry.musicMd}` : "";
  return header + notes + musicNotes + workout + music + "\n";
}

function MarkdownDisplay({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  return (
    <div style={{ fontFamily: "'Georgia', serif", lineHeight: 1.7, color: "#1a1a2e" }}>
      {lines.map((line, i) => {
        if (line.startsWith("# ")) return <h1 key={i} style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f3460", marginTop: "1.2rem", marginBottom: "0.4rem", borderBottom: "2px solid #e94560", paddingBottom: "0.3rem" }}>{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f3460", marginTop: "1rem", marginBottom: "0.3rem" }}>{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: "1rem", fontWeight: 600, color: "#e94560", marginTop: "0.8rem", marginBottom: "0.2rem", background: "rgba(233,69,96,0.06)", padding: "0.4rem 0.6rem", borderRadius: 6, borderLeft: "3px solid #e94560" }}>{line.slice(4)}</h3>;
        if (/^\*\*.*\*\*$/.test(line)) return <p key={i} style={{ fontWeight: 600, margin: "0.2rem 0", fontSize: "0.9rem" }}>{line.replace(/\*\*/g, "")}</p>;
        // Inline-bold inside bullets and paragraphs
        const renderInline = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
          seg.startsWith("**") && seg.endsWith("**")
            ? <strong key={j} style={{ color: "#0f3460" }}>{seg.slice(2, -2)}</strong>
            : <span key={j}>{seg}</span>
        );
        if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: "1.2rem", margin: "0.15rem 0", display: "flex", gap: "0.5rem" }}><span style={{ color: "#e94560", flexShrink: 0 }}>•</span><span style={{ fontSize: "0.9rem" }}>{renderInline(line.slice(2))}</span></div>;
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
        return <p key={i} style={{ margin: "0.2rem 0", fontSize: "0.9rem" }}>{renderInline(line)}</p>;
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
      <div style={{ background: "#ebf8ff", border: "1px solid #63b3ed", borderRadius: 12, padding: "1.1rem 1.2rem", marginBottom: "1.2rem" }}>
        <div style={{ fontWeight: 700, color: "#2b6cb0", marginBottom: "0.5rem", fontSize: "0.9rem" }}>📋 How to create your Spotify playlist</div>
        <ol style={{ margin: 0, paddingLeft: "1.3rem", color: "#2c5282", fontSize: "0.82rem", lineHeight: 2 }}>
          <li>Copy the song list below</li>
          <li>Open a text editor, paste, and save as <code style={{ background: "#bee3f8", padding: "0 4px", borderRadius: 3 }}>{filename}</code> in your Downloads folder</li>
          <li>Run the command below in your terminal</li>
        </ol>
      </div>

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

function ArchiveCard({ entry, onLoad, onDelete, onDownload }) {
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
        <button onClick={() => onDownload(entry)} title="Download as Markdown" style={{ padding: "0.38rem 0.6rem", borderRadius: 7, border: "1px solid rgba(104,211,145,0.4)", background: "rgba(104,211,145,0.1)", color: "#68d391", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
          ⬇ MD
        </button>
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

// ─── Remote archive sync (Netlify Blobs via /functions/archive) ───────────
async function fetchRemoteArchive() {
  try {
    const r = await fetch("/.netlify/functions/archive");
    if (!r.ok) return null;
    const data = await r.json();
    return Array.isArray(data.archive) ? data.archive : null;
  } catch { return null; }
}

async function pushRemoteArchive(archive) {
  try {
    await fetch("/.netlify/functions/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive }),
    });
    return true;
  } catch { return false; }
}

export default function App() {
  const [view, setView] = useState("form");
  const [classType, setClassType] = useState("Aqua Aerobics");
  const [duration, setDuration] = useState("60 min");
  const [level, setLevel] = useState("All Levels");
  const [theme, setTheme] = useState("Ocean Waves");
  const [customTheme, setCustomTheme] = useState("");
  const [notes, setNotes] = useState("");
  const [musicNotes, setMusicNotes] = useState("");
  const [step, setStep] = useState("form");
  const [workoutMd, setWorkoutMd] = useState("");
  const [musicMd, setMusicMd] = useState("");
  const [activeTab, setActiveTab] = useState("workout");
  const [error, setError] = useState("");
  const [archive, setArchive] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [resultMeta, setResultMeta] = useState({ classType: "", theme: "" });
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | local-only

  const finalTheme = theme === "Custom..." ? customTheme : theme;
  const isGenerating = step === "generating-workout" || step === "generating-music";

  useEffect(() => {
    // Load from localStorage immediately (instant), then attempt remote sync (authoritative)
    try {
      const saved = localStorage.getItem("workout-archive");
      if (saved) setArchive(JSON.parse(saved));
    } catch {}

    (async () => {
      setSyncStatus("syncing");
      const remote = await fetchRemoteArchive();
      if (remote) {
        setArchive(remote);
        try { localStorage.setItem("workout-archive", JSON.stringify(remote)); } catch {}
        setSyncStatus("synced");
      } else {
        setSyncStatus("local-only");
      }
    })();
  }, []);

  async function persistArchive(updated) {
    setArchive(updated);
    try { localStorage.setItem("workout-archive", JSON.stringify(updated)); } catch {}
    setSyncStatus("syncing");
    const ok = await pushRemoteArchive(updated);
    setSyncStatus(ok ? "synced" : "local-only");
  }

  async function callClaude(system, user, maxTokens = 4000) {
    let res;
    try {
      res = await fetch("/.netlify/functions/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, messages: [{ role: "user", content: user }], max_tokens: maxTokens }),
      });
    } catch (e) {
      // network error / function never responded (likely Netlify function timeout)
      throw new Error(`Network error reaching Claude function — likely a function timeout. The site's Netlify function may have hit its time limit before Claude finished. (${e.message})`);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Claude function returned ${res.status} ${res.statusText}. ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(`Claude API error: ${data.error.message || JSON.stringify(data.error)}`);
    const out = data.content?.[0]?.text;
    if (!out) throw new Error(`Claude returned no text content. Response: ${JSON.stringify(data).slice(0, 300)}`);
    return out;
  }

  async function generate() {
    setError(""); setStep("generating-workout");
    const isPT = classType === "Personal Training";
    const songAligned = isSongAligned(classType);
    try {
      let workout = "";
      let music = "";

      if (songAligned) {
        // Spin / Aqua: playlist first, then workout cues tied to each song.
        setStep("generating-music");
        const musicUserPrompt =
          `Curate the playlist for a ${duration} ${classType} class, theme "${finalTheme}", ${level}.` +
          (musicNotes ? ` Music preferences: ${musicNotes}.` : "") +
          ` Follow the format exactly.`;
        music = await callClaude(SONG_PLAYLIST_SKILL, musicUserPrompt, 3000);
        setMusicMd(music);

        setStep("generating-workout");
        const workoutUserPrompt =
          `Class type: ${classType}\nDuration: ${duration}\nLevel: ${level}\nTheme: ${finalTheme}` +
          (notes ? `\nAdditional notes: ${notes}` : "") +
          `\n\nPLAYLIST (use this exactly, in order):\n\n${music}\n\n` +
          `Generate the song-by-song workout. Each song from the playlist becomes its own ### block with metadata and coaching cues that reference that song's hook/lyrics/energy.`;
        workout = await callClaude(SONG_ALIGNED_WORKOUT_SKILL, workoutUserPrompt, 4000);
        setWorkoutMd(workout);
      } else if (isPT) {
        workout = await callClaude(
          PT_SKILL,
          `Generate a ${duration} personal training session with focus "${finalTheme}" at ${level}.${notes ? ` Notes: ${notes}` : ""}`,
          4000
        );
        setWorkoutMd(workout);
      } else {
        // HIIT, Strong & Steady — workout first, then matching music.
        workout = await callClaude(
          WORKOUT_SKILL,
          `Generate a ${duration} ${classType} workout, theme "${finalTheme}", ${level}.${notes ? ` Notes: ${notes}` : ""} Follow the output format exactly including Music Energy Arc.`,
          4000
        );
        setWorkoutMd(workout);

        setStep("generating-music");
        const musicUserPrompt =
          `Workout:\n\n${workout}\n\nCurate a playlist matching this workout's energy arc.` +
          (musicNotes ? ` Music preferences: ${musicNotes}.` : "") +
          ` Follow the format exactly.`;
        music = await callClaude(MUSIC_SKILL, musicUserPrompt, 3000);
        setMusicMd(music);
      }

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        classType, theme: finalTheme, duration, level,
        notes, musicNotes,
        workoutMd: workout, musicMd: music,
        createdAt: new Date().toISOString(),
      };
      setSaveStatus("saving");
      await persistArchive([entry, ...archive].slice(0, 100));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);

      setResultMeta({ classType, theme: finalTheme });
      setStep("done"); setActiveTab("workout");
    } catch (e) {
      console.error("[generate] failed:", e);
      setError(e.message || "Something went wrong. Please try again.");
      setStep("form");
    }
  }

  function loadEntry(entry) {
    setWorkoutMd(entry.workoutMd);
    setMusicMd(entry.musicMd || "");
    setResultMeta({ classType: entry.classType, theme: entry.theme });
    setStep("done"); setActiveTab("workout"); setView("form");
  }

  function downloadEntry(entry) {
    const md = entryToMarkdown(entry);
    const fname = `${slugify(entry.classType)}-${slugify(entry.theme)}-${entry.createdAt.slice(0, 10)}.md`;
    downloadFile(md, fname, "text/markdown");
  }

  function downloadCurrent() {
    const current = {
      classType: resultMeta.classType,
      theme: resultMeta.theme,
      duration, level, notes, musicNotes,
      workoutMd, musicMd,
      createdAt: new Date().toISOString(),
    };
    downloadEntry(current);
  }

  const pill = (active) => ({ padding: "0.5rem 0.85rem", borderRadius: 8, border: active ? "2px solid #e94560" : "1px solid rgba(255,255,255,0.18)", background: active ? "rgba(233,69,96,0.2)" : "rgba(255,255,255,0.05)", color: active ? "#e94560" : "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 700 : 400, transition: "all 0.15s" });
  const navBtn = (active) => ({ ...pill(active), padding: "0.5rem 1.2rem" });

  const syncBadge = () => {
    if (syncStatus === "synced") return { text: "✓ Synced across devices", color: "#68d391" };
    if (syncStatus === "syncing") return { text: "⟳ Syncing…", color: "rgba(255,255,255,0.45)" };
    if (syncStatus === "local-only") return { text: "⚠ Local only (cloud unavailable)", color: "#f6ad55" };
    return null;
  };
  const badge = syncBadge();

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
          {badge && <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: badge.color }}>{badge.text}</div>}
        </div>

        {/* Archive */}
        {view === "archive" && (
          archive.length === 0
            ? <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.7rem" }}>📭</div>
                <p style={{ margin: 0 }}>No saved workouts yet. Generate one and it'll appear here.</p>
              </div>
            : <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {archive.map(e => <ArchiveCard key={e.id} entry={e} onLoad={loadEntry} onDelete={id => persistArchive(archive.filter(x => x.id !== id))} onDownload={downloadEntry} />)}
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
                      Workout Notes <span style={{ opacity: 0.45, textTransform: "none" }}>(optional)</span>
                    </label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. focus on core, client has knee issues, holiday theme..." rows={2} style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)", color: "white", fontSize: "0.85rem", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                  </div>

                  {hasMusic(classType) && (
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: "0.5rem" }}>
                        Music Preferences <span style={{ opacity: 0.45, textTransform: "none" }}>(optional)</span>
                      </label>
                      <textarea value={musicNotes} onChange={e => setMusicNotes(e.target.value)} placeholder="e.g. no country, 90s hip-hop, Latin-flavored, avoid explicit lyrics..." rows={2} style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)", color: "white", fontSize: "0.85rem", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ marginTop: "1rem", padding: "0.8rem 1rem", borderRadius: 8, background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.35)" }}>
                    <div style={{ color: "#e94560", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>⚠ Generation failed</div>
                    <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", fontFamily: "monospace", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{error}</div>
                  </div>
                )}

                <button onClick={generate} disabled={isGenerating || (theme === "Custom..." && !customTheme.trim())} style={{ marginTop: "1.5rem", width: "100%", padding: "0.95rem", borderRadius: 12, border: "none", background: isGenerating ? "rgba(233,69,96,0.35)" : "linear-gradient(135deg, #e94560, #c23152)", color: "white", fontSize: "0.95rem", fontWeight: 700, cursor: isGenerating ? "not-allowed" : "pointer", letterSpacing: 0.4 }}>
                  {step === "generating-workout" ? "⚡ Building your workout..." : step === "generating-music" ? "🎵 Curating your playlist..." : classType === "Personal Training" ? "Generate Training Session" : "Generate Workout + Playlist"}
                </button>

                {isGenerating && (
                  <div style={{ marginTop: "0.9rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "0.5rem", alignItems: "center" }}>
                    {(classType === "Personal Training" ? ["generating-workout"] : isSongAligned(classType) ? ["generating-music", "generating-workout"] : ["generating-workout", "generating-music"]).map((s, i, arr) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: step === s ? "#e94560" : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />
                        <span style={{ color: step === s ? "#e94560" : "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>{s === "generating-music" ? "Music" : "Workout"}</span>
                        {i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 0.2rem" }}>→</span>}
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
                    <button onClick={downloadCurrent} title="Download as Markdown (paste into Google Docs)" style={{ padding: "0.5rem 0.9rem", borderRadius: 8, border: "1px solid rgba(104,211,145,0.4)", background: "rgba(104,211,145,0.1)", color: "#68d391", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
                      ⬇ Markdown
                    </button>
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
