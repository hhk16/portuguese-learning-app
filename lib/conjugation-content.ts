import { Module } from './content';

export const conjugationModules: Module[] = [
  {
    id: "conjugation1enhanced",
    title: "🔤 Portuguese Present Tense Basics (Enhanced PPP)",
    description: "Master Portuguese present tense conjugation for regular -ar, -er, -ir verbs with comprehensive practice and cultural context.",
    lessons: [
      {
        id: "conj1el1",
        title: "Regular -AR Verbs Present Tense",
        xp: 45,
        content: {
          title: "Portuguese -AR Verb Conjugation Mastery",
          sections: [
            {
              title: "Understanding -AR Verb Patterns",
              explanation: "Master the most common Portuguese verb pattern - regular -AR verbs in present tense:",
              examples: [
                { pt: "falar", en: "to speak", note: "eu falo, tu falas, ele/ela fala, nós falamos, vós falais, eles/elas falam" },
                { pt: "estudar", en: "to study", note: "eu estudo, tu estudas, ele/ela estuda, nós estudamos, vós estudais, eles/elas estudam" },
                { pt: "trabalhar", en: "to work", note: "eu trabalho, tu trabalhas, ele/ela trabalha, nós trabalhamos, vós trabalhais, eles/elas trabalham" },
                { pt: "morar", en: "to live", note: "eu moro, tu moras, ele/ela mora, nós moramos, vós morais, eles/elas moram" },
                { pt: "comprar", en: "to buy", note: "eu compro, tu compras, ele/ela compra, nós compramos, vós comprais, eles/elas compram" }
              ],
              keyPoints: [
                "Remove -ar and add: -o, -as, -a, -amos, -ais, -am",
                "-AR verbs are the most common in Portuguese",
                "Stress usually falls on the second-to-last syllable",
                "Present tense expresses current actions and habits"
              ]
            },
            {
              title: "Common -AR Verbs in Daily Life",
              explanation: "Essential -AR verbs for everyday Portuguese communication:",
              examples: [
                { pt: "andar", en: "to walk", note: "Eu ando no parque todos os dias" },
                { pt: "cantar", en: "to sing", note: "Ela canta muito bem" },
                { pt: "dançar", en: "to dance", note: "Nós dançamos fado" },
                { pt: "escutar", en: "to listen", note: "Tu escutas música portuguesa?" },
                { pt: "gostar", en: "to like", note: "Eles gostam de viajar" },
                { pt: "jantar", en: "to have dinner", note: "Vocês jantam tarde" },
                { pt: "nadar", en: "to swim", note: "Eu nado no verão" },
                { pt: "viajar", en: "to travel", note: "Nós viajamos muito" }
              ],
              keyPoints: [
                "These verbs form the foundation of Portuguese conversation",
                "Practice with different subjects to master patterns",
                "Many daily activities use -AR verbs",
                "Context helps determine meaning and usage"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: -AR verb patterns
          { id: "e1", type: "flashcard", term: "eu falo", translation: "I speak" },
          { id: "e2", type: "flashcard", term: "tu falas", translation: "you speak (informal)" },
          { id: "e3", type: "flashcard", term: "ele/ela fala", translation: "he/she speaks" },
          { id: "e4", type: "flashcard", term: "nós falamos", translation: "we speak" },
          { id: "e5", type: "flashcard", term: "eles/elas falam", translation: "they speak" },
          
          // Practice: Basic conjugation (MCQ)
          { id: "e6", type: "mcq", prompt: "How do you say 'I study'?", options: ["eu estudo", "eu estudas", "eu estuda"], correct: "eu estudo" },
          { id: "e7", type: "mcq", prompt: "How do you say 'we work'?", options: ["nós trabalho", "nós trabalhamos", "nós trabalham"], correct: "nós trabalhamos" },
          { id: "e8", type: "mcq", prompt: "How do you say 'they live'?", options: ["eles moram", "eles moramos", "eles mora"], correct: "eles moram" },
          
          // Practice: Verb matching
          { id: "e9", type: "matching", pairs: [
            { a: "eu compro", b: "I buy" },
            { a: "tu cantas", b: "you sing" },
            { a: "ela dança", b: "she dances" },
            { a: "nós andamos", b: "we walk" }
          ]},
          
          // Production: Complete sentences (typing)
          { id: "e10", type: "typing", prompt: "Say: 'I speak Portuguese.'", correct: "Eu falo português." },
          { id: "e11", type: "typing", prompt: "Say: 'We study every day.'", correct: "Nós estudamos todos os dias." },
          { id: "e12", type: "typing", prompt: "Say: 'They work in Lisbon.'", correct: "Eles trabalham em Lisboa." },
          { id: "e13", type: "typing", prompt: "Say: 'You live in Porto.' (informal)", correct: "Tu moras no Porto." },
          
          // Production: Question formation (typing)
          { id: "e14", type: "typing", prompt: "Ask: 'Do you like music?' (informal)", correct: "Tu gostas de música?" },
          { id: "e15", type: "typing", prompt: "Ask: 'Where do they travel?'", correct: "Onde viajam eles?" },
          { id: "e16", type: "typing", prompt: "Say: 'She sings beautifully.'", correct: "Ela canta lindamente." },
        ],
      },
      {
        id: "conj1el2",
        title: "Regular -ER and -IR Verbs Present Tense",
        xp: 50,
        content: {
          title: "Portuguese -ER and -IR Verb Conjugation",
          sections: [
            {
              title: "-ER Verb Conjugation Patterns",
              explanation: "Master regular -ER verbs in Portuguese present tense:",
              examples: [
                { pt: "comer", en: "to eat", note: "eu como, tu comes, ele/ela come, nós comemos, vós comeis, eles/elas comem" },
                { pt: "beber", en: "to drink", note: "eu bebo, tu bebes, ele/ela bebe, nós bebemos, vós bebeis, eles/elas bebem" },
                { pt: "vender", en: "to sell", note: "eu vendo, tu vendes, ele/ela vende, nós vendemos, vós vendeis, eles/elas vendem" },
                { pt: "aprender", en: "to learn", note: "eu aprendo, tu aprendes, ele/ela aprende, nós aprendemos, vós aprendeis, eles/elas aprendem" },
                { pt: "correr", en: "to run", note: "eu corro, tu corres, ele/ela corre, nós corremos, vós correis, eles/elas correm" }
              ],
              keyPoints: [
                "Remove -er and add: -o, -es, -e, -emos, -eis, -em",
                "-ER verbs are the second most common verb group",
                "Many food-related verbs are -ER verbs",
                "Pattern is very regular with few exceptions"
              ]
            },
            {
              title: "-IR Verb Conjugation Patterns",
              explanation: "Master regular -IR verbs in Portuguese present tense:",
              examples: [
                { pt: "partir", en: "to leave", note: "eu parto, tu partes, ele/ela parte, nós partimos, vós partis, eles/elas partem" },
                { pt: "abrir", en: "to open", note: "eu abro, tu abres, ele/ela abre, nós abrimos, vós abris, eles/elas abrem" },
                { pt: "dividir", en: "to divide", note: "eu divido, tu divides, ele/ela divide, nós dividimos, vós dividis, eles/elas dividem" },
                { pt: "decidir", en: "to decide", note: "eu decido, tu decides, ele/ela decide, nós decidimos, vós decidis, eles/elas decidem" },
                { pt: "assistir", en: "to watch/attend", note: "eu assisto, tu assistes, ele/ela assiste, nós assistimos, vós assistis, eles/elas assistem" }
              ],
              keyPoints: [
                "Remove -ir and add: -o, -es, -e, -imos, -is, -em",
                "-IR verbs are less common but very important",
                "Note the 'i' in nós and vós forms",
                "Many action verbs are -IR verbs"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: -ER verb patterns
          { id: "e1", type: "flashcard", term: "eu como", translation: "I eat" },
          { id: "e2", type: "flashcard", term: "tu bebes", translation: "you drink" },
          { id: "e3", type: "flashcard", term: "ela aprende", translation: "she learns" },
          { id: "e4", type: "flashcard", term: "nós corremos", translation: "we run" },
          
          // Presentation: -IR verb patterns
          { id: "e5", type: "flashcard", term: "eu parto", translation: "I leave" },
          { id: "e6", type: "flashcard", term: "tu abres", translation: "you open" },
          { id: "e7", type: "flashcard", term: "eles decidem", translation: "they decide" },
          
          // Practice: -ER verbs (MCQ)
          { id: "e8", type: "mcq", prompt: "How do you say 'we eat'?", options: ["nós comemos", "nós comem", "nós como"], correct: "nós comemos" },
          { id: "e9", type: "mcq", prompt: "How do you say 'you sell'? (informal)", options: ["tu vende", "tu vendes", "tu vendemos"], correct: "tu vendes" },
          
          // Practice: -IR verbs (MCQ)
          { id: "e10", type: "mcq", prompt: "How do you say 'I open'?", options: ["eu abro", "eu abres", "eu abre"], correct: "eu abro" },
          { id: "e11", type: "mcq", prompt: "How do you say 'they leave'?", options: ["eles parte", "eles partimos", "eles partem"], correct: "eles partem" },
          
          // Practice: Verb type identification
          { id: "e12", type: "matching", pairs: [
            { a: "beber (-ER)", b: "to drink" },
            { a: "dividir (-IR)", b: "to divide" },
            { a: "vender (-ER)", b: "to sell" },
            { a: "assistir (-IR)", b: "to watch" }
          ]},
          
          // Production: Mixed sentences (typing)
          { id: "e13", type: "typing", prompt: "Say: 'I eat breakfast.'", correct: "Eu como o pequeno-almoço." },
          { id: "e14", type: "typing", prompt: "Say: 'We learn Portuguese.'", correct: "Nós aprendemos português." },
          { id: "e15", type: "typing", prompt: "Say: 'They open the store.'", correct: "Eles abrem a loja." },
          { id: "e16", type: "typing", prompt: "Ask: 'What do you drink?' (informal)", correct: "O que bebes?" },
          { id: "e17", type: "typing", prompt: "Say: 'She decides quickly.'", correct: "Ela decide rapidamente." },
          { id: "e18", type: "typing", prompt: "Say: 'We watch movies.'", correct: "Nós assistimos a filmes." },
        ],
      },
    ],
  },
  {
    id: "conjugation2enhanced",
    title: "🌟 Portuguese Irregular Verbs Essentials (Enhanced PPP)",
    description: "Master the most important Portuguese irregular verbs including ser, estar, ter, fazer with comprehensive practice.",
    lessons: [
      {
        id: "conj2el1",
        title: "Ser vs Estar - Being Verbs Mastery",
        xp: 55,
        content: {
          title: "Portuguese SER vs ESTAR Complete Guide",
          sections: [
            {
              title: "SER - Permanent States and Identity",
              explanation: "Master SER for permanent characteristics, identity, and inherent qualities:",
              examples: [
                { pt: "eu sou", en: "I am", note: "permanent state/identity" },
                { pt: "tu és", en: "you are", note: "informal, permanent" },
                { pt: "ele/ela é", en: "he/she is", note: "permanent characteristic" },
                { pt: "nós somos", en: "we are", note: "collective identity" },
                { pt: "eles/elas são", en: "they are", note: "permanent states" },
                { pt: "Eu sou português", en: "I am Portuguese", note: "nationality - permanent" },
                { pt: "Ela é médica", en: "She is a doctor", note: "profession - permanent" },
                { pt: "O livro é interessante", en: "The book is interesting", note: "inherent quality" }
              ],
              keyPoints: [
                "SER for permanent characteristics, nationality, profession",
                "SER for time, dates, and events",
                "SER for essential qualities that don't change",
                "SER with adjectives describing inherent traits"
              ]
            },
            {
              title: "ESTAR - Temporary States and Location",
              explanation: "Master ESTAR for temporary conditions, location, and ongoing states:",
              examples: [
                { pt: "eu estou", en: "I am", note: "temporary state/location" },
                { pt: "tu estás", en: "you are", note: "informal, temporary" },
                { pt: "ele/ela está", en: "he/she is", note: "temporary condition" },
                { pt: "nós estamos", en: "we are", note: "collective temporary state" },
                { pt: "eles/elas estão", en: "they are", note: "temporary states" },
                { pt: "Eu estou cansado", en: "I am tired", note: "temporary feeling" },
                { pt: "Ela está em casa", en: "She is at home", note: "location" },
                { pt: "O café está quente", en: "The coffee is hot", note: "temporary condition" }
              ],
              keyPoints: [
                "ESTAR for location and position",
                "ESTAR for temporary feelings and conditions",
                "ESTAR with present continuous (-ndo forms)",
                "ESTAR with adjectives describing changeable states"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: SER conjugation
          { id: "e1", type: "flashcard", term: "eu sou", translation: "I am (permanent)" },
          { id: "e2", type: "flashcard", term: "tu és", translation: "you are (permanent)" },
          { id: "e3", type: "flashcard", term: "ele é", translation: "he is (permanent)" },
          { id: "e4", type: "flashcard", term: "nós somos", translation: "we are (permanent)" },
          { id: "e5", type: "flashcard", term: "eles são", translation: "they are (permanent)" },
          
          // Presentation: ESTAR conjugation
          { id: "e6", type: "flashcard", term: "eu estou", translation: "I am (temporary/location)" },
          { id: "e7", type: "flashcard", term: "tu estás", translation: "you are (temporary/location)" },
          { id: "e8", type: "flashcard", term: "ela está", translation: "she is (temporary/location)" },
          { id: "e9", type: "flashcard", term: "nós estamos", translation: "we are (temporary/location)" },
          { id: "e10", type: "flashcard", term: "elas estão", translation: "they are (temporary/location)" },
          
          // Practice: SER vs ESTAR choice (MCQ)
          { id: "e11", type: "mcq", prompt: "I am Portuguese.", options: ["Eu sou português", "Eu estou português"], correct: "Eu sou português" },
          { id: "e12", type: "mcq", prompt: "She is tired.", options: ["Ela é cansada", "Ela está cansada"], correct: "Ela está cansada" },
          { id: "e13", type: "mcq", prompt: "We are at school.", options: ["Nós somos na escola", "Nós estamos na escola"], correct: "Nós estamos na escola" },
          { id: "e14", type: "mcq", prompt: "The house is big.", options: ["A casa é grande", "A casa está grande"], correct: "A casa é grande" },
          
          // Practice: Context matching
          { id: "e15", type: "matching", pairs: [
            { a: "permanent: doctor", b: "Ela é médica" },
            { a: "temporary: happy", b: "Ele está feliz" },
            { a: "location: home", b: "Estou em casa" },
            { a: "nationality: Brazilian", b: "Sou brasileiro" }
          ]},
          
          // Production: SER sentences (typing)
          { id: "e16", type: "typing", prompt: "Say: 'I am a student.'", correct: "Eu sou estudante." },
          { id: "e17", type: "typing", prompt: "Say: 'You are intelligent.' (informal)", correct: "Tu és inteligente." },
          { id: "e18", type: "typing", prompt: "Say: 'They are doctors.'", correct: "Eles são médicos." },
          
          // Production: ESTAR sentences (typing)
          { id: "e19", type: "typing", prompt: "Say: 'I am at home.'", correct: "Eu estou em casa." },
          { id: "e20", type: "typing", prompt: "Say: 'She is sad.'", correct: "Ela está triste." },
          { id: "e21", type: "typing", prompt: "Ask: 'Where are you?' (informal)", correct: "Onde estás?" },
          { id: "e22", type: "typing", prompt: "Say: 'We are studying.'", correct: "Nós estamos a estudar." },
        ],
      },
      {
        id: "conj2el2",
        title: "TER and FAZER - Essential Irregular Verbs",
        xp: 55,
        content: {
          title: "Portuguese TER and FAZER Mastery",
          sections: [
            {
              title: "TER - To Have and Expressions",
              explanation: "Master TER for possession, age, and common expressions:",
              examples: [
                { pt: "eu tenho", en: "I have", note: "possession and expressions" },
                { pt: "tu tens", en: "you have", note: "informal possession" },
                { pt: "ele/ela tem", en: "he/she has", note: "third person possession" },
                { pt: "nós temos", en: "we have", note: "collective possession" },
                { pt: "eles/elas têm", en: "they have", note: "plural possession (note circumflex)" },
                { pt: "Tenho 25 anos", en: "I am 25 years old", note: "age expression" },
                { pt: "Tens fome?", en: "Are you hungry?", note: "hunger expression" },
                { pt: "Ela tem sede", en: "She is thirsty", note: "thirst expression" }
              ],
              keyPoints: [
                "TER for possession: 'Tenho um carro' (I have a car)",
                "TER for age: 'Tenho 30 anos' (I am 30 years old)",
                "TER in expressions: fome (hunger), sede (thirst), medo (fear)",
                "Note the circumflex in 'têm' (they have)"
              ]
            },
            {
              title: "FAZER - To Do/Make and Weather",
              explanation: "Master FAZER for actions, weather, and time expressions:",
              examples: [
                { pt: "eu faço", en: "I do/make", note: "actions and creation" },
                { pt: "tu fazes", en: "you do/make", note: "informal action" },
                { pt: "ele/ela faz", en: "he/she does/makes", note: "third person action" },
                { pt: "nós fazemos", en: "we do/make", note: "collective action" },
                { pt: "eles/elas fazem", en: "they do/make", note: "plural action" },
                { pt: "Faço exercício", en: "I exercise", note: "activity" },
                { pt: "Faz calor", en: "It's hot", note: "weather expression" },
                { pt: "Que tempo faz?", en: "How's the weather?", note: "weather question" }
              ],
              keyPoints: [
                "FAZER for activities: 'Faço desporto' (I do sports)",
                "FAZER for weather: 'Faz frio' (It's cold)",
                "FAZER for time expressions: 'Faz dois anos' (Two years ago)",
                "Common in daily conversation and weather reports"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: TER conjugation
          { id: "e1", type: "flashcard", term: "eu tenho", translation: "I have" },
          { id: "e2", type: "flashcard", term: "tu tens", translation: "you have" },
          { id: "e3", type: "flashcard", term: "ele tem", translation: "he has" },
          { id: "e4", type: "flashcard", term: "nós temos", translation: "we have" },
          { id: "e5", type: "flashcard", term: "eles têm", translation: "they have (note accent)" },
          
          // Presentation: FAZER conjugation
          { id: "e6", type: "flashcard", term: "eu faço", translation: "I do/make" },
          { id: "e7", type: "flashcard", term: "tu fazes", translation: "you do/make" },
          { id: "e8", type: "flashcard", term: "ela faz", translation: "she does/makes" },
          { id: "e9", type: "flashcard", term: "nós fazemos", translation: "we do/make" },
          { id: "e10", type: "flashcard", term: "elas fazem", translation: "they do/make" },
          
          // Practice: TER expressions (MCQ)
          { id: "e11", type: "mcq", prompt: "How do you say 'I am 20 years old'?", options: ["Eu sou 20 anos", "Eu tenho 20 anos", "Eu estou 20 anos"], correct: "Eu tenho 20 anos" },
          { id: "e12", type: "mcq", prompt: "How do you say 'Are you hungry?' (informal)", options: ["Tens fome?", "És fome?", "Estás fome?"], correct: "Tens fome?" },
          { id: "e13", type: "mcq", prompt: "How do you say 'They have a car'?", options: ["Eles tem um carro", "Eles têm um carro", "Eles temos um carro"], correct: "Eles têm um carro" },
          
          // Practice: FAZER uses (MCQ)
          { id: "e14", type: "mcq", prompt: "How do you say 'It's hot'?", options: ["Está calor", "É calor", "Faz calor"], correct: "Faz calor" },
          { id: "e15", type: "mcq", prompt: "How do you say 'We exercise'?", options: ["Nós fazemos exercício", "Nós temos exercício", "Nós somos exercício"], correct: "Nós fazemos exercício" },
          
          // Practice: Expression matching
          { id: "e16", type: "matching", pairs: [
            { a: "Tenho sede", b: "I'm thirsty" },
            { a: "Faz frio", b: "It's cold" },
            { a: "Tens medo?", b: "Are you afraid?" },
            { a: "Fazemos jantar", b: "We make dinner" }
          ]},
          
          // Production: TER sentences (typing)
          { id: "e17", type: "typing", prompt: "Say: 'I have two cats.'", correct: "Eu tenho dois gatos." },
          { id: "e18", type: "typing", prompt: "Ask: 'How old are you?' (informal)", correct: "Quantos anos tens?" },
          { id: "e19", type: "typing", prompt: "Say: 'She is afraid.'", correct: "Ela tem medo." },
          
          // Production: FAZER sentences (typing)
          { id: "e20", type: "typing", prompt: "Ask: 'What's the weather like?'", correct: "Que tempo faz?" },
          { id: "e21", type: "typing", prompt: "Say: 'I make coffee.'", correct: "Eu faço café." },
          { id: "e22", type: "typing", prompt: "Say: 'It's cold today.'", correct: "Hoje faz frio." },
        ],
      },
    ],
  },
  {
    id: "conjugation3enhanced",
    title: "🚀 Portuguese Preterite Past Tense (Enhanced PPP)",
    description: "Master Portuguese preterite past tense for completed actions with regular and irregular verbs in context.",
    lessons: [
      {
        id: "conj3el1",
        title: "Regular Preterite Past Tense",
        xp: 60,
        content: {
          title: "Portuguese Preterite Past Tense Mastery",
          sections: [
            {
              title: "Regular -AR Verbs in Preterite",
              explanation: "Master past tense forms for regular -AR verbs:",
              examples: [
                { pt: "falar", en: "to speak", note: "eu falei, tu falaste, ele falou, nós falámos, eles falaram" },
                { pt: "estudar", en: "to study", note: "eu estudei, tu estudaste, ele estudou, nós estudámos, eles estudaram" },
                { pt: "trabalhar", en: "to work", note: "eu trabalhei, tu trabalhaste, ele trabalhou, nós trabalhámos, eles trabalharam" },
                { pt: "Ontem falei com o João", en: "Yesterday I spoke with João", note: "completed action in past" },
                { pt: "Eles estudaram português", en: "They studied Portuguese", note: "finished activity" }
              ],
              keyPoints: [
                "Remove -ar, add: -ei, -aste, -ou, -ámos, -aram",
                "Used for completed actions in the past",
                "Often used with time expressions: ontem, na semana passada",
                "Stress on specific syllables: falÁste, falÁmos"
              ]
            },
            {
              title: "Regular -ER and -IR Verbs in Preterite",
              explanation: "Master past tense forms for regular -ER and -IR verbs:",
              examples: [
                { pt: "comer", en: "to eat", note: "eu comi, tu comeste, ele comeu, nós comemos, eles comeram" },
                { pt: "beber", en: "to drink", note: "eu bebi, tu bebeste, ele bebeu, nós bebemos, eles beberam" },
                { pt: "partir", en: "to leave", note: "eu parti, tu partiste, ele partiu, nós partimos, eles partiram" },
                { pt: "abrir", en: "to open", note: "eu abri, tu abriste, ele abriu, nós abrimos, eles abriram" },
                { pt: "Comi uma francesinha", en: "I ate a francesinha", note: "completed eating action" },
                { pt: "Eles partiram cedo", en: "They left early", note: "completed departure" }
              ],
              keyPoints: [
                "-ER verbs: remove -er, add -i, -este, -eu, -emos, -eram",
                "-IR verbs: remove -ir, add -i, -iste, -iu, -imos, -iram",
                "Same endings for -ER and -IR in most forms",
                "Different stress patterns from present tense"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: -AR preterite patterns
          { id: "e1", type: "flashcard", term: "eu falei", translation: "I spoke" },
          { id: "e2", type: "flashcard", term: "tu falaste", translation: "you spoke" },
          { id: "e3", type: "flashcard", term: "ele falou", translation: "he spoke" },
          { id: "e4", type: "flashcard", term: "nós falámos", translation: "we spoke" },
          { id: "e5", type: "flashcard", term: "eles falaram", translation: "they spoke" },
          
          // Presentation: -ER preterite patterns
          { id: "e6", type: "flashcard", term: "eu comi", translation: "I ate" },
          { id: "e7", type: "flashcard", term: "tu comeste", translation: "you ate" },
          { id: "e8", type: "flashcard", term: "ela comeu", translation: "she ate" },
          
          // Presentation: -IR preterite patterns
          { id: "e9", type: "flashcard", term: "eu parti", translation: "I left" },
          { id: "e10", type: "flashcard", term: "eles partiram", translation: "they left" },
          
          // Practice: -AR preterite (MCQ)
          { id: "e11", type: "mcq", prompt: "How do you say 'I studied yesterday'?", options: ["Eu estudei ontem", "Eu estudo ontem", "Eu estudava ontem"], correct: "Eu estudei ontem" },
          { id: "e12", type: "mcq", prompt: "How do you say 'we worked'?", options: ["nós trabalhamos", "nós trabalhámos", "nós trabalhávamos"], correct: "nós trabalhámos" },
          
          // Practice: -ER/-IR preterite (MCQ)
          { id: "e13", type: "mcq", prompt: "How do you say 'she drank'?", options: ["ela bebeu", "ela bebe", "ela bebia"], correct: "ela bebeu" },
          { id: "e14", type: "mcq", prompt: "How do you say 'they opened'?", options: ["eles abrem", "eles abriram", "eles abriam"], correct: "eles abriram" },
          
          // Practice: Verb recognition
          { id: "e15", type: "matching", pairs: [
            { a: "trabalhei", b: "I worked" },
            { a: "bebeste", b: "you drank" },
            { a: "partiu", b: "he/she left" },
            { a: "comemos", b: "we ate" }
          ]},
          
          // Production: Past actions (typing)
          { id: "e16", type: "typing", prompt: "Say: 'I spoke with my mother yesterday.'", correct: "Falei com a minha mãe ontem." },
          { id: "e17", type: "typing", prompt: "Say: 'We ate at a restaurant.'", correct: "Comemos num restaurante." },
          { id: "e18", type: "typing", prompt: "Say: 'They left this morning.'", correct: "Eles partiram esta manhã." },
          { id: "e19", type: "typing", prompt: "Ask: 'What did you study?' (informal)", correct: "O que estudaste?" },
          { id: "e20", type: "typing", prompt: "Say: 'She opened the window.'", correct: "Ela abriu a janela." },
        ],
      },
    ],
  },
  {
    id: "conjugation4enhanced",
    title: "⏰ Portuguese Imperfect Past Tense (Enhanced PPP)",
    description: "Master Portuguese imperfect past tense for ongoing actions, habits, and descriptions in the past.",
    lessons: [
      {
        id: "conj4el1",
        title: "Regular Imperfect Past Tense",
        xp: 60,
        content: {
          title: "Portuguese Imperfect Past Tense",
          sections: [
            {
              title: "Imperfect vs Preterite Concept",
              explanation: "Understanding when to use imperfect past tense in Portuguese:",
              examples: [
                { pt: "Eu estudava português", en: "I used to study Portuguese", note: "habitual past action" },
                { pt: "Quando era criança...", en: "When I was a child...", note: "ongoing past state" },
                { pt: "Estava a chover", en: "It was raining", note: "ongoing past action" },
                { pt: "Todos os dias comia...", en: "Every day I would eat...", note: "repeated past action" },
                { pt: "A casa era grande", en: "The house was big", note: "past description" }
              ],
              keyPoints: [
                "Imperfect for habitual actions: 'Eu trabalhava' (I used to work)",
                "Imperfect for ongoing past actions: 'Estava a ler' (I was reading)",
                "Imperfect for descriptions: 'Era bonito' (It was beautiful)",
                "Often translates as 'used to', 'was -ing', or 'would'"
              ]
            },
            {
              title: "Regular Imperfect Formations",
              explanation: "Master regular imperfect conjugations for all verb types:",
              examples: [
                { pt: "falar", en: "to speak", note: "eu falava, tu falavas, ele falava, nós falávamos, eles falavam" },
                { pt: "comer", en: "to eat", note: "eu comia, tu comias, ele comia, nós comíamos, eles comiam" },
                { pt: "partir", en: "to leave", note: "eu partia, tu partias, ele partia, nós partíamos, eles partiam" },
                { pt: "estudar", en: "to study", note: "eu estudava todos os dias - I used to study every day" },
                { pt: "beber", en: "to drink", note: "ele bebia café - he used to drink coffee" }
              ],
              keyPoints: [
                "-AR verbs: remove -ar, add -ava, -avas, -ava, -ávamos, -avam",
                "-ER verbs: remove -er, add -ia, -ias, -ia, -íamos, -iam",
                "-IR verbs: remove -ir, add -ia, -ias, -ia, -íamos, -iam",
                "Very regular pattern - few irregular verbs"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: -AR imperfect patterns
          { id: "e1", type: "flashcard", term: "eu falava", translation: "I used to speak/was speaking" },
          { id: "e2", type: "flashcard", term: "tu falavas", translation: "you used to speak" },
          { id: "e3", type: "flashcard", term: "ele falava", translation: "he used to speak" },
          { id: "e4", type: "flashcard", term: "nós falávamos", translation: "we used to speak" },
          { id: "e5", type: "flashcard", term: "eles falavam", translation: "they used to speak" },
          
          // Presentation: -ER imperfect patterns
          { id: "e6", type: "flashcard", term: "eu comia", translation: "I used to eat/was eating" },
          { id: "e7", type: "flashcard", term: "tu comias", translation: "you used to eat" },
          { id: "e8", type: "flashcard", term: "ela comia", translation: "she used to eat" },
          
          // Presentation: -IR imperfect patterns
          { id: "e9", type: "flashcard", term: "eu partia", translation: "I used to leave/was leaving" },
          { id: "e10", type: "flashcard", term: "eles partiam", translation: "they used to leave" },
          
          // Practice: Imperfect vs preterite concept (MCQ)
          { id: "e11", type: "mcq", prompt: "'I was studying when...' - Which tense?", options: ["Eu estudei quando...", "Eu estudava quando...", "Eu estudo quando..."], correct: "Eu estudava quando..." },
          { id: "e12", type: "mcq", prompt: "'Every Sunday we used to go...'", options: ["Todos os domingos fomos...", "Todos os domingos íamos...", "Todos os domingos vamos..."], correct: "Todos os domingos íamos..." },
          
          // Practice: Regular imperfect (MCQ)
          { id: "e13", type: "mcq", prompt: "How do you say 'she used to work'?", options: ["ela trabalhava", "ela trabalhou", "ela trabalha"], correct: "ela trabalhava" },
          { id: "e14", type: "mcq", prompt: "How do you say 'we were eating'?", options: ["nós comemos", "nós comíamos", "nós comemos"], correct: "nós comíamos" },
          
          // Practice: Context matching
          { id: "e15", type: "matching", pairs: [
            { a: "habitual: trabalhava", b: "I used to work" },
            { a: "ongoing: estava a ler", b: "I was reading" },
            { a: "description: era bonito", b: "it was beautiful" },
            { a: "repeated: todos os dias", b: "every day" }
          ]},
          
          // Production: Habitual actions (typing)
          { id: "e16", type: "typing", prompt: "Say: 'I used to live in Porto.'", correct: "Eu vivia no Porto." },
          { id: "e17", type: "typing", prompt: "Say: 'We were studying Portuguese.'", correct: "Nós estudávamos português." },
          { id: "e18", type: "typing", prompt: "Say: 'She used to drink coffee every morning.'", correct: "Ela bebia café todas as manhãs." },
          { id: "e19", type: "typing", prompt: "Say: 'They were working when...'", correct: "Eles trabalhavam quando..." },
          { id: "e20", type: "typing", prompt: "Ask: 'What did you use to do?' (informal)", correct: "O que fazias?" },
        ],
      },
    ],
  },
  {
    id: "conjugation5enhanced",
    title: "🔮 Portuguese Future Tenses (Enhanced PPP)",
    description: "Master Portuguese future tense (simple future and near future) for plans, predictions, and intentions.",
    lessons: [
      {
        id: "conj5el1",
        title: "Near Future with IR + Infinitive",
        xp: 55,
        content: {
          title: "Portuguese Near Future Construction",
          sections: [
            {
              title: "IR Conjugation for Near Future",
              explanation: "Master the irregular verb IR for expressing near future:",
              examples: [
                { pt: "ir", en: "to go", note: "eu vou, tu vais, ele vai, nós vamos, eles vão" },
                { pt: "Vou estudar", en: "I'm going to study", note: "near future intention" },
                { pt: "Vais viajar?", en: "Are you going to travel?", note: "near future question" },
                { pt: "Ela vai trabalhar", en: "She's going to work", note: "immediate plan" },
                { pt: "Vamos jantar", en: "We're going to have dinner", note: "collective plan" },
                { pt: "Eles vão chegar tarde", en: "They're going to arrive late", note: "prediction" }
              ],
              keyPoints: [
                "IR + infinitive = near future (going to)",
                "Most common way to express future in Portuguese",
                "Used for immediate plans and intentions",
                "IR is highly irregular but essential"
              ]
            },
            {
              title: "Using Near Future in Context",
              explanation: "Practical applications of near future in daily Portuguese:",
              examples: [
                { pt: "Vou ao supermercado", en: "I'm going to the supermarket", note: "immediate plan" },
                { pt: "Vamos ver um filme", en: "We're going to watch a movie", note: "entertainment plan" },
                { pt: "Não vou trabalhar amanhã", en: "I'm not going to work tomorrow", note: "future negative" },
                { pt: "Quando vais partir?", en: "When are you going to leave?", note: "future question with time" },
                { pt: "Vai chover hoje", en: "It's going to rain today", note: "weather prediction" },
                { pt: "Vou aprender português", en: "I'm going to learn Portuguese", note: "learning intention" }
              ],
              keyPoints: [
                "Often used with time expressions: amanhã, hoje, na próxima semana",
                "Negatives: não vou, não vais, não vai...",
                "Questions: vou?, vais?, quando vais?",
                "Common in spoken Portuguese"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: IR conjugation
          { id: "e1", type: "flashcard", term: "eu vou", translation: "I go/am going" },
          { id: "e2", type: "flashcard", term: "tu vais", translation: "you go/are going" },
          { id: "e3", type: "flashcard", term: "ele vai", translation: "he goes/is going" },
          { id: "e4", type: "flashcard", term: "nós vamos", translation: "we go/are going" },
          { id: "e5", type: "flashcard", term: "eles vão", translation: "they go/are going" },
          
          // Presentation: Near future constructions
          { id: "e6", type: "flashcard", term: "vou estudar", translation: "I'm going to study" },
          { id: "e7", type: "flashcard", term: "vais trabalhar", translation: "you're going to work" },
          { id: "e8", type: "flashcard", term: "vai chover", translation: "it's going to rain" },
          { id: "e9", type: "flashcard", term: "vamos viajar", translation: "we're going to travel" },
          { id: "e10", type: "flashcard", term: "vão partir", translation: "they're going to leave" },
          
          // Practice: IR conjugation (MCQ)
          { id: "e11", type: "mcq", prompt: "How do you say 'we are going'?", options: ["nós vamos", "nós imos", "nós vão"], correct: "nós vamos" },
          { id: "e12", type: "mcq", prompt: "How do you say 'they go'?", options: ["eles vão", "eles vem", "eles são"], correct: "eles vão" },
          
          // Practice: Near future formation (MCQ)
          { id: "e13", type: "mcq", prompt: "How do you say 'I'm going to eat'?", options: ["vou comer", "vou comendo", "irei comer"], correct: "vou comer" },
          { id: "e14", type: "mcq", prompt: "How do you say 'she's going to buy'?", options: ["ela vai comprando", "ela vai comprar", "ela irá comprar"], correct: "ela vai comprar" },
          
          // Practice: Future plans matching
          { id: "e15", type: "matching", pairs: [
            { a: "vou ao cinema", b: "I'm going to the cinema" },
            { a: "vais estudar?", b: "are you going to study?" },
            { a: "vai fazer calor", b: "it's going to be hot" },
            { a: "não vamos trabalhar", b: "we're not going to work" }
          ]},
          
          // Production: Future plans (typing)
          { id: "e16", type: "typing", prompt: "Say: 'I'm going to study Portuguese.'", correct: "Vou estudar português." },
          { id: "e17", type: "typing", prompt: "Ask: 'What are you going to do?' (informal)", correct: "O que vais fazer?" },
          { id: "e18", type: "typing", prompt: "Say: 'We're going to travel tomorrow.'", correct: "Vamos viajar amanhã." },
          { id: "e19", type: "typing", prompt: "Say: 'They're not going to come.'", correct: "Eles não vão vir." },
          { id: "e20", type: "typing", prompt: "Ask: 'When are you going to leave?' (informal)", correct: "Quando vais partir?" },
          { id: "e21", type: "typing", prompt: "Say: 'It's going to rain this afternoon.'", correct: "Vai chover esta tarde." },
        ],
      },
    ],
  },
]; 