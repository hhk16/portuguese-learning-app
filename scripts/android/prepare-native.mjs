/** Export original curriculum data and only the speech used by the native TV app. No web build. */
import { mkdir, readFile, writeFile, copyFile, rm, access, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ALL_ITEMS, LESSONS } from '../../src/curriculum/index.ts';
import { cardOf } from '../../src/curriculum/learn.ts';
import { UNITS, unitOf } from '../../src/curriculum/units.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = `${root}android-tv/app/src/main/assets`;
const checkOnly = process.argv.includes('--check');
const sceneAssets = ['home', 'cafe', 'conversation', 'market', 'station', 'home-life', 'pharmacy', 'park', 'journey'];
const foodAssets = ['coffee', 'milk', 'bread', 'soup', 'icecream', 'cake', 'croissant', 'water'];
const objectAssets = ['cat', 'dog', 'bird', 'fish', 'book', 'chair', 'table', 'key', 'car', 'train', 'bus', 'bicycle'];
const poseAssets = ['hadi', 'ana'].flatMap(who => ['cheer', 'think'].map(pose => `${who}-${pose}`));
const characterAssets = ['hadi', 'ana'].flatMap(who => [who, `${who}-wave`]);
for (const name of [...sceneAssets, ...foodAssets, ...objectAssets, ...poseAssets]) await access(`${root}public/art/native-tv/${name}.webp`);
for (const name of characterAssets) await access(`${root}public/art/characters/${name}.webp`);
await access(`${root}public/art/native-tv/fonts/nunito.ttf`);
await access(`${root}public/art/native-tv/fonts/nunito-bold.ttf`);
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
  const learned = cardOf(it);
  const speechText = learned?.say ?? pt;
  const audio = manifest[key(speechText)] ?? null;
  const teachPt = learned?.pt ?? pt;
  // The early present-tense translation table must not override later past forms.
  const teachEn = it.kind === 'conjugation' && it.tense !== 'presente' ? it.en : learned?.en ?? en;
  let grammarHint = '', examplePt = '', exampleEn = '';
  if (it.kind === 'conjugation') {
    const subjects = {eu: 'I', tu: 'you (one friend)', ele: 'he / she', nos: 'we', eles: 'they'};
    const times = {presente: 'Present: a fact or a habit.', pps: 'Past: a completed event.', ir_futuro: 'A future plan: ir + infinitive.', estar_a: 'Happening now: estar a + infinitive.', imperativo: 'A command or suggestion to one friend. The subject is not spoken.'};
    grammarHint = `${subjects[it.person]} · ${times[it.tense]}`;
    const examples = {
      ser: ['estudante', 'a student', 'conversation'], ter: ['um livro', 'a book', 'home-life'],
      falar: ['português', 'Portuguese', 'conversation'], morar: ['em Lisboa', 'in Lisbon', 'home-life'],
      trabalhar: ['em casa', 'at home', 'home-life'], estudar: ['português', 'Portuguese', 'home-life'],
      'gostar (de)': ['de café', 'coffee', 'cafe'], 'chamar-se': ['Anna', 'Anna', 'conversation'],
      comer: ['pão', 'bread', 'cafe'], beber: ['água', 'water', 'cafe'], viver: ['em Lisboa', 'in Lisbon', 'home-life'],
      aprender: ['português', 'Portuguese', 'conversation'], perceber: ['a pergunta', 'the question', 'conversation'],
      estar: ['em casa', 'at home', 'home-life'], costumar: ['ler', 'usually read', 'home-life'],
      decidir: ['ficar', 'to stay', 'home-life'], preferir: ['chá', 'tea', 'cafe'], partir: ['amanhã', 'tomorrow', 'journey'],
      'levantar-se': ['cedo', 'early', 'home-life'], 'deitar-se': ['cedo', 'early', 'home-life'], 'vestir-se': ['para sair', 'to go out', 'home-life'],
      ver: ['o mar', 'the sea', 'journey'], ler: ['um livro', 'a book', 'home-life'], ouvir: ['música', 'music', 'park'],
      ir: ['ao parque', 'to the park', 'park'], sair: ['de casa', 'home', 'home-life'], vir: ['ao café', 'to the café', 'cafe'],
      ficar: ['em casa', 'at home', 'home-life'], poder: ['ajudar', 'help', 'conversation'], querer: ['um café', 'a coffee', 'cafe'],
      saber: ['a resposta', 'the answer', 'conversation'], dizer: ['olá', 'hello', 'conversation'], fazer: ['o jantar', 'dinner', 'home-life'],
      preparar: ['o jantar', 'dinner', 'home-life'], arrumar: ['a casa', 'the house', 'home-life'], dar: ['um livro à Anna', 'Anna a book', 'conversation'],
      trazer: ['um livro', 'a book', 'conversation'], pôr: ['o livro na mesa', 'the book on the table', 'home-life'],
      viajar: ['para Lisboa', 'to Lisbon', 'journey'], experimentar: ['um casaco', 'a coat', 'market'], procurar: ['a chave', 'the key', 'home-life'],
      'sentir-se': ['bem', 'well', 'pharmacy'], pedir: ['um café', 'a coffee', 'cafe'], perder: ['a chave', 'the key', 'home-life'],
      dormir: ['bem', 'well', 'home-life'], descansar: ['em casa', 'at home', 'home-life'], tomar: ['o medicamento', 'the medicine', 'pharmacy'],
      visitar: ['Lisboa', 'Lisbon', 'journey'], conhecer: ['a Anna', 'Anna', 'conversation'],
    };
    const [tail, translation, scene] = examples[it.verb] ?? [];
    if (!tail) throw new Error(`Missing contextual example: ${it.id}`);
    const plural = ['nos', 'eles'].includes(it.person);
    const natural = it.tense === 'imperativo' ? it.form : `${{eu:'Eu',tu:'Tu',ele:'Ela',nos:'Nós',eles:'Eles'}[it.person]} ${it.form}`;
    const ptTail = it.verb === 'ser' && plural ? 'estudantes' : it.verb === 'chamar-se' && plural ? 'Hadi e Anna' : tail;
    let meaning = teachEn.replace('he / she', 'she').replace(/\s*\([^)]*\)/g, '').replace(/!$/, '');
    meaning = meaning.replace('his / her name', 'her name').replace('she / it', 'she').replace('stays · is', 'stays').replace('stay · am', 'stay').replace('stay · are', 'stay').replace('is / stays', 'stays');
    meaning = meaning.replace('met / got to know', 'met').replace('did / made', 'made').replace('do / make', 'make');
    if (it.verb === 'fazer') meaning = meaning.replace(/\bdoing\b/g, 'making').replace(/\bdid\b/g, 'made').replace(/\bdoes\b/g, 'makes').replace(/\bdo\b/g, 'make');
    if (it.verb === 'sair') meaning = meaning.replace('go out / leave', 'leave').replace('goes out / leaves', 'leaves').replace('went out / left', 'left').replace('go out', 'leave').replace('goes out', 'leaves').replace('went out', 'left');
    if (it.verb === 'ouvir') meaning = meaning.replace('hear / listen', 'listen to').replace('hears / listens', 'listens to');
    if (it.verb === 'ver') meaning = meaning.replace('see / watch', 'see').replace('sees / watches', 'sees');
    meaning = meaning.replace('makes / makes', 'makes');
    if (it.verb === 'costumar') meaning = `${{eu:'I',tu:'you',ele:'she',nos:'we',eles:'they'}[it.person]} usually ${it.person === 'ele' ? 'reads' : 'read'}`;
    examplePt = `${natural} ${ptTail}${it.tense === 'pps' ? ' ontem' : it.tense === 'estar_a' ? ' agora' : ''}${it.tense === 'imperativo' ? '!' : '.'}`;
    exampleEn = `${meaning}${it.verb === 'costumar' ? '' : ' ' + (it.verb === 'ser' && plural ? 'students' : it.verb === 'chamar-se' && plural ? 'Hadi and Anna' : translation)}${it.tense === 'pps' ? ' yesterday' : it.tense === 'estar_a' ? ' now' : ''}${it.tense === 'imperativo' ? '!' : '.'}`;
    // Past partir needs a past time cue, rather than 'tomorrow yesterday'.
    if (it.verb === 'partir' && it.tense === 'pps') { examplePt = `${natural} ontem.`; exampleEn = `${meaning} yesterday.`; }
    if (it.tense === 'imperativo') prompt = `___!\n${teachEn}`;
    if (it.verb === 'ser' && it.tense === 'pps') grammarHint += ' Ser means be; ir uses the same past forms but means go.';
    if (it.verb.endsWith('-se')) grammarHint += ' Keep the reflexive pronoun with the verb.';
    it.nativeScene = scene;
  }

  const pictures = { coffee: 'coffee', milk: 'milk', bread: 'bread', soup: 'soup', cake: 'cake', water: 'water', croissant: 'croissant', 'ice cream': 'icecream', cat: 'cat', dog: 'dog', bird: 'bird', fish: 'fish', book: 'book', chair: 'chair', table: 'table', key: 'key', car: 'car', train: 'train', bus: 'bus', bicycle: 'bicycle' };
  const art = it.kind === 'conjugation' ? it.nativeScene : it.kind === 'noun' ? pictures[(it.en ?? '').toLowerCase()] ?? '' : '';
  const coaching = {
    noun: `Learn the article with the noun: ${it.article ?? ''} ${it.pt ?? ''}. The article helps you remember its gender.`,
    conjugation: 'Match the verb form to the subject and the tense. Say the whole phrase after listening.',
    contraction: 'Portuguese joins this preposition and article into one word. Practise the combined form.',
    adjective: 'This is the masculine form. Adjectives agree with the noun they describe.',
    profession: 'This is the masculine form. Some professions change their ending for a female person.',
    nationality: 'This is the masculine singular form. Nationalities agree with the person they describe.',
    origin: 'Use de to say where you are from. De combines with a place article: de + o = do; de + a = da.',
    minimalPair: 'Listen for the difference. Replay slowly, then compare the words without reading the answer.',
  };
  const why = ['adjective', 'profession', 'nationality'].includes(it.kind) ? `Learn both forms together. ${learned.pt.replace(' · ', ' (masculine), ')}${learned.pt.includes(' · ') ? ' (feminine)' : ' is used for both genders'}. Match the form to the person or noun.` : it.why || coaching[it.kind] || '';
  return { id: it.id, kind: it.kind, pt, en, prompt: prompt ?? pt, answer: answer ?? en,
    options: options ?? [], why, art, context: '', audio, speechText, teachPt, teachEn, grammarHint, examplePt, exampleEn, source: it.source };
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
  if (c.kind !== 'minimalPair' && !c.audio) throw new Error(`Missing natural speech: ${c.id} (${c.speechText})`);
  // A minimal pair is an audio discrimination task; it must never expose the answer as a prompt.
  if (c.kind === 'minimalPair' && !c.audio) c.options = [];
}
const lessonGoals = JSON.parse(await readFile(`${root}scripts/android/lesson-goals.json`, 'utf8'));
const lessons = LESSONS.map(l => ({ id: l.id, unit: unitOf(l.unit)?.id ?? l.unit, title: l.title, goal: lessonGoals[l.id],
  source: l.source, cards: l.itemIds.map(id => {
    if (!byId.has(id)) throw new Error(`${l.id}: missing item ${id}`);
    return byId.get(id);
  }).filter(c => c.options.length > 1) }));
for (const l of lessons) if (!l.cards.length || !l.goal) throw new Error(`Missing lesson content or English goal: ${l.id}`);
const files = new Set(cards.filter(c => c.audio).map(c => c.audio));
const conversationSource = JSON.parse(await readFile(`${root}scripts/android/conversations.json`, 'utf8'));
const conversations = conversationSource.map(t => ({id: t.id, title: t.title, goal: t.goal, art: t.art,
  cards: t.turns.map((turn, i) => ({id: `conversation.${t.id}.${i}`, pt: turn.pt, en: turn.en, prompt: turn.heard,
    context: turn.goal, why: turn.why, heardEn: turn.heardEn, followup: turn.next, followupEn: turn.nextEn,
    options: t.turns.map(x => x.pt), audio: manifest[key(turn.pt)], heardAudio: manifest[key(turn.heard)], followupAudio: manifest[key(turn.next)]}))
}));
for (const t of conversations) for (const c of t.cards) {
  if (new Set(c.options).size !== 3 || !c.context || !c.heardEn || !c.followupEn) throw new Error(`Invalid conversation: ${c.id}`);
  for (const clip of [c.audio, c.heardAudio, c.followupAudio]) {
    if (!clip) throw new Error(`Missing conversation recording: ${c.id}`);
    files.add(clip);
  }
}
// Original, concrete situations. Every prompt specifies why only one reply fits.
const dialogue = [
  ['Introduce yourself. Someone asks: Como te chamas?', 'O meu nome é Ana.', ['Tenho trinta anos.', 'Moro no Porto.', 'São duas horas.'], 'Como te chamas? asks your name. O meu nome é… means My name is…'],
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
const topics = JSON.parse(await readFile(`${root}scripts/android/phrasebook.json`, 'utf8'));
const phrasebook = topics.map(t => ({...t, cards: t.phrases.map((p, i) => ({
  ...p, id: `phrase.${t.id}.${i}`, audio: manifest[key(p.pt)] ?? null,
  options: t.phrases.map(x => x.en),
}))}));
// Small, coherent visual sets. Every picture has one unambiguous noun and recording.
const worlds = [
  { id: 'snacks', title: 'A café stop', goal: 'Name four things you can order.', art: 'cafe', slugs: ['cafe', 'leite', 'pao', 'bolo'] },
  { id: 'home', title: 'Around the house', goal: 'Recognise four everyday objects.', art: 'home-life', slugs: ['livro', 'cadeira', 'mesa', 'chave'] },
  { id: 'animals', title: 'Friends in the park', goal: 'Meet four animals in Portuguese.', art: 'park', slugs: ['gato', 'cao', 'passaro', 'peixe'] },
  { id: 'travel', title: 'Let’s go somewhere', goal: 'Learn four ways to travel.', art: 'journey', slugs: ['carro', 'comboio', 'autocarro', 'bicicleta'] },
].map(w => {
  const originals = w.slugs.map(slug => byId.get(`vocab.noun.${slug}`));
  if (originals.some(c => !c || !c.art || !c.audio)) throw new Error(`Incomplete picture world: ${w.id}`);
  return {...w, cards: originals.map(c => ({...c, id: `picture.${w.id}.${c.id.split('.').pop()}`, kind: 'picture',
    prompt: c.pt, answer: c.en, options: originals.map(x => x.en),
    why: `${c.pt} means ${c.en}. ${c.pt.startsWith('a ') ? 'A is the feminine article.' : 'O is the masculine article.'} Say the article and noun together.`}))};
});
for (const t of phrasebook.filter(t => !['greetings', 'cafe'].includes(t.id))) {
  for (const p of t.cards) dialogue.push({ id: `${p.id}.reply`, kind: 'dialogue', pt: p.pt, en: p.en,
    prompt: `${p.situation}\nSay: ${p.en}`, answer: p.pt, options: t.cards.map(x => x.pt),
    why: p.tip, art: t.art, audio: p.audio });
}
for (const t of phrasebook) for (const p of t.cards) {
  if (!p.audio) throw new Error(`Missing phrasebook recording: ${p.pt}`);
  files.add(p.audio);
}
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
  for (const name of [...sceneAssets, ...foodAssets, ...objectAssets, ...poseAssets]) await copyFile(`${root}public/art/native-tv/${name}.webp`, `${output}/art/${name}.webp`);
  for (const name of characterAssets) await copyFile(`${root}public/art/characters/${name}.webp`, `${output}/art/${name}.webp`);
  await cp(`${root}public/art/native-tv/fonts`, `${output}/art/fonts`, { recursive: true });
  await writeFile(`${output}/curriculum.json`, JSON.stringify({ version: 1, units: UNITS, lessons,
    phrasebook, conversations, worlds: worlds.map(({cards, ...w}) => ({...w, cardIds: cards.map(c => c.id)})), games: [{ id: 'picture', cards: worlds.flatMap(w => w.cards) }, { id: 'dialogue', cards: dialogue }, { id: 'cafe', cards: orders }] }));
  for (const file of files) await copyFile(`${root}public/audio/${file}`, `${output}/audio/${file}`);
}
console.log(`Native curriculum: ${lessons.length} lessons, ${cards.length} items, ${files.size} bundled clips${checkOnly ? ' (structure check)' : ''}.`);
