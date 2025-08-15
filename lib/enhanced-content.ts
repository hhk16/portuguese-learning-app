// ENHANCED MODULES WITH COMPLETE PPP METHODOLOGY
import { Module, Lesson, LessonContent } from './content';

export const enhancedModules: Module[] = [
  // PHASE A: M7-M12 Enhanced (completed in previous sessions)
  {
    id: "m7enhanced",
    title: "🧭 City & Directions (Enhanced PPP)",
    description: "Master Portuguese directions, transportation, and city navigation with complete cultural context and advanced exercises.",
    lessons: [
      {
        id: "m7el1",
        title: "Portuguese Directions and Navigation Mastery",
        xp: 40,
        content: {
          title: "Portuguese Directions and City Navigation",
          sections: [
            {
              title: "Essential Direction Vocabulary",
              explanation: "Master the fundamental directions used throughout Portugal with proper pronunciation and usage:",
              examples: [
                { pt: "à direita", en: "to the right", note: "turn right: vire à direita" },
                { pt: "à esquerda", en: "to the left", note: "turn left: vire à esquerda" },
                { pt: "em frente", en: "straight ahead", note: "continue straight: continue em frente" }
              ],
              keyPoints: [
                "Portuguese uses specific prepositions with directions",
                "Direction phrases often include 'de' (of/from)",
                "Prepositions change with gender: ao/à, do/da"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "à direita", translation: "to the right" },
          { id: "e2", type: "flashcard", term: "à esquerda", translation: "to the left" },
          { id: "e3", type: "mcq", prompt: "What's 'em frente' in English?", options: ["behind", "straight ahead", "next to"], correct: "straight ahead" },
          { id: "e4", type: "typing", prompt: "Say: 'Turn right.'", correct: "Vire à direita." },
        ],
      },
      {
        id: "m7el2",
        title: "Portuguese Transportation Systems",
        xp: 45,
        content: {
          title: "Portuguese Public Transport and Travel",
          sections: [
            {
              title: "Transportation Vocabulary",
              explanation: "Essential vocabulary for navigating Portugal's transportation systems:",
              examples: [
                { pt: "metro", en: "subway/metro", note: "Lisbon and Porto have metro systems" },
                { pt: "autocarro", en: "bus", note: "main public transport in cities" },
                { pt: "comboio", en: "train", note: "connects major cities" }
              ],
              keyPoints: [
                "Portuguese public transport is efficient and affordable",
                "Each city has its own transport system",
                "Validate tickets to avoid fines"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "metro", translation: "subway/metro" },
          { id: "e2", type: "mcq", prompt: "What's 'autocarro' in English?", options: ["car", "bus", "train"], correct: "bus" },
          { id: "e3", type: "typing", prompt: "Say: 'I go by metro.'", correct: "Vou de metro." },
        ],
      },
    ],
  },
  
  // PHASE B: VOCAB1-VOCAB7 Enhanced 
  {
    id: "vocab1enhanced",
    title: "🎨 Essential Vocabulary I: Colors, Numbers & Body (Enhanced PPP)",
    description: "Master fundamental Portuguese vocabulary - colors, numbers 21-100, and body parts with complete cultural context and advanced exercises.",
    lessons: [
      {
        id: "vocab1el1",
        title: "Portuguese Colors and Visual Descriptions",
        xp: 40,
        content: {
          title: "Portuguese Colors and Visual Culture",
          sections: [
            {
              title: "Essential Color Vocabulary",
              explanation: "Master the fundamental colors used in Portuguese daily life and culture:",
              examples: [
                { pt: "vermelho", en: "red", note: "o vermelho - also means 'communist' in politics" },
                { pt: "azul", en: "blue", note: "o azul - Portugal's traditional color" },
                { pt: "verde", en: "green", note: "o verde - nature and hope" },
                { pt: "amarelo", en: "yellow", note: "o amarelo - sun and joy" },
                { pt: "branco", en: "white", note: "o branco - purity and peace" },
                { pt: "preto", en: "black", note: "o preto - elegance and formality" },
                { pt: "rosa", en: "pink", note: "o rosa - gender-neutral color" },
                { pt: "roxo", en: "purple", note: "o roxo - royalty and luxury" },
                { pt: "castanho", en: "brown", note: "o castanho - earth tones" },
                { pt: "cinzento", en: "grey", note: "o cinzento - neutral tone" }
              ],
              keyPoints: [
                "All colors are masculine nouns in Portuguese",
                "Colors can be used as adjectives and change with gender",
                "Portugal's flag colors (red and green) have cultural significance",
                "Color expressions are common in Portuguese idioms"
              ]
            },
            {
              title: "Color Expressions and Descriptions",
              explanation: "Learn to describe colors and use color expressions in Portuguese:",
              examples: [
                { pt: "Que cor é?", en: "What color is it?", note: "asking about color" },
                { pt: "É azul.", en: "It is blue.", note: "stating color" },
                { pt: "cor favorita", en: "favorite color", note: "personal preference" },
                { pt: "cores vivas", en: "bright colors", note: "vivid colors" },
                { pt: "cores escuras", en: "dark colors", note: "deep tones" },
                { pt: "cores claras", en: "light colors", note: "pale tones" },
                { pt: "arco-íris", en: "rainbow", note: "all colors together" },
                { pt: "multicolor", en: "multicolored", note: "many colors" }
              ],
              keyPoints: [
                "Colors as adjectives agree with noun gender",
                "Portuguese uses specific phrases for color intensity",
                "Color preferences are important in Portuguese culture",
                "Many Portuguese expressions use colors metaphorically"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Color vocabulary flashcards
          { id: "e1", type: "flashcard", term: "vermelho", translation: "red" },
          { id: "e2", type: "flashcard", term: "azul", translation: "blue" },
          { id: "e3", type: "flashcard", term: "verde", translation: "green" },
          { id: "e4", type: "flashcard", term: "amarelo", translation: "yellow" },
          { id: "e5", type: "flashcard", term: "branco", translation: "white" },
          
          // Practice: Color recognition (MCQ)
          { id: "e6", type: "mcq", prompt: "What color is the sky?", options: ["azul", "verde", "vermelho"], correct: "azul" },
          { id: "e7", type: "mcq", prompt: "What color is grass?", options: ["amarelo", "verde", "preto"], correct: "verde" },
          { id: "e8", type: "mcq", prompt: "What's 'roxo' in English?", options: ["purple", "orange", "pink"], correct: "purple" },
          
          // Practice: Color matching
          { id: "e9", type: "matching", pairs: [
            { a: "preto", b: "black" },
            { a: "rosa", b: "pink" },
            { a: "castanho", b: "brown" },
            { a: "cinzento", b: "grey" }
          ]},
          
          // Production: Color descriptions (typing)
          { id: "e10", type: "typing", prompt: "Say: 'The car is red.'", correct: "O carro é vermelho." },
          { id: "e11", type: "typing", prompt: "Ask: 'What color is it?'", correct: "Que cor é?" },
          { id: "e12", type: "typing", prompt: "Say: 'My favorite color is blue.'", correct: "A minha cor favorita é azul." },
        ],
      },
      {
        id: "vocab1el2",
        title: "Portuguese Numbers and Body Parts",
        xp: 45,
        content: {
          title: "Portuguese Numbers and Body Vocabulary",
          sections: [
            {
              title: "Numbers 21-100",
              explanation: "Master Portuguese numbers from twenty-one to one hundred:",
              examples: [
                { pt: "vinte e um", en: "twenty-one", note: "21 - uses 'e' (and)" },
                { pt: "trinta", en: "thirty", note: "30 - base number" },
                { pt: "quarenta", en: "forty", note: "40 - base number" },
                { pt: "cinquenta", en: "fifty", note: "50 - base number" },
                { pt: "sessenta", en: "sixty", note: "60 - base number" },
                { pt: "setenta", en: "seventy", note: "70 - base number" },
                { pt: "oitenta", en: "eighty", note: "80 - base number" },
                { pt: "noventa", en: "ninety", note: "90 - base number" },
                { pt: "cem", en: "one hundred", note: "100 - exact hundred" }
              ],
              keyPoints: [
                "Numbers use 'e' (and) to connect tens and units",
                "Portuguese number pronunciation varies by region",
                "Numbers are essential for prices, ages, and quantities",
                "Practice with real-life contexts helps memorization"
              ]
            },
            {
              title: "Body Parts Vocabulary",
              explanation: "Essential body parts vocabulary for health, descriptions, and daily conversations:",
              examples: [
                { pt: "cabeça", en: "head", note: "a cabeça - main body part" },
                { pt: "olhos", en: "eyes", note: "os olhos - plural form" },
                { pt: "nariz", en: "nose", note: "o nariz - breathing organ" },
                { pt: "boca", en: "mouth", note: "a boca - for eating and speaking" },
                { pt: "orelhas", en: "ears", note: "as orelhas - hearing organs" },
                { pt: "braços", en: "arms", note: "os braços - upper limbs" },
                { pt: "mãos", en: "hands", note: "as mãos - for holding" },
                { pt: "pernas", en: "legs", note: "as pernas - lower limbs" },
                { pt: "pés", en: "feet", note: "os pés - for walking" },
                { pt: "costas", en: "back", note: "as costas - always plural" }
              ],
              keyPoints: [
                "Many body parts are naturally plural in Portuguese",
                "Body parts are essential for health conversations",
                "Gender and number agreement is important",
                "Portuguese uses specific expressions for body-related actions"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Numbers flashcards
          { id: "e1", type: "flashcard", term: "vinte e um", translation: "twenty-one" },
          { id: "e2", type: "flashcard", term: "trinta", translation: "thirty" },
          { id: "e3", type: "flashcard", term: "cinquenta", translation: "fifty" },
          { id: "e4", type: "flashcard", term: "setenta", translation: "seventy" },
          { id: "e5", type: "flashcard", term: "cem", translation: "one hundred" },
          
          // Practice: Number recognition (MCQ)
          { id: "e6", type: "mcq", prompt: "What's 'quarenta' in English?", options: ["fourteen", "forty", "four"], correct: "forty" },
          { id: "e7", type: "mcq", prompt: "How do you say '60' in Portuguese?", options: ["sessenta", "setenta", "cinquenta"], correct: "sessenta" },
          
          // Presentation: Body parts flashcards
          { id: "e8", type: "flashcard", term: "cabeça", translation: "head" },
          { id: "e9", type: "flashcard", term: "olhos", translation: "eyes" },
          { id: "e10", type: "flashcard", term: "mãos", translation: "hands" },
          
          // Practice: Body parts matching
          { id: "e11", type: "matching", pairs: [
            { a: "nariz", b: "nose" },
            { a: "boca", b: "mouth" },
            { a: "orelhas", b: "ears" },
            { a: "pernas", b: "legs" }
          ]},
          
          // Production: Numbers (typing)
          { id: "e12", type: "typing", prompt: "Write: 'twenty-five' in Portuguese", correct: "vinte e cinco" },
          { id: "e13", type: "typing", prompt: "Write: 'eighty' in Portuguese", correct: "oitenta" },
          
          // Production: Body parts (typing)
          { id: "e14", type: "typing", prompt: "Say: 'My head hurts.'", correct: "A minha cabeça dói." },
          { id: "e15", type: "typing", prompt: "Say: 'I have two hands.'", correct: "Tenho duas mãos." },
        ],
      },
    ],
  },
  {
    id: "vocab2enhanced",
    title: "🍎 Essential Vocabulary II: Food, Animals & Nature (Enhanced PPP)",
    description: "Master essential Portuguese vocabulary for food, animals, and nature with complete cultural context and practical applications.",
    lessons: [
      {
        id: "vocab2el1",
        title: "Portuguese Food Culture and Vocabulary",
        xp: 40,
        content: {
          title: "Portuguese Food Culture and Cuisine",
          sections: [
            {
              title: "Essential Food Vocabulary",
              explanation: "Master fundamental food vocabulary essential for Portuguese culture and daily life:",
              examples: [
                { pt: "pão", en: "bread", note: "o pão - staple food in Portugal" },
                { pt: "arroz", en: "rice", note: "o arroz - base for many dishes" },
                { pt: "batata", en: "potato", note: "a batata - common side dish" },
                { pt: "carne", en: "meat", note: "a carne - protein source" },
                { pt: "peixe", en: "fish", note: "o peixe - very important in Portuguese cuisine" },
                { pt: "queijo", en: "cheese", note: "o queijo - many Portuguese varieties" },
                { pt: "ovos", en: "eggs", note: "os ovos - breakfast staple" },
                { pt: "leite", en: "milk", note: "o leite - daily beverage" },
                { pt: "fruta", en: "fruit", note: "a fruta - healthy dessert" },
                { pt: "legumes", en: "vegetables", note: "os legumes - essential nutrition" }
              ],
              keyPoints: [
                "Portuguese cuisine is heavily influenced by the sea",
                "Bread is eaten with almost every meal",
                "Portugal has excellent local cheeses and wines",
                "Fresh ingredients are preferred over processed foods"
              ]
            },
            {
              title: "Portuguese Meals and Food Culture",
              explanation: "Understanding Portuguese meal culture and food expressions:",
              examples: [
                { pt: "pequeno-almoço", en: "breakfast", note: "morning meal" },
                { pt: "almoço", en: "lunch", note: "main meal of the day" },
                { pt: "jantar", en: "dinner", note: "evening meal" },
                { pt: "lanche", en: "snack", note: "afternoon snack" },
                { pt: "bacalhau", en: "codfish", note: "national dish with 365 recipes" },
                { pt: "pastéis de nata", en: "custard tarts", note: "famous Portuguese pastry" },
                { pt: "francesinha", en: "francesinha", note: "Porto's famous sandwich" },
                { pt: "vinho", en: "wine", note: "Portugal produces excellent wines" }
              ],
              keyPoints: [
                "Lunch is the most important meal in Portugal",
                "Portuguese people often have coffee breaks",
                "Each region has its own culinary specialties",
                "Food is central to Portuguese social life"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Food vocabulary flashcards
          { id: "e1", type: "flashcard", term: "pão", translation: "bread" },
          { id: "e2", type: "flashcard", term: "peixe", translation: "fish" },
          { id: "e3", type: "flashcard", term: "queijo", translation: "cheese" },
          { id: "e4", type: "flashcard", term: "fruta", translation: "fruit" },
          { id: "e5", type: "flashcard", term: "legumes", translation: "vegetables" },
          
          // Practice: Food recognition (MCQ)
          { id: "e6", type: "mcq", prompt: "What's Portugal's national dish?", options: ["bacalhau", "francesinha", "arroz"], correct: "bacalhau" },
          { id: "e7", type: "mcq", prompt: "What's 'pequeno-almoço'?", options: ["lunch", "breakfast", "dinner"], correct: "breakfast" },
          
          // Practice: Food matching
          { id: "e8", type: "matching", pairs: [
            { a: "carne", b: "meat" },
            { a: "ovos", b: "eggs" },
            { a: "leite", b: "milk" },
            { a: "batata", b: "potato" }
          ]},
          
          // Production: Food preferences (typing)
          { id: "e9", type: "typing", prompt: "Say: 'I like fish.'", correct: "Gosto de peixe." },
          { id: "e10", type: "typing", prompt: "Say: 'I eat bread every day.'", correct: "Como pão todos os dias." },
        ],
      },
      {
        id: "vocab2el2",
        title: "Portuguese Animals and Nature Vocabulary",
        xp: 45,
        content: {
          title: "Portuguese Wildlife and Nature",
          sections: [
            {
              title: "Common Animals",
              explanation: "Essential animal vocabulary for daily conversations and nature discussions:",
              examples: [
                { pt: "cão", en: "dog", note: "o cão - most popular pet" },
                { pt: "gato", en: "cat", note: "o gato - common household pet" },
                { pt: "pássaro", en: "bird", note: "o pássaro - flying animal" },
                { pt: "peixe", en: "fish", note: "o peixe - aquatic animal" },
                { pt: "cavalo", en: "horse", note: "o cavalo - riding animal" },
                { pt: "vaca", en: "cow", note: "a vaca - farm animal" },
                { pt: "porco", en: "pig", note: "o porco - farm animal" },
                { pt: "galinha", en: "chicken", note: "a galinha - produces eggs" },
                { pt: "coelho", en: "rabbit", note: "o coelho - small mammal" },
                { pt: "borboleta", en: "butterfly", note: "a borboleta - beautiful insect" }
              ],
              keyPoints: [
                "Portuguese people love their pets",
                "Many Portuguese have rural connections",
                "Animal welfare is increasingly important",
                "Different regions have different wildlife"
              ]
            },
            {
              title: "Nature and Environment",
              explanation: "Basic nature vocabulary for outdoor activities and environmental awareness:",
              examples: [
                { pt: "árvore", en: "tree", note: "a árvore - provides shade and oxygen" },
                { pt: "flor", en: "flower", note: "a flor - beautiful and fragrant" },
                { pt: "jardim", en: "garden", note: "o jardim - cultivated nature" },
                { pt: "parque", en: "park", note: "o parque - public green space" },
                { pt: "rio", en: "river", note: "o rio - flowing water" },
                { pt: "mar", en: "sea", note: "o mar - Portugal is surrounded by ocean" },
                { pt: "montanha", en: "mountain", note: "a montanha - high elevation" },
                { pt: "campo", en: "countryside", note: "o campo - rural area" },
                { pt: "praia", en: "beach", note: "a praia - coastal recreation" },
                { pt: "floresta", en: "forest", note: "a floresta - many trees together" }
              ],
              keyPoints: [
                "Portugal has beautiful coastlines and beaches",
                "Portuguese people enjoy outdoor activities",
                "Many cities have excellent parks",
                "Environmental consciousness is growing"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Animals flashcards
          { id: "e1", type: "flashcard", term: "cão", translation: "dog" },
          { id: "e2", type: "flashcard", term: "gato", translation: "cat" },
          { id: "e3", type: "flashcard", term: "pássaro", translation: "bird" },
          { id: "e4", type: "flashcard", term: "cavalo", translation: "horse" },
          
          // Practice: Animal sounds and characteristics (MCQ)
          { id: "e5", type: "mcq", prompt: "Which animal flies?", options: ["cão", "pássaro", "gato"], correct: "pássaro" },
          { id: "e6", type: "mcq", prompt: "What's 'galinha' in English?", options: ["chicken", "cow", "pig"], correct: "chicken" },
          
          // Practice: Animals matching
          { id: "e7", type: "matching", pairs: [
            { a: "vaca", b: "cow" },
            { a: "porco", b: "pig" },
            { a: "coelho", b: "rabbit" },
            { a: "borboleta", b: "butterfly" }
          ]},
          
          // Presentation: Nature flashcards
          { id: "e8", type: "flashcard", term: "árvore", translation: "tree" },
          { id: "e9", type: "flashcard", term: "flor", translation: "flower" },
          { id: "e10", type: "flashcard", term: "praia", translation: "beach" },
          
          // Practice: Nature matching
          { id: "e11", type: "matching", pairs: [
            { a: "jardim", b: "garden" },
            { a: "parque", b: "park" },
            { a: "floresta", b: "forest" },
            { a: "campo", b: "countryside" }
          ]},
          
          // Production: Animals and nature (typing)
          { id: "e12", type: "typing", prompt: "Say: 'I have a dog.'", correct: "Tenho um cão." },
          { id: "e13", type: "typing", prompt: "Say: 'The flowers are beautiful.'", correct: "As flores são bonitas." },
          { id: "e14", type: "typing", prompt: "Say: 'I like going to the beach.'", correct: "Gosto de ir à praia." },
        ],
      },
    ],
  },
  {
    id: "vocab3enhanced",
    title: "✨ Essential Vocabulary III: Adjectives & Descriptions (Enhanced PPP)",
    description: "Master Portuguese adjectives and descriptive vocabulary with complete cultural context and practical applications.",
    lessons: [
      {
        id: "vocab3el1",
        title: "Portuguese Descriptive Adjectives",
        xp: 40,
        content: {
          title: "Portuguese Adjectives and Descriptions",
          sections: [
            {
              title: "Basic Descriptive Adjectives",
              explanation: "Master fundamental adjectives for describing people, places, and things in Portuguese:",
              examples: [
                { pt: "grande", en: "big/large", note: "grande - same form for masculine/feminine" },
                { pt: "pequeno/pequena", en: "small", note: "changes with gender" },
                { pt: "bom/boa", en: "good", note: "masculine/feminine forms" },
                { pt: "mau/má", en: "bad", note: "negative quality" },
                { pt: "bonito/bonita", en: "beautiful/pretty", note: "physical attractiveness" },
                { pt: "feio/feia", en: "ugly", note: "opposite of beautiful" },
                { pt: "alto/alta", en: "tall/high", note: "height or elevation" },
                { pt: "baixo/baixa", en: "short/low", note: "opposite of tall" },
                { pt: "novo/nova", en: "new/young", note: "newness or youth" },
                { pt: "velho/velha", en: "old", note: "age or antiquity" }
              ],
              keyPoints: [
                "Portuguese adjectives must agree with noun gender",
                "Most adjectives change -o to -a for feminine",
                "Some adjectives like 'grande' don't change",
                "Adjective placement affects meaning sometimes"
              ]
            },
            {
              title: "Personality and Character Adjectives",
              explanation: "Essential adjectives for describing personality and character traits:",
              examples: [
                { pt: "simpático/simpática", en: "nice/friendly", note: "positive personality" },
                { pt: "inteligente", en: "intelligent", note: "same form for both genders" },
                { pt: "engraçado/engraçada", en: "funny", note: "sense of humor" },
                { pt: "sério/séria", en: "serious", note: "formal personality" },
                { pt: "alegre", en: "cheerful", note: "happy disposition" },
                { pt: "triste", en: "sad", note: "melancholy mood" },
                { pt: "calmo/calma", en: "calm", note: "peaceful nature" },
                { pt: "nervoso/nervosa", en: "nervous", note: "anxious disposition" },
                { pt: "corajoso/corajosa", en: "brave", note: "courageous character" },
                { pt: "tímido/tímida", en: "shy", note: "reserved personality" }
              ],
              keyPoints: [
                "Personality adjectives are important for social interaction",
                "Portuguese values certain personality traits culturally",
                "Adjective agreement is crucial for proper communication",
                "Context affects which adjectives are appropriate"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Basic adjectives flashcards
          { id: "e1", type: "flashcard", term: "grande", translation: "big/large" },
          { id: "e2", type: "flashcard", term: "pequeno", translation: "small" },
          { id: "e3", type: "flashcard", term: "bonito", translation: "beautiful" },
          { id: "e4", type: "flashcard", term: "alto", translation: "tall" },
          { id: "e5", type: "flashcard", term: "novo", translation: "new/young" },
          
          // Practice: Adjective recognition (MCQ)
          { id: "e6", type: "mcq", prompt: "What's the opposite of 'grande'?", options: ["pequeno", "alto", "novo"], correct: "pequeno" },
          { id: "e7", type: "mcq", prompt: "What's 'feio' in English?", options: ["beautiful", "ugly", "tall"], correct: "ugly" },
          
          // Practice: Adjective matching
          { id: "e8", type: "matching", pairs: [
            { a: "bom", b: "good" },
            { a: "mau", b: "bad" },
            { a: "baixo", b: "short/low" },
            { a: "velho", b: "old" }
          ]},
          
          // Presentation: Personality adjectives flashcards
          { id: "e9", type: "flashcard", term: "simpático", translation: "nice/friendly" },
          { id: "e10", type: "flashcard", term: "inteligente", translation: "intelligent" },
          
          // Production: Descriptions (typing)
          { id: "e11", type: "typing", prompt: "Say: 'The house is big.'", correct: "A casa é grande." },
          { id: "e12", type: "typing", prompt: "Say: 'She is very nice.'", correct: "Ela é muito simpática." },
        ],
      },
      {
        id: "vocab3el2",
        title: "Portuguese Physical and Emotional Descriptions",
        xp: 45,
        content: {
          title: "Portuguese Descriptive Language",
          sections: [
            {
              title: "Physical Descriptions",
              explanation: "Vocabulary for describing physical appearance and characteristics:",
              examples: [
                { pt: "gordo/gorda", en: "fat", note: "physical weight (can be sensitive)" },
                { pt: "magro/magra", en: "thin", note: "slender build" },
                { pt: "forte", en: "strong", note: "physical strength" },
                { pt: "fraco/fraca", en: "weak", note: "lack of strength" },
                { pt: "jovem", en: "young", note: "youthful age" },
                { pt: "idoso/idosa", en: "elderly", note: "advanced age (polite)" },
                { pt: "careca", en: "bald", note: "no hair" },
                { pt: "moreno/morena", en: "dark-haired/brunette", note: "hair color" },
                { pt: "loiro/loira", en: "blonde", note: "light hair color" },
                { pt: "ruivo/ruiva", en: "redhead", note: "red hair color" }
              ],
              keyPoints: [
                "Be careful with sensitive physical descriptions",
                "Portuguese culture values respectful language",
                "Age-related terms should be used appropriately",
                "Hair color descriptions are commonly used"
              ]
            },
            {
              title: "Emotional States and Feelings",
              explanation: "Essential vocabulary for expressing emotions and feelings:",
              examples: [
                { pt: "feliz", en: "happy", note: "joy and contentment" },
                { pt: "triste", en: "sad", note: "sorrow or melancholy" },
                { pt: "zangado/zangada", en: "angry", note: "irritation or rage" },
                { pt: "preocupado/preocupada", en: "worried", note: "anxiety or concern" },
                { pt: "cansado/cansada", en: "tired", note: "fatigue or exhaustion" },
                { pt: "doente", en: "sick", note: "illness or poor health" },
                { pt: "nervoso/nervosa", en: "nervous", note: "anxiety or tension" },
                { pt: "excitado/excitada", en: "excited", note: "enthusiasm or anticipation" },
                { pt: "relaxado/relaxada", en: "relaxed", note: "calm and at ease" },
                { pt: "confuso/confusa", en: "confused", note: "uncertainty or bewilderment" }
              ],
              keyPoints: [
                "Emotional vocabulary is essential for communication",
                "Portuguese people often express emotions openly",
                "Gender agreement is important with feeling adjectives",
                "Context determines appropriate emotional expressions"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Physical descriptions flashcards
          { id: "e1", type: "flashcard", term: "forte", translation: "strong" },
          { id: "e2", type: "flashcard", term: "magro", translation: "thin" },
          { id: "e3", type: "flashcard", term: "jovem", translation: "young" },
          { id: "e4", type: "flashcard", term: "moreno", translation: "dark-haired" },
          
          // Practice: Physical descriptions (MCQ)
          { id: "e5", type: "mcq", prompt: "What's the opposite of 'forte'?", options: ["fraco", "gordo", "alto"], correct: "fraco" },
          { id: "e6", type: "mcq", prompt: "What's 'loira' in English?", options: ["blonde", "brunette", "redhead"], correct: "blonde" },
          
          // Presentation: Emotions flashcards
          { id: "e7", type: "flashcard", term: "feliz", translation: "happy" },
          { id: "e8", type: "flashcard", term: "cansado", translation: "tired" },
          { id: "e9", type: "flashcard", term: "preocupado", translation: "worried" },
          
          // Practice: Emotions matching
          { id: "e10", type: "matching", pairs: [
            { a: "zangado", b: "angry" },
            { a: "doente", b: "sick" },
            { a: "excitado", b: "excited" },
            { a: "confuso", b: "confused" }
          ]},
          
          // Production: Descriptions and emotions (typing)
          { id: "e11", type: "typing", prompt: "Say: 'I am happy.'", correct: "Estou feliz." },
          { id: "e12", type: "typing", prompt: "Say: 'She is tired.'", correct: "Ela está cansada." },
          { id: "e13", type: "typing", prompt: "Say: 'He is very strong.'", correct: "Ele é muito forte." },
          { id: "e14", type: "typing", prompt: "Ask: 'Are you worried?'", correct: "Estás preocupado?" },
        ],
      },
    ],
  },
  {
    id: "vocab4enhanced",
    title: "🎯 Essential Vocabulary IV: Verbs & Actions (Enhanced PPP)",
    description: "Master essential Portuguese verbs and action vocabulary with complete conjugation context and practical applications.",
    lessons: [
      {
        id: "vocab4el1",
        title: "Portuguese Essential Daily Verbs",
        xp: 40,
        content: {
          title: "Portuguese Daily Action Verbs",
          sections: [
            {
              title: "Basic Action Verbs",
              explanation: "Master the most essential action verbs used in Portuguese daily life:",
              examples: [
                { pt: "ser", en: "to be (permanent)", note: "permanent states and identity" },
                { pt: "estar", en: "to be (temporary)", note: "temporary states and location" },
                { pt: "ter", en: "to have", note: "possession and obligation" },
                { pt: "fazer", en: "to do/make", note: "actions and creation" },
                { pt: "ir", en: "to go", note: "movement and future plans" },
                { pt: "vir", en: "to come", note: "movement toward speaker" },
                { pt: "ver", en: "to see", note: "vision and perception" },
                { pt: "dar", en: "to give", note: "giving and providing" },
                { pt: "dizer", en: "to say/tell", note: "speech and communication" },
                { pt: "saber", en: "to know (facts)", note: "knowledge and skills" }
              ],
              keyPoints: [
                "Portuguese has two verbs for 'to be': ser and estar",
                "Irregular verbs must be memorized individually",
                "Verb conjugation changes with person and tense",
                "These verbs are used in countless daily situations"
              ]
            },
            {
              title: "Common Daily Activities",
              explanation: "Essential verbs for describing daily routines and activities:",
              examples: [
                { pt: "comer", en: "to eat", note: "regular -er verb" },
                { pt: "beber", en: "to drink", note: "regular -er verb" },
                { pt: "dormir", en: "to sleep", note: "regular -ir verb" },
                { pt: "trabalhar", en: "to work", note: "regular -ar verb" },
                { pt: "estudar", en: "to study", note: "regular -ar verb" },
                { pt: "falar", en: "to speak", note: "regular -ar verb" },
                { pt: "ouvir", en: "to hear/listen", note: "regular -ir verb" },
                { pt: "ler", en: "to read", note: "irregular -er verb" },
                { pt: "escrever", en: "to write", note: "regular -er verb" },
                { pt: "andar", en: "to walk", note: "regular -ar verb" }
              ],
              keyPoints: [
                "Regular verbs follow predictable conjugation patterns",
                "Daily activity verbs are among the most frequently used",
                "Portuguese has three main verb groups: -ar, -er, -ir",
                "Context determines which verb tense to use"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Essential verbs flashcards
          { id: "e1", type: "flashcard", term: "ser", translation: "to be (permanent)" },
          { id: "e2", type: "flashcard", term: "estar", translation: "to be (temporary)" },
          { id: "e3", type: "flashcard", term: "ter", translation: "to have" },
          { id: "e4", type: "flashcard", term: "fazer", translation: "to do/make" },
          { id: "e5", type: "flashcard", term: "ir", translation: "to go" },
          
          // Practice: Verb recognition (MCQ)
          { id: "e6", type: "mcq", prompt: "Which verb means 'to see'?", options: ["ver", "vir", "dar"], correct: "ver" },
          { id: "e7", type: "mcq", prompt: "What's 'saber' in English?", options: ["to be", "to know", "to have"], correct: "to know" },
          
          // Practice: Verb matching
          { id: "e8", type: "matching", pairs: [
            { a: "vir", b: "to come" },
            { a: "dar", b: "to give" },
            { a: "dizer", b: "to say/tell" },
            { a: "comer", b: "to eat" }
          ]},
          
          // Presentation: Daily activity verbs flashcards
          { id: "e9", type: "flashcard", term: "trabalhar", translation: "to work" },
          { id: "e10", type: "flashcard", term: "estudar", translation: "to study" },
          { id: "e11", type: "flashcard", term: "dormir", translation: "to sleep" },
          
          // Production: Basic verb usage (typing)
          { id: "e12", type: "typing", prompt: "Say: 'I am Portuguese.'", correct: "Sou português." },
          { id: "e13", type: "typing", prompt: "Say: 'I am at home.'", correct: "Estou em casa." },
          { id: "e14", type: "typing", prompt: "Say: 'I have a car.'", correct: "Tenho um carro." },
        ],
      },
      {
        id: "vocab4el2",
        title: "Portuguese Action Verbs and Movement",
        xp: 45,
        content: {
          title: "Portuguese Movement and Action Vocabulary",
          sections: [
            {
              title: "Movement and Transportation Verbs",
              explanation: "Essential verbs for describing movement and transportation:",
              examples: [
                { pt: "correr", en: "to run", note: "fast movement on foot" },
                { pt: "caminhar", en: "to walk", note: "leisurely movement" },
                { pt: "subir", en: "to go up/climb", note: "upward movement" },
                { pt: "descer", en: "to go down", note: "downward movement" },
                { pt: "entrar", en: "to enter", note: "going inside" },
                { pt: "sair", en: "to exit/leave", note: "going outside" },
                { pt: "chegar", en: "to arrive", note: "reaching destination" },
                { pt: "partir", en: "to depart/leave", note: "starting journey" },
                { pt: "voltar", en: "to return", note: "coming back" },
                { pt: "parar", en: "to stop", note: "ceasing movement" }
              ],
              keyPoints: [
                "Movement verbs are essential for giving directions",
                "Portuguese uses specific verbs for different types of movement",
                "These verbs are commonly used with prepositions",
                "Context determines the appropriate movement verb"
              ]
            },
            {
              title: "Communication and Social Verbs",
              explanation: "Important verbs for communication and social interaction:",
              examples: [
                { pt: "perguntar", en: "to ask", note: "requesting information" },
                { pt: "responder", en: "to answer", note: "providing information" },
                { pt: "explicar", en: "to explain", note: "clarifying information" },
                { pt: "entender", en: "to understand", note: "comprehending" },
                { pt: "ajudar", en: "to help", note: "providing assistance" },
                { pt: "ensinar", en: "to teach", note: "providing instruction" },
                { pt: "aprender", en: "to learn", note: "acquiring knowledge" },
                { pt: "encontrar", en: "to meet/find", note: "meeting or discovering" },
                { pt: "conhecer", en: "to know (people/places)", note: "familiarity" },
                { pt: "gostar", en: "to like", note: "preference or enjoyment" }
              ],
              keyPoints: [
                "Communication verbs are essential for social interaction",
                "Portuguese distinguishes between different types of knowledge",
                "These verbs often require specific prepositions",
                "Social verbs reflect Portuguese cultural values"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Movement verbs flashcards
          { id: "e1", type: "flashcard", term: "correr", translation: "to run" },
          { id: "e2", type: "flashcard", term: "subir", translation: "to go up" },
          { id: "e3", type: "flashcard", term: "entrar", translation: "to enter" },
          { id: "e4", type: "flashcard", term: "chegar", translation: "to arrive" },
          
          // Practice: Movement verbs (MCQ)
          { id: "e5", type: "mcq", prompt: "What's the opposite of 'subir'?", options: ["descer", "entrar", "sair"], correct: "descer" },
          { id: "e6", type: "mcq", prompt: "What's 'voltar' in English?", options: ["to turn", "to return", "to run"], correct: "to return" },
          
          // Practice: Movement matching
          { id: "e7", type: "matching", pairs: [
            { a: "sair", b: "to exit" },
            { a: "partir", b: "to depart" },
            { a: "parar", b: "to stop" },
            { a: "caminhar", b: "to walk" }
          ]},
          
          // Presentation: Communication verbs flashcards
          { id: "e8", type: "flashcard", term: "perguntar", translation: "to ask" },
          { id: "e9", type: "flashcard", term: "ajudar", translation: "to help" },
          { id: "e10", type: "flashcard", term: "aprender", translation: "to learn" },
          
          // Practice: Communication verbs matching
          { id: "e11", type: "matching", pairs: [
            { a: "responder", b: "to answer" },
            { a: "explicar", b: "to explain" },
            { a: "entender", b: "to understand" },
            { a: "ensinar", b: "to teach" }
          ]},
          
          // Production: Action descriptions (typing)
          { id: "e12", type: "typing", prompt: "Say: 'I run every day.'", correct: "Corro todos os dias." },
          { id: "e13", type: "typing", prompt: "Say: 'Can you help me?'", correct: "Podes ajudar-me?" },
          { id: "e14", type: "typing", prompt: "Say: 'I like to learn Portuguese.'", correct: "Gosto de aprender português." },
          { id: "e15", type: "typing", prompt: "Ask: 'Do you understand?'", correct: "Entendes?" },
        ],
      },
    ],
  },
  {
    id: "vocab5enhanced",
    title: "🌿 Nature & Environment (Enhanced PPP)",
    description: "Master Portuguese nature vocabulary, environmental expressions, and outdoor culture with complete immersion.",
    lessons: [
      {
        id: "vocab5el1",
        title: "Portuguese Nature and Outdoor Vocabulary",
        xp: 40,
        content: {
          title: "Portuguese Nature and Environmental Culture",
          sections: [
            {
              title: "Essential Nature Vocabulary",
              explanation: "Master the fundamental nature vocabulary for outdoor activities and environmental discussions:",
              examples: [
                { pt: "natureza", en: "nature", note: "a natureza - natural world" },
                { pt: "árvore", en: "tree", note: "a árvore - forest vegetation" },
                { pt: "floresta", en: "forest", note: "a floresta - wooded area" },
                { pt: "montanha", en: "mountain", note: "a montanha - elevated terrain" },
                { pt: "rio", en: "river", note: "o rio - flowing water" },
                { pt: "mar", en: "sea", note: "o mar - ocean water" },
                { pt: "praia", en: "beach", note: "a praia - coastal sand" },
                { pt: "lago", en: "lake", note: "o lago - inland water body" }
              ],
              keyPoints: [
                "Portuguese nature terms often specify gender",
                "Many Portuguese parks are UNESCO World Heritage sites",
                "Portugal has diverse ecosystems from coast to mountains",
                "Environmental awareness is growing in Portuguese culture"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "natureza", translation: "nature" },
          { id: "e2", type: "flashcard", term: "árvore", translation: "tree" },
          { id: "e3", type: "mcq", prompt: "What's 'floresta' in English?", options: ["flower", "forest", "fortress"], correct: "forest" },
          { id: "e4", type: "typing", prompt: "Say: 'The nature is beautiful.'", correct: "A natureza é bonita." },
        ],
      },
      {
        id: "vocab5el2",
        title: "Portuguese Environmental Culture",
        xp: 45,
        content: {
          title: "Portuguese Environmental Awareness",
          sections: [
            {
              title: "Environmental Vocabulary",
              explanation: "Learn to discuss environmental topics and outdoor activities in Portuguese:",
              examples: [
                { pt: "reciclagem", en: "recycling", note: "environmental practice" },
                { pt: "poluição", en: "pollution", note: "environmental problem" },
                { pt: "conservação", en: "conservation", note: "protecting nature" },
                { pt: "sustentável", en: "sustainable", note: "eco-friendly approach" }
              ],
              keyPoints: [
                "Portugal is committed to environmental protection",
                "Renewable energy is increasingly important",
                "National parks preserve Portuguese biodiversity"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "reciclagem", translation: "recycling" },
          { id: "e2", type: "mcq", prompt: "What's 'poluição' in English?", options: ["solution", "pollution", "evolution"], correct: "pollution" },
          { id: "e3", type: "typing", prompt: "Say: 'We need to protect the environment.'", correct: "Precisamos proteger o ambiente." },
        ],
      },
    ],
  },
  {
    id: "vocab6enhanced",
    title: "💻 Technology & Digital Life (Enhanced PPP)",
    description: "Master Portuguese technology vocabulary, digital communication, and modern life expressions with practical applications.",
    lessons: [
      {
        id: "vocab6el1",
        title: "Portuguese Technology and Digital Vocabulary",
        xp: 40,
        content: {
          title: "Portuguese Digital Culture and Technology",
          sections: [
            {
              title: "Essential Technology Vocabulary",
              explanation: "Master the fundamental technology terms used in modern Portuguese daily life:",
              examples: [
                { pt: "computador", en: "computer", note: "o computador - desktop/laptop" },
                { pt: "telemóvel", en: "mobile phone", note: "o telemóvel - Portuguese term" },
                { pt: "internet", en: "internet", note: "a internet - global network" },
                { pt: "wifi", en: "wifi", note: "o wifi - wireless connection" },
                { pt: "email", en: "email", note: "o email - electronic mail" }
              ],
              keyPoints: [
                "Portuguese uses 'telemóvel' instead of 'celular'",
                "Technology terms often keep English roots",
                "Digital communication is essential in modern Portugal"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "computador", translation: "computer" },
          { id: "e2", type: "flashcard", term: "telemóvel", translation: "mobile phone" },
          { id: "e3", type: "mcq", prompt: "What's 'telemóvel' in English?", options: ["telephone", "mobile phone", "computer"], correct: "mobile phone" },
          { id: "e4", type: "typing", prompt: "Say: 'I use the computer.'", correct: "Uso o computador." },
        ],
      },
      {
        id: "vocab6el2",
        title: "Portuguese Digital Culture and Modern Communication",
        xp: 45,
        content: {
          title: "Portuguese Digital Lifestyle and Communication",
          sections: [
            {
              title: "Digital Communication",
              explanation: "Essential phrases for digital communication and online interactions:",
              examples: [
                { pt: "enviar uma mensagem", en: "to send a message", note: "digital messaging" },
                { pt: "fazer uma chamada", en: "to make a call", note: "phone communication" },
                { pt: "partilhar", en: "to share", note: "social media action" }
              ],
              keyPoints: [
                "Portuguese digital communication is very active",
                "Social media usage is high among all age groups"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "enviar uma mensagem", translation: "to send a message" },
          { id: "e2", type: "mcq", prompt: "What's 'partilhar' in English?", options: ["publish", "share", "download"], correct: "share" },
          { id: "e3", type: "typing", prompt: "Say: 'I'm sending an email.'", correct: "Estou a enviar um email." },
        ],
      },
    ],
  },
  {
    id: "vocab7enhanced",
    title: "🎭 Entertainment & Leisure (Enhanced PPP)",
    description: "Master Portuguese entertainment vocabulary, leisure activities, and cultural expressions with comprehensive practice.",
    lessons: [
      {
        id: "vocab7el1",
        title: "Portuguese Entertainment and Cultural Vocabulary",
        xp: 40,
        content: {
          title: "Portuguese Entertainment and Cultural Life",
          sections: [
            {
              title: "Entertainment Vocabulary",
              explanation: "Master the fundamental entertainment terms used in Portuguese cultural life:",
              examples: [
                { pt: "cinema", en: "cinema", note: "o cinema - movie theater" },
                { pt: "filme", en: "movie", note: "o filme - motion picture" },
                { pt: "teatro", en: "theater", note: "o teatro - stage performances" },
                { pt: "música", en: "music", note: "a música - musical art" },
                { pt: "concerto", en: "concert", note: "o concerto - live music performance" },
                { pt: "festival", en: "festival", note: "o festival - cultural celebration" },
                { pt: "exposição", en: "exhibition", note: "a exposição - art display" },
                { pt: "museu", en: "museum", note: "o museu - cultural institution" },
                { pt: "biblioteca", en: "library", note: "a biblioteca - book collection" },
                { pt: "galeria", en: "gallery", note: "a galeria - art space" }
              ],
              keyPoints: [
                "Portugal has a rich cultural entertainment scene",
                "Traditional Portuguese music includes fado",
                "Cultural activities are central to Portuguese social life",
                "Many cultural events are free or affordable"
              ]
            },
            {
              title: "Portuguese Cultural Traditions",
              explanation: "Understanding Portugal's unique cultural entertainment traditions:",
              examples: [
                { pt: "fado", en: "fado", note: "traditional Portuguese music genre" },
                { pt: "festa", en: "party/festival", note: "celebration or festival" },
                { pt: "romaria", en: "pilgrimage/festival", note: "religious festival" },
                { pt: "sarau", en: "evening party", note: "cultural gathering" },
                { pt: "espetáculo", en: "show/spectacle", note: "performance or show" },
                { pt: "bailado", en: "ballet", note: "dance performance" },
                { pt: "ópera", en: "opera", note: "musical theater" },
                { pt: "recital", en: "recital", note: "musical performance" }
              ],
              keyPoints: [
                "Fado is UNESCO World Heritage",
                "Portuguese festivals often mix religious and cultural elements",
                "Many towns have annual cultural festivals",
                "Portuguese cultural events are community-focused"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Entertainment vocabulary flashcards
          { id: "e1", type: "flashcard", term: "cinema", translation: "cinema" },
          { id: "e2", type: "flashcard", term: "filme", translation: "movie" },
          { id: "e3", type: "flashcard", term: "teatro", translation: "theater" },
          { id: "e4", type: "flashcard", term: "música", translation: "music" },
          { id: "e5", type: "flashcard", term: "concerto", translation: "concert" },
          
          // Practice: Entertainment recognition (MCQ)
          { id: "e6", type: "mcq", prompt: "What's 'teatro' in English?", options: ["theater", "television", "telephone"], correct: "theater" },
          { id: "e7", type: "mcq", prompt: "What's 'exposição' in English?", options: ["explosion", "exhibition", "expression"], correct: "exhibition" },
          { id: "e8", type: "mcq", prompt: "What's 'museu' in English?", options: ["music", "museum", "musician"], correct: "museum" },
          
          // Practice: Cultural terms matching
          { id: "e9", type: "matching", pairs: [
            { a: "fado", b: "traditional Portuguese music" },
            { a: "festa", b: "party/festival" },
            { a: "espetáculo", b: "show/spectacle" },
            { a: "biblioteca", b: "library" }
          ]},
          
          // Practice: Entertainment venues (MCQ)
          { id: "e10", type: "mcq", prompt: "Where do you watch movies?", options: ["teatro", "cinema", "museu"], correct: "cinema" },
          { id: "e11", type: "mcq", prompt: "Where do you see art exhibitions?", options: ["galeria", "cinema", "biblioteca"], correct: "galeria" },
          
          // Production: Entertainment preferences (typing)
          { id: "e12", type: "typing", prompt: "Say: 'I like music.'", correct: "Gosto de música." },
          { id: "e13", type: "typing", prompt: "Say: 'I'm going to the cinema.'", correct: "Vou ao cinema." },
          { id: "e14", type: "typing", prompt: "Say: 'The concert was amazing.'", correct: "O concerto foi fantástico." },
          { id: "e15", type: "typing", prompt: "Ask: 'Do you like theater?'", correct: "Gostas de teatro?" },
        ],
      },
      {
        id: "vocab7el2",
        title: "Portuguese Leisure Activities and Hobbies",
        xp: 45,
        content: {
          title: "Portuguese Leisure Culture and Activities",
          sections: [
            {
              title: "Sports and Physical Activities",
              explanation: "Essential vocabulary for sports and physical activities popular in Portugal:",
              examples: [
                { pt: "desporto", en: "sport", note: "o desporto - physical activity" },
                { pt: "futebol", en: "football/soccer", note: "o futebol - most popular sport" },
                { pt: "natação", en: "swimming", note: "a natação - water sport" },
                { pt: "ténis", en: "tennis", note: "o ténis - racket sport" },
                { pt: "basquetebol", en: "basketball", note: "o basquetebol - team sport" },
                { pt: "ciclismo", en: "cycling", note: "o ciclismo - bike sport" },
                { pt: "corrida", en: "running", note: "a corrida - running activity" },
                { pt: "ginásio", en: "gym", note: "o ginásio - fitness center" },
                { pt: "exercício", en: "exercise", note: "o exercício - physical activity" },
                { pt: "treino", en: "training", note: "o treino - practice session" }
              ],
              keyPoints: [
                "Football is extremely popular in Portugal",
                "Portugal has excellent conditions for water sports",
                "Cycling is growing in popularity",
                "Gyms and fitness centers are common in cities"
              ]
            },
            {
              title: "Hobbies and Creative Activities",
              explanation: "Vocabulary for hobbies and creative pursuits enjoyed by Portuguese people:",
              examples: [
                { pt: "leitura", en: "reading", note: "a leitura - reading books" },
                { pt: "pintura", en: "painting", note: "a pintura - art activity" },
                { pt: "desenho", en: "drawing", note: "o desenho - sketching" },
                { pt: "fotografia", en: "photography", note: "a fotografia - taking photos" },
                { pt: "jardinagem", en: "gardening", note: "a jardinagem - garden work" },
                { pt: "culinária", en: "cooking", note: "a culinária - food preparation" },
                { pt: "artesanato", en: "crafts", note: "o artesanato - handmade items" },
                { pt: "colecionar", en: "collecting", note: "hobby of collecting items" },
                { pt: "jogar", en: "to play", note: "games or sports" },
                { pt: "passear", en: "to stroll/walk", note: "leisure walking" }
              ],
              keyPoints: [
                "Portuguese people enjoy outdoor leisure activities",
                "Reading is a popular pastime",
                "Creative hobbies are widely practiced",
                "Traditional crafts are still popular"
              ]
            },
            {
              title: "Leisure Expressions and Activities",
              explanation: "Common expressions for discussing leisure time and activities:",
              examples: [
                { pt: "tempo livre", en: "free time", note: "leisure time" },
                { pt: "diversão", en: "fun/entertainment", note: "enjoyment" },
                { pt: "relaxar", en: "to relax", note: "unwind and rest" },
                { pt: "divertir-se", en: "to have fun", note: "enjoy oneself" },
                { pt: "fim de semana", en: "weekend", note: "Saturday and Sunday" },
                { pt: "feriado", en: "holiday", note: "public holiday" },
                { pt: "férias", en: "vacation", note: "extended time off" },
                { pt: "passatempo", en: "pastime/hobby", note: "leisure activity" },
                { pt: "entretenimento", en: "entertainment", note: "amusement" },
                { pt: "ócio", en: "leisure", note: "free time" }
              ],
              keyPoints: [
                "Portuguese value work-life balance",
                "Family time is important during leisure",
                "Outdoor activities are preferred when weather permits",
                "Social activities often involve food and conversation"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Sports vocabulary flashcards
          { id: "e1", type: "flashcard", term: "desporto", translation: "sport" },
          { id: "e2", type: "flashcard", term: "futebol", translation: "football/soccer" },
          { id: "e3", type: "flashcard", term: "natação", translation: "swimming" },
          { id: "e4", type: "flashcard", term: "ténis", translation: "tennis" },
          { id: "e5", type: "flashcard", term: "ginásio", translation: "gym" },
          
          // Practice: Sports recognition (MCQ)
          { id: "e6", type: "mcq", prompt: "What's 'ciclismo' in English?", options: ["cycling", "circus", "cinema"], correct: "cycling" },
          { id: "e7", type: "mcq", prompt: "What's 'corrida' in English?", options: ["corridor", "running", "correction"], correct: "running" },
          { id: "e8", type: "mcq", prompt: "What's 'basquetebol' in English?", options: ["baseball", "basketball", "badminton"], correct: "basketball" },
          
          // Practice: Hobbies matching
          { id: "e9", type: "matching", pairs: [
            { a: "leitura", b: "reading" },
            { a: "pintura", b: "painting" },
            { a: "fotografia", b: "photography" },
            { a: "jardinagem", b: "gardening" }
          ]},
          
          // Practice: Creative activities matching
          { id: "e10", type: "matching", pairs: [
            { a: "desenho", b: "drawing" },
            { a: "culinária", b: "cooking" },
            { a: "artesanato", b: "crafts" },
            { a: "colecionar", b: "collecting" }
          ]},
          
          // Practice: Leisure expressions (MCQ)
          { id: "e11", type: "mcq", prompt: "What's 'tempo livre' in English?", options: ["free time", "free temperature", "time freedom"], correct: "free time" },
          { id: "e12", type: "mcq", prompt: "What's 'divertir-se' in English?", options: ["to divert", "to have fun", "to divide"], correct: "to have fun" },
          
          // Practice: Weekend activities (MCQ)
          { id: "e13", type: "mcq", prompt: "What's 'fim de semana' in English?", options: ["end of week", "weekend", "week finale"], correct: "weekend" },
          { id: "e14", type: "mcq", prompt: "What's 'passatempo' in English?", options: ["past time", "pastime/hobby", "time passing"], correct: "pastime/hobby" },
          
          // Production: Sports activities (typing)
          { id: "e15", type: "typing", prompt: "Say: 'I play football.'", correct: "Jogo futebol." },
          { id: "e16", type: "typing", prompt: "Say: 'I go to the gym.'", correct: "Vou ao ginásio." },
          { id: "e17", type: "typing", prompt: "Say: 'I like swimming.'", correct: "Gosto de natação." },
          { id: "e18", type: "typing", prompt: "Ask: 'Do you play tennis?'", correct: "Jogas ténis?" },
          
          // Production: Hobbies and interests (typing)
          { id: "e19", type: "typing", prompt: "Say: 'I like reading.'", correct: "Gosto de leitura." },
          { id: "e20", type: "typing", prompt: "Say: 'I love cooking.'", correct: "Adoro culinária." },
          { id: "e21", type: "typing", prompt: "Say: 'Photography is my hobby.'", correct: "A fotografia é o meu passatempo." },
          { id: "e22", type: "typing", prompt: "Ask: 'What do you do in your free time?'", correct: "O que fazes no teu tempo livre?" },
          
          // Production: Leisure time (typing)
          { id: "e23", type: "typing", prompt: "Say: 'I want to relax.'", correct: "Quero relaxar." },
          { id: "e24", type: "typing", prompt: "Say: 'The weekend was fun.'", correct: "O fim de semana foi divertido." },
          { id: "e25", type: "typing", prompt: "Ask: 'What do you do for entertainment?'", correct: "O que fazes para te divertires?" },
          { id: "e26", type: "typing", prompt: "Say: 'I have many hobbies.'", correct: "Tenho muitos passatempos." },
          
          // Production: Activity invitations (typing)
          { id: "e27", type: "typing", prompt: "Say: 'Let's go for a walk.'", correct: "Vamos passear." },
          { id: "e28", type: "typing", prompt: "Ask: 'Do you want to play?'", correct: "Queres jogar?" },
          { id: "e29", type: "typing", prompt: "Say: 'I'm going on vacation.'", correct: "Vou de férias." },
        ],
      },
    ],
  },
  
  // PHASE C: CULTURAL ENHANCED MODULES
  {
    id: "cultural1enhanced",
    title: "🇵🇹 Portuguese Culture & Traditions (Enhanced PPP)",
    description: "Discover Portuguese culture, traditions, and social customs essential for understanding Portuguese-speaking environments.",
    lessons: [
      {
        id: "cultural1el1",
        title: "Portuguese Cultural Identity and Values",
        xp: 50,
        content: {
          title: "Understanding Portuguese Cultural Identity",
          sections: [
            {
              title: "Portuguese National Identity",
              explanation: "Understand the core elements that define Portuguese cultural identity and national pride:",
              examples: [
                { pt: "saudade", en: "saudade", note: "uniquely Portuguese emotion - longing, nostalgia" },
                { pt: "fado", en: "fado", note: "traditional Portuguese music expressing saudade" },
                { pt: "azulejo", en: "azulejo", note: "traditional blue ceramic tiles" },
                { pt: "descobrimentos", en: "discoveries", note: "Age of Portuguese maritime exploration" },
                { pt: "bacalhau", en: "codfish", note: "national dish with 365 different recipes" },
                { pt: "vinho do Porto", en: "Port wine", note: "famous Portuguese fortified wine" },
                { pt: "Camões", en: "Camões", note: "Portugal's greatest poet" },
                { pt: "Pessoa", en: "Pessoa", note: "renowned Portuguese modernist poet" },
                { pt: "pastéis de nata", en: "custard tarts", note: "iconic Portuguese pastry from Belém" },
                { pt: "futebol", en: "football", note: "national passion and cultural unifier" }
              ],
              keyPoints: [
                "Saudade is considered uniquely Portuguese and untranslatable",
                "Portuguese take great pride in their maritime history",
                "Food culture is central to Portuguese social life",
                "Literature and poetry hold special cultural significance"
              ]
            },
            {
              title: "Portuguese Social Values and Customs",
              explanation: "Essential social values and customs that guide Portuguese interactions:",
              examples: [
                { pt: "família", en: "family", note: "central to Portuguese life and values" },
                { pt: "hospitalidade", en: "hospitality", note: "welcoming guests is highly valued" },
                { pt: "respeito", en: "respect", note: "especially toward elders and authority" },
                { pt: "tradição", en: "tradition", note: "preserving cultural heritage" },
                { pt: "comunidade", en: "community", note: "strong sense of local belonging" },
                { pt: "religião", en: "religion", note: "Catholic heritage influences culture" },
                { pt: "trabalho", en: "work", note: "balanced with leisure and family time" },
                { pt: "amizade", en: "friendship", note: "deep, long-lasting relationships valued" },
                { pt: "educação", en: "education/politeness", note: "good manners are essential" },
                { pt: "solidariedade", en: "solidarity", note: "helping others in need" }
              ],
              keyPoints: [
                "Family gatherings are frequent and important",
                "Portuguese value personal relationships over efficiency",
                "Politeness and formal address are important initially",
                "Community events and festivals strengthen social bonds"
              ]
            },
            {
              title: "Portuguese Cultural Expressions",
              explanation: "Common cultural expressions and their meanings in Portuguese society:",
              examples: [
                { pt: "Está tudo bem?", en: "Is everything okay?", note: "shows concern for others" },
                { pt: "Com licença", en: "Excuse me", note: "polite way to get attention" },
                { pt: "Bom dia", en: "Good morning", note: "always greet people you encounter" },
                { pt: "Muito obrigado/a", en: "Thank you very much", note: "gratitude is always expressed" },
                { pt: "Desculpe", en: "Sorry/Excuse me", note: "apologizing is common and polite" },
                { pt: "Faz favor", en: "Please/If you would", note: "formal polite request" },
                { pt: "Não faz mal", en: "It doesn't matter/No problem", note: "accepting apologies graciously" },
                { pt: "Boa sorte", en: "Good luck", note: "wishing others well" },
                { pt: "Felicidades", en: "Congratulations", note: "celebrating others' success" },
                { pt: "Até logo", en: "See you later", note: "casual but warm farewell" }
              ],
              keyPoints: [
                "Greetings are essential in all social interactions",
                "Portuguese people are generally warm and expressive",
                "Politeness formulas are used frequently",
                "Showing interest in others' well-being is cultural norm"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Cultural identity flashcards
          { id: "e1", type: "flashcard", term: "saudade", translation: "uniquely Portuguese longing/nostalgia" },
          { id: "e2", type: "flashcard", term: "fado", translation: "traditional Portuguese music" },
          { id: "e3", type: "flashcard", term: "azulejo", translation: "traditional blue ceramic tiles" },
          { id: "e4", type: "flashcard", term: "descobrimentos", translation: "Portuguese maritime discoveries" },
          { id: "e5", type: "flashcard", term: "pastéis de nata", translation: "Portuguese custard tarts" },
          
          // Practice: Cultural knowledge (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'saudade'?", options: ["a dance", "a unique Portuguese emotion", "a food"], correct: "a unique Portuguese emotion" },
          { id: "e7", type: "mcq", prompt: "What is Portugal's national dish?", options: ["paella", "bacalhau", "pasta"], correct: "bacalhau" },
          { id: "e8", type: "mcq", prompt: "What are 'azulejos'?", options: ["blue tiles", "songs", "dances"], correct: "blue tiles" },
          
          // Practice: Cultural elements matching
          { id: "e9", type: "matching", pairs: [
            { a: "Camões", b: "Portugal's greatest poet" },
            { a: "vinho do Porto", b: "Port wine" },
            { a: "futebol", b: "national passion" },
            { a: "Pessoa", b: "modernist poet" }
          ]},
          
          // Practice: Social values (MCQ)
          { id: "e10", type: "mcq", prompt: "What is most important in Portuguese culture?", options: ["individual success", "family", "work efficiency"], correct: "family" },
          { id: "e11", type: "mcq", prompt: "How do Portuguese people view hospitality?", options: ["unimportant", "highly valued", "sometimes valued"], correct: "highly valued" },
          
          // Practice: Social values matching
          { id: "e12", type: "matching", pairs: [
            { a: "hospitalidade", b: "hospitality" },
            { a: "respeito", b: "respect" },
            { a: "tradição", b: "tradition" },
            { a: "comunidade", b: "community" }
          ]},
          
          // Practice: Cultural expressions (MCQ)
          { id: "e13", type: "mcq", prompt: "What does 'Está tudo bem?' show?", options: ["anger", "concern for others", "confusion"], correct: "concern for others" },
          { id: "e14", type: "mcq", prompt: "When should you say 'Bom dia'?", options: ["only to friends", "to everyone you encounter", "never"], correct: "to everyone you encounter" },
          
          // Production: Cultural understanding (typing)
          { id: "e15", type: "typing", prompt: "Say: 'Family is very important.'", correct: "A família é muito importante." },
          { id: "e16", type: "typing", prompt: "Say: 'I love fado music.'", correct: "Adoro música de fado." },
          { id: "e17", type: "typing", prompt: "Say: 'Portuguese people are very hospitable.'", correct: "Os portugueses são muito hospitaleiros." },
          { id: "e18", type: "typing", prompt: "Ask: 'Are you okay?'", correct: "Está tudo bem?" },
          { id: "e19", type: "typing", prompt: "Say: 'Thank you for your hospitality.'", correct: "Obrigado pela vossa hospitalidade." },
          
          // Production: Cultural appreciation (typing)
          { id: "e20", type: "typing", prompt: "Say: 'I want to learn about Portuguese culture.'", correct: "Quero aprender sobre a cultura portuguesa." },
          { id: "e21", type: "typing", prompt: "Say: 'Portugal has a rich history.'", correct: "Portugal tem uma história rica." },
          { id: "e22", type: "typing", prompt: "Say: 'I respect Portuguese traditions.'", correct: "Respeito as tradições portuguesas." },
        ],
      },
      {
        id: "cultural1el2",
        title: "Portuguese Festivals and Celebrations",
        xp: 55,
        content: {
          title: "Portuguese Festivals and Cultural Celebrations",
          sections: [
            {
              title: "Major Portuguese Festivals",
              explanation: "Learn about Portugal's most important festivals and celebrations throughout the year:",
              examples: [
                { pt: "Festa de São João", en: "St. John's Festival", note: "June 24th, especially celebrated in Porto" },
                { pt: "Carnaval", en: "Carnival", note: "pre-Lenten celebration with parades and costumes" },
                { pt: "Festa dos Tabuleiros", en: "Festival of Trays", note: "Tomar's bread festival every 4 years" },
                { pt: "Festival de Verão", en: "Summer Festival", note: "various summer cultural events" },
                { pt: "Festa das Cruzes", en: "Festival of Crosses", note: "religious celebration in May" },
                { pt: "Festa da Flor", en: "Flower Festival", note: "Madeira's spring flower celebration" },
                { pt: "São Martinho", en: "St. Martin's Day", note: "November 11th, chestnuts and new wine" },
                { pt: "Natal", en: "Christmas", note: "important family celebration" },
                { pt: "Ano Novo", en: "New Year", note: "celebrated with fireworks and family" },
                { pt: "Páscoa", en: "Easter", note: "religious holiday with special foods" }
              ],
              keyPoints: [
                "Each region has its own local festivals and saints",
                "Religious festivals often blend with cultural traditions",
                "Food and music are central to all celebrations",
                "Community participation is highly valued"
              ]
            },
            {
              title: "Portuguese Holiday Traditions",
              explanation: "Understanding traditional customs and practices during Portuguese holidays:",
              examples: [
                { pt: "fogueira", en: "bonfire", note: "traditional at São João festival" },
                { pt: "sardinha assada", en: "grilled sardines", note: "popular at summer festivals" },
                { pt: "manjerico", en: "basil plant", note: "given as gifts during São João" },
                { pt: "bailarico", en: "folk dance", note: "traditional community dancing" },
                { pt: "procissão", en: "procession", note: "religious parade through streets" },
                { pt: "arraial", en: "street party", note: "outdoor community celebration" },
                { pt: "fogo de artifício", en: "fireworks", note: "common at major celebrations" },
                { pt: "missa do galo", en: "midnight mass", note: "Christmas Eve church service" },
                { pt: "consoada", en: "Christmas Eve dinner", note: "important family meal" },
                { pt: "Reis", en: "Epiphany", note: "January 6th, end of Christmas season" }
              ],
              keyPoints: [
                "Portuguese festivals combine religious and secular elements",
                "Food preparation is a community activity",
                "Music and dancing are essential to celebrations",
                "Festivals strengthen community bonds"
              ]
            },
            {
              title: "Regional Cultural Differences",
              explanation: "Understanding cultural variations across different Portuguese regions:",
              examples: [
                { pt: "Norte", en: "North", note: "more traditional, strong folk culture" },
                { pt: "Centro", en: "Center", note: "historic universities and traditions" },
                { pt: "Sul", en: "South", note: "more relaxed, influenced by Mediterranean culture" },
                { pt: "Lisboa", en: "Lisbon", note: "cosmopolitan capital with diverse culture" },
                { pt: "Porto", en: "Porto", note: "proud of local traditions and rivalry with Lisbon" },
                { pt: "Algarve", en: "Algarve", note: "tourism-influenced, international atmosphere" },
                { pt: "Madeira", en: "Madeira", note: "unique island culture and traditions" },
                { pt: "Açores", en: "Azores", note: "distinct Atlantic island culture" },
                { pt: "Minho", en: "Minho", note: "strong Celtic influences and green landscapes" },
                { pt: "Alentejo", en: "Alentejo", note: "rural culture, cork production, slower pace" }
              ],
              keyPoints: [
                "Each region has distinct dialects and accents",
                "Local pride is strong throughout Portugal",
                "Food specialties vary significantly by region",
                "Understanding regional differences shows cultural awareness"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Major festivals flashcards
          { id: "e1", type: "flashcard", term: "Festa de São João", translation: "St. John's Festival (Porto)" },
          { id: "e2", type: "flashcard", term: "Carnaval", translation: "Carnival celebration" },
          { id: "e3", type: "flashcard", term: "Festa dos Tabuleiros", translation: "Festival of Trays (Tomar)" },
          { id: "e4", type: "flashcard", term: "São Martinho", translation: "St. Martin's Day (chestnuts)" },
          { id: "e5", type: "flashcard", term: "Natal", translation: "Christmas" },
          
          // Practice: Festival knowledge (MCQ)
          { id: "e6", type: "mcq", prompt: "When is São João celebrated?", options: ["December 25th", "June 24th", "January 1st"], correct: "June 24th" },
          { id: "e7", type: "mcq", prompt: "Where is São João especially celebrated?", options: ["Lisbon", "Porto", "Faro"], correct: "Porto" },
          { id: "e8", type: "mcq", prompt: "What do people eat on São Martinho?", options: ["sardines", "chestnuts", "cake"], correct: "chestnuts" },
          
          // Practice: Festival traditions matching
          { id: "e9", type: "matching", pairs: [
            { a: "fogueira", b: "bonfire" },
            { a: "sardinha assada", b: "grilled sardines" },
            { a: "manjerico", b: "basil plant gift" },
            { a: "bailarico", b: "folk dance" }
          ]},
          
          // Practice: Holiday customs (MCQ)
          { id: "e10", type: "mcq", prompt: "What is 'consoada'?", options: ["New Year party", "Christmas Eve dinner", "Easter meal"], correct: "Christmas Eve dinner" },
          { id: "e11", type: "mcq", prompt: "What is an 'arraial'?", options: ["church service", "street party", "dance"], correct: "street party" },
          
          // Practice: Holiday traditions matching
          { id: "e12", type: "matching", pairs: [
            { a: "procissão", b: "religious procession" },
            { a: "missa do galo", b: "midnight mass" },
            { a: "fogo de artifício", b: "fireworks" },
            { a: "Reis", b: "Epiphany" }
          ]},
          
          // Practice: Regional knowledge (MCQ)
          { id: "e13", type: "mcq", prompt: "Which region is known for cork production?", options: ["Alentejo", "Minho", "Algarve"], correct: "Alentejo" },
          { id: "e14", type: "mcq", prompt: "Which city is Portugal's capital?", options: ["Porto", "Lisboa", "Coimbra"], correct: "Lisboa" },
          
          // Practice: Regional characteristics matching
          { id: "e15", type: "matching", pairs: [
            { a: "Norte", b: "traditional folk culture" },
            { a: "Sul", b: "Mediterranean influenced" },
            { a: "Madeira", b: "unique island culture" },
            { a: "Açores", b: "Atlantic island culture" }
          ]},
          
          // Production: Festival expressions (typing)
          { id: "e16", type: "typing", prompt: "Say: 'I love Portuguese festivals.'", correct: "Adoro as festas portuguesas." },
          { id: "e17", type: "typing", prompt: "Say: 'Christmas is very important.'", correct: "O Natal é muito importante." },
          { id: "e18", type: "typing", prompt: "Ask: 'When is the São João festival?'", correct: "Quando é a festa de São João?" },
          { id: "e19", type: "typing", prompt: "Say: 'I want to see the fireworks.'", correct: "Quero ver o fogo de artifício." },
          
          // Production: Regional appreciation (typing)
          { id: "e20", type: "typing", prompt: "Say: 'Each region has its own culture.'", correct: "Cada região tem a sua própria cultura." },
          { id: "e21", type: "typing", prompt: "Say: 'I like Porto's traditions.'", correct: "Gosto das tradições do Porto." },
          { id: "e22", type: "typing", prompt: "Say: 'Portuguese festivals are beautiful.'", correct: "As festas portuguesas são bonitas." },
          { id: "e23", type: "typing", prompt: "Ask: 'Do you celebrate São Martinho?'", correct: "Celebras o São Martinho?" },
          
          // Production: Cultural participation (typing)
          { id: "e24", type: "typing", prompt: "Say: 'I want to participate in the festival.'", correct: "Quero participar na festa." },
          { id: "e25", type: "typing", prompt: "Say: 'The community is very welcoming.'", correct: "A comunidade é muito acolhedora." },
        ],
      },
    ],
  },
  {
    id: "cultural2enhanced",
    title: "🏛️ Portuguese History & Landmarks (Enhanced PPP)",
    description: "Explore Portuguese history, famous landmarks, and cultural heritage sites essential for cultural understanding.",
    lessons: [
      {
        id: "cultural2el1",
        title: "Portuguese Historical Periods and Figures",
        xp: 50,
        content: {
          title: "Portuguese History and Cultural Heritage",
          sections: [
            {
              title: "Key Historical Periods",
              explanation: "Understanding major periods in Portuguese history that shaped the culture:",
              examples: [
                { pt: "Idade Média", en: "Middle Ages", note: "formation of Portugal as a nation" },
                { pt: "Descobrimentos", en: "Age of Discoveries", note: "15th-16th centuries maritime expansion" },
                { pt: "Império", en: "Empire", note: "Portuguese colonial empire worldwide" },
                { pt: "República", en: "Republic", note: "established 1910, ended monarchy" },
                { pt: "Estado Novo", en: "New State", note: "Salazar dictatorship 1933-1974" },
                { pt: "Revolução dos Cravos", en: "Carnation Revolution", note: "1974 peaceful revolution" },
                { pt: "Democracia", en: "Democracy", note: "democratic period since 1974" },
                { pt: "União Europeia", en: "European Union", note: "Portugal joined in 1986" },
                { pt: "Monarquia", en: "Monarchy", note: "royal period until 1910" },
                { pt: "Reconquista", en: "Reconquest", note: "Christian reconquest from Moors" }
              ],
              keyPoints: [
                "The Age of Discoveries is central to Portuguese identity",
                "The Carnation Revolution was peaceful and significant",
                "Portuguese history spans over 800 years as a nation",
                "Colonial history influences modern Portuguese culture"
              ]
            },
            {
              title: "Important Historical Figures",
              explanation: "Key personalities who shaped Portuguese history and culture:",
              examples: [
                { pt: "D. Afonso Henriques", en: "King Afonso I", note: "first King of Portugal, 1139" },
                { pt: "Infante D. Henrique", en: "Prince Henry the Navigator", note: "initiated Age of Discoveries" },
                { pt: "Vasco da Gama", en: "Vasco da Gama", note: "first to reach India by sea" },
                { pt: "Pedro Álvares Cabral", en: "Pedro Cabral", note: "discovered Brazil in 1500" },
                { pt: "Luís de Camões", en: "Luís de Camões", note: "greatest Portuguese poet, wrote Os Lusíadas" },
                { pt: "Marquês de Pombal", en: "Marquis of Pombal", note: "rebuilt Lisbon after 1755 earthquake" },
                { pt: "Fernando Pessoa", en: "Fernando Pessoa", note: "modernist poet with multiple personalities" },
                { pt: "Salazar", en: "Salazar", note: "dictator 1932-1968" },
                { pt: "Mário Soares", en: "Mário Soares", note: "key figure in Portuguese democracy" },
                { pt: "José Saramago", en: "José Saramago", note: "Nobel Prize winning author" }
              ],
              keyPoints: [
                "Portuguese navigators are national heroes",
                "Literature figures are highly respected",
                "Modern democratic leaders are celebrated",
                "Historical consciousness is strong in Portuguese culture"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Historical periods flashcards
          { id: "e1", type: "flashcard", term: "Descobrimentos", translation: "Age of Discoveries" },
          { id: "e2", type: "flashcard", term: "Revolução dos Cravos", translation: "Carnation Revolution" },
          { id: "e3", type: "flashcard", term: "República", translation: "Republic" },
          { id: "e4", type: "flashcard", term: "Império", translation: "Empire" },
          { id: "e5", type: "flashcard", term: "Democracia", translation: "Democracy" },
          
          // Practice: Historical knowledge (MCQ)
          { id: "e6", type: "mcq", prompt: "When was the Carnation Revolution?", options: ["1974", "1910", "1986"], correct: "1974" },
          { id: "e7", type: "mcq", prompt: "What ended in 1910?", options: ["dictatorship", "monarchy", "democracy"], correct: "monarchy" },
          { id: "e8", type: "mcq", prompt: "When did Portugal join the EU?", options: ["1974", "1986", "1999"], correct: "1986" },
          
          // Practice: Historical periods matching
          { id: "e9", type: "matching", pairs: [
            { a: "Idade Média", b: "Middle Ages" },
            { a: "Estado Novo", b: "Salazar dictatorship" },
            { a: "Reconquista", b: "Christian reconquest" },
            { a: "Monarquia", b: "royal period" }
          ]},
          
          // Presentation: Historical figures flashcards
          { id: "e10", type: "flashcard", term: "Vasco da Gama", translation: "first to reach India by sea" },
          { id: "e11", type: "flashcard", term: "Camões", translation: "greatest Portuguese poet" },
          { id: "e12", type: "flashcard", term: "Infante D. Henrique", translation: "Prince Henry the Navigator" },
          
          // Practice: Historical figures (MCQ)
          { id: "e13", type: "mcq", prompt: "Who was the first King of Portugal?", options: ["D. Afonso Henriques", "Vasco da Gama", "Camões"], correct: "D. Afonso Henriques" },
          { id: "e14", type: "mcq", prompt: "Who discovered Brazil?", options: ["Vasco da Gama", "Pedro Cabral", "Prince Henry"], correct: "Pedro Cabral" },
          { id: "e15", type: "mcq", prompt: "Who wrote 'Os Lusíadas'?", options: ["Pessoa", "Camões", "Saramago"], correct: "Camões" },
          
          // Practice: Historical figures matching
          { id: "e16", type: "matching", pairs: [
            { a: "Marquês de Pombal", b: "rebuilt Lisbon after earthquake" },
            { a: "Fernando Pessoa", b: "modernist poet" },
            { a: "José Saramago", b: "Nobel Prize author" },
            { a: "Mário Soares", b: "democratic leader" }
          ]},
          
          // Production: Historical knowledge (typing)
          { id: "e17", type: "typing", prompt: "Say: 'Portugal has a rich history.'", correct: "Portugal tem uma história rica." },
          { id: "e18", type: "typing", prompt: "Say: 'The Age of Discoveries was important.'", correct: "A época dos Descobrimentos foi importante." },
          { id: "e19", type: "typing", prompt: "Say: 'Camões is a great poet.'", correct: "Camões é um grande poeta." },
          { id: "e20", type: "typing", prompt: "Ask: 'Do you know Portuguese history?'", correct: "Conheces a história portuguesa?" },
        ],
      },
      {
        id: "cultural2el2",
        title: "Portuguese Landmarks and Heritage Sites",
        xp: 55,
        content: {
          title: "Portuguese Landmarks and Cultural Heritage",
          sections: [
            {
              title: "UNESCO World Heritage Sites",
              explanation: "Portugal's UNESCO World Heritage Sites that represent the country's cultural significance:",
              examples: [
                { pt: "Mosteiro dos Jerónimos", en: "Jerónimos Monastery", note: "Lisbon, Manueline architecture masterpiece" },
                { pt: "Torre de Belém", en: "Belém Tower", note: "Lisbon, symbol of Age of Discoveries" },
                { pt: "Convento de Cristo", en: "Convent of Christ", note: "Tomar, Knights Templar heritage" },
                { pt: "Mosteiro de Alcobaça", en: "Alcobaça Monastery", note: "Cistercian architecture" },
                { pt: "Mosteiro da Batalha", en: "Batalha Monastery", note: "Gothic masterpiece" },
                { pt: "Centro Histórico de Évora", en: "Historic Center of Évora", note: "Roman temple and medieval city" },
                { pt: "Centro Histórico do Porto", en: "Historic Center of Porto", note: "Ribeira district" },
                { pt: "Paisagem Cultural de Sintra", en: "Cultural Landscape of Sintra", note: "romantic architecture" },
                { pt: "Centro Histórico de Guimarães", en: "Historic Center of Guimarães", note: "birthplace of Portugal" },
                { pt: "Região Vinhateira do Alto Douro", en: "Alto Douro Wine Region", note: "terraced vineyards" }
              ],
              keyPoints: [
                "Portugal has 17 UNESCO World Heritage Sites",
                "Religious architecture is particularly significant",
                "These sites represent different historical periods",
                "Many sites relate to Portugal's maritime history"
              ]
            },
            {
              title: "Famous Portuguese Landmarks",
              explanation: "Iconic landmarks that define Portuguese cultural landscape:",
              examples: [
                { pt: "Palácio da Pena", en: "Pena Palace", note: "Sintra, romantic architecture" },
                { pt: "Ponte Dom Luís", en: "Dom Luís Bridge", note: "Porto, designed by Eiffel's student" },
                { pt: "Padrão dos Descobrimentos", en: "Discovery Monument", note: "Lisbon, celebrates explorers" },
                { pt: "Castelo de São Jorge", en: "St. George's Castle", note: "Lisbon, Moorish castle" },
                { pt: "Universidade de Coimbra", en: "University of Coimbra", note: "one of Europe's oldest universities" },
                { pt: "Santuário de Fátima", en: "Sanctuary of Fátima", note: "Catholic pilgrimage site" },
                { pt: "Cabo da Roca", en: "Cape Roca", note: "westernmost point of Europe" },
                { pt: "Óbidos", en: "Óbidos", note: "medieval walled town" },
                { pt: "Monsaraz", en: "Monsaraz", note: "medieval hilltop village" },
                { pt: "Aveiro", en: "Aveiro", note: "Venice of Portugal with canals" }
              ],
              keyPoints: [
                "Each landmark has historical and cultural significance",
                "Many landmarks are pilgrimage or tourist destinations",
                "Architecture reflects different periods and influences",
                "Landmarks are sources of national pride"
              ]
            },
            {
              title: "Portuguese Architectural Styles",
              explanation: "Distinctive architectural styles that characterize Portuguese buildings:",
              examples: [
                { pt: "Manuelino", en: "Manueline", note: "Portuguese late Gothic style" },
                { pt: "Azulejo", en: "Azulejo", note: "decorative ceramic tiles" },
                { pt: "Barroco", en: "Baroque", note: "ornate 17th-18th century style" },
                { pt: "Gótico", en: "Gothic", note: "medieval religious architecture" },
                { pt: "Românico", en: "Romanesque", note: "early medieval style" },
                { pt: "Mudéjar", en: "Mudéjar", note: "Moorish influenced style" },
                { pt: "Pombalino", en: "Pombaline", note: "18th century earthquake-resistant style" },
                { pt: "Arte Nova", en: "Art Nouveau", note: "early 20th century decorative style" },
                { pt: "Contemporâneo", en: "Contemporary", note: "modern Portuguese architecture" },
                { pt: "Vernacular", en: "Vernacular", note: "traditional regional styles" }
              ],
              keyPoints: [
                "Manueline style is uniquely Portuguese",
                "Azulejos are found throughout Portuguese architecture",
                "Each style reflects historical periods and influences",
                "Modern Portuguese architecture respects traditional elements"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: UNESCO sites flashcards
          { id: "e1", type: "flashcard", term: "Mosteiro dos Jerónimos", translation: "Jerónimos Monastery" },
          { id: "e2", type: "flashcard", term: "Torre de Belém", translation: "Belém Tower" },
          { id: "e3", type: "flashcard", term: "Centro Histórico do Porto", translation: "Historic Center of Porto" },
          { id: "e4", type: "flashcard", term: "Paisagem Cultural de Sintra", translation: "Cultural Landscape of Sintra" },
          
          // Practice: UNESCO sites knowledge (MCQ)
          { id: "e5", type: "mcq", prompt: "Where is the Jerónimos Monastery?", options: ["Porto", "Lisbon", "Coimbra"], correct: "Lisbon" },
          { id: "e6", type: "mcq", prompt: "What is Guimarães known as?", options: ["Venice of Portugal", "birthplace of Portugal", "city of students"], correct: "birthplace of Portugal" },
          { id: "e7", type: "mcq", prompt: "How many UNESCO sites does Portugal have?", options: ["15", "17", "20"], correct: "17" },
          
          // Practice: Heritage sites matching
          { id: "e8", type: "matching", pairs: [
            { a: "Convento de Cristo", b: "Tomar Knights Templar" },
            { a: "Mosteiro de Alcobaça", b: "Cistercian architecture" },
            { a: "Centro Histórico de Évora", b: "Roman temple" },
            { a: "Região Vinhateira do Alto Douro", b: "terraced vineyards" }
          ]},
          
          // Presentation: Famous landmarks flashcards
          { id: "e9", type: "flashcard", term: "Palácio da Pena", translation: "Pena Palace (Sintra)" },
          { id: "e10", type: "flashcard", term: "Padrão dos Descobrimentos", translation: "Discovery Monument" },
          { id: "e11", type: "flashcard", term: "Santuário de Fátima", translation: "Sanctuary of Fátima" },
          
          // Practice: Landmarks knowledge (MCQ)
          { id: "e12", type: "mcq", prompt: "What is Cabo da Roca?", options: ["easternmost point", "westernmost point", "highest point"], correct: "westernmost point" },
          { id: "e13", type: "mcq", prompt: "What is Aveiro known as?", options: ["Venice of Portugal", "Pearl of Portugal", "Heart of Portugal"], correct: "Venice of Portugal" },
          
          // Practice: Landmarks matching
          { id: "e14", type: "matching", pairs: [
            { a: "Ponte Dom Luís", b: "Porto bridge" },
            { a: "Castelo de São Jorge", b: "Lisbon Moorish castle" },
            { a: "Universidade de Coimbra", b: "ancient university" },
            { a: "Óbidos", b: "medieval walled town" }
          ]},
          
          // Presentation: Architectural styles flashcards
          { id: "e15", type: "flashcard", term: "Manuelino", translation: "Manueline (Portuguese Gothic)" },
          { id: "e16", type: "flashcard", term: "Azulejo", translation: "decorative ceramic tiles" },
          
          // Practice: Architecture knowledge (MCQ)
          { id: "e17", type: "mcq", prompt: "What is uniquely Portuguese architectural style?", options: ["Baroque", "Manueline", "Gothic"], correct: "Manueline" },
          { id: "e18", type: "mcq", prompt: "What are azulejos?", options: ["stones", "ceramic tiles", "windows"], correct: "ceramic tiles" },
          
          // Production: Landmarks appreciation (typing)
          { id: "e19", type: "typing", prompt: "Say: 'I want to visit Belém Tower.'", correct: "Quero visitar a Torre de Belém." },
          { id: "e20", type: "typing", prompt: "Say: 'Sintra is very beautiful.'", correct: "Sintra é muito bonita." },
          { id: "e21", type: "typing", prompt: "Say: 'Portuguese architecture is unique.'", correct: "A arquitetura portuguesa é única." },
          { id: "e22", type: "typing", prompt: "Ask: 'Have you been to Fátima?'", correct: "Já foste a Fátima?" },
          
          // Production: Cultural heritage (typing)
          { id: "e23", type: "typing", prompt: "Say: 'Portugal has many historic monuments.'", correct: "Portugal tem muitos monumentos históricos." },
          { id: "e24", type: "typing", prompt: "Say: 'I love Portuguese azulejos.'", correct: "Adoro os azulejos portugueses." },
          { id: "e25", type: "typing", prompt: "Say: 'The monasteries are impressive.'", correct: "Os mosteiros são impressionantes." },
        ],
      },
    ],
  },
  {
    id: "cultural3enhanced",
    title: "🎨 Portuguese Arts & Literature (Enhanced PPP)",
    description: "Explore Portuguese arts, literature, and cultural expressions that define the nation's creative heritage.",
    lessons: [
      {
        id: "cultural3el1",
        title: "Portuguese Literature and Poetry",
        xp: 50,
        content: {
          title: "Portuguese Literary Heritage",
          sections: [
            {
              title: "Classical Portuguese Literature",
              explanation: "Major works and authors that shaped Portuguese literary tradition:",
              examples: [
                { pt: "Os Lusíadas", en: "The Lusiads", note: "Camões' epic poem about Portuguese discoveries" },
                { pt: "Camões", en: "Camões", note: "Portugal's greatest poet, 16th century" },
                { pt: "Gil Vicente", en: "Gil Vicente", note: "founder of Portuguese theater" },
                { pt: "Eça de Queirós", en: "Eça de Queirós", note: "19th century realist novelist" },
                { pt: "Almeida Garrett", en: "Almeida Garrett", note: "romantic poet and playwright" },
                { pt: "Alexandre Herculano", en: "Alexandre Herculano", note: "historian and novelist" },
                { pt: "Antero de Quental", en: "Antero de Quental", note: "philosophical poet" },
                { pt: "Guerra Junqueiro", en: "Guerra Junqueiro", note: "satirical poet" },
                { pt: "Cesário Verde", en: "Cesário Verde", note: "urban realist poet" },
                { pt: "épica", en: "epic poetry", note: "grand narrative poetry" }
              ],
              keyPoints: [
                "Os Lusíadas is considered Portugal's national epic",
                "Portuguese literature reflects national history and identity",
                "Romanticism was important in 19th century Portuguese literature",
                "Many authors combined literature with political activism"
              ]
            },
            {
              title: "Modern Portuguese Literature",
              explanation: "20th and 21st century Portuguese literary movements and authors:",
              examples: [
                { pt: "Fernando Pessoa", en: "Fernando Pessoa", note: "modernist poet with multiple heteronyms" },
                { pt: "heterónimo", en: "heteronym", note: "Pessoa's distinct poetic personalities" },
                { pt: "José Saramago", en: "José Saramago", note: "Nobel Prize winner, distinctive narrative style" },
                { pt: "Sophia de Mello Breyner", en: "Sophia de Mello Breyner", note: "important female poet" },
                { pt: "Miguel Torga", en: "Miguel Torga", note: "regionalist author and poet" },
                { pt: "Vergílio Ferreira", en: "Vergílio Ferreira", note: "existentialist novelist" },
                { pt: "Lídia Jorge", en: "Lídia Jorge", note: "contemporary female novelist" },
                { pt: "António Lobo Antunes", en: "António Lobo Antunes", note: "post-colonial novelist" },
                { pt: "Mia Couto", en: "Mia Couto", note: "Mozambican-Portuguese author" },
                { pt: "realismo mágico", en: "magical realism", note: "literary style in Portuguese literature" }
              ],
              keyPoints: [
                "Fernando Pessoa is considered one of Europe's greatest modernist poets",
                "Portuguese literature reflects colonial and post-colonial experiences",
                "Contemporary Portuguese literature is internationally recognized",
                "Many authors write about Portuguese identity and emigration"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Classical literature flashcards
          { id: "e1", type: "flashcard", term: "Os Lusíadas", translation: "Portugal's national epic by Camões" },
          { id: "e2", type: "flashcard", term: "Camões", translation: "Portugal's greatest poet" },
          { id: "e3", type: "flashcard", term: "Gil Vicente", translation: "founder of Portuguese theater" },
          { id: "e4", type: "flashcard", term: "Eça de Queirós", translation: "realist novelist" },
          
          // Practice: Classical literature (MCQ)
          { id: "e5", type: "mcq", prompt: "Who wrote 'Os Lusíadas'?", options: ["Pessoa", "Camões", "Saramago"], correct: "Camões" },
          { id: "e6", type: "mcq", prompt: "What is 'Os Lusíadas' about?", options: ["love story", "Portuguese discoveries", "war"], correct: "Portuguese discoveries" },
          { id: "e7", type: "mcq", prompt: "Who founded Portuguese theater?", options: ["Gil Vicente", "Camões", "Garrett"], correct: "Gil Vicente" },
          
          // Practice: Classical authors matching
          { id: "e8", type: "matching", pairs: [
            { a: "Almeida Garrett", b: "romantic poet" },
            { a: "Alexandre Herculano", b: "historian novelist" },
            { a: "Antero de Quental", b: "philosophical poet" },
            { a: "Cesário Verde", b: "urban realist poet" }
          ]},
          
          // Presentation: Modern literature flashcards
          { id: "e9", type: "flashcard", term: "Fernando Pessoa", translation: "modernist poet with heteronyms" },
          { id: "e10", type: "flashcard", term: "José Saramago", translation: "Nobel Prize winning author" },
          { id: "e11", type: "flashcard", term: "heterónimo", translation: "Pessoa's distinct poetic personalities" },
          
          // Practice: Modern literature (MCQ)
          { id: "e12", type: "mcq", prompt: "Who won the Nobel Prize for Literature?", options: ["Pessoa", "Saramago", "Sophia"], correct: "Saramago" },
          { id: "e13", type: "mcq", prompt: "What are Pessoa's heteronyms?", options: ["pen names", "distinct personalities", "book titles"], correct: "distinct personalities" },
          
          // Practice: Modern authors matching
          { id: "e14", type: "matching", pairs: [
            { a: "Sophia de Mello Breyner", b: "important female poet" },
            { a: "Miguel Torga", b: "regionalist author" },
            { a: "Lídia Jorge", b: "contemporary novelist" },
            { a: "António Lobo Antunes", b: "post-colonial novelist" }
          ]},
          
          // Production: Literature appreciation (typing)
          { id: "e15", type: "typing", prompt: "Say: 'I like Portuguese literature.'", correct: "Gosto da literatura portuguesa." },
          { id: "e16", type: "typing", prompt: "Say: 'Camões is a great poet.'", correct: "Camões é um grande poeta." },
          { id: "e17", type: "typing", prompt: "Say: 'Pessoa wrote beautiful poetry.'", correct: "Pessoa escreveu poesia bonita." },
          { id: "e18", type: "typing", prompt: "Ask: 'Have you read Saramago?'", correct: "Já leste Saramago?" },
        ],
      },
      {
        id: "cultural3el2",
        title: "Portuguese Arts and Cultural Expressions",
        xp: 55,
        content: {
          title: "Portuguese Arts and Creative Culture",
          sections: [
            {
              title: "Traditional Portuguese Arts",
              explanation: "Traditional art forms that define Portuguese cultural expression:",
              examples: [
                { pt: "fado", en: "fado", note: "traditional Portuguese song expressing saudade" },
                { pt: "fadista", en: "fado singer", note: "person who performs fado music" },
                { pt: "guitarrista", en: "guitarist", note: "Portuguese guitar player" },
                { pt: "azulejo", en: "azulejo", note: "decorative ceramic tile art" },
                { pt: "filigrana", en: "filigree", note: "delicate metalwork jewelry" },
                { pt: "bordado", en: "embroidery", note: "traditional needlework" },
                { pt: "cerâmica", en: "ceramics", note: "pottery and ceramic arts" },
                { pt: "talha dourada", en: "gilded woodwork", note: "ornate church decoration" },
                { pt: "artesanato", en: "handicrafts", note: "traditional crafts" },
                { pt: "folclore", en: "folklore", note: "traditional cultural expressions" }
              ],
              keyPoints: [
                "Fado is UNESCO Intangible Cultural Heritage",
                "Azulejos are uniquely Portuguese art form",
                "Traditional crafts are still practiced today",
                "Regional variations exist in traditional arts"
              ]
            },
            {
              title: "Contemporary Portuguese Arts",
              explanation: "Modern Portuguese artistic movements and cultural expressions:",
              examples: [
                { pt: "cinema português", en: "Portuguese cinema", note: "growing international recognition" },
                { pt: "arte contemporânea", en: "contemporary art", note: "modern artistic expression" },
                { pt: "música popular", en: "popular music", note: "modern Portuguese music" },
                { pt: "teatro contemporâneo", en: "contemporary theater", note: "modern stage performances" },
                { pt: "dança", en: "dance", note: "traditional and modern dance" },
                { pt: "festival", en: "festival", note: "cultural celebration events" },
                { pt: "museu", en: "museum", note: "cultural institution" },
                { pt: "galeria", en: "gallery", note: "art exhibition space" },
                { pt: "exposição", en: "exhibition", note: "art display" },
                { pt: "cultura urbana", en: "urban culture", note: "modern city culture" }
              ],
              keyPoints: [
                "Portuguese cinema is gaining international attention",
                "Modern Portuguese artists work in all media",
                "Cultural festivals celebrate both traditional and modern arts",
                "Urban culture blends traditional and contemporary elements"
              ]
            },
            {
              title: "Portuguese Cultural Institutions",
              explanation: "Important institutions that preserve and promote Portuguese culture:",
              examples: [
                { pt: "Casa da Guitarra", en: "Guitar House", note: "fado and Portuguese guitar center" },
                { pt: "Museu Nacional de Arte Antiga", en: "National Museum of Ancient Art", note: "Portugal's premier art museum" },
                { pt: "Gulbenkian", en: "Gulbenkian", note: "major cultural foundation" },
                { pt: "Casa da Música", en: "Music House", note: "Porto's concert hall" },
                { pt: "Centro Cultural de Belém", en: "Belém Cultural Center", note: "Lisbon's cultural complex" },
                { pt: "Cinemateca", en: "Film Archive", note: "Portuguese cinema preservation" },
                { pt: "Instituto Camões", en: "Camões Institute", note: "promotes Portuguese language and culture" },
                { pt: "Conservatório", en: "Conservatory", note: "music education institution" },
                { pt: "Academia", en: "Academy", note: "artistic education institution" },
                { pt: "fundação", en: "foundation", note: "cultural support organization" }
              ],
              keyPoints: [
                "Cultural institutions receive both public and private support",
                "Many institutions promote Portuguese culture internationally",
                "Education and preservation are key missions",
                "Modern institutions blend tradition with innovation"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Traditional arts flashcards
          { id: "e1", type: "flashcard", term: "fado", translation: "traditional Portuguese song" },
          { id: "e2", type: "flashcard", term: "fadista", translation: "fado singer" },
          { id: "e3", type: "flashcard", term: "azulejo", translation: "decorative ceramic tiles" },
          { id: "e4", type: "flashcard", term: "filigrana", translation: "delicate metalwork" },
          { id: "e5", type: "flashcard", term: "artesanato", translation: "traditional handicrafts" },
          
          // Practice: Traditional arts (MCQ)
          { id: "e6", type: "mcq", prompt: "What is fado?", options: ["dance", "traditional song", "food"], correct: "traditional song" },
          { id: "e7", type: "mcq", prompt: "What emotion does fado express?", options: ["joy", "saudade", "anger"], correct: "saudade" },
          { id: "e8", type: "mcq", prompt: "What are azulejos?", options: ["songs", "ceramic tiles", "dances"], correct: "ceramic tiles" },
          
          // Practice: Traditional arts matching
          { id: "e9", type: "matching", pairs: [
            { a: "guitarrista", b: "Portuguese guitar player" },
            { a: "bordado", b: "embroidery" },
            { a: "cerâmica", b: "ceramics" },
            { a: "folclore", b: "folklore" }
          ]},
          
          // Practice: Contemporary arts (MCQ)
          { id: "e10", type: "mcq", prompt: "What is gaining international recognition?", options: ["Portuguese cinema", "Portuguese opera", "Portuguese ballet"], correct: "Portuguese cinema" },
          { id: "e11", type: "mcq", prompt: "Where do you see art exhibitions?", options: ["cinema", "galeria", "restaurant"], correct: "galeria" },
          
          // Practice: Contemporary arts matching
          { id: "e12", type: "matching", pairs: [
            { a: "arte contemporânea", b: "contemporary art" },
            { a: "teatro contemporâneo", b: "contemporary theater" },
            { a: "cultura urbana", b: "urban culture" },
            { a: "exposição", b: "exhibition" }
          ]},
          
          // Presentation: Cultural institutions flashcards
          { id: "e13", type: "flashcard", term: "Gulbenkian", translation: "major cultural foundation" },
          { id: "e14", type: "flashcard", term: "Casa da Música", translation: "Porto's concert hall" },
          { id: "e15", type: "flashcard", term: "Instituto Camões", translation: "promotes Portuguese culture" },
          
          // Practice: Cultural institutions (MCQ)
          { id: "e16", type: "mcq", prompt: "What promotes Portuguese culture internationally?", options: ["Instituto Camões", "Casa da Guitarra", "Cinemateca"], correct: "Instituto Camões" },
          { id: "e17", type: "mcq", prompt: "Where is Casa da Música?", options: ["Lisbon", "Porto", "Coimbra"], correct: "Porto" },
          
          // Practice: Institutions matching
          { id: "e18", type: "matching", pairs: [
            { a: "Museu Nacional de Arte Antiga", b: "premier art museum" },
            { a: "Centro Cultural de Belém", b: "Lisbon cultural complex" },
            { a: "Cinemateca", b: "film archive" },
            { a: "Conservatório", b: "music education" }
          ]},
          
          // Production: Arts appreciation (typing)
          { id: "e19", type: "typing", prompt: "Say: 'I love Portuguese fado.'", correct: "Adoro o fado português." },
          { id: "e20", type: "typing", prompt: "Say: 'Portuguese art is beautiful.'", correct: "A arte portuguesa é bonita." },
          { id: "e21", type: "typing", prompt: "Say: 'I want to visit the museum.'", correct: "Quero visitar o museu." },
          { id: "e22", type: "typing", prompt: "Ask: 'Do you like contemporary art?'", correct: "Gostas de arte contemporânea?" },
          
          // Production: Cultural engagement (typing)
          { id: "e23", type: "typing", prompt: "Say: 'Portuguese culture is very rich.'", correct: "A cultura portuguesa é muito rica." },
          { id: "e24", type: "typing", prompt: "Say: 'I want to learn fado.'", correct: "Quero aprender fado." },
          { id: "e25", type: "typing", prompt: "Say: 'The exhibition is interesting.'", correct: "A exposição é interessante." },
        ],
      },
    ],
  },
  
  // PHASE D: EXPERT ENHANCED MODULES (Advanced A1+ Content)
  {
    id: "expert1enhanced",
    title: "🏢 Professional Portuguese (Enhanced PPP)",
    description: "Master professional Portuguese for workplace communication, business interactions, and career development.",
    lessons: [
      {
        id: "expert1el1",
        title: "Portuguese Workplace Communication",
        xp: 60,
        content: {
          title: "Professional Portuguese Communication",
          sections: [
            {
              title: "Workplace Vocabulary and Roles",
              explanation: "Essential vocabulary for professional environments and workplace roles:",
              examples: [
                { pt: "escritório", en: "office", note: "o escritório - workplace environment" },
                { pt: "empresa", en: "company", note: "a empresa - business organization" },
                { pt: "chefe", en: "boss", note: "o/a chefe - manager or supervisor" },
                { pt: "colega", en: "colleague", note: "o/a colega - work partner" },
                { pt: "reunião", en: "meeting", note: "a reunião - business gathering" },
                { pt: "projeto", en: "project", note: "o projeto - work assignment" },
                { pt: "relatório", en: "report", note: "o relatório - business document" },
                { pt: "prazo", en: "deadline", note: "o prazo - time limit" },
                { pt: "cliente", en: "client", note: "o/a cliente - customer" },
                { pt: "contrato", en: "contract", note: "o contrato - business agreement" },
                { pt: "salário", en: "salary", note: "o salário - wages" },
                { pt: "promoção", en: "promotion", note: "a promoção - career advancement" },
                { pt: "formação", en: "training", note: "a formação - professional development" },
                { pt: "experiência", en: "experience", note: "a experiência - work background" },
                { pt: "candidatura", en: "application", note: "a candidatura - job application" }
              ],
              keyPoints: [
                "Portuguese workplace culture values formality initially",
                "Hierarchy and respect are important in business settings",
                "Professional relationships often become personal over time",
                "Portuguese business hours typically include long lunch breaks"
              ]
            },
            {
              title: "Professional Communication Phrases",
              explanation: "Essential phrases for professional communication and business interactions:",
              examples: [
                { pt: "Bom dia, como está?", en: "Good morning, how are you?", note: "formal professional greeting" },
                { pt: "Gostaria de marcar uma reunião", en: "I would like to schedule a meeting", note: "meeting request" },
                { pt: "Pode enviar-me o relatório?", en: "Can you send me the report?", note: "polite request" },
                { pt: "Qual é o prazo para este projeto?", en: "What's the deadline for this project?", note: "timeline inquiry" },
                { pt: "Preciso de mais informações", en: "I need more information", note: "requesting details" },
                { pt: "Vou verificar e informo", en: "I'll check and let you know", note: "professional response" },
                { pt: "Está tudo em ordem", en: "Everything is in order", note: "confirmation phrase" },
                { pt: "Obrigado pela sua colaboração", en: "Thank you for your collaboration", note: "professional gratitude" },
                { pt: "Com os melhores cumprimentos", en: "Best regards", note: "formal closing" },
                { pt: "Aguardo a sua resposta", en: "I await your response", note: "formal request for reply" }
              ],
              keyPoints: [
                "Always use formal address (você/o senhor/a senhora) initially",
                "Written communication tends to be more formal than spoken",
                "Politeness formulas are essential in all professional interactions",
                "Portuguese professionals appreciate clear, direct communication"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Workplace vocabulary flashcards
          { id: "e1", type: "flashcard", term: "escritório", translation: "office" },
          { id: "e2", type: "flashcard", term: "empresa", translation: "company" },
          { id: "e3", type: "flashcard", term: "reunião", translation: "meeting" },
          { id: "e4", type: "flashcard", term: "projeto", translation: "project" },
          { id: "e5", type: "flashcard", term: "prazo", translation: "deadline" },
          
          // Practice: Workplace scenarios (MCQ)
          { id: "e6", type: "mcq", prompt: "Who is your 'chefe'?", options: ["colleague", "boss", "client"], correct: "boss" },
          { id: "e7", type: "mcq", prompt: "What is a 'relatório'?", options: ["meeting", "report", "salary"], correct: "report" },
          { id: "e8", type: "mcq", prompt: "What does 'prazo' mean?", options: ["price", "place", "deadline"], correct: "deadline" },
          
          // Practice: Professional roles matching
          { id: "e9", type: "matching", pairs: [
            { a: "colega", b: "colleague" },
            { a: "cliente", b: "client" },
            { a: "contrato", b: "contract" },
            { a: "salário", b: "salary" }
          ]},
          
          // Practice: Professional terms (MCQ)
          { id: "e10", type: "mcq", prompt: "What is 'formação'?", options: ["formation", "training", "information"], correct: "training" },
          { id: "e11", type: "mcq", prompt: "What is 'candidatura'?", options: ["candidate", "application", "camera"], correct: "application" },
          
          // Presentation: Professional phrases flashcards
          { id: "e12", type: "flashcard", term: "Gostaria de marcar uma reunião", translation: "I would like to schedule a meeting" },
          { id: "e13", type: "flashcard", term: "Pode enviar-me o relatório?", translation: "Can you send me the report?" },
          { id: "e14", type: "flashcard", term: "Qual é o prazo?", translation: "What's the deadline?" },
          
          // Production: Professional communication (typing)
          { id: "e15", type: "typing", prompt: "Say: 'Good morning, how are you?' (formal)", correct: "Bom dia, como está?" },
          { id: "e16", type: "typing", prompt: "Say: 'I need more information.'", correct: "Preciso de mais informações." },
          { id: "e17", type: "typing", prompt: "Say: 'Thank you for your collaboration.'", correct: "Obrigado pela sua colaboração." },
          { id: "e18", type: "typing", prompt: "Ask: 'Can you send me the report?'", correct: "Pode enviar-me o relatório?" },
          { id: "e19", type: "typing", prompt: "Say: 'I'll check and let you know.'", correct: "Vou verificar e informo." },
          
          // Production: Professional scenarios (typing)
          { id: "e20", type: "typing", prompt: "Say: 'I work in an office.'", correct: "Trabalho num escritório." },
          { id: "e21", type: "typing", prompt: "Say: 'The meeting is tomorrow.'", correct: "A reunião é amanhã." },
          { id: "e22", type: "typing", prompt: "Ask: 'What time is the meeting?'", correct: "A que horas é a reunião?" },
        ],
      },
      {
        id: "expert1el2",
        title: "Portuguese Business and Career Development",
        xp: 65,
        content: {
          title: "Portuguese Business Culture and Career Advancement",
          sections: [
            {
              title: "Business Meeting Culture",
              explanation: "Understanding Portuguese business meeting culture and professional etiquette:",
              examples: [
                { pt: "ordem de trabalhos", en: "agenda", note: "meeting agenda structure" },
                { pt: "ata da reunião", en: "meeting minutes", note: "official record" },
                { pt: "apresentação", en: "presentation", note: "business pitch or report" },
                { pt: "proposta", en: "proposal", note: "business suggestion" },
                { pt: "decisão", en: "decision", note: "business choice" },
                { pt: "orçamento", en: "budget", note: "financial plan" },
                { pt: "investimento", en: "investment", note: "financial commitment" },
                { pt: "lucro", en: "profit", note: "business earnings" },
                { pt: "crescimento", en: "growth", note: "business expansion" },
                { pt: "estratégia", en: "strategy", note: "business plan" },
                { pt: "concorrência", en: "competition", note: "business rivals" },
                { pt: "mercado", en: "market", note: "business environment" },
                { pt: "produto", en: "product", note: "business offering" },
                { pt: "serviço", en: "service", note: "business service" },
                { pt: "qualidade", en: "quality", note: "standard of excellence" }
              ],
              keyPoints: [
                "Portuguese meetings often start with social conversation",
                "Hierarchy influences speaking order and decision-making",
                "Building relationships is crucial for business success",
                "Portuguese business culture values consensus-building"
              ]
            },
            {
              title: "Career Development and Professional Growth",
              explanation: "Vocabulary and concepts for career advancement in Portuguese-speaking environments:",
              examples: [
                { pt: "currículo", en: "CV/resume", note: "professional summary document" },
                { pt: "entrevista", en: "interview", note: "job interview process" },
                { pt: "competências", en: "skills", note: "professional abilities" },
                { pt: "qualificações", en: "qualifications", note: "credentials" },
                { pt: "objectivos", en: "objectives", note: "career goals" },
                { pt: "desenvolvimento profissional", en: "professional development", note: "career advancement" },
                { pt: "networking", en: "networking", note: "professional connections" },
                { pt: "mentoria", en: "mentoring", note: "professional guidance" },
                { pt: "liderança", en: "leadership", note: "management skills" },
                { pt: "inovação", en: "innovation", note: "creative solutions" },
                { pt: "produtividade", en: "productivity", note: "work efficiency" },
                { pt: "flexibilidade", en: "flexibility", note: "adaptability" },
                { pt: "responsabilidade", en: "responsibility", note: "accountability" },
                { pt: "iniciativa", en: "initiative", note: "proactive approach" },
                { pt: "resultados", en: "results", note: "outcomes and achievements" }
              ],
              keyPoints: [
                "Portuguese employers value both technical and soft skills",
                "Continuous learning is highly regarded in Portuguese business culture",
                "Professional relationships often extend beyond work hours",
                "Language skills are particularly valued in international companies"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Business meeting vocabulary flashcards
          { id: "e1", type: "flashcard", term: "ordem de trabalhos", translation: "agenda" },
          { id: "e2", type: "flashcard", term: "apresentação", translation: "presentation" },
          { id: "e3", type: "flashcard", term: "proposta", translation: "proposal" },
          { id: "e4", type: "flashcard", term: "orçamento", translation: "budget" },
          { id: "e5", type: "flashcard", term: "estratégia", translation: "strategy" },
          
          // Practice: Business terms (MCQ)
          { id: "e6", type: "mcq", prompt: "What are 'ata da reunião'?", options: ["meeting agenda", "meeting minutes", "meeting room"], correct: "meeting minutes" },
          { id: "e7", type: "mcq", prompt: "What is 'concorrência'?", options: ["conference", "competition", "cooperation"], correct: "competition" },
          { id: "e8", type: "mcq", prompt: "What does 'lucro' mean?", options: ["luck", "profit", "logic"], correct: "profit" },
          
          // Practice: Business concepts matching
          { id: "e9", type: "matching", pairs: [
            { a: "investimento", b: "investment" },
            { a: "crescimento", b: "growth" },
            { a: "mercado", b: "market" },
            { a: "qualidade", b: "quality" }
          ]},
          
          // Presentation: Career development flashcards
          { id: "e10", type: "flashcard", term: "currículo", translation: "CV/resume" },
          { id: "e11", type: "flashcard", term: "entrevista", translation: "interview" },
          { id: "e12", type: "flashcard", term: "competências", translation: "skills" },
          { id: "e13", type: "flashcard", term: "liderança", translation: "leadership" },
          
          // Practice: Career development (MCQ)
          { id: "e14", type: "mcq", prompt: "What are 'competências'?", options: ["competitions", "skills", "computers"], correct: "skills" },
          { id: "e15", type: "mcq", prompt: "What is 'desenvolvimento profissional'?", options: ["professional development", "professional deployment", "professional depression"], correct: "professional development" },
          
          // Practice: Professional qualities matching
          { id: "e16", type: "matching", pairs: [
            { a: "inovação", b: "innovation" },
            { a: "produtividade", b: "productivity" },
            { a: "flexibilidade", b: "flexibility" },
            { a: "responsabilidade", b: "responsibility" }
          ]},
          
          // Production: Business communication (typing)
          { id: "e17", type: "typing", prompt: "Say: 'I have a presentation tomorrow.'", correct: "Tenho uma apresentação amanhã." },
          { id: "e18", type: "typing", prompt: "Say: 'What's the budget for this project?'", correct: "Qual é o orçamento para este projeto?" },
          { id: "e19", type: "typing", prompt: "Say: 'I need to send my CV.'", correct: "Preciso de enviar o meu currículo." },
          { id: "e20", type: "typing", prompt: "Ask: 'When is the interview?'", correct: "Quando é a entrevista?" },
          
          // Production: Professional goals (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I want to develop my skills.'", correct: "Quero desenvolver as minhas competências." },
          { id: "e22", type: "typing", prompt: "Say: 'Leadership is important.'", correct: "A liderança é importante." },
          { id: "e23", type: "typing", prompt: "Say: 'I'm looking for professional development.'", correct: "Estou à procura de desenvolvimento profissional." },
        ],
      },
    ],
  },
  {
    id: "expert2enhanced",
    title: "🌍 Portuguese Travel & Tourism (Enhanced PPP)",
    description: "Master advanced travel Portuguese for tourism, exploration, and cultural experiences throughout Portugal and Portuguese-speaking countries.",
    lessons: [
      {
        id: "expert2el1",
        title: "Advanced Portuguese Travel Planning",
        xp: 60,
        content: {
          title: "Portuguese Tourism and Travel Planning",
          sections: [
            {
              title: "Advanced Travel Vocabulary",
              explanation: "Comprehensive travel vocabulary for sophisticated travel planning and experiences:",
              examples: [
                { pt: "itinerário", en: "itinerary", note: "travel plan and schedule" },
                { pt: "reserva", en: "reservation", note: "booking confirmation" },
                { pt: "alojamento", en: "accommodation", note: "lodging options" },
                { pt: "pousada", en: "pousada", note: "Portuguese historic hotel" },
                { pt: "quinta", en: "quinta", note: "estate/wine farm accommodation" },
                { pt: "turismo rural", en: "rural tourism", note: "countryside tourism" },
                { pt: "património", en: "heritage", note: "cultural heritage sites" },
                { pt: "museu", en: "museum", note: "cultural institution" },
                { pt: "excursão", en: "excursion", note: "guided tour" },
                { pt: "guia turístico", en: "tour guide", note: "professional guide" },
                { pt: "roteiro", en: "route/guidebook", note: "travel route or guide" },
                { pt: "paisagem", en: "landscape", note: "scenic view" },
                { pt: "miradouro", en: "viewpoint", note: "scenic overlook" },
                { pt: "artesanato local", en: "local handicrafts", note: "regional crafts" },
                { pt: "gastronomia regional", en: "regional cuisine", note: "local food specialties" }
              ],
              keyPoints: [
                "Portugal offers diverse tourism experiences from coast to countryside",
                "Pousadas are unique Portuguese luxury accommodations in historic buildings",
                "Each region has distinct tourism offerings and specialties",
                "Portuguese tourism emphasizes cultural heritage and natural beauty"
              ]
            },
            {
              title: "Portuguese Tourism Regions and Attractions",
              explanation: "Understanding Portugal's diverse tourism regions and their unique attractions:",
              examples: [
                { pt: "Costa Vicentina", en: "Vicentine Coast", note: "pristine Atlantic coastline" },
                { pt: "Douro Vinhateiro", en: "Douro Wine Region", note: "terraced vineyard landscapes" },
                { pt: "Serra da Estrela", en: "Serra da Estrela", note: "highest mountain range" },
                { pt: "Ria de Aveiro", en: "Aveiro Lagoon", note: "coastal wetlands and canals" },
                { pt: "Parque Nacional", en: "National Park", note: "protected natural area" },
                { pt: "aldeia histórica", en: "historic village", note: "preserved medieval settlement" },
                { pt: "centro histórico", en: "historic center", note: "old town area" },
                { pt: "castelo medieval", en: "medieval castle", note: "historic fortress" },
                { pt: "mosteiro", en: "monastery", note: "religious architectural site" },
                { pt: "termas", en: "thermal baths", note: "natural hot springs" },
                { pt: "praia fluvial", en: "river beach", note: "inland swimming area" },
                { pt: "enoturismo", en: "wine tourism", note: "wine-focused travel" },
                { pt: "turismo de natureza", en: "nature tourism", note: "outdoor/eco tourism" },
                { pt: "caminhada", en: "hiking", note: "walking/trekking activity" },
                { pt: "observação de aves", en: "birdwatching", note: "ornithological tourism" }
              ],
              keyPoints: [
                "Portugal's compact size allows visiting multiple regions easily",
                "Each region offers unique natural and cultural attractions",
                "Sustainable tourism is increasingly important in Portugal",
                "Many tourism activities combine culture, nature, and gastronomy"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Advanced travel vocabulary flashcards
          { id: "e1", type: "flashcard", term: "itinerário", translation: "itinerary" },
          { id: "e2", type: "flashcard", term: "alojamento", translation: "accommodation" },
          { id: "e3", type: "flashcard", term: "pousada", translation: "Portuguese historic hotel" },
          { id: "e4", type: "flashcard", term: "turismo rural", translation: "rural tourism" },
          { id: "e5", type: "flashcard", term: "património", translation: "heritage" },
          
          // Practice: Travel planning (MCQ)
          { id: "e6", type: "mcq", prompt: "What is a 'pousada'?", options: ["restaurant", "historic hotel", "museum"], correct: "historic hotel" },
          { id: "e7", type: "mcq", prompt: "What is 'turismo rural'?", options: ["city tourism", "rural tourism", "beach tourism"], correct: "rural tourism" },
          { id: "e8", type: "mcq", prompt: "What is a 'miradouro'?", options: ["mirror", "viewpoint", "market"], correct: "viewpoint" },
          
          // Practice: Travel terms matching
          { id: "e9", type: "matching", pairs: [
            { a: "excursão", b: "excursion" },
            { a: "guia turístico", b: "tour guide" },
            { a: "roteiro", b: "route/guidebook" },
            { a: "paisagem", b: "landscape" }
          ]},
          
          // Presentation: Tourism regions flashcards
          { id: "e10", type: "flashcard", term: "Costa Vicentina", translation: "Vicentine Coast" },
          { id: "e11", type: "flashcard", term: "Douro Vinhateiro", translation: "Douro Wine Region" },
          { id: "e12", type: "flashcard", term: "Serra da Estrela", translation: "highest mountain range" },
          
          // Practice: Tourism regions (MCQ)
          { id: "e13", type: "mcq", prompt: "What is the Douro known for?", options: ["beaches", "wine", "mountains"], correct: "wine" },
          { id: "e14", type: "mcq", prompt: "What is 'enoturismo'?", options: ["eco tourism", "wine tourism", "cultural tourism"], correct: "wine tourism" },
          
          // Practice: Tourism activities matching
          { id: "e15", type: "matching", pairs: [
            { a: "aldeia histórica", b: "historic village" },
            { a: "termas", b: "thermal baths" },
            { a: "caminhada", b: "hiking" },
            { a: "observação de aves", b: "birdwatching" }
          ]},
          
          // Production: Travel planning (typing)
          { id: "e16", type: "typing", prompt: "Say: 'I want to make a reservation.'", correct: "Quero fazer uma reserva." },
          { id: "e17", type: "typing", prompt: "Say: 'Where is the tour guide?'", correct: "Onde está o guia turístico?" },
          { id: "e18", type: "typing", prompt: "Ask: 'Do you have tourist information?'", correct: "Têm informação turística?" },
          { id: "e19", type: "typing", prompt: "Say: 'I like the landscape.'", correct: "Gosto da paisagem." },
          
          // Production: Tourism interests (typing)
          { id: "e20", type: "typing", prompt: "Say: 'I'm interested in wine tourism.'", correct: "Estou interessado em enoturismo." },
          { id: "e21", type: "typing", prompt: "Say: 'I want to visit historic villages.'", correct: "Quero visitar aldeias históricas." },
          { id: "e22", type: "typing", prompt: "Ask: 'Is there hiking here?'", correct: "Há caminhadas aqui?" },
        ],
      },
      {
        id: "expert2el2",
        title: "Portuguese Cultural Tourism and Experiences",
        xp: 65,
        content: {
          title: "Portuguese Cultural Tourism and Authentic Experiences",
          sections: [
            {
              title: "Cultural Tourism Experiences",
              explanation: "Engaging with Portuguese culture through authentic tourism experiences:",
              examples: [
                { pt: "experiência autêntica", en: "authentic experience", note: "genuine cultural immersion" },
                { pt: "tradições locais", en: "local traditions", note: "regional customs" },
                { pt: "festival tradicional", en: "traditional festival", note: "cultural celebration" },
                { pt: "artesão", en: "craftsperson", note: "traditional artisan" },
                { pt: "oficina de artesanato", en: "craft workshop", note: "hands-on cultural activity" },
                { pt: "degustação", en: "tasting", note: "food or wine sampling" },
                { pt: "vindimas", en: "grape harvest", note: "traditional wine harvest" },
                { pt: "casa do fado", en: "fado house", note: "traditional music venue" },
                { pt: "tasca tradicional", en: "traditional tavern", note: "authentic local restaurant" },
                { pt: "mercado local", en: "local market", note: "regional marketplace" },
                { pt: "romaria", en: "pilgrimage/festival", note: "religious cultural event" },
                { pt: "procissão", en: "procession", note: "religious parade" },
                { pt: "folclore regional", en: "regional folklore", note: "traditional cultural expressions" },
                { pt: "etnografia", en: "ethnography", note: "cultural heritage study" },
                { pt: "museu etnológico", en: "ethnological museum", note: "cultural heritage museum" }
              ],
              keyPoints: [
                "Portuguese cultural tourism emphasizes authentic experiences",
                "Many festivals occur throughout the year in different regions",
                "Participating in local traditions creates memorable experiences",
                "Portuguese people are generally welcoming to cultural visitors"
              ]
            },
            {
              title: "Portuguese Gastronomy Tourism",
              explanation: "Exploring Portugal through its rich culinary traditions and regional specialties:",
              examples: [
                { pt: "gastronomia regional", en: "regional gastronomy", note: "local cuisine specialties" },
                { pt: "especialidade da casa", en: "house specialty", note: "restaurant's signature dish" },
                { pt: "produto regional", en: "regional product", note: "local specialty item" },
                { pt: "queijo da serra", en: "serra cheese", note: "mountain cheese specialty" },
                { pt: "enchidos tradicionais", en: "traditional sausages", note: "regional cured meats" },
                { pt: "doçaria conventual", en: "convent sweets", note: "traditional monastery desserts" },
                { pt: "vinho verde", en: "vinho verde", note: "light Portuguese wine" },
                { pt: "aguardente", en: "aguardente", note: "traditional Portuguese spirit" },
                { pt: "taberna", en: "tavern", note: "traditional Portuguese restaurant" },
                { pt: "petisco", en: "petisco", note: "Portuguese tapas-style snack" },
                { pt: "mariscada", en: "seafood feast", note: "shellfish platter" },
                { pt: "francesinha", en: "francesinha", note: "Porto's famous sandwich" },
                { pt: "cataplana", en: "cataplana", note: "traditional seafood dish/pan" },
                { pt: "cozido à portuguesa", en: "Portuguese stew", note: "traditional meat and vegetable stew" },
                { pt: "rota dos vinhos", en: "wine route", note: "wine tourism trail" }
              ],
              keyPoints: [
                "Each Portuguese region has distinct culinary traditions",
                "Portuguese cuisine varies significantly from north to south",
                "Seafood is central to Portuguese gastronomy",
                "Many traditional dishes have historical and cultural significance"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Cultural tourism flashcards
          { id: "e1", type: "flashcard", term: "experiência autêntica", translation: "authentic experience" },
          { id: "e2", type: "flashcard", term: "tradições locais", translation: "local traditions" },
          { id: "e3", type: "flashcard", term: "festival tradicional", translation: "traditional festival" },
          { id: "e4", type: "flashcard", term: "oficina de artesanato", translation: "craft workshop" },
          { id: "e5", type: "flashcard", term: "casa do fado", translation: "fado house" },
          
          // Practice: Cultural experiences (MCQ)
          { id: "e6", type: "mcq", prompt: "What is an 'artesão'?", options: ["artist", "craftsperson", "actor"], correct: "craftsperson" },
          { id: "e7", type: "mcq", prompt: "What are 'vindimas'?", options: ["vineyards", "grape harvest", "wine bottles"], correct: "grape harvest" },
          { id: "e8", type: "mcq", prompt: "What is a 'tasca tradicional'?", options: ["traditional dance", "traditional tavern", "traditional task"], correct: "traditional tavern" },
          
          // Practice: Cultural terms matching
          { id: "e9", type: "matching", pairs: [
            { a: "degustação", b: "tasting" },
            { a: "romaria", b: "pilgrimage/festival" },
            { a: "folclore regional", b: "regional folklore" },
            { a: "museu etnológico", b: "ethnological museum" }
          ]},
          
          // Presentation: Gastronomy tourism flashcards
          { id: "e10", type: "flashcard", term: "gastronomia regional", translation: "regional gastronomy" },
          { id: "e11", type: "flashcard", term: "especialidade da casa", translation: "house specialty" },
          { id: "e12", type: "flashcard", term: "queijo da serra", translation: "serra cheese" },
          { id: "e13", type: "flashcard", term: "doçaria conventual", translation: "convent sweets" },
          
          // Practice: Portuguese cuisine (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'vinho verde'?", options: ["green wine", "light Portuguese wine", "expensive wine"], correct: "light Portuguese wine" },
          { id: "e15", type: "mcq", prompt: "What is a 'francesinha'?", options: ["French woman", "Porto sandwich", "French bread"], correct: "Porto sandwich" },
          { id: "e16", type: "mcq", prompt: "What is 'cataplana'?", options: ["catalonia", "seafood dish/pan", "cat planner"], correct: "seafood dish/pan" },
          
          // Practice: Food specialties matching
          { id: "e17", type: "matching", pairs: [
            { a: "petisco", b: "Portuguese tapas" },
            { a: "mariscada", b: "seafood feast" },
            { a: "cozido à portuguesa", b: "Portuguese stew" },
            { a: "rota dos vinhos", b: "wine route" }
          ]},
          
          // Production: Cultural tourism (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I want an authentic experience.'", correct: "Quero uma experiência autêntica." },
          { id: "e19", type: "typing", prompt: "Say: 'Where is the fado house?'", correct: "Onde é a casa do fado?" },
          { id: "e20", type: "typing", prompt: "Ask: 'Is there a craft workshop?'", correct: "Há uma oficina de artesanato?" },
          { id: "e21", type: "typing", prompt: "Say: 'I like local traditions.'", correct: "Gosto das tradições locais." },
          
          // Production: Gastronomy interests (typing)
          { id: "e22", type: "typing", prompt: "Say: 'What's the house specialty?'", correct: "Qual é a especialidade da casa?" },
          { id: "e23", type: "typing", prompt: "Say: 'I want to try regional products.'", correct: "Quero provar produtos regionais." },
          { id: "e24", type: "typing", prompt: "Ask: 'Do you have wine tasting?'", correct: "Têm degustação de vinhos?" },
        ],
      },
    ],
  },
  {
    id: "expert3enhanced",
    title: "🏠 Portuguese Real Estate & Living (Enhanced PPP)",
    description: "Master Portuguese for real estate, housing, and establishing life in Portugal with comprehensive legal and practical vocabulary.",
    lessons: [
      {
        id: "expert3el1",
        title: "Portuguese Housing and Real Estate",
        xp: 60,
        content: {
          title: "Portuguese Real Estate and Housing Market",
          sections: [
            {
              title: "Real Estate Vocabulary",
              explanation: "Essential vocabulary for navigating the Portuguese real estate market:",
              examples: [
                { pt: "imobiliária", en: "real estate agency", note: "property agency" },
                { pt: "mediador imobiliário", en: "real estate agent", note: "property broker" },
                { pt: "apartamento", en: "apartment", note: "flat/condo" },
                { pt: "moradia", en: "house", note: "standalone house" },
                { pt: "quinta", en: "estate/farm", note: "rural property" },
                { pt: "terreno", en: "land/plot", note: "buildable land" },
                { pt: "condomínio", en: "condominium", note: "shared ownership building" },
                { pt: "renda", en: "rent", note: "monthly payment" },
                { pt: "compra", en: "purchase", note: "buying property" },
                { pt: "venda", en: "sale", note: "selling property" },
                { pt: "contrato de arrendamento", en: "rental contract", note: "lease agreement" },
                { pt: "escritura", en: "deed", note: "property title document" },
                { pt: "hipoteca", en: "mortgage", note: "property loan" },
                { pt: "caução", en: "deposit", note: "security deposit" },
                { pt: "comissão", en: "commission", note: "agent fee" }
              ],
              keyPoints: [
                "Portuguese real estate market has specific legal requirements",
                "Foreign buyers can purchase property in Portugal",
                "Real estate transactions require notarization",
                "Property taxes and fees vary by region"
              ]
            },
            {
              title: "Property Features and Descriptions",
              explanation: "Vocabulary for describing property features and amenities:",
              examples: [
                { pt: "tipologia", en: "property type", note: "T1, T2, T3 classification system" },
                { pt: "área útil", en: "usable area", note: "interior living space" },
                { pt: "área bruta", en: "gross area", note: "total property area including walls" },
                { pt: "varanda", en: "balcony", note: "outdoor space" },
                { pt: "terraço", en: "terrace", note: "large outdoor area" },
                { pt: "garagem", en: "garage", note: "covered parking" },
                { pt: "arrecadação", en: "storage room", note: "utility storage" },
                { pt: "sótão", en: "attic", note: "top floor space" },
                { pt: "cave", en: "basement", note: "underground level" },
                { pt: "jardim", en: "garden", note: "outdoor green space" },
                { pt: "piscina", en: "swimming pool", note: "pool facility" },
                { pt: "aquecimento central", en: "central heating", note: "heating system" },
                { pt: "ar condicionado", en: "air conditioning", note: "cooling system" },
                { pt: "mobilado", en: "furnished", note: "includes furniture" },
                { pt: "sem mobília", en: "unfurnished", note: "empty property" }
              ],
              keyPoints: [
                "Portuguese property classification uses T1, T2, T3 system (bedrooms)",
                "Balconies and terraces add significant value",
                "Swimming pools are common in southern Portugal",
                "Energy efficiency ratings are required for all properties"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Real estate vocabulary flashcards
          { id: "e1", type: "flashcard", term: "imobiliária", translation: "real estate agency" },
          { id: "e2", type: "flashcard", term: "mediador imobiliário", translation: "real estate agent" },
          { id: "e3", type: "flashcard", term: "moradia", translation: "house" },
          { id: "e4", type: "flashcard", term: "contrato de arrendamento", translation: "rental contract" },
          { id: "e5", type: "flashcard", term: "hipoteca", translation: "mortgage" },
          
          // Practice: Real estate terms (MCQ)
          { id: "e6", type: "mcq", prompt: "What is a 'moradia'?", options: ["apartment", "house", "office"], correct: "house" },
          { id: "e7", type: "mcq", prompt: "What is 'renda'?", options: ["rent", "sale", "repair"], correct: "rent" },
          { id: "e8", type: "mcq", prompt: "What is 'caução'?", options: ["caution", "deposit", "commission"], correct: "deposit" },
          
          // Practice: Property transactions matching
          { id: "e9", type: "matching", pairs: [
            { a: "compra", b: "purchase" },
            { a: "venda", b: "sale" },
            { a: "escritura", b: "deed" },
            { a: "comissão", b: "commission" }
          ]},
          
          // Presentation: Property features flashcards
          { id: "e10", type: "flashcard", term: "tipologia", translation: "property type (T1, T2, T3)" },
          { id: "e11", type: "flashcard", term: "área útil", translation: "usable area" },
          { id: "e12", type: "flashcard", term: "varanda", translation: "balcony" },
          { id: "e13", type: "flashcard", term: "garagem", translation: "garage" },
          
          // Practice: Property features (MCQ)
          { id: "e14", type: "mcq", prompt: "What is a 'terraço'?", options: ["terrace", "territory", "terrible"], correct: "terrace" },
          { id: "e15", type: "mcq", prompt: "What is 'mobilado'?", options: ["mobile", "furnished", "moved"], correct: "furnished" },
          { id: "e16", type: "mcq", prompt: "What is 'aquecimento central'?", options: ["central heating", "central cooling", "central location"], correct: "central heating" },
          
          // Practice: Property spaces matching
          { id: "e17", type: "matching", pairs: [
            { a: "sótão", b: "attic" },
            { a: "cave", b: "basement" },
            { a: "jardim", b: "garden" },
            { a: "piscina", b: "swimming pool" }
          ]},
          
          // Production: Real estate inquiries (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I'm looking for an apartment.'", correct: "Estou à procura de um apartamento." },
          { id: "e19", type: "typing", prompt: "Say: 'How much is the rent?'", correct: "Quanto é a renda?" },
          { id: "e20", type: "typing", prompt: "Ask: 'Does it have a garage?'", correct: "Tem garagem?" },
          { id: "e21", type: "typing", prompt: "Say: 'I want to buy a house.'", correct: "Quero comprar uma moradia." },
          
          // Production: Property descriptions (typing)
          { id: "e22", type: "typing", prompt: "Say: 'The apartment has a balcony.'", correct: "O apartamento tem varanda." },
          { id: "e23", type: "typing", prompt: "Ask: 'Is it furnished?'", correct: "Está mobilado?" },
          { id: "e24", type: "typing", prompt: "Say: 'I need central heating.'", correct: "Preciso de aquecimento central." },
        ],
      },
      {
        id: "expert3el2",
        title: "Portuguese Legal and Administrative Living",
        xp: 65,
        content: {
          title: "Portuguese Legal Procedures and Administrative Life",
          sections: [
            {
              title: "Legal and Administrative Vocabulary",
              explanation: "Essential vocabulary for legal procedures and administrative tasks in Portugal:",
              examples: [
                { pt: "documentação", en: "documentation", note: "official papers" },
                { pt: "autorização de residência", en: "residence permit", note: "legal permission to live" },
                { pt: "número de contribuinte", en: "tax number", note: "Portuguese tax ID" },
                { pt: "segurança social", en: "social security", note: "welfare system" },
                { pt: "centro de saúde", en: "health center", note: "local medical facility" },
                { pt: "registo criminal", en: "criminal record", note: "background check document" },
                { pt: "certidão", en: "certificate", note: "official document" },
                { pt: "notário", en: "notary", note: "legal document official" },
                { pt: "advogado", en: "lawyer", note: "legal professional" },
                { pt: "tribunal", en: "court", note: "legal institution" },
                { pt: "finanças", en: "tax office", note: "revenue service" },
                { pt: "câmara municipal", en: "city hall", note: "municipal government" },
                { pt: "junta de freguesia", en: "parish council", note: "local government" },
                { pt: "conservatória", en: "registry office", note: "official records office" },
                { pt: "loja do cidadão", en: "citizen shop", note: "one-stop government services" }
              ],
              keyPoints: [
                "Portuguese bureaucracy requires specific procedures and documents",
                "Many services are available at Loja do Cidadão locations",
                "Tax number (NIF) is required for most official transactions",
                "Residence permits have different categories for different situations"
              ]
            },
            {
              title: "Banking and Financial Services",
              explanation: "Vocabulary for banking and financial services in Portugal:",
              examples: [
                { pt: "conta bancária", en: "bank account", note: "banking service" },
                { pt: "cartão de débito", en: "debit card", note: "bank card" },
                { pt: "cartão de crédito", en: "credit card", note: "credit payment card" },
                { pt: "transferência bancária", en: "bank transfer", note: "money transfer" },
                { pt: "depósito", en: "deposit", note: "money into account" },
                { pt: "levantamento", en: "withdrawal", note: "money from account" },
                { pt: "saldo", en: "balance", note: "account balance" },
                { pt: "extrato bancário", en: "bank statement", note: "account summary" },
                { pt: "empréstimo", en: "loan", note: "borrowed money" },
                { pt: "juros", en: "interest", note: "loan cost/deposit earning" },
                { pt: "garantia bancária", en: "bank guarantee", note: "financial security" },
                { pt: "multibanco", en: "ATM", note: "Portuguese ATM network" },
                { pt: "referência multibanco", en: "ATM reference", note: "payment reference code" },
                { pt: "domiciliação bancária", en: "direct debit", note: "automatic payment" },
                { pt: "descoberto", en: "overdraft", note: "negative balance" }
              ],
              keyPoints: [
                "Portuguese banks require extensive documentation for account opening",
                "Multibanco system is widely used for payments and services",
                "Bank guarantees are often required for rental agreements",
                "Portuguese banking offers comprehensive financial services"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Legal/administrative vocabulary flashcards
          { id: "e1", type: "flashcard", term: "autorização de residência", translation: "residence permit" },
          { id: "e2", type: "flashcard", term: "número de contribuinte", translation: "tax number" },
          { id: "e3", type: "flashcard", term: "segurança social", translation: "social security" },
          { id: "e4", type: "flashcard", term: "centro de saúde", translation: "health center" },
          { id: "e5", type: "flashcard", term: "loja do cidadão", translation: "citizen shop" },
          
          // Practice: Administrative terms (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'número de contribuinte'?", options: ["contributor number", "tax number", "phone number"], correct: "tax number" },
          { id: "e7", type: "mcq", prompt: "What is 'câmara municipal'?", options: ["municipal camera", "city hall", "municipal chamber"], correct: "city hall" },
          { id: "e8", type: "mcq", prompt: "What is a 'notário'?", options: ["notary", "notable", "notice"], correct: "notary" },
          
          // Practice: Legal services matching
          { id: "e9", type: "matching", pairs: [
            { a: "advogado", b: "lawyer" },
            { a: "tribunal", b: "court" },
            { a: "conservatória", b: "registry office" },
            { a: "junta de freguesia", b: "parish council" }
          ]},
          
          // Presentation: Banking vocabulary flashcards
          { id: "e10", type: "flashcard", term: "conta bancária", translation: "bank account" },
          { id: "e11", type: "flashcard", term: "cartão de débito", translation: "debit card" },
          { id: "e12", type: "flashcard", term: "transferência bancária", translation: "bank transfer" },
          { id: "e13", type: "flashcard", term: "multibanco", translation: "ATM (Portuguese network)" },
          
          // Practice: Banking terms (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'saldo'?", options: ["salary", "balance", "salt"], correct: "balance" },
          { id: "e15", type: "mcq", prompt: "What is 'levantamento'?", options: ["lifting", "withdrawal", "level"], correct: "withdrawal" },
          { id: "e16", type: "mcq", prompt: "What is 'domiciliação bancária'?", options: ["bank domicile", "direct debit", "bank domain"], correct: "direct debit" },
          
          // Practice: Banking services matching
          { id: "e17", type: "matching", pairs: [
            { a: "depósito", b: "deposit" },
            { a: "empréstimo", b: "loan" },
            { a: "extrato bancário", b: "bank statement" },
            { a: "garantia bancária", b: "bank guarantee" }
          ]},
          
          // Production: Administrative procedures (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I need a tax number.'", correct: "Preciso de um número de contribuinte." },
          { id: "e19", type: "typing", prompt: "Say: 'Where is the health center?'", correct: "Onde é o centro de saúde?" },
          { id: "e20", type: "typing", prompt: "Ask: 'Do I need documentation?'", correct: "Preciso de documentação?" },
          { id: "e21", type: "typing", prompt: "Say: 'I want to apply for residence permit.'", correct: "Quero pedir autorização de residência." },
          
          // Production: Banking services (typing)
          { id: "e22", type: "typing", prompt: "Say: 'I want to open a bank account.'", correct: "Quero abrir uma conta bancária." },
          { id: "e23", type: "typing", prompt: "Ask: 'What's my account balance?'", correct: "Qual é o meu saldo?" },
          { id: "e24", type: "typing", prompt: "Say: 'I need to make a bank transfer.'", correct: "Preciso de fazer uma transferência bancária." },
        ],
      },
    ],
  },
  {
    id: "expert4enhanced",
    title: "🚗 Portuguese Transportation & Mobility (Enhanced PPP)",
    description: "Master advanced Portuguese for transportation, mobility, and logistics across Portugal and Portuguese-speaking regions.",
    lessons: [
      {
        id: "expert4el1",
        title: "Portuguese Transportation Systems",
        xp: 60,
        content: {
          title: "Portuguese Transportation and Mobility",
          sections: [
            {
              title: "Advanced Transportation Vocabulary",
              explanation: "Comprehensive vocabulary for Portuguese transportation systems and mobility:",
              examples: [
                { pt: "transporte público", en: "public transport", note: "collective transportation system" },
                { pt: "bilhete único", en: "unified ticket", note: "integrated transport pass" },
                { pt: "cartão Navegante", en: "Navegante card", note: "Lisbon transport card" },
                { pt: "cartão Andante", en: "Andante card", note: "Porto transport card" },
                { pt: "horário", en: "schedule/timetable", note: "transport timing" },
                { pt: "correspondência", en: "connection/transfer", note: "changing transport" },
                { pt: "terminal", en: "terminal", note: "transport hub" },
                { pt: "estação", en: "station", note: "transport stop" },
                { pt: "paragem", en: "stop", note: "bus/tram stop" },
                { pt: "linha", en: "line/route", note: "transport route" },
                { pt: "carruagem", en: "carriage/car", note: "train car" },
                { pt: "comboio urbano", en: "suburban train", note: "city train service" },
                { pt: "metropolitano", en: "metro/subway", note: "underground train" },
                { pt: "elétrico", en: "tram", note: "electric streetcar" },
                { pt: "autocarro urbano", en: "city bus", note: "urban bus service" }
              ],
              keyPoints: [
                "Portugal has efficient integrated transport systems",
                "Each city has its own transport card system",
                "Public transport is generally punctual and reliable",
                "Transport cards can be used across different modes"
              ]
            },
            {
              title: "Car and Road Transportation",
              explanation: "Vocabulary for driving and road transportation in Portugal:",
              examples: [
                { pt: "carta de condução", en: "driving license", note: "legal driving permit" },
                { pt: "matrícula", en: "license plate", note: "vehicle registration" },
                { pt: "seguro automóvel", en: "car insurance", note: "vehicle insurance" },
                { pt: "inspeção", en: "vehicle inspection", note: "mandatory safety check" },
                { pt: "gasolina", en: "gasoline", note: "petrol fuel" },
                { pt: "gasóleo", en: "diesel", note: "diesel fuel" },
                { pt: "posto de combustível", en: "gas station", note: "fuel station" },
                { pt: "estacionamento", en: "parking", note: "car parking" },
                { pt: "parquímetro", en: "parking meter", note: "paid parking system" },
                { pt: "Via Verde", en: "Via Verde", note: "electronic toll system" },
                { pt: "portagem", en: "toll", note: "road usage fee" },
                { pt: "autoestrada", en: "highway", note: "major road" },
                { pt: "itinerário principal", en: "main route", note: "primary road" },
                { pt: "estrada nacional", en: "national road", note: "secondary road" },
                { pt: "rotunda", en: "roundabout", note: "circular intersection" }
              ],
              keyPoints: [
                "Portuguese driving requires EU or international license",
                "Portugal has extensive toll road network",
                "Via Verde system allows electronic toll payment",
                "Speed limits and traffic rules are strictly enforced"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Public transport flashcards
          { id: "e1", type: "flashcard", term: "transporte público", translation: "public transport" },
          { id: "e2", type: "flashcard", term: "bilhete único", translation: "unified ticket" },
          { id: "e3", type: "flashcard", term: "cartão Navegante", translation: "Lisbon transport card" },
          { id: "e4", type: "flashcard", term: "correspondência", translation: "connection/transfer" },
          { id: "e5", type: "flashcard", term: "elétrico", translation: "tram" },
          
          // Practice: Transport systems (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'cartão Andante'?", options: ["credit card", "Porto transport card", "ID card"], correct: "Porto transport card" },
          { id: "e7", type: "mcq", prompt: "What is 'correspondência'?", options: ["correspondence", "connection/transfer", "corridor"], correct: "connection/transfer" },
          { id: "e8", type: "mcq", prompt: "What is an 'elétrico'?", options: ["electric car", "tram", "electric bus"], correct: "tram" },
          
          // Practice: Transport vocabulary matching
          { id: "e9", type: "matching", pairs: [
            { a: "terminal", b: "transport hub" },
            { a: "estação", b: "station" },
            { a: "paragem", b: "stop" },
            { a: "linha", b: "line/route" }
          ]},
          
          // Presentation: Driving vocabulary flashcards
          { id: "e10", type: "flashcard", term: "carta de condução", translation: "driving license" },
          { id: "e11", type: "flashcard", term: "seguro automóvel", translation: "car insurance" },
          { id: "e12", type: "flashcard", term: "Via Verde", translation: "electronic toll system" },
          { id: "e13", type: "flashcard", term: "autoestrada", translation: "highway" },
          
          // Practice: Driving terms (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'gasóleo'?", options: ["gasoline", "diesel", "gas station"], correct: "diesel" },
          { id: "e15", type: "mcq", prompt: "What is 'Via Verde'?", options: ["green way", "electronic toll system", "green card"], correct: "electronic toll system" },
          { id: "e16", type: "mcq", prompt: "What is a 'rotunda'?", options: ["route", "roundabout", "rotation"], correct: "roundabout" },
          
          // Practice: Road infrastructure matching
          { id: "e17", type: "matching", pairs: [
            { a: "posto de combustível", b: "gas station" },
            { a: "estacionamento", b: "parking" },
            { a: "portagem", b: "toll" },
            { a: "estrada nacional", b: "national road" }
          ]},
          
          // Production: Transport inquiries (typing)
          { id: "e18", type: "typing", prompt: "Say: 'Where can I buy a transport card?'", correct: "Onde posso comprar um cartão de transportes?" },
          { id: "e19", type: "typing", prompt: "Ask: 'What time does the metro close?'", correct: "A que horas fecha o metro?" },
          { id: "e20", type: "typing", prompt: "Say: 'I need to make a connection.'", correct: "Preciso de fazer correspondência." },
          
          // Production: Driving situations (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I need car insurance.'", correct: "Preciso de seguro automóvel." },
          { id: "e22", type: "typing", prompt: "Ask: 'Where is the nearest gas station?'", correct: "Onde é o posto de combustível mais próximo?" },
          { id: "e23", type: "typing", prompt: "Say: 'This road has tolls.'", correct: "Esta estrada tem portagens." },
        ],
      },
      {
        id: "expert4el2",
        title: "Portuguese Logistics and Advanced Mobility",
        xp: 65,
        content: {
          title: "Portuguese Logistics and Advanced Transportation",
          sections: [
            {
              title: "Logistics and Delivery Services",
              explanation: "Vocabulary for logistics, shipping, and delivery services in Portugal:",
              examples: [
                { pt: "encomenda", en: "package/order", note: "delivery item" },
                { pt: "correio", en: "mail/post", note: "postal service" },
                { pt: "CTT", en: "CTT", note: "Portuguese postal service" },
                { pt: "entrega", en: "delivery", note: "package delivery" },
                { pt: "expedição", en: "shipping", note: "sending goods" },
                { pt: "transportadora", en: "shipping company", note: "logistics company" },
                { pt: "armazém", en: "warehouse", note: "storage facility" },
                { pt: "logística", en: "logistics", note: "supply chain management" },
                { pt: "rastreamento", en: "tracking", note: "package tracking" },
                { pt: "código de rastreio", en: "tracking code", note: "tracking number" },
                { pt: "prazo de entrega", en: "delivery time", note: "shipping timeframe" },
                { pt: "entrega expressa", en: "express delivery", note: "fast shipping" },
                { pt: "contra-reembolso", en: "cash on delivery", note: "COD payment" },
                { pt: "devolução", en: "return", note: "returning goods" },
                { pt: "reclamação", en: "complaint", note: "delivery complaint" }
              ],
              keyPoints: [
                "CTT is Portugal's main postal service provider",
                "Online shopping delivery is well-developed in Portugal",
                "Express delivery services are widely available",
                "Package tracking is standard for most deliveries"
              ]
            },
            {
              title: "Alternative Transportation and Modern Mobility",
              explanation: "Modern transportation options and alternative mobility solutions:",
              examples: [
                { pt: "bicicleta partilhada", en: "bike sharing", note: "shared bicycle system" },
                { pt: "trotineta elétrica", en: "electric scooter", note: "e-scooter" },
                { pt: "carsharing", en: "car sharing", note: "shared car service" },
                { pt: "aplicação de transporte", en: "transport app", note: "mobility app" },
                { pt: "Uber", en: "Uber", note: "ride-sharing service" },
                { pt: "Bolt", en: "Bolt", note: "ride-sharing service" },
                { pt: "mobilidade elétrica", en: "electric mobility", note: "e-transportation" },
                { pt: "posto de carregamento", en: "charging station", note: "electric vehicle charging" },
                { pt: "veículo elétrico", en: "electric vehicle", note: "EV" },
                { pt: "mobilidade sustentável", en: "sustainable mobility", note: "eco-friendly transport" },
                { pt: "pista ciclável", en: "bike lane", note: "cycling path" },
                { pt: "zona pedonal", en: "pedestrian zone", note: "walking area" },
                { pt: "transporte intermodal", en: "intermodal transport", note: "combined transport modes" },
                { pt: "mobilidade como serviço", en: "mobility as a service", note: "MaaS concept" },
                { pt: "micromobilidade", en: "micromobility", note: "short-distance transport" }
              ],
              keyPoints: [
                "Portugal is embracing modern mobility solutions",
                "Electric mobility is growing rapidly in major cities",
                "Bike sharing systems are available in most cities",
                "Sustainable transport is a government priority"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Logistics vocabulary flashcards
          { id: "e1", type: "flashcard", term: "encomenda", translation: "package/order" },
          { id: "e2", type: "flashcard", term: "CTT", translation: "Portuguese postal service" },
          { id: "e3", type: "flashcard", term: "transportadora", translation: "shipping company" },
          { id: "e4", type: "flashcard", term: "rastreamento", translation: "tracking" },
          { id: "e5", type: "flashcard", term: "entrega expressa", translation: "express delivery" },
          
          // Practice: Logistics terms (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'prazo de entrega'?", options: ["delivery place", "delivery time", "delivery price"], correct: "delivery time" },
          { id: "e7", type: "mcq", prompt: "What is 'contra-reembolso'?", options: ["against payment", "cash on delivery", "counter service"], correct: "cash on delivery" },
          { id: "e8", type: "mcq", prompt: "What is 'código de rastreio'?", options: ["postal code", "tracking code", "product code"], correct: "tracking code" },
          
          // Practice: Shipping services matching
          { id: "e9", type: "matching", pairs: [
            { a: "expedição", b: "shipping" },
            { a: "armazém", b: "warehouse" },
            { a: "devolução", b: "return" },
            { a: "reclamação", b: "complaint" }
          ]},
          
          // Presentation: Modern mobility flashcards
          { id: "e10", type: "flashcard", term: "bicicleta partilhada", translation: "bike sharing" },
          { id: "e11", type: "flashcard", term: "trotineta elétrica", translation: "electric scooter" },
          { id: "e12", type: "flashcard", term: "mobilidade elétrica", translation: "electric mobility" },
          { id: "e13", type: "flashcard", term: "posto de carregamento", translation: "charging station" },
          
          // Practice: Modern transport (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'carsharing'?", options: ["car washing", "car sharing", "car repair"], correct: "car sharing" },
          { id: "e15", type: "mcq", prompt: "What is 'pista ciclável'?", options: ["racing track", "bike lane", "skating rink"], correct: "bike lane" },
          { id: "e16", type: "mcq", prompt: "What is 'micromobilidade'?", options: ["small cars", "micromobility", "miniature transport"], correct: "micromobility" },
          
          // Practice: Sustainable transport matching
          { id: "e17", type: "matching", pairs: [
            { a: "veículo elétrico", b: "electric vehicle" },
            { a: "mobilidade sustentável", b: "sustainable mobility" },
            { a: "zona pedonal", b: "pedestrian zone" },
            { a: "transporte intermodal", b: "intermodal transport" }
          ]},
          
          // Production: Delivery services (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I'm waiting for a package.'", correct: "Estou à espera de uma encomenda." },
          { id: "e19", type: "typing", prompt: "Ask: 'Can I track my order?'", correct: "Posso rastrear a minha encomenda?" },
          { id: "e20", type: "typing", prompt: "Say: 'I need express delivery.'", correct: "Preciso de entrega expressa." },
          
          // Production: Modern mobility (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I use bike sharing.'", correct: "Uso bicicletas partilhadas." },
          { id: "e22", type: "typing", prompt: "Ask: 'Where is the charging station?'", correct: "Onde é o posto de carregamento?" },
          { id: "e23", type: "typing", prompt: "Say: 'I prefer sustainable mobility.'", correct: "Prefiro mobilidade sustentável." },
        ],
      },
    ],
  },
  {
    id: "expert5enhanced",
    title: "💊 Portuguese Healthcare & Wellness (Enhanced PPP)",
    description: "Master comprehensive Portuguese for healthcare, medical situations, and wellness in Portuguese-speaking environments.",
    lessons: [
      {
        id: "expert5el1",
        title: "Portuguese Healthcare System",
        xp: 60,
        content: {
          title: "Portuguese Healthcare and Medical Services",
          sections: [
            {
              title: "Healthcare System Vocabulary",
              explanation: "Essential vocabulary for navigating the Portuguese healthcare system:",
              examples: [
                { pt: "Serviço Nacional de Saúde", en: "National Health Service", note: "SNS - Portuguese public healthcare" },
                { pt: "centro de saúde", en: "health center", note: "primary care facility" },
                { pt: "hospital", en: "hospital", note: "medical facility" },
                { pt: "urgências", en: "emergency room", note: "ER/A&E" },
                { pt: "consulta", en: "appointment", note: "medical consultation" },
                { pt: "médico de família", en: "family doctor", note: "GP - general practitioner" },
                { pt: "especialista", en: "specialist", note: "medical specialist" },
                { pt: "enfermeiro/enfermeira", en: "nurse", note: "nursing professional" },
                { pt: "farmácia", en: "pharmacy", note: "drugstore" },
                { pt: "medicamento", en: "medication", note: "medicine/drug" },
                { pt: "receita médica", en: "prescription", note: "medical prescription" },
                { pt: "cartão de utente", en: "patient card", note: "healthcare ID card" },
                { pt: "seguro de saúde", en: "health insurance", note: "medical insurance" },
                { pt: "taxa moderadora", en: "co-payment", note: "patient contribution fee" },
                { pt: "exame médico", en: "medical exam", note: "health examination" }
              ],
              keyPoints: [
                "Portugal has universal healthcare through SNS",
                "Health centers provide primary care services",
                "Patient card (cartão de utente) is required for services",
                "Co-payments (taxa moderadora) apply to most services"
              ]
            },
            {
              title: "Medical Conditions and Symptoms",
              explanation: "Vocabulary for describing medical conditions and symptoms:",
              examples: [
                { pt: "sintoma", en: "symptom", note: "sign of illness" },
                { pt: "doença", en: "disease/illness", note: "medical condition" },
                { pt: "dor", en: "pain", note: "physical discomfort" },
                { pt: "febre", en: "fever", note: "high temperature" },
                { pt: "tosse", en: "cough", note: "respiratory symptom" },
                { pt: "constipação", en: "cold", note: "common cold" },
                { pt: "gripe", en: "flu", note: "influenza" },
                { pt: "alergia", en: "allergy", note: "allergic reaction" },
                { pt: "pressão arterial", en: "blood pressure", note: "cardiovascular measure" },
                { pt: "diabetes", en: "diabetes", note: "blood sugar condition" },
                { pt: "enxaqueca", en: "migraine", note: "severe headache" },
                { pt: "lesão", en: "injury", note: "physical damage" },
                { pt: "fratura", en: "fracture", note: "broken bone" },
                { pt: "infeção", en: "infection", note: "bacterial/viral invasion" },
                { pt: "inflamação", en: "inflammation", note: "swelling condition" }
              ],
              keyPoints: [
                "Describing symptoms accurately is important for diagnosis",
                "Common conditions have specific Portuguese terms",
                "Pain location and intensity should be communicated clearly",
                "Portuguese medical terminology may differ from other countries"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Healthcare system flashcards
          { id: "e1", type: "flashcard", term: "Serviço Nacional de Saúde", translation: "National Health Service (SNS)" },
          { id: "e2", type: "flashcard", term: "centro de saúde", translation: "health center" },
          { id: "e3", type: "flashcard", term: "médico de família", translation: "family doctor" },
          { id: "e4", type: "flashcard", term: "cartão de utente", translation: "patient card" },
          { id: "e5", type: "flashcard", term: "taxa moderadora", translation: "co-payment" },
          
          // Practice: Healthcare system (MCQ)
          { id: "e6", type: "mcq", prompt: "What is SNS?", options: ["Social Network Service", "National Health Service", "Student Number System"], correct: "National Health Service" },
          { id: "e7", type: "mcq", prompt: "What is 'urgências'?", options: ["pharmacy", "emergency room", "appointment"], correct: "emergency room" },
          { id: "e8", type: "mcq", prompt: "What is 'receita médica'?", options: ["medical recipe", "prescription", "medical record"], correct: "prescription" },
          
          // Practice: Healthcare professionals matching
          { id: "e9", type: "matching", pairs: [
            { a: "especialista", b: "specialist" },
            { a: "enfermeiro", b: "nurse" },
            { a: "farmácia", b: "pharmacy" },
            { a: "medicamento", b: "medication" }
          ]},
          
          // Presentation: Medical conditions flashcards
          { id: "e10", type: "flashcard", term: "sintoma", translation: "symptom" },
          { id: "e11", type: "flashcard", term: "febre", translation: "fever" },
          { id: "e12", type: "flashcard", term: "constipação", translation: "cold" },
          { id: "e13", type: "flashcard", term: "alergia", translation: "allergy" },
          
          // Practice: Medical conditions (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'enxaqueca'?", options: ["nausea", "migraine", "anxiety"], correct: "migraine" },
          { id: "e15", type: "mcq", prompt: "What is 'pressão arterial'?", options: ["blood pressure", "arterial pressure", "blood test"], correct: "blood pressure" },
          { id: "e16", type: "mcq", prompt: "What is 'fratura'?", options: ["fracture", "fever", "fatigue"], correct: "fracture" },
          
          // Practice: Symptoms matching
          { id: "e17", type: "matching", pairs: [
            { a: "dor", b: "pain" },
            { a: "tosse", b: "cough" },
            { a: "lesão", b: "injury" },
            { a: "infeção", b: "infection" }
          ]},
          
          // Production: Healthcare access (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I need to see a doctor.'", correct: "Preciso de ver um médico." },
          { id: "e19", type: "typing", prompt: "Ask: 'Where is the health center?'", correct: "Onde é o centro de saúde?" },
          { id: "e20", type: "typing", prompt: "Say: 'I want to make an appointment.'", correct: "Quero marcar uma consulta." },
          
          // Production: Describing symptoms (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I have a fever.'", correct: "Tenho febre." },
          { id: "e22", type: "typing", prompt: "Say: 'I have a headache.'", correct: "Tenho dor de cabeça." },
          { id: "e23", type: "typing", prompt: "Ask: 'Do you have medication for allergies?'", correct: "Têm medicamentos para alergias?" },
        ],
      },
      {
        id: "expert5el2",
        title: "Portuguese Wellness and Mental Health",
        xp: 65,
        content: {
          title: "Portuguese Wellness and Mental Health",
          sections: [
            {
              title: "Wellness and Fitness Vocabulary",
              explanation: "Vocabulary for wellness, fitness, and healthy lifestyle in Portuguese:",
              examples: [
                { pt: "bem-estar", en: "wellbeing", note: "overall health and happiness" },
                { pt: "saúde mental", en: "mental health", note: "psychological wellbeing" },
                { pt: "ginásio", en: "gym", note: "fitness facility" },
                { pt: "exercício físico", en: "physical exercise", note: "fitness activity" },
                { pt: "treino", en: "workout/training", note: "exercise session" },
                { pt: "musculação", en: "weight training", note: "strength training" },
                { pt: "cardio", en: "cardio", note: "cardiovascular exercise" },
                { pt: "yoga", en: "yoga", note: "mind-body practice" },
                { pt: "pilates", en: "pilates", note: "core strengthening exercise" },
                { pt: "natação", en: "swimming", note: "aquatic exercise" },
                { pt: "corrida", en: "running", note: "cardiovascular activity" },
                { pt: "caminhada", en: "walking", note: "gentle exercise" },
                { pt: "alongamento", en: "stretching", note: "flexibility exercise" },
                { pt: "relaxamento", en: "relaxation", note: "stress relief" },
                { pt: "meditação", en: "meditation", note: "mindfulness practice" }
              ],
              keyPoints: [
                "Wellness culture is growing in Portugal",
                "Gyms and fitness centers are widely available",
                "Outdoor activities are popular due to good climate",
                "Mental health awareness is increasing"
              ]
            },
            {
              title: "Nutrition and Healthy Living",
              explanation: "Vocabulary for nutrition, diet, and healthy lifestyle choices:",
              examples: [
                { pt: "alimentação saudável", en: "healthy eating", note: "nutritious diet" },
                { pt: "dieta", en: "diet", note: "eating plan" },
                { pt: "nutrição", en: "nutrition", note: "food science" },
                { pt: "vitamina", en: "vitamin", note: "essential nutrient" },
                { pt: "proteína", en: "protein", note: "muscle-building nutrient" },
                { pt: "hidratos de carbono", en: "carbohydrates", note: "energy nutrients" },
                { pt: "gordura", en: "fat", note: "lipid nutrients" },
                { pt: "fibra", en: "fiber", note: "digestive health" },
                { pt: "calorias", en: "calories", note: "energy units" },
                { pt: "peso", en: "weight", note: "body mass" },
                { pt: "massa corporal", en: "body mass", note: "physical composition" },
                { pt: "metabolismo", en: "metabolism", note: "energy processing" },
                { pt: "hidratação", en: "hydration", note: "water balance" },
                { pt: "suplemento", en: "supplement", note: "nutritional addition" },
                { pt: "estilo de vida", en: "lifestyle", note: "way of living" }
              ],
              keyPoints: [
                "Portuguese diet traditionally includes healthy Mediterranean elements",
                "Fresh ingredients are valued in Portuguese cuisine",
                "Portion control and balance are important concepts",
                "Supplement use is regulated in Portugal"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Wellness vocabulary flashcards
          { id: "e1", type: "flashcard", term: "bem-estar", translation: "wellbeing" },
          { id: "e2", type: "flashcard", term: "saúde mental", translation: "mental health" },
          { id: "e3", type: "flashcard", term: "exercício físico", translation: "physical exercise" },
          { id: "e4", type: "flashcard", term: "treino", translation: "workout/training" },
          { id: "e5", type: "flashcard", term: "relaxamento", translation: "relaxation" },
          
          // Practice: Fitness activities (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'musculação'?", options: ["muscle pain", "weight training", "muscle mass"], correct: "weight training" },
          { id: "e7", type: "mcq", prompt: "What is 'alongamento'?", options: ["lengthening", "stretching", "strengthening"], correct: "stretching" },
          { id: "e8", type: "mcq", prompt: "What is 'meditação'?", options: ["medication", "meditation", "mediation"], correct: "meditation" },
          
          // Practice: Exercise types matching
          { id: "e9", type: "matching", pairs: [
            { a: "cardio", b: "cardiovascular exercise" },
            { a: "yoga", b: "mind-body practice" },
            { a: "natação", b: "swimming" },
            { a: "corrida", b: "running" }
          ]},
          
          // Presentation: Nutrition vocabulary flashcards
          { id: "e10", type: "flashcard", term: "alimentação saudável", translation: "healthy eating" },
          { id: "e11", type: "flashcard", term: "nutrição", translation: "nutrition" },
          { id: "e12", type: "flashcard", term: "proteína", translation: "protein" },
          { id: "e13", type: "flashcard", term: "hidratação", translation: "hydration" },
          
          // Practice: Nutrition terms (MCQ)
          { id: "e14", type: "mcq", prompt: "What are 'hidratos de carbono'?", options: ["carbohydrates", "carbon hydrates", "car hydrants"], correct: "carbohydrates" },
          { id: "e15", type: "mcq", prompt: "What is 'metabolismo'?", options: ["metabolism", "metal building", "method"], correct: "metabolism" },
          { id: "e16", type: "mcq", prompt: "What is 'massa corporal'?", options: ["body mass", "corporate mass", "mass production"], correct: "body mass" },
          
          // Practice: Health components matching
          { id: "e17", type: "matching", pairs: [
            { a: "vitamina", b: "vitamin" },
            { a: "fibra", b: "fiber" },
            { a: "calorias", b: "calories" },
            { a: "suplemento", b: "supplement" }
          ]},
          
          // Production: Wellness goals (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I want to improve my wellbeing.'", correct: "Quero melhorar o meu bem-estar." },
          { id: "e19", type: "typing", prompt: "Say: 'I go to the gym every day.'", correct: "Vou ao ginásio todos os dias." },
          { id: "e20", type: "typing", prompt: "Ask: 'Do you do yoga?'", correct: "Fazes yoga?" },
          
          // Production: Healthy lifestyle (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I try to eat healthy.'", correct: "Tento comer de forma saudável." },
          { id: "e22", type: "typing", prompt: "Say: 'Hydration is important.'", correct: "A hidratação é importante." },
          { id: "e23", type: "typing", prompt: "Ask: 'What's your training routine?'", correct: "Qual é a tua rotina de treino?" },
        ],
      },
    ],
  },
  {
    id: "expert6enhanced",
    title: "📚 Portuguese Education & Research (Enhanced PPP)",
    description: "Master advanced Portuguese for education, academic research, and intellectual discourse in Portuguese-speaking environments.",
    lessons: [
      {
        id: "expert6el1",
        title: "Portuguese Education System",
        xp: 60,
        content: {
          title: "Portuguese Education and Academic Life",
          sections: [
            {
              title: "Educational System Vocabulary",
              explanation: "Comprehensive vocabulary for the Portuguese educational system:",
              examples: [
                { pt: "sistema educativo", en: "education system", note: "educational framework" },
                { pt: "ensino básico", en: "basic education", note: "primary and lower secondary" },
                { pt: "ensino secundário", en: "secondary education", note: "upper secondary/high school" },
                { pt: "ensino superior", en: "higher education", note: "university level" },
                { pt: "universidade", en: "university", note: "higher education institution" },
                { pt: "instituto politécnico", en: "polytechnic institute", note: "technical higher education" },
                { pt: "faculdade", en: "faculty/college", note: "university division" },
                { pt: "curso", en: "course/degree", note: "academic program" },
                { pt: "licenciatura", en: "bachelor's degree", note: "undergraduate degree" },
                { pt: "mestrado", en: "master's degree", note: "graduate degree" },
                { pt: "doutoramento", en: "doctorate/PhD", note: "highest academic degree" },
                { pt: "disciplina", en: "subject/course", note: "academic subject" },
                { pt: "cadeira", en: "course unit", note: "academic course" },
                { pt: "créditos ECTS", en: "ECTS credits", note: "European credit system" },
                { pt: "propina", en: "tuition fee", note: "education cost" }
              ],
              keyPoints: [
                "Portuguese education follows the Bologna Process",
                "ECTS credits are used for European mobility",
                "Public universities have regulated tuition fees",
                "Polytechnic institutes focus on technical education"
              ]
            },
            {
              title: "Academic Activities and Assessment",
              explanation: "Vocabulary for academic activities, research, and assessment:",
              examples: [
                { pt: "investigação", en: "research", note: "academic inquiry" },
                { pt: "tese", en: "thesis", note: "research document" },
                { pt: "dissertação", en: "dissertation", note: "academic work" },
                { pt: "artigo científico", en: "scientific article", note: "research publication" },
                { pt: "conferência", en: "conference", note: "academic meeting" },
                { pt: "seminário", en: "seminar", note: "academic discussion" },
                { pt: "aula teórica", en: "lecture", note: "theoretical class" },
                { pt: "aula prática", en: "practical class", note: "hands-on learning" },
                { pt: "exame", en: "exam", note: "assessment test" },
                { pt: "teste", en: "test", note: "small assessment" },
                { pt: "trabalho", en: "assignment/paper", note: "academic work" },
                { pt: "apresentação", en: "presentation", note: "academic presentation" },
                { pt: "nota", en: "grade", note: "academic score" },
                { pt: "avaliação", en: "assessment", note: "evaluation process" },
                { pt: "bibliografia", en: "bibliography", note: "reference list" }
              ],
              keyPoints: [
                "Portuguese grading typically uses 0-20 scale",
                "Research and practical work are emphasized",
                "Academic conferences are important for career development",
                "Citation and bibliography standards follow European norms"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Education system flashcards
          { id: "e1", type: "flashcard", term: "sistema educativo", translation: "education system" },
          { id: "e2", type: "flashcard", term: "ensino superior", translation: "higher education" },
          { id: "e3", type: "flashcard", term: "instituto politécnico", translation: "polytechnic institute" },
          { id: "e4", type: "flashcard", term: "licenciatura", translation: "bachelor's degree" },
          { id: "e5", type: "flashcard", term: "créditos ECTS", translation: "ECTS credits" },
          
          // Practice: Education levels (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'ensino básico'?", options: ["basic education", "basic training", "basic teaching"], correct: "basic education" },
          { id: "e7", type: "mcq", prompt: "What is 'doutoramento'?", options: ["doctorate", "documentation", "doctor"], correct: "doctorate" },
          { id: "e8", type: "mcq", prompt: "What is 'propina'?", options: ["proposal", "tuition fee", "property"], correct: "tuition fee" },
          
          // Practice: Academic degrees matching
          { id: "e9", type: "matching", pairs: [
            { a: "mestrado", b: "master's degree" },
            { a: "faculdade", b: "faculty/college" },
            { a: "disciplina", b: "subject/course" },
            { a: "cadeira", b: "course unit" }
          ]},
          
          // Presentation: Academic activities flashcards
          { id: "e10", type: "flashcard", term: "investigação", translation: "research" },
          { id: "e11", type: "flashcard", term: "tese", translation: "thesis" },
          { id: "e12", type: "flashcard", term: "artigo científico", translation: "scientific article" },
          { id: "e13", type: "flashcard", term: "conferência", translation: "conference" },
          
          // Practice: Academic work (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'dissertação'?", options: ["discussion", "dissertation", "dissatisfaction"], correct: "dissertation" },
          { id: "e15", type: "mcq", prompt: "What is 'aula teórica'?", options: ["theoretical class", "theory class", "lecture"], correct: "lecture" },
          { id: "e16", type: "mcq", prompt: "What is 'bibliografia'?", options: ["biography", "bibliography", "biography book"], correct: "bibliography" },
          
          // Practice: Assessment methods matching
          { id: "e17", type: "matching", pairs: [
            { a: "exame", b: "exam" },
            { a: "teste", b: "test" },
            { a: "trabalho", b: "assignment/paper" },
            { a: "avaliação", b: "assessment" }
          ]},
          
          // Production: Academic interests (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I'm studying at university.'", correct: "Estou a estudar na universidade." },
          { id: "e19", type: "typing", prompt: "Say: 'I'm doing research.'", correct: "Estou a fazer investigação." },
          { id: "e20", type: "typing", prompt: "Ask: 'When is the exam?'", correct: "Quando é o exame?" },
          
          // Production: Academic goals (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I want to do a master's degree.'", correct: "Quero fazer um mestrado." },
          { id: "e22", type: "typing", prompt: "Say: 'I'm writing my thesis.'", correct: "Estou a escrever a minha tese." },
          { id: "e23", type: "typing", prompt: "Ask: 'What's your grade?'", correct: "Qual é a tua nota?" },
        ],
      },
      {
        id: "expert6el2",
        title: "Portuguese Research and Academic Discourse",
        xp: 65,
        content: {
          title: "Portuguese Academic Research and Scientific Discourse",
          sections: [
            {
              title: "Research Methodology and Scientific Vocabulary",
              explanation: "Advanced vocabulary for research methodology and scientific discourse:",
              examples: [
                { pt: "metodologia", en: "methodology", note: "research approach" },
                { pt: "hipótese", en: "hypothesis", note: "research assumption" },
                { pt: "análise", en: "analysis", note: "data examination" },
                { pt: "dados", en: "data", note: "research information" },
                { pt: "amostra", en: "sample", note: "research subset" },
                { pt: "variável", en: "variable", note: "research factor" },
                { pt: "estatística", en: "statistics", note: "data analysis method" },
                { pt: "questionário", en: "questionnaire", note: "research instrument" },
                { pt: "entrevista", en: "interview", note: "qualitative method" },
                { pt: "observação", en: "observation", note: "research technique" },
                { pt: "experiência", en: "experiment", note: "controlled study" },
                { pt: "conclusão", en: "conclusion", note: "research findings" },
                { pt: "resultados", en: "results", note: "research outcomes" },
                { pt: "discussão", en: "discussion", note: "interpretation section" },
                { pt: "referências", en: "references", note: "citation list" }
              ],
              keyPoints: [
                "Portuguese academic writing follows specific conventions",
                "Research methodology terminology is standardized",
                "Statistical analysis is important in Portuguese research",
                "Citation formats follow international standards"
              ]
            },
            {
              title: "Academic Publications and Knowledge Dissemination",
              explanation: "Vocabulary for academic publishing and knowledge sharing:",
              examples: [
                { pt: "publicação", en: "publication", note: "academic output" },
                { pt: "revista científica", en: "scientific journal", note: "academic periodical" },
                { pt: "editor", en: "editor", note: "publication manager" },
                { pt: "revisor", en: "reviewer", note: "peer reviewer" },
                { pt: "manuscrito", en: "manuscript", note: "draft publication" },
                { pt: "citação", en: "citation", note: "reference to other work" },
                { pt: "peer review", en: "peer review", note: "academic evaluation" },
                { pt: "indexação", en: "indexing", note: "database inclusion" },
                { pt: "fator de impacto", en: "impact factor", note: "journal ranking measure" },
                { pt: "acesso aberto", en: "open access", note: "free publication model" },
                { pt: "propriedade intelectual", en: "intellectual property", note: "research ownership" },
                { pt: "direitos de autor", en: "copyright", note: "publication rights" },
                { pt: "plágio", en: "plagiarism", note: "academic misconduct" },
                { pt: "ética", en: "ethics", note: "research principles" },
                { pt: "divulgação científica", en: "science communication", note: "public outreach" }
              ],
              keyPoints: [
                "Portuguese universities emphasize publication output",
                "Open access publishing is growing in Portugal",
                "Academic ethics are strictly enforced",
                "Science communication to the public is valued"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Research methodology flashcards
          { id: "e1", type: "flashcard", term: "metodologia", translation: "methodology" },
          { id: "e2", type: "flashcard", term: "hipótese", translation: "hypothesis" },
          { id: "e3", type: "flashcard", term: "análise", translation: "analysis" },
          { id: "e4", type: "flashcard", term: "amostra", translation: "sample" },
          { id: "e5", type: "flashcard", term: "estatística", translation: "statistics" },
          
          // Practice: Research methods (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'variável'?", options: ["variation", "variable", "variety"], correct: "variable" },
          { id: "e7", type: "mcq", prompt: "What is 'questionário'?", options: ["questionnaire", "question", "questioning"], correct: "questionnaire" },
          { id: "e8", type: "mcq", prompt: "What is 'experiência'?", options: ["experience", "experiment", "expertise"], correct: "experiment" },
          
          // Practice: Research process matching
          { id: "e9", type: "matching", pairs: [
            { a: "dados", b: "data" },
            { a: "entrevista", b: "interview" },
            { a: "observação", b: "observation" },
            { a: "conclusão", b: "conclusion" }
          ]},
          
          // Presentation: Academic publishing flashcards
          { id: "e10", type: "flashcard", term: "revista científica", translation: "scientific journal" },
          { id: "e11", type: "flashcard", term: "manuscrito", translation: "manuscript" },
          { id: "e12", type: "flashcard", term: "peer review", translation: "peer review" },
          { id: "e13", type: "flashcard", term: "acesso aberto", translation: "open access" },
          
          // Practice: Publishing terms (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'fator de impacto'?", options: ["impact factor", "impact factory", "factor impact"], correct: "impact factor" },
          { id: "e15", type: "mcq", prompt: "What is 'plágio'?", options: ["plague", "plagiarism", "planning"], correct: "plagiarism" },
          { id: "e16", type: "mcq", prompt: "What is 'divulgação científica'?", options: ["scientific divorce", "science communication", "scientific discovery"], correct: "science communication" },
          
          // Practice: Academic integrity matching
          { id: "e17", type: "matching", pairs: [
            { a: "citação", b: "citation" },
            { a: "propriedade intelectual", b: "intellectual property" },
            { a: "direitos de autor", b: "copyright" },
            { a: "ética", b: "ethics" }
          ]},
          
          // Production: Research activities (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I'm analyzing the data.'", correct: "Estou a analisar os dados." },
          { id: "e19", type: "typing", prompt: "Say: 'My hypothesis is correct.'", correct: "A minha hipótese está correcta." },
          { id: "e20", type: "typing", prompt: "Ask: 'What's your methodology?'", correct: "Qual é a tua metodologia?" },
          
          // Production: Academic publishing (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I want to publish this article.'", correct: "Quero publicar este artigo." },
          { id: "e22", type: "typing", prompt: "Say: 'The manuscript is under review.'", correct: "O manuscrito está em revisão." },
          { id: "e23", type: "typing", prompt: "Ask: 'Is this journal open access?'", correct: "Esta revista é de acesso aberto?" },
        ],
      },
    ],
  },
  {
    id: "expert7enhanced",
    title: "💰 Portuguese Finance & Investment (Enhanced PPP)",
    description: "Master advanced Portuguese for finance, investment, and economic discourse in Portuguese-speaking markets.",
    lessons: [
      {
        id: "expert7el1",
        title: "Portuguese Financial System",
        xp: 60,
        content: {
          title: "Portuguese Banking and Financial Services",
          sections: [
            {
              title: "Banking and Financial Institutions",
              explanation: "Comprehensive vocabulary for Portuguese banking and financial institutions:",
              examples: [
                { pt: "sistema financeiro", en: "financial system", note: "economic framework" },
                { pt: "Banco de Portugal", en: "Bank of Portugal", note: "central bank" },
                { pt: "banco comercial", en: "commercial bank", note: "retail banking" },
                { pt: "caixa económica", en: "savings bank", note: "cooperative bank" },
                { pt: "instituição de crédito", en: "credit institution", note: "lending organization" },
                { pt: "financeira", en: "finance company", note: "consumer credit" },
                { pt: "corretora", en: "brokerage", note: "investment intermediary" },
                { pt: "gestora de fundos", en: "fund manager", note: "investment management" },
                { pt: "seguradora", en: "insurance company", note: "risk coverage" },
                { pt: "plano de pensões", en: "pension plan", note: "retirement savings" },
                { pt: "fundo de investimento", en: "investment fund", note: "collective investment" },
                { pt: "certificado de depósito", en: "certificate of deposit", note: "fixed-term deposit" },
                { pt: "obrigação", en: "bond", note: "debt security" },
                { pt: "ação", en: "stock/share", note: "equity security" },
                { pt: "carteira de investimento", en: "investment portfolio", note: "asset collection" }
              ],
              keyPoints: [
                "Portugal's financial system is regulated by Banco de Portugal",
                "Portuguese banks offer comprehensive financial services",
                "Investment products follow EU regulations",
                "Pension planning is increasingly important in Portugal"
              ]
            },
            {
              title: "Financial Products and Services",
              explanation: "Vocabulary for financial products and banking services:",
              examples: [
                { pt: "conta à ordem", en: "checking account", note: "current account" },
                { pt: "conta poupança", en: "savings account", note: "deposit account" },
                { pt: "depósito a prazo", en: "term deposit", note: "fixed deposit" },
                { pt: "crédito habitação", en: "mortgage", note: "home loan" },
                { pt: "crédito pessoal", en: "personal loan", note: "consumer credit" },
                { pt: "cartão de crédito", en: "credit card", note: "revolving credit" },
                { pt: "descoberto autorizado", en: "authorized overdraft", note: "credit facility" },
                { pt: "taxa de juro", en: "interest rate", note: "borrowing cost" },
                { pt: "spread", en: "spread", note: "bank margin" },
                { pt: "comissão", en: "fee/commission", note: "service charge" },
                { pt: "garantia", en: "guarantee", note: "security" },
                { pt: "avalista", en: "guarantor", note: "co-signer" },
                { pt: "seguro de vida", en: "life insurance", note: "death benefit" },
                { pt: "seguro de saúde", en: "health insurance", note: "medical coverage" },
                { pt: "PPR", en: "PPR", note: "retirement savings plan" }
              ],
              keyPoints: [
                "Portuguese mortgage rates are competitive in EU",
                "PPR (Plano Poupança Reforma) offers tax benefits",
                "Bank fees and commissions are regulated",
                "Insurance products are often bundled with banking"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Financial system flashcards
          { id: "e1", type: "flashcard", term: "sistema financeiro", translation: "financial system" },
          { id: "e2", type: "flashcard", term: "Banco de Portugal", translation: "Bank of Portugal (central bank)" },
          { id: "e3", type: "flashcard", term: "instituição de crédito", translation: "credit institution" },
          { id: "e4", type: "flashcard", term: "fundo de investimento", translation: "investment fund" },
          { id: "e5", type: "flashcard", term: "plano de pensões", translation: "pension plan" },
          
          // Practice: Financial institutions (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'caixa económica'?", options: ["economic box", "savings bank", "economic case"], correct: "savings bank" },
          { id: "e7", type: "mcq", prompt: "What is 'corretora'?", options: ["corrector", "brokerage", "courier"], correct: "brokerage" },
          { id: "e8", type: "mcq", prompt: "What is 'gestora de fundos'?", options: ["fund manager", "fund gesture", "fund generator"], correct: "fund manager" },
          
          // Practice: Investment products matching
          { id: "e9", type: "matching", pairs: [
            { a: "obrigação", b: "bond" },
            { a: "ação", b: "stock/share" },
            { a: "certificado de depósito", b: "certificate of deposit" },
            { a: "carteira de investimento", b: "investment portfolio" }
          ]},
          
          // Presentation: Banking products flashcards
          { id: "e10", type: "flashcard", term: "conta à ordem", translation: "checking account" },
          { id: "e11", type: "flashcard", term: "crédito habitação", translation: "mortgage" },
          { id: "e12", type: "flashcard", term: "depósito a prazo", translation: "term deposit" },
          { id: "e13", type: "flashcard", term: "PPR", translation: "retirement savings plan" },
          
          // Practice: Credit products (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'crédito pessoal'?", options: ["personal credit", "personnel credit", "person credit"], correct: "personal credit" },
          { id: "e15", type: "mcq", prompt: "What is 'descoberto autorizado'?", options: ["authorized discovery", "authorized overdraft", "authorized disclosure"], correct: "authorized overdraft" },
          { id: "e16", type: "mcq", prompt: "What is 'avalista'?", options: ["evaluator", "guarantor", "available"], correct: "guarantor" },
          
          // Practice: Financial terms matching
          { id: "e17", type: "matching", pairs: [
            { a: "taxa de juro", b: "interest rate" },
            { a: "spread", b: "bank margin" },
            { a: "comissão", b: "fee/commission" },
            { a: "garantia", b: "guarantee" }
          ]},
          
          // Production: Banking services (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I want to open a savings account.'", correct: "Quero abrir uma conta poupança." },
          { id: "e19", type: "typing", prompt: "Ask: 'What's the interest rate?'", correct: "Qual é a taxa de juro?" },
          { id: "e20", type: "typing", prompt: "Say: 'I need a mortgage.'", correct: "Preciso de um crédito habitação." },
          
          // Production: Investment interests (typing)
          { id: "e21", type: "typing", prompt: "Say: 'I want to invest in funds.'", correct: "Quero investir em fundos." },
          { id: "e22", type: "typing", prompt: "Ask: 'What are the fees?'", correct: "Quais são as comissões?" },
          { id: "e23", type: "typing", prompt: "Say: 'I'm planning for retirement.'", correct: "Estou a planear para a reforma." },
        ],
      },
      {
        id: "expert7el2",
        title: "Portuguese Investment and Economic Discourse",
        xp: 65,
        content: {
          title: "Portuguese Investment Markets and Economic Analysis",
          sections: [
            {
              title: "Investment Markets and Trading",
              explanation: "Advanced vocabulary for investment markets and trading activities:",
              examples: [
                { pt: "bolsa de valores", en: "stock exchange", note: "securities market" },
                { pt: "PSI-20", en: "PSI-20", note: "Portuguese stock index" },
                { pt: "cotação", en: "quote/price", note: "market price" },
                { pt: "volatilidade", en: "volatility", note: "price fluctuation" },
                { pt: "liquidez", en: "liquidity", note: "ease of trading" },
                { pt: "dividendo", en: "dividend", note: "shareholder payment" },
                { pt: "mais-valia", en: "capital gain", note: "profit from sale" },
                { pt: "menos-valia", en: "capital loss", note: "loss from sale" },
                { pt: "corretor", en: "broker", note: "trading intermediary" },
                { pt: "análise técnica", en: "technical analysis", note: "chart analysis" },
                { pt: "análise fundamental", en: "fundamental analysis", note: "company valuation" },
                { pt: "diversificação", en: "diversification", note: "risk spreading" },
                { pt: "risco", en: "risk", note: "investment uncertainty" },
                { pt: "rendibilidade", en: "return/yield", note: "investment performance" },
                { pt: "mercado de capitais", en: "capital market", note: "long-term finance" }
              ],
              keyPoints: [
                "PSI-20 is Portugal's main stock market index",
                "Portuguese stock exchange is part of Euronext",
                "Investment taxation follows EU directives",
                "Financial advice requires professional licensing"
              ]
            },
            {
              title: "Economic Indicators and Business Analysis",
              explanation: "Vocabulary for economic analysis and business performance metrics:",
              examples: [
                { pt: "PIB", en: "GDP", note: "Gross Domestic Product" },
                { pt: "inflação", en: "inflation", note: "price increase rate" },
                { pt: "taxa de desemprego", en: "unemployment rate", note: "jobless percentage" },
                { pt: "défice", en: "deficit", note: "budget shortfall" },
                { pt: "superávit", en: "surplus", note: "budget excess" },
                { pt: "dívida pública", en: "public debt", note: "government debt" },
                { pt: "balança comercial", en: "trade balance", note: "exports vs imports" },
                { pt: "câmbio", en: "exchange rate", note: "currency conversion" },
                { pt: "euro", en: "euro", note: "European currency" },
                { pt: "economia", en: "economy", note: "economic system" },
                { pt: "crescimento económico", en: "economic growth", note: "GDP expansion" },
                { pt: "recessão", en: "recession", note: "economic contraction" },
                { pt: "política monetária", en: "monetary policy", note: "central bank actions" },
                { pt: "política fiscal", en: "fiscal policy", note: "government spending" },
                { pt: "competitividade", en: "competitiveness", note: "economic advantage" }
              ],
              keyPoints: [
                "Portugal uses the euro as its currency",
                "Economic indicators are reported by INE (Statistics Portugal)",
                "EU economic policies affect Portuguese markets",
                "Economic discourse requires precise terminology"
              ]
            }
          ]
        },
        exercises: [
          // Presentation: Investment markets flashcards
          { id: "e1", type: "flashcard", term: "bolsa de valores", translation: "stock exchange" },
          { id: "e2", type: "flashcard", term: "PSI-20", translation: "Portuguese stock index" },
          { id: "e3", type: "flashcard", term: "volatilidade", translation: "volatility" },
          { id: "e4", type: "flashcard", term: "dividendo", translation: "dividend" },
          { id: "e5", type: "flashcard", term: "diversificação", translation: "diversification" },
          
          // Practice: Trading terms (MCQ)
          { id: "e6", type: "mcq", prompt: "What is 'cotação'?", options: ["quotation", "quote/price", "quota"], correct: "quote/price" },
          { id: "e7", type: "mcq", prompt: "What is 'mais-valia'?", options: ["more value", "capital gain", "most valid"], correct: "capital gain" },
          { id: "e8", type: "mcq", prompt: "What is 'rendibilidade'?", options: ["surrender", "return/yield", "rendering"], correct: "return/yield" },
          
          // Practice: Investment concepts matching
          { id: "e9", type: "matching", pairs: [
            { a: "liquidez", b: "liquidity" },
            { a: "risco", b: "risk" },
            { a: "análise técnica", b: "technical analysis" },
            { a: "mercado de capitais", b: "capital market" }
          ]},
          
          // Presentation: Economic indicators flashcards
          { id: "e10", type: "flashcard", term: "PIB", translation: "GDP (Gross Domestic Product)" },
          { id: "e11", type: "flashcard", term: "inflação", translation: "inflation" },
          { id: "e12", type: "flashcard", term: "taxa de desemprego", translation: "unemployment rate" },
          { id: "e13", type: "flashcard", term: "balança comercial", translation: "trade balance" },
          
          // Practice: Economic terms (MCQ)
          { id: "e14", type: "mcq", prompt: "What is 'défice'?", options: ["deficit", "define", "defense"], correct: "deficit" },
          { id: "e15", type: "mcq", prompt: "What is 'dívida pública'?", options: ["public doubt", "public debt", "public dividend"], correct: "public debt" },
          { id: "e16", type: "mcq", prompt: "What is 'crescimento económico'?", options: ["economic creation", "economic growth", "economic crisis"], correct: "economic growth" },
          
          // Practice: Economic policy matching
          { id: "e17", type: "matching", pairs: [
            { a: "superávit", b: "surplus" },
            { a: "recessão", b: "recession" },
            { a: "política monetária", b: "monetary policy" },
            { a: "competitividade", b: "competitiveness" }
          ]},
          
          // Production: Investment discussion (typing)
          { id: "e18", type: "typing", prompt: "Say: 'I invest in the stock market.'", correct: "Invisto na bolsa de valores." },
          { id: "e19", type: "typing", prompt: "Ask: 'What's the stock price?'", correct: "Qual é a cotação da ação?" },
          { id: "e20", type: "typing", prompt: "Say: 'Diversification reduces risk.'", correct: "A diversificação reduz o risco." },
          
          // Production: Economic analysis (typing)
          { id: "e21", type: "typing", prompt: "Say: 'Inflation is increasing.'", correct: "A inflação está a aumentar." },
          { id: "e22", type: "typing", prompt: "Say: 'The economy is growing.'", correct: "A economia está a crescer." },
          { id: "e23", type: "typing", prompt: "Ask: 'What's the GDP growth rate?'", correct: "Qual é a taxa de crescimento do PIB?" },
        ],
      },
    ],
  },
  {
    id: "expert8enhanced",
    title: "🌐 Portuguese Digital Communication (Enhanced PPP)",
    description: "Master Portuguese for digital communication, social media, and modern technology interactions in Portuguese-speaking environments.",
    lessons: [
      {
        id: "expert8el1",
        title: "Portuguese Digital Communication",
        xp: 60,
        content: {
          title: "Portuguese Digital Communication and Social Media",
          sections: [
            {
              title: "Digital Communication Vocabulary",
              explanation: "Essential vocabulary for digital communication in Portuguese:",
              examples: [
                { pt: "comunicação digital", en: "digital communication", note: "online interaction" },
                { pt: "redes sociais", en: "social media", note: "social networking platforms" },
                { pt: "mensagem", en: "message", note: "digital message" },
                { pt: "publicação", en: "post", note: "social media content" },
                { pt: "partilha", en: "share", note: "sharing content" },
                { pt: "like", en: "like", note: "approval reaction" },
                { pt: "seguir", en: "follow", note: "subscribing to updates" },
                { pt: "hashtag", en: "hashtag", note: "content categorization" }
              ],
              keyPoints: [
                "Portuguese digital communication uses both Portuguese and English terms",
                "Social media is widely used across all age groups in Portugal"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "comunicação digital", translation: "digital communication" },
          { id: "e2", type: "flashcard", term: "redes sociais", translation: "social media" },
          { id: "e3", type: "mcq", prompt: "What is 'seguir'?", options: ["follow", "secure", "second"], correct: "follow" },
          { id: "e4", type: "typing", prompt: "Say: 'I use social media.'", correct: "Uso as redes sociais." },
        ],
      },
    ],
  },
  {
    id: "expert9enhanced",
    title: "🏛️ Portuguese Legal & Administrative (Enhanced PPP)",
    description: "Master Portuguese for legal situations, contracts, and advanced administrative procedures in Portuguese-speaking environments.",
    lessons: [
      {
        id: "expert9el1",
        title: "Portuguese Legal System and Procedures",
        xp: 65,
        content: {
          title: "Portuguese Legal System and Procedures",
          sections: [
            {
              title: "Legal System Vocabulary",
              explanation: "Essential vocabulary for understanding the Portuguese legal system:",
              examples: [
                { pt: "sistema judicial", en: "judicial system", note: "court system" },
                { pt: "tribunal", en: "court", note: "legal institution" },
                { pt: "advogado", en: "lawyer", note: "legal representative" },
                { pt: "contrato", en: "contract", note: "legal agreement" },
                { pt: "lei", en: "law", note: "legal rule" },
                { pt: "direito", en: "right", note: "legal entitlement" },
                { pt: "obrigação", en: "obligation", note: "legal duty" },
                { pt: "responsabilidade", en: "responsibility", note: "legal liability" }
              ],
              keyPoints: [
                "Portuguese legal system is based on civil law tradition",
                "Professional legal representation is often required"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "sistema judicial", translation: "judicial system" },
          { id: "e2", type: "flashcard", term: "advogado", translation: "lawyer" },
          { id: "e3", type: "mcq", prompt: "Who makes legal decisions in court?", options: ["advogado", "juiz", "testemunha"], correct: "juiz" },
          { id: "e4", type: "typing", prompt: "Say: 'I need a lawyer.'", correct: "Preciso de um advogado." },
        ],
      },
    ],
  },
  {
    id: "expert10enhanced",
    title: "🎯 Portuguese Advanced Integration (Enhanced PPP)",
    description: "Master advanced Portuguese integration skills combining all previous learning for comprehensive A1+ proficiency in Portuguese-speaking environments.",
    lessons: [
      {
        id: "expert10el1",
        title: "Portuguese Advanced Communication Integration",
        xp: 70,
        content: {
          title: "Advanced Portuguese Communication Integration",
          sections: [
            {
              title: "Complex Conversation Management",
              explanation: "Advanced skills for managing complex conversations in Portuguese:",
              examples: [
                { pt: "conversa complexa", en: "complex conversation", note: "multi-topic discussion" },
                { pt: "esclarecimento", en: "clarification", note: "making something clear" },
                { pt: "negociação", en: "negotiation", note: "reaching mutually beneficial outcome" },
                { pt: "consenso", en: "consensus", note: "general agreement" },
                { pt: "mal-entendido", en: "misunderstanding", note: "communication error" },
                { pt: "integração cultural", en: "cultural integration", note: "adapting to Portuguese culture" },
                { pt: "fluência", en: "fluency", note: "smooth language use" },
                { pt: "competência linguística", en: "linguistic competence", note: "language proficiency" }
              ],
              keyPoints: [
                "Portuguese conversation style values relationship building",
                "Full integration requires understanding cultural nuances"
              ]
            }
          ]
        },
        exercises: [
          { id: "e1", type: "flashcard", term: "conversa complexa", translation: "complex conversation" },
          { id: "e2", type: "flashcard", term: "integração cultural", translation: "cultural integration" },
          { id: "e3", type: "mcq", prompt: "What is 'esclarecimento'?", options: ["clarification", "establishment", "accomplishment"], correct: "clarification" },
          { id: "e4", type: "typing", prompt: "Say: 'I want to improve my fluency.'", correct: "Quero melhorar a minha fluência." },
        ],
      },
    ],
  },
]; 