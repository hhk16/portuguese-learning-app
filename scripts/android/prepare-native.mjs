/** Export original curriculum data and only the speech used by the native TV app. No web build. */
import { mkdir, readFile, writeFile, copyFile, rm, access, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ALL_ITEMS, LESSONS } from '../../src/curriculum/index.ts';
import { UNITS, unitOf } from '../../src/curriculum/units.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = `${root}android-tv/app/src/main/assets`;
const checkOnly = process.argv.includes('--check');
const sceneAssets = ['home', 'cafe', 'conversation'];
const foodAssets = ['coffee', 'milk', 'bread', 'soup', 'icecream', 'cake', 'croissant', 'water'];
const characterAssets = ['hadi', 'ana'].flatMap(who => [who, ...['wave', 'cheer', 'think', 'stand'].map(pose => `${who}-${pose}`)]);
for (const name of [...sceneAssets, ...foodAssets]) await access(`${root}public/art/native-tv/${name}.webp`);
for (const name of characterAssets) await access(`${root}public/art/characters/${name}.webp`);
await access(`${root}public/art/native-tv/fonts/nunito.ttf`);
const manifest = JSON.parse(await readFile(`${root}public/audio/manifest.json`, 'utf8'));
const key = (s) => s.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
const people = { eu: 'Eu', tu: 'Tu', ele: 'Ele / ela', nos: 'Nós', eles: 'Eles / elas' };
const tense = { presente: 'present', pps: 'past (pretérito perfeito)', ir_futuro: 'future plan', estar_a: 'ongoing action', imperativo: 'imperative' };

function card(it) {
  let pt, en, prompt, answer, options;
  switch (it.kind) {
    case 'noun': pt = `${it.article} ${it.pt}`; en = it.en; break;
    case 'phrase': pt = it.pt; en = it.en; break;
    case 'number': pt = it.pt; en = String(it.value); break;
    case 'adjective': pt = it.m; en = `${it.en} (masculine)`; break;
    case 'profession': pt = it.m; en = `${it.en} (masculine)`; break;
    case 'nationality': pt = it.ms; en = `${it.en} (masculine)`; break;
    case 'conjugation':
      pt = `${people[it.person]} ${it.form}`;
      en = `${it.verb} · ${tense[it.tense]}`;
      prompt = `${people[it.person]} ___\n${it.verb} · ${tense[it.tense]}`;
      answer = it.form;
      options = ALL_ITEMS.filter(x => x.kind === 'conjugation' && x.verb === it.verb && x.tense === it.tense).map(x => x.form);
      if (new Set(options).size < 2) options = ALL_ITEMS.filter(x => x.kind === 'conjugation' && x.verb === it.verb).map(x => x.form);
      if (new Set(options).size < 2) options = ALL_ITEMS.filter(x => x.kind === 'conjugation' && x.tense === it.tense).map(x => x.form);
      break;
    case 'contraction':
      pt = `${it.prep} + ${it.article} = ${it.form}`; en = 'Preposition + article';
      prompt = `${it.prep} + ${it.article} = ___`; answer = it.form;
      options = ALL_ITEMS.filter(x => x.kind === 'contraction').map(x => x.form); break;
    case 'origin':
      pt = `Sou ${it.form}.`; en = `I am from ${it.place}.`;
      prompt = `${it.place}\nSou ___.`; answer = it.form;
      options = ['de', 'do', 'da', 'dos', 'das'].map(x => `${x} ${it.place}`); break;
    case 'frame':
      pt = it.text.replace('___', it.answer); en = it.en ?? '';
      prompt = it.text; answer = it.answer; options = it.distractors; break;
    case 'error': {
      const tokens = [...it.tokens]; tokens[it.wrongIndex] = it.fix;
      pt = tokens.join(' '); en = it.en ?? '';
      const gap = [...it.tokens]; gap[it.wrongIndex] = '___';
      prompt = gap.join(' '); answer = it.fix; options = [it.tokens[it.wrongIndex]]; break;
    }
    case 'minimalPair':
      pt = it.target; en = it.hint ?? it.feature;
      prompt = 'Listen and choose the word.'; answer = it.target; options = [it.contrast]; break;
    default: throw new Error(`Unsupported item kind: ${it.kind}`);
  }
  const audio = manifest[key(pt)] ?? null;
  return { id: it.id, kind: it.kind, pt, en, prompt: prompt ?? pt, answer: answer ?? en,
    options: options ?? [], why: it.why ?? '', audio, source: it.source };
}

const cards = ALL_ITEMS.map(card);
const byId = new Map(cards.map(c => [c.id, c]));
for (const c of cards) {
  if (!c.options.length && c.kind !== 'minimalPair') {
    c.options = cards.filter(x => x.kind === c.kind && key(x.answer) !== key(c.answer)).map(x => x.answer);
  }
  c.options = [...new Set([c.answer, ...c.options].map(s => s.normalize('NFC')))];
  // Keep a varied, bounded pool instead of repeating hundreds of distractors in every lesson.
  if (c.options.length > 13) {
    const rest = c.options.slice(1), offset = cards.indexOf(c) % rest.length;
    c.options = [c.answer, ...Array.from({ length: 12 }, (_, i) => rest[(offset + i * 17) % rest.length])];
    c.options = [...new Set(c.options)];
  }
  if (!c.pt || !c.answer || c.options.length < 2) throw new Error(`Unplayable item ${c.id}`);
  // A minimal pair is an audio discrimination task; it must never expose the answer as a prompt.
  if (c.kind === 'minimalPair' && !c.audio) c.options = [];
}
const lessons = LESSONS.map(l => ({ id: l.id, unit: unitOf(l.unit)?.id ?? l.unit, title: l.title,
  source: l.source, cards: l.itemIds.map(id => {
    if (!byId.has(id)) throw new Error(`${l.id}: missing item ${id}`);
    return byId.get(id);
  }).filter(c => c.options.length > 1) }));
for (const l of lessons) if (!l.cards.length) throw new Error(`Empty lesson ${l.id}`);
const files = new Set(cards.filter(c => c.audio).map(c => c.audio));
// Original, concrete situations. Every prompt specifies why only one reply fits.
const dialogue = [
  ['Introduce yourself. Someone asks: Como te chamas?', 'Chamo-me Ana.', ['Tenho trinta anos.', 'Moro no Porto.', 'São duas horas.'], 'Como te chamas? asks your name. Chamo-me… means My name is…'],
  ['Say where you are from. Someone asks: De onde és?', 'Sou de Portugal.', ['Tenho um gato.', 'Até amanhã!', 'Queria um café.'], 'De onde és? asks where you are from. Sou de… means I am from…'],
  ['Say your age. Someone asks: Quantos anos tens?', 'Tenho trinta anos.', ['Sou português.', 'Moro em Lisboa.', 'De nada.'], 'Age uses ter: Tenho trinta anos, literally I have thirty years.'],
  ['A waiter asks: O que deseja? Order a coffee politely.', 'Queria um café, por favor.', ['Até amanhã!', 'São três euros.', 'Está frio.'], 'Queria… por favor is a polite way to order.'],
  ['You did not understand. Ask the speaker to repeat.', 'Pode repetir, por favor?', ['Muito prazer.', 'Sim, gosto.', 'Boa noite!'], 'Pode repetir, por favor? means Can you repeat, please?'],
  ['A shopkeeper says: São três euros. Thank them.', 'Obrigado.', ['São duas horas.', 'Sou de Portugal.', 'Não tenho irmãos.'], 'Obrigado / Obrigada means Thank you. Use the form that fits you.'],
  ['You are introduced to someone for the first time.', 'Muito prazer.', ['Queria um pão.', 'É à direita.', 'Tenho dois gatos.'], 'Muito prazer means Nice to meet you.'],
  ['You will see your friend tomorrow. Say goodbye.', 'Até amanhã!', ['Bom dia!', 'Não percebo.', 'Sou estudante.'], 'Até amanhã means See you tomorrow.'],
].map(([prompt, answer, distractors, why], i) => ({ id: `native.dialogue.${i}`, kind: 'dialogue',
  pt: answer, en: '', prompt, answer, options: [answer, ...distractors], why, audio: manifest[key(answer)] ?? null }));
const orders = [
  ['Queria um café, por favor.', '1 coffee', ['2 coffees', '1 bread roll', '1 milk']],
  ['Queria dois pães, por favor.', '2 bread rolls', ['1 bread roll', '2 coffees', '2 cakes']],
  ['Queria um café e um leite, por favor.', '1 coffee + 1 milk', ['2 coffees', '1 milk + 1 bread roll', '2 milks']],
  ['Queria duas sopas e um pão, por favor.', '2 soups + 1 bread roll', ['1 soup + 2 bread rolls', '2 coffees + 1 bread roll', '2 soups']],
  ['Queria dois gelados, por favor.', '2 ice creams', ['1 ice cream', '2 cakes', '2 breads']],
  ['Queria um bolo e um leite, por favor.', '1 cake + 1 milk', ['2 cakes', '1 bread + 1 milk', '1 cake + 1 coffee']],
  ['Queria um pão e um croissant, por favor.', '1 bread roll + 1 croissant', ['2 croissants', '1 bread roll + 1 coffee', '2 bread rolls']],
  ['Queria três águas e dois cafés, por favor.', '3 waters + 2 coffees', ['2 waters + 3 coffees', '3 waters + 1 coffee', '2 waters + 2 coffees']],
].map(([pt, answer, distractors], i) => ({ id: `native.cafe.${i}`, kind: 'cafe', pt, en: answer,
  prompt: 'Listen to the customer. Which tray matches the order?', answer, options: [answer, ...distractors],
  why: `${pt}\n${answer}. Um / uma = 1; dois / duas = 2; três = 3.`, audio: manifest[key(pt)] ?? null }));
for (const c of orders) if (!c.audio) throw new Error(`Missing café recording: ${c.pt}`);
for (const c of [...dialogue, ...orders]) if (c.audio) files.add(c.audio);
for (const file of files) {
  if (!/^[a-f0-9]+\.mp3$/.test(file)) throw new Error(`Invalid audio path: ${file}`);
  if (!checkOnly) await access(`${root}public/audio/${file}`);
}
if (!checkOnly) {
  await mkdir(output, { recursive: true });
  await rm(`${output}/audio`, { recursive: true, force: true });
  await mkdir(`${output}/audio`, { recursive: true });
  await rm(`${output}/art`, { recursive: true, force: true });
  await mkdir(`${output}/art`, { recursive: true });
  for (const name of [...sceneAssets, ...foodAssets]) await copyFile(`${root}public/art/native-tv/${name}.webp`, `${output}/art/${name}.webp`);
  for (const name of characterAssets) await copyFile(`${root}public/art/characters/${name}.webp`, `${output}/art/${name}.webp`);
  await cp(`${root}public/art/native-tv/fonts`, `${output}/art/fonts`, { recursive: true });
  await writeFile(`${output}/curriculum.json`, JSON.stringify({ version: 1, units: UNITS, lessons,
    games: [{ id: 'dialogue', cards: dialogue }, { id: 'cafe', cards: orders }] }));
  for (const file of files) await copyFile(`${root}public/audio/${file}`, `${output}/audio/${file}`);
}
console.log(`Native curriculum: ${lessons.length} lessons, ${cards.length} items, ${files.size} bundled clips${checkOnly ? ' (structure check)' : ''}.`);
