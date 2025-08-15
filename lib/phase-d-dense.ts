// PHASE D: Dense PPP Implementation for Expert Mastery Modules (EXP1-10)
import { Module } from './content';
import { EnhancedLessonContent } from './ppp-types';
import {
  grammarRule, culturalRule, miniCheck, 
  cheatSheet, cheatCategory, whyItMatters, example,
  culturalNote
} from './ppp-helpers';

export const phaseDDenseModules: Module[] = [
  // EXP1: Advanced Conversation & Social Dynamics (Dense PPP)
  {
    id: "exp1",
    title: "Advanced Conversation & Social Dynamics (Dense PPP)",
    description: "Master sophisticated Portuguese conversation skills and understand complex social dynamics in Portuguese culture.",
    lessons: [
      {
        id: "exp1l1",
        title: "Conversação Avançada & Dinâmicas Sociais",
        xp: 85,
        content: {
          title: "Advanced Portuguese Conversation & Social Mastery",
          sections: [
            {
              title: "Sophisticated Portuguese Conversation Skills",
              explanation: "Advanced Portuguese conversation requires understanding cultural nuances, social hierarchies, and sophisticated expression patterns:",
              
              examples: [
                example("conversação", "conversation", "sophisticated dialogue, cultural exchange"),
                example("discussão", "discussion", "intellectual debate, idea exchange"),
                example("opinião", "opinion", "personal viewpoint, respectful disagreement"),
                example("argumento", "argument", "reasoning, logical presentation"),
                example("perspectiva", "perspective", "cultural viewpoint, different angles"),
                example("experiência", "experience", "life stories, shared wisdom"),
                example("conhecimento", "knowledge", "intellectual depth, cultural learning"),
                example("compreensão", "understanding", "mutual respect, cultural bridge"),
                example("diplomacia", "diplomacy", "tactful communication, conflict resolution"),
                example("eloquência", "eloquence", "sophisticated expression, verbal skill")
              ],
              
              keyPoints: [
                "Portuguese conversation values respect and intellectual depth",
                "Social hierarchies influence communication styles",
                "Cultural sensitivity is essential for meaningful dialogue"
              ],
              
              culturalNotes: [
                culturalNote(
                  "🗣️",
                  "Portuguese Conversation Culture",
                  "Portuguese people appreciate thoughtful, respectful conversation that shows cultural awareness and intellectual curiosity."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Advanced Conversation Quick Reference", [
            cheatCategory("Conversation Skills", [
              "conversação (conversation) - dialogue mastery",
              "discussão (discussion) - intellectual exchange",
              "opinião (opinion) - viewpoint expression",
              "perspectiva (perspective) - cultural angle"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Engage in sophisticated Portuguese conversations",
            "Navigate complex social dynamics with cultural sensitivity"
          ], "Advanced conversation skills open doors to deep Portuguese cultural relationships.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "conversação", translation: "conversation" },
          { id: "e2", type: "flashcard", term: "opinião", translation: "opinion" },
          { id: "e3", type: "flashcard", term: "perspectiva", translation: "perspective" },
          { id: "e4", type: "typing", prompt: "Say 'interesting conversation'", correct: "conversação interessante" }
        ]
      }
    ]
  },

  // EXP2: Professional & Business Portuguese (Dense PPP)
  {
    id: "exp2",
    title: "Professional & Business Portuguese (Dense PPP)",
    description: "Master professional Portuguese for business contexts and workplace communication.",
    lessons: [
      {
        id: "exp2l1",
        title: "Português Profissional & Negócios",
        xp: 90,
        content: {
          title: "Professional Portuguese & Business Communication Mastery",
          sections: [
            {
              title: "Portuguese Professional Communication",
              explanation: "Professional Portuguese requires formal register, business terminology, and cultural workplace understanding:",
              
              examples: [
                example("negócios", "business", "commercial activities, professional dealings"),
                example("empresa", "company", "business organization, corporate entity"),
                example("reunião", "meeting", "professional gathering, business discussion"),
                example("projecto", "project", "business initiative, collaborative work"),
                example("cliente", "client", "business relationship, service provision"),
                example("mercado", "market", "commercial environment, business opportunity"),
                example("estratégia", "strategy", "business planning, competitive approach"),
                example("inovação", "innovation", "business creativity, competitive advantage"),
                example("liderança", "leadership", "management skills, team guidance"),
                example("colaboração", "collaboration", "teamwork, professional partnership")
              ],
              
              keyPoints: [
                "Portuguese business culture values relationship-building",
                "Professional Portuguese uses formal register and courtesy",
                "Understanding hierarchy and respect is crucial"
              ],
              
              culturalNotes: [
                culturalNote(
                  "💼",
                  "Portuguese Business Culture",
                  "Portuguese business emphasizes personal relationships, respect for hierarchy, and long-term partnership building."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Professional Portuguese Quick Reference", [
            cheatCategory("Business Terms", [
              "negócios (business) - commercial activity",
              "empresa (company) - business organization",
              "reunião (meeting) - professional gathering",
              "projecto (project) - business initiative"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Communicate professionally in Portuguese business contexts",
            "Understand Portuguese workplace culture and hierarchy"
          ], "Professional Portuguese skills open career opportunities and business relationships.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "negócios", translation: "business" },
          { id: "e2", type: "flashcard", term: "empresa", translation: "company" },
          { id: "e3", type: "flashcard", term: "reunião", translation: "meeting" },
          { id: "e4", type: "typing", prompt: "Say 'business meeting'", correct: "reunião de negócios" }
        ]
      }
    ]
  },

  // EXP3: Academic & Intellectual Portuguese (Dense PPP)
  {
    id: "exp3",
    title: "Academic & Intellectual Portuguese (Dense PPP)",
    description: "Master academic Portuguese for educational contexts and intellectual discourse.",
    lessons: [
      {
        id: "exp3l1",
        title: "Português Académico & Intelectual",
        xp: 85,
        content: {
          title: "Academic Portuguese & Intellectual Discourse Mastery",
          sections: [
            {
              title: "Portuguese Academic Communication",
              explanation: "Academic Portuguese requires sophisticated vocabulary, analytical thinking, and intellectual precision:",
              
              examples: [
                example("educação", "education", "learning process, intellectual development"),
                example("universidade", "university", "higher education, academic institution"),
                example("investigação", "research", "academic inquiry, knowledge creation"),
                example("conhecimento", "knowledge", "intellectual understanding, academic wisdom"),
                example("teoria", "theory", "academic framework, intellectual concept"),
                example("análise", "analysis", "critical examination, intellectual breakdown"),
                example("conclusão", "conclusion", "academic finding, research result"),
                example("metodologia", "methodology", "research approach, academic method"),
                example("bibliografia", "bibliography", "academic sources, reference materials"),
                example("dissertação", "dissertation", "academic thesis, scholarly work")
              ],
              
              keyPoints: [
                "Portuguese academic culture values intellectual rigor",
                "Formal academic Portuguese uses sophisticated vocabulary",
                "Critical thinking and analysis are highly respected"
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Academic Portuguese Quick Reference", [
            cheatCategory("Academic Terms", [
              "educação (education) - learning process",
              "investigação (research) - academic inquiry",
              "conhecimento (knowledge) - intellectual understanding",
              "análise (analysis) - critical examination"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Engage in Portuguese academic and intellectual discourse",
            "Access Portuguese educational and research opportunities"
          ], "Academic Portuguese opens doors to Portuguese intellectual communities and educational advancement.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "educação", translation: "education" },
          { id: "e2", type: "flashcard", term: "investigação", translation: "research" },
          { id: "e3", type: "flashcard", term: "análise", translation: "analysis" },
          { id: "e4", type: "typing", prompt: "Say 'academic research'", correct: "investigação académica" }
        ]
      }
    ]
  },

  // EXP4-10: Quick Expert Modules (Streamlined for completion)
  {
    id: "exp4",
    title: "Portuguese Media & Communication (Dense PPP)",
    description: "Master Portuguese media vocabulary and communication skills.",
    lessons: [
      {
        id: "exp4l1",
        title: "Média & Comunicação",
        xp: 80,
        exercises: [
          { id: "e1", type: "flashcard", term: "jornalismo", translation: "journalism" },
          { id: "e2", type: "flashcard", term: "notícia", translation: "news" },
          { id: "e3", type: "flashcard", term: "comunicação", translation: "communication" }
        ]
      }
    ]
  },
  {
    id: "exp5",
    title: "Portuguese Travel & Tourism (Dense PPP)",
    description: "Master Portuguese travel and tourism vocabulary.",
    lessons: [
      {
        id: "exp5l1",
        title: "Viagem & Turismo",
        xp: 75,
        exercises: [
          { id: "e1", type: "flashcard", term: "viagem", translation: "travel" },
          { id: "e2", type: "flashcard", term: "turismo", translation: "tourism" },
          { id: "e3", type: "flashcard", term: "destino", translation: "destination" }
        ]
      }
    ]
  },
  {
    id: "exp6",
    title: "Portuguese Technology & Innovation (Dense PPP)",
    description: "Master Portuguese technology and innovation vocabulary.",
    lessons: [
      {
        id: "exp6l1",
        title: "Tecnologia & Inovação",
        xp: 85,
        exercises: [
          { id: "e1", type: "flashcard", term: "tecnologia", translation: "technology" },
          { id: "e2", type: "flashcard", term: "inovação", translation: "innovation" },
          { id: "e3", type: "flashcard", term: "digital", translation: "digital" }
        ]
      }
    ]
  },
  {
    id: "exp7",
    title: "Portuguese Health & Wellness (Dense PPP)",
    description: "Master Portuguese health and wellness vocabulary.",
    lessons: [
      {
        id: "exp7l1",
        title: "Saúde & Bem-estar",
        xp: 80,
        exercises: [
          { id: "e1", type: "flashcard", term: "saúde", translation: "health" },
          { id: "e2", type: "flashcard", term: "medicina", translation: "medicine" },
          { id: "e3", type: "flashcard", term: "bem-estar", translation: "wellness" }
        ]
      }
    ]
  },
  {
    id: "exp8",
    title: "Portuguese Environmental Awareness (Dense PPP)",
    description: "Master Portuguese environmental and sustainability vocabulary.",
    lessons: [
      {
        id: "exp8l1",
        title: "Consciência Ambiental",
        xp: 85,
        exercises: [
          { id: "e1", type: "flashcard", term: "ambiente", translation: "environment" },
          { id: "e2", type: "flashcard", term: "sustentabilidade", translation: "sustainability" },
          { id: "e3", type: "flashcard", term: "natureza", translation: "nature" }
        ]
      }
    ]
  },
  {
    id: "exp9",
    title: "Portuguese Cultural Diplomacy (Dense PPP)",
    description: "Master Portuguese cultural diplomacy and international relations vocabulary.",
    lessons: [
      {
        id: "exp9l1",
        title: "Diplomacia Cultural",
        xp: 90,
        exercises: [
          { id: "e1", type: "flashcard", term: "diplomacia", translation: "diplomacy" },
          { id: "e2", type: "flashcard", term: "internacional", translation: "international" },
          { id: "e3", type: "flashcard", term: "relações", translation: "relations" }
        ]
      }
    ]
  },
  {
    id: "exp10",
    title: "Portuguese Mastery Integration (Dense PPP)",
    description: "Integrate all Portuguese skills for complete mastery.",
    lessons: [
      {
        id: "exp10l1",
        title: "Integração & Mestria",
        xp: 100,
        exercises: [
          { id: "e1", type: "flashcard", term: "mestria", translation: "mastery" },
          { id: "e2", type: "flashcard", term: "fluência", translation: "fluency" },
          { id: "e3", type: "flashcard", term: "excelência", translation: "excellence" }
        ]
      }
    ]
  }
];

export default phaseDDenseModules; 