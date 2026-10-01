/** Unit 7 lessons (and the review / world sections that follow it), in book order, plus their tip cards. */
import type { AulaStep } from "../aulas.ts";
import type { Lesson } from "../schema.ts";

const pav = (pages: number[], concept: string) => ({ sourceId: "pav1-student" as const, unit: "u07", pages, concept });
const fn = (...slugs: string[]) => slugs.map((s) => `function.u07.${s}`);
const nouns = (...slugs: string[]) => slugs.map((s) => `vocab.noun.${s}`);
const adjs = (...slugs: string[]) => slugs.map((s) => `vocab.adjective.${s}`);
const frames = (...slugs: string[]) => slugs.map((s) => `grammar.frame.${s}`);
const errors = (...slugs: string[]) => slugs.map((s) => `grammar.error.${s}`);

export const U07_LESSONS: Lesson[] = [
  {
    id: "u07.parabens",
    unit: "u07",
    title: "Parabéns! Quantos anos fazes? — o aniversário",
    source: pav([172, 174], "birthday-expressions"),
    itemIds: [
      ...fn("parabens", "muitos_parabens", "quantos_anos_fazes", "faco_trinta", "quando_fazes_anos", "faco_anos_a", "hoje_faco_anos", "como_festejas", "janto_com_amigos", "da_lhe_um_beijinho"),
      ...nouns("aniversario", "festa", "bolo", "presente", "convidado"),
      ...frames("faz_anos_hoje", "quantos_anos_fazes", "faco_anos_a", "dar_os_parabens"),
      ...errors("hoje_tenho_anos"),
    ],
    canDo: ["cd18.festivals", "cd07.numbers-prices", "cd02.personal-info"],
  },
  {
    id: "u07.indefinidos",
    unit: "u07",
    title: "Todos, alguém, ninguém — indefinidos e tão / tanto",
    source: pav([173, 175, 187, 188], "indefinidos-tao-tanto"),
    itemIds: [
      ...fn("esta_tudo_pronto", "nao_esta_ninguem", "alguem_quer_bolo", "nao_quero_nada", "vem_toda_a_familia", "tao_contente", "ha_tanto_tempo", "tantas_pessoas"),
      ...frames("indef_ninguem", "indef_todas", "indef_alguns", "tao_contente", "tantas_pessoas"),
      ...errors("nenhum_dinheiro"),
    ],
    canDo: ["cd18.festivals", "cd23.speak-short"],
  },
  {
    id: "u07.votos",
    unit: "u07",
    title: "Boa sorte! As melhoras! — votos e mensagens",
    source: pav([174, 175], "wishes-messages"),
    itemIds: [
      ...fn("tem_um_dia_feliz", "diverte_te", "boas_festas", "boa_sorte", "boa_viagem", "as_melhoras", "muitas_felicidades", "bom_fim_de_semana", "desejo_te_um_dia", "querida_ana", "um_grande_abraco", "beijinhos", "temos_saudades"),
      ...nouns("mensagem", "casamento", "festa"),
      ...frames("indef_muitas"),
      ...errors("boa_sorte", "as_melhoras"),
    ],
    canDo: ["cd18.festivals", "cd03.greet-polite", "cd21.forms"],
  },
  {
    id: "u07.festas",
    unit: "u07",
    title: "No Natal e na Páscoa — as festas do ano",
    source: pav([176, 177], "celebrations"),
    itemIds: [
      ...nouns("natal", "pascoa", "carnaval", "ano_novo", "bolo_rei"),
      ...fn("feliz_natal", "feliz_ano_novo", "natal_25", "noite_de_24", "pascoa_ovos", "carnaval_mascaras", "doze_passas", "feriado_25_abril", "em_que_dia_pascoa"),
      ...frames("no_natal", "na_pascoa", "no_carnaval", "come_se"),
      ...errors("no_natal", "come_se_bacalhau"),
    ],
    canDo: ["cd18.festivals", "cd07.numbers-prices"],
  },
  {
    id: "u07.mesa",
    unit: "u07",
    title: "Põe a mesa! — a mesa e o imperativo",
    source: pav([178, 181, 182], "table-setting-imperativo"),
    itemIds: [
      ...nouns("garfo", "faca", "colher", "prato", "copo"),
      ...fn("poe_a_mesa", "levanta_a_mesa", "passa_me_o_sal", "traz_os_copos", "sirva_se", "prove_o_bolo_rei", "bom_apetite"),
      ...frames("poe_a_mesa", "traz_os_copos", "prove_formal", "vem_a_festa", "indef_outra"),
      ...errors("poe_a_mesa"),
    ],
    canDo: ["cd13.home", "cd09.order-food", "cd18.festivals"],
  },
  {
    id: "u07.convites",
    unit: "u07",
    title: "Queres vir à minha festa? — convites",
    source: { sourceId: "pav1-caderno", unit: "u07", pages: [77], concept: "invitations" },
    itemIds: [
      ...fn("queres_vir_festa", "estas_livre_sabado", "vamos_jantar_fora", "a_que_horas_festa", "claro_com_gosto", "boa_ideia", "obrigado_pelo_convite", "nao_posso_desculpa", "tenho_muita_pena", "nao_me_apetece", "tenho_de_trabalhar", "fica_para_a_proxima"),
      ...nouns("convite"),
      ...adjs("ocupado", "livre", "animado", "aborrecido"),
      ...frames("nao_posso_ir", "queres_vir_jantar", "nao_me_apetece"),
    ],
    canDo: ["cd17.invitations", "cd18.festivals"],
  },
  {
    id: "u07.santos_populares",
    unit: "u07",
    title: "Santos Populares — tradições de junho",
    source: pav([180, 183, 184], "santos-populares"),
    itemIds: [
      ...nouns("manjerico"),
      ...fn("santo_antonio_13", "sao_joao_porto", "comem_se_sardinhas", "marchas_desfilam", "dois_beijinhos"),
      ...frames("festeja_se", "antes_do_jantar", "depois_do_bolo", "enquanto", "quando_faco_anos"),
    ],
    canDo: ["cd18.festivals", "cd06.routines"],
  },
];

export const U07_AULAS: Record<string, AulaStep[]> = {
  "u07.parabens": [
    { kind: "title", big: "Parabéns!", small: "Fazer anos e dar os parabéns", say: "Parabéns! Quantos anos fazes?", ms: 3800 },
    {
      kind: "table",
      kicker: "FAZER ANOS",
      rows: [
        ["Quantos anos fazes?", "how old are you turning?"],
        ["Faço trinta anos.", "I'm turning thirty"],
        ["Quando fazes anos?", "when is your birthday?"],
        ["Faço anos a 12 de maio.", "my birthday is on 12 May"],
        ["Hoje faço anos!", "it's my birthday today!"],
      ],
      note: "Idade: TENHO 30 anos. Aniversário: FAÇO 30 anos.",
      say: "Quantos anos fazes? Faço trinta anos.",
      ms: 8000,
    },
    { kind: "rule", kicker: "DATAS", big: "a 12 de maio · no dia 12", note: "Os meses escrevem-se com letra pequena: maio, dezembro.", say: "Faço anos a doze de maio.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.faz_anos_hoje", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.faco_anos_a", ms: 7000 },
    { kind: "summary", rows: [["idade", "ter … anos"], ["aniversário", "fazer anos"], ["data", "a + dia + de + mês"]], ms: 5000 },
  ],
  "u07.indefinidos": [
    { kind: "title", big: "Todos, alguém, ninguém", small: "Indefinidos e tão / tanto", say: "Está tudo pronto!", ms: 3800 },
    {
      kind: "table",
      kicker: "INDEFINIDOS",
      rows: [
        ["pessoas", "alguém ↔ ninguém"],
        ["coisas", "tudo ↔ nada"],
        ["algum · alguma", "alguns · algumas"],
        ["nenhum · nenhuma", "(com não)"],
        ["todo · toda", "todos · todas"],
        ["muito · pouco · outro", "concordam com o nome"],
      ],
      note: "Na negativa: Não está ninguém. Não quero nada.",
      say: "Alguém, ninguém. Tudo, nada.",
      ms: 9000,
    },
    { kind: "table", kicker: "TÃO OU TANTO?", rows: [["tão + adjetivo", "Estou tão contente!"], ["tanto/a/os/as + nome", "Há tantas pessoas!"], ["verbo + tanto", "Ele fala tanto!"]], say: "Estou tão contente! Há tantas pessoas!", ms: 7500 },
    { kind: "check", itemId: "grammar.frame.indef_ninguem", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.tantas_pessoas", ms: 7000 },
    { kind: "summary", rows: [["pessoas", "alguém / ninguém"], ["coisas", "tudo / nada"], ["tão", "+ adjetivo"], ["tanto/a/os/as", "+ nome"]], ms: 5000 },
  ],
  "u07.votos": [
    { kind: "title", big: "Boa sorte!", small: "Votos para cada ocasião", say: "Boa sorte! Boa viagem!", ms: 3800 },
    {
      kind: "table",
      kicker: "PARA CADA OCASIÃO",
      rows: [
        ["🎂 aniversário", "Parabéns! Muitas felicidades!"],
        ["🎄 Natal / Ano Novo", "Boas festas!"],
        ["📝 exame", "Boa sorte!"],
        ["✈️ viagem", "Boa viagem!"],
        ["🤒 doença", "As melhoras!"],
        ["😎 sexta-feira", "Bom fim de semana!"],
      ],
      say: "Boa sorte. Boa viagem. As melhoras.",
      ms: 9000,
    },
    { kind: "table", kicker: "UMA MENSAGEM", rows: [["Querida Ana, / Caro Rui,", "abrir"], ["Desejo-te um dia muito feliz.", "desejar"], ["Um grande abraço! · Beijinhos!", "despedir-se"]], say: "Querida Ana, desejo-te um dia muito feliz. Beijinhos!", ms: 7500 },
    { kind: "check", itemId: "function.u07.as_melhoras", ms: 7000 },
    { kind: "check", itemId: "grammar.error.boa_sorte", ms: 7000 },
    { kind: "summary", rows: [["exame", "Boa sorte!"], ["viagem", "Boa viagem!"], ["doença", "As melhoras!"]], ms: 5000 },
  ],
  "u07.festas": [
    { kind: "title", big: "Feliz Natal!", small: "As festas do ano", say: "Feliz Natal!", ms: 3800 },
    {
      kind: "table",
      kicker: "EM + FESTA",
      rows: [
        ["o Natal", "no Natal"],
        ["a Páscoa", "na Páscoa"],
        ["o Carnaval", "no Carnaval"],
        ["o Ano Novo", "no Ano Novo"],
        ["a passagem de ano", "na passagem de ano"],
      ],
      say: "No Natal. Na Páscoa. No Carnaval.",
      ms: 7500,
    },
    { kind: "rule", kicker: "SE = AS PESSOAS EM GERAL", big: "No Natal, come-se bacalhau.", note: "se + verbo na 3.ª pessoa. Plural: comem-se doze passas.", say: "No Natal, come-se bacalhau.", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.na_pascoa", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.come_se", ms: 7000 },
    { kind: "summary", rows: [["Natal", "25 de dezembro"], ["no / na", "+ festa"], ["come-se / comem-se", "as pessoas em geral"]], ms: 5000 },
  ],
  "u07.mesa": [
    { kind: "title", big: "Põe a mesa!", small: "A mesa e o imperativo", say: "Põe a mesa, por favor!", ms: 3800 },
    {
      kind: "table",
      kicker: "TU OU VOCÊ?",
      rows: [
        ["pôr", "põe! · ponha!"],
        ["trazer", "traz! · traga!"],
        ["provar", "prova! · prove!"],
        ["vir", "vem! · venha!"],
        ["servir-se", "serve-te! · sirva-se!"],
      ],
      note: "tu = presente de ele (põe). você = vem do eu (ponho → ponha).",
      say: "Põe a mesa! Ponha a mesa!",
      ms: 8500,
    },
    { kind: "table", kicker: "NA MESA", rows: [["o garfo · a faca", "fork · knife"], ["a colher · o prato", "spoon · plate"], ["o copo", "glass"]], say: "O garfo, a faca, a colher, o prato, o copo.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.poe_a_mesa", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.prove_formal", ms: 7000 },
    { kind: "summary", rows: [["tu", "põe · traz · prova"], ["você", "ponha · traga · prove"]], ms: 5000 },
  ],
  "u07.convites": [
    { kind: "title", big: "Queres vir?", small: "Convidar, aceitar e recusar", say: "Queres vir à minha festa?", ms: 3800 },
    {
      kind: "table",
      kicker: "CONVITES",
      rows: [
        ["convidar", "Queres vir…? · Vamos…?"],
        ["aceitar", "Claro! Com todo o gosto. · Boa ideia!"],
        ["recusar", "Não posso, desculpa."],
        ["dar a razão", "Infelizmente, tenho de trabalhar."],
        ["sem vontade", "Hoje não me apetece."],
        ["outra vez", "Fica para a próxima!"],
      ],
      say: "Queres vir? Claro! Não posso, desculpa.",
      ms: 9000,
    },
    { kind: "rule", kicker: "EDUCADO", big: "Tenho muita pena, mas não vai dar.", note: "Recusar com simpatia: pedir desculpa + razão.", say: "Tenho muita pena, mas não vai dar.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.nao_posso_ir", ms: 7000 },
    { kind: "check", itemId: "function.u07.claro_com_gosto", ms: 7000 },
    { kind: "summary", rows: [["sim", "Claro! Com todo o gosto."], ["não", "Não posso, desculpa."], ["obrigado/a", "pelo convite"]], ms: 5000 },
  ],
  "u07.santos_populares": [
    { kind: "title", big: "Santos Populares", small: "As festas de junho", say: "O Santo António é a treze de junho.", ms: 3800 },
    {
      kind: "table",
      kicker: "FESTAS DE JUNHO",
      rows: [
        ["Santo António · 13 de junho", "Lisboa · manjericos e marchas"],
        ["São João · 24 de junho", "Porto · festa na rua toda a noite"],
        ["São Pedro · 29 de junho", "Sintra, Évora…"],
      ],
      note: "Nos Santos Populares, comem-se sardinhas e dança-se na rua.",
      say: "Santo António, São João, São Pedro.",
      ms: 8000,
    },
    { kind: "table", kicker: "QUANDO?", rows: [["antes do jantar", "before"], ["depois do bolo", "after"], ["quando faço anos", "when"], ["enquanto cozinho", "while"]], say: "Antes do jantar. Depois do bolo.", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.festeja_se", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.enquanto", ms: 7000 },
    { kind: "summary", rows: [["antes de / depois de", "+ o → do"], ["quando", "+ verbo"], ["enquanto", "ao mesmo tempo"]], ms: 5000 },
  ],
};
