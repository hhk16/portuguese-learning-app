// PHASE A: Dense PPP Implementation for Core A1 Lessons (m1-m6)
import { Module } from './content';
import { EnhancedLessonContent } from './ppp-types';
import { 
  grammarRule, pronunciationRule, culturalRule, warningRule,
  contrast, ptVsEn, pitfall, culturalNote, miniCheck, 
  pronunciationGuide, sound, cheatSheet, cheatCategory, whyItMatters, example,
  commonPatterns
} from './ppp-helpers';

export const phaseADenseModules: Module[] = [
  {
    id: "m1",
    title: "Basics: Greetings & Introductions (Dense PPP)",
    description: "Master Portuguese greetings with complete cultural context, pronunciation mastery, and real-world usage scenarios.",
    lessons: [
      {
        id: "m1l1",
        title: "Olá! Cumprimentos Completos",
        xp: 35, // Increased XP for dense content
        content: {
          title: "Complete Portuguese Greetings & Cultural Etiquette",
          sections: [
            {
              title: "Essential Greeting Vocabulary",
              explanation: "Portuguese greetings are deeply tied to social hierarchy, time of day, and cultural context. Master these fundamentals to navigate Portuguese society with confidence:",
              
              examples: [
                example("Olá", "Hello", "universal, informal to semi-formal"),
                example("Bom dia", "Good morning", "until 12:00 - mandatory in elevators!"),
                example("Boa tarde", "Good afternoon", "12:00-18:00 - shows cultural awareness"),
                example("Boa noite", "Good evening/night", "after 18:00 - also means goodbye"),
                example("Oi", "Hi", "very informal, use with friends only"),
                example("Olá, como está?", "Hello, how are you?", "polite form with strangers"),
                example("Bom dia, menino!", "Good morning, young man!", "to children or service workers"),
                example("Boa tarde, senhora!", "Good afternoon, madam!", "formal address"),
                example("Boa noite e sonhos dourados!", "Good night and golden dreams!", "warm farewell"),
                example("Até amanhã!", "See you tomorrow!", "common workplace goodbye")
              ],
              
              keyPoints: [
                "Portuguese people ALWAYS greet in elevators, shops, and small spaces",
                "Time-specific greetings show respect and cultural integration",
                "Olá works anywhere, but natives prefer time-specific greetings",
                "Greeting without acknowledgment is considered very rude"
              ],
              
              // NEW: Dense PPP enhancements
              ruleBoxes: [
                grammarRule(
                  "Greeting Time Rules", 
                  "Portuguese has strict time boundaries for greetings that natives follow religiously.",
                  "Bom dia (6-12h) → Boa tarde (12-18h) → Boa noite (18h+)"
                ),
                culturalRule(
                  "The Elevator Rule",
                  "In Portugal, you MUST greet everyone when entering elevators, waiting rooms, or small enclosed spaces. Silence is extremely rude."
                ),
                pronunciationRule(
                  "Nasal Sounds in Greetings",
                  "The 'ã' in 'manhã' and 'ão' in 'saudação' are heavily nasalized through the nose, not the mouth."
                )
              ],
              
              contrastPairs: [
                contrast("Formal vs Informal Address", [
                  ptVsEn("Olá, como está?", "Hello, how are you?", "Oi, como vai?", "formal version"),
                  ptVsEn("Bom dia, senhor!", "Good morning, sir!", "Oi, mano!", "respectful vs casual"),
                  ptVsEn("Tenha um bom dia", "Have a good day", "Tchau!", "polite vs informal goodbye")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Using 'Oi' with strangers or in formal contexts",
                  "Use 'Olá' or time-specific greetings instead",
                  "'Oi' is only for close friends, family, or people significantly younger than you."
                ),
                pitfall(
                  "Forgetting to greet in elevators or small spaces",
                  "Always say 'Bom dia/Boa tarde' when entering",
                  "Portuguese social etiquette requires acknowledging everyone's presence in confined spaces."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🇵🇹", 
                  "Portuguese Greeting Hierarchy",
                  "Age and social status determine greeting formality. Always err on the side of respect with 'senhor/senhora' until invited to be more casual."
                ),
                culturalNote(
                  "🕒",
                  "Business Hours Etiquette", 
                  "Portuguese shops expect a greeting upon entry and 'obrigado/a' when leaving, even if you don't buy anything."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "You enter an elevator at 2 PM with an elderly person. What do you say?",
                  ["Oi!", "Bom dia!", "Boa tarde!", "Nothing"],
                  "Boa tarde!",
                  "At 2 PM it's afternoon, and elevators require greetings. 'Boa tarde' is perfect for the time and shows respect for the elderly person."
                )
              ],
              
              pronunciationGuide: pronunciationGuide([
                sound("ã", "manhã", "nasalize through nose, not mouth"),
                sound("ão", "saudação", "like 'ow' but completely nasal"),
                sound("lh", "olhar", "tongue touches roof of mouth, like 'lli' in million"),
                sound("nh", "senhor", "like 'ny' in canyon")
              ])
            },
            
            {
              title: "Time-Sensitive Greeting Mastery",
              explanation: "Master the precise timing and cultural significance of Portuguese greetings. These aren't just words - they're social markers that identify you as culturally aware:",
              
              examples: [
                example("Bom dia até às 12h", "Good morning until 12:00", "strict time boundary"),
                example("Boa tarde das 12h às 18h", "Good afternoon from 12:00 to 18:00", "longest greeting period"),
                example("Boa noite após as 18h", "Good evening after 18:00", "also used for goodbye"),
                example("Bom dia, doutor!", "Good morning, doctor!", "professional respect"),
                example("Boa tarde, professora!", "Good afternoon, teacher!", "educational context"),
                example("Boa noite, pessoal!", "Good evening, everyone!", "group greeting")
              ],
              
              keyPoints: [
                "12:00 noon is the EXACT switch from 'bom dia' to 'boa tarde'",
                "18:00 (6 PM) is when 'boa noite' begins",
                "Professional titles are often included in greetings",
                "'Boa noite' can mean both hello (evening) and goodbye (any time)"
              ],
              
              ruleBoxes: [
                warningRule(
                  "Timing Mistakes That Mark You as Foreign",
                  "Saying 'bom dia' at 12:30 or 'boa tarde' at 7 PM immediately identifies you as non-native. Portuguese people are very precise about greeting times."
                ),
                culturalRule(
                  "Professional Greeting Protocol",
                  "In business, include titles: 'Bom dia, Dr. Silva' or 'Boa tarde, Eng. Santos'. This shows respect for education and professional status."
                )
              ],
              
              contrastPairs: [
                contrast("Common Timing Errors", [
                  ptVsEn("Bom dia às 13h", "Good morning at 1 PM", "WRONG", "should be 'boa tarde'"),
                  ptVsEn("Boa tarde às 19h", "Good afternoon at 7 PM", "WRONG", "should be 'boa noite'"),
                  ptVsEn("Boa noite às 17h", "Good evening at 5 PM", "WRONG", "should be 'boa tarde'")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Using greeting times from your home culture",
                  "Learn Portuguese time boundaries: 12h and 18h are the exact switches",
                  "Many cultures have different greeting time boundaries. Portuguese times are very specific and non-negotiable."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "⏰",
                  "The 12:00 Noon Precision",
                  "Portuguese people switch from 'bom dia' to 'boa tarde' at exactly 12:00. Some even check their phones to get it right!"
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "It's 11:59 AM. You meet your Portuguese professor. What greeting do you use?",
                  ["Boa tarde, professora!", "Bom dia, professora!", "Olá, professora!", "Boa noite, professora!"],
                  "Bom dia, professora!",
                  "It's still morning (before 12:00), so 'bom dia' is correct. Including 'professora' shows respect for her professional status."
                )
              ]
            }
          ],
          
          // Lesson-level enhancements
          cheatSheet: cheatSheet("Portuguese Greetings Quick Reference", [
            cheatCategory("Time-Based Greetings", [
              "Bom dia (6:00-12:00)",
              "Boa tarde (12:00-18:00)", 
              "Boa noite (18:00+)"
            ]),
            cheatCategory("Formality Levels", [
              "Oi = very informal (friends only)",
              "Olá = neutral (safe everywhere)",
              "Bom dia/tarde/noite = polite (preferred)"
            ]),
            cheatCategory("Must-Greet Situations", [
              "Entering elevators",
              "Entering shops",
              "Meeting neighbors",
              "Business meetings"
            ]),
            cheatCategory("Professional Add-ons", [
              "Doutor/Doutora (Dr.)",
              "Professor/Professora",
              "Senhor/Senhora (Mr./Mrs.)",
              "Engenheiro/Engenheira (Engineer)"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Greet people appropriately in social and professional settings",
            "Show cultural awareness and respect in Portuguese society", 
            "Navigate elevator and shop etiquette like a native",
            "Build rapport with Portuguese people through proper greetings"
          ], "Greetings are your first impression in Portugal. Master these, and Portuguese people will immediately see you as respectful and culturally aware. Poor greetings can close doors; proper greetings open hearts.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "Olá", translation: "Hello" },
          { id: "e2", type: "flashcard", term: "Bom dia", translation: "Good morning" },
          { id: "e3", type: "flashcard", term: "Boa tarde", translation: "Good afternoon" },
          { id: "e4", type: "flashcard", term: "Boa noite", translation: "Good evening/night" },
          { id: "e5", type: "mcq", prompt: "At 2 PM, what greeting should you use?", options: ["Bom dia", "Boa tarde", "Boa noite", "Oi"], correct: "Boa tarde" },
          { id: "e6", type: "mcq", prompt: "Which is most formal?", options: ["Oi", "Olá", "Bom dia", "Hey"], correct: "Bom dia" },
          { id: "e7", type: "typing", prompt: "Greet your professor at 10 AM", correct: "Bom dia, professor!" },
          { id: "e8", type: "typing", prompt: "Say hello politely at 3 PM", correct: "Boa tarde!" },
          { id: "e9", type: "listening", audioTextPt: "Bom dia", correct: "Bom dia", prompt: "Type what you hear:" },
          { id: "e10", type: "matching", pairs: [
            { a: "Bom dia", b: "Good morning" },
            { a: "Boa tarde", b: "Good afternoon" },
            { a: "Boa noite", b: "Good evening" },
            { a: "Olá", b: "Hello" }
          ]},
          { id: "e11", type: "order", items: ["Bom", "dia", "professor"], correct: "Bom dia professor", prompt: "Order: Greet your teacher in the morning" },
          { id: "e12", type: "pronunciation", audioTextPt: "Boa tarde", options: ["Boa tarde", "Bom dia", "Boa noite"], correct: "Boa tarde" }
        ]
      },
      
      // M1L2: Dense Introductions with Cultural Hierarchy
      {
        id: "m1l2", 
        title: "Apresentações & Hierarquia Social",
        xp: 40, // Increased XP for dense content
        content: {
          title: "Portuguese Introductions & Social Hierarchy Mastery",
          sections: [
            {
              title: "Essential Introduction Vocabulary",
              explanation: "Portuguese introductions follow strict social protocols based on age, profession, and hierarchy. Master these patterns to navigate Portuguese society with confidence and respect:",
              
              examples: [
                example("Eu sou...", "I am...", "most common self-introduction"),
                example("O meu nome é...", "My name is...", "formal introduction"),
                example("Chamo-me...", "I'm called...", "traditional Portuguese form"),
                example("Prazer em conhecê-lo/la", "Pleasure to meet you", "formal response"),
                example("Muito prazer", "My pleasure", "polite response"),
                example("Permita-me apresentar...", "Allow me to introduce...", "formal introduction of others"),
                example("Este/Esta é...", "This is...", "casual introduction of others"),
                example("Posso apresentar-lhe...", "May I introduce you to...", "very formal"),
                example("É um prazer", "It's a pleasure", "professional response"),
                example("Igualmente", "Likewise", "reciprocal pleasure")
              ],
              
              keyPoints: [
                "Always use 'senhor/senhora' until explicitly invited to be informal",
                "Professional titles (doutor, engenheiro) are used in introductions",
                "Age determines who should be introduced to whom first",
                "Portuguese handshakes are firm but brief"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Introduction Hierarchy Rules",
                  "In Portugal, always introduce the younger person to the older person, and the less senior professional to the more senior professional."
                ),
                grammarRule(
                  "Formal vs Informal Address",
                  "Use 'o senhor/a senhora' (you formal) with strangers, older people, and professionals until invited to use 'tu' (you informal).",
                  "você (formal) vs tu (informal) - context determines choice"
                ),
                pronunciationRule(
                  "Silent Letters in Names",
                  "Portuguese names often have silent 'h' (Helena = eh-LEH-na) and stress patterns different from English."
                )
              ],
              
              contrastPairs: [
                contrast("Formal vs Informal Introductions", [
                  ptVsEn("Permita-me apresentar o Dr. Silva", "Allow me to introduce Dr. Silva", "Este é o João", "formal vs casual"),
                  ptVsEn("É um prazer conhecê-la, senhora", "It's a pleasure to meet you, madam", "Prazer, Ana!", "formal vs informal"),
                  ptVsEn("O meu nome é Pedro Santos", "My name is Pedro Santos", "Sou o Pedro", "formal vs casual self-introduction")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Using first names immediately with older people or professionals",
                  "Wait to be invited: 'Pode chamar-me João' (You can call me João)",
                  "Portuguese culture values respect for age and professional status. Premature familiarity is seen as disrespectful."
                ),
                pitfall(
                  "Forgetting to shake hands during introductions",
                  "Always offer a handshake, especially in professional settings",
                  "Portuguese people expect physical acknowledgment during introductions. Not shaking hands seems cold and foreign."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🤝", 
                  "Portuguese Handshake Etiquette",
                  "Portuguese handshakes are firm, brief, and accompanied by direct eye contact. Women may offer air kisses (two cheeks) in social settings, but handshakes are standard in business."
                ),
                culturalNote(
                  "👔",
                  "Professional Title Usage", 
                  "Portuguese people use professional titles (Doutor, Engenheiro, Professor) much more than other cultures. When in doubt, use the title - it shows respect and cultural awareness."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "You're introduced to a 60-year-old doctor in a business setting. What do you say?",
                  ["Olá, como está?", "Prazer em conhecê-lo, doutor", "Oi, tudo bem?", "Hey, nice to meet you"],
                  "Prazer em conhecê-lo, doutor",
                  "In business settings with older professionals, use formal address with titles. 'Doutor' shows respect for their education and age."
                )
              ],
              
              pronunciationGuide: pronunciationGuide([
                sound("ê", "conhecê-lo", "closed 'e' sound, like 'eh' in 'bet'"),
                sound("nh", "senhor", "like 'ny' in 'canyon'"),
                sound("ão", "apresentação", "heavily nasal 'ow' sound"),
                sound("lh", "trabalho", "like 'lli' in 'million'")
              ])
            },
            
            {
              title: "Professional Introduction Protocols",
              explanation: "Master the sophisticated world of Portuguese professional introductions, where titles, hierarchy, and respect protocols determine social success:",
              
              examples: [
                example("Sou engenheiro informático", "I'm a software engineer", "professional identification"),
                example("Trabalho na área de...", "I work in the area of...", "describing your field"),
                example("Tenho o prazer de apresentar...", "I have the pleasure of introducing...", "formal business introduction"),
                example("Este é o nosso diretor", "This is our director", "introducing a superior"),
                example("Permita que me apresente", "Allow me to introduce myself", "formal self-introduction"),
                example("De que área é?", "What area are you from?", "asking about profession"),
                example("Há quanto tempo trabalha aqui?", "How long have you worked here?", "professional small talk"),
                example("Que prazer conhecê-la!", "What a pleasure to meet you!", "enthusiastic formal response")
              ],
              
              keyPoints: [
                "Professional titles are almost mandatory in business introductions",
                "Always introduce the junior person to the senior person first",
                "Use 'o senhor doutor' / 'a senhora doutora' for anyone with a doctorate",
                "Portuguese professionals take hierarchy very seriously"
              ],
              
              ruleBoxes: [
                warningRule(
                  "Title Mistakes That Damage Professional Relationships",
                  "Failing to use someone's professional title (especially 'Doutor') in business settings is seen as a serious sign of disrespect and poor cultural understanding."
                ),
                culturalRule(
                  "Business Card Protocol",
                  "In Portugal, business cards are exchanged formally after introductions. Receive with both hands and study it briefly to show respect."
                ),
                grammarRule(
                  "Gender Agreement in Titles",
                  "Professional titles change with gender: doutor/doutora, engenheiro/engenheira, professor/professora.",
                  "masculine -o endings → feminine -a endings"
                )
              ],
              
              contrastPairs: [
                contrast("Business vs Social Introductions", [
                  ptVsEn("Permita-me apresentar o Dr. Silva", "Allow me to introduce Dr. Silva", "Este é o Pedro", "business vs social"),
                  ptVsEn("É um prazer, senhora engenheira", "It's a pleasure, madam engineer", "Prazer, Ana!", "professional vs personal"),
                  ptVsEn("Trabalho na área de medicina", "I work in the medical field", "Sou professor", "detailed vs simple profession")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Not asking about someone's profession in professional settings",
                  "Always ask 'De que área é?' or 'Qual é a sua profissão?'",
                  "Portuguese professionals define themselves by their work. Not asking about their profession suggests disinterest in them as a person."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🎓",
                  "The 'Doutor' Phenomenon",
                  "In Portugal, anyone with a university degree is often called 'Doutor/Doutora' as a sign of respect, not just people with PhDs. When in doubt, use the title."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "You're introducing your colleague Ana (engineer) to your boss Dr. Santos. What do you say?",
                  ["Dr. Santos, esta é a Ana", "Ana, este é o Dr. Santos", "Permita-me apresentar a engenheira Ana ao Dr. Santos", "Ana, Dr. Santos"],
                  "Permita-me apresentar a engenheira Ana ao Dr. Santos",
                  "In formal business settings, introduce the junior person (Ana) to the senior person (Dr. Santos), using full titles and formal language."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Introduction Quick Reference", [
            cheatCategory("Self-Introduction", [
              "Eu sou... (I am...)",
              "O meu nome é... (My name is...)",
              "Chamo-me... (I'm called...)",
              "Sou [profession] (I'm a [profession])"
            ]),
            cheatCategory("Introducing Others", [
              "Este/Esta é... (This is...)",
              "Permita-me apresentar... (Allow me to introduce...)",
              "Posso apresentar-lhe... (May I introduce you to...)",
              "Tenho o prazer de apresentar... (I have the pleasure of introducing...)"
            ]),
            cheatCategory("Professional Titles", [
              "Doutor/Doutora (Doctor - any degree)",
              "Engenheiro/Engenheira (Engineer)",
              "Professor/Professora (Teacher/Professor)",
              "Senhor/Senhora (Mr./Mrs. - safe fallback)"
            ]),
            cheatCategory("Polite Responses", [
              "Prazer em conhecê-lo/la (Pleasure to meet you)",
              "Muito prazer (My pleasure)",
              "É um prazer (It's a pleasure)",
              "Igualmente (Likewise)"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Introduce yourself professionally in business and social settings",
            "Show proper respect for Portuguese social hierarchy and professional titles",
            "Navigate formal and informal introduction contexts appropriately",
            "Build professional relationships through culturally appropriate introductions"
          ], "In Portugal, introductions are your gateway to professional and social acceptance. Master the hierarchy, titles, and protocols, and Portuguese people will see you as sophisticated and culturally aware. Poor introductions can damage relationships before they even begin.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "Eu sou", translation: "I am" },
          { id: "e2", type: "flashcard", term: "O meu nome é", translation: "My name is" },
          { id: "e3", type: "flashcard", term: "Prazer em conhecê-lo", translation: "Pleasure to meet you" },
          { id: "e4", type: "flashcard", term: "Muito prazer", translation: "My pleasure" },
          { id: "e5", type: "flashcard", term: "Este é", translation: "This is (masculine)" },
          { id: "e6", type: "flashcard", term: "Esta é", translation: "This is (feminine)" },
          { id: "e7", type: "mcq", prompt: "How do you say 'My name is Ana' formally?", options: ["Sou Ana", "O meu nome é Ana", "Chamo Ana", "Ana sou"], correct: "O meu nome é Ana" },
          { id: "e8", type: "mcq", prompt: "What's the most formal way to introduce someone?", options: ["Este é", "Permita-me apresentar", "Aqui está", "Olhe"], correct: "Permita-me apresentar" },
          { id: "e9", type: "typing", prompt: "Introduce yourself formally (use 'My name is')", correct: "O meu nome é" },
          { id: "e10", type: "typing", prompt: "Say 'Pleasure to meet you' to a man", correct: "Prazer em conhecê-lo" },
          { id: "e11", type: "listening", audioTextPt: "Muito prazer", correct: "Muito prazer", prompt: "Type what you hear:" },
          { id: "e12", type: "matching", pairs: [
            { a: "Eu sou", b: "I am" },
            { a: "Este é", b: "This is (masculine)" },
            { a: "Muito prazer", b: "My pleasure" },
            { a: "Igualmente", b: "Likewise" }
          ]},
          { id: "e13", type: "order", items: ["Prazer", "em", "conhecê-lo"], correct: "Prazer em conhecê-lo", prompt: "Order: 'Pleasure to meet you (masculine)'" },
          { id: "e14", type: "pronunciation", audioTextPt: "Permita-me apresentar", options: ["Permita-me apresentar", "Permite apresentar", "Permito apresentar"], correct: "Permita-me apresentar" }
        ]
      },
       
       // M1L3: Dense Formal vs Informal with Tu/Você Mastery
       {
         id: "m1l3",
         title: "Formal vs Informal: Tu/Você Mastery",
         xp: 45, // Highest XP for complex social concepts
         content: {
           title: "Portuguese Formality Levels & Social Register Mastery",
           sections: [
             {
               title: "The Tu/Você Distinction",
               explanation: "Master one of the most challenging aspects of Portuguese social interaction: when to use informal 'tu' versus formal 'você'. This distinction determines your entire relationship dynamic with Portuguese speakers:",
               
               examples: [
                 example("Como estás?", "How are you? (informal tu)", "friends, family, children"),
                 example("Como está?", "How are you? (formal você)", "strangers, older people, professionals"),
                 example("Tu és muito simpático", "You are very nice (informal)", "speaking to friends"),
                 example("O senhor é muito simpático", "You are very nice (formal)", "speaking to older men"),
                 example("Podes ajudar-me?", "Can you help me? (informal)", "asking friends"),
                 example("Pode ajudar-me?", "Can you help me? (formal)", "asking strangers/superiors"),
                 example("Como te chamas?", "What's your name? (informal)", "to children/peers"),
                 example("Como se chama?", "What's your name? (formal)", "to adults/strangers"),
                 example("Fazes isto?", "Do you do this? (informal)", "casual questioning"),
                 example("Faz isto?", "Do you do this? (formal)", "polite questioning")
               ],
               
               keyPoints: [
                 "'Tu' is for friends, family, children, and people your age or younger",
                 "'Você' is for strangers, older people, professionals, and formal situations",
                 "When in doubt, always use 'você' - it's safer to be too formal than too casual",
                 "Portuguese people will tell you when you can switch to 'tu': 'Pode tratar-me por tu'"
               ],
               
               ruleBoxes: [
                 grammarRule(
                   "Tu/Você Verb Conjugation Rules",
                   "Tu uses 2nd person singular verbs, Você uses 3rd person singular verbs (same as ele/ela).",
                   "Tu és/fazes/tens vs Você é/faz/tem"
                 ),
                 culturalRule(
                   "The Permission Protocol",
                   "Portuguese people explicitly give permission to use 'tu': 'Pode tratar-me por tu' (You can address me informally). Wait for this invitation!"
                 ),
                 warningRule(
                   "Mixing Tu/Você is Extremely Rude",
                   "Never mix tu and você in the same conversation with the same person. Pick one level of formality and stick to it throughout the entire interaction."
                 )
               ],
               
               contrastPairs: [
                 contrast("Tu vs Você Verb Forms", [
                   ptVsEn("Tu estás bem?", "Are you well? (informal)", "Está bem?", "informal vs formal"),
                   ptVsEn("Tu tens tempo?", "Do you have time? (informal)", "Tem tempo?", "informal vs formal"),
                   ptVsEn("Tu queres café?", "Do you want coffee? (informal)", "Quer café?", "informal vs formal")
                 ]),
                 contrast("Question Formation Differences", [
                   ptVsEn("Como te chamas?", "What's your name? (informal)", "Como se chama?", "informal vs formal"),
                   ptVsEn("Onde moras?", "Where do you live? (informal)", "Onde mora?", "informal vs formal"),
                   ptVsEn("Que fazes?", "What do you do? (informal)", "Que faz?", "informal vs formal")
                 ])
               ],
               
               pitfalls: [
                 pitfall(
                   "Using 'tu' with older people or in professional settings",
                   "Always use 'você' or 'o senhor/a senhora' until explicitly invited to be informal",
                   "Using 'tu' prematurely with older people or professionals is seen as extremely disrespectful and marks you as culturally ignorant."
                 ),
                 pitfall(
                   "Switching randomly between tu and você in the same conversation",
                   "Pick one level of formality and maintain it consistently",
                   "Inconsistent formality confuses Portuguese speakers and suggests you don't understand the social relationship."
                 )
               ],
               
               culturalNotes: [
                 culturalNote(
                   "👥", 
                   "Regional Variations in Tu/Você Usage",
                   "Northern Portugal uses 'tu' more freely, while Lisbon and the south are more formal. When in doubt, observe what locals use with each other."
                 ),
                 culturalNote(
                   "👔",
                   "Workplace Formality Hierarchy", 
                   "Portuguese workplaces maintain strict formality. Use 'você' or 'o senhor/a senhora' with superiors, and wait months or years before being invited to use 'tu'."
                 )
               ],
               
               miniChecks: [
                 miniCheck(
                   "You're meeting your Portuguese friend's 65-year-old father for the first time. How do you ask 'How are you?'",
                   ["Como estás?", "Como está?", "Como está o senhor?", "Tudo bem?"],
                   "Como está o senhor?",
                   "With older people you're meeting for the first time, use the most formal option: 'Como está o senhor?' shows maximum respect for age and unfamiliarity."
                 )
               ],
               
               pronunciationGuide: pronunciationGuide([
                 sound("ás", "estás", "stressed 'a' sound in tu conjugations"),
                 sound("á", "está", "formal você uses different stress patterns"),
                 sound("es", "fazes", "tu endings often have 's' sound"),
                 sound("a", "mora", "você uses 3rd person singular endings")
               ])
             },
             
             {
               title: "Advanced Formality Strategies",
               explanation: "Master the sophisticated art of Portuguese social register - knowing exactly when and how to adjust your formality level based on context, relationship dynamics, and social cues:",
               
               examples: [
                 example("Desculpe, pode repetir?", "Excuse me, can you repeat? (formal)", "polite request to strangers"),
                 example("Desculpa, podes repetir?", "Sorry, can you repeat? (informal)", "casual request to friends"),
                 example("O senhor tem razão", "You are right, sir", "deferential agreement"),
                 example("Tu tens razão", "You're right", "casual agreement"),
                 example("Permita-me discordar", "Allow me to disagree (very formal)", "professional disagreement"),
                 example("Não concordo", "I don't agree", "direct disagreement with friends"),
                 example("Se faz favor", "Please (formal)", "polite requests"),
                 example("Por favor", "Please (neutral)", "standard politeness"),
                 example("Queria pedir-lhe", "I would like to ask you (formal)", "very polite requests"),
                 example("Posso pedir-te", "Can I ask you (informal)", "casual requests")
               ],
               
               keyPoints: [
                 "Context matters more than relationship - formal situations require formal language",
                 "Professional settings almost always require 'você' regardless of age",
                 "Service interactions (shops, restaurants) default to formal",
                 "Family gatherings may still use 'você' with in-laws and older relatives"
               ],
               
               ruleBoxes: [
                 culturalRule(
                   "The Three-Meeting Rule",
                   "Many Portuguese people need at least three positive interactions before considering informal address. Don't rush the relationship."
                 ),
                 warningRule(
                   "Professional Email Formality",
                   "Portuguese business emails are extremely formal. Use 'Exmo. Senhor' (Dear Sir) and maintain formal register throughout. Informality in business emails damages professional relationships."
                 ),
                 grammarRule(
                   "Reflexive Pronouns with Tu/Você",
                   "Tu uses 'te' (Como te chamas?), Você uses 'se' (Como se chama?). These changes affect the entire sentence structure.",
                   "Te/se, te/lhe reflexive pronoun agreement"
                 )
               ],
               
               contrastPairs: [
                 contrast("Professional vs Personal Contexts", [
                   ptVsEn("Poderia ajudar-me?", "Could you help me? (professional)", "Podes ajudar?", "work vs friends"),
                   ptVsEn("Permita que me apresente", "Allow me to introduce myself (formal)", "Sou o João", "business vs casual"),
                   ptVsEn("Muito obrigado pela sua ajuda", "Thank you very much for your help (formal)", "Obrigado!", "formal vs casual thanks")
                 ])
               ],
               
               pitfalls: [
                 pitfall(
                   "Assuming young age means you can use 'tu'",
                   "Professional context overrides age - use 'você' with young professionals",
                   "A 25-year-old doctor or lawyer expects formal address regardless of age. Professional status trumps age in Portuguese culture."
                 ),
                 pitfall(
                   "Using informal language in written Portuguese",
                   "Written Portuguese is more formal than spoken - err on the formal side",
                   "Portuguese writing conventions are very formal. Even friendly emails often maintain some formality markers."
                 )
               ],
               
               culturalNotes: [
                 culturalNote(
                   "🎯",
                   "Reading Social Cues for Formality",
                   "Watch how Portuguese people address each other in groups. If they use 'você' with someone, you should too. If they switch to 'tu', they're signaling acceptance."
                 ),
                 culturalNote(
                   "💼",
                   "The Corporate Formality Paradox",
                   "Portuguese companies may be casual in dress but maintain linguistic formality. Don't assume casual clothes mean casual language."
                 )
               ],
               
               miniChecks: [
                 miniCheck(
                   "Your Portuguese colleague (your age) invites you for coffee after work. How do you ask where to meet?",
                   ["Onde nos encontramos?", "Onde te encontro?", "Onde se encontra?", "Onde encontra?"],
                   "Onde nos encontramos?",
                   "Use neutral, mutual language ('nos encontramos' = we meet each other) to avoid choosing between tu/você when the relationship level is still unclear."
                 )
               ]
             }
           ],
           
           cheatSheet: cheatSheet("Portuguese Formality Quick Reference", [
             cheatCategory("Tu (Informal) Usage", [
               "Friends and family",
               "Children and teenagers",
               "People your age (after invitation)",
               "Casual social situations"
             ]),
             cheatCategory("Você (Formal) Usage", [
               "Strangers and new people",
               "Older people (until invited to tu)",
               "Professional/work contexts",
               "Service interactions (shops, etc.)"
             ]),
             cheatCategory("Tu Verb Forms", [
               "Tu és (you are)",
               "Tu tens (you have)",
               "Tu fazes (you do)",
               "Tu estás (you are - temporary)"
             ]),
             cheatCategory("Você Verb Forms", [
               "Você é (you are)",
               "Você tem (you have)", 
               "Você faz (you do)",
               "Você está (you are - temporary)"
             ]),
             cheatCategory("Ultra-Formal Options", [
               "O senhor/A senhora (Sir/Madam)",
               "Vossa Excelência (Your Excellence)",
               "Permita-me... (Allow me...)",
               "Se faz favor (If you please)"
             ])
           ]),
           
           whyItMatters: whyItMatters([
             "Navigate Portuguese social hierarchy and relationship dynamics correctly",
             "Show appropriate respect in professional and formal settings",
             "Build genuine friendships by understanding when informality is welcome",
             "Avoid social embarrassment and cultural misunderstandings"
           ], "The tu/você distinction is the key to Portuguese social integration. Master this, and Portuguese people will see you as socially sophisticated and culturally aware. Get it wrong, and you'll be marked as an outsider who doesn't understand Portuguese social norms.")
         } as EnhancedLessonContent,
         
         exercises: [
           { id: "e1", type: "flashcard", term: "Como estás?", translation: "How are you? (informal)" },
           { id: "e2", type: "flashcard", term: "Como está?", translation: "How are you? (formal)" },
           { id: "e3", type: "flashcard", term: "Tu tens", translation: "You have (informal)" },
           { id: "e4", type: "flashcard", term: "Você tem", translation: "You have (formal)" },
           { id: "e5", type: "flashcard", term: "Como te chamas?", translation: "What's your name? (informal)" },
           { id: "e6", type: "flashcard", term: "Como se chama?", translation: "What's your name? (formal)" },
           { id: "e7", type: "mcq", prompt: "How do you ask 'Are you well?' to a stranger?", options: ["Como estás?", "Como está?", "Estás bem?", "Tu estás bem?"], correct: "Como está?" },
           { id: "e8", type: "mcq", prompt: "Which is appropriate for friends?", options: ["O senhor tem", "Você tem", "Tu tens", "Tem"], correct: "Tu tens" },
           { id: "e9", type: "typing", prompt: "Ask 'What's your name?' to a child (informal)", correct: "Como te chamas?" },
           { id: "e10", type: "typing", prompt: "Ask 'Do you have time?' formally", correct: "Tem tempo?" },
           { id: "e11", type: "listening", audioTextPt: "Como está?", correct: "Como está?", prompt: "Type what you hear:" },
           { id: "e12", type: "matching", pairs: [
             { a: "Tu estás", b: "You are (informal)" },
             { a: "Você está", b: "You are (formal)" },
             { a: "Como te chamas?", b: "What's your name? (informal)" },
             { a: "Como se chama?", b: "What's your name? (formal)" }
           ]},
           { id: "e13", type: "order", items: ["Como", "te", "chamas"], correct: "Como te chamas", prompt: "Order: 'What's your name?' (informal)" },
           { id: "e14", type: "pronunciation", audioTextPt: "Tu tens razão", options: ["Tu tens razão", "Tu tem razão", "Você tens razão"], correct: "Tu tens razão" }
         ]
      }
    ]
  },
  
  // M2: Numbers & Portuguese Counting Culture (Dense PPP)  
  {
    id: "m2",
    title: "Numbers & Portuguese Counting Culture (Dense PPP)",
    description: "Master Portuguese numbers with cultural context, price formats, phone protocols, and mathematical expressions used in daily Portuguese life.",
    lessons: [
      {
        id: "m2l1",
        title: "Números 0-20 & Cultura Numérica",
        xp: 40,
        content: {
          title: "Portuguese Numbers & Cultural Counting Mastery",
          sections: [
            {
              title: "Essential Numbers 0-20",
              explanation: "Portuguese numbers have unique cultural significance and pronunciation patterns. Master these fundamentals to navigate Portuguese mathematics, commerce, and daily interactions with confidence:",
              
              examples: [
                example("zero", "zero", "pronounced 'ZEH-roo'"),
                example("um", "one", "masculine form - changes to 'uma' for feminine"),
                example("dois", "two", "masculine form - changes to 'duas' for feminine"),
                example("três", "three", "heavy nasal sound - 'trehsh'"),
                example("quatro", "four", "KWAH-troo - stress on first syllable"),
                example("cinco", "five", "SEEN-koo - soft 'c' sound"),
                example("dezasseis", "sixteen", "European Portuguese form"),
                example("vinte", "twenty", "VEEN-teh - nasal 'in' sound")
              ],
              
              keyPoints: [
                "Portuguese uses 'dezasseis' (not 'dezesseis') in European Portuguese",
                "Gender agreement: um/uma, dois/duas change with nouns",
                "Numbers have stress patterns different from English"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Gender Agreement with Numbers",
                  "Numbers 1 and 2 change gender to match the noun they modify.",
                  "um livro/uma mesa, dois livros/duas mesas"
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🇵🇹", 
                  "Portuguese Counting Traditions",
                  "Portuguese children learn to count using finger patterns different from English speakers. They start with the thumb (polegar) as 'one', not the index finger."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "You want to buy two feminine items. How do you say 'two'?",
                  ["dois", "duas", "doze", "segundo"],
                  "duas",
                  "With feminine nouns, 'dois' becomes 'duas'. This gender agreement is essential for correct Portuguese."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Numbers Quick Reference", [
            cheatCategory("Numbers 0-10", [
              "zero (0)", "um/uma (1)", "dois/duas (2)", "três (3)", "quatro (4)",
              "cinco (5)", "seis (6)", "sete (7)", "oito (8)", "nove (9)", "dez (10)"
            ]),
            cheatCategory("Gender Agreement", [
              "um livro / uma mesa (one book/table)",
              "dois euros / duas pessoas (two euros/people)",
              "Gender only matters for 1 and 2"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Count objects, money, and quantities in daily Portuguese interactions",
            "Understand prices, calculations, and mathematical expressions in Portuguese",
            "Navigate Portuguese number formatting in addresses, phones, and documents"
          ], "Numbers are fundamental to daily life in Portugal. Master Portuguese counting, and you'll confidently handle shopping, addresses, phone numbers, and mathematical conversations.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "zero", translation: "zero" },
          { id: "e2", type: "flashcard", term: "um", translation: "one (masculine)" },
          { id: "e3", type: "flashcard", term: "dois", translation: "two (masculine)" },
          { id: "e4", type: "flashcard", term: "três", translation: "three" },
          { id: "e5", type: "flashcard", term: "quatro", translation: "four" },
          { id: "e6", type: "flashcard", term: "cinco", translation: "five" },
          { id: "e7", type: "mcq", prompt: "How do you say 'sixteen' in European Portuguese?", options: ["dezesseis", "dezasseis", "dezeseis"], correct: "dezasseis" },
          { id: "e8", type: "mcq", prompt: "What's the feminine form of 'dois'?", options: ["dois", "duas", "segunda"], correct: "duas" },
          { id: "e9", type: "typing", prompt: "Say 'one table' (feminine)", correct: "uma mesa" },
          { id: "e10", type: "listening", audioTextPt: "dezassete", correct: "dezassete", prompt: "Type what you hear:" }
        ]
      }
    ]
  },
  
  // M3: Nationalities & Portuguese Geographic Identity (Dense PPP)
  {
    id: "m3",
    title: "Nationalities & Portuguese Geographic Identity (Dense PPP)",
    description: "Master Portuguese nationalities with deep cultural context, European identity, geographic awareness, and the social significance of origins in Portuguese society.",
    lessons: [
      {
        id: "m3l1",
        title: "Nacionalidades & Identidade Europeia",
        xp: 45,
        content: {
          title: "Portuguese Nationalities & European Cultural Identity",
          sections: [
            {
              title: "Essential European Nationalities",
              explanation: "Portuguese people have a strong sense of European identity and geographic awareness. Master these nationalities to engage in cultural discussions and show awareness of Portugal's place in Europe:",
              
              examples: [
                example("português/portuguesa", "Portuguese", "masculine/feminine - proud European identity"),
                example("espanhol/espanhola", "Spanish", "closest neighbors - complex relationship"),
                example("francês/francesa", "French", "cultural admiration - 'frahn-SEHSH'"),
                example("alemão/alemã", "German", "economic respect - 'ah-leh-MOWN'"),
                example("italiano/italiana", "Italian", "cultural similarity - Mediterranean bond"),
                example("inglês/inglesa", "English", "historical ties - 'een-GLEHSH'"),
                example("americano/americana", "American", "from USA - distinguish from 'das Américas'"),
                example("brasileiro/brasileira", "Brazilian", "shared language, different culture"),
                example("holandês/holandesa", "Dutch", "economic partners - 'oh-lan-DEHSH'"),
                example("sueco/sueca", "Swedish", "Nordic model admiration"),
                example("russo/russa", "Russian", "Eastern European - 'ROOH-soo'"),
                example("chinês/chinesa", "Chinese", "growing economic ties"),
                example("japonês/japonesa", "Japanese", "technological respect"),
                example("africano/africana", "African", "PALOP country connections"),
                example("europeu/europeia", "European", "collective identity - pride")
              ],
              
              keyPoints: [
                "All nationalities have masculine/feminine forms ending in -o/-a or -ês/-esa",
                "Portuguese people strongly identify as European, not just Portuguese",
                "Former colonies (Brazil, Angola, Mozambique) have special cultural significance",
                "Geographic knowledge shows cultural sophistication in conversations"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Nationality Gender Agreement",
                  "Nationalities follow predictable patterns: -o/-a endings or -ês/-esa endings.",
                  "português/portuguesa, francês/francesa, alemão/alemã"
                ),
                culturalRule(
                  "Portuguese European Identity",
                  "Portuguese people see themselves as fundamentally European. Mentioning EU membership, European values, and continental geography shows cultural awareness."
                ),
                pronunciationRule(
                  "Nasal Sounds in Nationalities",
                  "Many nationalities have nasal sounds: alemão (ah-leh-MOWN), português (poor-too-GESH), americano (ah-meh-ree-KAH-noo)."
                )
              ],
              
              contrastPairs: [
                contrast("European vs Non-European Identity", [
                  ptVsEn("Sou europeu", "I am European", "Sou português", "broader vs specific identity"),
                  ptVsEn("a cultura europeia", "European culture", "a cultura americana", "in-group vs out-group"),
                  ptVsEn("os nossos vizinhos europeus", "our European neighbors", "os países distantes", "proximity vs distance")
                ]),
                contrast("Gender Agreement Examples", [
                  ptVsEn("um amigo alemão", "a German friend (male)", "uma amiga alemã", "masculine vs feminine"),
                  ptVsEn("ele é francês", "he is French", "ela é francesa", "masculine vs feminine forms"),
                  ptVsEn("comida italiana", "Italian food", "vinho português", "adjective agreement with nouns")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Forgetting gender agreement with nationalities",
                  "Always match: um alemão/uma alemã, ele é francês/ela é francesa",
                  "Nationality adjectives must agree with the gender of the person or noun they describe. This is strictly enforced in Portuguese."
                ),
                pitfall(
                  "Calling Americans 'americanos' without context",
                  "Specify 'dos Estados Unidos' or 'norte-americanos' to distinguish from other Americans",
                  "Portuguese people distinguish between 'americanos' (could mean anyone from the Americas) and 'norte-americanos' (specifically USA citizens)."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🇪🇺", 
                  "Portuguese European Pride",
                  "Portugal joined the EU in 1986 and Portuguese people are proud Europeans. They often identify as European first, then Portuguese, especially in international contexts."
                ),
                culturalNote(
                  "🌍",
                  "PALOP Countries Special Status", 
                  "Portuguese-speaking African countries (PALOP) have special cultural significance. Portuguese people often have strong opinions and emotional connections to Angola, Mozambique, Cape Verde, etc."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "Your female German friend Maria is visiting. How do you introduce her nationality?",
                  ["Ela é alemão", "Ela é alemã", "Ela é alemanha", "Ela é germana"],
                  "Ela é alemã",
                  "For feminine subjects, use the feminine form: alemã. The nationality adjective must agree with the gender of the person."
                )
              ],
              
              pronunciationGuide: pronunciationGuide([
                sound("ão", "alemão", "heavy nasal sound - ah-leh-MOWN"),
                sound("ês", "francês", "closed 'e' with 's' - frahn-SEHSH"),
                sound("nh", "espanhol", "like 'ny' in canyon - esh-pah-NYOL"),
                sound("gue", "português", "hard 'g' sound - poor-too-GESH")
              ])
            },
            
            {
              title: "Portuguese Geographic & Cultural Awareness",
              explanation: "Demonstrate sophisticated cultural knowledge by understanding Portugal's geographic position, historical relationships, and contemporary European role:",
              
              examples: [
                example("Europa Ocidental", "Western Europe", "Portugal's geographic identity"),
                example("Península Ibérica", "Iberian Peninsula", "shared with Spain"),
                example("países vizinhos", "neighboring countries", "Spain only land neighbor"),
                example("União Europeia", "European Union", "member since 1986"),
                example("zona euro", "eurozone", "shared currency pride"),
                example("PALOP", "Portuguese-speaking African countries", "Angola, Mozambique, etc."),
                example("Comunidade Lusófona", "Lusophone Community", "Portuguese-speaking world"),
                example("fronteira com Espanha", "border with Spain", "only land border"),
                example("costa atlântica", "Atlantic coast", "maritime identity"),
                example("ilhas atlânticas", "Atlantic islands", "Madeira, Açores"),
                example("emigração portuguesa", "Portuguese emigration", "diaspora worldwide"),
                example("comunidade imigrante", "immigrant community", "Eastern Europeans, Brazilians"),
                example("multiculturalismo", "multiculturalism", "modern Portuguese reality"),
                example("diversidade cultural", "cultural diversity", "Portuguese values"),
                example("integração europeia", "European integration", "political commitment")
              ],
              
              keyPoints: [
                "Portugal's only land border is with Spain - island mentality",
                "Strong Atlantic/maritime identity vs Mediterranean neighbors",
                "EU membership is source of pride and modern identity",
                "Lusophone world (Portuguese-speaking) extends globally"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Island Mentality",
                  "Despite being continental, Portuguese often think like islanders due to Spanish border and Atlantic focus. This affects their European vs Iberian identity."
                ),
                grammarRule(
                  "Country and Nationality Prepositions",
                  "Use 'de' for origin: 'Sou de Portugal', 'da França', 'dos Estados Unidos'.",
                  "de + country name for origin/nationality"
                ),
                warningRule(
                  "Spain Relationship Complexity",
                  "Never assume Portuguese and Spanish cultures are the same. Portuguese people are sensitive about maintaining distinct identity from Spain."
                )
              ],
              
              contrastPairs: [
                contrast("Portuguese vs Spanish Identity", [
                  ptVsEn("Somos portugueses, não espanhóis", "We are Portuguese, not Spanish", "key distinction"),
                  ptVsEn("Portugal não é Espanha", "Portugal is not Spain", "national sensitivity"),
                  ptVsEn("cultura lusa vs cultura hispânica", "Lusophone vs Hispanic culture", "different cultural spheres")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Confusing Portuguese and Spanish cultures",
                  "Always acknowledge Portugal's distinct identity and unique culture",
                  "Portuguese people are very sensitive about being confused with Spanish culture. Acknowledge Portugal's independence and unique characteristics."
                ),
                pitfall(
                  "Ignoring Portugal's maritime/Atlantic identity",
                  "Recognize Portugal's ocean-facing, not just European, identity",
                  "Portugal's culture is heavily influenced by its Atlantic orientation and maritime history, not just European continental culture."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🌊",
                  "Portuguese Atlantic Identity",
                  "Portugal faces the Atlantic, not the Mediterranean. This maritime orientation shapes Portuguese culture, food, weather awareness, and global outlook."
                ),
                culturalNote(
                  "🇧🇷",
                  "Brazil Relationship Complexity",
                  "Portuguese have complex feelings about Brazil - pride in shared language, but also sensitivity about Brazil's larger size and global prominence."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "A Portuguese person proudly mentions their EU membership. What's the best response?",
                  ["Portugal joined recently", "Portugal is a founding member", "Portugal joined in 1986", "Portugal should leave EU"],
                  "Portugal joined in 1986",
                  "Portugal joined the EU in 1986, which transformed the country economically and culturally. This is a source of pride for Portuguese people."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Nationalities Quick Reference", [
            cheatCategory("European Neighbors", [
              "português/portuguesa (Portuguese)",
              "espanhol/espanhola (Spanish)", 
              "francês/francesa (French)",
              "alemão/alemã (German)",
              "italiano/italiana (Italian)",
              "inglês/inglesa (English)"
            ]),
            cheatCategory("Global Powers", [
              "americano/americana (American - USA)",
              "chinês/chinesa (Chinese)",
              "japonês/japonesa (Japanese)",
              "russo/russa (Russian)",
              "brasileiro/brasileira (Brazilian)"
            ]),
            cheatCategory("Gender Agreement Rules", [
              "-o/-a endings: português/portuguesa",
              "-ês/-esa endings: francês/francesa", 
              "-ão/-ã endings: alemão/alemã",
              "Always match person's gender"
            ]),
            cheatCategory("Portuguese Identity", [
              "europeu/europeia (European - collective)",
              "lusófono/lusófona (Portuguese-speaking)",
              "atlântico/atlântica (Atlantic-oriented)",
              "ibérico/ibérica (Iberian Peninsula)"
            ]),
            cheatCategory("Cultural Sensitivity", [
              "Portugal ≠ Spain (distinct cultures)",
              "EU membership = pride since 1986",
              "PALOP countries = special connection",
              "Atlantic > Mediterranean identity"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Discuss cultural backgrounds and international experiences with Portuguese people",
            "Show awareness of Portugal's European identity and geographic position",
            "Navigate conversations about nationality, immigration, and cultural diversity",
            "Demonstrate cultural sensitivity about Portuguese vs Spanish distinctions"
          ], "Nationality discussions are central to Portuguese social interaction. Show awareness of Portugal's European identity, Atlantic orientation, and distinct culture, and Portuguese people will see you as culturally sophisticated and respectful.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "português", translation: "Portuguese (masculine)" },
          { id: "e2", type: "flashcard", term: "francesa", translation: "French (feminine)" },
          { id: "e3", type: "flashcard", term: "alemão", translation: "German (masculine)" },
          { id: "e4", type: "flashcard", term: "italiana", translation: "Italian (feminine)" },
          { id: "e5", type: "flashcard", term: "espanhol", translation: "Spanish (masculine)" },
          { id: "e6", type: "flashcard", term: "americana", translation: "American (feminine)" },
          { id: "e7", type: "mcq", prompt: "How do you say 'She is German'?", options: ["Ela é alemão", "Ela é alemã", "Ela é alemanha"], correct: "Ela é alemã" },
          { id: "e8", type: "mcq", prompt: "Portugal joined the EU in:", options: ["1975", "1986", "1992", "2001"], correct: "1986" },
          { id: "e9", type: "typing", prompt: "Say 'I am Portuguese' (if you're female)", correct: "Sou portuguesa" },
          { id: "e10", type: "typing", prompt: "Say 'French culture' (feminine)", correct: "cultura francesa" },
          { id: "e11", type: "listening", audioTextPt: "brasileiro", correct: "brasileiro", prompt: "Type what you hear:" },
          { id: "e12", type: "matching", pairs: [
            { a: "alemão", b: "German (masculine)" },
            { a: "francesa", b: "French (feminine)" },
            { a: "português", b: "Portuguese (masculine)" },
            { a: "italiana", b: "Italian (feminine)" }
          ]},
          { id: "e13", type: "order", items: ["Sou", "português", "e", "europeu"], correct: "Sou português e europeu", prompt: "Order: 'I am Portuguese and European'" },
          { id: "e14", type: "pronunciation", audioTextPt: "alemã", options: ["alemã", "alemão", "alemanha"], correct: "alemã" }
        ]
      }
    ]
  },
  
  // M4: Family & Portuguese Social Structure (Dense PPP)
  {
    id: "m4",
    title: "Family & Portuguese Social Structure (Dense PPP)", 
    description: "Master Portuguese family vocabulary with deep cultural context about Portuguese family values, social hierarchy, and the central role of family in Portuguese society.",
    lessons: [
      {
        id: "m4l1",
        title: "Família & Valores Sociais",
        xp: 50,
        content: {
          title: "Portuguese Family Structure & Cultural Values",
          sections: [
            {
              title: "Essential Family Vocabulary",
              explanation: "Family is the cornerstone of Portuguese society. Understanding family vocabulary and relationships is crucial for navigating Portuguese social interactions and showing cultural sensitivity:",
              
              examples: [
                example("família", "family", "central to Portuguese identity"),
                example("pai", "father", "patriarchal respect - 'PIE'"),
                example("mãe", "mother", "family center - 'MAH-eh'"),
                example("filho/filha", "son/daughter", "pride and responsibility"),
                example("irmão/irmã", "brother/sister", "lifelong bonds"),
                example("avô/avó", "grandfather/grandmother", "wisdom and respect"),
                example("tio/tia", "uncle/aunt", "extended family importance"),
                example("primo/prima", "cousin", "close family ties"),
                example("sogro/sogra", "father-in-law/mother-in-law", "formal respect required"),
                example("genro/nora", "son-in-law/daughter-in-law", "family integration"),
                example("cunhado/cunhada", "brother-in-law/sister-in-law", "extended relationships"),
                example("padrinho/madrinha", "godfather/godmother", "spiritual family"),
                example("afilhado/afilhada", "godson/goddaughter", "special responsibility"),
                example("família alargada", "extended family", "Portuguese social unit"),
                example("valores familiares", "family values", "traditional Portuguese pride")
              ],
              
              keyPoints: [
                "Portuguese families include extensive extended family networks",
                "Godparents (padrinhos) have significant social and financial responsibilities",
                "Family hierarchy is respected, with elders having authority",
                "Family gatherings are frequent and attendance is expected"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Family Gender Agreement",
                  "All family terms have masculine/feminine forms based on the person's gender, not the speaker's.",
                  "meu pai/minha mãe, teu irmão/tua irmã"
                ),
                culturalRule(
                  "Portuguese Family Hierarchy",
                  "Portuguese families maintain clear hierarchy: grandparents → parents → children. Respect for elders is absolute and questioning authority is discouraged."
                ),
                pronunciationRule(
                  "Diminutives in Family Terms",
                  "Portuguese families use affectionate diminutives: papá (daddy), mamã (mommy), vovô/vovó (grandpa/grandma), maninho/maninha (little brother/sister)."
                )
              ],
              
              contrastPairs: [
                contrast("Nuclear vs Extended Family", [
                  ptVsEn("família nuclear", "nuclear family", "família alargada", "small vs extended"),
                  ptVsEn("pais e filhos", "parents and children", "toda a família", "immediate vs all family"),
                  ptVsEn("em casa", "at home", "na casa da família", "individual vs family home")
                ]),
                contrast("Formal vs Affectionate Terms", [
                  ptVsEn("pai", "father", "papá", "formal vs affectionate"),
                  ptVsEn("avô", "grandfather", "vovô", "formal vs diminutive"),
                  ptVsEn("irmão", "brother", "maninho", "standard vs affectionate")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Using nuclear family concepts in Portuguese context",
                  "Always consider extended family - uncles, aunts, cousins are very close",
                  "Portuguese people often live near extended family and consider them part of daily life, not distant relatives."
                ),
                pitfall(
                  "Forgetting godparent importance",
                  "Godparents (padrinhos) have real responsibilities and close relationships",
                  "Portuguese godparents are chosen for life and have financial, social, and spiritual obligations. They're not honorary titles."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "👨‍👩‍👧‍👦", 
                  "Portuguese Multi-Generational Living",
                  "Many Portuguese families live together across generations. It's normal for adult children to live with parents until marriage, and for elderly parents to live with adult children."
                ),
                culturalNote(
                  "🙏",
                  "Godparent Responsibilities", 
                  "Portuguese godparents are expected to help with education costs, provide guidance, and step in if parents can't care for the child. This is a serious, lifelong commitment."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "Your Portuguese friend mentions their 'padrinho' is helping pay for university. What is this relationship?",
                  ["Stepfather", "Godfather", "Uncle", "Family friend"],
                  "Godfather",
                  "Padrinhos (godparents) in Portugal have real financial and social responsibilities, including helping with education costs."
                )
              ],
              
              pronunciationGuide: pronunciationGuide([
                sound("ã", "irmã", "heavy nasal 'a' sound"),
                sound("ão", "irmão", "nasal 'ow' sound - eer-MOWN"),
                sound("lh", "filha", "like 'lli' in million - FEE-lya"),
                sound("nh", "sobrinho", "like 'ny' in canyon - so-BREE-nyo")
              ])
            },
            
            {
              title: "Portuguese Family Culture & Social Dynamics",
              explanation: "Master the sophisticated social dynamics of Portuguese family life, including hierarchy, obligations, celebrations, and the role of family in Portuguese identity:",
              
              examples: [
                example("reunião de família", "family gathering", "regular social obligation"),
                example("almoço de domingo", "Sunday lunch", "sacred family tradition"),
                example("respeito pelos mais velhos", "respect for elders", "fundamental value"),
                example("educação familiar", "family upbringing", "social responsibility"),
                example("tradições familiares", "family traditions", "cultural continuity"),
                example("apoio familiar", "family support", "emotional and financial"),
                example("honra da família", "family honor", "collective reputation"),
                example("gerações", "generations", "four often living together"),
                example("herança familiar", "family inheritance", "property and values"),
                example("nome de família", "family name", "identity and pride"),
                example("casa paterna", "family home", "emotional center"),
                example("laços familiares", "family bonds", "lifelong connections"),
                example("responsabilidade familiar", "family responsibility", "shared obligations"),
                example("união familiar", "family unity", "collective strength"),
                example("sangue da família", "family blood", "genetic and cultural bond")
              ],
              
              keyPoints: [
                "Sunday family lunches are sacred - business stops for family",
                "Children are expected to care for aging parents",
                "Family decisions are often collective, not individual",
                "Family reputation affects individual opportunities"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Sunday Family Tradition",
                  "Sunday lunch with extended family is almost mandatory. Shops close, work stops, and families gather. Refusing invitations is seen as family rejection."
                ),
                warningRule(
                  "Individual vs Family Decision-Making",
                  "Major life decisions (marriage, career, education) often involve family input. Pure individualism can seem selfish and disrespectful."
                ),
                grammarRule(
                  "Possessive Adjectives with Family",
                  "Family terms use possessive adjectives: meu pai, minha mãe, nossos filhos, vossa família.",
                  "meu/minha (my), teu/tua (your), nosso/nossa (our)"
                )
              ],
              
              contrastPairs: [
                contrast("Individual vs Family Priorities", [
                  ptVsEn("a minha carreira", "my career", "o bem da família", "individual vs family good"),
                  ptVsEn("decisão pessoal", "personal decision", "decisão familiar", "individual vs collective"),
                  ptVsEn("independência", "independence", "união familiar", "autonomy vs family unity")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Prioritizing individual goals over family obligations",
                  "Show respect for family input and collective decision-making",
                  "Portuguese culture values family harmony over individual achievement. Dismissing family input can damage relationships."
                ),
                pitfall(
                  "Skipping family gatherings for work or personal activities",
                  "Family events take priority over work, hobbies, or social plans",
                  "Portuguese people see family time as non-negotiable. Regular absence from family events is seen as family betrayal."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🍽️",
                  "Sacred Sunday Lunch Tradition",
                  "Portuguese Sunday lunch can last 3-4 hours with multiple generations. It's when family business is discussed, relationships are maintained, and cultural values are transmitted."
                ),
                culturalNote(
                  "🏠",
                  "Family Property Inheritance",
                  "Portuguese families often maintain family homes for generations. Selling family property requires consensus and is emotionally difficult."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "Your Portuguese colleague skips an important work meeting for Sunday family lunch. How should you interpret this?",
                  ["Unprofessional behavior", "Normal Portuguese priority", "Personal choice", "Disrespectful to employer"],
                  "Normal Portuguese priority",
                  "In Portuguese culture, Sunday family lunch takes absolute priority over work. This is respected and understood by Portuguese employers."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Family Quick Reference", [
            cheatCategory("Immediate Family", [
              "pai (father)", "mãe (mother)", 
              "filho/filha (son/daughter)",
              "irmão/irmã (brother/sister)",
              "marido/mulher (husband/wife)"
            ]),
            cheatCategory("Extended Family", [
              "avô/avó (grandfather/grandmother)",
              "tio/tia (uncle/aunt)",
              "primo/prima (cousin)",
              "sobrinho/sobrinha (nephew/niece)"
            ]),
            cheatCategory("In-Laws & Godparents", [
              "sogro/sogra (father/mother-in-law)",
              "genro/nora (son/daughter-in-law)",
              "cunhado/cunhada (brother/sister-in-law)",
              "padrinho/madrinha (godfather/godmother)"
            ]),
            cheatCategory("Affectionate Terms", [
              "papá/mamã (daddy/mommy)",
              "vovô/vovó (grandpa/grandma)",
              "maninho/maninha (little brother/sister)",
              "querido/querida (dear/darling)"
            ]),
            cheatCategory("Cultural Values", [
              "Sunday lunch = sacred family time",
              "Respect for elders = absolute",
              "Extended family = very close",
              "Godparents = real responsibilities",
              "Family decisions = collective"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Navigate Portuguese family gatherings and social expectations appropriately",
            "Understand the central role of family in Portuguese decision-making and identity",
            "Show proper respect for Portuguese family hierarchy and values",
            "Engage meaningfully in conversations about family relationships and obligations"
          ], "Family is the foundation of Portuguese society. Master family vocabulary and cultural understanding, and Portuguese people will see you as someone who truly understands their most important values and social structures.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "pai", translation: "father" },
          { id: "e2", type: "flashcard", term: "mãe", translation: "mother" },
          { id: "e3", type: "flashcard", term: "filho", translation: "son" },
          { id: "e4", type: "flashcard", term: "irmã", translation: "sister" },
          { id: "e5", type: "flashcard", term: "avô", translation: "grandfather" },
          { id: "e6", type: "flashcard", term: "tia", translation: "aunt" },
          { id: "e7", type: "flashcard", term: "padrinho", translation: "godfather" },
          { id: "e8", type: "mcq", prompt: "What is a 'padrinho' expected to do?", options: ["Just attend baptism", "Help with education costs", "Only give gifts", "No real responsibilities"], correct: "Help with education costs" },
          { id: "e9", type: "mcq", prompt: "When do Portuguese families traditionally gather?", options: ["Saturday dinner", "Sunday lunch", "Friday evening", "Weekday breakfast"], correct: "Sunday lunch" },
          { id: "e10", type: "typing", prompt: "Say 'my family' (feminine noun)", correct: "a minha família" },
          { id: "e11", type: "typing", prompt: "Say 'our grandfather'", correct: "o nosso avô" },
          { id: "e12", type: "listening", audioTextPt: "família", correct: "família", prompt: "Type what you hear:" },
          { id: "e13", type: "matching", pairs: [
            { a: "pai", b: "father" },
            { a: "irmã", b: "sister" },
            { a: "avô", b: "grandfather" },
            { a: "tia", b: "aunt" }
          ]},
          { id: "e14", type: "order", items: ["A", "minha", "família", "é", "grande"], correct: "A minha família é grande", prompt: "Order: 'My family is big'" }
        ]
      }
    ]
  },
  
  // M5: Colors & Portuguese Cultural Symbolism (Dense PPP)
  {
    id: "m5",
    title: "Colors & Portuguese Cultural Symbolism (Dense PPP)",
    description: "Master Portuguese colors with deep cultural context, national symbolism, regional associations, and the role of colors in Portuguese art, architecture, and daily life.",
    lessons: [
      {
        id: "m5l1",
        title: "Cores & Simbolismo Cultural",
        xp: 45,
        content: {
          title: "Portuguese Colors & Cultural Symbolism Mastery",
          sections: [
            {
              title: "Essential Colors & Portuguese Associations",
              explanation: "Colors in Portuguese culture carry deep symbolic meaning tied to history, religion, nature, and national identity. Understanding these associations helps you navigate Portuguese art, architecture, and cultural conversations:",
              
              examples: [
                example("vermelho", "red", "passion, revolution, carnations of 1974"),
                example("azul", "blue", "Portuguese tiles, ocean, hope"),
                example("verde", "green", "hope, nature, national flag"),
                example("amarelo", "yellow", "sun, happiness, royal color"),
                example("branco", "white", "purity, peace, Portuguese houses"),
                example("preto", "black", "formality, mourning, elegance"),
                example("cor-de-rosa", "pink", "tenderness, feminine, flowers"),
                example("laranja", "orange", "energy, autumn, citrus"),
                example("roxo/violeta", "purple", "royalty, spirituality, rare"),
                example("castanho", "brown", "earth, stability, traditional"),
                example("cinzento", "gray", "sophistication, neutrality, stone"),
                example("dourado", "golden", "wealth, religious art, luxury"),
                example("prateado", "silver", "modernity, technology, jewelry"),
                example("azul-marinho", "navy blue", "maritime tradition, uniforms"),
                example("verde-escuro", "dark green", "forests, traditional clothing")
              ],
              
              keyPoints: [
                "Portuguese tiles (azulejos) feature predominantly blue and white",
                "Red carnations symbolize the 1974 Carnation Revolution",
                "Green and red are the national flag colors representing hope and courage",
                "White houses with colorful trim are traditional Portuguese architecture"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Color Gender Agreement",
                  "Colors agree with the gender and number of nouns they modify.",
                  "casa branca, carro branco, casas brancas, carros brancos"
                ),
                culturalRule(
                  "Portuguese Azulejo Tradition",
                  "Blue and white tiles (azulejos) are Portugal's most iconic art form. They tell stories, decorate buildings, and represent Portuguese identity worldwide."
                ),
                pronunciationRule(
                  "Color Pronunciation Patterns",
                  "Portuguese colors often have nasal sounds: amarelo (ah-mah-REH-loo), castanho (kash-TAH-nyoo), cinzento (seen-ZEHN-too)."
                )
              ],
              
              contrastPairs: [
                contrast("Light vs Dark Shades", [
                  ptVsEn("azul claro", "light blue", "azul escuro", "light vs dark shades"),
                  ptVsEn("verde claro", "light green", "verde escuro", "pastel vs deep colors"),
                  ptVsEn("cor clara", "light color", "cor escura", "brightness contrast")
                ]),
                contrast("Portuguese vs International Symbolism", [
                  ptVsEn("vermelho revolucionário", "revolutionary red", "vermelho paixão", "political vs emotional"),
                  ptVsEn("azul português", "Portuguese blue", "azul comum", "cultural vs generic"),
                  ptVsEn("verde esperança", "green of hope", "verde natureza", "symbolic vs literal")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Ignoring color gender agreement",
                  "Always match color adjectives: carro vermelho, casa vermelha",
                  "Color adjectives must agree with the gender and number of the noun. This is strictly enforced in Portuguese."
                ),
                pitfall(
                  "Missing cultural color symbolism",
                  "Understand red carnations = revolution, blue = Portuguese identity",
                  "Portuguese colors have deep cultural meanings. Mentioning these shows cultural awareness and respect."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🇵🇹", 
                  "Carnation Revolution Colors",
                  "Red carnations placed in soldiers' rifles ended Portugal's dictatorship in 1974. Red flowers, especially carnations, symbolize freedom and democracy in Portugal."
                ),
                culturalNote(
                  "🎨",
                  "Azulejo Blue Cultural Identity", 
                  "The specific blue used in Portuguese tiles represents Portuguese maritime history and cultural identity. It's different from regular blue and deeply meaningful."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "You see red carnations in a Portuguese historical context. What do they likely represent?",
                  ["Romance", "The 1974 Revolution", "Christmas", "Farming"],
                  "The 1974 Revolution",
                  "Red carnations are the symbol of Portugal's peaceful Carnation Revolution in 1974, which ended the dictatorship and brought democracy."
                )
              ],
              
              pronunciationGuide: pronunciationGuide([
                sound("ão", "amarelo", "nasal ending in yellow - ah-mah-REH-loo"),
                sound("nh", "castanho", "like 'ny' in canyon - kash-TAH-nyoo"),
                sound("en", "cinzento", "nasal 'en' sound - seen-ZEHN-too"),
                sound("ul", "azul", "Portuguese 'ul' ending - ah-ZOOL")
              ])
            },
            
            {
              title: "Portuguese Architecture & Design Colors",
              explanation: "Master the sophisticated color vocabulary used in Portuguese architecture, design, and regional characteristics that define Portuguese visual culture:",
              
              examples: [
                example("azulejos azuis", "blue tiles", "Portuguese architectural identity"),
                example("casas brancas", "white houses", "traditional Portuguese villages"),
                example("portas coloridas", "colorful doors", "regional architectural charm"),
                example("telhados vermelhos", "red roofs", "Mediterranean influence"),
                example("janelas azuis", "blue windows", "coastal architectural tradition"),
                example("paredes caiadas", "whitewashed walls", "rural Portuguese style"),
                example("detalhes dourados", "golden details", "baroque church decoration"),
                example("ferro forjado preto", "black wrought iron", "traditional balconies"),
                example("tons pastel", "pastel tones", "modern Portuguese design"),
                example("cores vivas", "vibrant colors", "festival and celebration"),
                example("tons neutros", "neutral tones", "contemporary Portuguese architecture"),
                example("contrastes cromáticos", "chromatic contrasts", "artistic composition"),
                example("paleta tradicional", "traditional palette", "regional color schemes"),
                example("cores sazonais", "seasonal colors", "changing Portuguese landscapes"),
                example("harmonia de cores", "color harmony", "Portuguese aesthetic principles")
              ],
              
              keyPoints: [
                "Portuguese architecture features white bases with colorful accents",
                "Regional variations: coastal blues, interior earth tones, urban pastels",
                "Religious buildings use gold, red, and blue for symbolic purposes",
                "Modern Portuguese design balances tradition with contemporary palettes"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Regional Color Traditions",
                  "Each Portuguese region has characteristic colors: coastal areas favor blues and whites, interior regions use earth tones, cities embrace modern pastels."
                ),
                grammarRule(
                  "Compound Color Names",
                  "Portuguese creates complex colors by combining terms: azul-marinho, verde-escuro, cor-de-rosa.",
                  "Basic color + modifier = specific shade"
                ),
                warningRule(
                  "Sacred vs Secular Color Usage",
                  "Portuguese churches use specific color symbolism. Gold = divine, blue = heaven, red = sacrifice. Respect these religious color meanings."
                )
              ],
              
              contrastPairs: [
                contrast("Regional Color Preferences", [
                  ptVsEn("cores do litoral", "coastal colors", "cores do interior", "seaside vs inland"),
                  ptVsEn("azuis marinhos", "maritime blues", "tons terrosos", "ocean vs earth"),
                  ptVsEn("estilo urbano", "urban style", "estilo rural", "city vs countryside")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Using inappropriate colors in religious contexts",
                  "Respect traditional color symbolism in churches and religious art",
                  "Portuguese religious spaces have strict color traditions. Inappropriate color choices show cultural insensitivity."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🏛️",
                  "Portuguese Baroque Color Splendor",
                  "Portuguese baroque churches use gold, deep blues, and rich reds to create spiritual awe. These color combinations are uniquely Portuguese and culturally significant."
                ),
                culturalNote(
                  "🌊",
                  "Maritime Color Influence",
                  "Portugal's ocean orientation influences color preferences. Blues, whites, and sandy tones dominate coastal architecture and reflect Portuguese maritime identity."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "You're designing something for a Portuguese coastal town. Which color palette would be most culturally appropriate?",
                  ["Bright reds and oranges", "Blues and whites", "Dark greens and browns", "Purple and gold"],
                  "Blues and whites",
                  "Portuguese coastal areas traditionally use blues and whites, reflecting their maritime identity and architectural heritage."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Colors Quick Reference", [
            cheatCategory("Basic Colors", [
              "vermelho (red)", "azul (blue)", "verde (green)", "amarelo (yellow)",
              "branco (white)", "preto (black)", "cor-de-rosa (pink)", "laranja (orange)"
            ]),
            cheatCategory("Cultural Symbolism", [
              "vermelho = revolution, passion",
              "azul = Portuguese identity, ocean", 
              "verde = hope, nature",
              "branco = purity, traditional houses"
            ]),
            cheatCategory("Architectural Colors", [
              "azulejos azuis (blue tiles)",
              "casas brancas (white houses)",
              "telhados vermelhos (red roofs)",
              "detalhes dourados (golden details)"
            ]),
            cheatCategory("Shades & Tones", [
              "claro (light)", "escuro (dark)",
              "vivo (vibrant)", "pastel (pastel)",
              "neutro (neutral)", "brilhante (bright)"
            ]),
            cheatCategory("Grammar Rules", [
              "Colors agree with noun gender",
              "casa branca / carro branco",
              "Add -s for plural",
              "Compound colors: azul-marinho"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Describe Portuguese art, architecture, and design with cultural accuracy",
            "Understand color symbolism in Portuguese history and traditions", 
            "Navigate conversations about Portuguese visual culture and regional characteristics",
            "Show appreciation for Portuguese aesthetic values and artistic heritage"
          ], "Colors are deeply embedded in Portuguese cultural identity. Master color vocabulary and symbolism, and Portuguese people will see you as someone who truly appreciates their artistic heritage and cultural sophistication.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "vermelho", translation: "red" },
          { id: "e2", type: "flashcard", term: "azul", translation: "blue" },
          { id: "e3", type: "flashcard", term: "verde", translation: "green" },
          { id: "e4", type: "flashcard", term: "amarelo", translation: "yellow" },
          { id: "e5", type: "flashcard", term: "branco", translation: "white" },
          { id: "e6", type: "flashcard", term: "preto", translation: "black" },
          { id: "e7", type: "mcq", prompt: "What do red carnations symbolize in Portugal?", options: ["Romance", "The 1974 Revolution", "Christmas", "Good luck"], correct: "The 1974 Revolution" },
          { id: "e8", type: "mcq", prompt: "Portuguese blue tiles are called:", options: ["azuis", "azulejos", "azulados", "azulejo"], correct: "azulejos" },
          { id: "e9", type: "typing", prompt: "Say 'white house' (feminine)", correct: "casa branca" },
          { id: "e10", type: "typing", prompt: "Say 'blue car' (masculine)", correct: "carro azul" },
          { id: "e11", type: "listening", audioTextPt: "cor-de-rosa", correct: "cor-de-rosa", prompt: "Type what you hear:" },
          { id: "e12", type: "matching", pairs: [
            { a: "vermelho", b: "red" },
            { a: "azul", b: "blue" },
            { a: "verde", b: "green" },
            { a: "amarelo", b: "yellow" }
          ]},
          { id: "e13", type: "order", items: ["A", "casa", "é", "branca"], correct: "A casa é branca", prompt: "Order: 'The house is white'" }
        ]
      }
    ]
  },
  
  // M6: Portuguese Cuisine & Culinary Culture (Dense PPP)
  {
    id: "m6",
    title: "Portuguese Cuisine & Culinary Culture (Dense PPP)",
    description: "Master Portuguese food vocabulary with deep cultural context about Portuguese culinary traditions, regional specialties, dining etiquette, and the central role of food in Portuguese social life.",
    lessons: [
      {
        id: "m6l1",
        title: "Comida & Tradições Culinárias",
        xp: 55,
        content: {
          title: "Portuguese Cuisine & Culinary Cultural Mastery",
          sections: [
            {
              title: "Essential Portuguese Foods & Cultural Significance",
              explanation: "Portuguese cuisine reflects the country's maritime history, regional diversity, and social traditions. Understanding food vocabulary and cultural context is essential for Portuguese social integration:",
              
              examples: [
                example("bacalhau", "cod", "national dish - 'faithful friend'"),
                example("sardinha", "sardine", "popular tradition, grilled festivals"),
                example("pastéis de nata", "custard tarts", "iconic Portuguese pastry"),
                example("francesinha", "sandwich", "Porto specialty - hearty meal"),
                example("caldo verde", "kale soup", "comfort food, national symbol"),
                example("bifana", "pork sandwich", "popular quick meal"),
                example("cozido à portuguesa", "Portuguese stew", "traditional family meal"),
                example("arroz de marisco", "seafood rice", "coastal specialty"),
                example("cataplana", "seafood stew", "Algarve traditional dish"),
                example("feijoada", "bean stew", "hearty traditional meal"),
                example("queijo", "cheese", "Serra da Estrela specialty"),
                example("presunto", "ham", "traditional cured meat"),
                example("vinho verde", "green wine", "light, refreshing Portuguese wine"),
                example("café", "coffee", "social ritual, strong espresso"),
                example("pão", "bread", "essential every meal")
              ],
              
              keyPoints: [
                "Bacalhau (cod) has over 365 preparation methods - one for each day",
                "Portuguese meals are social events, not just nutrition",
                "Fresh seafood dominates coastal cuisine, meat in interior regions",
                "Coffee culture is central to Portuguese social interaction"
              ],
              
              ruleBoxes: [
                grammarRule(
                  "Food Gender and Articles",
                  "Portuguese foods have specific genders that affect articles and adjectives.",
                  "o bacalhau, a sardinha, os pastéis, as sopas"
                ),
                culturalRule(
                  "Portuguese Bacalhau Tradition",
                  "Cod (bacalhau) is the 'faithful friend' of Portuguese cuisine. Despite Portugal being coastal, dried cod from Norway is the national dish, reflecting historic trade relationships."
                ),
                pronunciationRule(
                  "Food Pronunciation Patterns",
                  "Portuguese food terms often have specific stress: bacalhau (ba-ka-LYOW), sardinha (sar-DEE-nya), francesinha (fran-se-ZEE-nya)."
                )
              ],
              
              contrastPairs: [
                contrast("Coastal vs Interior Cuisine", [
                  ptVsEn("peixe fresco", "fresh fish", "carne de porco", "coast vs interior"),
                  ptVsEn("marisco", "seafood", "enchidos", "ocean vs land protein"),
                  ptVsEn("cataplana", "seafood stew", "cozido", "regional specialties")
                ]),
                contrast("Traditional vs Modern Portuguese Food", [
                  ptVsEn("cozinha tradicional", "traditional cooking", "cozinha moderna", "old vs new"),
                  ptVsEn("receitas da avó", "grandmother's recipes", "fusão culinária", "heritage vs innovation"),
                  ptVsEn("taverna", "traditional tavern", "restaurante gourmet", "casual vs fine dining")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Refusing traditional Portuguese dishes",
                  "Show interest in bacalhau, sardines, and regional specialties",
                  "Portuguese people take pride in their cuisine. Refusing traditional foods without trying them can seem disrespectful to cultural heritage."
                ),
                pitfall(
                  "Eating alone when invited to join",
                  "Portuguese meals are social - accept invitations to eat together",
                  "Portuguese culture views eating as social bonding. Eating alone when others are present breaks social protocols."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🐟", 
                  "Bacalhau: The Faithful Friend",
                  "Portugal consumes more cod per capita than any other country. Bacalhau represents Portuguese resilience, maritime heritage, and culinary creativity."
                ),
                culturalNote(
                  "☕",
                  "Portuguese Coffee Culture", 
                  "Portuguese coffee (bica/café) is strong espresso taken standing at the bar. It's a social ritual, business meeting location, and daily necessity."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "A Portuguese friend invites you for 'bacalhau à Brás'. What should you know?",
                  ["It's a vegetarian dish", "It's the national cod dish", "It's a dessert", "It's a type of wine"],
                  "It's the national cod dish",
                  "Bacalhau à Brás is one of Portugal's most famous cod preparations, mixing cod with eggs and potatoes. It represents Portuguese culinary identity."
                )
              ],
              
              pronunciationGuide: pronunciationGuide([
                sound("lh", "bacalhau", "like 'lli' in million - ba-ka-LYOW"),
                sound("nh", "sardinha", "like 'ny' in canyon - sar-DEE-nya"),
                sound("ão", "pão", "heavy nasal sound - POWN"),
                sound("fe", "café", "stressed final syllable - ka-FEH")
              ])
            },
            
            {
              title: "Portuguese Dining Culture & Social Etiquette",
              explanation: "Master the sophisticated social dynamics of Portuguese dining, including meal timing, etiquette, restaurant culture, and the role of food in Portuguese relationships:",
              
              examples: [
                example("pequeno-almoço", "breakfast", "light meal - coffee and pastry"),
                example("almoço", "lunch", "main meal - family gathering"),
                example("lanche", "afternoon snack", "coffee and cake"),
                example("jantar", "dinner", "evening meal - lighter than lunch"),
                example("aperitivo", "appetizer", "social drinking before meals"),
                example("entrada", "starter", "first course"),
                example("prato principal", "main course", "centerpiece of meal"),
                example("sobremesa", "dessert", "sweet ending"),
                example("conta", "bill", "always split or offered by host"),
                example("gorjeta", "tip", "not obligatory but appreciated"),
                example("reserva", "reservation", "recommended for restaurants"),
                example("ementa", "menu", "daily offerings"),
                example("prato do dia", "dish of the day", "chef's special"),
                example("vinho da casa", "house wine", "restaurant's selection"),
                example("bom apetite", "enjoy your meal", "polite meal greeting")
              ],
              
              keyPoints: [
                "Portuguese lunch is the main meal, dinner is lighter",
                "Meals are social events - never rush Portuguese dining",
                "Coffee after meals is mandatory, not optional",
                "Sharing food shows friendship and trust"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Meal Timing Culture",
                  "Portuguese lunch (almoço) is sacred family time from 12-14h. Businesses close, families gather, and rushing is disrespectful to food and relationships."
                ),
                warningRule(
                  "Portuguese Restaurant Etiquette",
                  "Never split bills evenly in Portugal. The person who invites pays, or each person pays for exactly what they ordered. Equal splitting is seen as unfair."
                ),
                grammarRule(
                  "Meal-Related Verb Conjugations",
                  "Portuguese dining uses specific verbs: comer (to eat), beber (to drink), provar (to taste), partilhar (to share).",
                  "eu como, tu comes, ele come - present tense patterns"
                )
              ],
              
              contrastPairs: [
                contrast("Portuguese vs International Dining", [
                  ptVsEn("almoço longo", "long lunch", "almoço rápido", "leisurely vs rushed"),
                  ptVsEn("refeição em família", "family meal", "comer sozinho", "social vs individual"),
                  ptVsEn("partilhar pratos", "sharing dishes", "pratos individuais", "communal vs personal")
                ])
              ],
              
              pitfalls: [
                pitfall(
                  "Rushing through Portuguese meals",
                  "Allow time for conversation, multiple courses, and coffee",
                  "Portuguese dining is about relationships, not just food. Rushing suggests you don't value the social connection."
                ),
                pitfall(
                  "Refusing wine or coffee during meals",
                  "Accept at least a small amount to show respect for hospitality",
                  "Portuguese meals traditionally include wine and end with coffee. Refusing can seem antisocial or disrespectful."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🍽️",
                  "Portuguese Family Meal Traditions",
                  "Portuguese families eat together daily, sharing stories and maintaining relationships. The meal table is where family bonds are strengthened and cultural values transmitted."
                ),
                culturalNote(
                  "🏪",
                  "Portuguese Market Culture",
                  "Portuguese people shop at local markets for fresh ingredients daily. Relationships with vendors are important, and food quality is discussed seriously."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "Your Portuguese host offers you wine during lunch. What's the culturally appropriate response?",
                  ["Refuse politely", "Accept a small amount", "Ask for beer instead", "Say you don't drink"],
                  "Accept a small amount",
                  "In Portuguese culture, accepting wine during meals shows respect for hospitality, even if you only take a small amount."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Food & Dining Quick Reference", [
            cheatCategory("Essential Foods", [
              "bacalhau (cod - national dish)",
              "sardinha (sardine - summer festivals)", 
              "pastéis de nata (custard tarts)",
              "caldo verde (kale soup)",
              "francesinha (Porto sandwich)"
            ]),
            cheatCategory("Meals & Timing", [
              "pequeno-almoço (breakfast - light)",
              "almoço (lunch - main meal 12-14h)",
              "lanche (afternoon snack)",
              "jantar (dinner - lighter evening)"
            ]),
            cheatCategory("Dining Vocabulary", [
              "ementa (menu)", "conta (bill)",
              "reserva (reservation)", "gorjeta (tip)",
              "prato do dia (dish of the day)"
            ]),
            cheatCategory("Cultural Rules", [
              "Lunch = main meal (social time)",
              "Coffee after meals = mandatory",
              "Sharing food = friendship",
              "Don't rush Portuguese dining",
              "Accept wine/coffee = respect"
            ]),
            cheatCategory("Regional Specialties", [
              "Norte: francesinha, vinho verde",
              "Centro: leitão, queijo Serra",
              "Lisboa: pastéis de nata, ginja",
              "Alentejo: migas, vinho tinto",
              "Algarve: cataplana, marisco"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Navigate Portuguese restaurants, markets, and social dining situations confidently",
            "Understand Portuguese culinary culture and show respect for food traditions",
            "Build relationships through shared meals and proper dining etiquette",
            "Appreciate regional Portuguese specialties and their cultural significance"
          ], "Food is central to Portuguese social life and cultural identity. Master Portuguese cuisine vocabulary and dining culture, and Portuguese people will welcome you into their most intimate social spaces - the family table.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "bacalhau", translation: "cod" },
          { id: "e2", type: "flashcard", term: "sardinha", translation: "sardine" },
          { id: "e3", type: "flashcard", term: "pastéis de nata", translation: "custard tarts" },
          { id: "e4", type: "flashcard", term: "caldo verde", translation: "kale soup" },
          { id: "e5", type: "flashcard", term: "almoço", translation: "lunch" },
          { id: "e6", type: "flashcard", term: "jantar", translation: "dinner" },
          { id: "e7", type: "flashcard", term: "café", translation: "coffee" },
          { id: "e8", type: "mcq", prompt: "What is Portugal's national dish?", options: ["Sardinha", "Bacalhau", "Francesinha", "Caldo verde"], correct: "Bacalhau" },
          { id: "e9", type: "mcq", prompt: "When is the main meal in Portugal?", options: ["Breakfast", "Lunch", "Dinner", "Afternoon snack"], correct: "Lunch" },
          { id: "e10", type: "typing", prompt: "Say 'I want coffee' (quero)", correct: "Quero café" },
          { id: "e11", type: "typing", prompt: "Say 'the bill, please'", correct: "A conta, por favor" },
          { id: "e12", type: "listening", audioTextPt: "bacalhau", correct: "bacalhau", prompt: "Type what you hear:" },
          { id: "e13", type: "matching", pairs: [
            { a: "bacalhau", b: "cod" },
            { a: "almoço", b: "lunch" },
            { a: "café", b: "coffee" },
            { a: "jantar", b: "dinner" }
          ]},
          { id: "e14", type: "order", items: ["Quero", "pastéis", "de", "nata"], correct: "Quero pastéis de nata", prompt: "Order: 'I want custard tarts'" }
        ]
      }
    ]
  }
];

export default phaseADenseModules;
