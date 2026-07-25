/**
 * Chico Protocol — Reprise automatique après limite d'usage (auto-resume)
 *
 * Surveille le transcript de la session Claude Code courante. Quand la session
 * atteint sa limite d'usage (« You've hit your session limit · resets 7:40pm
 * (Europe/Brussels) »), le script lit l'heure de réinitialisation, attend jusqu'à
 * cet horaire + un délai de sécurité, puis relance la session avec `claude --resume`
 * pour que le travail (et les agents en cours) reprenne tout seul.
 *
 * Multiplateforme (Windows / macOS / Linux), ZÉRO dépendance, AUCUNE IA.
 *
 * DÉTECTION FIABLE (le point clé) : un VRAI événement de limite est un record du
 * transcript `type:"assistant"` avec `isApiErrorMessage:true` (modèle "<synthetic>").
 * Le script ne se déclenche QUE sur ce marqueur — jamais sur un message qui se
 * contente de *citer* la phrase (message utilisateur, task-notification, ou une
 * explication de l'assistant). C'est ce qui élimine les faux déclenchements.
 *
 * Usage :
 *   node .claude/scripts/auto-resume.mjs                 # auto-détecte la session du cwd
 *   node .claude/scripts/auto-resume.mjs --delay-min 5   # délai après le reset (défaut 5)
 *   node .claude/scripts/auto-resume.mjs --transcript <file.jsonl>
 *   node .claude/scripts/auto-resume.mjs --claude-bin /chemin/claude --once
 *
 * Env : CLAUDE_BIN (binaire), AUTO_RESUME_PROMPT (prompt de reprise personnalisé).
 *
 * Démarrage recommandé : lancer en tâche de fond au début d'une session longue.
 *   Windows : Start-Process -WindowStyle Hidden node -ArgumentList '.claude/scripts/auto-resume.mjs'
 *   Unix    : nohup node .claude/scripts/auto-resume.mjs >/dev/null 2>&1 &
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
const POLL_MS = 5000;
const PROMPT = process.env.AUTO_RESUME_PROMPT
  || "La limite de session est réinitialisée — reprends IMMÉDIATEMENT là où tu t'étais arrêté : "
  + "relance/reprends les agents interrompus, puis continue la mission en cours sans attendre de confirmation.";

// ---------- résolution du binaire claude (LEÇON : ne jamais deviner « claude.cmd ») ----------
function resolveClaudeBin() {
  const explicit = arg('claude-bin') || process.env.CLAUDE_BIN;
  if (explicit) return explicit;
  const finder = process.platform === 'win32' ? 'where' : 'which';
  try {
    const r = spawnSync(finder, ['claude'], { encoding: 'utf8' });
    const line = (r.stdout || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean);
    if (line) return line;
  } catch { /* ignore */ }
  return 'claude'; // dernier repli : sur le PATH
}
const CLAUDE_BIN = resolveClaudeBin();

// ---------- localisation du transcript de la session courante ----------
function encodeProjectDir(cwd) {
  // Claude Code encode le cwd en remplaçant tout caractère non alphanumérique par '-'.
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
  const projectsRoot = path.join(os.homedir(), '.claude', 'projects');
  const projDir = path.join(projectsRoot, encodeProjectDir(process.cwd()));
  return newestJsonl(projDir);
}
let TRANSCRIPT = resolveTranscript();
if (!TRANSCRIPT || !fs.existsSync(TRANSCRIPT)) {
  console.error('[auto-resume] transcript introuvable — passe --transcript <fichier.jsonl>');
  process.exit(1);
}
const SESSION_ID = () => path.basename(TRANSCRIPT, '.jsonl');

// ---------- journalisation ----------
function log(msg) {
  const line = `[auto-resume ${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(path.join(path.dirname(TRANSCRIPT), 'auto-resume.log'), line + '\n'); } catch { /* best-effort */ }
}

// ---------- détection de l'heure de reset ----------
// « ...resets 7:40pm (Europe/Brussels) », « ...resets 18:50 », am/pm + fuseau IANA optionnels.
const RESET_RE = /resets?\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?:\s*\(([^)]+)\))?/i;
const LIMIT_RE = /(hit your (?:session|usage|rate) limit|out of usage credits|limite de session atteinte)/i;

/** Concatène le texte d'un record de transcript. */
function recordText(obj) {
  const c = obj?.message?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((x) => x?.text || '').join(' ');
  return '';
}
/** VRAI événement de limite : record assistant marqué isApiErrorMessage contenant la phrase. */
function limitEventOf(line) {
  let obj; try { obj = JSON.parse(line); } catch { return null; }
  if (obj.type !== 'assistant' || obj.isApiErrorMessage !== true) return null;
  const text = recordText(obj);
  if (!LIMIT_RE.test(text)) return null;
  const m = RESET_RE.exec(text);
  if (!m) return { h: null }; // limite sans heure : on ne peut pas planifier
  let h = Number(m[1]);
  const min = Number(m[2] || 0);
  const ap = (m[3] || '').toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  const tz = m[4] || Intl.DateTimeFormat().resolvedOptions().timeZone;
  return { h, min, tz };
}

// ---------- calcul de l'instant cible (DST-safe, sans dépendance) ----------
function timeInTz(date, tz) {
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' }).formatToParts(date);
    const g = (t) => Number(p.find((x) => x.type === t)?.value);
    return { h: g('hour') % 24, m: g('minute') };
  } catch { return { h: date.getHours(), m: date.getMinutes() }; }
}
function nextOccurrence(h, m, tz) {
  const start = new Date(Math.ceil(Date.now() / 60000) * 60000);
  for (let i = -20; i <= 25 * 60; i++) {           // fenêtre : 20 min de passé (reset récent) → 25 h
    const cand = new Date(start.getTime() + i * 60000);
    const t = timeInTz(cand, tz);
    if (t.h === h && t.m === m) return i <= 0 ? Date.now() + 2 * 60000 : cand.getTime();
  }
  return start.getTime() + 60 * 60000; // repli improbable : +1 h
}

// ---------- reprise ----------
function resume() {
  const sid = SESSION_ID();
  log(`RESUME de la session ${sid} (bin=${CLAUDE_BIN})`);
  const out = fs.openSync(path.join(path.dirname(TRANSCRIPT), 'auto-resume-run.log'), 'a');
  const child = spawn(CLAUDE_BIN, ['--resume', sid, '-p', PROMPT], { cwd: process.cwd(), detached: true, stdio: ['ignore', out, out] });
  // Un échec de reprise ne doit JAMAIS être silencieux (c'était le bug historique).
  child.on('error', (e) => log(`ÉCHEC spawn reprise: ${e.message} (bin=${CLAUDE_BIN}) — corrige avec --claude-bin`));
  child.on('exit', (code) => {
    if (code === 0) { log('reprise terminée (exit 0)'); return; }
    log(`ÉCHEC reprise (exit ${code}) — nouvel essai dans 5 min`);
    setTimeout(resume, 5 * 60000);
  });
}

// ---------- boucle de surveillance ----------
let lastSize = fs.statSync(TRANSCRIPT).size; // on n'analyse que les NOUVELLES lignes
let carry = '';
let pendingAt = null;
let pendingTimer = null;

log(`démarré — session ${SESSION_ID()} | delay +${DELAY_MIN} min | claude=${CLAUDE_BIN}`);

setInterval(() => {
  // Suit la session la plus récente (une reprise crée un nouveau transcript).
  const fresh = resolveTranscript();
  if (fresh && fresh !== TRANSCRIPT && fs.existsSync(fresh)) {
    TRANSCRIPT = fresh; lastSize = 0; carry = '';
    log(`bascule sur un transcript plus récent : ${SESSION_ID()}`);
  }
  let size; try { size = fs.statSync(TRANSCRIPT).size; } catch { return; }
  if (size < lastSize) { lastSize = 0; carry = ''; }
  if (size === lastSize) return;

  const fd = fs.openSync(TRANSCRIPT, 'r');
  const buf = Buffer.alloc(size - lastSize);
  fs.readSync(fd, buf, 0, buf.length, lastSize);
  fs.closeSync(fd);
  lastSize = size;

  const lines = (carry + buf.toString('utf8')).split('\n');
  carry = lines.pop() || '';
  for (const line of lines) {
    if (!line.trim()) continue;
    const ev = limitEventOf(line);
    if (!ev) continue;
    if (ev.h == null) { log('limite détectée SANS heure de reset — impossible de planifier (attente d\'un autre signal)'); continue; }

    const target = nextOccurrence(ev.h, ev.min, ev.tz) + DELAY_MIN * 60000;
    if (pendingAt && target >= pendingAt - 60000) { log('limite détectée — reprise déjà planifiée plus tôt, ignoré'); continue; }
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingAt = target;
    const inMin = Math.round((target - Date.now()) / 60000);
    log(`LIMITE RÉELLE détectée — reset ${String(ev.h).padStart(2, '0')}:${String(ev.min).padStart(2, '0')} (${ev.tz}) → reprise dans ~${inMin} min`);
    pendingTimer = setTimeout(() => {
      pendingAt = null; pendingTimer = null;
      resume();
      if (ONCE) { log('mode --once : arrêt.'); process.exit(0); }
    }, Math.max(1000, target - Date.now()));
  }
}, POLL_MS);
