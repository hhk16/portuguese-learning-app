/**
 * Unit 7 — "Quantos anos fazes?" (Livro do Aluno pp. 171–188; Caderno Unidade 7 pp. 77–89).
 * Birthdays and wishes, festivities (Natal, Páscoa, Carnaval, Santos Populares), setting the table,
 * invitations (accepting / refusing), indefinidos, tão / tanto, forma impessoal "se", em + festividade,
 * imperativo (revisão) and the time markers antes de / depois de / quando / enquanto.
 * Original wording; word lists and paradigms are facts of the language, organised as in the book.
 */
import type { KnowledgeItem, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u07", pages, concept });
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u07", pages, concept });

type Fn = "greeting" | "farewell" | "courtesy" | "question" | "answer" | "statement" | "order" | "opinion" | "plan" | "time";

/* ------------------------------------ Phrases ------------------------------------ */

type Ph = [slug: string, pt: string, en: string, fn: Fn, situation: string, source: Source];
const PHRASES: Ph[] = [
  // Aniversários (pp. 172, 174)
  ["parabens", "Parabéns!", "Happy birthday! / Congratulations!", "courtesy", "🎂", src("birthday-expressions", [172])],
  ["muitos_parabens", "Muitos parabéns!", "Many happy returns!", "courtesy", "🥳", src("birthday-expressions", [172, 174])],
  ["quantos_anos_fazes", "Quantos anos fazes?", "How old are you turning?", "question", "🎂", src("birthday-expressions", [172])],
  ["faco_trinta", "Faço trinta anos.", "I'm turning thirty.", "answer", "🎈", src("birthday-expressions", [172])],
  ["quando_fazes_anos", "Quando fazes anos?", "When is your birthday?", "question", "📅", src("birthday-dates", [172])],
  ["faco_anos_a", "Faço anos a 12 de maio.", "My birthday is on 12 May.", "answer", "📅", src("birthday-dates", [172])],
  ["hoje_faco_anos", "Hoje faço anos!", "It's my birthday today!", "statement", "🥳", src("birthday-expressions", [172])],
  ["como_festejas", "Como festejas o teu aniversário?", "How do you celebrate your birthday?", "question", "🎉", src("birthday-celebrations", [174])],
  ["janto_com_amigos", "Janto sempre com os amigos.", "I always have dinner with my friends.", "answer", "🍽️", src("birthday-celebrations", [174])],
  ["tem_um_dia_feliz", "Tem um dia feliz!", "Have a happy day!", "courtesy", "😊", src("birthday-wishes", [172])],
  ["diverte_te", "Diverte-te!", "Have fun!", "courtesy", "🎉", src("birthday-wishes", [172])],
  ["da_lhe_um_beijinho", "Dá-lhe um beijinho meu.", "Give her a kiss from me.", "courtesy", "💓", src("birthday-wishes", [172])],
  // Indefinidos e tão / tanto (pp. 173, 175, 187–188)
  ["esta_tudo_pronto", "Está tudo pronto!", "Everything's ready!", "statement", "✅", src("indefinidos-invariaveis", [173, 187])],
  ["nao_esta_ninguem", "Não está ninguém em casa.", "There's nobody home.", "statement", "🏠", src("indefinidos-invariaveis", [173, 187])],
  ["alguem_quer_bolo", "Alguém quer mais bolo?", "Does anyone want more cake?", "question", "🎂", src("indefinidos-invariaveis", [173, 187])],
  ["nao_quero_nada", "Não quero nada, obrigada.", "I don't want anything, thanks.", "answer", "🙏", src("indefinidos-invariaveis", [173, 187])],
  ["vem_toda_a_familia", "Vem toda a família.", "The whole family is coming.", "statement", "👥", src("indefinidos-variaveis", [173, 187])],
  ["tao_contente", "Estou tão contente!", "I'm so happy!", "statement", "😀", src("tao-tanto", [172, 175, 188])],
  ["ha_tanto_tempo", "Há tanto tempo!", "It's been so long!", "statement", "⏰", src("tao-tanto", [172, 175, 188])],
  ["tantas_pessoas", "Há tantas pessoas aqui!", "There are so many people here!", "statement", "👥", src("tao-tanto", [175, 188])],
  // Votos e mensagens (pp. 174–175)
  ["feliz_natal", "Feliz Natal!", "Merry Christmas!", "courtesy", "🎄", src("wishes-occasions", [174, 175])],
  ["feliz_ano_novo", "Feliz Ano Novo!", "Happy New Year!", "courtesy", "🎆", src("wishes-occasions", [174, 175])],
  ["boas_festas", "Boas festas!", "Happy holidays!", "courtesy", "🎁", src("wishes-occasions", [174, 175])],
  ["boa_sorte", "Boa sorte!", "Good luck!", "courtesy", "🍀", src("wishes-occasions", [175])],
  ["boa_viagem", "Boa viagem!", "Have a good trip!", "courtesy", "✈️", src("wishes-occasions", [175])],
  ["as_melhoras", "As melhoras!", "Get well soon!", "courtesy", "🤒", src("wishes-occasions", [175])],
  ["muitas_felicidades", "Muitas felicidades!", "Every happiness!", "courtesy", "💐", src("wishes-occasions", [175])],
  ["bom_fim_de_semana", "Bom fim de semana!", "Have a good weekend!", "courtesy", "😎", src("wishes-occasions", [175])],
  ["desejo_te_um_dia", "Desejo-te um dia muito feliz.", "I wish you a very happy day.", "courtesy", "💬", src("message-wishes", [174])],
  ["querida_ana", "Querida Ana,", "Dear Ana, (to a friend)", "greeting", "💬", src("message-openings", [174])],
  ["um_grande_abraco", "Um grande abraço!", "A big hug! (sign-off)", "farewell", "👫", src("message-signoffs", [174])],
  ["beijinhos", "Beijinhos!", "Kisses! (sign-off)", "farewell", "💓", src("message-signoffs", [174])],
  ["temos_saudades", "Temos muitas saudades tuas.", "We miss you a lot.", "statement", "🥺", src("message-signoffs", [174])],
  // Festas do ano (pp. 176–177; Caderno pp. 78–79, 86)
  ["natal_25", "O Natal é a 25 de dezembro.", "Christmas is on 25 December.", "time", "🎄", src("festivities-dates", [176])],
  ["noite_de_24", "Na noite de 24, come-se bacalhau.", "On the night of the 24th, people eat salt cod.", "statement", "🐟", src("christmas-traditions", [176, 177])],
  ["pascoa_ovos", "Na Páscoa, oferecem-se ovos de chocolate.", "At Easter, people give chocolate eggs.", "statement", "🍫", src("easter-traditions", [176])],
  ["carnaval_mascaras", "No Carnaval, as crianças usam máscaras.", "At Carnival, children wear masks.", "statement", "🎭", src("carnival", [176])],
  ["doze_passas", "Na passagem de ano, comem-se doze passas.", "On New Year's Eve, people eat twelve raisins.", "statement", "🍇", src("new-year", [176])],
  ["feriado_25_abril", "O 25 de Abril é feriado.", "25 April is a public holiday.", "time", "📅", cad("portuguese-holidays", [78])],
  ["em_que_dia_pascoa", "Em que dia é a Páscoa este ano?", "What date is Easter this year?", "question", "📅", cad("portuguese-holidays", [78])],
  // A mesa (p. 178) e imperativo (revisão, pp. 181–182)
  ["poe_a_mesa", "Põe a mesa, por favor.", "Set the table, please.", "order", "🍽️", src("table-setting", [178])],
  ["levanta_a_mesa", "Levanta a mesa, se faz favor.", "Clear the table, please.", "order", "🍽️", src("table-setting", [178])],
  ["passa_me_o_sal", "Passa-me o sal, por favor.", "Pass me the salt, please.", "order", "🧂", src("imperativo-tu", [181])],
  ["traz_os_copos", "Traz os copos para a sala.", "Bring the glasses to the living room.", "order", "🥤", src("imperativo-tu", [181])],
  ["sirva_se", "Sirva-se, por favor.", "Please help yourself. (formal)", "courtesy", "🍲", src("imperativo-voce", [181, 182])],
  ["prove_o_bolo_rei", "Prove o bolo-rei!", "Try the king cake! (formal)", "order", "👑", src("imperativo-voce", [181, 182])],
  ["bom_apetite", "Bom apetite!", "Enjoy your meal!", "courtesy", "😋", src("table-setting", [178])],
  // Convites (p. 179; Caderno p. 77)
  ["queres_vir_festa", "Queres vir à minha festa?", "Do you want to come to my party?", "question", "🎉", cad("invitations", [77])],
  ["estas_livre_sabado", "Estás livre no sábado?", "Are you free on Saturday?", "question", "📅", cad("invitations", [77])],
  ["vamos_jantar_fora", "Vamos jantar fora na sexta?", "Shall we eat out on Friday?", "plan", "🍽️", cad("invitations", [77])],
  ["a_que_horas_festa", "A que horas é a festa?", "What time is the party?", "question", "⏰", cad("invitations", [77])],
  ["claro_com_gosto", "Claro! Com todo o gosto.", "Of course! With pleasure.", "answer", "👍", cad("invitations-accept", [77])],
  ["boa_ideia", "Boa ideia!", "Good idea!", "answer", "💡", cad("invitations-accept", [77])],
  ["obrigado_pelo_convite", "Obrigado pelo convite!", "Thanks for the invitation!", "courtesy", "🙏", cad("invitations-accept", [77])],
  ["nao_posso_desculpa", "Não posso, desculpa.", "I can't, sorry.", "answer", "😬", cad("invitations-refuse", [77])],
  ["tenho_muita_pena", "Tenho muita pena, mas não vai dar.", "I'm really sorry, but it won't work out.", "answer", "😢", src("invitations-refuse", [179])],
  ["nao_me_apetece", "Hoje não me apetece sair.", "I don't feel like going out today.", "answer", "😴", cad("invitations-refuse", [77])],
  ["tenho_de_trabalhar", "Infelizmente, tenho de trabalhar.", "Unfortunately, I have to work.", "answer", "🏢", src("invitations-refuse", [179])],
  ["fica_para_a_proxima", "Fica para a próxima!", "Maybe next time!", "answer", "🔁", src("invitations-refuse", [179])],
  // Santos Populares e hábitos culturais (pp. 180–184)
  ["santo_antonio_13", "O Santo António é a 13 de junho.", "St Anthony's Day is on 13 June.", "time", "🌿", src("santos-populares", [183, 184])],
  ["sao_joao_porto", "No São João, há festa nas ruas do Porto.", "On St John's night, there's a street party in Porto.", "statement", "🎉", src("santos-populares", [183, 184])],
  ["comem_se_sardinhas", "Nos Santos Populares, comem-se sardinhas.", "During the June festivals, people eat sardines.", "statement", "🐟", src("santos-populares", [183, 184])],
  ["marchas_desfilam", "As marchas desfilam na avenida.", "The neighbourhood parades march down the avenue.", "statement", "🥁", src("santos-populares", [183, 184])],
  ["dois_beijinhos", "Cumprimentamo-nos com dois beijinhos.", "We greet each other with two kisses.", "statement", "👋", src("cultural-habits", [180])],
];

const phrases: KnowledgeItem[] = PHRASES.map(([slug, pt, en, fn, situation, source]) => ({
  id: `function.u07.${slug}`,
  kind: "phrase",
  pt,
  en,
  fn,
  situation,
  source,
}));

/* ------------------------------------- Nouns ------------------------------------- */

type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: "comida" | "casa" | "objeto" | "natureza" | "pessoa" | "tempo" | "lazer", source: Source];
const NOUNS: N[] = [
  ["aniversario", "o", "aniversário", "birthday", "🥳", "lazer", src("birthday-expressions", [172])],
  ["festa", "a", "festa", "party", "🎉", "lazer", src("birthday-expressions", [172])],
  ["convite", "o", "convite", "invitation", "💌", "objeto", cad("invitations", [77, 79])],
  ["mensagem", "a", "mensagem", "message", "💬", "objeto", src("birthday-messages", [172, 174])],
  ["convidado", "o", "convidado", "guest", "👥", "pessoa", cad("carnival-party", [79])],
  ["casamento", "o", "casamento", "wedding", "💐", "lazer", cad("festivities", [78])],
  ["natal", "o", "Natal", "Christmas", "🎄", "tempo", src("celebrations", [176])],
  ["pascoa", "a", "Páscoa", "Easter", "🐣", "tempo", src("celebrations", [176])],
  ["ano_novo", "o", "Ano Novo", "New Year", "🎆", "tempo", cad("festivities", [78])],
  ["bolo_rei", "o", "bolo-rei", "king cake (Christmas cake)", "👑", "comida", src("christmas-food", [177])],
  ["manjerico", "o", "manjerico", "pot of basil (St Anthony)", "🌿", "natureza", src("santos-populares", [183, 184])],
  ["garfo", "o", "garfo", "fork", "🍴", "casa", src("table-setting", [178])],
  ["prato", "o", "prato", "plate", "🍽️", "casa", src("table-setting", [178])],
  ["copo", "o", "copo", "glass", "🥤", "casa", src("table-setting", [178])],
];

const nouns: KnowledgeItem[] = NOUNS.map(([slug, article, pt, en, emoji, category, source]) => ({
  id: `vocab.noun.${slug}`,
  kind: "noun",
  pt,
  article,
  en,
  emoji,
  category,
  source,
  why: `${article} ${pt} — ${article === "o" ? "masculino" : "feminino"}`,
}));

/* ---------------------------------- Adjectives ---------------------------------- */

type A = [slug: string, m: string, f: string, en: string, emoji: string, opposite: string, source: Source];
const ADJ: A[] = [
  ["animado", "animado", "animada", "lively / in high spirits", "😊", "aborrecido", cad("antonyms", [79])],
  ["aborrecido", "aborrecido", "aborrecida", "boring / bored", "😴", "animado", cad("antonyms", [79])],
  ["ocupado", "ocupado", "ocupada", "busy", "📅", "livre", cad("invitations", [77])],
  ["livre", "livre", "livre", "free (not busy)", "😎", "ocupado", cad("invitations", [77])],
];

/**
 * Every opposite pair becomes a Na Mesma Onda spectrum, which needs its "thing" clues in
 * src/games/wave/things.ts (keyed "aborrecido|animado", "livre|ocupado"). Until those exist the
 * pairs are only named in `why`; flip this on once the clues are added.
 */
const WIRE_OPPOSITES = true;

const adjectives: KnowledgeItem[] = ADJ.map(([slug, m, f, en, emoji, opposite, source]) => ({
  id: `vocab.adjective.${slug}`,
  kind: "adjective",
  m,
  f,
  en,
  emoji,
  opposite: WIRE_OPPOSITES ? `vocab.adjective.${opposite}` : undefined,
  source,
  why: `${m === f ? `${m}: igual no masculino e no feminino.` : `${m} (m.) · ${f} (f.)`} ≠ ${opposite}`,
}));

/* ------------------------------------- Frames ------------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], en: string, why: string, source: Source, targets?: string[]];
const FRAMES: Fr[] = [
  // fazer anos
  ["faz_anos_hoje", "Hoje a Ana ___ trinta anos.", "faz", ["fazem", "é", "fazes"], "Ana turns thirty today.", "Aniversário: fazer anos — ela faz 30 anos.", src("fazer-anos", [172])],
  ["quantos_anos_fazes", "Quantos anos ___ hoje, Rui?", "fazes", ["fazemos", "fazem", "faço"], "How old are you turning today, Rui?", "tu → fazes. Quantos anos fazes?", src("fazer-anos", [172]), ["function.u07.quantos_anos_fazes"]],
  ["faco_anos_a", "Faço anos ___ 3 de março.", "a", ["em", "no", "de"], "My birthday is on 3 March.", "Datas: a + dia (a 3 de março) ou no dia 3.", src("birthday-dates", [172]), ["function.u07.faco_anos_a"]],
  ["dar_os_parabens", "Vou telefonar à Rita para lhe dar os ___.", "parabéns", ["melhoras", "sorte", "abraço"], "I'm going to call Rita to wish her happy birthday.", "dar os parabéns = to wish happy birthday / congratulate", src("birthday-expressions", [172])],
  // indefinidos
  ["indef_ninguem", "Não conheço ___ nesta festa.", "ninguém", ["alguém", "nada", "tudo"], "I don't know anyone at this party.", "Pessoas: alguém / ninguém. Com não → ninguém.", src("indefinidos-invariaveis", [173, 187])],
  ["indef_nenhum", "Este ano, já não tenho ___ dia de férias.", "nenhum", ["nenhuma", "nada", "ninguém"], "This year, I don't have a single day of holiday left.", "o dia → nenhum (masculino singular).", src("indefinidos-variaveis", [173, 187])],
  ["indef_todas", "___ as pessoas gostam de bolo.", "Todas", ["Todos", "Toda", "Tudo"], "Everyone likes cake.", "as pessoas → todas (feminino plural).", src("indefinidos-variaveis", [173, 187])],
  ["indef_alguns", "Vêm ___ amigos meus ao jantar.", "alguns", ["algumas", "alguém", "algum"], "Some friends of mine are coming to dinner.", "os amigos → alguns (masculino plural).", src("indefinidos-variaveis", [173, 187])],
  ["indef_outra", "Queres ___ fatia de bolo?", "outra", ["outro", "outros", "outras"], "Do you want another slice of cake?", "a fatia → outra (feminino singular).", cad("indefinidos", [84, 85])],
  ["indef_muitas", "Recebo ___ mensagens no meu aniversário.", "muitas", ["muitos", "muita", "muito"], "I get lots of messages on my birthday.", "as mensagens → muitas (feminino plural).", cad("indefinidos", [84, 85])],
  // tão / tanto
  ["tao_contente", "Estou ___ contente por te ver!", "tão", ["tanto", "tanta", "tantos"], "I'm so happy to see you!", "tão + adjetivo (invariável).", src("tao-tanto", [175, 188]), ["function.u07.tao_contente"]],
  ["tanto_tempo", "Já não te vejo há ___ tempo!", "tanto", ["tão", "tanta", "tantos"], "I haven't seen you for so long!", "o tempo → tanto (masculino singular).", src("tao-tanto", [175, 188])],
  ["tantas_pessoas", "Há ___ pessoas na festa!", "tantas", ["tantos", "tão", "tanta"], "There are so many people at the party!", "as pessoas → tantas.", src("tao-tanto", [175, 188])],
  // em + festividade, se impessoal
  ["no_natal", "___ Natal, a família janta junta.", "No", ["Na", "Em", "Ao"], "At Christmas, the family has dinner together.", "o Natal → no Natal.", cad("em-festivities", [86])],
  ["na_pascoa", "___ Páscoa, oferecemos ovos de chocolate.", "Na", ["No", "Em", "À"], "At Easter, we give chocolate eggs.", "a Páscoa → na Páscoa.", cad("em-festivities", [86])],
  ["no_carnaval", "___ Carnaval, as crianças usam máscaras.", "No", ["Na", "Nos", "À"], "At Carnival, children wear masks.", "o Carnaval → no Carnaval.", cad("em-festivities", [86])],
  ["come_se", "Em Portugal, no Natal, ___ bacalhau.", "come-se", ["comem-se", "como-me", "comes"], "In Portugal, people eat salt cod at Christmas.", "Forma impessoal: se + verbo na 3.ª pessoa (o bacalhau → singular).", src("se-impessoal", [177, 188])],
  ["festeja_se", "Em junho, ___ o Santo António em Lisboa.", "festeja-se", ["festejam-se", "festejo-me", "festejas"], "In June, St Anthony is celebrated in Lisbon.", "se impessoal: festeja-se o Santo António.", src("se-impessoal", [183, 188])],
  // imperativo (revisão)
  ["poe_a_mesa", "Rui, ___ a mesa, por favor!", "põe", ["pões", "pôr", "ponho"], "Rui, set the table, please!", "Imperativo (tu) = presente de ele: põe!", src("imperativo-tu", [178, 181]), ["function.u07.poe_a_mesa"]],
  ["traz_os_copos", "Ana, ___ os copos, se faz favor!", "traz", ["trazes", "trago", "trazer"], "Ana, bring the glasses, please!", "trazer → (tu) traz!", src("imperativo-tu", [181])],
  ["prove_formal", "Dona Rosa, ___ o bolo-rei!", "prove", ["provas", "provo", "provar"], "Mrs Rosa, try the king cake!", "Formal (você): provar → prove!", src("imperativo-voce", [181, 182]), ["function.u07.prove_o_bolo_rei"]],
  ["vem_a_festa", "Ana, ___ à minha festa! Vai ser divertido.", "vem", ["venho", "vir", "vêm"], "Ana, come to my party! It'll be fun.", "vir → (tu) vem!", src("imperativo-tu", [181])],
  // convites
  ["nao_posso_ir", "Desculpa, não ___ ir. Tenho de trabalhar.", "posso", ["podes", "pode", "podem"], "Sorry, I can't go. I have to work.", "eu → posso (poder).", cad("invitations-refuse", [77]), ["function.u07.nao_posso_desculpa"]],
  ["queres_vir_jantar", "Rita, ___ vir jantar connosco?", "queres", ["quero", "queremos", "querer"], "Rita, do you want to come to dinner with us?", "Convite a um amigo: queres…?", cad("invitations", [77])],
  ["nao_me_apetece", "Hoje não me ___ sair.", "apetece", ["apeteço", "apetecem", "apetecer"], "I don't feel like going out today.", "apetecer: não me apetece (sair).", cad("invitations-refuse", [77]), ["function.u07.nao_me_apetece"]],
  // marcadores temporais
  ["antes_do_jantar", "Ponho a mesa ___ jantar.", "antes do", ["antes de", "antes da", "enquanto"], "I set the table before dinner.", "antes de + o jantar = antes do jantar.", cad("time-markers", [87])],
  ["depois_do_bolo", "___ bolo, abrimos os presentes.", "Depois do", ["Depois de", "Depois da", "Antes da"], "After the cake, we open the presents.", "depois de + o bolo = depois do bolo.", cad("time-markers", [87])],
  ["enquanto", "Ouço música ___ cozinho.", "enquanto", ["depois de", "antes de", "durante"], "I listen to music while I cook.", "enquanto = ao mesmo tempo.", cad("time-markers", [87])],
  ["quando_faco_anos", "___ faço anos, janto com a família.", "Quando", ["Antes de", "Depois de", "Durante"], "When it's my birthday, I have dinner with my family.", "quando + verbo conjugado.", cad("time-markers", [87])],
];

const frames: KnowledgeItem[] = FRAMES.map(([slug, text, answer, distractors, en, why, source, targets]) => ({
  id: `grammar.frame.${slug}`,
  kind: "frame",
  text,
  answer,
  distractors,
  en,
  why,
  targets,
  source,
}));

/* ------------------------------------- Errors ------------------------------------- */

type Err = [slug: string, tokens: string[], wrongIndex: number, fix: string, why: string, en: string, source: Source];
const ERRORS: Err[] = [
  ["hoje_tenho_anos", ["Hoje", "eu", "tenho", "anos!"], 2, "faço", "Aniversário: fazer anos — hoje faço anos!", "It's my birthday today!", src("fazer-anos", [172])],
  ["nenhum_dinheiro", ["Não", "tenho", "nenhuma", "dinheiro."], 2, "nenhum", "o dinheiro → nenhum (masculino).", "I don't have any money.", cad("indefinidos", [84, 85])],
  ["boa_sorte", ["Bom", "sorte", "no", "exame!"], 0, "Boa", "a sorte → boa sorte.", "Good luck in the exam!", src("wishes-occasions", [175])],
  ["as_melhoras", ["Os", "melhoras,", "Rui!"], 0, "As", "as melhoras (feminino plural).", "Get well soon, Rui!", src("wishes-occasions", [175])],
  ["no_natal", ["Na", "Natal,", "vou", "a", "Coimbra."], 0, "No", "o Natal → no Natal.", "At Christmas, I'm going to Coimbra.", cad("em-festivities", [86])],
  ["come_se_bacalhau", ["No", "Natal,", "comem-se", "bacalhau."], 2, "come-se", "o bacalhau é singular → come-se.", "At Christmas, people eat salt cod.", src("se-impessoal", [177, 188])],
  ["poe_a_mesa", ["Pões", "a", "mesa,", "por", "favor!"], 0, "Põe", "Imperativo (tu) = forma de ele: põe!", "Set the table, please!", src("imperativo-tu", [178, 181])],
];

const errors: KnowledgeItem[] = ERRORS.map(([slug, tokens, wrongIndex, fix, why, en, source]) => ({
  id: `grammar.error.${slug}`,
  kind: "error",
  tokens,
  wrongIndex,
  fix,
  why,
  en,
  source,
}));

export const U07_ITEMS: KnowledgeItem[] = [...phrases, ...nouns, ...adjectives, ...frames, ...errors];
