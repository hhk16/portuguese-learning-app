// 🎓 Physical Classes - Enhanced Professional Edition
// Designed with 40+ years of language pedagogy expertise
// Combining gamification, neuroscience, and immersive learning

import { Module, Lesson, Exercise } from './content';
import { EnhancedLessonContent } from './ppp-types';

// Helper functions for creating rich content
const createInteractiveExample = (pt: string, en: string, context: string, audioHint?: string) => ({
  portuguese: pt,
  english: en,
  literal: context,
  audioHint: audioHint || `Listen for the stress on: ${pt.split(' ')[0]}`
});

const createConversationPractice = (
  scenario: string,
  lines: Array<{ speaker: string; pt: string; en: string; tip?: string }>
) => ({
  scenario,
  conversation: lines,
  practiceMode: true
});

// Debug: Log the first exercise to verify pairs are present
const debugExercise = {
  id: 'cafe-vocab-1',
  type: 'matching' as const,
  prompt: '☕ Match the coffee types with their descriptions',
  correct: '',
  pairs: [
    { a: 'Bica', b: 'Espresso (Lisbon term)' },
    { a: 'Galão', b: 'Latte in tall glass' },
    { a: 'Meia de leite', b: 'Half coffee, half milk' },
    { a: 'Garoto', b: 'Espresso with dash of milk' },
    { a: 'Abatanado', b: 'Longer espresso' }
  ]
};
console.log('DEBUG physical-classes-enhanced - First matching exercise has pairs:', !!debugExercise.pairs, 'Length:', debugExercise.pairs?.length);

export const physicalClassesEnhancedModule: Module = {
  id: 'physical-enhanced',
  title: '🎯 Physical Classes - Interactive Edition',
  description: 'Your real-world Portuguese classes transformed into an immersive, gamified learning experience',
  lessons: [
    {
      id: 'physical1-enhanced',
      title: '☕ Café Culture: Tastes, Talk & Shopping',
      xp: 120,
      content: {
        title: '☕ Mastering Portuguese Café Culture',
        introduction: `🎯 Welcome to your immersive café experience! This lesson combines real-world Portuguese café culture with practical language skills. You'll master ordering, describing tastes, and social interactions that happen daily in Portuguese cafés.`,
        
        sections: [
          {
            title: '🎬 Scene Setting: You\'re in a Lisbon Café',
            content: `Imagine: The aroma of fresh pastéis de nata, the sound of espresso machines, locals reading their morning papers. This is where Portuguese life happens!`,
            
            examples: [
              createInteractiveExample(
                'Bom dia! O que vai ser hoje?',
                "Good morning! What will it be today?",
                "The classic café greeting - warm and expecting a regular order",
                "Notice the rising intonation on 'hoje'"
              ),
              createInteractiveExample(
                'O de sempre, por favor',
                "The usual, please",
                "What regulars say - builds rapport with staff"
              ),
              createInteractiveExample(
                'Queria um café e um pastel de nata',
                "I'd like a coffee and a custard tart",
                "Polite ordering - 'queria' is softer than 'quero'"
              )
            ],
            
            ruleBoxes: [
              {
                type: 'grammar',
                title: '🔑 The Magic of "Queria"',
                content: 'Using "queria" (I would like) instead of "quero" (I want) instantly makes you sound more polite and local. It\'s the conditional tense showing respect.',
                examples: [
                  'Queria ver o menu - I\'d like to see the menu',
                  'Queria pagar - I\'d like to pay',
                  'Queria mais um café - I\'d like another coffee'
                ]
              },
              {
                type: 'cultural',
                title: '☕ Coffee Types Decoded',
                content: 'Portuguese coffee culture is specific! Know your options:',
                examples: [
                  'Café/Bica - Espresso (Lisbon)',
                  'Cimbalino - Espresso (Porto)',
                  'Meia de leite - Half coffee, half milk',
                  'Galão - Latte in a tall glass',
                  'Garoto - Espresso with a dash of milk',
                  'Abatanado - Longer espresso (like Americano)'
                ]
              }
            ],
            
            culturalNotes: [
              {
                title: '💡 Insider Tip',
                content: 'Portuguese people often have their café standing at the counter (ao balcão) - it\'s cheaper and more social! Sitting at a table (na mesa) usually costs more.'
              }
            ],
            
            miniChecks: [
              {
                question: 'How would you politely ask for the bill?',
                answer: 'Queria a conta, por favor',
                explanation: 'Using "queria" + "por favor" shows perfect Portuguese politeness'
              }
            ]
          },
          
          {
            title: '👅 Describing Tastes & Preferences',
            content: 'Master the art of describing flavors and expressing your preferences like a true food lover!',
            
            examples: [
              createInteractiveExample(
                'Está delicioso!',
                "It's delicious!",
                "Universal compliment for food/drink"
              ),
              createInteractiveExample(
                'É demasiado doce para mim',
                "It's too sweet for me",
                "Politely expressing it's not to your taste"
              ),
              createInteractiveExample(
                'Tem um sabor único',
                "It has a unique flavor",
                "Diplomatic way to describe unusual tastes"
              ),
              createInteractiveExample(
                'Está no ponto!',
                "It's perfect!/Just right!",
                "Idiomatic expression for perfection"
              )
            ],
            
            ruleBoxes: [
              {
                type: 'grammar',
                title: '🎯 Taste Adjectives Agreement',
                content: 'Remember: adjectives must agree with gender!',
                examples: [
                  'O café está amargo - The coffee is bitter (masculine)',
                  'A sopa está salgada - The soup is salty (feminine)',
                  'Os pastéis estão frescos - The pastries are fresh (plural masc.)',
                  'As bolachas estão crocantes - The cookies are crunchy (plural fem.)'
                ]
              }
            ],
            
            contrastPairs: [
              {
                portuguese: 'doce',
                english: 'sweet',
                versus: 'amargo',
                versusEnglish: 'bitter',
                tip: 'Think: doce = dulce (Spanish) = sweet'
              },
              {
                portuguese: 'quente',
                english: 'hot',
                versus: 'frio',
                versusEnglish: 'cold',
                tip: 'Temperature, not spiciness!'
              },
              {
                portuguese: 'picante',
                english: 'spicy',
                versus: 'suave',
                versusEnglish: 'mild',
                tip: 'Picante = spicy hot (not temperature)'
              }
            ],
            
            pitfalls: [
              {
                issue: 'Saying "Eu sou quente" (I am hot = I\'m sexy)',
                correct: 'Estou com calor (I\'m feeling hot/warm)',
                explanation: 'Use ESTAR com calor for temperature, not SER quente!'
              }
            ]
          },
          
          {
            title: '🛍️ Shopping in the Café',
            content: 'Many Portuguese cafés also sell items. Learn to shop for pastries, sandwiches, and local products!',
            
            examples: [
              createInteractiveExample(
                'Quanto custa este bolo?',
                "How much is this cake?",
                "Pointing at items in the display case"
              ),
              createInteractiveExample(
                'Pode-me dar dois croissants?',
                "Can you give me two croissants?",
                "Polite request using 'pode-me'"
              ),
              createInteractiveExample(
                'Tem pão sem glúten?',
                "Do you have gluten-free bread?",
                "Asking about dietary options"
              ),
              createInteractiveExample(
                'Levo meia dúzia de pastéis',
                "I'll take half a dozen pastries",
                "'Levo' = I'll take (informal, friendly)"
              )
            ],
            
            ruleBoxes: [
              {
                type: 'grammar',
                title: '💰 Numbers in Shopping',
                content: 'Portuguese numbers change with gender when talking about price!',
                examples: [
                  'Dois euros - Two euros',
                  'Duas garrafas - Two bottles (feminine)',
                  'Trezentos gramas - Three hundred grams',
                  'Trezentas gramas - (also acceptable)',
                  'Meia dúzia - Half dozen (always feminine)'
                ]
              }
            ],
            
            cheatSheet: {
              title: '🛒 Shopping Phrases Toolkit',
              items: [
                'Quanto é? - How much?',
                'Quanto custa? - How much does it cost?',
                'Tem troco? - Do you have change?',
                'Pode fazer um desconto? - Can you give a discount?',
                'Aceita cartão? - Do you accept card?',
                'Fico com este - I\'ll take this one',
                'É para levar - It\'s to go',
                'É para comer aqui - It\'s to eat here'
              ]
            }
          },
          
          {
            title: '💬 Real Conversations: Putting It Together',
            content: 'Practice complete café interactions with these real-world dialogues!',
            
            conversationPractice: createConversationPractice(
              'Complete Café Visit',
              [
                {
                  speaker: 'Empregado',
                  pt: 'Boa tarde! Seja bem-vindo!',
                  en: 'Good afternoon! Welcome!',
                  tip: 'Standard greeting after 12pm'
                },
                {
                  speaker: 'You',
                  pt: 'Boa tarde! Mesa para um, por favor',
                  en: 'Good afternoon! Table for one, please',
                  tip: 'Specify number clearly'
                },
                {
                  speaker: 'Empregado',
                  pt: 'Claro! Pode sentar-se ali. Já sabe o que vai querer?',
                  en: 'Of course! You can sit there. Do you know what you\'ll want?',
                  tip: 'They often ask immediately'
                },
                {
                  speaker: 'You',
                  pt: 'Ainda não. Pode-me dar o menu?',
                  en: 'Not yet. Can you give me the menu?',
                  tip: 'Ainda não = not yet (very useful!)'
                },
                {
                  speaker: 'Empregado',
                  pt: 'Com certeza. Recomendo o pastel de nata, é especialidade da casa',
                  en: 'Certainly. I recommend the custard tart, it\'s the house specialty',
                  tip: 'Listen for recommendations'
                },
                {
                  speaker: 'You',
                  pt: 'Ótimo! Queria um galão e dois pastéis de nata, por favor',
                  en: 'Great! I\'d like a latte and two custard tarts, please',
                  tip: 'Ordering with queria + por favor'
                },
                {
                  speaker: 'Empregado',
                  pt: 'Muito bem. Já lhe trago',
                  en: 'Very well. I\'ll bring it right away',
                  tip: 'Já = right away/already'
                }
              ]
            )
          },
          
          {
            title: '🎮 Gamification Zone: Level Up Your Café Skills!',
            content: 'Complete these challenges to become a Café Master!',
            
            challenges: [
              {
                level: 'Bronze',
                task: 'Order a simple coffee and pastry',
                phrase: 'Queria um café e um pastel de nata',
                points: 10
              },
              {
                level: 'Silver',
                task: 'Ask about ingredients due to allergy',
                phrase: 'Este bolo tem nozes? Sou alérgico',
                points: 20
              },
              {
                level: 'Gold',
                task: 'Complain politely about cold coffee',
                phrase: 'Desculpe, mas o café está frio. Pode aquecer?',
                points: 30
              },
              {
                level: 'Platinum',
                task: 'Have a full conversation about local pastry traditions',
                phrase: 'Qual é a história dos pastéis de Belém? São diferentes dos pastéis de nata?',
                points: 50
              }
            ]
          }
        ],
        
        whyItMatters: {
          realWorld: 'Café culture is CENTRAL to Portuguese life. Master this, and you\'ll have natural daily interactions, make local friends, and experience Portugal authentically. Every Portuguese person visits a café regularly - it\'s where business deals happen, friends catch up, and life unfolds!',
          linguisticInsight: 'This lesson covers high-frequency vocabulary you\'ll use EVERY DAY in Portugal. The polite forms (queria, pode-me) will make natives treat you as an educated speaker, not a tourist.',
          culturalConnection: 'Understanding café etiquette opens doors. Portuguese people judge cultural awareness by how you behave in a café - nail this, and you\'re "one of us"!'
        }
      } as any as EnhancedLessonContent,
      
      exercises: [
        // Warm-up: Coffee Vocabulary
        (() => {
          const exercise = {
            id: 'cafe-vocab-1',
            type: 'matching' as const,
            prompt: '☕ Match the coffee types with their descriptions',
            correct: '', // Required field for type checking
            pairs: [
              { a: 'Bica', b: 'Espresso (Lisbon term)' },
              { a: 'Galão', b: 'Latte in tall glass' },
              { a: 'Meia de leite', b: 'Half coffee, half milk' },
              { a: 'Garoto', b: 'Espresso with dash of milk' },
              { a: 'Abatanado', b: 'Longer espresso' }
            ]
          } as Exercise;
          console.log('DEBUG: cafe-vocab-1 exercise created with pairs:', !!exercise.pairs, 'Length:', exercise.pairs?.length);
          return exercise;
        })(),
        
        // Politeness Practice
        {
          id: 'cafe-polite-1',
          type: 'mcq',
          prompt: '🎯 Which is the MOST polite way to order?',
          options: [
            'Quero um café',
            'Dá-me um café',
            'Queria um café, por favor',
            'Um café!'
          ],
          correct: 'Queria um café, por favor'
        },
        
        // Taste Description
        {
          id: 'cafe-taste-1',
          type: 'typing',
          prompt: '👅 Type in Portuguese: "The coffee is too bitter for me"',
          correct: 'O café está demasiado amargo para mim'
        },
        
        // Real Situation
        {
          id: 'cafe-situation-1',
          type: 'mcq',
          prompt: '💬 The waiter asks "Vai querer mais alguma coisa?" (Want anything else?). You\'re done. What do you say?',
          options: [
            'Não',
            'Não, obrigado. A conta, por favor',
            'Acabei',
            'Chega'
          ],
          correct: 'Não, obrigado. A conta, por favor'
        },
        
        // Order Building
        {
          id: 'cafe-order-1',
          type: 'order',
          prompt: '🛍️ Put the shopping phrase in correct order',
          correct: 'Pode-me dar meia dúzia de pastéis'
        },
        
        // Cultural Understanding
        {
          id: 'cafe-culture-1',
          type: 'mcq',
          prompt: '🇵🇹 Where is it typically cheaper to have coffee in Portugal?',
          options: [
            'Na mesa (at the table)',
            'Ao balcão (at the counter)',
            'Na esplanada (on the terrace)',
            'Same price everywhere'
          ],
          correct: 'Ao balcão (at the counter)'
        },
        
        // Complaint Practice
        {
          id: 'cafe-complaint-1',
          type: 'typing',
          prompt: '😅 Politely say: "Excuse me, this isn\'t what I ordered"',
          correct: 'Desculpe, isto não é o que eu pedi'
        },
        
        // Numbers in Context
        {
          id: 'cafe-numbers-1',
          type: 'mcq',
          prompt: '💰 How do you say "Two euros fifty"?',
          options: [
            'Dois euros cinco zero',
            'Dois euros e cinquenta',
            'Dois cinquenta',
            'Dois e meio euros'
          ],
          correct: 'Dois euros e cinquenta'
        },
        
        // Dietary Needs
        {
          id: 'cafe-dietary-1',
          type: 'typing',
          prompt: '🥜 Ask: "Does this have nuts? I\'m allergic"',
          correct: 'Isto tem nozes? Sou alérgico'
        },
        
        // Conversation Flow
        {
          id: 'cafe-convo-1',
          type: 'mcq',
          prompt: '💬 The waiter says "Já escolheu?" (Have you chosen?). You need more time:',
          options: [
            'Não',
            'Espera',
            'Ainda não, preciso de mais um minuto',
            'Depois'
          ],
          correct: 'Ainda não, preciso de mais um minuto'
        },
        
        // Compliment Practice
        {
          id: 'cafe-compliment-1',
          type: 'typing',
          prompt: '😋 Say: "This is delicious! What\'s the recipe?"',
          correct: 'Isto está delicioso! Qual é a receita?'
        },
        
        // Payment
        {
          id: 'cafe-payment-1',
          type: 'mcq',
          prompt: '💳 How do you ask if they accept card payment?',
          options: [
            'Tem cartão?',
            'Aceita cartão?',
            'Pode cartão?',
            'Usa cartão?'
          ],
          correct: 'Aceita cartão?'
        },
        
        // Advanced: Regional Differences
        {
          id: 'cafe-regional-1',
          type: 'mcq',
          prompt: '🗺️ In Porto, what do they call an espresso?',
          options: [
            'Bica',
            'Cimbalino',
            'Café',
            'Curto'
          ],
          correct: 'Cimbalino'
        },
        
        // Listening Comprehension
        {
          id: 'cafe-listen-1',
          type: 'listening',
          prompt: '👂 Type what you hear (café order)',
          correct: 'Queria um galão e dois pastéis de nata'
        },
        
        // Final Challenge
        {
          id: 'cafe-master-1',
          type: 'typing',
          prompt: '🏆 MASTER CHALLENGE: Say "I\'d like a table for two on the terrace, please"',
          correct: 'Queria uma mesa para dois na esplanada, por favor'
        }
      ]
    },
    
    {
      id: 'physical2-enhanced',
      title: '🏃 Daily Routines & Reflexive Mastery',
      xp: 100,
      content: {
        title: '🌅 Master Your Daily Routine in Portuguese',
        introduction: `Transform how you talk about daily life! This lesson unlocks the secret of reflexive verbs - the key to sounding natural when discussing routines, habits, and personal activities.`,
        
        sections: [
          {
            title: '🔄 The Reflexive Revolution',
            content: 'Reflexive verbs are EVERYWHERE in Portuguese daily speech. Master these, and you\'ll sound instantly more fluent!',
            
            examples: [
              createInteractiveExample(
                'Eu levanto-me às sete',
                'I get up at seven',
                'Literally: I lift myself at seven',
                'Note: -me attached to verb'
              ),
              createInteractiveExample(
                'Como te chamas?',
                'What\'s your name?',
                'Literally: How do you call yourself?'
              ),
              createInteractiveExample(
                'Ele deita-se tarde',
                'He goes to bed late',
                'Literally: He lays himself late'
              )
            ],
            
            ruleBoxes: [
              {
                type: 'grammar',
                title: '🎯 Reflexive Pronoun Placement Rules',
                content: 'Where you put the pronoun changes the feel of your Portuguese!',
                examples: [
                  'Levanto-me (normal) - I get up',
                  'Eu me levanto (Brazilian) - I get up',
                  'Não me levanto (with negative) - I don\'t get up',
                  'Vou-me levantar (future) - I\'m going to get up',
                  'Vou levantar-me (alternative) - I\'m going to get up'
                ]
              },
              {
                type: 'grammar',
                title: '⚡ Quick Conjugation Pattern',
                content: 'Reflexive pronouns by person:',
                examples: [
                  'eu → me (levanto-me)',
                  'tu → te (levantas-te)',
                  'ele/ela → se (levanta-se)',
                  'nós → nos (levantamo-nos)',
                  'vocês → se (levantam-se)'
                ]
              }
            ],
            
            pitfalls: [
              {
                issue: 'Forgetting the pronoun: "Eu levanto às 7"',
                correct: 'Eu levanto-me às 7',
                explanation: 'Without -me, levantar means "to lift" not "to get up"!'
              }
            ]
          },
          
          {
            title: '⏰ Time & Frequency Masters',
            content: 'Express when and how often with Portuguese precision!',
            
            examples: [
              createInteractiveExample(
                'Sempre me esqueço das chaves',
                'I always forget my keys',
                'Sempre before verb = emphasis'
              ),
              createInteractiveExample(
                'Raramente me deito antes da meia-noite',
                'I rarely go to bed before midnight',
                'Formal/written style'
              ),
              createInteractiveExample(
                'Às vezes acordo-me durante a noite',
                'Sometimes I wake up during the night',
                'Às vezes = sometimes (literally: at times)'
              )
            ],
            
            cheatSheet: {
              title: '📊 Frequency Scale',
              items: [
                'sempre - always (100%)',
                'quase sempre - almost always (90%)',
                'frequentemente - frequently (75%)',
                'às vezes - sometimes (50%)',
                'raramente - rarely (25%)',
                'quase nunca - almost never (10%)',
                'nunca - never (0%)'
              ]
            }
          },
          
          {
            title: '🎬 A Day in the Life: Complete Routine',
            content: 'Follow João through his typical Portuguese day!',
            examples: [], // Empty examples array for safety
            
            storyMode: {
              title: 'João\'s Tuesday',
              segments: [
                {
                  time: '07:00',
                  pt: 'O João acorda-se com o despertador',
                  en: 'João wakes up with the alarm',
                  vocab: ['acordar-se - to wake up', 'despertador - alarm clock']
                },
                {
                  time: '07:15',
                  pt: 'Levanta-se e vai para a casa de banho',
                  en: 'He gets up and goes to the bathroom',
                  vocab: ['casa de banho - bathroom (PT)', 'banheiro - bathroom (BR)']
                },
                {
                  time: '07:30',
                  pt: 'Toma um duche rápido e veste-se',
                  en: 'He takes a quick shower and gets dressed',
                  vocab: ['tomar duche - to shower', 'vestir-se - to get dressed']
                },
                {
                  time: '08:00',
                  pt: 'Toma o pequeno-almoço e lê as notícias',
                  en: 'He has breakfast and reads the news',
                  vocab: ['pequeno-almoço - breakfast', 'notícias - news']
                },
                {
                  time: '08:30',
                  pt: 'Sai de casa e apanha o metro',
                  en: 'He leaves home and catches the metro',
                  vocab: ['sair de casa - to leave home', 'apanhar - to catch (transport)']
                }
              ]
            }
          }
        ],
        
        whyItMatters: {
          realWorld: 'Every conversation about daily life uses these structures. From making plans with friends to explaining your schedule at work, this is essential daily Portuguese!',
          linguisticInsight: 'Reflexive verbs are the gateway to natural Portuguese. They\'re used 10x more than in English, making your speech flow authentically.',
          culturalConnection: 'Portuguese culture values routine and rhythm of life. Being able to discuss daily patterns helps you connect on a personal level.'
        }
      } as any as EnhancedLessonContent,
      
      exercises: [
        {
          id: 'routine-reflex-1',
          type: 'mcq',
          prompt: '🔄 Choose the correct reflexive form for "I wake up"',
          options: ['acordo', 'acordo-me', 'me acordo', 'acordar-me'],
          correct: 'acordo-me'
        },
        {
          id: 'routine-time-1',
          type: 'typing',
          prompt: '⏰ Say: "She always wakes up at 6:30"',
          correct: 'Ela acorda-se sempre às seis e meia'
        },
        {
          id: 'routine-freq-1',
          type: 'order',
          prompt: '📊 Order: "I never go to bed before eleven"',
          correct: 'Nunca me deito antes das onze'
        },
        {
          id: 'routine-negative-1',
          type: 'mcq',
          prompt: '❌ Where does the reflexive go with "não"?',
          options: [
            'Não levanto-me cedo',
            'Não me levanto cedo',
            'Me não levanto cedo',
            'Levanto-me não cedo'
          ],
          correct: 'Não me levanto cedo'
        },
        {
          id: 'routine-daily-1',
          type: 'typing',
          prompt: '🚿 Type: "He showers every morning"',
          correct: 'Ele toma duche todas as manhãs'
        },
        {
          id: 'routine-sequence-1',
          type: 'order',
          prompt: '📝 Order: "First I get up, then I have breakfast"',
          correct: 'Primeiro levanto-me, depois tomo o pequeno-almoço'
        },
        {
          id: 'routine-habit-1',
          type: 'typing',
          prompt: '🔄 Say: "We always brush our teeth after eating"',
          correct: 'Lavamos sempre os dentes depois de comer'
        },
        {
          id: 'routine-weekend-1',
          type: 'mcq',
          prompt: '🌅 "On weekends I wake up late" - Choose the best translation:',
          options: [
            'Aos fins de semana acordo-me tarde',
            'No fim de semana me acordo tarde',
            'Fins de semana acordo tarde-me',
            'Ao fim de semana acordar-me tarde'
          ],
          correct: 'Aos fins de semana acordo-me tarde'
        }
      ]
    },
    
    {
      id: 'physical3-enhanced',
      title: '🎭 Emotions, Preferences & Opinions',
      xp: 90,
      content: {
        title: '💭 Express Yourself: Emotions & Opinions in Portuguese',
        introduction: 'Master the art of expressing feelings, preferences, and opinions. This is where your Portuguese becomes personal and authentic!',
        
        sections: [
          {
            title: '❤️ The GOSTAR Formula',
            content: 'Gostar (to like) is your gateway to expressing preferences. But it works differently than English "like"!',
            
            examples: [
              createInteractiveExample(
                'Gosto de café',
                'I like coffee',
                'Always use DE after gostar!',
                'Never say just "Gosto café"'
              ),
              createInteractiveExample(
                'Ela gosta muito de ler',
                'She really likes reading',
                'muito = really/a lot'
              ),
              createInteractiveExample(
                'Não gostamos de acordar cedo',
                'We don\'t like waking up early',
                'Negative + DE + infinitive'
              )
            ],
            
            ruleBoxes: [
              {
                type: 'grammar',
                title: '⚡ GOSTAR + DE: The Unbreakable Rule',
                content: 'ALWAYS use "de" after gostar, no exceptions!',
                examples: [
                  'Gosto de ti - I like you',
                  'Gosto de música - I like music',
                  'Gosto de fazer isto - I like doing this',
                  'Gostaria de café - I would like coffee'
                ]
              }
            ],
            
            pitfalls: [
              {
                issue: 'Gosto café ❌',
                correct: 'Gosto de café ✓',
                explanation: 'Never forget the DE!'
              },
              {
                issue: 'Gosto-te ❌',
                correct: 'Gosto de ti ✓',
                explanation: 'Even with pronouns, use DE!'
              }
            ]
          },
          
          {
            title: '😊 Emotional Intelligence',
            content: 'Express your feelings with Portuguese flair!',
            
            examples: [
              createInteractiveExample(
                'Estou feliz',
                'I am happy',
                'Temporary state = ESTAR'
              ),
              createInteractiveExample(
                'Sou uma pessoa alegre',
                'I am a cheerful person',
                'Personality trait = SER'
              ),
              createInteractiveExample(
                'Fico nervoso antes de exames',
                'I get nervous before exams',
                'FICAR = to become/get'
              )
            ],
            
            emotionScale: {
              title: '📊 Emotion Intensity Scale',
              levels: [
                'um pouco - a little',
                'bastante - quite',
                'muito - very',
                'super - super',
                'extremamente - extremely',
                'completamente - completely'
              ]
            }
          },
          
          {
            title: '💬 Opinion Champions',
            content: 'Share your thoughts like a native!',
            
            examples: [
              createInteractiveExample(
                'Acho que vai chover',
                'I think it\'s going to rain',
                'ACHO QUE = I think that'
              ),
              createInteractiveExample(
                'Na minha opinião, é caro',
                'In my opinion, it\'s expensive',
                'Formal opinion giving'
              ),
              createInteractiveExample(
                'Concordo contigo',
                'I agree with you',
                'Concordar COM = agree with'
              )
            ],
            
            cheatSheet: {
              title: '🗣️ Opinion Starters',
              items: [
                'Acho que... - I think that...',
                'Penso que... - I think that... (formal)',
                'Acredito que... - I believe that...',
                'Para mim... - For me...',
                'Concordo - I agree',
                'Discordo - I disagree',
                'Tens razão - You\'re right',
                'Talvez - Maybe',
                'Sem dúvida - Without a doubt'
              ]
            }
          }
        ],
        
        whyItMatters: {
          realWorld: 'This is how you make friends! Expressing preferences and emotions creates genuine connections with Portuguese speakers.',
          linguisticInsight: 'The gostar+de structure appears in many verbs (precisar de, lembrar-se de), mastering it unlocks a whole verb family!',
          culturalConnection: 'Portuguese people value emotional expression. Being able to share feelings appropriately deepens relationships.'
        }
      } as any as EnhancedLessonContent,
      
      exercises: [
        {
          id: 'emotion-gostar-1',
          type: 'mcq',
          prompt: '❤️ Complete: "I like chocolate"',
          options: ['Gosto chocolate', 'Gosto de chocolate', 'Gosto o chocolate', 'Me gosto chocolate'],
          correct: 'Gosto de chocolate'
        },
        {
          id: 'emotion-feel-1',
          type: 'typing',
          prompt: '😊 Say: "I\'m very happy today"',
          correct: 'Estou muito feliz hoje'
        },
        {
          id: 'emotion-opinion-1',
          type: 'order',
          prompt: '💭 Order: "I think Portuguese is beautiful"',
          correct: 'Acho que o português é bonito'
        },
        {
          id: 'emotion-prefer-1',
          type: 'typing',
          prompt: '☕ Type: "I prefer tea to coffee"',
          correct: 'Prefiro chá a café'
        },
        {
          id: 'emotion-agree-1',
          type: 'mcq',
          prompt: '✓ How do you say "I completely agree"?',
          options: [
            'Concordo completo',
            'Concordo completamente',
            'Completo concordo',
            'Estou concordo completo'
          ],
          correct: 'Concordo completamente'
        },
        {
          id: 'emotion-love-1',
          type: 'typing',
          prompt: '❤️ Say: "She loves to dance"',
          correct: 'Ela adora dançar'
        },
        {
          id: 'emotion-become-1',
          type: 'mcq',
          prompt: '😰 "I get sad when it rains" - Best translation?',
          options: [
            'Estou triste quando chove',
            'Sou triste quando chove',
            'Fico triste quando chove',
            'Faço triste quando chove'
          ],
          correct: 'Fico triste quando chove'
        },
        {
          id: 'emotion-intensity-1',
          type: 'typing',
          prompt: '🔥 Say: "This is extremely interesting!"',
          correct: 'Isto é extremamente interessante!'
        }
      ]
    },
    
    {
      id: 'physical4-enhanced',
      title: '📅 Habits, Phone Talk & Essential Verbs',
      xp: 110,
      content: {
        title: '🎯 Master Daily Habits, Communication & Movement Verbs',
        introduction: `Transform how you talk about habits, make phone calls, and use essential verbs like a native! This lesson unlocks the patterns Portuguese speakers use every day for routines, communication, and expressing needs.`,
        
        sections: [
          {
            title: '📅 Days & Habits: The Article System',
            content: 'Portuguese has a brilliant system for distinguishing habits from one-time events. Master this, and you\'ll never confuse them again!',
            
            examples: [
              createInteractiveExample(
                'Às segundas vou ao ginásio',
                'On Mondays I go to the gym',
                'HABIT: Às + plural = every week',
                'Notice: às segundas = every Monday'
              ),
              createInteractiveExample(
                'Na segunda tenho consulta',
                'On Monday I have an appointment',
                'ONE-TIME: Na/No + singular = specific day',
                'Notice: na segunda = this/that Monday'
              ),
              createInteractiveExample(
                'Ao fim de semana durmo mais',
                'On weekends I sleep more',
                'HABIT: ao = every weekend'
              ),
              createInteractiveExample(
                'No fim de semana vou ao Porto',
                'This weekend I\'m going to Porto',
                'ONE-TIME: no = this specific weekend'
              )
            ],
            
            ruleBoxes: [
              {
                type: 'grammar',
                title: '🔑 The Golden Rule of Habits vs One-Time',
                content: 'Às + plural days = habitual. Na/No + singular = specific occurrence.',
                examples: [
                  'Às terças = every Tuesday (habit)',
                  'Na terça = this/that Tuesday (specific)',
                  'Às sextas à noite = Friday nights (habit)',
                  'Na sexta à noite = Friday night (specific)'
                ]
              }
            ],
            
            miniChecks: [
              {
                question: 'How do you say "I work on Saturdays" (every Saturday)?',
                answer: 'Trabalho aos sábados',
                explanation: 'Use "aos" for habitual Saturday work'
              }
            ]
          },
          
          {
            title: '📞 Phone Communication Mastery',
            content: 'Portuguese has specific verbs for phone communication. Choose wrong, and you might "summon" someone instead of calling them!',
            
            examples: [
              createInteractiveExample(
                'Vou ligar para a minha mãe',
                'I\'m going to call my mother',
                'LIGAR PARA = most common for phone calls'
              ),
              createInteractiveExample(
                'Telefonei à Ana ontem',
                'I phoned Ana yesterday',
                'TELEFONAR A = slightly formal but common',
                'Note: uses indirect object (à)'
              ),
              createInteractiveExample(
                'Chama o empregado, por favor',
                'Call the waiter over, please',
                'CHAMAR = summon/call someone over',
                'NOT for phone calls!'
              ),
              createInteractiveExample(
                'Manda-me uma mensagem',
                'Send me a message',
                'MANDAR = send (text/WhatsApp)'
              )
            ],
            
            pitfalls: [
              {
                issue: 'Using "chamar" for phone calls',
                correct: 'Use "ligar para" or "telefonar a"',
                explanation: 'Chamar means to summon or call someone\'s name, not phone them!'
              }
            ],
            
            cheatSheet: {
              title: '📱 Phone Verb Quick Reference',
              items: [
                'ligar para + person/number = call (most common)',
                'telefonar a + person = phone (formal-ish)',
                'atender = answer the phone',
                'desligar = hang up',
                'mandar mensagem = send a text',
                'deixar recado = leave a message'
              ]
            }
          },
          
          {
            title: '➡️ Levar vs Trazer: Direction Matters!',
            content: 'These verbs are about movement direction relative to the speaker. Think arrows!',
            
            examples: [
              createInteractiveExample(
                'Vou levar o computador para o escritório',
                'I\'ll take the computer to the office',
                'LEVAR = away from current position → OUT'
              ),
              createInteractiveExample(
                'Podes trazer café para aqui?',
                'Can you bring coffee here?',
                'TRAZER = toward speaker/listener → IN'
              ),
              createInteractiveExample(
                'Leva isto contigo',
                'Take this with you',
                'Taking something as you leave'
              ),
              createInteractiveExample(
                'Traz o vinho quando vieres',
                'Bring the wine when you come',
                'Bringing something when arriving'
              )
            ],
            
            contrastPairs: [
              {
                portuguese: 'levar',
                english: 'take (away)',
                versus: 'trazer',
                versusEnglish: 'bring (here)',
                tip: 'Arrow OUT vs Arrow IN'
              }
            ],
            
            miniChecks: [
              {
                question: 'Your friend is at your house. You ask them to ___ water from the kitchen.',
                answer: 'trazer',
                explanation: 'They\'re bringing it TO where you are'
              }
            ]
          },
          
          {
            title: '💤 Sleep Verbs: Deitar-se vs Dormir',
            content: 'Don\'t confuse going to bed with actually sleeping!',
            
            examples: [
              createInteractiveExample(
                'Deito-me à meia-noite',
                'I go to bed at midnight',
                'DEITAR-SE = the action of lying down'
              ),
              createInteractiveExample(
                'Durmo oito horas por noite',
                'I sleep eight hours per night',
                'DORMIR = actually sleeping'
              ),
              createInteractiveExample(
                'Ele deita-se mas não dorme',
                'He goes to bed but doesn\'t sleep',
                'Shows the difference clearly!'
              )
            ],
            
            ruleBoxes: [
              {
                type: 'grammar',
                title: '🛏️ Conjugation Patterns',
                content: 'Dormir changes o→u in eu form. Deitar-se needs reflexive pronouns.',
                examples: [
                  'eu durmo, tu dormes, ele dorme',
                  'eu deito-me, tu deitas-te, ele deita-se',
                  'nós dormimos, vocês dormem',
                  'nós deitamo-nos, vocês deitam-se'
                ]
              }
            ]
          },
          
          {
            title: '🧠 Saber vs Conhecer: Knowledge Types',
            content: 'Portuguese distinguishes between knowing facts/skills and being familiar with people/places.',
            
            examples: [
              createInteractiveExample(
                'Sei onde fica a praia',
                'I know where the beach is',
                'SABER = facts, information, how-to'
              ),
              createInteractiveExample(
                'Conheço bem Lisboa',
                'I know Lisbon well',
                'CONHECER = familiarity with places/people'
              ),
              createInteractiveExample(
                'Sabes falar árabe?',
                'Do you know how to speak Arabic?',
                'SABER + infinitive = know how to'
              ),
              createInteractiveExample(
                'Conheces o meu marido?',
                'Do you know my husband?',
                'CONHECER + person = be acquainted'
              )
            ],
            
            contrastPairs: [
              {
                portuguese: 'Sei a resposta',
                english: 'I know the answer',
                versus: 'Conheço a Maria',
                versusEnglish: 'I know Maria',
                tip: 'Facts vs Familiarity'
              }
            ],
            
            miniChecks: [
              {
                question: 'Which verb for "I know how to drive"?',
                answer: 'Sei conduzir',
                explanation: 'Saber for skills and abilities'
              }
            ]
          },
          
          {
            title: '⚡ Precisar de: The Need Pattern',
            content: 'Unlike English, Portuguese "need" ALWAYS requires "de" before nouns or verbs!',
            
            examples: [
              createInteractiveExample(
                'Preciso de tempo',
                'I need time',
                'Always DE before nouns'
              ),
              createInteractiveExample(
                'Precisamos de estudar mais',
                'We need to study more',
                'Always DE before infinitives'
              ),
              createInteractiveExample(
                'Ela não precisa de ajuda',
                'She doesn\'t need help',
                'Even in negatives, keep DE'
              )
            ],
            
            pitfalls: [
              {
                issue: 'Preciso tempo ❌',
                correct: 'Preciso DE tempo ✅',
                explanation: 'Never drop the DE - it\'s not optional!'
              }
            ]
          },
          
          {
            title: '⏰ Time Expressions & Approximations',
            content: 'Master these patterns for natural time talk.',
            
            examples: [
              createInteractiveExample(
                'Por volta das nove',
                'Around nine o\'clock',
                'POR VOLTA DE = approximately'
              ),
              createInteractiveExample(
                'Entre as duas e as cinco',
                'Between two and five',
                'ENTRE X E Y = time ranges'
              ),
              createInteractiveExample(
                'Começa a trabalhar às nove',
                'Starts working at nine',
                'COMEÇAR A + infinitive'
              ),
              createInteractiveExample(
                'Quase sempre chego tarde',
                'I almost always arrive late',
                'QUASE = almost (very useful!)'
              )
            ],
            
            cheatSheet: {
              title: '🕐 Time Expression Toolkit',
              items: [
                'às nove = at nine',
                'por volta de = around/about',
                'entre X e Y = between X and Y',
                'antes de = before',
                'depois de = after',
                'durante = during',
                'até = until',
                'desde = since'
              ]
            }
          },
          
          {
            title: '🗣️ Real Conversations: Daily Life',
            content: 'Practice these natural dialogues that combine all the patterns!',
            
            conversationPractice: createConversationPractice(
              'Making Weekend Plans',
              [
                {
                  speaker: 'Ana',
                  pt: 'O que costumas fazer ao fim de semana?',
                  en: 'What do you usually do on weekends?',
                  tip: 'Costumar = usually do (habit verb)'
                },
                {
                  speaker: 'You',
                  pt: 'Às sextas à noite, costumo jantar fora',
                  en: 'On Friday nights, I usually eat out',
                  tip: 'Às sextas = every Friday (habit)'
                },
                {
                  speaker: 'Ana',
                  pt: 'E no sábado?',
                  en: 'And on Saturday?',
                  tip: 'No sábado = this Saturday (specific)'
                },
                {
                  speaker: 'You',
                  pt: 'No sábado vou dançar. Queres vir?',
                  en: 'On Saturday I\'m going dancing. Want to come?',
                  tip: 'Specific plan + invitation'
                },
                {
                  speaker: 'Ana',
                  pt: 'Boa! A que horas?',
                  en: 'Great! What time?',
                  tip: 'A que horas = at what time'
                },
                {
                  speaker: 'You',
                  pt: 'Por volta das dez. Ligo-te antes',
                  en: 'Around ten. I\'ll call you before',
                  tip: 'Por volta de = approximately'
                }
              ]
            )
          },
          
          {
            title: '🎯 Common Mistakes to Avoid',
            content: 'Lock in the correct forms!',
            
            pitfalls: [
              {
                issue: 'arredores (not alrededores)',
                correct: 'Vivo nos arredores de Lisboa',
                explanation: 'Alrededores is Spanish! Portuguese uses arredores.'
              },
              {
                issue: 'crianças (not criançar)',
                correct: 'As crianças brincam',
                explanation: 'Crianças = children. There\'s no verb criançar!'
              },
              {
                issue: 'Itália needs an accent',
                correct: 'Vivo no norte de Itália',
                explanation: 'Countries ending in -ia usually have an accent'
              }
            ]
          }
        ],
        
        whyItMatters: {
          realWorld: 'These patterns appear in EVERY conversation about daily life, making plans, and staying connected. Master these, and you can navigate Portuguese social life!',
          linguisticInsight: 'The habit vs one-time distinction (às/no) is uniquely systematic in Portuguese - understanding it unlocks natural expression of routines.',
          culturalConnection: 'Phone communication and making plans are central to Portuguese social culture. Knowing these patterns helps you maintain relationships Portuguese-style!'
        }
      } as any as EnhancedLessonContent,
      
      exercises: [
        // Phone verb practice
        {
          id: 'phone-verb-1',
          type: 'mcq',
          prompt: '📞 "I\'ll call Maria at 8" - Choose the most natural option:',
          options: [
            'Chamo a Maria às 8',
            'Ligo para a Maria às 8',
            'Grito a Maria às 8',
            'Falo a Maria às 8'
          ],
          correct: 'Ligo para a Maria às 8'
        },
        
        // Habit vs one-time
        {
          id: 'habit-time-1',
          type: 'mcq',
          prompt: '📅 "I go to the gym on Mondays" (every Monday):',
          options: [
            'Vou ao ginásio na segunda',
            'Vou ao ginásio às segundas',
            'Vou ao ginásio em segunda',
            'Vou ao ginásio de segunda'
          ],
          correct: 'Vou ao ginásio às segundas'
        },
        
        // Levar vs trazer
        {
          id: 'direction-1',
          type: 'typing',
          prompt: '➡️ Type: "Can you bring water here?" (informal)',
          correct: 'Podes trazer água para aqui?'
        },
        
        // Saber vs conhecer
        {
          id: 'knowledge-1',
          type: 'mcq',
          prompt: '🧠 "Do you ___ Lisbon well?"',
          options: [
            'sabes',
            'conheces',
            'tens',
            'fazes'
          ],
          correct: 'conheces'
        },
        
        // Precisar de pattern
        {
          id: 'need-pattern-1',
          type: 'typing',
          prompt: '⚡ Say: "I need to rest"',
          correct: 'Preciso de descansar'
        },
        
        // Deitar vs dormir
        {
          id: 'sleep-1',
          type: 'mcq',
          prompt: '💤 "I go to bed at midnight but only ___ at 1am"',
          options: [
            'deito-me',
            'durmo',
            'levanto-me',
            'acordo'
          ],
          correct: 'durmo'
        },
        
        // Time expressions
        {
          id: 'time-approx-1',
          type: 'typing',
          prompt: '⏰ Say: "She starts working around 9"',
          correct: 'Ela começa a trabalhar por volta das nove'
        },
        
        // Weekend habits
        {
          id: 'weekend-1',
          type: 'order',
          prompt: '🎉 Order: "On weekends I always go out"',
          correct: 'Ao fim de semana saio sempre',
          items: ['fim', 'Ao', 'de', 'semana', 'saio', 'sempre']
        },
        
        // Phone message
        {
          id: 'message-1',
          type: 'typing',
          prompt: '📱 Type: "Send me a message"',
          correct: 'Manda-me uma mensagem'
        },
        
        // Specific day plan
        {
          id: 'specific-day-1',
          type: 'mcq',
          prompt: '📅 "On Saturday (this one) I\'m going to dance":',
          options: [
            'Ao sábado vou dançar',
            'Aos sábados vou dançar',
            'No sábado vou dançar',
            'Em sábado vou dançar'
          ],
          correct: 'No sábado vou dançar'
        },
        
        // Complex sentence with levar
        {
          id: 'complex-1',
          type: 'typing',
          prompt: '🚗 Say: "I\'m going to take the dog to the vet"',
          correct: 'Vou levar o cão ao veterinário'
        },
        
        // Saber skill
        {
          id: 'saber-skill-1',
          type: 'mcq',
          prompt: '🚗 "She knows how to drive" =',
          options: [
            'Ela conhece conduzir',
            'Ela sabe conduzir',
            'Ela pode conduzir',
            'Ela tem conduzir'
          ],
          correct: 'Ela sabe conduzir'
        },
        
        // Reflexive conjugation
        {
          id: 'reflexive-1',
          type: 'typing',
          prompt: '🛏️ Type: "They go to bed late" (use deitar-se)',
          correct: 'Eles deitam-se tarde'
        },
        
        // Natural conversation
        {
          id: 'natural-1',
          type: 'mcq',
          prompt: '💬 Your friend asks what you do on Friday nights. Natural answer:',
          options: [
            'Às sextas à noite, costumo jantar fora',
            'Na sexta à noite, costumo jantar fora',
            'Em sextas à noite, jantar fora',
            'Sexta à noite, eu jantar fora'
          ],
          correct: 'Às sextas à noite, costumo jantar fora'
        },
        
        // Final challenge
        {
          id: 'challenge-1',
          type: 'typing',
          prompt: '🏆 Challenge: "We almost always go out on weekends"',
          correct: 'Quase sempre saímos ao fim de semana'
        }
      ]
    }
  ]
};
