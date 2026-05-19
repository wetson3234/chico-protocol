/**
 * copy-template.js — Recursive template copy helper for the chico-protocol installer.
 *
 * Walks the template source tree and copies it to the target directory using
 * fs-extra. Returns counts so the CLI can report what happened.
 *
 * Behaviour:
 *  - If `target` already exists and `force` is false, the copy is skipped and
 *    the function returns `{ skipped: true, ... }`.
 *  - If `force` is true, existing files are overwritten in place (fs-extra's
 *    `copy` with `overwrite: true`).
 *  - Counts are produced by an independent walk of the source tree so they
 *    reflect what was actually present (and therefore copied).
 */

import fs from 'fs-extra';
import path from 'node:path';

/**
 * Recursively count files and directories under `dir`.
 * @param {string} dir Absolute path.
 * @returns {Promise<{ filesCopied: number, dirsCopied: number }>}
 */
async function countTree(dir) {
  let filesCopied = 0;
  let dirsCopied = 0;

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        dirsCopied += 1;
        await walk(entryPath);
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        filesCopied += 1;
      }
    }
  }

  await walk(dir);
  return { filesCopied, dirsCopied };
}

/**
 * Copy a template directory to a target directory.
 *
 * @param {object} options
 * @param {string} options.source - Absolute path to template source folder.
 * @param {string} options.target - Absolute path to destination folder.
 * @param {boolean} [options.force=false] - Overwrite existing destination.
 * @returns {Promise<{ filesCopied: number, dirsCopied: number, skipped: boolean }>}
 */
export async function copyTemplate({ source, target, force = false }) {
  const sourceExists = await fs.pathExists(source);
  if (!sourceExists) {
    throw new Error(`Template source not found: ${source}`);
  }

  const targetExists = await fs.pathExists(target);
  if (targetExists && !force) {
    return { filesCopied: 0, dirsCopied: 0, skipped: true };
  }

  await fs.ensureDir(path.dirname(target));
  await fs.copy(source, target, {
    overwrite: true,
    errorOnExist: false,
    preserveTimestamps: true,
  });

  const counts = await countTree(source);
  return { ...counts, skipped: false };
}
