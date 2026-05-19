#!/usr/bin/env node
/**
 * chico-protocol CLI — Installer entry point (visual refresh edition).
 *
 * Usage:
 *   npx chico-protocol install                    # interactive install in cwd
 *   npx chico-protocol install --yes --name Jane  # non-interactive
 *   npx chico-protocol version                    # prints version
 *
 * Design goals for this revision:
 *   - Modern, polished terminal UI: gradient-ish accent (cyan), tight typography,
 *     clear section dividers, no shouty banners or noisy logs.
 *   - Three structured sections: Welcome → Configuration → Installing → Done.
 *   - Question wording rewritten for clarity (purpose visible next to the prompt).
 *   - All language internals stay in English. We never ask about Chico's brain
 *     language. We ask only about chat language + document language.
 *
 * Architecture choices:
 *   - ESM module (Node >= 20.12 is the floor — see engines in package.json).
 *   - commander  → declarative command + flag parsing.
 *   - @clack/prompts → modern, accessible interactive UX with spinner support.
 *   - picocolors → tiny zero-dep coloring (NO_COLOR env supported out of the box).
 *   - fs-extra  → recursive copy + ensureDir.
 *   - js-yaml is used inside lib/process-manifest.js (validation only).
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { copyTemplate } from './lib/copy-template.js';
import { processManifest } from './lib/process-manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths anchored at the package root (tools/installer/ → ../../).
const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE_ROOT = path.join(PACKAGE_ROOT, 'src', 'template');
const TEMPLATE_CLAUDE = path.join(TEMPLATE_ROOT, '.claude');
const TEMPLATE_CHICO = path.join(TEMPLATE_ROOT, '_chico');

const REPO_URL = 'https://github.com/wetson3234/chico-protocol';
const MIN_NODE_VERSION = [20, 12, 0];

// Headline stats — exposed in the recap. These are static facts about the
// shipped template; if the template grows, bump them here.
const STAT_AGENTS = 42;
const STAT_SKILLS = 130;

/**
 * Language catalogue used by both --lang shortcut resolution and the prompt
 * options. The label is what ends up inside manifest.yaml.
 *
 * Order matters: it controls the rendered order of the @clack select.
 */
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'zh', label: '中文 (Chinese, Simplified)', flag: '🇨🇳' },
  { code: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵' },
];

const LANG_BY_CODE = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]));

/**
 * Small pause helper so the spinners feel intentional rather than instant.
 * Kept tiny on purpose — we want rhythm, not lag.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Load package.json to read version + metadata. Done at startup.
 */
async function loadPackageMeta() {
  const pkgPath = path.join(PACKAGE_ROOT, 'package.json');
  return fs.readJson(pkgPath);
}

/**
 * Compare current Node version against MIN_NODE_VERSION. Returns true if OK.
 */
function checkNodeVersion() {
  const current = process.versions.node.split('.').map((n) => parseInt(n, 10));
  for (let i = 0; i < MIN_NODE_VERSION.length; i++) {
    if ((current[i] ?? 0) > MIN_NODE_VERSION[i]) return true;
    if ((current[i] ?? 0) < MIN_NODE_VERSION[i]) return false;
  }
  return true;
}

/**
 * Render the top banner. Uses Unicode block elements (▀▄█) to give the
 * CHICO wordmark a chunky, modern feel reminiscent of modern CLI installers.
 *
 * We pad each line to the same width and frame it with thin rules above and
 * below so the eye locks onto the title.
 */
function printBanner(version) {
  const accent = pc.cyan;
  const dim = pc.dim;
  const bold = pc.bold;

  const wordmark = [
    '   ▄████▄   ██░ ██  ██▓ ▄████▄   ▒█████  ',
    '  ▒██▀ ▀█  ▓██░ ██▒▓██▒▒██▀ ▀█  ▒██▒  ██▒',
    '  ▒▓█    ▄ ▒██▀▀██░▒██▒▒▓█    ▄ ▒██░  ██▒',
    '  ▒▓▓▄ ▄██▒░▓█ ░██ ░██░▒▓▓▄ ▄██▒▒██   ██░',
    '  ▒ ▓███▀ ░░▓█▒░██▓░██░▒ ▓███▀ ░░ ████▓▒░',
    '  ░ ░▒ ▒  ░ ▒ ░░▒░▒░▓  ░ ░▒ ▒  ░░ ▒░▒░▒░ ',
  ];

  const subtitle = bold('CHICO PROTOCOL') + dim('  ·  ') + dim(`v${version}`);
  const tagline = dim('A full tech agency inside Claude Code');
  const stats = dim(`${STAT_AGENTS} agents · ${STAT_SKILLS} skills · one entry point  `) + accent('/chico');

  const rule = dim('━'.repeat(46));

  const lines = [
    '',
    rule,
    '',
    ...wordmark.map((l) => accent(l)),
    '',
    '  ' + subtitle,
    '  ' + tagline,
    '  ' + stats,
    '',
    rule,
    '',
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

/**
 * Print a section header — used between the major install phases to break up
 * the visual flow without resorting to walls of console.log.
 */
function sectionHeader(title, subtitle) {
  const rule = pc.dim('─'.repeat(46));
  process.stdout.write('\n');
  process.stdout.write('  ' + pc.bold(pc.white(title)) + '\n');
  if (subtitle) {
    process.stdout.write('  ' + pc.dim(subtitle) + '\n');
  }
  process.stdout.write('  ' + rule + '\n');
}

/**
 * Resolve a free-form language input. Handles --lang shortcuts (en/fr/...),
 * an "other:Custom" form, and falls back to title-casing whatever the user
 * typed.
 */
function resolveLanguageInput(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Handle "other:Klingon" → "Klingon"
  const otherMatch = raw.match(/^other\s*:\s*(.+)$/i);
  if (otherMatch) {
    return titleCase(otherMatch[1].trim());
  }

  const lower = raw.toLowerCase();
  if (LANG_BY_CODE[lower]) return LANG_BY_CODE[lower];

  // Already a full label? Match case-insensitively against known labels.
  const known = LANGUAGES.find((l) => l.label.toLowerCase() === lower);
  if (known) return known.label;

  return titleCase(raw);
}

function titleCase(s) {
  return s
    .split(/(\s+)/)
    .map((tok) => (/^\s+$/.test(tok) ? tok : tok.charAt(0).toUpperCase() + tok.slice(1)))
    .join('');
}

/**
 * Build the @clack select options array from the LANGUAGES catalogue.
 * `defaultLabel` highlights the recommended option as the initial cursor.
 */
function buildLanguageOptions() {
  const options = LANGUAGES.map(({ label, flag }) => ({
    value: label,
    label: `${flag} ${label}`,
  }));
  options.push({ value: '__other__', label: pc.dim('· Other (type your own)') });
  return options;
}

/**
 * Welcome section — shows what we're about to do, in plain language, with a
 * highlighted set of bullet points. No questions yet.
 */
function welcomeSection(targetPath) {
  p.note(
    [
      pc.bold('Welcome.') + pc.dim(" Let's set up Chico in this project."),
      '',
      pc.dim('We will:'),
      '  ' + pc.cyan('1.') + ' Copy ' + pc.bold('.claude/') + pc.dim(' (agent skills, scripts, hooks)'),
      '  ' + pc.cyan('2.') + ' Copy ' + pc.bold('_chico/') + pc.dim(' (configs, manifests, templates)'),
      '  ' + pc.cyan('3.') + ' Create ' + pc.bold('_chico-output/') + pc.dim(' (your workspace)'),
      '  ' + pc.cyan('4.') + ' Configure the manifest with your name + languages',
      '',
      pc.dim('Target  ') + pc.cyan(targetPath),
    ].join('\n'),
    'Overview',
  );
}

/**
 * Build the final install plan from CLI flags + interactive answers.
 * Returns a plain object with everything `runInstall` needs.
 *
 * Wording rationale:
 *   - "What's your name?" + helper "Chico will address you by this name…" gives
 *     the user a clear reason for the field.
 *   - The two language questions are split because they often differ (a user
 *     may want chat in French but PRDs in English for stakeholders).
 *   - We deliberately do NOT ask about Chico's reasoning language: that stays
 *     locked to English internally for prompt-engineering consistency.
 */
async function gatherAnswers(opts) {
  const cwd = process.cwd();
  const targetFromFlag = opts.target ? path.resolve(opts.target) : null;
  const targetPath = targetFromFlag || cwd;

  // Pre-resolve any preset languages so prompts default to them.
  const presetCommLang =
    resolveLanguageInput(opts.communicationLang) || resolveLanguageInput(opts.lang);
  const presetDocLang =
    resolveLanguageInput(opts.docLang) || resolveLanguageInput(opts.lang);

  // Non-interactive path: --yes or all required flags provided.
  if (opts.yes) {
    return {
      target: targetPath,
      userName: (opts.name && opts.name.trim()) || 'Developer',
      communicationLanguage: presetCommLang || 'English',
      documentLanguage: presetDocLang || 'English',
      force: Boolean(opts.force),
    };
  }

  // ── Welcome section ───────────────────────────────────────────────────────
  welcomeSection(targetPath);

  // ── Configuration section ─────────────────────────────────────────────────
  sectionHeader('Configuration', 'Three quick questions to personalize your install');

  // Q1 — Name
  const userName = await p.text({
    message: pc.bold("What's your name?"),
    placeholder: 'e.g. Alex',
    initialValue: opts.name || '',
    validate(value) {
      if (!value || !value.trim()) return 'Please enter a name — Chico will use it to address you.';
      if (value.trim().length > 64) return 'That looks long. Keep it under 64 characters.';
      return undefined;
    },
  });
  if (p.isCancel(userName)) gracefulCancel();

  // Show the helper hint right after — @clack doesn't render long descriptions
  // inline, so we emit it as a dim follow-up line.
  process.stdout.write(pc.dim('  └─ Chico will address you by this name in conversations.\n'));

  // Q2 — Chat language
  const commChoice = await p.select({
    message: pc.bold('Which language should Chico reply in?'),
    initialValue: presetCommLang || 'English',
    options: buildLanguageOptions(),
  });
  if (p.isCancel(commChoice)) gracefulCancel();

  let communicationLanguage;
  if (commChoice === '__other__') {
    const free = await p.text({
      message: 'Type the language name',
      placeholder: 'e.g. Catalan, Dutch, Swedish',
      validate(value) {
        if (!value || !value.trim()) return 'Please enter a language name.';
        return undefined;
      },
    });
    if (p.isCancel(free)) gracefulCancel();
    communicationLanguage = resolveLanguageInput(free);
  } else {
    communicationLanguage = String(commChoice);
  }
  process.stdout.write(
    pc.dim("  └─ This is what Chico uses to talk to you. Doesn't affect internal reasoning.\n"),
  );

  // Q3 — Document language
  const docChoice = await p.select({
    message: pc.bold('Which language for generated documents?'),
    initialValue: presetDocLang || communicationLanguage,
    options: buildLanguageOptions(),
  });
  if (p.isCancel(docChoice)) gracefulCancel();

  let documentLanguage;
  if (docChoice === '__other__') {
    const free = await p.text({
      message: 'Type the language name',
      placeholder: 'e.g. Catalan, Dutch, Swedish',
      validate(value) {
        if (!value || !value.trim()) return 'Please enter a language name.';
        return undefined;
      },
    });
    if (p.isCancel(free)) gracefulCancel();
    documentLanguage = resolveLanguageInput(free);
  } else {
    documentLanguage = String(docChoice);
  }
  process.stdout.write(
    pc.dim('  └─ Used when agents produce READMEs, briefs, PRDs, and technical docs.\n'),
  );

  return {
    target: targetPath,
    userName: String(userName).trim(),
    communicationLanguage,
    documentLanguage,
    force: Boolean(opts.force),
  };
}

/**
 * Cleanly exit when the user hits Ctrl-C inside any prompt.
 */
function gracefulCancel() {
  p.cancel(pc.yellow('Install cancelled — no changes were made.'));
  process.exit(0);
}

/**
 * Confirm overwrite if .claude or _chico already exist at the target.
 * Skipped if --force is set, blocked if --yes is set without --force.
 */
async function confirmOverwriteIfNeeded(answers, opts) {
  const claudePath = path.join(answers.target, '.claude');
  const chicoPath = path.join(answers.target, '_chico');
  const claudeExists = await fs.pathExists(claudePath);
  const chicoExists = await fs.pathExists(chicoPath);

  if (!claudeExists && !chicoExists) {
    return { proceed: true, force: answers.force };
  }

  if (answers.force) {
    return { proceed: true, force: true };
  }

  if (opts.yes) {
    // --yes alone is not enough to overwrite; require --force explicitly.
    p.log.error(
      pc.red(
        `Existing installation detected at ${answers.target}. Re-run with --force to overwrite.`,
      ),
    );
    return { proceed: false, force: false };
  }

  const which = [claudeExists && '.claude/', chicoExists && '_chico/']
    .filter(Boolean)
    .join(' and ');

  const confirmed = await p.confirm({
    message: pc.yellow(`Existing ${which} found at target. Overwrite?`),
    initialValue: false,
  });
  if (p.isCancel(confirmed) || !confirmed) {
    return { proceed: false, force: false };
  }
  return { proceed: true, force: true };
}

/**
 * Perform the actual install: copy template, templatize manifest, create output dir.
 *
 * The spinner labels are written so that each one tells a complete little
 * story ("Copying agent skills..." → "Copied N skills"). Each step includes a
 * short visible delay so the user perceives progress; total added latency is
 * around half a second, which is fine for a one-shot CLI.
 */
async function runInstall(answers, version) {
  const totals = { filesCopied: 0, dirsCopied: 0, skills: 0, configs: 0 };

  sectionHeader('Installing', 'Setting up Chico in your project');

  // 1. Copy .claude/
  const sp1 = p.spinner();
  sp1.start('Copying agent skills…');
  await sleep(150);
  const claudeResult = await copyTemplate({
    source: TEMPLATE_CLAUDE,
    target: path.join(answers.target, '.claude'),
    force: answers.force,
  });
  if (claudeResult.skipped) {
    sp1.stop(pc.yellow('Skipped .claude/ — already exists (use --force to overwrite).'));
  } else {
    totals.filesCopied += claudeResult.filesCopied;
    totals.dirsCopied += claudeResult.dirsCopied;
    // Skills live in .claude/skills/<name>/SKILL.md — count those folders.
    totals.skills = await countSkillDirs(path.join(answers.target, '.claude', 'skills'));
    sp1.stop(pc.green(`Copied ${totals.skills} agent skills.`));
  }

  // 2. Copy _chico/
  const sp2 = p.spinner();
  sp2.start('Copying configuration…');
  await sleep(150);
  const chicoResult = await copyTemplate({
    source: TEMPLATE_CHICO,
    target: path.join(answers.target, '_chico'),
    force: answers.force,
  });
  if (chicoResult.skipped) {
    sp2.stop(pc.yellow('Skipped _chico/ — already exists (use --force to overwrite).'));
  } else {
    totals.filesCopied += chicoResult.filesCopied;
    totals.dirsCopied += chicoResult.dirsCopied;
    totals.configs = await countModuleConfigs(path.join(answers.target, '_chico'));
    sp2.stop(pc.green(`Copied ${totals.configs} module configs.`));
  }

  // 3. Memory system templates — they're inside _chico/memory already, this
  //    spinner is informational so the user sees the step.
  const sp3 = p.spinner();
  sp3.start('Setting up memory system…');
  await sleep(150);
  await fs.ensureDir(path.join(answers.target, '_chico', 'memory'));
  sp3.stop(pc.green('Memory templates ready.'));

  // 4. Templatize manifest.yaml
  const sp4 = p.spinner();
  sp4.start('Initializing manifest…');
  await sleep(150);
  const manifestPath = path.join(
    answers.target,
    '_chico',
    '_config',
    'manifest.yaml',
  );
  const today = new Date().toISOString().slice(0, 10);
  const subst = await processManifest({
    manifestPath,
    vars: {
      USER_NAME: answers.userName,
      COMMUNICATION_LANGUAGE: answers.communicationLanguage,
      DOCUMENT_LANGUAGE: answers.documentLanguage,
      CHICO_VERSION: version,
      INSTALL_DATE: today,
    },
  });
  if (subst.missing.length > 0) {
    sp4.stop(
      pc.yellow(
        `Manifest configured (${subst.replaced} substitutions; ${subst.missing.length} placeholder(s) remained: ${subst.missing.join(', ')}).`,
      ),
    );
  } else {
    sp4.stop(pc.green(`Manifest configured for ${pc.bold(answers.userName)}.`));
  }

  // 5. Workspace
  const sp5 = p.spinner();
  sp5.start('Creating workspace…');
  await sleep(150);
  await fs.ensureDir(path.join(answers.target, '_chico-output'));
  sp5.stop(pc.green('Workspace ready.'));

  return totals;
}

/**
 * Count direct subdirectories of `.claude/skills/`. A skill folder always
 * contains a SKILL.md — we sanity-check that to avoid counting strays.
 */
async function countSkillDirs(skillsRoot) {
  if (!(await fs.pathExists(skillsRoot))) return 0;
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const hasSkillMd = await fs.pathExists(path.join(skillsRoot, entry.name, 'SKILL.md'));
    if (hasSkillMd) count += 1;
  }
  return count;
}

/**
 * Count module config directories under `_chico/` (any dir containing a
 * `config.yaml`). Skips `_config` since that's the system manifest, not a module.
 */
async function countModuleConfigs(chicoRoot) {
  if (!(await fs.pathExists(chicoRoot))) return 0;
  const entries = await fs.readdir(chicoRoot, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '_config') continue;
    const cfgPath = path.join(chicoRoot, entry.name, 'config.yaml');
    if (await fs.pathExists(cfgPath)) count += 1;
  }
  return count;
}

/**
 * Final recap. Stylized as a "Done." block with paths, stats, and three
 * numbered next steps. Uses p.note for the boxed framing.
 */
function printRecap(answers, totals, version) {
  sectionHeader('Done', 'Chico is installed and configured');

  const paths = [
    pc.dim('  .claude/        ') + pc.cyan(path.join(answers.target, '.claude')),
    pc.dim('  _chico/         ') + pc.cyan(path.join(answers.target, '_chico')),
    pc.dim('  _chico-output/  ') + pc.cyan(path.join(answers.target, '_chico-output')),
  ];

  const stats = [
    pc.dim('  Files copied   ') + pc.bold(pc.cyan(String(totals.filesCopied))),
    pc.dim('  Agents         ') + pc.bold(pc.cyan(String(STAT_AGENTS))),
    pc.dim('  Skills         ') + pc.bold(pc.cyan(String(totals.skills || STAT_SKILLS))),
    pc.dim('  Version        ') + pc.bold(pc.cyan(`v${version}`)),
  ];

  const steps = [
    pc.bold('  Next steps'),
    '    ' + pc.cyan('1.') + ' Open this project in ' + pc.bold('Claude Code'),
    '    ' + pc.cyan('2.') + ' Type ' + pc.bold(pc.cyan('/chico <your request>')),
    '    ' + pc.cyan('3.') + ' Optional: enable RAG (see ' + pc.cyan('docs/memory-system.md') + ')',
  ];

  process.stdout.write('\n');
  process.stdout.write(pc.bold(pc.green('  ✓ Install complete.')) + '\n\n');
  process.stdout.write(pc.bold('  Installed at:') + '\n');
  process.stdout.write(paths.join('\n') + '\n\n');
  process.stdout.write(pc.bold('  Summary:') + '\n');
  process.stdout.write(stats.join('\n') + '\n\n');
  process.stdout.write(steps.join('\n') + '\n\n');
  process.stdout.write(pc.dim('  GitHub  ') + pc.cyan(REPO_URL) + '\n\n');
}

/**
 * Pre-flight checks — Node version, sanity of the template tree.
 * Returns an array of error strings (empty if everything is fine).
 */
async function preflight() {
  const errors = [];

  if (!checkNodeVersion()) {
    errors.push(
      `Node.js ${MIN_NODE_VERSION.join('.')}+ is required (you are on ${process.versions.node}).`,
    );
  }

  if (!(await fs.pathExists(TEMPLATE_CLAUDE))) {
    errors.push(`Template missing: ${TEMPLATE_CLAUDE}`);
  }
  if (!(await fs.pathExists(TEMPLATE_CHICO))) {
    errors.push(`Template missing: ${TEMPLATE_CHICO}`);
  }

  return errors;
}

/**
 * Top-level install command handler.
 */
async function installCommand(opts) {
  const pkg = await loadPackageMeta();
  printBanner(pkg.version);

  // Pre-flight checks — print friendly errors instead of throwing if Node is
  // too old or the template is missing.
  const errors = await preflight();
  if (errors.length > 0) {
    process.stderr.write(pc.red(pc.bold('  Pre-flight failed:\n')));
    for (const e of errors) process.stderr.write(pc.red(`    • ${e}\n`));
    process.exit(1);
  }

  p.intro(pc.bgCyan(pc.black(' chico-protocol · install ')));

  const answers = await gatherAnswers(opts);

  const decision = await confirmOverwriteIfNeeded(answers, opts);
  if (!decision.proceed) {
    p.outro(pc.yellow('Install aborted — nothing was modified.'));
    process.exit(1);
  }
  answers.force = decision.force;

  const totals = await runInstall(answers, pkg.version);

  p.outro(pc.green('All set.'));
  printRecap(answers, totals, pkg.version);
}

/**
 * Wire up commander.
 */
async function main() {
  const pkg = await loadPackageMeta();
  const program = new Command();

  program
    .name('chico-protocol')
    .description(pkg.description)
    .version(pkg.version, '-v, --version', 'Print version and exit');

  program
    .command('install')
    .description('Install Chico Protocol into a project (interactive by default)')
    .option('--target <path>', 'Target directory (default: current working directory)')
    .option('--name <string>', 'Your name (manifest user_name field)')
    .option(
      '--lang <code>',
      'Language shortcut for both chat + docs (en|fr|es|de|it|pt|zh|ja | other:Name)',
    )
    .option(
      '--communication-lang <string>',
      'Override chat language (e.g. "French", "中文")',
    )
    .option(
      '--doc-lang <string>',
      'Override document output language (e.g. "English")',
    )
    .option('-y, --yes', 'Accept defaults, skip prompts (non-interactive, EN+EN)')
    .option('--force', 'Overwrite existing .claude/ and _chico/ without asking')
    .action(async (opts) => {
      try {
        await installCommand(opts);
      } catch (err) {
        process.stderr.write(pc.red(`\n  Install failed: ${err.message}\n`));
        if (process.env.CHICO_DEBUG) {
          process.stderr.write(pc.dim(String(err.stack)) + '\n');
        }
        process.exit(1);
      }
    });

  program
    .command('version')
    .description('Print the chico-protocol version')
    .action(() => {
      process.stdout.write(`chico-protocol v${pkg.version}\n`);
    });

  // Default behaviour: if no command supplied, behave like `install`.
  if (process.argv.length <= 2) {
    process.argv.push('install');
  }

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  process.stderr.write(pc.red(`\n  Fatal error: ${err.message}\n`));
  if (process.env.CHICO_DEBUG) {
    process.stderr.write(pc.dim(String(err.stack)) + '\n');
  }
  process.exit(1);
});
