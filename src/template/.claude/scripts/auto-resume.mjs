/**
 * Chico Protocol — auto-resume after a usage limit
 *
 * Watches the current Claude Code session transcript. When the session dies on
 * a usage limit ("You've hit your weekly limit · resets 8pm (Europe/Brussels)",
 * "You've hit your session limit · resets 6:50pm (...)", 5-hour/daily/monthly
 * variants, French variants), it parses the reset time DYNAMICALLY, waits until
 * reset + a safety delay, then relaunches the session with `claude --resume` so
 * the work (and in-flight agents) picks back up on its own.
 *
 * Cross-platform (Windows / macOS / Linux), ZERO dependencies, no AI.
 *
 * Reliability model (hardened after a real overnight incident where a weekly
 * limit killed every agent and nothing resumed for ~24 h):
 *   1. REAL events only — a genuine limit is an assistant transcript record
 *      flagged `isApiErrorMessage: true`. Messages merely QUOTING the phrase
 *      never trigger (validated on real transcripts).
 *   2. Broad detection — weekly / session / usage / rate / 5-hour / daily /
 *      monthly limits, English and French, "8pm" / "6:50pm" / "18:50" / "20h05"
 *      time formats, optional "at", optional weekday, optional IANA timezone.
 *   3. Sleep/reboot-proof scheduling — no long setTimeout. Pending resumes are
 *      persisted to a state file and fired by a short poll comparing wall-clock
 *      time, so a PC sleep, wake, or watcher restart never loses a resume.
 *      Pair it with a scheduled task (Windows) or cron that relaunches this
 *      script every few minutes: the single-instance lock makes that a no-op
 *      while one watcher is alive, and the startup catch-up scan recovers a
 *      limit that struck while the watcher was down.
 *   4. Model fallback (optional, on by default) — instead of waiting for the
 *      reset, immediately resume on the next lower model tier (fable -> opus ->
 *      sonnet, configurable). The reset-time resume stays scheduled as a safety
 *      net and restores the original model once the limit clears.
 *
 * Usage:
 *   node .claude/scripts/auto-resume.mjs                 # auto-detects the cwd session
 *   node .claude/scripts/auto-resume.mjs --delay-min 5   # delay after reset (default 5)
 *   node .claude/scripts/auto-resume.mjs --transcript <file.jsonl>
 *   node .claude/scripts/auto-resume.mjs --scan-only     # print catch-up verdict, exit
 *   node .claude/scripts/auto-resume.mjs --dry-run       # never spawns claude
 *   node .claude/scripts/auto-resume.mjs --no-fallback   # wait for reset, no model step-down
 *   node .claude/scripts/auto-resume.mjs --fallback-chain fable,opus,sonnet
 *
 * Env: CLAUDE_BIN, AUTO_RESUME_PROMPT, AUTO_RESUME_FALLBACK (0/off disables),
 *      AUTO_RESUME_FALLBACK_CHAIN.
 *
 * Keep-alive (recommended for long unattended runs — survives reboot):
 *   Windows : schtasks /create /tn ChicoAutoResume /sc minute /mo 5 /f
 *               /tr "\"C:\Program Files\nodejs\node.exe\" \"<project>\.claude\scripts\auto-resume.mjs\""
 *   Unix    : cron every 5 min -> node <project>/.claude/scripts/auto-resume.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

// ---------- arguments ----------
const argv = process.argv.slice(2);
const arg = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const DELAY_MIN = Number(arg('delay-min', '5'));
const ONCE = has('once');
const DRY_RUN = has('dry-run');
const SCAN_ONLY = has('scan-only');
const FALLBACK_ENABLED = !has('no-fallback')
  && !/^(0|off|false)$/i.test(process.env.AUTO_RESUME_FALLBACK || '');
const CHAIN = (arg('fallback-chain') || process.env.AUTO_RESUME_FALLBACK_CHAIN || 'fable,opus,sonnet')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const POLL_MS = 5000;
const TAIL_SCAN_BYTES = 512 * 1024;
const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const PROMPT = process.env.AUTO_RESUME_PROMPT
  || 'The usage limit has cleared (or a fallback model is available). Resume IMMEDIATELY '
  + 'where the work stopped: restart or resume every interrupted background agent, then '
  + 'continue the current mission without waiting for confirmation.';

// ---------- claude binary resolution (lesson learned: never guess "claude.cmd") ----------
function resolveClaudeBin() {
  const explicit = arg('claude-bin') || process.env.CLAUDE_BIN;
  if (explicit) return explicit;
  const finder = process.platform === 'win32' ? 'where' : 'which';
  try {
    const r = spawnSync(finder, ['claude'], { encoding: 'utf8' });
    const line = (r.stdout || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean);
    if (line) return line;
  } catch { /* ignore */ }
  return 'claude'; // last resort: rely on PATH
}
const CLAUDE_BIN = resolveClaudeBin();

// ---------- transcript location for the current project ----------
function encodeProjectDir(cwd) {
  // Claude Code encodes the cwd by replacing every non-alphanumeric char with '-'.
  return cwd.replace(/[^a-zA-Z0-9]/g, '-');
}
function newestJsonl(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl'))
      .map((f) => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.m - a.m).map((x) => path.join(dir, x.f))[0] || null;
  } catch { return null; }
}
function resolveTranscript() {
  const explicit = arg('transcript');
  if (explicit) return explicit;
  const projDir = path.join(os.homedir(), '.claude', 'projects', encodeProjectDir(process.cwd()));
  return newestJsonl(projDir);
}
let TRANSCRIPT = resolveTranscript();
if (!TRANSCRIPT || !fs.existsSync(TRANSCRIPT)) {
  console.error('[auto-resume] transcript not found — pass --transcript <file.jsonl>');
  process.exit(1);
}
const SESSION_ID = () => path.basename(TRANSCRIPT, '.jsonl');
const baseDir = () => path.dirname(TRANSCRIPT);

// ---------- logging ----------
function log(msg) {
  const line = `[auto-resume ${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(path.join(baseDir(), 'auto-resume.log'), line + '\n'); } catch { /* best-effort */ }
}

// ---------- detection ----------
// Limit phrases (EN + FR, every limit kind). The reset time is DYNAMIC.
const LIMIT_RE = new RegExp([
  "(?:hit|reached)\\s+(?:your|the)\\s+(?:\\d+\\s*[-\\u2010\\u2011]?\\s*hour|five[- ]hour|session|usage|rate|weekly|daily|monthly|overall)?\\s*limit",
  'usage\\s+limit\\s+reached',
  'out\\s+of\\s+usage\\s+credits',
  "limite\\s+(?:de\\s+session|d['\\u2019](?:utilisation|usage)|hebdomadaire|journali\\u00e8re|horaire|mensuelle)?\\s*atteinte",
  'vous\\s+avez\\s+atteint\\s+votre\\s+limite',
].join('|'), 'i');
// "resets 8pm (Europe/Brussels)" | "resets at 6:50pm" | "resets 18:50" |
// "resets Thu 8pm" | "réinitialisation à 20h05 (Europe/Paris)"
const RESET_RE = new RegExp(
  '(?:resets?|r\\u00e9initialis\\w*)'
  + '\\s*(?:at\\s+|\\u00e0\\s+|:\\s*)?(?:on\\s+)?'
  + '(?:(mon|tue|wed|thu|fri|sat|sun|lun|mar|mer|jeu|ven|sam|dim)[a-z\\u00e9]*\\s+)?'
  + '(?:at\\s+|\\u00e0\\s+)?'
  + '(\\d{1,2})(?:[:h]\\s?(\\d{2}))?\\s*(am|pm)?'
  + '\\s*(?:\\(([^)]+)\\))?',
  'i');
const WEEKDAYS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
  lun: 'Mon', mar: 'Tue', mer: 'Wed', jeu: 'Thu', ven: 'Fri', sam: 'Sat', dim: 'Sun' };

function parseResetSpec(text) {
  const m = RESET_RE.exec(text);
  if (!m) return null;
  const weekday = m[1] ? WEEKDAYS[m[1].toLowerCase()] || null : null;
  let h = Number(m[2]);
  const min = Number(m[3] || 0);
  const ap = (m[4] || '').toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return { h, min, tz: m[5] || LOCAL_TZ, weekday };
}

/** Concatenate the text content of a transcript record. */
function recordText(obj) {
  const c = obj?.message?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((x) => x?.text || '').join(' ');
  return '';
}
/** REAL limit event: assistant record flagged isApiErrorMessage with the phrase. */
function limitEventOf(line) {
  let obj; try { obj = JSON.parse(line); } catch { return null; }
  if (obj.type !== 'assistant' || obj.isApiErrorMessage !== true) return null;
  const text = recordText(obj);
  if (!LIMIT_RE.test(text)) return null;
  return { reset: parseResetSpec(text) };
}
/** Model id of a record, or null ("<synthetic>" is not a model). */
function recordModel(line) {
  let obj; try { obj = JSON.parse(line); } catch { return null; }
  if (obj.type !== 'assistant') return null;
  const model = obj?.message?.model;
  return model && model !== '<synthetic>' ? model : null;
}

// ---------- target computation (DST-safe, dependency-free) ----------
function timeInTz(date, tz) {
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(date);
    const g = (t) => p.find((x) => x.type === t)?.value;
    return { h: Number(g('hour')) % 24, m: Number(g('minute')), wd: g('weekday') };
  } catch { return { h: date.getHours(), m: date.getMinutes(), wd: null }; }
}
function nextOccurrence(h, m, tz, weekday = null) {
  const now = Date.now();
  const start = new Date(Math.ceil(now / 60000) * 60000);
  const horizon = weekday ? 8 * 24 * 60 : 25 * 60; // 8 days if weekday given, else 25 h
  for (let i = -20; i <= horizon; i++) {           // 20 min of past: a recent reset -> resume now
    const cand = new Date(start.getTime() + i * 60000);
    const t = timeInTz(cand, tz);
    if (t.h === h && t.m === m && (!weekday || t.wd === weekday)) {
      return i <= 0 ? now + 2 * 60000 : cand.getTime();
    }
  }
  return start.getTime() + 60 * 60000; // unreachable in practice: retry in 1 h
}

// ---------- model fallback ----------
function modelTier(modelId) {
  const id = String(modelId || '').toLowerCase();
  return CHAIN.find((t) => id.includes(t)) || null;
}
function nextFallbackTier(fromTier, tried) {
  const from = CHAIN.indexOf(fromTier);
  for (let i = (from < 0 ? 0 : from) + 1; i < CHAIN.length; i++) {
    if (!tried.includes(CHAIN[i])) return CHAIN[i];
  }
  return null;
}
function currentModelTier() {
  try {
    const st = fs.statSync(TRANSCRIPT);
    const len = Math.min(TAIL_SCAN_BYTES, st.size);
    const fd = fs.openSync(TRANSCRIPT, 'r');
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, st.size - len);
    fs.closeSync(fd);
    const lines = buf.toString('utf8').split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const model = recordModel(lines[i]);
      if (model) return { model, tier: modelTier(model) };
    }
  } catch { /* ignore */ }
  return { model: null, tier: null };
}

// ---------- single-instance lock ----------
const LOCK_FILE = path.join(baseDir(), 'auto-resume.watcher.lock');
function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }
if (!SCAN_ONLY) {
  try {
    const prev = Number(fs.readFileSync(LOCK_FILE, 'utf8'));
    if (prev && prev !== process.pid && pidAlive(prev)) {
      console.log(`[auto-resume] another watcher is already running (pid ${prev}) — exiting`);
      process.exit(0);
    }
  } catch { /* no lock or dead process */ }
  try { fs.writeFileSync(LOCK_FILE, String(process.pid)); } catch { /* best-effort */ }
  const clean = () => { try { fs.unlinkSync(LOCK_FILE); } catch { /* ignore */ } };
  process.on('exit', clean);
  process.on('SIGINT', () => { clean(); process.exit(0); });
  process.on('SIGTERM', () => { clean(); process.exit(0); });
}

// ---------- persisted state (survives sleep, reboot, watcher restarts) ----------
const STATE_FILE = path.join(baseDir(), 'auto-resume.state.json');
let state = { pending: [], episode: null };
try {
  const loaded = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  if (loaded && Array.isArray(loaded.pending)) state = loaded;
} catch { /* fresh state */ }
function saveState() {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch { /* best-effort */ }
}
function schedule(at, model, reason) {
  const dup = state.pending.find((p) => (p.model || null) === (model || null) && p.at <= at + 60000);
  if (dup) { log(`schedule(${reason}) skipped — equal/earlier resume already pending`); return; }
  state.pending = state.pending.filter((p) => (p.model || null) !== (model || null));
  state.pending.push({ at, model: model || null, reason });
  state.pending.sort((a, b) => a.at - b.at);
  saveState();
  log(`scheduled resume [${reason}] at ${new Date(at).toLocaleString(undefined, { hour12: false })}${model ? ` (model: ${model})` : ''} (~${Math.max(0, Math.round((at - Date.now()) / 60000))} min)`);
}

// ---------- resume ----------
function resume(model = null) {
  const sid = SESSION_ID();
  const modelArgs = model ? ['--model', model] : [];
  if (DRY_RUN) { log(`DRY-RUN: would resume session ${sid}${model ? ` (model=${model})` : ''}`); return; }
  log(`RESUME session ${sid} (bin=${CLAUDE_BIN}${model ? `, model=${model}` : ''})`);
  const out = fs.openSync(path.join(baseDir(), 'auto-resume-run.log'), 'a');
  const child = spawn(CLAUDE_BIN, ['--resume', sid, ...modelArgs, '-p', PROMPT],
    { cwd: process.cwd(), detached: true, stdio: ['ignore', out, out] });
  // A resume failure must NEVER be silent (that was the historical bug).
  child.on('error', (e) => log(`resume spawn FAILED: ${e.message} (bin=${CLAUDE_BIN}) — fix with --claude-bin`));
  child.on('exit', (code) => {
    if (code === 0) { log('resume finished (exit 0)'); return; }
    log(`resume FAILED (exit ${code}) — retry in 5 min`);
    schedule(Date.now() + 5 * 60000, model, 'retry-after-failure');
  });
}

// ---------- limit-event handling ----------
function handleLimitEvent(ev, origin) {
  const now = Date.now();
  let resetAt;
  if (ev.reset) {
    resetAt = nextOccurrence(ev.reset.h, ev.reset.min, ev.reset.tz, ev.reset.weekday) + DELAY_MIN * 60000;
    log(`LIMIT detected (${origin}) — reset ${String(ev.reset.h).padStart(2, '0')}:${String(ev.reset.min).padStart(2, '0')} (${ev.reset.tz}${ev.reset.weekday ? `, ${ev.reset.weekday}` : ''})`);
  } else {
    resetAt = now + 60 * 60000; // no parsable time: conservative hourly retry
    log(`LIMIT detected (${origin}) — no parsable reset time, retrying hourly`);
  }
  if (!state.episode || now > (state.episode.resetAt || 0)) {
    state.episode = { detectedAt: now, resetAt, triedTiers: [] };
  } else {
    state.episode.resetAt = Math.min(state.episode.resetAt, resetAt);
  }
  schedule(resetAt, null, 'reset');

  if (FALLBACK_ENABLED) {
    const { model, tier } = currentModelTier();
    const lastTried = state.episode.triedTiers[state.episode.triedTiers.length - 1] || null;
    const next = nextFallbackTier(lastTried || tier, state.episode.triedTiers);
    if (next) {
      state.episode.triedTiers.push(next);
      saveState();
      log(`model fallback: ${model || 'unknown model'} -> ${next} — resuming in 2 min instead of waiting`);
      schedule(now + 2 * 60000, next, `fallback-${next}`);
    } else {
      log('model fallback: chain exhausted — waiting for the reset');
    }
  }
  saveState();
}

// ---------- startup catch-up scan ----------
/**
 * If the limit struck while no watcher was running (PC asleep, reboot, watcher
 * not yet started), the limit record is already in the transcript when we boot.
 * Scan the tail: if the last real limit event has NO meaningful activity after
 * it, the session died on that limit -> schedule the resume now.
 */
function catchUpScan() {
  let lines;
  try {
    const st = fs.statSync(TRANSCRIPT);
    const len = Math.min(TAIL_SCAN_BYTES, st.size);
    const fd = fs.openSync(TRANSCRIPT, 'r');
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, st.size - len);
    fs.closeSync(fd);
    lines = buf.toString('utf8').split('\n');
    if (len < st.size) lines.shift(); // first line may be truncated
  } catch { return null; }
  let lastLimit = null;
  let activityAfter = false;
  for (const line of lines) {
    if (!line.trim()) continue;
    const ev = limitEventOf(line);
    if (ev) { lastLimit = ev; activityAfter = false; continue; }
    if (!lastLimit) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'assistant' && obj.isApiErrorMessage !== true) activityAfter = true;
      if (obj.type === 'user' && !obj.isMeta) activityAfter = true;
    } catch { /* ignore */ }
  }
  if (!lastLimit) return { verdict: 'no-limit-event' };
  if (activityAfter) return { verdict: 'stale-limit-already-resumed' };
  return { verdict: 'dead-on-limit', event: lastLimit };
}

// ---------- startup ----------
log(`started — session ${SESSION_ID()} | delay +${DELAY_MIN} min | fallback ${FALLBACK_ENABLED ? CHAIN.join('>') : 'off'} | claude=${CLAUDE_BIN}${DRY_RUN ? ' | DRY-RUN' : ''}`);
const scan = catchUpScan();
if (SCAN_ONLY) {
  console.log(`[scan-only] verdict: ${scan?.verdict || 'unreadable'}`
    + (scan?.event?.reset ? ` | reset ${scan.event.reset.h}:${String(scan.event.reset.min).padStart(2, '0')} (${scan.event.reset.tz})` : ''));
  process.exit(0);
}
if (scan?.verdict === 'dead-on-limit') {
  log('catch-up scan: session died on a limit with no activity since — scheduling resume');
  handleLimitEvent(scan.event, 'catch-up');
} else if (scan) {
  log(`catch-up scan: ${scan.verdict}`);
}
const staleBefore = Date.now() - 26 * 3600 * 1000;
const nBefore = state.pending.length;
state.pending = state.pending.filter((p) => p.at > staleBefore);
if (state.pending.length !== nBefore) { log('dropped stale pending schedule(s) from a previous run'); saveState(); }
if (state.pending.length) log(`restored ${state.pending.length} pending schedule(s) from state file`);

// ---------- watch loop ----------
let lastSize = fs.statSync(TRANSCRIPT).size; // history handled by catchUpScan; tail only new lines
let carry = '';

setInterval(() => {
  // Follow the newest session of this project (each resume creates a new transcript).
  const fresh = resolveTranscript();
  if (fresh && fresh !== TRANSCRIPT && fs.existsSync(fresh)) {
    TRANSCRIPT = fresh; lastSize = fs.statSync(TRANSCRIPT).size; carry = '';
    log(`switched to newest transcript: ${SESSION_ID()}`);
    const s = catchUpScan();
    if (s?.verdict === 'dead-on-limit') handleLimitEvent(s.event, 'switch-scan');
  }

  // Fire due schedules (wall-clock check: survives sleep — after a wake the next
  // tick compares Date.now() with the persisted target and fires if overdue).
  if (state.pending.length && Date.now() >= state.pending[0].at) {
    const due = state.pending.shift();
    saveState();
    log(`firing scheduled resume [${due.reason}]${due.model ? ` (model ${due.model})` : ''}`);
    resume(due.model);
    if (Date.now() > (state.episode?.resetAt || 0)) { state.episode = null; saveState(); }
    if (ONCE) { log('--once mode: exiting.'); process.exit(0); }
  }

  // Tail new transcript content.
  let size; try { size = fs.statSync(TRANSCRIPT).size; } catch { return; }
  if (size < lastSize) { lastSize = 0; carry = ''; }
  if (size === lastSize) return;
  const fd = fs.openSync(TRANSCRIPT, 'r');
  const buf = Buffer.alloc(size - lastSize);
  fs.readSync(fd, buf, 0, buf.length, lastSize);
  fs.closeSync(fd);
  lastSize = size;

  const parts = (carry + buf.toString('utf8')).split('\n');
  carry = parts.pop() || '';
  for (const line of parts) {
    if (!line.trim()) continue;
    const ev = limitEventOf(line);
    if (ev) handleLimitEvent(ev, 'live');
  }
}, POLL_MS);
