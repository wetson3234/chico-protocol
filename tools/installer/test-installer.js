#!/usr/bin/env node
/**
 * test-installer.js — Smoke test for the chico-protocol installer.
 *
 * Runs the CLI in non-interactive mode against a temp directory and asserts
 * that the canonical files were copied and that manifest.yaml was templatized.
 * Adds extra coverage for the new flags introduced in the UX refresh:
 *   - --lang shortcut handling (en, fr)
 *   - --communication-lang + --doc-lang split overrides
 *
 * Exit code: 0 if all checks pass, 1 otherwise.
 *
 * This is intentionally a smoke test — not a unit suite. It exists to catch
 * obvious regressions in CI (template not bundled, manifest substitution
 * broken, copy paths wrong, flag parsing changed, etc.).
 */

import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.join(__dirname, 'chico-cli.js');

function makeTempDir(tag = '') {
  const rand = Math.random().toString(36).slice(2, 10);
  const dir = path.join(os.tmpdir(), `chico-protocol-test-${tag}${rand}`);
  fs.ensureDirSync(dir);
  return dir;
}

const results = [];

function check(label, fn) {
  try {
    const ok = fn();
    if (ok === false) throw new Error('assertion returned false');
    results.push({ label, ok: true });
    process.stdout.write(`${pc.green('  ✓')} ${label}\n`);
  } catch (err) {
    results.push({ label, ok: false, err });
    process.stdout.write(`${pc.red('  ✗')} ${label} — ${err.message}\n`);
  }
}

/**
 * Invoke the installer with a stable set of flags in non-interactive mode.
 * Returns the spawnSync result + the temp dir used.
 */
function runInstaller(extraArgs, tag) {
  const tempDir = makeTempDir(tag ? `${tag}-` : '');
  const args = [
    CLI_PATH,
    'install',
    '--target',
    tempDir,
    '--name',
    'TestUser',
    '--yes',
    '--force',
    ...extraArgs,
  ];
  const proc = spawnSync(process.execPath, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  return { proc, tempDir };
}

async function run() {
  process.stdout.write(pc.bold('\nchico-protocol installer smoke test\n\n'));

  // ── Scenario A: --lang en (default English / English)
  const { proc, tempDir } = runInstaller(['--lang', 'en'], 'A');
  process.stdout.write(pc.dim(`  scenario A temp dir: ${tempDir}\n\n`));

  check('CLI exits with code 0 (scenario A)', () => {
    if (proc.status !== 0) {
      throw new Error(
        `exit ${proc.status}\n--- stdout ---\n${proc.stdout}\n--- stderr ---\n${proc.stderr}`,
      );
    }
    return true;
  });

  check('.claude/skills/chico/SKILL.md exists', () => {
    const target = path.join(tempDir, '.claude', 'skills', 'chico', 'SKILL.md');
    if (!fs.pathExistsSync(target)) throw new Error(`missing: ${target}`);
    return true;
  });

  check('_chico/_config/manifest.yaml exists', () => {
    const target = path.join(tempDir, '_chico', '_config', 'manifest.yaml');
    if (!fs.pathExistsSync(target)) throw new Error(`missing: ${target}`);
    return true;
  });

  check('_chico-output/ exists', () => {
    const target = path.join(tempDir, '_chico-output');
    if (!fs.pathExistsSync(target)) throw new Error(`missing: ${target}`);
    return true;
  });

  check('manifest.yaml has no leftover {{...}} placeholders', () => {
    const target = path.join(tempDir, '_chico', '_config', 'manifest.yaml');
    const content = fs.readFileSync(target, 'utf8');
    const leftover = content.match(/\{\{[A-Z0-9_]+\}\}/g);
    if (leftover && leftover.length > 0) {
      throw new Error(`leftover placeholders: ${leftover.join(', ')}`);
    }
    return true;
  });

  check('manifest.yaml contains user_name "TestUser"', () => {
    const target = path.join(tempDir, '_chico', '_config', 'manifest.yaml');
    const content = fs.readFileSync(target, 'utf8');
    if (!/user_name:\s*"?TestUser"?/.test(content)) {
      throw new Error('user_name not set to TestUser');
    }
    return true;
  });

  check('manifest.yaml contains communication_language "English"', () => {
    const target = path.join(tempDir, '_chico', '_config', 'manifest.yaml');
    const content = fs.readFileSync(target, 'utf8');
    if (!/communication_language:\s*"?English"?/.test(content)) {
      throw new Error('communication_language not set to English');
    }
    return true;
  });

  // ── Scenario B: --communication-lang French + --doc-lang English split.
  // Validates that the two language flags resolve independently and that the
  // language catalogue picks up "Français" from the --lang shortcut "fr".
  const { proc: procB, tempDir: tempDirB } = runInstaller(
    ['--communication-lang', 'fr', '--doc-lang', 'English'],
    'B',
  );
  process.stdout.write(pc.dim(`\n  scenario B temp dir: ${tempDirB}\n\n`));

  check('CLI exits with code 0 (scenario B)', () => {
    if (procB.status !== 0) {
      throw new Error(
        `exit ${procB.status}\n--- stdout ---\n${procB.stdout}\n--- stderr ---\n${procB.stderr}`,
      );
    }
    return true;
  });

  check('manifest.yaml has communication_language "Français" (scenario B)', () => {
    const target = path.join(tempDirB, '_chico', '_config', 'manifest.yaml');
    const content = fs.readFileSync(target, 'utf8');
    if (!/communication_language:\s*"?Français"?/.test(content)) {
      throw new Error(
        `communication_language not set to Français — content includes:\n${content
          .split('\n')
          .filter((l) => l.includes('language'))
          .join('\n')}`,
      );
    }
    return true;
  });

  check('manifest.yaml has document_output_language "English" (scenario B)', () => {
    const target = path.join(tempDirB, '_chico', '_config', 'manifest.yaml');
    const content = fs.readFileSync(target, 'utf8');
    if (!/document_output_language:\s*"?English"?/.test(content)) {
      throw new Error('document_output_language not set to English');
    }
    return true;
  });

  // ── Cleanup
  for (const dir of [tempDir, tempDirB]) {
    try {
      await fs.remove(dir);
      process.stdout.write(pc.dim(`\n  cleaned up ${dir}\n`));
    } catch (err) {
      process.stdout.write(
        pc.yellow(`\n  cleanup warning: could not remove ${dir}: ${err.message}\n`),
      );
    }
  }

  // ── Summary
  const failed = results.filter((r) => !r.ok);
  process.stdout.write('\n');
  if (failed.length === 0) {
    process.stdout.write(
      pc.bold(pc.green(`  All ${results.length} checks passed.\n\n`)),
    );
    process.exit(0);
  } else {
    process.stdout.write(
      pc.bold(pc.red(`  ${failed.length} / ${results.length} check(s) failed.\n\n`)),
    );
    process.exit(1);
  }
}

run().catch((err) => {
  process.stderr.write(pc.red(`\nTest harness crashed: ${err.message}\n`));
  process.stderr.write(pc.dim(String(err.stack)) + '\n');
  process.exit(1);
});
