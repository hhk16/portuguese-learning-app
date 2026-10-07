/** Put local-audit evidence and A/B listening clips beside the native APK artifact. */
import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
const root = new URL('../../', import.meta.url);
const report = JSON.parse(await readFile(new URL('docs/native-audio-audit.json', root), 'utf8'));
const out = new URL('native-tv-screenshots/audio-review/', root);
await mkdir(out, { recursive: true });
let guide = 'Local speech comparisons: each number has an older BEFORE and a new AFTER MP3.\nAutomated recognition is not a substitute for listening to the regional accent and clarity.\n\n';
for (const [i, c] of report.comparisons.entries()) {
  for (const when of ['before', 'after']) {
    if (!/^[a-f0-9]{10}\.mp3$/.test(c[when])) throw new Error('Invalid audio filename');
    await copyFile(new URL(`public/audio/${c[when]}`, root), new URL(`${i + 1}-${when}.mp3`, out));
  }
  guide += `${i + 1}: ${c.text}\nOlder transcript: ${c.beforeTranscript}\nNew transcript: ${c.afterTranscript}\n\n`;
}
await writeFile(new URL('README.txt', out), guide);
await copyFile(new URL('docs/native-audio-audit.json', root), new URL('audit.json', out));
