/**
 * process-manifest.js — Templatize the installed manifest.yaml.
 *
 * Reads the manifest at `manifestPath`, replaces every `{{KEY}}` placeholder
 * with the matching value from `vars`, and writes the result back. Uses
 * js-yaml only to validate the post-substitution result so we keep the
 * original formatting (comments + ordering) intact.
 */

import fs from 'fs-extra';
import yaml from 'js-yaml';

/**
 * Substitute {{VAR}} placeholders in a YAML manifest file.
 *
 * @param {object} options
 * @param {string} options.manifestPath - Absolute path to manifest.yaml.
 * @param {Record<string,string>} options.vars - Map of placeholder names to values.
 * @returns {Promise<{ replaced: number, missing: string[] }>}
 *   `replaced` = number of placeholder substitutions performed,
 *   `missing`  = placeholder tokens that remained unresolved (should be empty).
 */
export async function processManifest({ manifestPath, vars }) {
  const exists = await fs.pathExists(manifestPath);
  if (!exists) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const original = await fs.readFile(manifestPath, 'utf8');
  let result = original;
  let replaced = 0;

  for (const [key, rawValue] of Object.entries(vars)) {
    const value = String(rawValue ?? '');
    const token = `{{${key}}}`;
    // Escape regex metachars in the token (defensive — keys are uppercase ASCII today).
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'g');
    const before = result;
    result = result.replace(pattern, value);
    if (result !== before) {
      replaced += (before.match(pattern) || []).length;
    }
  }

  // Detect any leftover {{...}} placeholders.
  const leftover = result.match(/\{\{[A-Z0-9_]+\}\}/g) || [];

  // Validate the result is still parseable YAML (sanity check, not a rewrite).
  try {
    yaml.load(result);
  } catch (err) {
    throw new Error(
      `Manifest substitution produced invalid YAML: ${err.message}`,
    );
  }

  await fs.writeFile(manifestPath, result, 'utf8');

  return { replaced, missing: leftover };
}
