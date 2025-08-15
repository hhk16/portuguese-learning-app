// PHYSICAL CLASSES: Three PPP lessons built from user's real class notes
import { Module } from './content';
import { EnhancedLessonContent } from './ppp-types';
import {
  grammarRule, culturalRule, warningRule,
  contrast, ptVsEn, pitfall, culturalNote, miniCheck,
  pronunciationGuide, sound, cheatSheet, cheatCategory, whyItMatters, example,
} from './ppp-helpers';

export const physicalClassesModule: Module = {
  id: 'physical',
  title: 'Physical Classes',
  description: 'Your real-life Portuguese class notes turned into dense PPP lessons with exercises.',
  lessons: [
    // Lesson 1 — Daily routine, reflexive verbs, frequency
    {
      id: 'physical1',
      title: 'Daily routine, reflexive verbs, frequency',
      xp: 70,
      content: {
        title: 'Reflexive verbs, frequency adverbs, and daily routine in EP',
        sections: [
          {
            title: 'Core grammar: Reflexive verbs and key aspects',
            explanation: 'Master EP reflexive verbs (-se), frequency adverbs placement, and high-frequency present tense forms.',
            examples: [
              example('levantar-se: eu levanto-me', 'to get up: I get up'),
              example('deitar-se: nós deitamo-nos cedo', 'to go to bed: we go to bed early'),
              example('vestir-se: estou a vestir-me agora', 'to get dressed: I am getting dressed now'),
              example('acordar vs levantar-se', 'wakeup vs get out of bed', 'Acordo às 7, levanto-me às 7:10'),
              example('Eu acordo sempre cedo', 'I always wake up early', 'sempre often after the verb'),
              example('Eu nunca bebo café à noite', "I never drink coffee at night", 'nunca before the verb'),
              example('Às vezes como fora', 'Sometimes I eat out', 'às vezes can be initial or medial'),
              example('Costumar + inf.: Costumo treinar à tarde', 'I usually train in the afternoon'),
              example('Estar a + inf.: Estou a trabalhar', 'I am working (right now)'),
              example('Ir + inf.: Vou estudar depois', 'I am going to study later')
            ],
            keyPoints: [
              'Reflexive pronoun attaches to verb in EP: levantar-se → levanto-me/levantas-te/…',
              "Frequency: 'sempre' after verb; 'nunca' before verb; 'às vezes' flexible",
              'Present forms with EP tu: comes, dormes, vais, vês, vens; vimos = we come (present) vs vimos = we saw (past of ver) by context'
            ],
            ruleBoxes: [
              grammarRule('Reflexive placement in EP', 'In simple present, reflexive pronoun is enclitic: verbo+pronome.', 'deito-me, vestes-te, levanta-se, levantamo-nos, deitam-se'),
              grammarRule('Frequency adverbs placement', "sempre after verb; nunca before verb; às vezes often initial/mid.", 'Acordo sempre cedo; Nunca bebo à noite; Às vezes como fora'),
              culturalRule('EP register: informal tu is common', 'In Portugal, tu is widely used with friends/peers. Keep EP forms (tu vês, tu vens, tu dormes).')
            ],
            culturalNotes: [
              culturalNote('☕', 'Café habits', 'Late-night coffee is less common for many; phrase it with nunca for clarity.'),
            ],
            miniChecks: [
              miniCheck('Pick the correct EP form (tu): ver → ?', ['tu vê', 'tu vês', 'tu ver'], 'tu vês', 'EP keeps diacritic and -s for tu: vês.')
            ],
          },
          {
            title: 'Time-of-day and contractions',
            explanation: 'Common time-of-day expressions and em + artigo contraction forms you will hear and use daily.',
            examples: [
              example('de manhã / à tarde / à noite / à hora de almoço', 'in the morning / in the afternoon / at night / at lunchtime'),
              example('em + um = num; em + uma = numa', 'in a (masc.) / in a (fem.)', 'num café, numa escola')
            ]
          }
        ],
        cheatSheet: cheatSheet('Answer Keys & Quick Reference — Lesson 1', [
          cheatCategory('L1 Key Conjugations', [
            'deitar-se (pres.): eu deito-me, tu deitas-te, ele/ela/você deita-se, nós deitamo-nos, vocês/eles deitam-se'
          ]),
          cheatCategory('L1 Frequência', [
            'Nunca before verb: Nunca bebo café à noite',
            'Sempre after verb: Vou sempre ao ginásio de manhã'
          ]),
          cheatCategory('L1 Translations', [
            'Costumo acordar às 7:15: Costumo acordar às sete e um quarto',
            'Estou a vestir-me agora',
            'Nós não nos deitamos cedo'
          ]),
        ]),
        whyItMatters: whyItMatters([
          'Talk fluently about your routine in EP',
          'Place adverbs naturally like natives',
          'Use progressive, habitual, and near-future accurately'
        ], 'These are the scaffolds of real-life conversations — routines, frequency, and ongoing actions.')
      } as EnhancedLessonContent,
      exercises: [
        // 1) Conjugate deitar-se present (5 prompts)
        { id: 'l1e1', type: 'typing', prompt: 'Conjugate: eu (deitar-se) — present', correct: 'eu deito-me' },
        { id: 'l1e2', type: 'typing', prompt: 'Conjugate: tu (deitar-se) — present', correct: 'tu deitas-te' },
        { id: 'l1e3', type: 'typing', prompt: 'Conjugate: ele (deitar-se) — present', correct: 'ele deita-se' },
        { id: 'l1e4', type: 'typing', prompt: 'Conjugate: nós (deitar-se) — present', correct: 'nós deitamo-nos' },
        { id: 'l1e5', type: 'typing', prompt: 'Conjugate: vocês (deitar-se) — present', correct: 'vocês deitam-se' },
        // 2) sempre/nunca placement (2 MCQs)
        { id: 'l1e6', type: 'mcq', prompt: 'Pick the correct sentence', options: ['Eu bebo nunca café à noite', 'Eu nunca bebo café à noite'], correct: 'Eu nunca bebo café à noite' },
        { id: 'l1e7', type: 'mcq', prompt: 'Pick the correct sentence', options: ['Eu vou sempre ao ginásio de manhã', 'Eu sempre vou ao ginásio de manhã (EP)'], correct: 'Eu vou sempre ao ginásio de manhã' },
        // 3) Translations (3 typing)
        { id: 'l1e8', type: 'typing', prompt: 'Translate: I usually wake up at 7:15 am.', correct: 'Costumo acordar às sete e um quarto da manhã.' },
        { id: 'l1e9', type: 'typing', prompt: "Translate: I’m getting dressed now.", correct: 'Estou a vestir-me agora.' },
        { id: 'l1e10', type: 'typing', prompt: "Translate: We don’t go to bed early.", correct: 'Nós não nos deitamos cedo.' },
        // 4) Fix the sentence
        { id: 'l1e11', type: 'typing', prompt: 'Fix: Tu dorme cedo.', correct: 'Tu dormes cedo.' },
      ]
    },

    // Lesson 2 — Café talk, tastes, shopping
    {
      id: 'physical2',
      title: 'Café talk, tastes, shopping',
      xp: 70,
      content: {
        title: 'Café preferences, gostar de, contractions, and daily habits',
        sections: [
          {
            title: 'Core grammar: gostar de, saber a, ir às compras',
            explanation: 'Learn EP patterns for likes, taste, and shopping; master contractions with articles.',
            examples: [
              example('Como é que gostas do teu café?', 'How do you like your coffee? (tu, EP)'),
              example('Gosto de café sem açúcar', 'I like coffee without sugar'),
              example('de + o = do; de + a = da; de + os = dos; de + as = das', 'contractions with de'),
              example('Isto sabe a morango', 'This tastes like strawberry'),
              example('Ir às compras / comprar', 'to go shopping / to buy'),
              example('Eu só vou a um café se precisar de trabalhar', 'I only go to a café if I need to work'),
              example('Onde é que costumas beber café?', 'Where do you usually have coffee?')
            ],
            ruleBoxes: [
              grammarRule('Contractions with de', 'de + article contracts obligatorily in EP, unless bare mass noun intended.', 'do leite; de açúcar (no article) / do açúcar (generic in general statements)')
            ],
            culturalNotes: [
              culturalNote('🥐', 'EP breakfast terms', 'o pequeno-almoço, o almoço, o lanche, o jantar. Compliments like “Que giro!/Que elegante!” sound natural in PT.'),
            ]
          }
        ],
        cheatSheet: cheatSheet('Answer Keys — Lesson 2', [
          cheatCategory('L2 Contractions', [
            'Gosto do leite; Não gosto de açúcar (or do açúcar if generic)'
          ]),
          cheatCategory('L2 Translations', [
            'Vamos às compras às cinco',
            'Este matcha sabe a erva',
            'Só bebo café se estiver a trabalhar'
          ])
        ]),
        whyItMatters: whyItMatters([
          'Order and discuss tastes like a local',
          'Use EP contractions naturally',
          'Discuss habits around cafés and work'
        ], 'Café culture is central — sounding natural here boosts confidence and social connection.')
      } as EnhancedLessonContent,
      exercises: [
        // 1) Contractions
        { id: 'l2e1', type: 'typing', prompt: 'Complete: Gosto __ leite.', correct: 'Gosto do leite.' },
        { id: 'l2e2', type: 'typing', prompt: 'Complete: Não gosto __ açúcar.', correct: 'Não gosto de açúcar.' },
        // 2) Question build
        { id: 'l2e3', type: 'typing', prompt: 'Make the question (tu, EP): How do you like your coffee?', correct: 'Como é que gostas do teu café?' },
        // 3) Translations
        { id: 'l2e4', type: 'typing', prompt: 'Translate: We’re going shopping at 5.', correct: 'Vamos às compras às cinco.' },
        { id: 'l2e5', type: 'typing', prompt: 'Translate: This matcha tastes like grass.', correct: 'Este matcha sabe a erva.' },
        { id: 'l2e6', type: 'typing', prompt: 'Translate: I only drink coffee if I’m working.', correct: 'Só bebo café se estiver a trabalhar.' },
      ]
    },

    // Lesson 3 — Time, prepositions with articles, past habits & experiences
    {
      id: 'physical3',
      title: 'Time, a+articles, past habits & experiences',
      xp: 75,
      content: {
        title: 'Telling time in EP, a+articles, and past habits/experiences',
        sections: [
          {
            title: 'Telling time in EP',
            explanation: 'Use São for most hours and É for 1 o’clock; learn natural EP ways to say minutes.',
            examples: [
              example('São oito (em ponto).', 'It\'s eight o\'clock (sharp).'),
              example('É uma e meia.', 'It\'s 1:30.'),
              example('São sete e um quarto.', 'It\'s 7:15.'),
              example('São vinte para as oito.', 'It\'s twenty to eight.'),
              example('É um quarto para as oito.', 'It\'s a quarter to eight.'),
              example('19:47 → São dezanove e quarenta e sete', '24-hour style read-out')
            ]
          },
          {
            title: 'Preposition a + articles',
            explanation: 'Very common with time ranges and routine expressions.',
            examples: [
              example('a + o = ao (ao meio-dia)', 'at noon'),
              example('a + a = à (à noite / à tarde / à meia-noite)', 'at night/afternoon/midnight'),
              example('a + os = aos; a + as = às (às 8, às vezes)', 'at 8, sometimes'),
              example('entre as X e as Y', 'between X and Y')
            ]
          },
          {
            title: 'Past habits and experiences',
            explanation: 'Use costumava for used to; já for ever/already; ainda não for not yet; há for ago; desde for since.',
            examples: [
              example('Eu costumava deitar-me tarde', 'I used to go to bed late'),
              example('Eu já fiz paraquedismo', 'I\'ve already done skydiving / I have ever done'),
              example('Ainda não', 'Not yet'),
              example('Há dois anos', 'Two years ago'),
              example('Desde 2023', 'Since 2023'),
              example('Mudei-me para Lisboa', 'I moved to Lisbon'),
              example('Viver/Morar no Alasca (masc.)', 'to live in Alaska — no Alasca')
            ],
            ruleBoxes: [
              warningRule('Há vs Desde', 'Use há + duration for ago; desde + point-in-time for since. Ex.: Há dois anos mudei-me; Vivo aqui desde 2023')
            ]
          }
        ],
        cheatSheet: cheatSheet('Answer Keys — Lesson 3', [
          cheatCategory('L3 Time answers', [
            '08:00 → São oito em ponto',
            '13:30 → É uma e meia',
            '19:15 → São sete e um quarto da noite',
            '19:45 → É um quarto para as oito'
          ]),
          cheatCategory('L3 Prepositions', [
            'ao meio-dia; à noite; às 9'
          ]),
          cheatCategory('L3 Translations', [
            'Ainda não fiz paraquedismo',
            'Nós costumávamos viver/morar no Alasca',
            'Entre as duas e as cinco estou a trabalhar'
          ])
        ]),
        whyItMatters: whyItMatters([
          'Tell the time naturally in EP',
          'Use a+articles like natives',
          'Narrate experiences and past habits with confidence'
        ], 'Time talk and past habits come up constantly in classes and life — master them for fluency.')
      } as EnhancedLessonContent,
      exercises: [
        // 1) Say the time (4)
        { id: 'l3e1', type: 'typing', prompt: '08:00 sharp → ?', correct: 'São oito em ponto.' },
        { id: 'l3e2', type: 'typing', prompt: '13:30 → ?', correct: 'É uma e meia.' },
        { id: 'l3e3', type: 'typing', prompt: '19:15 → ?', correct: 'São sete e um quarto da noite.' },
        { id: 'l3e4', type: 'typing', prompt: '19:45 → ?', correct: 'É um quarto para as oito.' },
        // 2) Fill ao/à/aos/às
        { id: 'l3e5', type: 'typing', prompt: 'Chego __ meio-dia.', correct: 'Chego ao meio-dia.' },
        { id: 'l3e6', type: 'typing', prompt: 'Trabalho __ noite.', correct: 'Trabalho à noite.' },
        { id: 'l3e7', type: 'typing', prompt: 'As aulas são __ 9.', correct: 'As aulas são às 9.' },
        // 3) Há vs Desde
        { id: 'l3e8', type: 'mcq', prompt: '(__ / __) dois anos mudei-me para Lisboa.', options: ['Há', 'Desde'], correct: 'Há' },
        // 4) Translations (3)
        { id: 'l3e9', type: 'typing', prompt: "I haven’t tried skydiving yet.", correct: 'Ainda não fiz paraquedismo.' },
        { id: 'l3e10', type: 'typing', prompt: 'We used to live in Alaska.', correct: 'Nós costumávamos viver no Alasca.' },
        { id: 'l3e11', type: 'typing', prompt: 'Between 2 and 5 I’m working.', correct: 'Entre as duas e as cinco estou a trabalhar.' },
      ]
    }
  ]
};

export default physicalClassesModule; 