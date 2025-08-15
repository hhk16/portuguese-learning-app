export type ExerciseType = "flashcard" | "mcq" | "typing" | "listening" | "matching" | "order" | "dialogue" | "pronunciation" | "spelling" | "price" | "conjugation" | "directions" | "form" | "conjugationGrid" | "dirPath";

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt?: string;
  term?: string;
  translation?: string;
  options?: string[];
  correct?: string | string[];
  audioTextPt?: string;
  pairs?: { a: string; b: string }[];
  items?: string[]; // for ordering
  // dialogue optional
  dialogue?: { pt?: string; choice?: { text: string; good: boolean }[] }[];
  // direction map path (simple grid-based)
  pathNodes?: { id: number; x: number; y: number; label?: string }[];
  pathEdges?: { from: number; to: number; label: string }[];
  correctPath?: number[]; // sequence of node ids
}

export interface LessonContent {
  title: string;
  sections: {
    title: string;
    explanation: string; // English explanation
    examples: { pt: string; en: string; note?: string }[];
    keyPoints?: string[];
  }[];
}

export interface Lesson {
  id: string;
  title: string;
  xp: number;
  content?: LessonContent; // NEW: Presentation phase with teaching content
  exercises: Exercise[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const modules: Module[] = [
  {
    id: "mp1",
    title: "Pronúncia & Soletrar (EP)",
    description: "Sounds unique to European Portuguese and spelling basics.",
    lessons: [
      {
        id: "mp1l1",
        title: "Sons do PT-PT (lh/nh/ão/ç)",
        xp: 25,
        content: {
          title: "European Portuguese Sounds",
          sections: [
            {
              title: "Key Sounds of European Portuguese",
              explanation: "European Portuguese has several unique sounds that don't exist in English. Let's learn the most important ones:",
              examples: [
                { pt: "lh", en: "like 'lli' in million", note: "palatal lateral" },
                { pt: "nh", en: "like 'ny' in canyon", note: "palatal nasal" },
                { pt: "ão", en: "nasal 'ow' sound", note: "very nasal" },
                { pt: "ç", en: "like 's' in sun", note: "cedilla" }
              ],
              keyPoints: [
                "European Portuguese is more nasal than Brazilian Portuguese",
                "The 'lh' and 'nh' sounds are palatalized (tongue touches roof of mouth)",
                "The 'ão' ending is heavily nasalized through the nose"
              ]
            },
            {
              title: "Common Words with These Sounds",
              explanation: "Here are everyday words using these sounds:",
              examples: [
                { pt: "filho", en: "son", note: "fi-lho with 'lh' sound" },
                { pt: "senhor", en: "mister/sir", note: "se-nhor with 'nh' sound" },
                { pt: "pão", en: "bread", note: "very nasal ending" },
                { pt: "coração", en: "heart", note: "co-ra-ção with cedilla" }
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "filho", translation: "son" },
          { id: "e2", type: "flashcard", term: "senhor", translation: "mister/sir" },
          { id: "e3", type: "pronunciation", prompt: "Qual ouves? (ão vs am)", audioTextPt: "pão", options: ["pão", "pam"], correct: "pão" },
          { id: "e4", type: "pronunciation", prompt: "Qual ouves? (ç)", audioTextPt: "coração", options: ["coração", "coracao"], correct: "coração" },
        ],
      },
      {
        id: "mp1l2",
        title: "Soletrar, emails e preços",
        xp: 25,
        content: {
          title: "Portuguese Alphabet, Email & Price Vocabulary",
          sections: [
            {
              title: "Portuguese Alphabet",
              explanation: "The Portuguese alphabet is similar to English, but letter names are pronounced differently:",
              examples: [
                { pt: "A", en: "ah", note: "pronounced 'ah'" },
                { pt: "B", en: "bê", note: "pronounced 'bay'" },
                { pt: "C", en: "cê", note: "pronounced 'say'" },
                { pt: "D", en: "dê", note: "pronounced 'day'" },
                { pt: "E", en: "é", note: "pronounced 'eh'" },
                { pt: "F", en: "éfe", note: "pronounced 'eh-feh'" },
                { pt: "G", en: "gê", note: "pronounced 'zhay'" },
                { pt: "H", en: "agá", note: "pronounced 'ah-gah'" },
                { pt: "I", en: "i", note: "pronounced 'ee'" },
                { pt: "J", en: "jota", note: "pronounced 'zhoh-tah'" }
              ],
              keyPoints: [
                "To spell your name, say each letter clearly",
                "Use 'grande' for capital letters: 'A grande'",
                "Practice with common Portuguese names"
              ]
            },
            {
              title: "Email Vocabulary",
              explanation: "Essential words for email addresses in Portuguese:",
              examples: [
                { pt: "arroba", en: "@", note: "the @ symbol" },
                { pt: "ponto", en: ".", note: "dot/period" },
                { pt: "hífen", en: "-", note: "hyphen/dash" },
                { pt: "exemplo", en: "example", note: "as in example.com" }
              ],
              keyPoints: [
                "Email: ana.silva@exemplo.com = 'ana ponto silva arroba exemplo ponto com'",
                "Always speak clearly when giving email addresses",
                "Common domains: .com, .pt (Portugal)"
              ]
            },
            {
              title: "Price & Money Vocabulary",
              explanation: "How to express prices and money in Portuguese:",
              examples: [
                { pt: "euro(s)", en: "euro(s)", note: "European currency" },
                { pt: "cêntimo(s)", en: "cent(s)", note: "1/100 of a euro" },
                { pt: "12,50 €", en: "12 euros and 50 cents", note: "note the comma for decimal" },
                { pt: "preço", en: "price", note: "cost of something" }
              ],
              keyPoints: [
                "Portuguese uses comma for decimals (12,50 not 12.50)",
                "Say: 'doze euros e cinquenta cêntimos'",
                "Euro symbol can go before or after: €12,50 or 12,50 €"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn the vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "arroba", translation: "@ symbol" },
          { id: "e2", type: "flashcard", term: "ponto", translation: "dot/period" },
          { id: "e3", type: "flashcard", term: "euro", translation: "euro" },
          { id: "e4", type: "flashcard", term: "cêntimo", translation: "cent" },
          
          // Then: Practice recognition (MCQ)
          { id: "e5", type: "mcq", prompt: "Como se diz '@' em português?", options: ["ponto", "arroba", "hífen"], correct: "arroba" },
          { id: "e6", type: "mcq", prompt: "Como se escreve '15 euros e 30 cêntimos'?", options: ["15.30 €", "15,30 €", "15:30 €"], correct: "15,30 €" },
          
          // Finally: Production (typing/spelling)
          { id: "e7", type: "spelling", prompt: "Soletra um nome português: Ana", correct: "Ana" },
          { id: "e8", type: "spelling", prompt: "Escreve o email que ouves", correct: "ana.silva@exemplo.com", audioTextPt: "ana ponto silva arroba exemplo ponto com" },
          { id: "e9", type: "price", prompt: "Escreve o preço que ouves", correct: "12,50 €", audioTextPt: "doze euros e cinquenta cêntimos" },
        ],
      },
    ],
  },
  {
    id: "mp2",
    title: "Números 21–1000, Meses & Datas",
    description: "21–1000; meses/estações; datas e andares (1.º/2.º).",
    lessons: [
      {
        id: "mp2l1",
        title: "21–1000; meses/estações",
        xp: 25,
        content: {
          title: "Numbers 21-1000, Months & Seasons",
          sections: [
            {
              title: "Numbers 21-100",
              explanation: "Portuguese numbers from 21-100 follow a pattern. Learn the tens first, then combine with units using 'e' (and):",
              examples: [
                { pt: "vinte", en: "twenty", note: "base for 20s" },
                { pt: "trinta", en: "thirty", note: "base for 30s" },
                { pt: "quarenta", en: "forty", note: "base for 40s" },
                { pt: "cinquenta", en: "fifty", note: "base for 50s" },
                { pt: "sessenta", en: "sixty", note: "base for 60s" },
                { pt: "setenta", en: "seventy", note: "base for 70s" },
                { pt: "oitenta", en: "eighty", note: "base for 80s" },
                { pt: "noventa", en: "ninety", note: "base for 90s" }
              ],
              keyPoints: [
                "Pattern: tens + 'e' + units (vinte e um, trinta e dois)",
                "Don't use 'e' for exact tens (vinte, not vinte e zero)",
                "All compound numbers use 'e' to connect parts"
              ]
            },
            {
              title: "Numbers 100-1000",
              explanation: "Hundreds have their own forms, and 'mil' is used for thousands:",
              examples: [
                { pt: "cem", en: "one hundred (exactly)", note: "used alone" },
                { pt: "cento e um", en: "one hundred and one", note: "cento + e + number" },
                { pt: "duzentos", en: "two hundred", note: "200" },
                { pt: "trezentos", en: "three hundred", note: "300" },
                { pt: "quinhentos", en: "five hundred", note: "500" },
                { pt: "mil", en: "one thousand", note: "1000" }
              ],
              keyPoints: [
                "Cem (100 exactly) vs. cento (100 + something)",
                "Hundreds agree with gender: duzentas mulheres",
                "Use 'e' to connect all parts: trezentos e quarenta e cinco"
              ]
            },
            {
              title: "Months of the Year",
              explanation: "Portuguese months are similar to English but with Portuguese pronunciation:",
              examples: [
                { pt: "janeiro", en: "January", note: "ja-NEI-ro" },
                { pt: "fevereiro", en: "February", note: "fe-ve-REI-ro" },
                { pt: "março", en: "March", note: "MAR-ço" },
                { pt: "abril", en: "April", note: "a-BRIL" },
                { pt: "maio", en: "May", note: "MAI-o" },
                { pt: "junho", en: "June", note: "JU-nho" },
                { pt: "julho", en: "July", note: "JU-lho" },
                { pt: "agosto", en: "August", note: "a-GOS-to" },
                { pt: "setembro", en: "September", note: "se-TEM-bro" },
                { pt: "outubro", en: "October", note: "ou-TU-bro" },
                { pt: "novembro", en: "November", note: "no-VEM-bro" },
                { pt: "dezembro", en: "December", note: "de-ZEM-bro" }
              ],
              keyPoints: [
                "Months are masculine: o janeiro, no março",
                "Use 'em' for months: em janeiro (in January)",
                "No capitals in Portuguese: janeiro, not Janeiro"
              ]
            },
            {
              title: "Seasons",
              explanation: "Portugal has four distinct seasons with specific vocabulary:",
              examples: [
                { pt: "primavera", en: "spring", note: "pri-ma-VE-ra" },
                { pt: "verão", en: "summer", note: "ve-RÃO (nasal)" },
                { pt: "outono", en: "autumn/fall", note: "ou-TO-no" },
                { pt: "inverno", en: "winter", note: "in-VER-no" }
              ],
              keyPoints: [
                "Seasons are masculine: o verão quente",
                "Use 'no' with seasons: no inverno (in winter)",
                "Portuguese seasons match European calendar"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn number patterns (flashcards)
          { id: "e1", type: "flashcard", term: "vinte e três", translation: "twenty-three" },
          { id: "e2", type: "flashcard", term: "cinquenta e sete", translation: "fifty-seven" },
          { id: "e3", type: "flashcard", term: "cento e dez", translation: "one hundred and ten" },
          
          // Then: Learn months (flashcards)
          { id: "e4", type: "flashcard", term: "janeiro", translation: "January" },
          { id: "e5", type: "flashcard", term: "julho", translation: "July" },
          { id: "e6", type: "flashcard", term: "dezembro", translation: "December" },
          
          // Practice recognition (MCQ)
          { id: "e7", type: "mcq", prompt: "Qual é 'noventa e três'?", options: ["73", "93", "39"], correct: "93" },
          { id: "e8", type: "mcq", prompt: "Qual é o mês de Christmas?", options: ["novembro", "dezembro", "janeiro"], correct: "dezembro" },
          
          // Production (typing)
          { id: "e9", type: "typing", prompt: "Escreve em dígitos: 'noventa e três'", correct: "93" },
          { id: "e10", type: "typing", prompt: "Escreve o mês: 'September'", correct: "setembro" },
          { id: "e11", type: "order", prompt: "Ordena: 'setembro é o mês'", correct: "setembro é o mês", items: ["setembro","é","o","mês"] },
        ],
      },
      {
        id: "mp2l2",
        title: "Datas e andares",
        xp: 25,
        content: {
          title: "Dates and Ordinal Numbers (Floors)",
          sections: [
            {
              title: "Ordinal Numbers (1st-10th)",
              explanation: "Ordinals show position or order. In Portugal, they're used for floors, dates, and rankings:",
              examples: [
                { pt: "primeiro/1.º", en: "first", note: "masc. form" },
                { pt: "primeira/1.ª", en: "first", note: "fem. form" },
                { pt: "segundo/2.º", en: "second", note: "segundo andar" },
                { pt: "terceiro/3.º", en: "third", note: "terceira vez" },
                { pt: "quarto/4.º", en: "fourth", note: "quarto andar" },
                { pt: "quinto/5.º", en: "fifth", note: "quinta porta" }
              ],
              keyPoints: [
                "Ordinals agree with gender: primeiro andar (masc.), primeira vez (fem.)",
                "Written forms: 1.º (masc.), 1.ª (fem.)",
                "Very common for floors and apartment numbers"
              ]
            },
            {
              title: "Floors and Buildings",
              explanation: "Portuguese building floors follow European convention - ground floor is not 'first':",
              examples: [
                { pt: "rés-do-chão/R/C", en: "ground floor", note: "at street level" },
                { pt: "primeiro andar/1.º", en: "first floor", note: "one level up" },
                { pt: "segundo andar/2.º", en: "second floor", note: "two levels up" },
                { pt: "terceiro andar/3.º", en: "third floor", note: "three levels up" }
              ],
              keyPoints: [
                "Ground floor ≠ first floor (European vs American system)",
                "Say 'Vivo no segundo andar' (I live on the second floor)",
                "Elevators show R/C, 1, 2, 3... not 1, 2, 3, 4..."
              ]
            },
            {
              title: "Writing Dates",
              explanation: "Portuguese dates follow day/month/year format with specific prepositions:",
              examples: [
                { pt: "5 de janeiro de 2025", en: "January 5th, 2025", note: "day de month de year" },
                { pt: "25 de dezembro", en: "December 25th", note: "Christmas" },
                { pt: "1 de maio", en: "May 1st", note: "Worker's Day" },
                { pt: "10 de junho", en: "June 10th", note: "Portugal Day" }
              ],
              keyPoints: [
                "Format: day + de + month + de + year",
                "Use cardinal numbers for days: cinco de janeiro (not quinto)",
                "Months are lowercase and use 'de'"
              ]
            },
            {
              title: "Saying Dates Aloud",
              explanation: "When speaking dates, Portuguese has specific patterns:",
              examples: [
                { pt: "cinco de setembro", en: "the fifth of September", note: "cardinal + de + month" },
                { pt: "vinte e cinco de dezembro", en: "the twenty-fifth of December", note: "compound numbers" },
                { pt: "primeiro de abril", en: "the first of April", note: "exception: use ordinal" },
                { pt: "dois mil e vinte e cinco", en: "two thousand and twenty-five", note: "year format" }
              ],
              keyPoints: [
                "Exception: 'primeiro' for 1st of the month",
                "All other dates use cardinal numbers",
                "Years: 'dois mil e vinte e cinco' (not twenty twenty-five)"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn ordinals (flashcards)
          { id: "e1", type: "flashcard", term: "primeiro andar", translation: "first floor" },
          { id: "e2", type: "flashcard", term: "segundo andar", translation: "second floor" },
          { id: "e3", type: "flashcard", term: "terceiro andar", translation: "third floor" },
          
          // Then: Recognition (MCQ)
          { id: "e4", type: "mcq", prompt: "Como se diz '2nd floor'?", options: ["segundo andar", "dois andar", "duas andares"], correct: "segundo andar" },
          { id: "e5", type: "mcq", prompt: "European 'ground floor' é:", options: ["primeiro andar", "rés-do-chão", "andar zero"], correct: "rés-do-chão" },
          
          // Production (typing)
          { id: "e6", type: "typing", prompt: "Escreve a data: 05/09/2025 (formato PT)", correct: "5 de setembro de 2025" },
          { id: "e7", type: "typing", prompt: "Escreve: 'primeiro andar' com ordinal", correct: "1.º andar" },
          { id: "e8", type: "typing", prompt: "Qual andar? 'third floor'", correct: "terceiro andar" },
        ],
      },
    ],
  },
  {
    id: "mp3",
    title: "Verbos Regulares no Presente",
    description: "Conjugações -ar/-er/-ir; rotina com frequência.",
    lessons: [
      {
        id: "mp3l1",
        title: "-ar/-er/-ir",
        xp: 25,
        content: {
          title: "Portuguese Regular Verb Conjugations",
          sections: [
            {
              title: "The Three Regular Verb Groups",
              explanation: "Portuguese verbs are divided into three groups based on their infinitive endings. Each group follows a predictable pattern:",
              examples: [
                { pt: "-ar verbs", en: "like 'falar' (to speak)", note: "largest group" },
                { pt: "-er verbs", en: "like 'comer' (to eat)", note: "medium group" },
                { pt: "-ir verbs", en: "like 'abrir' (to open)", note: "smallest group" }
              ],
              keyPoints: [
                "Remove the infinitive ending (-ar, -er, -ir)",
                "Add the correct present tense ending",
                "Each person (eu, tu, ele/ela, nós, vocês, eles/elas) has its own ending"
              ]
            },
            {
              title: "-AR Verbs Pattern (falar = to speak)",
              explanation: "The most common verb group. Here's how to conjugate -ar verbs:",
              examples: [
                { pt: "eu falo", en: "I speak", note: "add -o" },
                { pt: "tu falas", en: "you speak (informal)", note: "add -as" },
                { pt: "ele/ela fala", en: "he/she speaks", note: "add -a" },
                { pt: "nós falamos", en: "we speak", note: "add -amos" },
                { pt: "vocês falam", en: "you speak (plural)", note: "add -am" },
                { pt: "eles/elas falam", en: "they speak", note: "add -am" }
              ],
              keyPoints: [
                "Pattern: fal- + o/as/a/amos/am/am",
                "Same for: trabalhar → trabalho, estudar → estudo",
                "Always remove -ar first, then add endings"
              ]
            },
            {
              title: "-ER Verbs Pattern (comer = to eat)",
              explanation: "Second group - similar pattern with different endings:",
              examples: [
                { pt: "eu como", en: "I eat", note: "add -o" },
                { pt: "tu comes", en: "you eat", note: "add -es" },
                { pt: "ele/ela come", en: "he/she eats", note: "add -e" },
                { pt: "nós comemos", en: "we eat", note: "add -emos" },
                { pt: "vocês comem", en: "you eat (plural)", note: "add -em" },
                { pt: "eles/elas comem", en: "they eat", note: "add -em" }
              ]
            },
            {
              title: "-IR Verbs Pattern (abrir = to open)",
              explanation: "Third group - note the similarities with -er verbs:",
              examples: [
                { pt: "eu abro", en: "I open", note: "add -o" },
                { pt: "tu abres", en: "you open", note: "add -es" },
                { pt: "ele/ela abre", en: "he/she opens", note: "add -e" },
                { pt: "nós abrimos", en: "we open", note: "add -imos (different!)" },
                { pt: "vocês abrem", en: "you open (plural)", note: "add -em" },
                { pt: "eles/elas abrem", en: "they open", note: "add -em" }
              ],
              keyPoints: [
                "Only 'nós' form is different from -er verbs (-imos vs -emos)",
                "All other forms are identical to -er pattern"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn basic vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "falar", translation: "to speak" },
          { id: "e2", type: "flashcard", term: "comer", translation: "to eat" },
          { id: "e3", type: "flashcard", term: "abrir", translation: "to open" },
          
          // Then: Practice individual conjugations (guided)
          { id: "e4", type: "conjugation", prompt: "Conjuga 'falar' (nós)", correct: "falamos" },
          { id: "e5", type: "conjugation", prompt: "Conjuga 'comer' (tu)", correct: "comes" },
          { id: "e6", type: "conjugation", prompt: "Conjuga 'abrir' (eles)", correct: "abrem" },
          
          // Then: Practice recognition (MCQ)
          { id: "e7", type: "mcq", prompt: "Nós __ em casa (abrir)", options: ["abrimos","abrem","abro"], correct: "abrimos" },
          
          // Finally: Production (grid and sentences)
          { id: "e8", type: "conjugationGrid", prompt: "Completa 'falar' no presente", correct: ["falo","falas","fala","falamos","falam","falam"] },
          { id: "e9", type: "typing", prompt: "Escreve: 'Eles comem às oito.'", correct: "Eles comem às oito." },
        ],
      },
      {
        id: "mp3l2",
        title: "Rotina & frequência",
        xp: 25,
        content: {
          title: "Daily Routine and Frequency Expressions",
          sections: [
            {
              title: "Daily Routine Vocabulary",
              explanation: "Essential verbs for describing your daily activities:",
              examples: [
                { pt: "acordar", en: "to wake up", note: "eu acordo às sete" },
                { pt: "trabalhar", en: "to work", note: "nós trabalhamos" },
                { pt: "abrir", en: "to open", note: "ela abre a loja" },
                { pt: "almoçar", en: "to have lunch", note: "almoço ao meio-dia" },
                { pt: "jantar", en: "to have dinner", note: "jantamos às oito" }
              ],
              keyPoints: [
                "Use present tense for routine activities",
                "Add time expressions: às sete, ao meio-dia",
                "Portuguese meal times may differ from your culture"
              ]
            },
            {
              title: "Frequency Expressions",
              explanation: "How often you do activities - from never to always:",
              examples: [
                { pt: "sempre", en: "always", note: "Eu sempre acordo cedo" },
                { pt: "todos os dias", en: "every day", note: "position can vary" },
                { pt: "às vezes", en: "sometimes", note: "don't confuse with 'às' (at)" },
                { pt: "raramente", en: "rarely", note: "formal register" },
                { pt: "nunca", en: "never", note: "Nunca trabalho aos fins de semana" }
              ],
              keyPoints: [
                "Frequency words can go before or after the verb",
                "'Às vezes' = sometimes, 'às' = at (time)",
                "Use with present tense for habits"
              ]
            },
            {
              title: "Days of the Week",
              explanation: "Essential for describing weekly routines:",
              examples: [
                { pt: "segunda-feira", en: "Monday", note: "often shortened to 'segunda'" },
                { pt: "terça-feira", en: "Tuesday", note: "terça" },
                { pt: "quarta-feira", en: "Wednesday", note: "quarta" },
                { pt: "quinta-feira", en: "Thursday", note: "quinta" },
                { pt: "sexta-feira", en: "Friday", note: "sexta" },
                { pt: "sábado", en: "Saturday", note: "no 'feira'" },
                { pt: "domingo", en: "Sunday", note: "no 'feira'" }
              ],
              keyPoints: [
                "Use 'de... a...' for ranges: de segunda a sexta",
                "Weekend days don't use 'feira'",
                "Can say 'às segundas' for 'on Mondays'"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "sempre", translation: "always" },
          { id: "e2", type: "flashcard", term: "às vezes", translation: "sometimes" },
          { id: "e3", type: "flashcard", term: "nunca", translation: "never" },
          { id: "e4", type: "flashcard", term: "todos os dias", translation: "every day" },
          
          // Then: Recognition (MCQ)
          { id: "e5", type: "mcq", prompt: "Qual é 'às vezes'?", options: ["sempre","às vezes","nunca"], correct: "às vezes" },
          { id: "e6", type: "mcq", prompt: "Tu __ música (gostar)", options: ["gosta","gostas","gostam"], correct: "gostas" },
          
          // Then: Ordering sentences
          { id: "e7", type: "order", prompt: "Ordena a frase", correct: "Trabalhamos de segunda a sexta.", items: ["Trabalhamos","de","segunda","a","sexta."] },
          
          // Finally: Production
          { id: "e8", type: "typing", prompt: "Escreve: 'Eu acordo às sete todos os dias.'", correct: "Eu acordo às sete todos os dias." },
          { id: "e9", type: "typing", prompt: "Escreve: 'Ela abre a loja às nove.'", correct: "Ela abre a loja às nove." },
        ],
      },
    ],
  },
  // Additional A1 coverage (stubs)
  {
    id: "mp4",
    title: "Preposições & Contrações",
    description: "de/do/da; em/no/na; a/ao/à/às; por/pelo/pela; direções.",
    lessons: [
      { 
        id: "mp4l1", 
        title: "Contrações", 
        xp: 25, 
        content: {
          title: "Portuguese Preposition Contractions",
          sections: [
            {
              title: "What are Contractions?",
              explanation: "In Portuguese, prepositions (de, em, a, por) combine with articles (o, a, os, as) to form contractions. This is mandatory - you cannot say them separately!",
              examples: [
                { pt: "de + o = do", en: "of/from + the (masc.) = of/from the", note: "casa do João" },
                { pt: "de + a = da", en: "of/from + the (fem.) = of/from the", note: "chave da Maria" },
                { pt: "em + o = no", en: "in/on + the (masc.) = in/on the", note: "no supermercado" },
                { pt: "em + a = na", en: "in/on + the (fem.) = in/on the", note: "na farmácia" }
              ],
              keyPoints: [
                "Contractions are mandatory - never optional",
                "Gender of the noun determines which contraction to use",
                "Very common in everyday Portuguese"
              ]
            },
            {
              title: "DE Contractions (of/from)",
              explanation: "Used for possession, origin, material, and many fixed expressions:",
              examples: [
                { pt: "do banco", en: "from/of the bank (masc.)", note: "Saio do banco às cinco" },
                { pt: "da estação", en: "from/of the station (fem.)", note: "Venho da estação" },
                { pt: "dos pais", en: "from/of the parents", note: "Casa dos pais" },
                { pt: "das lojas", en: "from/of the shops", note: "Perto das lojas" }
              ]
            },
            {
              title: "EM Contractions (in/on/at)",
              explanation: "Used for location, time, and many expressions:",
              examples: [
                { pt: "no centro", en: "in the center (masc.)", note: "Vivo no centro" },
                { pt: "na cidade", en: "in the city (fem.)", note: "Trabalho na cidade" },
                { pt: "nos fins de semana", en: "on weekends", note: "Descanso nos fins de semana" },
                { pt: "nas férias", en: "during holidays", note: "Viajo nas férias" }
              ]
            },
            {
              title: "A Contractions (to/at)",
              explanation: "Used for direction, time, and indirect objects:",
              examples: [
                { pt: "ao banco", en: "to the bank (masc.)", note: "Vou ao banco" },
                { pt: "à estação", en: "to the station (fem.)", note: "Vamos à estação" },
                { pt: "aos pais", en: "to the parents", note: "Telefono aos pais" },
                { pt: "às nove", en: "at nine o'clock", note: "Chego às nove" }
              ],
              keyPoints: [
                "À (with accent) is feminine: à farmácia",
                "AO (no accent) is masculine: ao supermercado",
                "Very important for directions and time"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn the concept (flashcards)
          { id: "e1", type: "flashcard", term: "do", translation: "of/from the (masc.)" },
          { id: "e2", type: "flashcard", term: "da", translation: "of/from the (fem.)" },
          { id: "e3", type: "flashcard", term: "no", translation: "in/on the (masc.)" },
          { id: "e4", type: "flashcard", term: "na", translation: "in/on the (fem.)" },
          { id: "e5", type: "flashcard", term: "ao", translation: "to the (masc.)" },
          { id: "e6", type: "flashcard", term: "à", translation: "to the (fem.)" },
          
          // Then: Practice recognition (MCQ)
          { id: "e7", type: "mcq", prompt: "Escreve com contração: 'de + a'", options: ["do","da","na"], correct: "da" },
          { id: "e8", type: "mcq", prompt: "Vivo __ Lisboa", options: ["em","no","na"], correct: "em" },
          
          // Finally: Context application (directions)
          { id: "e9", type: "directions", prompt: "__ lado da farmácia", options: ["ao","à","do","da","no","na"], correct: "ao" },
          { id: "e10", type: "directions", prompt: "__ estação", options: ["à","ao","na"], correct: "à" },
          { id: "e11", type: "directions", prompt: "__ centro da cidade", options: ["no","na","ao"], correct: "no" },
        ]
      },
      { 
        id: "mp4l2", 
        title: "Mapa", 
        xp: 25, 
        content: {
          title: "Portuguese Directions and Map Navigation",
          sections: [
            {
              title: "Basic Direction Vocabulary",
              explanation: "Learning to give and understand directions is essential in Portugal. These are the core directional terms you'll need:",
              examples: [
                { pt: "à direita", en: "to the right", note: "feminine 'à' + direita" },
                { pt: "à esquerda", en: "to the left", note: "feminine 'à' + esquerda" },
                { pt: "em frente", en: "straight ahead", note: "also 'sempre em frente'" },
                { pt: "atrás", en: "behind", note: "atrás de (behind something)" },
                { pt: "ao lado de", en: "next to", note: "ao lado da farmácia" },
                { pt: "perto de", en: "near/close to", note: "perto do banco" },
                { pt: "longe de", en: "far from", note: "longe da estação" }
              ],
              keyPoints: [
                "Use contractions: ao lado do (masc.), ao lado da (fem.)",
                "Portuguese people give detailed directions with landmarks",
                "Always say 'obrigado' after receiving directions"
              ]
            },
            {
              title: "Movement and Navigation",
              explanation: "These verbs and phrases help you navigate through Portuguese cities:",
              examples: [
                { pt: "virar", en: "to turn", note: "vire à direita (turn right)" },
                { pt: "seguir", en: "to follow/continue", note: "siga em frente" },
                { pt: "atravessar", en: "to cross", note: "atravesse a rua" },
                { pt: "subir", en: "to go up", note: "suba a rua" },
                { pt: "descer", en: "to go down", note: "desça a rua" },
                { pt: "passar", en: "to pass by", note: "passe pela praça" }
              ],
              keyPoints: [
                "Use imperative for directions: vire, siga, atravesse",
                "Portuguese streets often go uphill/downhill",
                "Landmarks are more important than street names"
              ]
            },
            {
              title: "Common Places and Landmarks",
              explanation: "Portuguese directions often reference these common landmarks and places:",
              examples: [
                { pt: "banco", en: "bank", note: "always a reliable landmark" },
                { pt: "farmácia", en: "pharmacy", note: "green cross sign" },
                { pt: "supermercado", en: "supermarket", note: "often on main streets" },
                { pt: "estação", en: "station", note: "train/bus station" },
                { pt: "praça", en: "square", note: "town squares are central" },
                { pt: "igreja", en: "church", note: "common reference point" },
                { pt: "semáforo", en: "traffic light", note: "useful urban landmark" }
              ],
              keyPoints: [
                "Pharmacies have green crosses and are everywhere",
                "Town squares (praças) are central meeting points",
                "Banks often have distinctive architecture"
              ]
            },
            {
              title: "Asking for and Giving Directions",
              explanation: "Polite phrases for direction conversations:",
              examples: [
                { pt: "Com licença, onde fica...?", en: "Excuse me, where is...?", note: "polite way to ask" },
                { pt: "Como chego a...?", en: "How do I get to...?", note: "asking for route" },
                { pt: "Fica longe?", en: "Is it far?", note: "asking about distance" },
                { pt: "Pode repetir, por favor?", en: "Can you repeat, please?", note: "if you didn't understand" },
                { pt: "Muito obrigado/a!", en: "Thank you very much!", note: "always thank for help" }
              ],
              keyPoints: [
                "Always start with 'Com licença' to be polite",
                "Portuguese people are very helpful with directions",
                "Don't be afraid to ask for clarification"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn direction vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "à direita", translation: "to the right" },
          { id: "e2", type: "flashcard", term: "à esquerda", translation: "to the left" },
          { id: "e3", type: "flashcard", term: "em frente", translation: "straight ahead" },
          { id: "e4", type: "flashcard", term: "ao lado de", translation: "next to" },
          
          // Then: Learn landmarks (flashcards)
          { id: "e5", type: "flashcard", term: "banco", translation: "bank" },
          { id: "e6", type: "flashcard", term: "farmácia", translation: "pharmacy" },
          { id: "e7", type: "flashcard", term: "supermercado", translation: "supermarket" },
          
          // Practice with map navigation
          { id: "e8", type: "dirPath", prompt: "Segue até ao banco (à direita do supermercado)", pathNodes: [
            { id: 1, x: 0, y: 0, label: "Início" },
            { id: 2, x: 1, y: 0, label: "Rua" },
            { id: 3, x: 2, y: 0, label: "Banco" },
            { id: 4, x: 1, y: 1, label: "Supermerc." },
          ], pathEdges: [
            { from: 1, to: 2, label: "em" },
            { from: 2, to: 3, label: "ao" },
            { from: 2, to: 4, label: "ao" },
          ], correctPath: [1,2,3] },
          
          // Practice contractions in context
          { id: "e9", type: "directions", prompt: "O banco fica __ direita __ supermercado", options: ["à","ao","do","da"], correct: ["à","do"] },
          { id: "e10", type: "directions", prompt: "A farmácia fica __ lado __ estação", options: ["ao","à","do","da"], correct: ["ao","da"] },
          
          // Production (typing)
          { id: "e11", type: "typing", prompt: "Como perguntar educadamente: 'Where is the bank?'", correct: "Com licença, onde fica o banco?" },
        ]
      },
      { 
        id: "mp5l2", 
        title: "ir + inf", 
        xp: 25, 
        content: {
          title: "Future Plans with IR + Infinitive",
          sections: [
            {
              title: "Immediate Future Tense",
              explanation: "Portuguese uses 'ir + infinitive' to talk about future plans and intentions (like English 'going to'). This is much more common than the formal future tense:",
              examples: [
                { pt: "Vou estudar amanhã", en: "I'm going to study tomorrow", note: "planned action" },
                { pt: "Ela vai trabalhar", en: "She's going to work", note: "near future" },
                { pt: "Vamos sair hoje", en: "We're going to go out today", note: "group plan" },
                { pt: "Eles vão viajar", en: "They're going to travel", note: "future intention" }
              ],
              keyPoints: [
                "Use for planned actions and intentions",
                "More common than formal future tense",
                "Similar to English 'going to' structure"
              ]
            },
            {
              title: "Conjugating IR (to go)",
              explanation: "IR is an irregular verb, so you must memorize its forms. It's used constantly in Portuguese:",
              examples: [
                { pt: "eu vou", en: "I go/I'm going", note: "sounds like 'voh'" },
                { pt: "tu vais", en: "you go (informal)", note: "vais bem?" },
                { pt: "ele/ela vai", en: "he/she goes", note: "vai trabalhar" },
                { pt: "nós vamos", en: "we go", note: "vamos ao cinema" },
                { pt: "vocês vão", en: "you go (plural)", note: "formal/plural" },
                { pt: "eles/elas vão", en: "they go", note: "vão à praia" }
              ],
              keyPoints: [
                "IR is completely irregular - memorize all forms",
                "Used for movement AND future plans",
                "Practice: Onde vais? (Where are you going?)"
              ]
            },
            {
              title: "Future Formula: IR + Infinitive",
              explanation: "After conjugated IR, add any infinitive verb to express future actions:",
              examples: [
                { pt: "vou + comer", en: "I'm going to eat", note: "ir + infinitive" },
                { pt: "vais + dormir", en: "you're going to sleep", note: "future plan" },
                { pt: "vamos + viajar", en: "we're going to travel", note: "group intention" },
                { pt: "vão + estudar", en: "they're going to study", note: "planned activity" }
              ],
              keyPoints: [
                "Formula: IR + INFINITIVE",
                "Infinitive = base form: comer, dormir, estudar",
                "Can add time expressions: amanhã, hoje à noite"
              ]
            },
            {
              title: "Common Future Expressions",
              explanation: "These time expressions are often used with the immediate future:",
              examples: [
                { pt: "amanhã", en: "tomorrow", note: "Vou trabalhar amanhã" },
                { pt: "hoje à noite", en: "tonight", note: "Vamos jantar hoje à noite" },
                { pt: "no fim de semana", en: "on the weekend", note: "Vou descansar no fim de semana" },
                { pt: "na próxima semana", en: "next week", note: "Ela vai viajar na próxima semana" },
                { pt: "no verão", en: "in summer", note: "Vamos à praia no verão" }
              ],
              keyPoints: [
                "Add time expressions for clarity",
                "Use 'no' with weekends and seasons",
                "Portuguese future is very practical and specific"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn IR conjugation (flashcards)
          { id: "e1", type: "flashcard", term: "vou", translation: "I go/I'm going" },
          { id: "e2", type: "flashcard", term: "vais", translation: "you go" },
          { id: "e3", type: "flashcard", term: "vai", translation: "he/she goes" },
          { id: "e4", type: "flashcard", term: "vamos", translation: "we go" },
          { id: "e5", type: "flashcard", term: "vão", translation: "they go" },
          
          // Then: Learn future patterns (flashcards)
          { id: "e6", type: "flashcard", term: "vou estudar", translation: "I'm going to study" },
          { id: "e7", type: "flashcard", term: "vamos sair", translation: "we're going to go out" },
          
          // Practice recognition (MCQ)
          { id: "e8", type: "mcq", prompt: "Amanhã __ ao Porto (ir - nós)", options: ["vamos","vão","vou"], correct: "vamos" },
          { id: "e9", type: "mcq", prompt: "How do you say 'They're going to travel'?", options: ["Eles vão viajar","Eles são viajar","Eles estão viajar"], correct: "Eles vão viajar" },
          
          // Production (typing)
          { id: "e10", type: "typing", prompt: "Escreve: 'Vamos tomar um café.'", correct: "Vamos tomar um café." },
          { id: "e11", type: "typing", prompt: "Escreve: 'I'm going to work tomorrow.'", correct: "Vou trabalhar amanhã." },
          { id: "e12", type: "order", prompt: "Ordena", correct: "Vou comprar pão.", items: ["Vou","comprar","pão."] },
        ]
      },
    ],
  },
  {
    id: "mp6",
    title: "Pedidos & Conectores",
    description: "Queria/Podia + inf; e/mas/porque/por isso.",
    lessons: [
      { 
        id: "mp6l1", 
        title: "Pedidos", 
        xp: 25, 
        content: {
          title: "Making Polite Requests in Portuguese",
          sections: [
            {
              title: "Direct vs. Polite Requests",
              explanation: "Like in English, Portuguese has direct and polite ways to ask for things. Polite forms show respect and are essential in formal situations:",
              examples: [
                { pt: "Dá-me água.", en: "Give me water.", note: "direct/informal" },
                { pt: "Podes dar-me água?", en: "Can you give me water?", note: "casual polite" },
                { pt: "Podia dar-me água, por favor?", en: "Could you give me water, please?", note: "very polite" }
              ],
              keyPoints: [
                "Direct forms can sound rude in formal situations",
                "Always add 'por favor' (please) for politeness",
                "Match formality to the situation and person"
              ]
            },
            {
              title: "QUERIA - 'I would like'",
              explanation: "QUERIA is the conditional form of 'querer' (to want). It's much more polite than 'quero' (I want):",
              examples: [
                { pt: "Quero um café.", en: "I want a coffee.", note: "direct, can sound demanding" },
                { pt: "Queria um café.", en: "I would like a coffee.", note: "polite request" },
                { pt: "Queria dois bilhetes, por favor.", en: "I would like two tickets, please.", note: "formal situation" },
                { pt: "Queria falar com o gerente.", en: "I would like to speak with the manager.", note: "professional" }
              ],
              keyPoints: [
                "Use QUERIA instead of QUERO in formal situations",
                "Can be followed by nouns or infinitive verbs",
                "Essential for shops, restaurants, offices"
              ]
            },
            {
              title: "PODIA - 'Could you'",
              explanation: "PODIA is the conditional form of 'poder' (can). Use it to make polite requests for actions:",
              examples: [
                { pt: "Podes fechar a janela?", en: "Can you close the window?", note: "casual" },
                { pt: "Podia fechar a janela?", en: "Could you close the window?", note: "more polite" },
                { pt: "Podia ajudar-me, por favor?", en: "Could you help me, please?", note: "very polite" },
                { pt: "Podia repetir, por favor?", en: "Could you repeat, please?", note: "very useful phrase" }
              ],
              keyPoints: [
                "PODIA is more polite than PODES",
                "Always followed by infinitive verb",
                "Perfect for asking favors or help"
              ]
            },
            {
              title: "Adding Politeness",
              explanation: "Make your requests even more polite with these additions:",
              examples: [
                { pt: "por favor", en: "please", note: "essential for politeness" },
                { pt: "se faz favor", en: "if you please", note: "very formal" },
                { pt: "obrigado/obrigada", en: "thank you", note: "after receiving help" },
                { pt: "com licença", en: "excuse me", note: "to get attention" },
                { pt: "desculpe", en: "excuse me/sorry", note: "formal apology" }
              ],
              keyPoints: [
                "Always say 'obrigado' (m.) or 'obrigada' (f.) after help",
                "'Com licença' to get someone's attention",
                "'Desculpe' for formal situations"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn polite vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "queria", translation: "I would like" },
          { id: "e2", type: "flashcard", term: "podia", translation: "could you" },
          { id: "e3", type: "flashcard", term: "por favor", translation: "please" },
          { id: "e4", type: "flashcard", term: "com licença", translation: "excuse me" },
          
          // Then: Practice transforming direct to polite (typing)
          { id: "e5", type: "typing", prompt: "Polido: Quero um café →", correct: "Queria um café, por favor." },
          { id: "e6", type: "typing", prompt: "Polido: Pode fechar a janela? → (usar 'Podia')", correct: "Podia fechar a janela, por favor?" },
          
          // Recognition (MCQ)
          { id: "e7", type: "mcq", prompt: "Escolhe a melhor versão", options: ["Dá-me água.", "Podia dar-me água, por favor?"], correct: "Podia dar-me água, por favor?" },
          { id: "e8", type: "mcq", prompt: "How do you politely ask for help?", options: ["Ajuda-me!", "Podia ajudar-me, por favor?"], correct: "Podia ajudar-me, por favor?" },
          
          // Production (typing)
          { id: "e9", type: "typing", prompt: "Escreve pedido polido: 'I would like a coffee, please.'", correct: "Queria um café, por favor." },
          { id: "e10", type: "typing", prompt: "Escreve: 'Could you repeat, please?'", correct: "Podia repetir, por favor?" },
        ]
      },
      { 
        id: "mp6l2", 
        title: "Conectores", 
        xp: 25, 
        content: {
          title: "Portuguese Connectors and Logical Links",
          sections: [
            {
              title: "Basic Connectors",
              explanation: "Connectors link ideas and show relationships between thoughts. They make your Portuguese sound more natural and fluent:",
              examples: [
                { pt: "e", en: "and", note: "connects similar ideas" },
                { pt: "mas", en: "but", note: "shows contrast" },
                { pt: "ou", en: "or", note: "shows alternatives" },
                { pt: "porque", en: "because", note: "gives reasons" },
                { pt: "por isso", en: "therefore/so", note: "shows results" }
              ],
              keyPoints: [
                "Connectors make speech flow naturally",
                "Each connector has a specific logical function",
                "Portuguese uses more connectors than English"
              ]
            },
            {
              title: "Contrast and Opposition",
              explanation: "These connectors show contrast, opposition, or unexpected results:",
              examples: [
                { pt: "mas", en: "but", note: "Gosto de café, mas não bebo à noite" },
                { pt: "porém", en: "however", note: "more formal than 'mas'" },
                { pt: "contudo", en: "nevertheless", note: "formal, written Portuguese" },
                { pt: "embora", en: "although", note: "requires subjunctive" }
              ],
              keyPoints: [
                "'Mas' is the most common contrast connector",
                "'Porém' sounds more educated",
                "Use appropriate formality for the situation"
              ]
            },
            {
              title: "Cause and Effect",
              explanation: "Show reasons and results with these logical connectors:",
              examples: [
                { pt: "porque", en: "because", note: "Estudo porque quero trabalhar em Portugal" },
                { pt: "por isso", en: "therefore/that's why", note: "Está a chover, por isso fico em casa" },
                { pt: "então", en: "so/then", note: "informal, conversational" },
                { pt: "assim", en: "thus/this way", note: "more formal" }
              ],
              keyPoints: [
                "'Porque' gives direct reasons",
                "'Por isso' shows logical consequences",
                "Position affects meaning and emphasis"
              ]
            },
            {
              title: "Addition and Sequence",
              explanation: "Add information and show sequence with these connectors:",
              examples: [
                { pt: "e", en: "and", note: "basic addition" },
                { pt: "também", en: "also/too", note: "Eu também gosto de música" },
                { pt: "além disso", en: "besides/moreover", note: "formal addition" },
                { pt: "primeiro", en: "first", note: "shows sequence" },
                { pt: "depois", en: "then/after", note: "time sequence" },
                { pt: "finalmente", en: "finally", note: "concludes sequence" }
              ],
              keyPoints: [
                "Use sequencing for clear explanations",
                "'Também' agrees with verb placement",
                "Formal vs. informal connectors"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn basic connectors (flashcards)
          { id: "e1", type: "flashcard", term: "mas", translation: "but" },
          { id: "e2", type: "flashcard", term: "porque", translation: "because" },
          { id: "e3", type: "flashcard", term: "por isso", translation: "therefore/so" },
          { id: "e4", type: "flashcard", term: "também", translation: "also/too" },
          
          // Then: Practice logical connections (MCQ)
          { id: "e5", type: "mcq", prompt: "Está a chover, ___ fico em casa.", options: ["mas","por isso","ou"], correct: "por isso" },
          { id: "e6", type: "mcq", prompt: "Gosto de café, ___ não bebo à noite.", options: ["mas","e","por isso"], correct: "mas" },
          { id: "e7", type: "mcq", prompt: "Choose the best connector: 'I study ___ I want to work in Portugal.'", options: ["mas","porque","por isso"], correct: "porque" },
          
          // Production (typing and ordering)
          { id: "e8", type: "typing", prompt: "Connect with 'mas': 'I like coffee' + 'I don't drink at night'", correct: "Gosto de café, mas não bebo à noite." },
          { id: "e9", type: "typing", prompt: "Connect with 'porque': 'I study' + 'I want to work'", correct: "Estudo porque quero trabalhar." },
          { id: "e10", type: "order", prompt: "Ordena", correct: "Estudo porque quero trabalhar em Portugal.", items: ["Estudo","porque","quero","trabalhar","em","Portugal."] },
        ]
      },
    ],
  },
  {
    id: "mp7",
    title: "Profissões & Lazer",
    description: "Sou..., trabalho em...; hobbies; gostar de + inf.",
    lessons: [
      { id: "mp7l1", title: "Trabalho", xp: 25, exercises: [
        { id: "e1", type: "flashcard", term: "enfermeira", translation: "nurse (f.)" },
        { id: "e2", type: "typing", prompt: "Escreve: 'Sou programador. Trabalho em Lisboa.'", correct: "Sou programador. Trabalho em Lisboa." },
        { id: "e3", type: "mcq", prompt: "Ela __ professora.", options: ["é","está","sou"], correct: "é" },
        { id: "e4", type: "order", prompt: "Ordena", correct: "Trabalho das nove às cinco.", items: ["Trabalho","das","nove","às","cinco."] },
      ]},
      { id: "mp7l2", title: "Lazer", xp: 25, exercises: [
        { id: "e1", type: "typing", prompt: "Gosto de __ (run) ao fim de semana.", correct: "correr" },
        { id: "e2", type: "mcq", prompt: "Queres ir ao cinema? —", options: ["Quero","Podia","Vamos"], correct: "Vamos" },
        { id: "e3", type: "order", prompt: "Ordena", correct: "Não posso porque trabalho amanhã.", items: ["Não","posso","porque","trabalho","amanhã."] },
      ]},
    ],
  },
  {
    id: "mp8",
    title: "Corpo & Formulários",
    description: "Vocabulário do corpo; 'Tenho dor de…'; formulário (dados pessoais).",
    lessons: [
      { 
        id: "mp8l1", 
        title: "Partes do corpo", 
        xp: 25, 
        content: {
          title: "Body Parts and Basic Health Vocabulary",
          sections: [
            {
              title: "Essential Body Parts",
              explanation: "Learning body parts is crucial for health situations, doctor visits, and describing problems. These are the most important ones:",
              examples: [
                { pt: "cabeça", en: "head", note: "a cabeça" },
                { pt: "olhos", en: "eyes", note: "plural: os olhos" },
                { pt: "boca", en: "mouth", note: "a boca" },
                { pt: "mão", en: "hand", note: "irregular plural: as mãos" },
                { pt: "pé", en: "foot", note: "irregular plural: os pés" },
                { pt: "braço", en: "arm", note: "o braço" },
                { pt: "perna", en: "leg", note: "a perna" }
              ],
              keyPoints: [
                "Some plurals are irregular: mão→mãos, pé→pés",
                "Body parts are usually used with definite articles",
                "Important for medical situations"
              ]
            },
            {
              title: "Internal Body Parts",
              explanation: "These internal parts are important for describing health problems:",
              examples: [
                { pt: "estômago", en: "stomach", note: "o estômago" },
                { pt: "coração", en: "heart", note: "o coração" },
                { pt: "garganta", en: "throat", note: "a garganta" },
                { pt: "costas", en: "back", note: "always plural: as costas" },
                { pt: "dente", en: "tooth", note: "plural: os dentes" },
                { pt: "ouvido", en: "ear (internal)", note: "o ouvido" }
              ],
              keyPoints: [
                "'Costas' is always plural in Portuguese",
                "Distinguish ouvido (internal) vs orelha (external ear)",
                "Essential for pharmacy visits"
              ]
            },
            {
              title: "Expressing Pain and Problems",
              explanation: "Learn to describe pain and health problems - very important for living in Portugal:",
              examples: [
                { pt: "Tenho dor de cabeça", en: "I have a headache", note: "ter dor de + body part" },
                { pt: "Dói-me o estômago", en: "My stomach hurts", note: "doer construction" },
                { pt: "Tenho dor de garganta", en: "I have a sore throat", note: "common complaint" },
                { pt: "Dói-me aqui", en: "It hurts here", note: "pointing to location" },
                { pt: "Não me sinto bem", en: "I don't feel well", note: "general illness" }
              ],
              keyPoints: [
                "Two patterns: 'Tenho dor de...' and 'Dói-me...'",
                "Very useful at pharmacies and doctors",
                "Portuguese healthcare is excellent"
              ]
            },
            {
              title: "At the Pharmacy",
              explanation: "Portuguese pharmacies (farmácias) are everywhere and pharmacists can help with minor health issues:",
              examples: [
                { pt: "farmácia", en: "pharmacy", note: "green cross sign" },
                { pt: "medicamento", en: "medicine", note: "general term" },
                { pt: "comprimido", en: "pill/tablet", note: "solid medicine" },
                { pt: "pomada", en: "ointment/cream", note: "topical medicine" },
                { pt: "receita", en: "prescription", note: "from doctor" },
                { pt: "sem receita", en: "over-the-counter", note: "no prescription needed" }
              ],
              keyPoints: [
                "Pharmacies can help with minor problems",
                "Green cross indicates pharmacy",
                "Many medicines available without prescription"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn basic body parts (flashcards)
          { id: "e1", type: "flashcard", term: "cabeça", translation: "head" },
          { id: "e2", type: "flashcard", term: "mão", translation: "hand" },
          { id: "e3", type: "flashcard", term: "pé", translation: "foot" },
          { id: "e4", type: "flashcard", term: "garganta", translation: "throat" },
          { id: "e5", type: "flashcard", term: "costas", translation: "back" },
          
          // Then: Learn pain expressions (flashcards)
          { id: "e6", type: "flashcard", term: "dor de cabeça", translation: "headache" },
          { id: "e7", type: "flashcard", term: "dor de garganta", translation: "sore throat" },
          
          // Practice health expressions (MCQ)
          { id: "e8", type: "mcq", prompt: "Tradução: 'ombro'", options: ["shoulder","knee","elbow"], correct: "shoulder" },
          { id: "e9", type: "mcq", prompt: "How do you say 'I have a headache'?", options: ["Tenho dor de cabeça","Dói-me cabeça","Tenho cabeça"], correct: "Tenho dor de cabeça" },
          
          // Production (typing)
          { id: "e10", type: "typing", prompt: "Tenho dor de __ (back)", correct: "costas" },
          { id: "e11", type: "typing", prompt: "Escreve: 'My stomach hurts.'", correct: "Dói-me o estômago." },
          { id: "e12", type: "typing", prompt: "Escreve: 'I don't feel well.'", correct: "Não me sinto bem." },
        ]
      },
      { 
        id: "mp8l2", 
        title: "Formulário", 
        xp: 25, 
        content: {
          title: "Forms and Personal Information",
          sections: [
            {
              title: "Personal Data Fields",
              explanation: "Portuguese bureaucracy requires many forms. Learn the essential fields you'll encounter everywhere:",
              examples: [
                { pt: "nome", en: "first name", note: "primeiro nome" },
                { pt: "apelido", en: "surname/last name", note: "family name" },
                { pt: "morada", en: "address", note: "European Portuguese term" },
                { pt: "código postal", en: "postal code", note: "format: 1234-567" },
                { pt: "nacionalidade", en: "nationality", note: "portuguesa, americana, etc." },
                { pt: "data de nascimento", en: "date of birth", note: "DD/MM/YYYY format" }
              ],
              keyPoints: [
                "Portuguese postal codes: 4 digits + 3 digits",
                "Date format is DD/MM/YYYY (European style)",
                "'Morada' is specifically Portuguese (not 'endereço')"
              ]
            },
            {
              title: "Contact Information",
              explanation: "Essential contact details for any official form in Portugal:",
              examples: [
                { pt: "telemóvel", en: "mobile phone", note: "also 'telemóvel' or 'móvel'" },
                { pt: "telefone", en: "phone", note: "landline phone" },
                { pt: "email", en: "email", note: "international term" },
                { pt: "número de telefone", en: "phone number", note: "full phrase" },
                { pt: "contacto", en: "contact", note: "general contact info" }
              ],
              keyPoints: [
                "'Telemóvel' is Portuguese for mobile phone",
                "Portuguese phone numbers have 9 digits",
                "Email is universal but say 'correio eletrónico' formally"
              ]
            },
            {
              title: "Portuguese Postal System",
              explanation: "Understanding Portuguese addresses and postal codes:",
              examples: [
                { pt: "rua", en: "street", note: "Rua das Flores" },
                { pt: "avenida", en: "avenue", note: "Avenida da Liberdade" },
                { pt: "número", en: "number", note: "house/building number" },
                { pt: "andar", en: "floor", note: "apartment floor" },
                { pt: "código postal", en: "postal code", note: "1234-567 Lisboa" },
                { pt: "cidade", en: "city", note: "Lisboa, Porto, etc." }
              ],
              keyPoints: [
                "Format: Street, Number, Floor, Postal Code City",
                "Portuguese postal codes are very specific",
                "Always include city name after postal code"
              ]
            },
            {
              title: "Form Instructions and Validation",
              explanation: "Common instructions and requirements on Portuguese forms:",
              examples: [
                { pt: "preencher", en: "to fill out", note: "Preencha o formulário" },
                { pt: "obrigatório", en: "required/mandatory", note: "campo obrigatório" },
                { pt: "opcional", en: "optional", note: "not required" },
                { pt: "confirmar", en: "to confirm", note: "confirm information" },
                { pt: "submeter", en: "to submit", note: "submit form" },
                { pt: "válido", en: "valid", note: "documento válido" }
              ],
              keyPoints: [
                "Red asterisk (*) usually means required",
                "Always double-check before submitting",
                "Keep copies of important forms"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn form vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "nome", translation: "first name" },
          { id: "e2", type: "flashcard", term: "apelido", translation: "surname" },
          { id: "e3", type: "flashcard", term: "morada", translation: "address" },
          { id: "e4", type: "flashcard", term: "código postal", translation: "postal code" },
          { id: "e5", type: "flashcard", term: "telemóvel", translation: "mobile phone" },
          
          // Then: Learn contact info (flashcards)
          { id: "e6", type: "flashcard", term: "nacionalidade", translation: "nationality" },
          { id: "e7", type: "flashcard", term: "data de nascimento", translation: "date of birth" },
          
          // Practice form filling (form exercise)
          { id: "e8", type: "form", prompt: "Preenche os campos" },
          
          // Production (typing)
          { id: "e9", type: "typing", prompt: "Escreve o formato do código postal português: ____-___", correct: "1234-567" },
          { id: "e10", type: "typing", prompt: "How do you say 'required field'?", correct: "campo obrigatório" },
          { id: "e11", type: "typing", prompt: "Escreve: 'Fill out the form.'", correct: "Preencha o formulário." },
        ]
      },
    ],
  },
  // Existing modules below
  {
    id: "m1",
    title: "Basics: Greetings & Introductions",
    description: "Learn to greet, introduce yourself, and be polite in European Portuguese.",
    lessons: [
      {
        id: "m1l1",
        title: "Olá! Cumprimentos",
        xp: 20,
        content: {
          title: "Portuguese Greetings and Basic Politeness",
          sections: [
            {
              title: "Basic Greetings",
              explanation: "Portuguese greetings are used differently depending on the time of day. Learning when to use each one shows respect and cultural awareness:",
              examples: [
                { pt: "Olá", en: "Hello", note: "universal greeting, any time" },
                { pt: "Bom dia", en: "Good morning", note: "until around 12:00" },
                { pt: "Boa tarde", en: "Good afternoon", note: "12:00 until sunset (~18:00)" },
                { pt: "Boa noite", en: "Good evening/night", note: "after sunset" }
              ],
              keyPoints: [
                "Olá = universal, but time-specific greetings are more polite",
                "Portuguese people are formal with strangers",
                "Always greet shopkeepers, neighbors, and service workers"
              ]
            },
            {
              title: "Time-Based Greetings",
              explanation: "Portuguese culture values proper timing of greetings. Using the wrong greeting can sound odd or impolite:",
              examples: [
                { pt: "Bom dia!", en: "Good morning!", note: "7:00 AM - 12:00 PM" },
                { pt: "Boa tarde!", en: "Good afternoon!", note: "12:00 PM - 6:00 PM" },
                { pt: "Boa noite!", en: "Good evening!", note: "after 6:00 PM" },
                { pt: "Boa noite!", en: "Good night!", note: "when leaving at night" }
              ],
              keyPoints: [
                "Morning ends at noon (not 11 AM like some cultures)",
                "Evening starts around 18:00 (6 PM)",
                "Boa noite serves as both 'good evening' and 'good night'"
              ]
            },
            {
              title: "Essential Politeness Words",
              explanation: "These basic politeness words are used in every conversation. They show respect and good manners:",
              examples: [
                { pt: "Por favor", en: "Please", note: "when asking for something" },
                { pt: "Obrigado", en: "Thank you (said by males)", note: "masculine form" },
                { pt: "Obrigada", en: "Thank you (said by females)", note: "feminine form" },
                { pt: "De nada", en: "You're welcome", note: "response to obrigado/a" }
              ],
              keyPoints: [
                "Your gender determines obrigado (M) vs obrigada (F)",
                "Always say 'por favor' when requesting",
                "'De nada' literally means 'of nothing'"
              ]
            },
            {
              title: "Cultural Tips",
              explanation: "Understanding Portuguese greeting culture helps you make a good impression:",
              examples: [
                { pt: "Com licença", en: "Excuse me (to get attention)", note: "formal and polite" },
                { pt: "Desculpe", en: "Excuse me/Sorry (formal)", note: "for apologies" },
                { pt: "Tchau", en: "Bye (informal)", note: "with friends/family" },
                { pt: "Até logo", en: "See you later", note: "more formal goodbye" }
              ],
              keyPoints: [
                "Portuguese people shake hands when meeting",
                "Use formal greetings with older people and strangers",
                "In shops/restaurants, always greet before asking for something"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn basic greetings (flashcards)
          { id: "e1", type: "flashcard", term: "Olá", translation: "Hello" },
          { id: "e2", type: "flashcard", term: "Bom dia", translation: "Good morning" },
          { id: "e3", type: "flashcard", term: "Boa tarde", translation: "Good afternoon" },
          { id: "e4", type: "flashcard", term: "Boa noite", translation: "Good evening / Good night" },
          
          // Then: Learn politeness words (flashcards)
          { id: "e5", type: "flashcard", term: "Por favor", translation: "Please" },
          { id: "e6", type: "flashcard", term: "Obrigado", translation: "Thank you (said by males)" },
          { id: "e7", type: "flashcard", term: "Obrigada", translation: "Thank you (said by females)" },
          
          // Practice recognition (MCQ)
          { id: "e8", type: "mcq", prompt: "How do you say Good morning?", options: ["Boa noite", "Bom dia", "Olá"], correct: "Bom dia" },
          { id: "e9", type: "mcq", prompt: "What greeting for 3 PM?", options: ["Bom dia", "Boa tarde", "Boa noite"], correct: "Boa tarde" },
          
          // Production (typing and listening)
          { id: "e10", type: "typing", prompt: "Type the translation: 'Olá'", correct: "Hello" },
          { id: "e11", type: "listening", audioTextPt: "Olá, bom dia!", prompt: "Type what you hear (PT-PT)", correct: "Olá, bom dia!" },
          { id: "e12", type: "matching", pairs: [ { a: "Olá", b: "Hello" }, { a: "Obrigado", b: "Thank you" }, { a: "Por favor", b: "Please" } ] },
        ],
      },
      {
        id: "m1l2",
        title: "Apresentações",
        xp: 25,
        content: {
          title: "Introductions and Meeting People",
          sections: [
            {
              title: "Asking and Giving Names",
              explanation: "Introductions are crucial for making connections in Portugal. Learn the polite ways to ask for and give names:",
              examples: [
                { pt: "Como te chamas?", en: "What is your name? (informal)", note: "to friends, young people" },
                { pt: "Como se chama?", en: "What is your name? (formal)", note: "to older people, strangers" },
                { pt: "Chamo-me...", en: "My name is...", note: "standard response" },
                { pt: "O meu nome é...", en: "My name is...", note: "more formal alternative" }
              ],
              keyPoints: [
                "Use 'te' for informal, 'se' for formal situations",
                "'Chamo-me' is more common than 'O meu nome é'",
                "Always respond politely when asked your name"
              ]
            },
            {
              title: "Expressing Pleasure in Meeting",
              explanation: "After introductions, Portuguese people express pleasure in meeting. This shows good manners:",
              examples: [
                { pt: "Prazer", en: "Nice to meet you", note: "most common response" },
                { pt: "Muito prazer", en: "Very nice to meet you", note: "more enthusiastic" },
                { pt: "O prazer é meu", en: "The pleasure is mine", note: "polite response" },
                { pt: "Igualmente", en: "Likewise", note: "responding to 'prazer'" }
              ],
              keyPoints: [
                "'Prazer' is essential in introductions",
                "Portuguese people value these courtesies",
                "Always respond when someone says 'prazer'"
              ]
            },
            {
              title: "Asking Where Someone Is From",
              explanation: "Portuguese people are curious about origins, especially with foreigners:",
              examples: [
                { pt: "De onde és?", en: "Where are you from? (informal)", note: "with friends" },
                { pt: "De onde é?", en: "Where are you from? (formal)", note: "polite form" },
                { pt: "Sou de...", en: "I am from...", note: "basic response" },
                { pt: "Sou americano/americana", en: "I am American", note: "nationality" },
                { pt: "Sou do Brasil", en: "I am from Brazil", note: "with 'do' for countries" }
              ],
              keyPoints: [
                "Use SER for permanent origin",
                "Nationality adjectives agree with gender",
                "Portuguese people love talking about different countries"
              ]
            },
            {
              title: "Cultural Context of Introductions",
              explanation: "Understanding Portuguese social customs for introductions:",
              examples: [
                { pt: "aperto de mão", en: "handshake", note: "standard greeting" },
                { pt: "dois beijinhos", en: "two kisses on cheeks", note: "between women, women-men" },
                { pt: "senhor/senhora", en: "sir/madam", note: "with older people" },
                { pt: "doutor/doutora", en: "doctor (academic title)", note: "shows respect" }
              ],
              keyPoints: [
                "Handshakes are standard in business",
                "Two air kisses common socially",
                "Use titles with older or professional people"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn introduction vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "Como te chamas?", translation: "What is your name?" },
          { id: "e2", type: "flashcard", term: "Chamo-me…", translation: "My name is…" },
          { id: "e3", type: "flashcard", term: "Prazer", translation: "Nice to meet you" },
          { id: "e4", type: "flashcard", term: "De onde és?", translation: "Where are you from?" },
          
          // Then: Practice responses (MCQ)
          { id: "e5", type: "mcq", prompt: "Translate: 'Prazer'", options: ["Please", "Nice to meet you", "Excuse me"], correct: "Nice to meet you" },
          { id: "e6", type: "mcq", prompt: "Formal way to ask someone's name:", options: ["Como te chamas?", "Como se chama?", "Qual é o nome?"], correct: "Como se chama?" },
          
          // Production (typing)
          { id: "e7", type: "typing", prompt: "Type in Portuguese: 'My name is Ana.'", correct: "Chamo-me Ana." },
          { id: "e8", type: "typing", prompt: "Type: 'I am from America.'", correct: "Sou da América." },
          { id: "e9", type: "order", correct: "Como te chamas?", items: ["Como","te","chamas?"] },
        ],
      },
      {
        id: "m1l3",
        title: "Formalidade e Cortesia",
        xp: 25,
        content: {
          title: "Formality and Courtesy in Portuguese",
          sections: [
            {
              title: "Formal vs. Informal You",
              explanation: "Portuguese has different levels of formality. Knowing when to use each shows cultural awareness:",
              examples: [
                { pt: "tu", en: "you (informal)", note: "friends, family, young people" },
                { pt: "você", en: "you (formal)", note: "strangers, older people, business" },
                { pt: "o senhor/a senhora", en: "sir/madam", note: "very formal, respectful" },
                { pt: "Como estás?", en: "How are you? (informal)", note: "with 'tu'" },
                { pt: "Como está?", en: "How are you? (formal)", note: "with 'você'" }
              ],
              keyPoints: [
                "When in doubt, use formal forms",
                "Young people often use 'tu' immediately",
                "Business situations require formal address"
              ]
            },
            {
              title: "Apologizing and Excusing",
              explanation: "Portuguese people are very polite. Learn to apologize appropriately:",
              examples: [
                { pt: "Desculpe", en: "Excuse me/Sorry (formal)", note: "for strangers, mistakes" },
                { pt: "Desculpa", en: "Sorry (informal)", note: "for friends, minor things" },
                { pt: "Com licença", en: "Excuse me (to pass)", note: "getting through crowds" },
                { pt: "Peço desculpa", en: "I apologize", note: "formal apology" }
              ],
              keyPoints: [
                "'Desculpe' is safer when unsure",
                "'Com licença' to get attention politely",
                "Portuguese people appreciate politeness"
              ]
            },
            {
              title: "Formal Titles and Address",
              explanation: "Portuguese culture values titles and proper address:",
              examples: [
                { pt: "senhor", en: "sir/mister", note: "for older men" },
                { pt: "senhora", en: "madam/mrs.", note: "for older women" },
                { pt: "doutor/doutora", en: "doctor", note: "for university graduates" },
                { pt: "professor/professora", en: "professor", note: "for teachers" },
                { pt: "engenheiro/engenheira", en: "engineer", note: "professional title" }
              ],
              keyPoints: [
                "Professional titles show respect",
                "'Doutor' is used broadly for educated people",
                "When unsure, use senhor/senhora"
              ]
            },
            {
              title: "Situational Formality",
              explanation: "When to use formal vs. informal language:",
              examples: [
                { pt: "no trabalho", en: "at work", note: "usually formal initially" },
                { pt: "na loja", en: "in shops", note: "formal with staff" },
                { pt: "com amigos", en: "with friends", note: "informal" },
                { pt: "com família", en: "with family", note: "informal" },
                { pt: "na universidade", en: "at university", note: "formal with professors" }
              ],
              keyPoints: [
                "Start formal, wait to be invited to informal",
                "Age difference often determines formality",
                "Portuguese people will guide you"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn formality vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "Desculpe", translation: "Excuse me (formal)" },
          { id: "e2", type: "flashcard", term: "Desculpa", translation: "Sorry (informal)" },
          { id: "e3", type: "flashcard", term: "Com licença", translation: "Excuse me (to pass)" },
          { id: "e4", type: "flashcard", term: "senhor", translation: "sir" },
          { id: "e5", type: "flashcard", term: "senhora", translation: "madam" },
          { id: "e6", type: "flashcard", term: "você", translation: "you (formal)" },
          
          // Then: Practice formal recognition (MCQ)
          { id: "e7", type: "mcq", prompt: "Which is formal?", options: ["Desculpa","Desculpe"], correct: "Desculpe" },
          { id: "e8", type: "mcq", prompt: "To ask 'How are you?' formally:", options: ["Como estás?","Como está?","Como é?"], correct: "Como está?" },
          
          // Production (typing)
          { id: "e9", type: "typing", prompt: "Type in PT: 'Please'", correct: "Por favor" },
          { id: "e10", type: "typing", prompt: "Formal apology: 'I apologize'", correct: "Peço desculpa." },
          
          // Cultural practice (matching and dialogue)
          { id: "e11", type: "matching", pairs: [ { a: "senhor", b: "sir" }, { a: "senhora", b: "madam" }, { a: "você", b: "you (formal)" } ] },
          { id: "e12", type: "dialogue", dialogue: [
            { pt: "Olá, boa tarde!" },
            { choice: [ { text: "Boa tarde!", good: true }, { text: "Adeus!", good: false } ] },
            { pt: "Como se chama?" },
            { choice: [ { text: "Chamo-me Alex.", good: true }, { text: "Tenho vinte anos.", good: false } ] },
          ] },
        ],
      },
    ],
  },
  {
    id: "m2",
    title: "Numbers & Basic Info",
    description: "Count, say your age, and talk about where you're from.",
    lessons: [
      {
        id: "m2l1",
        title: "Números 0–20",
        xp: 20,
        content: {
          title: "Numbers 0-20 and Basic Counting",
          sections: [
            {
              title: "Numbers 0-10",
              explanation: "These basic numbers are essential for everything - age, time, prices, phone numbers. Master these first:",
              examples: [
                { pt: "zero", en: "zero", note: "pronounced 'ZEH-ro'" },
                { pt: "um", en: "one (masculine)", note: "um homem" },
                { pt: "uma", en: "one (feminine)", note: "uma mulher" },
                { pt: "dois", en: "two (masculine)", note: "dois livros" },
                { pt: "duas", en: "two (feminine)", note: "duas casas" },
                { pt: "três", en: "three", note: "same for both genders" },
                { pt: "quatro", en: "four", note: "KWA-tro" },
                { pt: "cinco", en: "five", note: "SING-ko" },
                { pt: "seis", en: "six", note: "saysh" },
                { pt: "sete", en: "seven", note: "SEH-te" },
                { pt: "oito", en: "eight", note: "OY-to" },
                { pt: "nove", en: "nine", note: "NOH-ve" },
                { pt: "dez", en: "ten", note: "dezh" }
              ],
              keyPoints: [
                "Um/uma and dois/duas agree with gender",
                "All other numbers 3-20 are invariable",
                "Practice pronunciation - Portuguese numbers sound different!"
              ]
            },
            {
              title: "Numbers 11-20",
              explanation: "These numbers complete the basic set. Note some patterns and irregularities:",
              examples: [
                { pt: "onze", en: "eleven", note: "ON-ze" },
                { pt: "doze", en: "twelve", note: "DOH-ze" },
                { pt: "treze", en: "thirteen", note: "TREH-ze" },
                { pt: "catorze", en: "fourteen", note: "ka-TOR-ze" },
                { pt: "quinze", en: "fifteen", note: "KING-ze" },
                { pt: "dezasseis", en: "sixteen", note: "European Portuguese" },
                { pt: "dezassete", en: "seventeen", note: "dez + sete" },
                { pt: "dezoito", en: "eighteen", note: "dez + oito" },
                { pt: "dezanove", en: "nineteen", note: "dez + nove" },
                { pt: "vinte", en: "twenty", note: "VIN-te" }
              ],
              keyPoints: [
                "16-19 combine 'dez' + the unit number",
                "European Portuguese says 'dezasseis' (not 'dezesseis')",
                "These are completely irregular - must memorize"
              ]
            },
            {
              title: "Using Numbers in Context",
              explanation: "Numbers aren't just for counting - they're used in many daily situations:",
              examples: [
                { pt: "Tenho vinte anos", en: "I am twenty years old", note: "age with 'ter'" },
                { pt: "São três euros", en: "It's three euros", note: "prices" },
                { pt: "A que horas?", en: "At what time?", note: "time questions" },
                { pt: "É uma hora", en: "It's one o'clock", note: "time - 'uma' for feminine 'hora'" },
                { pt: "São duas horas", en: "It's two o'clock", note: "plural 'horas'" }
              ],
              keyPoints: [
                "Age uses TER: 'Tenho X anos'",
                "Time uses SER: 'É uma hora' / 'São duas horas'",
                "Prices: 'custa X euros' or 'são X euros'"
              ]
            },
            {
              title: "Number Agreement Rules",
              explanation: "Portuguese numbers have gender agreement rules that are important to know:",
              examples: [
                { pt: "um livro", en: "one book (masc.)", note: "masculine noun" },
                { pt: "uma casa", en: "one house (fem.)", note: "feminine noun" },
                { pt: "dois carros", en: "two cars (masc.)", note: "masculine plural" },
                { pt: "duas pessoas", en: "two people (fem.)", note: "feminine plural" },
                { pt: "três amigos", en: "three friends", note: "no gender change" }
              ],
              keyPoints: [
                "Only 'um/uma' and 'dois/duas' change for gender",
                "Numbers 3+ are the same for all genders",
                "Listen to Portuguese speakers for natural usage"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn numbers 0-10 (flashcards)
          { id: "e1", type: "flashcard", term: "zero", translation: "zero" },
          { id: "e2", type: "flashcard", term: "um", translation: "one (masculine)" },
          { id: "e3", type: "flashcard", term: "uma", translation: "one (feminine)" },
          { id: "e4", type: "flashcard", term: "dois", translation: "two (masculine)" },
          { id: "e5", type: "flashcard", term: "duas", translation: "two (feminine)" },
          { id: "e6", type: "flashcard", term: "três", translation: "three" },
          { id: "e7", type: "flashcard", term: "dez", translation: "ten" },
          
          // Then: Learn numbers 11-20 (flashcards)
          { id: "e8", type: "flashcard", term: "onze", translation: "eleven" },
          { id: "e9", type: "flashcard", term: "quinze", translation: "fifteen" },
          { id: "e10", type: "flashcard", term: "vinte", translation: "twenty" },
          
          // Practice recognition (MCQ)
          { id: "e11", type: "mcq", prompt: "Translate: 'dois'", options: ["two", "ten", "twelve"], correct: "two" },
          { id: "e12", type: "mcq", prompt: "Which is correct for 'two books' (masculine)?", options: ["duas livros", "dois livros", "dois livras"], correct: "dois livros" },
          
          // Production (typing)
          { id: "e13", type: "typing", prompt: "Type in PT: 'I'm twenty years old.'", correct: "Tenho vinte anos." },
          { id: "e14", type: "typing", prompt: "Type the number: 'dezasseis'", correct: "16" },
        ],
      },
      {
        id: "m2l2",
        title: "Preços e telefone",
        xp: 25,
        content: {
          title: "Prices and Phone Numbers in Portugal",
          sections: [
            {
              title: "Portuguese Money and Prices",
              explanation: "Portugal uses the Euro. Learn to talk about prices and money:",
              examples: [
                { pt: "euro", en: "euro", note: "European currency" },
                { pt: "cêntimo", en: "cent", note: "1/100 of a euro" },
                { pt: "Quanto custa?", en: "How much does it cost?", note: "essential question" },
                { pt: "Custa cinco euros", en: "It costs five euros", note: "singular 'custa'" },
                { pt: "São dez euros", en: "It's ten euros", note: "alternative phrasing" },
                { pt: "cinquenta cêntimos", en: "fifty cents", note: "below one euro" }
              ],
              keyPoints: [
                "Euro prices: €5,50 (five euros and fifty cents)",
                "Use comma for decimal: 5,50 not 5.50",
                "Cêntimos for amounts under one euro"
              ]
            },
            {
              title: "Asking About Prices",
              explanation: "Essential phrases for shopping and asking about costs:",
              examples: [
                { pt: "Quanto custa isto?", en: "How much does this cost?", note: "pointing to item" },
                { pt: "Qual é o preço?", en: "What's the price?", note: "more formal" },
                { pt: "É caro", en: "It's expensive", note: "too expensive" },
                { pt: "É barato", en: "It's cheap", note: "good price" },
                { pt: "Está em promoção?", en: "Is it on sale?", note: "looking for discounts" },
                { pt: "Aceita cartão?", en: "Do you accept cards?", note: "payment method" }
              ],
              keyPoints: [
                "Portuguese stores often negotiate",
                "Markets have more flexible pricing",
                "Card payments are widely accepted"
              ]
            },
            {
              title: "Portuguese Phone Numbers",
              explanation: "Phone numbers in Portugal have a specific format and structure:",
              examples: [
                { pt: "número de telefone", en: "phone number", note: "landline or mobile" },
                { pt: "telemóvel", en: "mobile phone", note: "European Portuguese term" },
                { pt: "nove um dois três", en: "nine one two three", note: "say digits individually" },
                { pt: "O meu número é...", en: "My number is...", note: "giving your number" },
                { pt: "Pode repetir?", en: "Can you repeat?", note: "if you didn't catch it" }
              ],
              keyPoints: [
                "Portuguese mobile numbers have 9 digits",
                "Landlines vary by region",
                "Say numbers digit by digit clearly"
              ]
            },
            {
              title: "Giving and Taking Numbers",
              explanation: "Practical phrases for exchanging contact information:",
              examples: [
                { pt: "Qual é o seu número?", en: "What's your number?", note: "asking politely" },
                { pt: "Deixe-me o seu contacto", en: "Leave me your contact", note: "requesting info" },
                { pt: "Vou ligar mais tarde", en: "I'll call later", note: "future communication" },
                { pt: "Não funciona", en: "It doesn't work", note: "if number is wrong" },
                { pt: "Está ocupado", en: "It's busy", note: "line is busy" }
              ],
              keyPoints: [
                "Always confirm numbers by repeating",
                "Portuguese people exchange numbers freely",
                "WhatsApp is very popular in Portugal"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn money vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "Quanto custa?", translation: "How much is it?" },
          { id: "e2", type: "flashcard", term: "euro", translation: "euro" },
          { id: "e3", type: "flashcard", term: "cêntimo", translation: "cent" },
          { id: "e4", type: "flashcard", term: "É cinco euros", translation: "It is five euros" },
          
          // Then: Learn phone vocabulary (flashcards)
          { id: "e5", type: "flashcard", term: "número de telefone", translation: "phone number" },
          { id: "e6", type: "flashcard", term: "telemóvel", translation: "mobile phone" },
          
          // Practice listening to numbers (listening)
          { id: "e7", type: "listening", audioTextPt: "O meu número é nove um dois três quatro cinco.", prompt: "Type what you hear", correct: "O meu número é nove um dois três quatro cinco." },
          
          // Practice prices (MCQ)
          { id: "e8", type: "mcq", prompt: "How do you ask 'How much?'", options: ["Quanto custa?", "Que preço?", "Custa quanto?"], correct: "Quanto custa?" },
          
          // Production (typing and ordering)
          { id: "e9", type: "typing", prompt: "Write the price: 'It costs ten euros.'", correct: "Custa dez euros." },
          { id: "e10", type: "typing", prompt: "Ask for someone's number politely:", correct: "Qual é o seu número?" },
          { id: "e11", type: "order", correct: "Quanto custa?", items: ["Quanto","custa?"] },
        ],
      },
    ],
  },
  {
    id: "m3",
    title: "Countries, Nationalities, Languages",
    description: "Say where you're from and what you speak.",
    lessons: [
      {
        id: "m3l1",
        title: "Nacionalidades",
        xp: 25,
        content: {
          title: "Nationalities and Countries",
          sections: [
            {
              title: "Basic Nationality Structure",
              explanation: "Portuguese nationality adjectives have specific patterns and gender agreement rules:",
              examples: [
                { pt: "português/portuguesa", en: "Portuguese", note: "gender agreement" },
                { pt: "brasileiro/brasileira", en: "Brazilian", note: "most common pattern" },
                { pt: "americano/americana", en: "American", note: "-o/-a endings" },
                { pt: "inglês/inglesa", en: "English", note: "irregular feminine" },
                { pt: "francês/francesa", en: "French", note: "accent change in feminine" },
                { pt: "alemão/alemã", en: "German", note: "nasal ending changes" }
              ],
              keyPoints: [
                "Most nationalities follow -o/-a pattern",
                "Some have irregular feminine forms",
                "Nationalities are not capitalized in Portuguese"
              ]
            },
            {
              title: "European Nationalities",
              explanation: "Important European nationalities - essential for living in Europe:",
              examples: [
                { pt: "português/portuguesa", en: "Portuguese", note: "from Portugal" },
                { pt: "espanhol/espanhola", en: "Spanish", note: "from Spain" },
                { pt: "italiano/italiana", en: "Italian", note: "from Italy" },
                { pt: "francês/francesa", en: "French", note: "from France" },
                { pt: "alemão/alemã", en: "German", note: "from Germany" },
                { pt: "inglês/inglesa", en: "English", note: "from England" },
                { pt: "holandês/holandesa", en: "Dutch", note: "from Netherlands" }
              ],
              keyPoints: [
                "Essential for EU context",
                "Portuguese people often ask about nationality",
                "Shows interest in cultural exchange"
              ]
            },
            {
              title: "Countries and Origins",
              explanation: "Learn to say where you're from using prepositions:",
              examples: [
                { pt: "Sou de Portugal", en: "I'm from Portugal", note: "de + country" },
                { pt: "Sou do Brasil", en: "I'm from Brazil", note: "do = de + o" },
                { pt: "Sou dos Estados Unidos", en: "I'm from the United States", note: "dos = de + os" },
                { pt: "Sou da França", en: "I'm from France", note: "da = de + a" },
                { pt: "Venho da Alemanha", en: "I come from Germany", note: "vir de = come from" }
              ],
              keyPoints: [
                "Use DE + country name",
                "Contract with articles: do, da, dos, das",
                "Some countries use articles, others don't"
              ]
            },
            {
              title: "Cultural Conversations",
              explanation: "Portuguese people love discussing different cultures and countries:",
              examples: [
                { pt: "De onde é?", en: "Where are you from?", note: "polite question" },
                { pt: "Que país interessante!", en: "What an interesting country!", note: "positive response" },
                { pt: "Já visitei o seu país", en: "I've visited your country", note: "creating connection" },
                { pt: "A cultura é muito diferente", en: "The culture is very different", note: "observation" },
                { pt: "Gosta de Portugal?", en: "Do you like Portugal?", note: "common question to foreigners" }
              ],
              keyPoints: [
                "Portuguese people are genuinely interested",
                "Share positive things about Portugal",
                "Ask about their travels too"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn nationality patterns (flashcards)
          { id: "e1", type: "flashcard", term: "português", translation: "Portuguese (masculine)" },
          { id: "e2", type: "flashcard", term: "portuguesa", translation: "Portuguese (feminine)" },
          { id: "e3", type: "flashcard", term: "americano", translation: "American (masculine)" },
          { id: "e4", type: "flashcard", term: "americana", translation: "American (feminine)" },
          { id: "e5", type: "flashcard", term: "brasileiro", translation: "Brazilian (masculine)" },
          
          // Then: Learn country expressions (flashcards)
          { id: "e6", type: "flashcard", term: "Sou de Portugal", translation: "I'm from Portugal" },
          { id: "e7", type: "flashcard", term: "Sou do Brasil", translation: "I'm from Brazil" },
          
          // Practice gender agreement (MCQ)
          { id: "e8", type: "mcq", prompt: "A woman from America says:", options: ["Sou americano", "Sou americana", "Sou américa"], correct: "Sou americana" },
          { id: "e9", type: "mcq", prompt: "How do you ask 'Where are you from?' formally?", options: ["De onde és?", "De onde é?", "Onde vives?"], correct: "De onde é?" },
          
          // Production (typing)
          { id: "e10", type: "typing", prompt: "Say you're from France: 'I'm from France.'", correct: "Sou da França." },
          { id: "e11", type: "typing", prompt: "A Portuguese woman says: 'I am Portuguese.'", correct: "Sou portuguesa." },
        ],
      },
      {
        id: "m3l2",
        title: "Línguas",
        xp: 25,
        content: {
          title: "Languages and Communication",
          sections: [
            {
              title: "Major World Languages",
              explanation: "Learn to talk about languages you speak and understand:",
              examples: [
                { pt: "português", en: "Portuguese", note: "o português" },
                { pt: "inglês", en: "English", note: "o inglês" },
                { pt: "espanhol", en: "Spanish", note: "o espanhol" },
                { pt: "francês", en: "French", note: "o francês" },
                { pt: "alemão", en: "German", note: "o alemão" },
                { pt: "italiano", en: "Italian", note: "o italiano" },
                { pt: "chinês", en: "Chinese", note: "o chinês" }
              ],
              keyPoints: [
                "Languages are masculine: o português",
                "Same form as masculine nationality",
                "Use definite article with languages"
              ]
            },
            {
              title: "Expressing Language Ability",
              explanation: "Different ways to describe your language skills:",
              examples: [
                { pt: "Falo português", en: "I speak Portuguese", note: "basic ability" },
                { pt: "Falo bem inglês", en: "I speak English well", note: "good level" },
                { pt: "Falo um pouco de francês", en: "I speak a little French", note: "beginner level" },
                { pt: "Compreendo espanhol", en: "I understand Spanish", note: "passive knowledge" },
                { pt: "Não falo alemão", en: "I don't speak German", note: "no knowledge" },
                { pt: "Estou a aprender português", en: "I'm learning Portuguese", note: "current study" }
              ],
              keyPoints: [
                "FALAR = speak (active skill)",
                "COMPREENDER = understand (passive skill)",
                "Add qualifiers: bem, um pouco, mal"
              ]
            },
            {
              title: "Portuguese Language Varieties",
              explanation: "Understanding different types of Portuguese:",
              examples: [
                { pt: "português europeu", en: "European Portuguese", note: "Portugal Portuguese" },
                { pt: "português brasileiro", en: "Brazilian Portuguese", note: "Brazil Portuguese" },
                { pt: "português de Portugal", en: "Portuguese from Portugal", note: "formal description" },
                { pt: "sotaque", en: "accent", note: "pronunciation differences" },
                { pt: "dialeto", en: "dialect", note: "regional variations" }
              ],
              keyPoints: [
                "European and Brazilian Portuguese differ",
                "Portuguese people understand both varieties",
                "Accent differences are regional"
              ]
            },
            {
              title: "Learning and Teaching Languages",
              explanation: "Vocabulary for language learning situations:",
              examples: [
                { pt: "aprender", en: "to learn", note: "Estou a aprender português" },
                { pt: "ensinar", en: "to teach", note: "Ensino inglês" },
                { pt: "traduzir", en: "to translate", note: "Podes traduzir?" },
                { pt: "escola de línguas", en: "language school", note: "learning institution" },
                { pt: "professor de português", en: "Portuguese teacher", note: "language instructor" },
                { pt: "É difícil?", en: "Is it difficult?", note: "asking about difficulty" }
              ],
              keyPoints: [
                "Portuguese people encourage language learning",
                "Many Portuguese speak multiple languages",
                "Language exchange is popular"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn language names (flashcards)
          { id: "e1", type: "flashcard", term: "português", translation: "Portuguese" },
          { id: "e2", type: "flashcard", term: "inglês", translation: "English" },
          { id: "e3", type: "flashcard", term: "espanhol", translation: "Spanish" },
          { id: "e4", type: "flashcard", term: "francês", translation: "French" },
          
          // Then: Learn ability expressions (flashcards)
          { id: "e5", type: "flashcard", term: "Falo português", translation: "I speak Portuguese" },
          { id: "e6", type: "flashcard", term: "Falo um pouco", translation: "I speak a little" },
          { id: "e7", type: "flashcard", term: "Compreendo", translation: "I understand" },
          
          // Practice language abilities (MCQ)
          { id: "e8", type: "mcq", prompt: "How do you say 'I speak a little Portuguese'?", options: ["Falo pouco português", "Falo um pouco de português", "Falo português pouco"], correct: "Falo um pouco de português" },
          { id: "e9", type: "mcq", prompt: "What's the difference between European and Brazilian Portuguese?", options: ["They're completely different", "Different accents and some vocabulary", "Same language"], correct: "Different accents and some vocabulary" },
          
          // Production (typing)
          { id: "e10", type: "typing", prompt: "Say: 'I'm learning Portuguese.'", correct: "Estou a aprender português." },
          { id: "e11", type: "typing", prompt: "Say: 'I speak English well.'", correct: "Falo bem inglês." },
        ],
      },
    ],
  },
  {
    id: "m4",
    title: "Family & People",
    description: "Talk about family members and possession.",
    lessons: [
      {
        id: "m4l1",
        title: "Família",
        xp: 25,
        content: {
          title: "Family and Relationships",
          sections: [
            {
              title: "Immediate Family Members",
              explanation: "Family is extremely important in Portuguese culture. Learn the essential family vocabulary:",
              examples: [
                { pt: "pai", en: "father", note: "o pai" },
                { pt: "mãe", en: "mother", note: "a mãe" },
                { pt: "filho", en: "son", note: "o filho" },
                { pt: "filha", en: "daughter", note: "a filha" },
                { pt: "irmão", en: "brother", note: "o irmão" },
                { pt: "irmã", en: "sister", note: "a irmã" },
                { pt: "avô", en: "grandfather", note: "o avô" },
                { pt: "avó", en: "grandmother", note: "a avó" }
              ],
              keyPoints: [
                "Family words have clear masculine/feminine forms",
                "Portuguese families are typically close-knit",
                "Grandparents often live with families"
              ]
            },
            {
              title: "Extended Family",
              explanation: "Portuguese families include many extended relatives in regular social life:",
              examples: [
                { pt: "tio", en: "uncle", note: "o tio" },
                { pt: "tia", en: "aunt", note: "a tia" },
                { pt: "primo", en: "cousin (male)", note: "o primo" },
                { pt: "prima", en: "cousin (female)", note: "a prima" },
                { pt: "sogro", en: "father-in-law", note: "o sogro" },
                { pt: "sogra", en: "mother-in-law", note: "a sogra" },
                { pt: "cunhado", en: "brother-in-law", note: "o cunhado" },
                { pt: "cunhada", en: "sister-in-law", note: "a cunhada" }
              ],
              keyPoints: [
                "In-laws are important in Portuguese families",
                "Cousins are often very close",
                "Extended family gatherings are common"
              ]
            },
            {
              title: "Family Relationships and Status",
              explanation: "Describing family relationships and marital status:",
              examples: [
                { pt: "casado/casada", en: "married", note: "gender agreement" },
                { pt: "solteiro/solteira", en: "single", note: "unmarried" },
                { pt: "divorciado/divorciada", en: "divorced", note: "relationship status" },
                { pt: "namorado/namorada", en: "boyfriend/girlfriend", note: "dating relationship" },
                { pt: "marido", en: "husband", note: "o marido" },
                { pt: "mulher/esposa", en: "wife", note: "a mulher/a esposa" },
                { pt: "companheiro/companheira", en: "partner", note: "life partner" }
              ],
              keyPoints: [
                "Portuguese society is quite traditional about family",
                "Marriage is still very important culturally",
                "Use appropriate terms for relationships"
              ]
            },
            {
              title: "Talking About Your Family",
              explanation: "Common expressions for describing family members:",
              examples: [
                { pt: "Tenho dois irmãos", en: "I have two brothers", note: "ter = have family" },
                { pt: "A minha família é grande", en: "My family is big", note: "family size" },
                { pt: "Os meus pais vivem em...", en: "My parents live in...", note: "location" },
                { pt: "Sou filho único", en: "I'm an only child (male)", note: "no siblings" },
                { pt: "Sou filha única", en: "I'm an only child (female)", note: "gender agreement" },
                { pt: "Tenho uma família pequena", en: "I have a small family", note: "size description" }
              ],
              keyPoints: [
                "Use TER for family members: 'Tenho uma irmã'",
                "Portuguese people love talking about family",
                "Be prepared to answer detailed family questions"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn immediate family (flashcards)
          { id: "e1", type: "flashcard", term: "pai", translation: "father" },
          { id: "e2", type: "flashcard", term: "mãe", translation: "mother" },
          { id: "e3", type: "flashcard", term: "filho", translation: "son" },
          { id: "e4", type: "flashcard", term: "filha", translation: "daughter" },
          { id: "e5", type: "flashcard", term: "irmão", translation: "brother" },
          { id: "e6", type: "flashcard", term: "irmã", translation: "sister" },
          
          // Then: Learn extended family (flashcards)
          { id: "e7", type: "flashcard", term: "avô", translation: "grandfather" },
          { id: "e8", type: "flashcard", term: "avó", translation: "grandmother" },
          { id: "e9", type: "flashcard", term: "tio", translation: "uncle" },
          { id: "e10", type: "flashcard", term: "tia", translation: "aunt" },
          
          // Practice family descriptions (MCQ)
          { id: "e11", type: "mcq", prompt: "How do you say 'I have two sisters'?", options: ["Tenho duas irmãs", "Sou duas irmãs", "Há duas irmãs"], correct: "Tenho duas irmãs" },
          { id: "e12", type: "mcq", prompt: "A woman who is an only child says:", options: ["Sou filho único", "Sou filha única", "Tenho filho único"], correct: "Sou filha única" },
          
          // Production (typing)
          { id: "e13", type: "typing", prompt: "Say: 'My family is big.'", correct: "A minha família é grande." },
          { id: "e14", type: "typing", prompt: "Say: 'I have one brother and one sister.'", correct: "Tenho um irmão e uma irmã." },
        ],
      },
      {
        id: "m4l2",
        title: "Possessivos",
        xp: 25,
        content: {
          title: "Possessive Adjectives and Pronouns",
          sections: [
            {
              title: "Basic Possessive Adjectives",
              explanation: "Portuguese possessives agree with the thing possessed, not the possessor:",
              examples: [
                { pt: "o meu livro", en: "my book (masculine)", note: "meu agrees with livro" },
                { pt: "a minha casa", en: "my house (feminine)", note: "minha agrees with casa" },
                { pt: "os meus livros", en: "my books (masculine plural)", note: "meus agrees with livros" },
                { pt: "as minhas casas", en: "my houses (feminine plural)", note: "minhas agrees with casas" },
                { pt: "o teu carro", en: "your car (informal)", note: "teu = informal 'your'" },
                { pt: "o seu carro", en: "your car (formal)", note: "seu = formal 'your'" }
              ],
              keyPoints: [
                "Possessives agree with the THING possessed",
                "Not with the person who possesses",
                "Include definite article: o meu, a minha"
              ]
            },
            {
              title: "All Possessive Forms",
              explanation: "Complete system of Portuguese possessive adjectives:",
              examples: [
                { pt: "meu/minha/meus/minhas", en: "my", note: "first person singular" },
                { pt: "teu/tua/teus/tuas", en: "your (informal)", note: "second person familiar" },
                { pt: "seu/sua/seus/suas", en: "his/her/your (formal)", note: "third person/formal" },
                { pt: "nosso/nossa/nossos/nossas", en: "our", note: "first person plural" },
                { pt: "vosso/vossa/vossos/vossas", en: "your (plural, archaic)", note: "rarely used" },
                { pt: "seu/sua/seus/suas", en: "their", note: "same as his/her" }
              ],
              keyPoints: [
                "SEU/SUA can mean his, her, your (formal), or their",
                "Context usually clarifies meaning",
                "VOSSO is archaic - use SEUS instead"
              ]
            },
            {
              title: "Using Possessives with Family",
              explanation: "Special patterns when talking about family members:",
              examples: [
                { pt: "a minha mãe", en: "my mother", note: "always use article with family" },
                { pt: "o meu pai", en: "my father", note: "definite article required" },
                { pt: "os meus pais", en: "my parents", note: "plural form" },
                { pt: "a nossa família", en: "our family", note: "nossa agrees with família" },
                { pt: "o teu irmão", en: "your brother (informal)", note: "informal possessive" },
                { pt: "a sua irmã", en: "your sister (formal)", note: "formal possessive" }
              ],
              keyPoints: [
                "Family members always use definite articles",
                "Choose teu/tua vs. seu/sua based on formality",
                "Portuguese families discuss possessions openly"
              ]
            },
            {
              title: "Possessive Pronouns (Standalone)",
              explanation: "When possessives stand alone without a noun:",
              examples: [
                { pt: "Este livro é meu", en: "This book is mine", note: "no article when standalone" },
                { pt: "A casa é nossa", en: "The house is ours", note: "nossa without article" },
                { pt: "O carro é dele", en: "The car is his", note: "dele = of him" },
                { pt: "A mala é dela", en: "The bag is hers", note: "dela = of her" },
                { pt: "É teu ou meu?", en: "Is it yours or mine?", note: "questioning ownership" }
              ],
              keyPoints: [
                "No definite article when possessive stands alone",
                "DELE/DELA often clearer than SEU/SUA",
                "Very useful for claiming ownership"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn basic possessives (flashcards)
          { id: "e1", type: "flashcard", term: "o meu", translation: "my (masculine)" },
          { id: "e2", type: "flashcard", term: "a minha", translation: "my (feminine)" },
          { id: "e3", type: "flashcard", term: "os meus", translation: "my (masculine plural)" },
          { id: "e4", type: "flashcard", term: "as minhas", translation: "my (feminine plural)" },
          { id: "e5", type: "flashcard", term: "o nosso", translation: "our (masculine)" },
          { id: "e6", type: "flashcard", term: "a nossa", translation: "our (feminine)" },
          
          // Then: Practice agreement (MCQ)
          { id: "e7", type: "mcq", prompt: "Which is correct for 'my house' (casa is feminine)?", options: ["o meu casa", "a minha casa", "minha casa"], correct: "a minha casa" },
          { id: "e8", type: "mcq", prompt: "How do you say 'our family'?", options: ["o nosso família", "a nossa família", "nossa família"], correct: "a nossa família" },
          
          // Practice with family (typing)
          { id: "e9", type: "typing", prompt: "Say: 'My mother is Portuguese.'", correct: "A minha mãe é portuguesa." },
          { id: "e10", type: "typing", prompt: "Say: 'Our parents live in Lisbon.'", correct: "Os nossos pais vivem em Lisboa." },
          
          // Possessive pronouns (typing)
          { id: "e11", type: "typing", prompt: "Say: 'This book is mine.'", correct: "Este livro é meu." },
          { id: "e12", type: "typing", prompt: "Say: 'The car is ours.'", correct: "O carro é nosso." },
        ],
      },
      {
        id: "m5l1",
        title: "Ser vs. Estar",
        xp: 30,
        content: {
          title: "SER vs ESTAR - The Essential Portuguese Distinction",
          sections: [
            {
              title: "Understanding the Fundamental Difference",
              explanation: "Portuguese has two verbs for 'to be' - SER and ESTAR. This distinction is crucial and affects meaning:",
              examples: [
                { pt: "Ela é bonita", en: "She is beautiful (permanently)", note: "SER = permanent characteristic" },
                { pt: "Ela está bonita", en: "She looks beautiful (today)", note: "ESTAR = temporary state" },
                { pt: "O café é quente", en: "Coffee is hot (always served hot)", note: "SER = general characteristic" },
                { pt: "O café está quente", en: "The coffee is hot (right now)", note: "ESTAR = current temperature" }
              ],
              keyPoints: [
                "SER = permanent, inherent characteristics",
                "ESTAR = temporary states, conditions, locations",
                "Same adjective can have different meanings with each verb"
              ]
            },
            {
              title: "When to Use SER",
              explanation: "SER is used for permanent characteristics, identity, and definitions:",
              examples: [
                { pt: "Sou professor", en: "I am a teacher", note: "profession/identity" },
                { pt: "És português", en: "You are Portuguese", note: "nationality" },
                { pt: "É uma mesa", en: "It is a table", note: "identity/definition" },
                { pt: "Somos amigos", en: "We are friends", note: "relationship" },
                { pt: "São dois euros", en: "It's two euros", note: "price" },
                { pt: "É segunda-feira", en: "It's Monday", note: "date/time" }
              ],
              keyPoints: [
                "Professions: Sou médico",
                "Nationalities: É inglês",
                "Time and dates: É uma hora",
                "Prices: São cinco euros"
              ]
            },
            {
              title: "When to Use ESTAR",
              explanation: "ESTAR is used for temporary states, locations, and ongoing conditions:",
              examples: [
                { pt: "Estou cansado", en: "I am tired", note: "temporary feeling" },
                { pt: "Estás em casa", en: "You are at home", note: "location" },
                { pt: "Está frio hoje", en: "It's cold today", note: "weather/temporary" },
                { pt: "Estamos felizes", en: "We are happy", note: "current emotion" },
                { pt: "Estão a trabalhar", en: "They are working", note: "ongoing action" },
                { pt: "O banco está fechado", en: "The bank is closed", note: "current state" }
              ],
              keyPoints: [
                "Locations: Estou em Lisboa",
                "Emotions: Estou triste",
                "Weather: Está quente",
                "Progressive: Estou a estudar"
              ]
            },
            {
              title: "Conjugation Patterns",
              explanation: "Both verbs are irregular and must be memorized:",
              examples: [
                { pt: "SER: sou, és, é, somos, são, são", en: "I am, you are, he/she is, we are, you are, they are", note: "irregular conjugation" },
                { pt: "ESTAR: estou, estás, está, estamos, estão, estão", en: "I am, you are, he/she is, we are, you are, they are", note: "irregular conjugation" },
                { pt: "Sou vs. Estou", en: "permanent vs. temporary 'I am'", note: "key difference" },
                { pt: "És vs. Estás", en: "permanent vs. temporary 'you are'", note: "informal forms" }
              ],
              keyPoints: [
                "Both verbs are completely irregular",
                "Must memorize all forms",
                "Practice with common adjectives"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn SER conjugation (flashcards)
          { id: "e1", type: "flashcard", term: "sou", translation: "I am (permanent)" },
          { id: "e2", type: "flashcard", term: "és", translation: "you are (permanent, informal)" },
          { id: "e3", type: "flashcard", term: "é", translation: "he/she is (permanent)" },
          { id: "e4", type: "flashcard", term: "somos", translation: "we are (permanent)" },
          
          // Then: Learn ESTAR conjugation (flashcards)
          { id: "e5", type: "flashcard", term: "estou", translation: "I am (temporary)" },
          { id: "e6", type: "flashcard", term: "estás", translation: "you are (temporary, informal)" },
          { id: "e7", type: "flashcard", term: "está", translation: "he/she is (temporary)" },
          { id: "e8", type: "flashcard", term: "estamos", translation: "we are (temporary)" },
          
          // Practice the distinction (MCQ)
          { id: "e9", type: "mcq", prompt: "I am a teacher (profession):", options: ["Sou professor", "Estou professor"], correct: "Sou professor" },
          { id: "e10", type: "mcq", prompt: "I am tired (temporary feeling):", options: ["Sou cansado", "Estou cansado"], correct: "Estou cansado" },
          { id: "e11", type: "mcq", prompt: "She is in Lisbon (location):", options: ["É em Lisboa", "Está em Lisboa"], correct: "Está em Lisboa" },
          
          // Production exercises (typing)
          { id: "e12", type: "typing", prompt: "Say: 'I am Portuguese' (nationality).", correct: "Sou português." },
          { id: "e13", type: "typing", prompt: "Say: 'I am at home' (location).", correct: "Estou em casa." },
          { id: "e14", type: "typing", prompt: "Say: 'The coffee is hot' (right now).", correct: "O café está quente." },
        ],
      },
    ],
  },
  {
    id: "m6",
    title: "Food & Café/Restaurante",
    description: "Order food and drinks, ask for the bill, and express preferences.",
    lessons: [
      {
        id: "m6l1",
        title: "No café",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Queria um café, por favor.", translation: "I would like a coffee, please." },
          { id: "e2", type: "flashcard", term: "A conta, por favor.", translation: "The bill, please." },
          { id: "e3", type: "listening", audioTextPt: "Bom dia. Queria uma bica e um pastel de nata.", prompt: "Type what you hear", correct: "Bom dia. Queria uma bica e um pastel de nata." },
          { id: "e4", type: "mcq", prompt: "Translate: 'Queria' in this context", options: ["I want","I would like","I liked"], correct: "I would like" },
        ],
      },
      {
        id: "m6l2",
        title: "Preferências",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Gosto de peixe.", translation: "I like fish." },
          { id: "e2", type: "flashcard", term: "Não gosto de carne.", translation: "I don't like meat." },
          { id: "e3", type: "typing", prompt: "Type in PT: 'Do you want water?'", correct: "Queres água?" },
          { id: "e4", type: "order", correct: "A sopa está quente.", items: ["A","sopa","está","quente."] },
        ],
      },
    ],
  },
  {
    id: "m7",
    title: "City & Directions",
    description: "Ask for and give directions, talk about transport.",
    lessons: [
      {
        id: "m7l1",
        title: "Direções básicas",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Onde fica a estação?", translation: "Where is the station?" },
          { id: "e2", type: "matching", pairs: [ { a: "à direita", b: "to the right" }, { a: "à esquerda", b: "to the left" }, { a: "em frente", b: "straight ahead" } ] },
          { id: "e3", type: "typing", prompt: "Type in PT: 'Turn left'", correct: "Vira à esquerda" },
        ],
      },
      {
        id: "m7l2",
        title: "Transportes",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Vou de metro.", translation: "I go by metro." },
          { id: "e2", type: "mcq", prompt: "Translate: 'autocarro'", options: ["train","bus","car"], correct: "bus" },
          { id: "e3", type: "order", correct: "O bilhete é aqui.", items: ["O","bilhete","é","aqui."] },
        ],
      },
    ],
  },
  {
    id: "m8",
    title: "Shopping & Clothing",
    description: "Ask for sizes, try on clothes, talk about colors and prices.",
    lessons: [
      {
        id: "m8l1",
        title: "Roupas e tamanhos",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Posso experimentar?", translation: "Can I try it on?" },
          { id: "e2", type: "flashcard", term: "Qual é o tamanho?", translation: "What size is it?" },
          { id: "e3", type: "matching", pairs: [ { a: "camisa", b: "shirt" }, { a: "calças", b: "trousers" }, { a: "casaco", b: "jacket" } ] },
        ],
      },
      {
        id: "m8l2",
        title: "Cores e preços",
        xp: 25,
        exercises: [
          { id: "e1", type: "mcq", prompt: "Translate: 'vermelho'", options: ["red","green","blue"], correct: "red" },
          { id: "e2", type: "typing", prompt: "Type in PT: 'It is cheap.'", correct: "É barato." },
          { id: "e3", type: "order", correct: "É muito caro.", items: ["É","muito","caro."] },
        ],
      },
    ],
  },
  {
    id: "m9",
    title: "Housing & Accommodation",
    description: "Book rooms, describe a place, and handle problems.",
    lessons: [
      {
        id: "m9l1",
        title: "No hotel",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Tenho uma reserva.", translation: "I have a reservation." },
          { id: "e2", type: "flashcard", term: "Onde fica o quarto?", translation: "Where is the room?" },
          { id: "e3", type: "listening", audioTextPt: "A chave não funciona.", prompt: "Type what you hear", correct: "A chave não funciona." },
        ],
      },
      {
        id: "m9l2",
        title: "Casa e divisões",
        xp: 25,
        exercises: [
          { id: "e1", type: "matching", pairs: [ { a: "cozinha", b: "kitchen" }, { a: "quarto", b: "bedroom" }, { a: "casa de banho", b: "bathroom" } ] },
          { id: "e2", type: "typing", prompt: "Type in PT: 'The living room is big.'", correct: "A sala é grande." },
        ],
      },
    ],
  },
  {
    id: "m10",
    title: "Health & Emergencies",
    description: "At the pharmacy and doctor; describe symptoms.",
    lessons: [
      {
        id: "m10l1",
        title: "Sintomas",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Tenho dor de cabeça.", translation: "I have a headache." },
          { id: "e2", type: "flashcard", term: "Estou doente.", translation: "I am ill." },
          { id: "e3", type: "mcq", prompt: "Translate: 'farmácia'", options: ["doctor","pharmacy","hospital"], correct: "pharmacy" },
        ],
      },
      {
        id: "m10l2",
        title: "Urgências",
        xp: 25,
        exercises: [
          { id: "e1", type: "typing", prompt: "Type in PT: 'Call an ambulance!'", correct: "Chame uma ambulância!" },
          { id: "e2", type: "order", correct: "Preciso de um médico.", items: ["Preciso","de","um","médico."] },
        ],
      },
    ],
  },
  {
    id: "m11",
    title: "Weather & Small talk",
    description: "Talk about weather and make simple plans.",
    lessons: [
      {
        id: "m11l1",
        title: "Tempo",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "Está sol.", translation: "It is sunny." },
          { id: "e2", type: "flashcard", term: "Está a chover.", translation: "It is raining." },
          { id: "e3", type: "mcq", prompt: "Translate: 'vento'", options: ["snow","wind","fog"], correct: "wind" },
        ],
      },
      {
        id: "m11l2",
        title: "Convidar e combinar",
        xp: 25,
        exercises: [
          { id: "e1", type: "typing", prompt: "Type in PT: 'Shall we have a coffee?'", correct: "Vamos tomar um café?" },
          { id: "e2", type: "order", correct: "Queres ir ao cinema?", items: ["Queres","ir","ao","cinema?"] },
        ],
      },
    ],
  },
  {
    id: "m12",
    title: "Grammar Essentials (Spiral)",
    description: "Core A1 grammar: ser/estar/ter/ir, articles, negation, wh-words.",
    lessons: [
      {
        id: "m12l1",
        title: "Verbos: ser/estar/ter/ir",
        xp: 30,
        exercises: [
          { id: "e1", type: "matching", pairs: [ { a: "eu sou", b: "I am (ser)" }, { a: "eu estou", b: "I am (estar)" }, { a: "eu tenho", b: "I have" } ] },
          { id: "e2", type: "mcq", prompt: "Choose correct: 'Nós __ de Lisboa.'", options: ["somos","estamos","têm"], correct: "somos" },
          { id: "e3", type: "typing", prompt: "Type in PT: 'I am going to Porto.'", correct: "Vou ao Porto." },
        ],
      },
      {
        id: "m12l2",
        title: "Artigos, negação e perguntas",
        xp: 30,
        exercises: [
          { id: "e1", type: "matching", pairs: [ { a: "o / a", b: "the (m/f)" }, { a: "um / uma", b: "a/an (m/f)" }, { a: "não", b: "not" } ] },
          { id: "e2", type: "mcq", prompt: "Translate: 'Porquê?'", options: ["Where?","Why?","When?"], correct: "Why?" },
          { id: "e3", type: "order", correct: "Onde é a casa de banho?", items: ["Onde","é","a","casa","de","banho?"] },
        ],
      },
    ],
  },
  // NEW MASSIVE VOCABULARY EXPANSION MODULES
  {
    id: "vocab1",
    title: "Essential Vocabulary I: Colors, Numbers & Body",
    description: "Core vocabulary every A1 student needs - colors, numbers 21-100, body parts.",
    lessons: [
      {
        id: "vocab1l1",
        title: "Cores (Colors)",
        xp: 30,
        exercises: [
          { id: "e1", type: "flashcard", term: "vermelho", translation: "red" },
          { id: "e2", type: "flashcard", term: "azul", translation: "blue" },
          { id: "e3", type: "flashcard", term: "verde", translation: "green" },
          { id: "e4", type: "flashcard", term: "amarelo", translation: "yellow" },
          { id: "e5", type: "flashcard", term: "branco", translation: "white" },
          { id: "e6", type: "flashcard", term: "preto", translation: "black" },
          { id: "e7", type: "flashcard", term: "rosa", translation: "pink" },
          { id: "e8", type: "flashcard", term: "roxo", translation: "purple" },
          { id: "e9", type: "flashcard", term: "castanho", translation: "brown" },
          { id: "e10", type: "flashcard", term: "cinzento", translation: "grey" },
          { id: "e11", type: "flashcard", term: "laranja", translation: "orange" },
          { id: "e12", type: "flashcard", term: "cor", translation: "color" },
          { id: "e13", type: "flashcard", term: "Que cor é?", translation: "What color is it?" },
          { id: "e14", type: "flashcard", term: "É azul.", translation: "It is blue." },
          { id: "e15", type: "flashcard", term: "A minha cor favorita é...", translation: "My favorite color is..." },
          { id: "e16", type: "mcq", prompt: "Que cor é o céu?", options: ["azul", "verde", "vermelho"], correct: "azul" },
          { id: "e17", type: "mcq", prompt: "Que cor é a erva?", options: ["amarelo", "verde", "preto"], correct: "verde" },
          { id: "e18", type: "typing", prompt: "Escreve em PT: 'The car is red.'", correct: "O carro é vermelho." },
        ],
      },
      {
        id: "vocab1l2",
        title: "Números 21-100",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "vinte e um", translation: "twenty-one" },
          { id: "e2", type: "flashcard", term: "trinta", translation: "thirty" },
          { id: "e3", type: "flashcard", term: "quarenta", translation: "forty" },
          { id: "e4", type: "flashcard", term: "cinquenta", translation: "fifty" },
          { id: "e5", type: "flashcard", term: "sessenta", translation: "sixty" },
          { id: "e6", type: "flashcard", term: "setenta", translation: "seventy" },
          { id: "e7", type: "flashcard", term: "oitenta", translation: "eighty" },
          { id: "e8", type: "flashcard", term: "noventa", translation: "ninety" },
          { id: "e9", type: "flashcard", term: "cem", translation: "one hundred" },
          { id: "e10", type: "flashcard", term: "vinte e cinco", translation: "twenty-five" },
          { id: "e11", type: "flashcard", term: "trinta e dois", translation: "thirty-two" },
          { id: "e12", type: "flashcard", term: "quarenta e nove", translation: "forty-nine" },
          { id: "e13", type: "flashcard", term: "primeiro", translation: "first" },
          { id: "e14", type: "flashcard", term: "segundo", translation: "second" },
          { id: "e15", type: "flashcard", term: "terceiro", translation: "third" },
          { id: "e16", type: "flashcard", term: "quarto", translation: "fourth" },
          { id: "e17", type: "flashcard", term: "quinto", translation: "fifth" },
          { id: "e18", type: "mcq", prompt: "Como se diz '75'?", options: ["setenta e cinco", "sessenta e cinco", "oitenta e cinco"], correct: "setenta e cinco" },
          { id: "e19", type: "typing", prompt: "Escreve em números: 'quarenta e três'", correct: "43" },
        ],
      },
      {
        id: "vocab1l3",
        title: "Corpo (Body Parts)",
        xp: 30,
        exercises: [
          { id: "e1", type: "flashcard", term: "cabeça", translation: "head" },
          { id: "e2", type: "flashcard", term: "olhos", translation: "eyes" },
          { id: "e3", type: "flashcard", term: "nariz", translation: "nose" },
          { id: "e4", type: "flashcard", term: "boca", translation: "mouth" },
          { id: "e5", type: "flashcard", term: "orelhas", translation: "ears" },
          { id: "e6", type: "flashcard", term: "braços", translation: "arms" },
          { id: "e7", type: "flashcard", term: "pernas", translation: "legs" },
          { id: "e8", type: "flashcard", term: "pés", translation: "feet" },
          { id: "e9", type: "flashcard", term: "mãos", translation: "hands" },
          { id: "e10", type: "flashcard", term: "dedos", translation: "fingers" },
          { id: "e11", type: "flashcard", term: "cabelo", translation: "hair" },
          { id: "e12", type: "flashcard", term: "face", translation: "face" },
          { id: "e13", type: "flashcard", term: "pescoço", translation: "neck" },
          { id: "e14", type: "flashcard", term: "ombros", translation: "shoulders" },
          { id: "e15", type: "flashcard", term: "costas", translation: "back" },
          { id: "e16", type: "flashcard", term: "Tenho olhos azuis.", translation: "I have blue eyes." },
          { id: "e17", type: "flashcard", term: "Dói-me a cabeça.", translation: "My head hurts." },
          { id: "e18", type: "mcq", prompt: "Com que vemos?", options: ["olhos", "orelhas", "nariz"], correct: "olhos" },
        ],
      },
    ],
  },
  {
    id: "vocab2",
    title: "Essential Vocabulary II: Food, Animals & Nature",
    description: "Comprehensive food vocabulary, animals, and nature terms for A1.",
    lessons: [
      {
        id: "vocab2l1",
        title: "Comida Essencial (Essential Food)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "pão", translation: "bread" },
          { id: "e2", type: "flashcard", term: "água", translation: "water" },
          { id: "e3", type: "flashcard", term: "leite", translation: "milk" },
          { id: "e4", type: "flashcard", term: "carne", translation: "meat" },
          { id: "e5", type: "flashcard", term: "peixe", translation: "fish" },
          { id: "e6", type: "flashcard", term: "fruta", translation: "fruit" },
          { id: "e7", type: "flashcard", term: "legumes", translation: "vegetables" },
          { id: "e8", type: "flashcard", term: "arroz", translation: "rice" },
          { id: "e9", type: "flashcard", term: "massa", translation: "pasta" },
          { id: "e10", type: "flashcard", term: "queijo", translation: "cheese" },
          { id: "e11", type: "flashcard", term: "ovos", translation: "eggs" },
          { id: "e12", type: "flashcard", term: "manteiga", translation: "butter" },
          { id: "e13", type: "flashcard", term: "açúcar", translation: "sugar" },
          { id: "e14", type: "flashcard", term: "sal", translation: "salt" },
          { id: "e15", type: "flashcard", term: "maçã", translation: "apple" },
          { id: "e16", type: "flashcard", term: "banana", translation: "banana" },
          { id: "e17", type: "flashcard", term: "laranja", translation: "orange (fruit)" },
          { id: "e18", type: "flashcard", term: "tomate", translation: "tomato" },
          { id: "e19", type: "flashcard", term: "batata", translation: "potato" },
          { id: "e20", type: "flashcard", term: "cebola", translation: "onion" },
          { id: "e21", type: "flashcard", term: "Tenho fome.", translation: "I am hungry." },
          { id: "e22", type: "flashcard", term: "Tenho sede.", translation: "I am thirsty." },
          { id: "e23", type: "flashcard", term: "Está delicioso.", translation: "It is delicious." },
          { id: "e24", type: "mcq", prompt: "O que bebemos?", options: ["água", "pão", "carne"], correct: "água" },
        ],
      },
      {
        id: "vocab2l2",
        title: "Animais (Animals)",
        xp: 30,
        exercises: [
          { id: "e1", type: "flashcard", term: "cão", translation: "dog" },
          { id: "e2", type: "flashcard", term: "gato", translation: "cat" },
          { id: "e3", type: "flashcard", term: "pássaro", translation: "bird" },
          { id: "e4", type: "flashcard", term: "peixe", translation: "fish (animal)" },
          { id: "e5", type: "flashcard", term: "cavalo", translation: "horse" },
          { id: "e6", type: "flashcard", term: "vaca", translation: "cow" },
          { id: "e7", type: "flashcard", term: "porco", translation: "pig" },
          { id: "e8", type: "flashcard", term: "ovelha", translation: "sheep" },
          { id: "e9", type: "flashcard", term: "coelho", translation: "rabbit" },
          { id: "e10", type: "flashcard", term: "rato", translation: "mouse" },
          { id: "e11", type: "flashcard", term: "elefante", translation: "elephant" },
          { id: "e12", type: "flashcard", term: "leão", translation: "lion" },
          { id: "e13", type: "flashcard", term: "urso", translation: "bear" },
          { id: "e14", type: "flashcard", term: "macaco", translation: "monkey" },
          { id: "e15", type: "flashcard", term: "Tenho um cão.", translation: "I have a dog." },
          { id: "e16", type: "flashcard", term: "O gato é pequeno.", translation: "The cat is small." },
          { id: "e17", type: "mcq", prompt: "Que animal faz 'miau'?", options: ["gato", "cão", "vaca"], correct: "gato" },
        ],
      },
      {
        id: "vocab2l3",
        title: "Natureza (Nature)",
        xp: 25,
        exercises: [
          { id: "e1", type: "flashcard", term: "sol", translation: "sun" },
          { id: "e2", type: "flashcard", term: "lua", translation: "moon" },
          { id: "e3", type: "flashcard", term: "estrelas", translation: "stars" },
          { id: "e4", type: "flashcard", term: "céu", translation: "sky" },
          { id: "e5", type: "flashcard", term: "nuvens", translation: "clouds" },
          { id: "e6", type: "flashcard", term: "chuva", translation: "rain" },
          { id: "e7", type: "flashcard", term: "vento", translation: "wind" },
          { id: "e8", type: "flashcard", term: "neve", translation: "snow" },
          { id: "e9", type: "flashcard", term: "mar", translation: "sea" },
          { id: "e10", type: "flashcard", term: "rio", translation: "river" },
          { id: "e11", type: "flashcard", term: "montanha", translation: "mountain" },
          { id: "e12", type: "flashcard", term: "árvore", translation: "tree" },
          { id: "e13", type: "flashcard", term: "flor", translation: "flower" },
          { id: "e14", type: "flashcard", term: "erva", translation: "grass" },
          { id: "e15", type: "flashcard", term: "Está a chover.", translation: "It is raining." },
        ],
      },
    ],
  },
  {
    id: "vocab3",
    title: "Essential Vocabulary III: Adjectives & Descriptions",
    description: "Descriptive words, adjectives, and phrases for describing people and things.",
    lessons: [
      {
        id: "vocab3l1",
        title: "Adjetivos Básicos (Basic Adjectives)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "grande", translation: "big/large" },
          { id: "e2", type: "flashcard", term: "pequeno", translation: "small" },
          { id: "e3", type: "flashcard", term: "alto", translation: "tall/high" },
          { id: "e4", type: "flashcard", term: "baixo", translation: "short/low" },
          { id: "e5", type: "flashcard", term: "gordo", translation: "fat" },
          { id: "e6", type: "flashcard", term: "magro", translation: "thin" },
          { id: "e7", type: "flashcard", term: "bonito", translation: "beautiful/handsome" },
          { id: "e8", type: "flashcard", term: "feio", translation: "ugly" },
          { id: "e9", type: "flashcard", term: "novo", translation: "new/young" },
          { id: "e10", type: "flashcard", term: "velho", translation: "old" },
          { id: "e11", type: "flashcard", term: "jovem", translation: "young" },
          { id: "e12", type: "flashcard", term: "rápido", translation: "fast" },
          { id: "e13", type: "flashcard", term: "lento", translation: "slow" },
          { id: "e14", type: "flashcard", term: "forte", translation: "strong" },
          { id: "e15", type: "flashcard", term: "fraco", translation: "weak" },
          { id: "e16", type: "flashcard", term: "rico", translation: "rich" },
          { id: "e17", type: "flashcard", term: "pobre", translation: "poor" },
          { id: "e18", type: "flashcard", term: "feliz", translation: "happy" },
          { id: "e19", type: "flashcard", term: "triste", translation: "sad" },
          { id: "e20", type: "flashcard", term: "cansado", translation: "tired" },
          { id: "e21", type: "flashcard", term: "Ele é alto.", translation: "He is tall." },
          { id: "e22", type: "flashcard", term: "Ela é bonita.", translation: "She is beautiful." },
          { id: "e23", type: "mcq", prompt: "O oposto de 'grande'?", options: ["pequeno", "alto", "novo"], correct: "pequeno" },
        ],
      },
      {
        id: "vocab3l2",
        title: "Mais Adjetivos (More Adjectives)",
        xp: 30,
        exercises: [
          { id: "e1", type: "flashcard", term: "quente", translation: "hot" },
          { id: "e2", type: "flashcard", term: "frio", translation: "cold" },
          { id: "e3", type: "flashcard", term: "morno", translation: "warm" },
          { id: "e4", type: "flashcard", term: "fresco", translation: "fresh/cool" },
          { id: "e5", type: "flashcard", term: "seco", translation: "dry" },
          { id: "e6", type: "flashcard", term: "molhado", translation: "wet" },
          { id: "e7", type: "flashcard", term: "limpo", translation: "clean" },
          { id: "e8", type: "flashcard", term: "sujo", translation: "dirty" },
          { id: "e9", type: "flashcard", term: "fácil", translation: "easy" },
          { id: "e10", type: "flashcard", term: "difícil", translation: "difficult" },
          { id: "e11", type: "flashcard", term: "caro", translation: "expensive" },
          { id: "e12", type: "flashcard", term: "barato", translation: "cheap" },
          { id: "e13", type: "flashcard", term: "interessante", translation: "interesting" },
          { id: "e14", type: "flashcard", term: "chato", translation: "boring" },
          { id: "e15", type: "flashcard", term: "importante", translation: "important" },
          { id: "e16", type: "flashcard", term: "perfeito", translation: "perfect" },
          { id: "e17", type: "flashcard", term: "terrível", translation: "terrible" },
          { id: "e18", type: "flashcard", term: "O dia está quente.", translation: "The day is hot." },
          { id: "e19", type: "mcq", prompt: "O oposto de 'fácil'?", options: ["difícil", "caro", "limpo"], correct: "difícil" },
        ],
      },
    ],
  },
  {
    id: "vocab4",
    title: "Essential Vocabulary IV: Verbs & Actions",
    description: "Most important Portuguese verbs and action words for A1 level.",
    lessons: [
      {
        id: "vocab4l1",
        title: "Verbos Essenciais I (Essential Verbs I)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "ser", translation: "to be (permanent)" },
          { id: "e2", type: "flashcard", term: "estar", translation: "to be (temporary)" },
          { id: "e3", type: "flashcard", term: "ter", translation: "to have" },
          { id: "e4", type: "flashcard", term: "fazer", translation: "to do/make" },
          { id: "e5", type: "flashcard", term: "ir", translation: "to go" },
          { id: "e6", type: "flashcard", term: "vir", translation: "to come" },
          { id: "e7", type: "flashcard", term: "ver", translation: "to see" },
          { id: "e8", type: "flashcard", term: "dar", translation: "to give" },
          { id: "e9", type: "flashcard", term: "dizer", translation: "to say/tell" },
          { id: "e10", type: "flashcard", term: "saber", translation: "to know (facts)" },
          { id: "e11", type: "flashcard", term: "conhecer", translation: "to know (people/places)" },
          { id: "e12", type: "flashcard", term: "poder", translation: "can/to be able" },
          { id: "e13", type: "flashcard", term: "querer", translation: "to want" },
          { id: "e14", type: "flashcard", term: "gostar", translation: "to like" },
          { id: "e15", type: "flashcard", term: "falar", translation: "to speak/talk" },
          { id: "e16", type: "flashcard", term: "comer", translation: "to eat" },
          { id: "e17", type: "flashcard", term: "beber", translation: "to drink" },
          { id: "e18", type: "flashcard", term: "dormir", translation: "to sleep" },
          { id: "e19", type: "flashcard", term: "trabalhar", translation: "to work" },
          { id: "e20", type: "flashcard", term: "estudar", translation: "to study" },
          { id: "e21", type: "flashcard", term: "Eu sou professor.", translation: "I am a teacher." },
          { id: "e22", type: "flashcard", term: "Estou cansado.", translation: "I am tired." },
          { id: "e23", type: "flashcard", term: "Tenho vinte anos.", translation: "I am twenty years old." },
        ],
      },
      {
        id: "vocab4l2",
        title: "Verbos Essenciais II (Essential Verbs II)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "viver", translation: "to live" },
          { id: "e2", type: "flashcard", term: "morar", translation: "to live/reside" },
          { id: "e3", type: "flashcard", term: "acordar", translation: "to wake up" },
          { id: "e4", type: "flashcard", term: "levantar", translation: "to get up" },
          { id: "e5", type: "flashcard", term: "tomar banho", translation: "to take a shower" },
          { id: "e6", type: "flashcard", term: "vestir", translation: "to dress/wear" },
          { id: "e7", type: "flashcard", term: "sair", translation: "to go out/leave" },
          { id: "e8", type: "flashcard", term: "chegar", translation: "to arrive" },
          { id: "e9", type: "flashcard", term: "comprar", translation: "to buy" },
          { id: "e10", type: "flashcard", term: "vender", translation: "to sell" },
          { id: "e11", type: "flashcard", term: "pagar", translation: "to pay" },
          { id: "e12", type: "flashcard", term: "ajudar", translation: "to help" },
          { id: "e13", type: "flashcard", term: "perguntar", translation: "to ask" },
          { id: "e14", type: "flashcard", term: "responder", translation: "to answer" },
          { id: "e15", type: "flashcard", term: "encontrar", translation: "to find/meet" },
          { id: "e16", type: "flashcard", term: "perder", translation: "to lose" },
          { id: "e17", type: "flashcard", term: "ganhar", translation: "to win/earn" },
          { id: "e18", type: "flashcard", term: "começar", translation: "to start" },
          { id: "e19", type: "flashcard", term: "acabar", translation: "to finish" },
          { id: "e20", type: "flashcard", term: "parar", translation: "to stop" },
        ],
      },
    ],
  },
  {
    id: "vocab5",
    title: "Essential Vocabulary V: Professions & Transport",
    description: "Jobs, professions, and transportation vocabulary.",
    lessons: [
      {
        id: "vocab5l1",
        title: "Profissões (Professions)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "médico", translation: "doctor (m.)" },
          { id: "e2", type: "flashcard", term: "médica", translation: "doctor (f.)" },
          { id: "e3", type: "flashcard", term: "professor", translation: "teacher (m.)" },
          { id: "e4", type: "flashcard", term: "professora", translation: "teacher (f.)" },
          { id: "e5", type: "flashcard", term: "enfermeiro", translation: "nurse (m.)" },
          { id: "e6", type: "flashcard", term: "enfermeira", translation: "nurse (f.)" },
          { id: "e7", type: "flashcard", term: "polícia", translation: "police officer" },
          { id: "e8", type: "flashcard", term: "bombeiro", translation: "firefighter" },
          { id: "e9", type: "flashcard", term: "cozinheiro", translation: "cook (m.)" },
          { id: "e10", type: "flashcard", term: "cozinheira", translation: "cook (f.)" },
          { id: "e11", type: "flashcard", term: "vendedor", translation: "salesperson (m.)" },
          { id: "e12", type: "flashcard", term: "vendedora", translation: "salesperson (f.)" },
          { id: "e13", type: "flashcard", term: "engenheiro", translation: "engineer (m.)" },
          { id: "e14", type: "flashcard", term: "engenheira", translation: "engineer (f.)" },
          { id: "e15", type: "flashcard", term: "advogado", translation: "lawyer (m.)" },
          { id: "e16", type: "flashcard", term: "advogada", translation: "lawyer (f.)" },
          { id: "e17", type: "flashcard", term: "motorista", translation: "driver" },
          { id: "e18", type: "flashcard", term: "estudante", translation: "student" },
          { id: "e19", type: "flashcard", term: "O que faz?", translation: "What do you do?" },
          { id: "e20", type: "flashcard", term: "Sou enfermeira.", translation: "I am a nurse." },
        ],
      },
      {
        id: "vocab5l2",
        title: "Transportes (Transportation)",
        xp: 30,
        exercises: [
          { id: "e1", type: "flashcard", term: "carro", translation: "car" },
          { id: "e2", type: "flashcard", term: "autocarro", translation: "bus" },
          { id: "e3", type: "flashcard", term: "comboio", translation: "train" },
          { id: "e4", type: "flashcard", term: "avião", translation: "airplane" },
          { id: "e5", type: "flashcard", term: "bicicleta", translation: "bicycle" },
          { id: "e6", type: "flashcard", term: "metro", translation: "subway/metro" },
          { id: "e7", type: "flashcard", term: "táxi", translation: "taxi" },
          { id: "e8", type: "flashcard", term: "barco", translation: "boat" },
          { id: "e9", type: "flashcard", term: "mota", translation: "motorcycle" },
          { id: "e10", type: "flashcard", term: "elétrico", translation: "tram" },
          { id: "e11", type: "flashcard", term: "estação", translation: "station" },
          { id: "e12", type: "flashcard", term: "paragem", translation: "bus stop" },
          { id: "e13", type: "flashcard", term: "aeroporto", translation: "airport" },
          { id: "e14", type: "flashcard", term: "bilhete", translation: "ticket" },
          { id: "e15", type: "flashcard", term: "viagem", translation: "trip/journey" },
          { id: "e16", type: "flashcard", term: "Como vai para...?", translation: "How do you get to...?" },
          { id: "e17", type: "flashcard", term: "Vou de metro.", translation: "I go by metro." },
          { id: "e18", type: "mcq", prompt: "O que voa?", options: ["avião", "comboio", "autocarro"], correct: "avião" },
        ],
      },
    ],
  },
  {
    id: "phrases1",
    title: "Essential Phrases I: Daily Situations",
    description: "Everyday phrases and expressions for common situations.",
    lessons: [
      {
        id: "phrases1l1",
        title: "Compras (Shopping)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "Quanto custa isto?", translation: "How much does this cost?" },
          { id: "e2", type: "flashcard", term: "Posso ver?", translation: "Can I see?" },
          { id: "e3", type: "flashcard", term: "Posso experimentar?", translation: "Can I try it on?" },
          { id: "e4", type: "flashcard", term: "Tem o tamanho M?", translation: "Do you have size M?" },
          { id: "e5", type: "flashcard", term: "Tem desconto?", translation: "Is there a discount?" },
          { id: "e6", type: "flashcard", term: "Está em saldo?", translation: "Is it on sale?" },
          { id: "e7", type: "flashcard", term: "Aceita cartão?", translation: "Do you accept cards?" },
          { id: "e8", type: "flashcard", term: "Posso pagar em dinheiro?", translation: "Can I pay in cash?" },
          { id: "e9", type: "flashcard", term: "Onde pago?", translation: "Where do I pay?" },
          { id: "e10", type: "flashcard", term: "Tem o recibo?", translation: "Do you have the receipt?" },
          { id: "e11", type: "flashcard", term: "É muito caro.", translation: "It's very expensive." },
          { id: "e12", type: "flashcard", term: "É barato.", translation: "It's cheap." },
          { id: "e13", type: "flashcard", term: "Levo este.", translation: "I'll take this one." },
          { id: "e14", type: "flashcard", term: "Não quero, obrigado.", translation: "I don't want it, thank you." },
          { id: "e15", type: "flashcard", term: "Estou só a ver.", translation: "I'm just looking." },
          { id: "e16", type: "flashcard", term: "Onde fica a caixa?", translation: "Where is the checkout?" },
          { id: "e17", type: "flashcard", term: "Preciso de um saco.", translation: "I need a bag." },
          { id: "e18", type: "flashcard", term: "Pode embrulhar?", translation: "Can you wrap it?" },
        ],
      },
      {
        id: "phrases1l2",
        title: "Restaurante (Restaurant)",
        xp: 45,
        exercises: [
          { id: "e1", type: "flashcard", term: "Mesa para dois, por favor.", translation: "Table for two, please." },
          { id: "e2", type: "flashcard", term: "Tem mesa livre?", translation: "Do you have a free table?" },
          { id: "e3", type: "flashcard", term: "Pode dar-me o menu?", translation: "Can you give me the menu?" },
          { id: "e4", type: "flashcard", term: "O que recomenda?", translation: "What do you recommend?" },
          { id: "e5", type: "flashcard", term: "Qual é o prato do dia?", translation: "What's the dish of the day?" },
          { id: "e6", type: "flashcard", term: "Queria este prato.", translation: "I'd like this dish." },
          { id: "e7", type: "flashcard", term: "Para beber, água.", translation: "To drink, water." },
          { id: "e8", type: "flashcard", term: "Sem cebola, por favor.", translation: "Without onion, please." },
          { id: "e9", type: "flashcard", term: "Está muito bom.", translation: "It's very good." },
          { id: "e10", type: "flashcard", term: "Está frio.", translation: "It's cold." },
          { id: "e11", type: "flashcard", term: "Pode aquecer?", translation: "Can you heat it up?" },
          { id: "e12", type: "flashcard", term: "A conta, por favor.", translation: "The bill, please." },
          { id: "e13", type: "flashcard", term: "Está incluído o serviço?", translation: "Is service included?" },
          { id: "e14", type: "flashcard", term: "Pode dividir a conta?", translation: "Can you split the bill?" },
          { id: "e15", type: "flashcard", term: "Onde fica a casa de banho?", translation: "Where is the bathroom?" },
          { id: "e16", type: "flashcard", term: "Mais um café, por favor.", translation: "One more coffee, please." },
          { id: "e17", type: "flashcard", term: "Estou cheio.", translation: "I'm full." },
          { id: "e18", type: "flashcard", term: "Estava delicioso.", translation: "It was delicious." },
        ],
      },
      {
        id: "phrases1l3",
        title: "Pedir Ajuda (Asking for Help)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "Pode ajudar-me?", translation: "Can you help me?" },
          { id: "e2", type: "flashcard", term: "Estou perdido.", translation: "I'm lost." },
          { id: "e3", type: "flashcard", term: "Onde fica...?", translation: "Where is...?" },
          { id: "e4", type: "flashcard", term: "Como vou para...?", translation: "How do I get to...?" },
          { id: "e5", type: "flashcard", term: "É longe?", translation: "Is it far?" },
          { id: "e6", type: "flashcard", term: "É perto?", translation: "Is it near?" },
          { id: "e7", type: "flashcard", term: "Quantos minutos a pé?", translation: "How many minutes on foot?" },
          { id: "e8", type: "flashcard", term: "Fala inglês?", translation: "Do you speak English?" },
          { id: "e9", type: "flashcard", term: "Não compreendo.", translation: "I don't understand." },
          { id: "e10", type: "flashcard", term: "Pode repetir?", translation: "Can you repeat?" },
          { id: "e11", type: "flashcard", term: "Mais devagar, por favor.", translation: "Slower, please." },
          { id: "e12", type: "flashcard", term: "Pode escrever?", translation: "Can you write it down?" },
          { id: "e13", type: "flashcard", term: "Como se diz... em português?", translation: "How do you say... in Portuguese?" },
          { id: "e14", type: "flashcard", term: "Preciso de ajuda.", translation: "I need help." },
          { id: "e15", type: "flashcard", term: "Há alguém que fale inglês?", translation: "Is there anyone who speaks English?" },
        ],
      },
    ],
  },
  {
    id: "phrases2",
    title: "Essential Phrases II: Time & Emotions",
    description: "Time expressions, emotions, and conversational phrases.",
    lessons: [
      {
        id: "phrases2l1",
        title: "Tempo e Frequência (Time & Frequency)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "todos os dias", translation: "every day" },
          { id: "e2", type: "flashcard", term: "às vezes", translation: "sometimes" },
          { id: "e3", type: "flashcard", term: "nunca", translation: "never" },
          { id: "e4", type: "flashcard", term: "sempre", translation: "always" },
          { id: "e5", type: "flashcard", term: "muitas vezes", translation: "often" },
          { id: "e6", type: "flashcard", term: "raramente", translation: "rarely" },
          { id: "e7", type: "flashcard", term: "ontem", translation: "yesterday" },
          { id: "e8", type: "flashcard", term: "hoje", translation: "today" },
          { id: "e9", type: "flashcard", term: "amanhã", translation: "tomorrow" },
          { id: "e10", type: "flashcard", term: "esta manhã", translation: "this morning" },
          { id: "e11", type: "flashcard", term: "esta tarde", translation: "this afternoon" },
          { id: "e12", type: "flashcard", term: "esta noite", translation: "tonight" },
          { id: "e13", type: "flashcard", term: "na semana passada", translation: "last week" },
          { id: "e14", type: "flashcard", term: "na próxima semana", translation: "next week" },
          { id: "e15", type: "flashcard", term: "há cinco minutos", translation: "five minutes ago" },
          { id: "e16", type: "flashcard", term: "daqui a pouco", translation: "in a little while" },
          { id: "e17", type: "flashcard", term: "Que horas são?", translation: "What time is it?" },
          { id: "e18", type: "flashcard", term: "São três horas.", translation: "It's three o'clock." },
        ],
      },
      {
        id: "phrases2l2",
        title: "Sentimentos (Feelings)",
        xp: 30,
        exercises: [
          { id: "e1", type: "flashcard", term: "Estou feliz.", translation: "I'm happy." },
          { id: "e2", type: "flashcard", term: "Estou triste.", translation: "I'm sad." },
          { id: "e3", type: "flashcard", term: "Estou nervoso.", translation: "I'm nervous." },
          { id: "e4", type: "flashcard", term: "Estou calmo.", translation: "I'm calm." },
          { id: "e5", type: "flashcard", term: "Estou com medo.", translation: "I'm scared." },
          { id: "e6", type: "flashcard", term: "Estou zangado.", translation: "I'm angry." },
          { id: "e7", type: "flashcard", term: "Estou preocupado.", translation: "I'm worried." },
          { id: "e8", type: "flashcard", term: "Estou surpreso.", translation: "I'm surprised." },
          { id: "e9", type: "flashcard", term: "Estou confuso.", translation: "I'm confused." },
          { id: "e10", type: "flashcard", term: "Estou farto.", translation: "I'm fed up." },
          { id: "e11", type: "flashcard", term: "Como se sente?", translation: "How do you feel?" },
          { id: "e12", type: "flashcard", term: "Sinto-me bem.", translation: "I feel good." },
          { id: "e13", type: "flashcard", term: "Sinto-me mal.", translation: "I feel bad." },
          { id: "e14", type: "flashcard", term: "Não me sinto bem.", translation: "I don't feel well." },
        ],
      },
      {
        id: "phrases2l3",
        title: "Expressões Úteis (Useful Expressions)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "Com certeza.", translation: "Certainly." },
          { id: "e2", type: "flashcard", term: "Claro que sim.", translation: "Of course." },
          { id: "e3", type: "flashcard", term: "Claro que não.", translation: "Of course not." },
          { id: "e4", type: "flashcard", term: "Talvez.", translation: "Maybe." },
          { id: "e5", type: "flashcard", term: "Provavelmente.", translation: "Probably." },
          { id: "e6", type: "flashcard", term: "Não sei.", translation: "I don't know." },
          { id: "e7", type: "flashcard", term: "Não tenho a certeza.", translation: "I'm not sure." },
          { id: "e8", type: "flashcard", term: "Tem razão.", translation: "You're right." },
          { id: "e9", type: "flashcard", term: "Não tem razão.", translation: "You're wrong." },
          { id: "e10", type: "flashcard", term: "Que pena!", translation: "What a pity!" },
          { id: "e11", type: "flashcard", term: "Que sorte!", translation: "What luck!" },
          { id: "e12", type: "flashcard", term: "Não faz mal.", translation: "It doesn't matter." },
          { id: "e13", type: "flashcard", term: "Boa sorte!", translation: "Good luck!" },
          { id: "e14", type: "flashcard", term: "Parabéns!", translation: "Congratulations!" },
          { id: "e15", type: "flashcard", term: "Que bom!", translation: "How nice!" },
          { id: "e16", type: "flashcard", term: "Que chatice!", translation: "How annoying!" },
          { id: "e17", type: "flashcard", term: "Não há problema.", translation: "No problem." },
          { id: "e18", type: "flashcard", term: "Sem dúvida.", translation: "Without a doubt." },
        ],
      },
    ],
  },
  {
    id: "vocab6",
    title: "Advanced Vocabulary I: Clothing, Weather & Home",
    description: "Complete clothing vocabulary, detailed weather expressions, and home/furniture terms.",
    lessons: [
      {
        id: "vocab6l1",
        title: "Roupa Completa (Complete Clothing)",
        xp: 45,
        exercises: [
          { id: "e1", type: "flashcard", term: "camisa", translation: "shirt" },
          { id: "e2", type: "flashcard", term: "t-shirt", translation: "t-shirt" },
          { id: "e3", type: "flashcard", term: "camisola", translation: "sweater" },
          { id: "e4", type: "flashcard", term: "casaco", translation: "jacket/coat" },
          { id: "e5", type: "flashcard", term: "calças", translation: "trousers/pants" },
          { id: "e6", type: "flashcard", term: "calções", translation: "shorts" },
          { id: "e7", type: "flashcard", term: "jeans", translation: "jeans" },
          { id: "e8", type: "flashcard", term: "saia", translation: "skirt" },
          { id: "e9", type: "flashcard", term: "vestido", translation: "dress" },
          { id: "e10", type: "flashcard", term: "sapatos", translation: "shoes" },
          { id: "e11", type: "flashcard", term: "ténis", translation: "sneakers" },
          { id: "e12", type: "flashcard", term: "sandálias", translation: "sandals" },
          { id: "e13", type: "flashcard", term: "botas", translation: "boots" },
          { id: "e14", type: "flashcard", term: "meias", translation: "socks" },
          { id: "e15", type: "flashcard", term: "cuecas", translation: "underwear (m.)" },
          { id: "e16", type: "flashcard", term: "cuecas", translation: "panties (f.)" },
          { id: "e17", type: "flashcard", term: "soutien", translation: "bra" },
          { id: "e18", type: "flashcard", term: "chapéu", translation: "hat" },
          { id: "e19", type: "flashcard", term: "boné", translation: "cap" },
          { id: "e20", type: "flashcard", term: "lenço", translation: "scarf" },
          { id: "e21", type: "flashcard", term: "luvas", translation: "gloves" },
          { id: "e22", type: "flashcard", term: "cinto", translation: "belt" },
          { id: "e23", type: "flashcard", term: "óculos", translation: "glasses" },
          { id: "e24", type: "flashcard", term: "relógio", translation: "watch" },
          { id: "e25", type: "flashcard", term: "Que roupa veste?", translation: "What clothes do you wear?" },
          { id: "e26", type: "flashcard", term: "Fica-lhe bem.", translation: "It suits you." },
          { id: "e27", type: "mcq", prompt: "O que usamos nos pés?", options: ["sapatos", "luvas", "chapéu"], correct: "sapatos" },
        ],
      },
      {
        id: "vocab6l2", 
        title: "Tempo Detalhado (Detailed Weather)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "Que tempo faz?", translation: "What's the weather like?" },
          { id: "e2", type: "flashcard", term: "Faz sol.", translation: "It's sunny." },
          { id: "e3", type: "flashcard", term: "Está nublado.", translation: "It's cloudy." },
          { id: "e4", type: "flashcard", term: "Está a chover.", translation: "It's raining." },
          { id: "e5", type: "flashcard", term: "Está a nevar.", translation: "It's snowing." },
          { id: "e6", type: "flashcard", term: "Há muito vento.", translation: "It's very windy." },
          { id: "e7", type: "flashcard", term: "Está muito frio.", translation: "It's very cold." },
          { id: "e8", type: "flashcard", term: "Está muito quente.", translation: "It's very hot." },
          { id: "e9", type: "flashcard", term: "Está um dia lindo.", translation: "It's a beautiful day." },
          { id: "e10", type: "flashcard", term: "O tempo está mau.", translation: "The weather is bad." },
          { id: "e11", type: "flashcard", term: "tempestade", translation: "storm" },
          { id: "e12", type: "flashcard", term: "trovão", translation: "thunder" },
          { id: "e13", type: "flashcard", term: "relâmpago", translation: "lightning" },
          { id: "e14", type: "flashcard", term: "granizo", translation: "hail" },
          { id: "e15", type: "flashcard", term: "nevoeiro", translation: "fog" },
          { id: "e16", type: "flashcard", term: "temperatura", translation: "temperature" },
          { id: "e17", type: "flashcard", term: "graus", translation: "degrees" },
          { id: "e18", type: "flashcard", term: "Quantos graus estão?", translation: "How many degrees is it?" },
          { id: "e19", type: "flashcard", term: "Estão quinze graus.", translation: "It's fifteen degrees." },
        ],
      },
      {
        id: "vocab6l3",
        title: "Casa e Móveis (Home & Furniture)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "móveis", translation: "furniture" },
          { id: "e2", type: "flashcard", term: "mesa", translation: "table" },
          { id: "e3", type: "flashcard", term: "cadeira", translation: "chair" },
          { id: "e4", type: "flashcard", term: "sofá", translation: "sofa" },
          { id: "e5", type: "flashcard", term: "cama", translation: "bed" },
          { id: "e6", type: "flashcard", term: "armário", translation: "wardrobe/closet" },
          { id: "e7", type: "flashcard", term: "estante", translation: "bookshelf" },
          { id: "e8", type: "flashcard", term: "secretária", translation: "desk" },
          { id: "e9", type: "flashcard", term: "televisão", translation: "television" },
          { id: "e10", type: "flashcard", term: "frigorífico", translation: "refrigerator" },
          { id: "e11", type: "flashcard", term: "fogão", translation: "stove" },
          { id: "e12", type: "flashcard", term: "máquina de lavar", translation: "washing machine" },
          { id: "e13", type: "flashcard", term: "espelho", translation: "mirror" },
          { id: "e14", type: "flashcard", term: "cortinas", translation: "curtains" },
          { id: "e15", type: "flashcard", term: "tapete", translation: "carpet/rug" },
          { id: "e16", type: "flashcard", term: "almofada", translation: "pillow/cushion" },
          { id: "e17", type: "flashcard", term: "lâmpada", translation: "lamp" },
          { id: "e18", type: "flashcard", term: "janela", translation: "window" },
          { id: "e19", type: "flashcard", term: "porta", translation: "door" },
          { id: "e20", type: "flashcard", term: "chão", translation: "floor" },
          { id: "e21", type: "flashcard", term: "teto", translation: "ceiling" },
          { id: "e22", type: "flashcard", term: "parede", translation: "wall" },
        ],
      },
    ],
  },
  {
    id: "vocab7",
    title: "Advanced Vocabulary II: Technology, Hobbies & Entertainment", 
    description: "Modern technology terms, hobbies, sports, and entertainment vocabulary.",
    lessons: [
      {
        id: "vocab7l1",
        title: "Tecnologia (Technology)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "computador", translation: "computer" },
          { id: "e2", type: "flashcard", term: "portátil", translation: "laptop" },
          { id: "e3", type: "flashcard", term: "telemóvel", translation: "mobile phone" },
          { id: "e4", type: "flashcard", term: "telefone", translation: "telephone" },
          { id: "e5", type: "flashcard", term: "internet", translation: "internet" },
          { id: "e6", type: "flashcard", term: "email", translation: "email" },
          { id: "e7", type: "flashcard", term: "site", translation: "website" },
          { id: "e8", type: "flashcard", term: "aplicação", translation: "app" },
          { id: "e9", type: "flashcard", term: "rede social", translation: "social network" },
          { id: "e10", type: "flashcard", term: "câmara", translation: "camera" },
          { id: "e11", type: "flashcard", term: "foto", translation: "photo" },
          { id: "e12", type: "flashcard", term: "vídeo", translation: "video" },
          { id: "e13", type: "flashcard", term: "música", translation: "music" },
          { id: "e14", type: "flashcard", term: "auscultadores", translation: "headphones" },
          { id: "e15", type: "flashcard", term: "carregador", translation: "charger" },
          { id: "e16", type: "flashcard", term: "bateria", translation: "battery" },
          { id: "e17", type: "flashcard", term: "ecrã", translation: "screen" },
          { id: "e18", type: "flashcard", term: "rato", translation: "mouse (computer)" },
          { id: "e19", type: "flashcard", term: "teclado", translation: "keyboard" },
          { id: "e20", type: "flashcard", term: "Tens wifi?", translation: "Do you have wifi?" },
          { id: "e21", type: "flashcard", term: "Qual é a password?", translation: "What's the password?" },
        ],
      },
      {
        id: "vocab7l2",
        title: "Desportos e Hobbies (Sports & Hobbies)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "desporto", translation: "sport" },
          { id: "e2", type: "flashcard", term: "futebol", translation: "football/soccer" },
          { id: "e3", type: "flashcard", term: "ténis", translation: "tennis" },
          { id: "e4", type: "flashcard", term: "basquetebol", translation: "basketball" },
          { id: "e5", type: "flashcard", term: "natação", translation: "swimming" },
          { id: "e6", type: "flashcard", term: "corrida", translation: "running" },
          { id: "e7", type: "flashcard", term: "ginásio", translation: "gym" },
          { id: "e8", type: "flashcard", term: "ciclismo", translation: "cycling" },
          { id: "e9", type: "flashcard", term: "caminhada", translation: "hiking/walking" },
          { id: "e10", type: "flashcard", term: "leitura", translation: "reading" },
          { id: "e11", type: "flashcard", term: "livro", translation: "book" },
          { id: "e12", type: "flashcard", term: "revista", translation: "magazine" },
          { id: "e13", type: "flashcard", term: "jornal", translation: "newspaper" },
          { id: "e14", type: "flashcard", term: "cinema", translation: "cinema" },
          { id: "e15", type: "flashcard", term: "filme", translation: "movie" },
          { id: "e16", type: "flashcard", term: "teatro", translation: "theater" },
          { id: "e17", type: "flashcard", term: "concerto", translation: "concert" },
          { id: "e18", type: "flashcard", term: "festa", translation: "party" },
          { id: "e19", type: "flashcard", term: "Que desporto pratica?", translation: "What sport do you play?" },
          { id: "e20", type: "flashcard", term: "Gosto de ler.", translation: "I like to read." },
        ],
      },
      {
        id: "vocab7l3", 
        title: "Entretenimento (Entertainment)",
        xp: 30,
        exercises: [
          { id: "e1", type: "flashcard", term: "diversão", translation: "fun/entertainment" },
          { id: "e2", type: "flashcard", term: "jogo", translation: "game" },
          { id: "e3", type: "flashcard", term: "cartas", translation: "cards" },
          { id: "e4", type: "flashcard", term: "puzzle", translation: "puzzle" },
          { id: "e5", type: "flashcard", term: "pintura", translation: "painting" },
          { id: "e6", type: "flashcard", term: "desenho", translation: "drawing" },
          { id: "e7", type: "flashcard", term: "dança", translation: "dance" },
          { id: "e8", type: "flashcard", term: "cantar", translation: "singing" },
          { id: "e9", type: "flashcard", term: "cozinhar", translation: "cooking" },
          { id: "e10", type: "flashcard", term: "jardinagem", translation: "gardening" },
          { id: "e11", type: "flashcard", term: "viagem", translation: "travel" },
          { id: "e12", type: "flashcard", term: "fotografia", translation: "photography" },
          { id: "e13", type: "flashcard", term: "colecção", translation: "collection" },
          { id: "e14", type: "flashcard", term: "O que gosta de fazer?", translation: "What do you like to do?" },
          { id: "e15", type: "flashcard", term: "Nos tempos livres...", translation: "In free time..." },
        ],
      },
    ],
  },
  {
    id: "cultural1",
    title: "Portuguese Culture & Traditions",
    description: "Essential Portuguese cultural knowledge, traditions, and country-specific vocabulary.",
    lessons: [
      {
        id: "cultural1l1",
        title: "Comida Portuguesa (Portuguese Food)",
        xp: 45,
        exercises: [
          { id: "e1", type: "flashcard", term: "bacalhau", translation: "codfish" },
          { id: "e2", type: "flashcard", term: "sardinha", translation: "sardine" },
          { id: "e3", type: "flashcard", term: "francesinha", translation: "francesinha (Porto sandwich)" },
          { id: "e4", type: "flashcard", term: "pastel de nata", translation: "custard tart" },
          { id: "e5", type: "flashcard", term: "caldo verde", translation: "green soup" },
          { id: "e6", type: "flashcard", term: "bifana", translation: "pork sandwich" },
          { id: "e7", type: "flashcard", term: "bica", translation: "espresso (Lisbon)" },
          { id: "e8", type: "flashcard", term: "cimbalino", translation: "espresso (Porto)" },
          { id: "e9", type: "flashcard", term: "galão", translation: "milky coffee" },
          { id: "e10", type: "flashcard", term: "vinho verde", translation: "green wine" },
          { id: "e11", type: "flashcard", term: "vinho do Porto", translation: "Port wine" },
          { id: "e12", type: "flashcard", term: "chouriço", translation: "chorizo sausage" },
          { id: "e13", type: "flashcard", term: "queijo da Serra", translation: "Serra cheese" },
          { id: "e14", type: "flashcard", term: "broa", translation: "corn bread" },
          { id: "e15", type: "flashcard", term: "açorda", translation: "bread soup" },
          { id: "e16", type: "flashcard", term: "cataplana", translation: "seafood stew" },
          { id: "e17", type: "flashcard", term: "leitão", translation: "roast piglet" },
          { id: "e18", type: "flashcard", term: "pastéis de Belém", translation: "Belém custard tarts" },
          { id: "e19", type: "flashcard", term: "Onde há boa comida portuguesa?", translation: "Where is there good Portuguese food?" },
          { id: "e20", type: "flashcard", term: "Esta é uma especialidade portuguesa.", translation: "This is a Portuguese specialty." },
        ],
      },
      {
        id: "cultural1l2",
        title: "Cidades e Lugares (Cities & Places)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "Lisboa", translation: "Lisbon" },
          { id: "e2", type: "flashcard", term: "Porto", translation: "Porto" },
          { id: "e3", type: "flashcard", term: "Coimbra", translation: "Coimbra" },
          { id: "e4", type: "flashcard", term: "Braga", translation: "Braga" },
          { id: "e5", type: "flashcard", term: "Faro", translation: "Faro" },
          { id: "e6", type: "flashcard", term: "Aveiro", translation: "Aveiro" },
          { id: "e7", type: "flashcard", term: "Sintra", translation: "Sintra" },
          { id: "e8", type: "flashcard", term: "Óbidos", translation: "Óbidos" },
          { id: "e9", type: "flashcard", term: "Algarve", translation: "Algarve" },
          { id: "e10", type: "flashcard", term: "Douro", translation: "Douro" },
          { id: "e11", type: "flashcard", term: "Minho", translation: "Minho" },
          { id: "e12", type: "flashcard", term: "Beira", translation: "Beira" },
          { id: "e13", type: "flashcard", term: "norte", translation: "north" },
          { id: "e14", type: "flashcard", term: "sul", translation: "south" },
          { id: "e15", type: "flashcard", term: "centro", translation: "center" },
          { id: "e16", type: "flashcard", term: "costa", translation: "coast" },
          { id: "e17", type: "flashcard", term: "interior", translation: "interior" },
          { id: "e18", type: "flashcard", term: "Sou de Lisboa.", translation: "I'm from Lisbon." },
          { id: "e19", type: "flashcard", term: "Já visitou o Porto?", translation: "Have you visited Porto?" },
          { id: "e20", type: "flashcard", term: "Que cidade recomenda?", translation: "What city do you recommend?" },
        ],
      },
      {
        id: "cultural1l3",
        title: "Tradições (Traditions)",
        xp: 35,
        exercises: [
          { id: "e1", type: "flashcard", term: "fado", translation: "fado (traditional song)" },
          { id: "e2", type: "flashcard", term: "festa", translation: "festival/party" },
          { id: "e3", type: "flashcard", term: "santos populares", translation: "popular saints festivals" },
          { id: "e4", type: "flashcard", term: "São João", translation: "St. John's day" },
          { id: "e5", type: "flashcard", term: "Natal", translation: "Christmas" },
          { id: "e6", type: "flashcard", term: "Páscoa", translation: "Easter" },
          { id: "e7", type: "flashcard", term: "Carnaval", translation: "Carnival" },
          { id: "e8", type: "flashcard", term: "Dia de Portugal", translation: "Portugal Day" },
          { id: "e9", type: "flashcard", term: "azulejo", translation: "Portuguese tile" },
          { id: "e10", type: "flashcard", term: "lenço dos namorados", translation: "lovers' handkerchief" },
          { id: "e11", type: "flashcard", term: "galo de Barcelos", translation: "Barcelos rooster" },
          { id: "e12", type: "flashcard", term: "rancho folclórico", translation: "folk dance group" },
          { id: "e13", type: "flashcard", term: "procissão", translation: "procession" },
          { id: "e14", type: "flashcard", term: "romaria", translation: "pilgrimage" },
          { id: "e15", type: "flashcard", term: "Que tradições portuguesas conhece?", translation: "What Portuguese traditions do you know?" },
        ],
      },
    ],
  },
  {
    id: "expert1",
    title: "A1 Expert Level I: Advanced Situations",
    description: "Bank, post office, medical, and emergency vocabulary for complete A1 mastery.",
    lessons: [
      {
        id: "expert1l1",
        title: "Banco e Dinheiro (Bank & Money)",
        xp: 50,
        exercises: [
          { id: "e1", type: "flashcard", term: "banco", translation: "bank" },
          { id: "e2", type: "flashcard", term: "dinheiro", translation: "money" },
          { id: "e3", type: "flashcard", term: "euro", translation: "euro" },
          { id: "e4", type: "flashcard", term: "cêntimo", translation: "cent" },
          { id: "e5", type: "flashcard", term: "nota", translation: "banknote" },
          { id: "e6", type: "flashcard", term: "moeda", translation: "coin" },
          { id: "e7", type: "flashcard", term: "cartão de crédito", translation: "credit card" },
          { id: "e8", type: "flashcard", term: "cartão de débito", translation: "debit card" },
          { id: "e9", type: "flashcard", term: "multibanco", translation: "ATM" },
          { id: "e10", type: "flashcard", term: "conta bancária", translation: "bank account" },
          { id: "e11", type: "flashcard", term: "levantar dinheiro", translation: "withdraw money" },
          { id: "e12", type: "flashcard", term: "depositar", translation: "deposit" },
          { id: "e13", type: "flashcard", term: "transferência", translation: "transfer" },
          { id: "e14", type: "flashcard", term: "saldo", translation: "balance" },
          { id: "e15", type: "flashcard", term: "empréstimo", translation: "loan" },
          { id: "e16", type: "flashcard", term: "taxa de câmbio", translation: "exchange rate" },
          { id: "e17", type: "flashcard", term: "Queria abrir uma conta.", translation: "I'd like to open an account." },
          { id: "e18", type: "flashcard", term: "Qual é o meu saldo?", translation: "What is my balance?" },
          { id: "e19", type: "flashcard", term: "Posso levantar dinheiro?", translation: "Can I withdraw money?" },
          { id: "e20", type: "flashcard", term: "O multibanco não funciona.", translation: "The ATM doesn't work." },
        ],
      },
      {
        id: "expert1l2",
        title: "Correios e Comunicações (Post & Communications)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "correios", translation: "post office" },
          { id: "e2", type: "flashcard", term: "carta", translation: "letter" },
          { id: "e3", type: "flashcard", term: "postal", translation: "postcard" },
          { id: "e4", type: "flashcard", term: "encomenda", translation: "package" },
          { id: "e5", type: "flashcard", term: "selo", translation: "stamp" },
          { id: "e6", type: "flashcard", term: "envelope", translation: "envelope" },
          { id: "e7", type: "flashcard", term: "morada", translation: "address" },
          { id: "e8", type: "flashcard", term: "código postal", translation: "postal code" },
          { id: "e9", type: "flashcard", term: "remetente", translation: "sender" },
          { id: "e10", type: "flashcard", term: "destinatário", translation: "recipient" },
          { id: "e11", type: "flashcard", term: "registado", translation: "registered" },
          { id: "e12", type: "flashcard", term: "urgente", translation: "urgent" },
          { id: "e13", type: "flashcard", term: "entrega", translation: "delivery" },
          { id: "e14", type: "flashcard", term: "Queria enviar esta carta.", translation: "I'd like to send this letter." },
          { id: "e15", type: "flashcard", term: "Quanto custa para o estrangeiro?", translation: "How much does it cost abroad?" },
          { id: "e16", type: "flashcard", term: "Quando chega?", translation: "When does it arrive?" },
        ],
      },
      {
        id: "expert1l3",
        title: "Médico e Farmácia (Doctor & Pharmacy)",
        xp: 45,
        exercises: [
          { id: "e1", type: "flashcard", term: "médico", translation: "doctor" },
          { id: "e2", type: "flashcard", term: "enfermeiro", translation: "nurse" },
          { id: "e3", type: "flashcard", term: "farmácia", translation: "pharmacy" },
          { id: "e4", type: "flashcard", term: "hospital", translation: "hospital" },
          { id: "e5", type: "flashcard", term: "clínica", translation: "clinic" },
          { id: "e6", type: "flashcard", term: "receita", translation: "prescription" },
          { id: "e7", type: "flashcard", term: "medicamento", translation: "medicine" },
          { id: "e8", type: "flashcard", term: "comprimido", translation: "pill/tablet" },
          { id: "e9", type: "flashcard", term: "xarope", translation: "syrup" },
          { id: "e10", type: "flashcard", term: "pomada", translation: "ointment" },
          { id: "e11", type: "flashcard", term: "injeção", translation: "injection" },
          { id: "e12", type: "flashcard", term: "exame", translation: "examination" },
          { id: "e13", type: "flashcard", term: "análises", translation: "tests" },
          { id: "e14", type: "flashcard", term: "sintoma", translation: "symptom" },
          { id: "e15", type: "flashcard", term: "dor", translation: "pain" },
          { id: "e16", type: "flashcard", term: "febre", translation: "fever" },
          { id: "e17", type: "flashcard", term: "tosse", translation: "cough" },
          { id: "e18", type: "flashcard", term: "constipação", translation: "cold" },
          { id: "e19", type: "flashcard", term: "Preciso de um médico.", translation: "I need a doctor." },
          { id: "e20", type: "flashcard", term: "Onde fica a farmácia?", translation: "Where is the pharmacy?" },
          { id: "e21", type: "flashcard", term: "Tenho dores.", translation: "I have pain." },
          { id: "e22", type: "flashcard", term: "Não me sinto bem.", translation: "I don't feel well." },
        ],
      },
    ],
  },
  {
    id: "expert2",
    title: "A1 Expert Level II: Grammar Mastery",
    description: "Complete verb conjugations, articles, pronouns, and grammar essentials for A1 expertise.",
    lessons: [
      {
        id: "expert2l1",
        title: "Verbos Ser/Estar/Ter (Complete)",
        xp: 50,
        exercises: [
          { id: "e1", type: "flashcard", term: "eu sou", translation: "I am (permanent)" },
          { id: "e2", type: "flashcard", term: "tu és", translation: "you are (permanent)" },
          { id: "e3", type: "flashcard", term: "ele/ela é", translation: "he/she is (permanent)" },
          { id: "e4", type: "flashcard", term: "nós somos", translation: "we are (permanent)" },
          { id: "e5", type: "flashcard", term: "vocês são", translation: "you are (permanent)" },
          { id: "e6", type: "flashcard", term: "eles/elas são", translation: "they are (permanent)" },
          { id: "e7", type: "flashcard", term: "eu estou", translation: "I am (temporary)" },
          { id: "e8", type: "flashcard", term: "tu estás", translation: "you are (temporary)" },
          { id: "e9", type: "flashcard", term: "ele/ela está", translation: "he/she is (temporary)" },
          { id: "e10", type: "flashcard", term: "nós estamos", translation: "we are (temporary)" },
          { id: "e11", type: "flashcard", term: "vocês estão", translation: "you are (temporary)" },
          { id: "e12", type: "flashcard", term: "eles/elas estão", translation: "they are (temporary)" },
          { id: "e13", type: "flashcard", term: "eu tenho", translation: "I have" },
          { id: "e14", type: "flashcard", term: "tu tens", translation: "you have" },
          { id: "e15", type: "flashcard", term: "ele/ela tem", translation: "he/she has" },
          { id: "e16", type: "flashcard", term: "nós temos", translation: "we have" },
          { id: "e17", type: "flashcard", term: "vocês têm", translation: "you have" },
          { id: "e18", type: "flashcard", term: "eles/elas têm", translation: "they have" },
          { id: "e19", type: "conjugationGrid", prompt: "Conjuga 'ser' no presente", correct: ["sou","és","é","somos","são","são"] },
          { id: "e20", type: "conjugationGrid", prompt: "Conjuga 'estar' no presente", correct: ["estou","estás","está","estamos","estão","estão"] },
        ],
      },
      {
        id: "expert2l2",
        title: "Artigos e Possessivos (Articles & Possessives)",
        xp: 45,
        exercises: [
          { id: "e1", type: "flashcard", term: "o", translation: "the (masculine singular)" },
          { id: "e2", type: "flashcard", term: "a", translation: "the (feminine singular)" },
          { id: "e3", type: "flashcard", term: "os", translation: "the (masculine plural)" },
          { id: "e4", type: "flashcard", term: "as", translation: "the (feminine plural)" },
          { id: "e5", type: "flashcard", term: "um", translation: "a/an (masculine)" },
          { id: "e6", type: "flashcard", term: "uma", translation: "a/an (feminine)" },
          { id: "e7", type: "flashcard", term: "uns", translation: "some (masculine)" },
          { id: "e8", type: "flashcard", term: "umas", translation: "some (feminine)" },
          { id: "e9", type: "flashcard", term: "meu/minha", translation: "my" },
          { id: "e10", type: "flashcard", term: "teu/tua", translation: "your (informal)" },
          { id: "e11", type: "flashcard", term: "seu/sua", translation: "his/her/your (formal)" },
          { id: "e12", type: "flashcard", term: "nosso/nossa", translation: "our" },
          { id: "e13", type: "flashcard", term: "o meu carro", translation: "my car" },
          { id: "e14", type: "flashcard", term: "a minha casa", translation: "my house" },
          { id: "e15", type: "flashcard", term: "os nossos filhos", translation: "our children" },
          { id: "e16", type: "flashcard", term: "as suas irmãs", translation: "his/her sisters" },
          { id: "e17", type: "mcq", prompt: "__ livro (the book)", options: ["o", "a", "os"], correct: "o" },
          { id: "e18", type: "mcq", prompt: "__ mesa (the table)", options: ["o", "a", "os"], correct: "a" },
        ],
      },
      {
        id: "expert2l3",
        title: "Perguntas e Negações (Questions & Negations)",
        xp: 40,
        exercises: [
          { id: "e1", type: "flashcard", term: "quem", translation: "who" },
          { id: "e2", type: "flashcard", term: "que/o que", translation: "what" },
          { id: "e3", type: "flashcard", term: "quando", translation: "when" },
          { id: "e4", type: "flashcard", term: "onde", translation: "where" },
          { id: "e5", type: "flashcard", term: "como", translation: "how" },
          { id: "e6", type: "flashcard", term: "porquê", translation: "why" },
          { id: "e7", type: "flashcard", term: "quanto/quantos", translation: "how much/many" },
          { id: "e8", type: "flashcard", term: "qual/quais", translation: "which" },
          { id: "e9", type: "flashcard", term: "não", translation: "no/not" },
          { id: "e10", type: "flashcard", term: "nunca", translation: "never" },
          { id: "e11", type: "flashcard", term: "nada", translation: "nothing" },
          { id: "e12", type: "flashcard", term: "ninguém", translation: "nobody" },
          { id: "e13", type: "flashcard", term: "Quem é?", translation: "Who is it?" },
          { id: "e14", type: "flashcard", term: "O que faz?", translation: "What do you do?" },
          { id: "e15", type: "flashcard", term: "Quando parte?", translation: "When do you leave?" },
          { id: "e16", type: "flashcard", term: "Onde mora?", translation: "Where do you live?" },
          { id: "e17", type: "flashcard", term: "Como está?", translation: "How are you?" },
          { id: "e18", type: "flashcard", term: "Não sei.", translation: "I don't know." },
          { id: "e19", type: "flashcard", term: "Nunca vou.", translation: "I never go." },
        ],
      },
    ],
  },
  {
    id: "expert3",
    title: "A1 Expert Level III: Real-World Mastery",
    description: "Advanced conversational skills, complex phrases, and cultural fluency for A1 expertise.",
    lessons: [
      {
        id: "expert3l1",
        title: "Conversas Avançadas (Advanced Conversations)",
        xp: 55,
        exercises: [
          { id: "e1", type: "flashcard", term: "Na minha opinião...", translation: "In my opinion..." },
          { id: "e2", type: "flashcard", term: "Concordo consigo.", translation: "I agree with you." },
          { id: "e3", type: "flashcard", term: "Não concordo.", translation: "I disagree." },
          { id: "e4", type: "flashcard", term: "Tem razão.", translation: "You're right." },
          { id: "e5", type: "flashcard", term: "Isso é verdade.", translation: "That's true." },
          { id: "e6", type: "flashcard", term: "Não é bem assim.", translation: "It's not quite like that." },
          { id: "e7", type: "flashcard", term: "Por um lado...", translation: "On one hand..." },
          { id: "e8", type: "flashcard", term: "Por outro lado...", translation: "On the other hand..." },
          { id: "e9", type: "flashcard", term: "De qualquer forma...", translation: "Anyway..." },
          { id: "e10", type: "flashcard", term: "Quer dizer que...", translation: "You mean that..." },
          { id: "e11", type: "flashcard", term: "Ou seja...", translation: "In other words..." },
          { id: "e12", type: "flashcard", term: "Por exemplo...", translation: "For example..." },
          { id: "e13", type: "flashcard", term: "Além disso...", translation: "Furthermore..." },
          { id: "e14", type: "flashcard", term: "Mesmo assim...", translation: "Even so..." },
          { id: "e15", type: "flashcard", term: "De facto...", translation: "In fact..." },
          { id: "e16", type: "flashcard", term: "Claro que sim!", translation: "Of course!" },
          { id: "e17", type: "flashcard", term: "Sem dúvida!", translation: "Without a doubt!" },
          { id: "e18", type: "flashcard", term: "Isso mesmo!", translation: "Exactly!" },
        ],
      },
      {
        id: "expert3l2",
        title: "Situações Complexas (Complex Situations)",
        xp: 50,
        exercises: [
          { id: "e1", type: "flashcard", term: "Há algum problema?", translation: "Is there a problem?" },
          { id: "e2", type: "flashcard", term: "O que se passa?", translation: "What's happening?" },
          { id: "e3", type: "flashcard", term: "Posso ajudar em alguma coisa?", translation: "Can I help with anything?" },
          { id: "e4", type: "flashcard", term: "Não se preocupe.", translation: "Don't worry." },
          { id: "e5", type: "flashcard", term: "Tudo bem?", translation: "Everything okay?" },
          { id: "e6", type: "flashcard", term: "Está tudo a correr bem?", translation: "Is everything going well?" },
          { id: "e7", type: "flashcard", term: "Lamento muito.", translation: "I'm very sorry." },
          { id: "e8", type: "flashcard", term: "Peço desculpa.", translation: "I apologize." },
          { id: "e9", type: "flashcard", term: "Não foi por querer.", translation: "It wasn't on purpose." },
          { id: "e10", type: "flashcard", term: "Foi um mal-entendido.", translation: "It was a misunderstanding." },
          { id: "e11", type: "flashcard", term: "Pode explicar melhor?", translation: "Can you explain better?" },
          { id: "e12", type: "flashcard", term: "Não percebi bem.", translation: "I didn't understand well." },
          { id: "e13", type: "flashcard", term: "Pode dar um exemplo?", translation: "Can you give an example?" },
          { id: "e14", type: "flashcard", term: "Vamos resolver isto.", translation: "Let's solve this." },
          { id: "e15", type: "flashcard", term: "Não há problema.", translation: "No problem." },
        ],
      },
      {
        id: "expert3l3",
        title: "Expressões de Especialista (Expert Expressions)",
        xp: 60,
        exercises: [
          { id: "e1", type: "flashcard", term: "Está na ponta da língua.", translation: "It's on the tip of my tongue." },
          { id: "e2", type: "flashcard", term: "Ficou claro como água.", translation: "It became clear as water." },
          { id: "e3", type: "flashcard", term: "É uma questão de tempo.", translation: "It's a matter of time." },
          { id: "e4", type: "flashcard", term: "Mais vale tarde que nunca.", translation: "Better late than never." },
          { id: "e5", type: "flashcard", term: "A prática faz a perfeição.", translation: "Practice makes perfect." },
          { id: "e6", type: "flashcard", term: "Cada macaco no seu galho.", translation: "Each to their own." },
          { id: "e7", type: "flashcard", term: "Águas passadas não movem moinhos.", translation: "Don't cry over spilled milk." },
          { id: "e8", type: "flashcard", term: "Quem não arrisca, não petisca.", translation: "Nothing ventured, nothing gained." },
          { id: "e9", type: "flashcard", term: "De pequenino se torce o pepino.", translation: "You can't teach an old dog new tricks." },
          { id: "e10", type: "flashcard", term: "Devagar se vai ao longe.", translation: "Slow and steady wins the race." },
          { id: "e11", type: "flashcard", term: "Como o tempo voa!", translation: "How time flies!" },
          { id: "e12", type: "flashcard", term: "Que mundo pequeno!", translation: "What a small world!" },
          { id: "e13", type: "flashcard", term: "A vida é assim.", translation: "Life is like that." },
          { id: "e14", type: "flashcard", term: "Há males que vêm por bem.", translation: "Every cloud has a silver lining." },
          { id: "e15", type: "flashcard", term: "O importante é participar.", translation: "The important thing is to participate." },
        ],
      },
    ],
  },
  // New content for Sprint 2+ (dense A1 coverage)
  {
    id: "m5",
    title: "Daily Routine, Time & Days",
    description: "Tell time, talk about your day, and use present tense verbs.",
    lessons: [
      {
        id: "m5l2",
        title: "Localizações",
        xp: 25,
        content: {
          title: "Locations and Describing Where Things Are",
          sections: [
            {
              title: "Basic Location Vocabulary",
              explanation: "Essential words for describing where things and people are located:",
              examples: [
                { pt: "aqui", en: "here", note: "close to speaker" },
                { pt: "aí", en: "there", note: "close to listener" },
                { pt: "ali", en: "over there", note: "distant from both" },
                { pt: "onde", en: "where", note: "question word" },
                { pt: "lugar", en: "place", note: "o lugar" },
                { pt: "sítio", en: "place/spot", note: "o sítio (informal)" },
                { pt: "posição", en: "position", note: "a posição" }
              ],
              keyPoints: [
                "Aqui/aí/ali show relative distance",
                "Sítio is more informal than lugar",
                "Always use ESTAR for locations"
              ]
            },
            {
              title: "Prepositions of Location",
              explanation: "Essential prepositions for describing precise locations:",
              examples: [
                { pt: "em", en: "in/on/at", note: "general location" },
                { pt: "em cima de", en: "on top of", note: "above something" },
                { pt: "embaixo de", en: "under/beneath", note: "below something" },
                { pt: "ao lado de", en: "next to", note: "beside" },
                { pt: "em frente de", en: "in front of", note: "facing" },
                { pt: "atrás de", en: "behind", note: "in back of" },
                { pt: "entre", en: "between", note: "in the middle" },
                { pt: "perto de", en: "near", note: "close to" },
                { pt: "longe de", en: "far from", note: "distant from" }
              ],
              keyPoints: [
                "Use contractions: no (em + o), na (em + a)",
                "Portuguese prepositions are very precise",
                "Practice with real objects and places"
              ]
            },
            {
              title: "Places in the City",
              explanation: "Important places you need to locate in Portuguese cities:",
              examples: [
                { pt: "banco", en: "bank", note: "essential for money" },
                { pt: "supermercado", en: "supermarket", note: "for groceries" },
                { pt: "farmácia", en: "pharmacy", note: "green cross sign" },
                { pt: "correios", en: "post office", note: "always plural" },
                { pt: "hospital", en: "hospital", note: "emergency services" },
                { pt: "estação", en: "station", note: "train/bus station" },
                { pt: "aeroporto", en: "airport", note: "for travel" },
                { pt: "centro comercial", en: "shopping center", note: "modern shopping" }
              ],
              keyPoints: [
                "Correios is always plural in Portuguese",
                "Farmácias have green crosses",
                "Many places use definite articles"
              ]
            },
            {
              title: "Asking for and Giving Locations",
              explanation: "Practical phrases for location conversations:",
              examples: [
                { pt: "Onde fica...?", en: "Where is...?", note: "asking location" },
                { pt: "Fica perto daqui?", en: "Is it near here?", note: "asking distance" },
                { pt: "É longe?", en: "Is it far?", note: "simple distance question" },
                { pt: "Fica no centro", en: "It's in the center", note: "giving location" },
                { pt: "É aqui perto", en: "It's nearby", note: "close distance" },
                { pt: "Não sei onde fica", en: "I don't know where it is", note: "when you don't know" },
                { pt: "Vou mostrar-lhe", en: "I'll show you", note: "helpful response" }
              ],
              keyPoints: [
                "FICAR = to be located (permanent location)",
                "Portuguese people are very helpful with directions",
                "Learn polite ways to ask for help"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn location vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "aqui", translation: "here" },
          { id: "e2", type: "flashcard", term: "aí", translation: "there (near you)" },
          { id: "e3", type: "flashcard", term: "ali", translation: "over there" },
          { id: "e4", type: "flashcard", term: "onde", translation: "where" },
          
          // Then: Learn prepositions (flashcards)
          { id: "e5", type: "flashcard", term: "ao lado de", translation: "next to" },
          { id: "e6", type: "flashcard", term: "em frente de", translation: "in front of" },
          { id: "e7", type: "flashcard", term: "atrás de", translation: "behind" },
          { id: "e8", type: "flashcard", term: "perto de", translation: "near" },
          
          // Practice places (flashcards)
          { id: "e9", type: "flashcard", term: "banco", translation: "bank" },
          { id: "e10", type: "flashcard", term: "farmácia", translation: "pharmacy" },
          
          // Practice location questions (MCQ)
          { id: "e11", type: "mcq", prompt: "How do you ask 'Where is the bank?'", options: ["Onde fica o banco?", "Que é o banco?", "Como é o banco?"], correct: "Onde fica o banco?" },
          { id: "e12", type: "mcq", prompt: "How do you say 'It's next to the pharmacy'?", options: ["É ao lado da farmácia", "Fica ao lado da farmácia", "Está ao lado da farmácia"], correct: "Fica ao lado da farmácia" },
          
          // Production (typing)
          { id: "e13", type: "typing", prompt: "Ask: 'Where is the supermarket?'", correct: "Onde fica o supermercado?" },
          { id: "e14", type: "typing", prompt: "Say: 'The bank is near here.'", correct: "O banco fica perto daqui." },
        ],
      },
    ],
  },
  {
    id: "m6",
    title: "Food & Restaurant",
    description: "Order food, express preferences, discuss Portuguese cuisine.",
    lessons: [
      {
        id: "m6l1",
        title: "No café",
        xp: 25,
        content: {
          title: "At the Portuguese Café",
          sections: [
            {
              title: "Portuguese Café Culture",
              explanation: "Cafés are the heart of Portuguese social life. Understanding café culture is essential for integration:",
              examples: [
                { pt: "café", en: "coffee/café", note: "both the drink and place" },
                { pt: "esplanada", en: "terrace/outdoor seating", note: "very popular" },
                { pt: "balcão", en: "counter/bar", note: "where locals stand" },
                { pt: "mesa", en: "table", note: "for sitting" },
                { pt: "empregado/empregada", en: "waiter/waitress", note: "service staff" },
                { pt: "conta", en: "bill", note: "a conta, por favor" }
              ],
              keyPoints: [
                "Portuguese people visit cafés multiple times daily",
                "Standing at the counter is cheaper than sitting",
                "Café culture is very social and relaxed"
              ]
            },
            {
              title: "Coffee Vocabulary",
              explanation: "Portugal has specific coffee terminology different from other countries:",
              examples: [
                { pt: "café", en: "espresso", note: "standard Portuguese coffee" },
                { pt: "galão", en: "coffee with milk (tall glass)", note: "breakfast drink" },
                { pt: "meia de leite", en: "half coffee, half milk", note: "in a cup" },
                { pt: "café com leite", en: "coffee with milk", note: "general term" },
                { pt: "descafeinado", en: "decaffeinated", note: "without caffeine" },
                { pt: "café duplo", en: "double espresso", note: "stronger coffee" },
                { pt: "café pingado", en: "espresso with a drop of milk", note: "very Portuguese" }
              ],
              keyPoints: [
                "Café = espresso, not American-style coffee",
                "Galão is very popular for breakfast",
                "Each region has slight variations"
              ]
            },
            {
              title: "Food at the Café",
              explanation: "Portuguese cafés serve light meals and snacks throughout the day:",
              examples: [
                { pt: "pastel de nata", en: "custard tart", note: "famous Portuguese pastry" },
                { pt: "torrada", en: "toast", note: "buttered toast" },
                { pt: "croissant", en: "croissant", note: "international term" },
                { pt: "bolo", en: "cake", note: "o bolo" },
                { pt: "sandes", en: "sandwich", note: "Portuguese term" },
                { pt: "tosta", en: "toasted sandwich", note: "grilled sandwich" },
                { pt: "sumo", en: "juice", note: "fresh juice" },
                { pt: "água", en: "water", note: "a água" }
              ],
              keyPoints: [
                "Pastel de nata is Portugal's most famous pastry",
                "Tostas are very popular lunch items",
                "Fresh orange juice (sumo de laranja) is excellent"
              ]
            },
            {
              title: "Ordering at the Café",
              explanation: "Polite and effective ways to order in Portuguese cafés:",
              examples: [
                { pt: "Queria um café, por favor", en: "I'd like a coffee, please", note: "polite ordering" },
                { pt: "Para aqui ou para levar?", en: "For here or to go?", note: "common question" },
                { pt: "Quanto é?", en: "How much is it?", note: "asking price" },
                { pt: "A conta, por favor", en: "The bill, please", note: "asking to pay" },
                { pt: "Posso pagar com cartão?", en: "Can I pay by card?", note: "payment method" },
                { pt: "Obrigado, tenha um bom dia", en: "Thank you, have a good day", note: "polite farewell" }
              ],
              keyPoints: [
                "Always say 'por favor' when ordering",
                "Para levar = takeaway",
                "Card payments are widely accepted"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn café vocabulary (flashcards)
          { id: "e1", type: "flashcard", term: "café", translation: "coffee/café" },
          { id: "e2", type: "flashcard", term: "galão", translation: "coffee with milk (tall glass)" },
          { id: "e3", type: "flashcard", term: "pastel de nata", translation: "custard tart" },
          { id: "e4", type: "flashcard", term: "torrada", translation: "toast" },
          { id: "e5", type: "flashcard", term: "sumo", translation: "juice" },
          
          // Then: Learn ordering phrases (flashcards)
          { id: "e6", type: "flashcard", term: "Queria um café", translation: "I'd like a coffee" },
          { id: "e7", type: "flashcard", term: "A conta, por favor", translation: "The bill, please" },
          
          // Practice café situations (MCQ)
          { id: "e8", type: "mcq", prompt: "What's Portugal's famous pastry?", options: ["croissant", "pastel de nata", "bolo"], correct: "pastel de nata" },
          { id: "e9", type: "mcq", prompt: "How do you politely order a coffee?", options: ["Quero café", "Queria um café, por favor", "Dá-me café"], correct: "Queria um café, por favor" },
          
          // Cultural understanding (MCQ)
          { id: "e10", type: "mcq", prompt: "Where is it cheaper to drink coffee?", options: ["At a table", "At the counter", "On the terrace"], correct: "At the counter" },
          
          // Production (typing)
          { id: "e11", type: "typing", prompt: "Order politely: 'I'd like a galão, please.'", correct: "Queria um galão, por favor." },
          { id: "e12", type: "typing", prompt: "Ask for the bill:", correct: "A conta, por favor." },
        ],
      },
      {
        id: "m6l2",
        title: "Preferências",
        xp: 25,
        content: {
          title: "Expressing Preferences and Likes",
          sections: [
            {
              title: "Basic Preference Verbs",
              explanation: "Learn the essential verbs for expressing what you like and prefer:",
              examples: [
                { pt: "gostar de", en: "to like", note: "gosto de café" },
                { pt: "adorar", en: "to love/adore", note: "adoro chocolate" },
                { pt: "preferir", en: "to prefer", note: "prefiro chá" },
                { pt: "não gostar de", en: "to not like", note: "não gosto de peixe" },
                { pt: "detestar", en: "to hate", note: "detesto acordar cedo" },
                { pt: "amar", en: "to love", note: "amo a minha família" }
              ],
              keyPoints: [
                "GOSTAR always uses 'de': gosto de música",
                "PREFERIR doesn't need preposition: prefiro Portugal",
                "ADORAR is stronger than gostar"
              ]
            },
            {
              title: "Food and Drink Preferences",
              explanation: "Express your food and drink preferences using Portuguese vocabulary:",
              examples: [
                { pt: "Gosto de café", en: "I like coffee", note: "common preference" },
                { pt: "Prefiro chá", en: "I prefer tea", note: "alternative choice" },
                { pt: "Adoro pastéis de nata", en: "I love custard tarts", note: "strong preference" },
                { pt: "Não gosto de peixe", en: "I don't like fish", note: "negative preference" },
                { pt: "Prefiro carne", en: "I prefer meat", note: "comparison" },
                { pt: "Gosto mais de fruta", en: "I like fruit more", note: "comparative preference" }
              ],
              keyPoints: [
                "Portuguese cuisine has lots of fish - be prepared!",
                "Fruit is very important in Portuguese diet",
                "Vegetarian options are growing but still limited"
              ]
            },
            {
              title: "Activity and Hobby Preferences",
              explanation: "Talk about activities and hobbies you enjoy:",
              examples: [
                { pt: "Gosto de ler", en: "I like to read", note: "gostar de + infinitive" },
                { pt: "Adoro viajar", en: "I love to travel", note: "adorar + infinitive" },
                { pt: "Prefiro ficar em casa", en: "I prefer to stay home", note: "preferir + infinitive" },
                { pt: "Gosto de fazer desporto", en: "I like to do sports", note: "exercise preference" },
                { pt: "Não gosto de ver televisão", en: "I don't like watching TV", note: "negative + infinitive" },
                { pt: "Prefiro ouvir música", en: "I prefer listening to music", note: "comparative preference" }
              ],
              keyPoints: [
                "Use infinitive after preference verbs",
                "Portuguese people love discussing hobbies",
                "Outdoor activities are very popular"
              ]
            },
            {
              title: "Making Comparisons and Choices",
              explanation: "Express comparative preferences and make choices:",
              examples: [
                { pt: "Gosto mais de...", en: "I like... more", note: "comparative preference" },
                { pt: "Prefiro... a...", en: "I prefer... to...", note: "direct comparison" },
                { pt: "O que preferes?", en: "What do you prefer?", note: "asking preference" },
                { pt: "Tanto faz", en: "I don't mind/either is fine", note: "no preference" },
                { pt: "Depende", en: "It depends", note: "conditional preference" },
                { pt: "É a mesma coisa", en: "It's the same thing", note: "no difference" }
              ],
              keyPoints: [
                "Portuguese people often ask about preferences",
                "Be prepared to explain your choices",
                "'Tanto faz' is very useful phrase"
              ]
            }
          ]
        },
        exercises: [
          // First: Learn preference verbs (flashcards)
          { id: "e1", type: "flashcard", term: "gostar de", translation: "to like" },
          { id: "e2", type: "flashcard", term: "adorar", translation: "to love/adore" },
          { id: "e3", type: "flashcard", term: "preferir", translation: "to prefer" },
          { id: "e4", type: "flashcard", term: "não gostar de", translation: "to not like" },
          
          // Then: Practice with activities (flashcards)
          { id: "e5", type: "flashcard", term: "Gosto de ler", translation: "I like to read" },
          { id: "e6", type: "flashcard", term: "Adoro viajar", translation: "I love to travel" },
          { id: "e7", type: "flashcard", term: "Prefiro ficar em casa", translation: "I prefer to stay home" },
          
          // Practice preference expressions (MCQ)
          { id: "e8", type: "mcq", prompt: "How do you say 'I like coffee'?", options: ["Gosto café", "Gosto de café", "Gosto do café"], correct: "Gosto de café" },
          { id: "e9", type: "mcq", prompt: "Which is stronger: 'gosto' or 'adoro'?", options: ["gosto", "adoro", "same"], correct: "adoro" },
          
          // Practice comparisons (MCQ)
          { id: "e10", type: "mcq", prompt: "How do you say 'I don't mind'?", options: ["Não gosto", "Tanto faz", "Depende"], correct: "Tanto faz" },
          
          // Production (typing)
          { id: "e11", type: "typing", prompt: "Say: 'I love Portuguese food.'", correct: "Adoro comida portuguesa." },
          { id: "e12", type: "typing", prompt: "Say: 'I prefer tea to coffee.'", correct: "Prefiro chá a café." },
        ],
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  for (const m of modules) {
    const match = m.lessons.find((l) => l.id === id);
    if (match) return match;
  }
  return undefined;
}

// Memoized version of getAllFlashcards to improve performance
let _allFlashcardsCache: Exercise[] | null = null;

export function getAllFlashcards(): Exercise[] {
  // Return cached result if available
  if (_allFlashcardsCache) {
    return _allFlashcardsCache;
  }
  
  // Calculate flashcards only once
  const flashcards: Exercise[] = [];
  for (const module of modules) {
    for (const lesson of module.lessons) {
      for (const exercise of lesson.exercises) {
        if (exercise.type === "flashcard" && exercise.term && exercise.translation) {
          flashcards.push(exercise);
        }
      }
    }
  }
  
  // Cache the result
  _allFlashcardsCache = flashcards;
  return flashcards;
}

