import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { writeReport } from './visual-qa-report.mjs';

// Rebuild only the latest batch's HTML. Screenshots and manifests remain immutable.
const evidence = new URL('../artifacts/visual-qa/', import.meta.url);
const latest = JSON.parse(await readFile(new URL('latest.json', evidence), 'utf8'));
const root = new URL(latest.path, evidence);
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
await writeReport(root, manifest);
process.stdout.write(`${root.pathname}index.html\n`);
