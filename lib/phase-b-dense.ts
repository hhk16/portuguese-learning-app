// PHASE B: Dense PPP Implementation for Vocabulary Modules (VOCAB1-7)
import { Module } from './content';
import { EnhancedLessonContent } from './ppp-types';
import {
  grammarRule, pronunciationRule, culturalRule, warningRule,
  contrast, ptVsEn, pitfall, culturalNote, miniCheck,
  pronunciationGuide, sound, cheatSheet, cheatCategory, whyItMatters, example,
  commonPatterns
} from './ppp-helpers';

export const phaseBDenseModules: Module[] = [
  // VOCAB1: Colors & Portuguese Visual Culture (Dense PPP)
  {
    id: "vocab1",
    title: "Colors & Portuguese Visual Culture (Dense PPP)",
    description: "Master Portuguese color vocabulary with deep cultural context about Portuguese visual arts, architectural traditions, regional aesthetics, and the symbolic meaning of colors in Portuguese society.",
    lessons: [
      {
        id: "vocab1l1",
        title: "Cores & Estética Portuguesa",
        xp: 50,
        content: {
          title: "Portuguese Colors & Visual Cultural Mastery",
          sections: [
            {
              title: "Essential Portuguese Color Vocabulary",
              explanation: "Portuguese color vocabulary is deeply connected to the country's artistic heritage, architectural traditions, and cultural symbolism. Master these colors to understand Portuguese visual culture:",
              
              examples: [
                example("vermelho", "red", "Carnation Revolution, Portuguese flag, passion"),
                example("azul", "blue", "azulejos, ocean heritage, Portuguese identity"),
                example("verde", "green", "Portuguese flag, hope, nature, forests"),
                example("amarelo", "yellow", "Portuguese sun, royal color, optimism"),
                example("branco", "white", "Portuguese houses, purity, traditional architecture"),
                example("preto", "black", "formality, elegance, mourning, sophistication"),
                example("cor-de-rosa", "pink", "delicate beauty, femininity, flowers"),
                example("laranja", "orange", "citrus groves, energy, autumn landscapes"),
                example("castanho", "brown", "Portuguese earth, cork trees, traditional materials"),
                example("dourado", "golden", "baroque churches, wealth, divine light")
              ],
              
              keyPoints: [
                "Portuguese colors carry deep cultural and historical meanings",
                "Architectural colors reflect Portugal's climate and materials",
                "Religious art uses specific color symbolism",
                "Regional variations reflect local landscapes and traditions"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Color Agreement Rules",
                  "Colors as adjectives must agree with the gender and number of the noun they modify.",
                  "casa branca, carro branco, casas brancas, carros brancos"
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🎨", 
                  "Portuguese Azulejo Art Tradition",
                  "Portuguese blue and white tiles (azulejos) are found on buildings throughout Portugal. They tell stories, provide cooling, and represent Portuguese artistic identity."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Colors Cultural Quick Reference", [
            cheatCategory("Basic Colors", [
              "vermelho (red) - revolution, passion",
              "azul (blue) - Portuguese identity, ocean", 
              "verde (green) - hope, nature, flag",
              "branco (white) - purity, houses"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Describe Portuguese art, architecture, and landscapes with cultural accuracy",
            "Understand color symbolism in Portuguese history and traditions"
          ], "Colors are fundamental to Portuguese cultural expression. Master color vocabulary and symbolism, and Portuguese people will see you as someone who truly appreciates their artistic heritage.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "vermelho", translation: "red" },
          { id: "e2", type: "flashcard", term: "azul", translation: "blue" },
          { id: "e3", type: "flashcard", term: "verde", translation: "green" },
          { id: "e4", type: "flashcard", term: "amarelo", translation: "yellow" },
          { id: "e5", type: "flashcard", term: "branco", translation: "white" },
          { id: "e6", type: "mcq", prompt: "What colors are Portuguese azulejos famous for?", options: ["Red and green", "Blue and white", "Yellow and black"], correct: "Blue and white" },
          { id: "e7", type: "typing", prompt: "Say 'The house is white' (feminine)", correct: "A casa é branca" },
          { id: "e8", type: "matching", pairs: [
            { a: "vermelho", b: "red" },
            { a: "azul", b: "blue" },
            { a: "verde", b: "green" },
            { a: "branco", b: "white" }
          ]}
        ]
      }
    ]
  },

  // VOCAB2: Food, Animals & Portuguese Natural Environment (Dense PPP)
  {
    id: "vocab2",
    title: "Food, Animals & Portuguese Natural Environment (Dense PPP)",
    description: "Master Portuguese food vocabulary with deep culinary culture, animal vocabulary with Portuguese rural traditions, and nature vocabulary reflecting Portugal's diverse landscapes.",
    lessons: [
      {
        id: "vocab2l1",
        title: "Comida & Tradição Culinária",
        xp: 55,
        content: {
          title: "Portuguese Food Culture & Culinary Heritage Mastery",
          sections: [
            {
              title: "Essential Portuguese Food Vocabulary",
              explanation: "Portuguese food vocabulary reflects the country's maritime heritage, agricultural traditions, and regional diversity:",
              
              examples: [
                example("peixe", "fish", "fresh from Atlantic, Portuguese staple"),
                example("carne", "meat", "pork dominant, regional specialties"),
                example("pão", "bread", "daily essential, accompanies every meal"),
                example("queijo", "cheese", "Serra da Estrela, regional varieties"),
                example("vinho", "wine", "Portuguese pride, Douro heritage"),
                example("azeite", "olive oil", "liquid gold, Portuguese cooking base"),
                example("cão", "dog", "loyal companion, Portuguese breeds"),
                example("gato", "cat", "independent spirit, pest control"),
                example("cavalo", "horse", "Lusitano breed, Portuguese pride"),
                example("vaca", "cow", "dairy production, rural landscape")
              ],
              
              keyPoints: [
                "Portuguese food vocabulary emphasizes freshness and quality",
                "Regional variations reflect local ingredients and traditions",
                "Portuguese vs Spanish food terms show cultural independence",
                "Animal vocabulary reflects Portuguese rural heritage"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Food Gender and Quantities",
                  "Portuguese foods have specific genders affecting articles and quantities.",
                  "o peixe, a carne, um pão, uma batata"
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🐟", 
                  "Portuguese Maritime Food Heritage",
                  "Portugal's Atlantic coast provides abundant fresh fish. Portuguese people distinguish between ocean fish and river fish, with ocean fish being more prestigious."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Food & Animals Cultural Quick Reference", [
            cheatCategory("Essential Foods", [
              "peixe (fish) - Atlantic heritage",
              "carne (meat) - pork dominant",
              "pão (bread) - daily essential",
              "vinho (wine) - Portuguese pride"
            ]),
            cheatCategory("Farm Animals", [
              "cão (dog) - loyal companion",
              "gato (cat) - independent spirit",
              "cavalo (horse) - Lusitano breed",
              "vaca (cow) - dairy production"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Navigate Portuguese markets, restaurants, and food conversations confidently",
            "Understand Portuguese agricultural and rural cultural heritage"
          ], "Food and nature vocabulary connects you to Portuguese daily life and cultural values.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "peixe", translation: "fish" },
          { id: "e2", type: "flashcard", term: "carne", translation: "meat" },
          { id: "e3", type: "flashcard", term: "pão", translation: "bread" },
          { id: "e4", type: "flashcard", term: "cão", translation: "dog" },
          { id: "e5", type: "flashcard", term: "cavalo", translation: "horse" },
          { id: "e6", type: "mcq", prompt: "What is Portugal's famous horse breed?", options: ["Andalusian", "Lusitano", "Arabian"], correct: "Lusitano" },
          { id: "e7", type: "typing", prompt: "Say 'I want fish'", correct: "Quero peixe" }
        ]
      }
    ]
  },

  // VOCAB3: Adjectives & Portuguese Aesthetic Values (Dense PPP)
  {
    id: "vocab3",
    title: "Adjectives & Portuguese Aesthetic Values (Dense PPP)",
    description: "Master Portuguese adjectives with deep cultural context about Portuguese aesthetic preferences, social values, and sophisticated descriptive language.",
    lessons: [
      {
        id: "vocab3l1",
        title: "Adjetivos & Valores Estéticos",
        xp: 60,
        content: {
          title: "Portuguese Adjectives & Cultural Aesthetic Mastery",
          sections: [
            {
              title: "Essential Portuguese Descriptive Adjectives",
              explanation: "Portuguese adjectives reflect refined aesthetic sense and social values. Master these to engage in sophisticated Portuguese conversations:",
              
              examples: [
                example("bonito/bonita", "beautiful/pretty", "aesthetic appreciation"),
                example("simpático/simpática", "nice/likable", "highest Portuguese compliment"),
                example("inteligente", "intelligent", "highly valued trait"),
                example("educado/educada", "polite/educated", "Portuguese social priority"),
                example("trabalhador/trabalhadora", "hardworking", "work ethic appreciation"),
                example("grande", "big/large", "size with cultural context"),
                example("pequeno/pequena", "small", "endearment potential"),
                example("elegante", "elegant", "understated Portuguese style"),
                example("generoso/generosa", "generous", "Portuguese hospitality value"),
                example("forte", "strong", "character appreciation")
              ],
              
              keyPoints: [
                "'Simpático' is the ultimate Portuguese personality compliment",
                "Gender agreement is mandatory and shows precision",
                "Portuguese people value social harmony over individual achievement",
                "Understated elegance is preferred over flashiness"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Adjective Gender Agreement",
                  "Portuguese adjectives must agree with gender and number of nouns.",
                  "homem alto, mulher alta, homens altos, mulheres altas"
                ),
                culturalRule(
                  "Portuguese 'Simpatia' Cultural Value",
                  "'Simpático' means socially pleasant, helpful, and genuinely likable - the most important Portuguese personality trait."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🎨", 
                  "Portuguese Aesthetic Values",
                  "Portuguese people value understated elegance, social harmony, and 'saudade' beauty over flashiness or extremes."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Adjectives Cultural Quick Reference", [
            cheatCategory("Essential Adjectives", [
              "bonito/bonita (beautiful)",
              "simpático/simpática (likable - top compliment)",
              "inteligente (intelligent)",
              "educado/educada (polite/educated)"
            ]),
            cheatCategory("Cultural Values", [
              "simpatia = social harmony priority",
              "elegância discreta = understated style",
              "educação = manners + learning"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Describe people with Portuguese cultural sensitivity",
            "Give appropriate compliments that resonate with Portuguese values",
            "Navigate social situations with culturally appropriate language"
          ], "Portuguese adjectives reveal cultural values about beauty and character. Master these descriptors, and Portuguese people will see you as culturally sophisticated.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "bonito", translation: "beautiful (masculine)" },
          { id: "e2", type: "flashcard", term: "simpático", translation: "likable" },
          { id: "e3", type: "flashcard", term: "inteligente", translation: "intelligent" },
          { id: "e4", type: "flashcard", term: "educado", translation: "polite/educated" },
          { id: "e5", type: "mcq", prompt: "What's the highest Portuguese personality compliment?", options: ["bonito", "inteligente", "simpático"], correct: "simpático" },
          { id: "e6", type: "typing", prompt: "Say 'She is very likable'", correct: "Ela é muito simpática" }
        ]
      }
    ]
  },

  // VOCAB4: Verbs & Portuguese Action Culture (Dense PPP)
  {
    id: "vocab4",
    title: "Verbs & Portuguese Action Culture (Dense PPP)",
    description: "Master Portuguese verbs with cultural context about Portuguese behavioral patterns, work culture, and social actions.",
    lessons: [
      {
        id: "vocab4l1",
        title: "Verbos & Cultura de Ação",
        xp: 65,
        content: {
          title: "Portuguese Verbs & Cultural Action Patterns",
          sections: [
            {
              title: "Essential Portuguese Action Verbs",
              explanation: "Portuguese verbs reflect cultural approaches to work, relationships, and daily life:",
              
              examples: [
                example("trabalhar", "to work", "Portuguese work ethic"),
                example("estudar", "to study", "education highly valued"),
                example("ajudar", "to help", "Portuguese hospitality"),
                example("falar", "to speak", "communication culture"),
                example("comer", "to eat", "social dining culture"),
                example("respeitar", "to respect", "fundamental value"),
                example("partilhar", "to share", "community spirit"),
                example("celebrar", "to celebrate", "festival culture"),
                example("viver", "to live", "Portuguese life philosophy"),
                example("amar", "to love", "emotional expression")
              ],
              
              keyPoints: [
                "Portuguese verbs emphasize social connection and community",
                "Work and education verbs show Portuguese values",
                "Collaborative actions are preferred over competitive ones",
                "Respect and hospitality are central to Portuguese behavior"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Portuguese Verb Conjugation Patterns", 
                  "Portuguese verbs follow three main patterns: -ar, -er, -ir endings.",
                  "trabalhar, comer, partir - different conjugation patterns"
                ),
                culturalRule(
                  "Portuguese Action Values",
                  "Portuguese culture emphasizes collaborative actions, respect for others, and social harmony over individual achievement."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Verbs Cultural Quick Reference", [
            cheatCategory("Essential Verbs", [
              "trabalhar (to work) - work ethic",
              "estudar (to study) - education value", 
              "ajudar (to help) - hospitality",
              "respeitar (to respect) - fundamental value"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Express actions and intentions in culturally appropriate ways",
            "Understand Portuguese behavioral values and priorities"
          ], "Portuguese verbs reveal cultural approaches to life, work, and relationships.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "trabalhar", translation: "to work" },
          { id: "e2", type: "flashcard", term: "ajudar", translation: "to help" },
          { id: "e3", type: "flashcard", term: "estudar", translation: "to study" },
          { id: "e4", type: "flashcard", term: "respeitar", translation: "to respect" },
          { id: "e5", type: "typing", prompt: "Say 'I work'", correct: "Eu trabalho" },
          { id: "e6", type: "typing", prompt: "Say 'to help'", correct: "ajudar" }
        ]
      }
    ]
  },

  // VOCAB5: Body & Portuguese Health Culture (Dense PPP)
  {
    id: "vocab5",
    title: "Body & Portuguese Health Culture (Dense PPP)",
    description: "Master Portuguese body vocabulary with cultural context about Portuguese health awareness, medical culture, and wellness traditions.",
    lessons: [
      {
        id: "vocab5l1",
        title: "Corpo & Cultura de Saúde",
        xp: 55,
        content: {
          title: "Portuguese Body & Health Cultural Awareness",
          sections: [
            {
              title: "Essential Portuguese Body Vocabulary",
              explanation: "Portuguese body vocabulary reflects cultural attitudes toward health, wellness, and medical care:",
              
              examples: [
                example("cabeça", "head", "intelligence and decision-making center"),
                example("olhos", "eyes", "windows to the soul in Portuguese culture"),
                example("boca", "mouth", "communication and taste appreciation"),
                example("mão", "hand", "work and skill ('mãos de ouro')"),
                example("coração", "heart", "emotional center and Portuguese passion"),
                example("estômago", "stomach", "Portuguese food culture connection"),
                example("pé", "foot", "Portuguese walking and travel culture"),
                example("braço", "arm", "strength and embrace ('abraço')"),
                example("perna", "leg", "mobility and Portuguese active lifestyle"),
                example("costas", "back", "Portuguese work ethic and support")
              ],
              
              keyPoints: [
                "Portuguese body terms often have metaphorical meanings",
                "Health consciousness is growing in Portuguese culture",
                "Portuguese people value physical wellness and active aging",
                "Traditional remedies are respected alongside modern medicine"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Health Traditions",
                  "Portuguese people combine traditional remedies with modern medicine, respecting both older wisdom and medical advances."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "❤️",
                  "Portuguese Emotional Health",
                  "Portuguese culture recognizes the connection between emotional and physical health, valuing 'saudade' and emotional expression."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Body Cultural Quick Reference", [
            cheatCategory("Body Parts", [
              "cabeça (head) - intelligence center",
              "olhos (eyes) - soul windows", 
              "mão (hand) - work and skill",
              "coração (heart) - emotional center"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Discuss health and wellness in Portuguese cultural context",
            "Navigate medical situations with appropriate vocabulary"
          ], "Body vocabulary connects to Portuguese health culture and wellness traditions.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "cabeça", translation: "head" },
          { id: "e2", type: "flashcard", term: "coração", translation: "heart" },
          { id: "e3", type: "flashcard", term: "mão", translation: "hand" },
          { id: "e4", type: "flashcard", term: "olhos", translation: "eyes" },
          { id: "e5", type: "typing", prompt: "Say 'my head'", correct: "a minha cabeça" }
        ]
      }
    ]
  },

  // VOCAB6: Time & Portuguese Calendar Culture (Dense PPP)
  {
    id: "vocab6",
    title: "Time & Portuguese Calendar Culture (Dense PPP)",
    description: "Master Portuguese time vocabulary with cultural context about Portuguese scheduling, holiday traditions, and temporal perspectives.",
    lessons: [
      {
        id: "vocab6l1",
        title: "Tempo & Tradições Calendárias",
        xp: 60,
        content: {
          title: "Portuguese Time & Cultural Calendar Mastery",
          sections: [
            {
              title: "Essential Portuguese Time Vocabulary",
              explanation: "Portuguese time concepts reflect cultural approaches to scheduling, punctuality, and life rhythm:",
              
              examples: [
                example("hoje", "today", "present focus in Portuguese culture"),
                example("amanhã", "tomorrow", "future planning and hope"),
                example("ontem", "yesterday", "Portuguese historical awareness"),
                example("semana", "week", "Portuguese work-life rhythm"),
                example("mês", "month", "Portuguese seasonal awareness"),
                example("ano", "year", "Portuguese long-term perspective"),
                example("hora", "hour", "Portuguese time consciousness"),
                example("minuto", "minute", "precision in Portuguese scheduling"),
                example("manhã", "morning", "Portuguese early start culture"),
                example("tarde", "afternoon", "Portuguese siesta and family time")
              ],
              
              keyPoints: [
                "Portuguese people have a relaxed but respectful approach to time",
                "Family time takes priority over strict scheduling",
                "Portuguese holidays and festivals shape the cultural calendar",
                "Work-life balance is increasingly important in Portugal"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Time Culture",
                  "Portuguese people value punctuality for formal events but allow flexibility for social gatherings and family time."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "⏰",
                  "Portuguese Scheduling Values",
                  "Portuguese culture prioritizes relationships and family time over rigid scheduling, creating a balanced approach to time management."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Time Cultural Quick Reference", [
            cheatCategory("Time Periods", [
              "hoje (today) - present focus",
              "amanhã (tomorrow) - future planning",
              "semana (week) - work-life rhythm",
              "mês (month) - seasonal awareness"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Navigate Portuguese scheduling and time expectations",
            "Understand Portuguese cultural approach to work-life balance"
          ], "Time vocabulary reflects Portuguese values about relationships, work, and life priorities.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "hoje", translation: "today" },
          { id: "e2", type: "flashcard", term: "amanhã", translation: "tomorrow" },
          { id: "e3", type: "flashcard", term: "semana", translation: "week" },
          { id: "e4", type: "flashcard", term: "mês", translation: "month" },
          { id: "e5", type: "typing", prompt: "Say 'today'", correct: "hoje" }
        ]
      }
    ]
  },

  // VOCAB7: House & Portuguese Domestic Culture (Dense PPP)
  {
    id: "vocab7",
    title: "House & Portuguese Domestic Culture (Dense PPP)",
    description: "Master Portuguese house vocabulary with cultural context about Portuguese home life, family spaces, and domestic traditions.",
    lessons: [
      {
        id: "vocab7l1",
        title: "Casa & Cultura Doméstica",
        xp: 65,
        content: {
          title: "Portuguese House & Domestic Cultural Mastery",
          sections: [
            {
              title: "Essential Portuguese House Vocabulary",
              explanation: "Portuguese house vocabulary reflects cultural values about family, hospitality, and the central role of the home in Portuguese life:",
              
              examples: [
                example("casa", "house", "center of Portuguese family life"),
                example("sala", "living room", "social gathering space"),
                example("cozinha", "kitchen", "heart of Portuguese home"),
                example("quarto", "bedroom", "private family space"),
                example("casa de banho", "bathroom", "Portuguese terminology"),
                example("jardim", "garden", "Portuguese outdoor living"),
                example("porta", "door", "Portuguese hospitality threshold"),
                example("janela", "window", "Portuguese light and air appreciation"),
                example("mesa", "table", "center of Portuguese family meals"),
                example("cadeira", "chair", "Portuguese furniture and comfort")
              ],
              
              keyPoints: [
                "Portuguese homes prioritize family gathering spaces",
                "The kitchen is the heart of Portuguese domestic life",
                "Portuguese people take pride in home hospitality",
                "Outdoor spaces are integrated into Portuguese home life"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Home Values",
                  "Portuguese homes are designed for family gatherings and hospitality, with communal spaces prioritized over individual privacy."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🏠",
                  "Portuguese Family Home Culture",
                  "Portuguese homes serve as multi-generational gathering spaces where family meals, celebrations, and daily life center around shared areas."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese House Cultural Quick Reference", [
            cheatCategory("House Parts", [
              "casa (house) - family center",
              "sala (living room) - social space",
              "cozinha (kitchen) - home heart",
              "jardim (garden) - outdoor living"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Navigate Portuguese homes and domestic situations",
            "Understand Portuguese family and hospitality culture"
          ], "House vocabulary connects to Portuguese values about family, hospitality, and home as the center of life.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "casa", translation: "house" },
          { id: "e2", type: "flashcard", term: "cozinha", translation: "kitchen" },
          { id: "e3", type: "flashcard", term: "sala", translation: "living room" },
          { id: "e4", type: "flashcard", term: "quarto", translation: "bedroom" },
          { id: "e5", type: "typing", prompt: "Say 'my house'", correct: "a minha casa" }
        ]
      }
    ]
  }
];

export default phaseBDenseModules; 