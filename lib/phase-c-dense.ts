// PHASE C: Dense PPP Implementation for Cultural Deep-Dive Modules (CULT1-3)
import { Module } from './content';
import { EnhancedLessonContent } from './ppp-types';
import {
  grammarRule, culturalRule, miniCheck, 
  cheatSheet, cheatCategory, whyItMatters, example,
  culturalNote
} from './ppp-helpers';

export const phaseCDenseModules: Module[] = [
  // CULT1: Portuguese Heritage & Traditions (Dense PPP)
  {
    id: "cult1",
    title: "Portuguese Heritage & Traditions (Dense PPP)",
    description: "Master Portuguese cultural heritage with deep context about traditions, festivals, and values.",
    lessons: [
      {
        id: "cult1l1",
        title: "Tradições & Patrimônio Cultural",
        xp: 70,
        content: {
          title: "Portuguese Cultural Heritage & Living Traditions Mastery",
          sections: [
            {
              title: "Essential Portuguese Cultural Heritage",
              explanation: "Portuguese cultural heritage reflects centuries of maritime exploration and deep regional traditions:",
              
              examples: [
                example("fado", "traditional Portuguese music", "UNESCO heritage, Portuguese soul"),
                example("azulejos", "decorative tiles", "architectural identity, storytelling art"),
                example("festa", "festival/celebration", "community bonding, cultural expression"),
                example("tradição", "tradition", "ancestral wisdom, cultural continuity"),
                example("património", "heritage", "cultural legacy, national treasure"),
                example("artesanato", "handicrafts", "traditional skills, regional identity"),
                example("gastronomia", "gastronomy", "culinary heritage, regional specialties"),
                example("folclore", "folklore", "oral traditions, cultural memory"),
                example("castelo", "castle", "medieval heritage, Portuguese history"),
                example("aldeia", "village", "rural heritage, traditional lifestyle")
              ],
              
              keyPoints: [
                "Portuguese heritage combines religious, maritime, and rural traditions",
                "Fado music represents the Portuguese soul and 'saudade' emotion",
                "Regional festivals maintain community bonds and cultural identity"
              ],
              
              ruleBoxes: [
                culturalRule(
                  "Portuguese Festival Calendar Importance",
                  "Portuguese festivals (festas) are central to community life, combining religious devotion, cultural expression, and social bonding."
                ),
                culturalRule(
                  "Fado as Portuguese Cultural Expression",
                  "Fado music expresses 'saudade' - a uniquely Portuguese emotion of longing, nostalgia, and bittersweet beauty."
                )
              ],
              
              culturalNotes: [
                culturalNote(
                  "🎵", 
                  "Fado: The Portuguese Soul in Music",
                  "UNESCO recognized fado as Portuguese cultural heritage. Understanding fado means understanding the Portuguese heart."
                ),
                culturalNote(
                  "🎨",
                  "Azulejos: Portuguese Storytelling Art",
                  "Portuguese tiles tell stories, commemorate events, and represent Portuguese artistic genius."
                )
              ],
              
              miniChecks: [
                miniCheck(
                  "What Portuguese music UNESCO recognized as cultural heritage?",
                  ["Folclore", "Fado", "Música popular"],
                  "Fado",
                  "UNESCO recognized fado as Portuguese Intangible Cultural Heritage."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Cultural Heritage Quick Reference", [
            cheatCategory("Essential Heritage", [
              "fado (traditional music) - Portuguese soul",
              "azulejos (decorative tiles) - architectural art",
              "festa (festival) - community celebration",
              "património (heritage) - cultural legacy"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Understand Portuguese cultural identity and what makes Portugal unique",
            "Participate respectfully in Portuguese festivals and cultural events"
          ], "Portuguese cultural heritage is the foundation of national identity.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "fado", translation: "traditional Portuguese music" },
          { id: "e2", type: "flashcard", term: "azulejos", translation: "decorative tiles" },
          { id: "e3", type: "flashcard", term: "festa", translation: "festival" },
          { id: "e4", type: "flashcard", term: "tradição", translation: "tradition" },
          { id: "e5", type: "mcq", prompt: "What Portuguese music did UNESCO recognize?", options: ["Folclore", "Fado", "Popular"], correct: "Fado" }
        ]
      }
    ]
  },

  // CULT2: Portuguese History & National Identity (Dense PPP)
  {
    id: "cult2",
    title: "Portuguese History & National Identity (Dense PPP)",
    description: "Master Portuguese historical consciousness with context about national formation and maritime discoveries.",
    lessons: [
      {
        id: "cult2l1",
        title: "História & Identidade Nacional",
        xp: 75,
        content: {
          title: "Portuguese Historical Consciousness & National Identity Mastery",
          sections: [
            {
              title: "Essential Portuguese Historical Consciousness",
              explanation: "Portuguese history shapes national identity through maritime discoveries and independence struggles:",
              
              examples: [
                example("descobrimentos", "discoveries", "Age of Discovery, Portuguese exploration"),
                example("navegação", "navigation", "maritime heritage, Portuguese sailors"),
                example("império", "empire", "Portuguese colonial history, global reach"),
                example("independência", "independence", "Portuguese sovereignty, national pride"),
                example("revolução", "revolution", "1974 Carnation Revolution, democracy"),
                example("república", "republic", "Portuguese political system, modern Portugal"),
                example("navegadores", "navigators", "Portuguese explorers, maritime heroes"),
                example("caravela", "caravel", "Portuguese ship design, exploration vehicle"),
                example("herói", "hero", "Portuguese national heroes, historical figures"),
                example("batalha", "battle", "Portuguese military history, defining moments")
              ],
              
              keyPoints: [
                "Portuguese discoveries created the first global empire",
                "Portuguese independence from Spain (1640) defines national pride",
                "1974 Carnation Revolution brought democracy and modern Portugal"
              ],
              
              culturalNotes: [
                culturalNote(
                  "⚓",
                  "Portuguese Maritime Pioneer Legacy",
                  "Portuguese navigators pioneered ocean exploration, connecting Europe to Asia."
                ),
                culturalNote(
                  "🌹",
                  "Carnation Revolution Cultural Impact",
                  "The 1974 revolution ended dictatorship peacefully, using red carnations as symbols."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese History Quick Reference", [
            cheatCategory("Historical Periods", [
              "descobrimentos (discoveries) - 15th-16th centuries",
              "império (empire) - global Portuguese reach",
              "independência (independence) - 1640 from Spain",
              "revolução (revolution) - 1974 democracy"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Understand Portuguese national pride and historical consciousness",
            "Appreciate Portuguese contributions to world history"
          ], "Portuguese history shaped the modern world through discoveries and exploration.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "descobrimentos", translation: "discoveries" },
          { id: "e2", type: "flashcard", term: "navegação", translation: "navigation" },
          { id: "e3", type: "flashcard", term: "revolução", translation: "revolution" },
          { id: "e4", type: "flashcard", term: "independência", translation: "independence" },
          { id: "e5", type: "typing", prompt: "Say 'Portuguese discoveries'", correct: "descobrimentos portugueses" }
        ]
      }
    ]
  },

  // CULT3: Portuguese Arts & Literature (Dense PPP)
  {
    id: "cult3",
    title: "Portuguese Arts & Literature (Dense PPP)",
    description: "Master Portuguese intellectual and artistic culture with context about literature and visual arts.",
    lessons: [
      {
        id: "cult3l1",
        title: "Artes & Literatura Portuguesa",
        xp: 80,
        content: {
          title: "Portuguese Arts & Literary Cultural Mastery",
          sections: [
            {
              title: "Essential Portuguese Arts & Literature",
              explanation: "Portuguese arts and literature reflect the nation's intellectual depth and creative genius:",
              
              examples: [
                example("literatura", "literature", "Portuguese literary heritage, global influence"),
                example("poesia", "poetry", "Portuguese poetic tradition, emotional expression"),
                example("romance", "novel", "Portuguese narrative tradition, modern literature"),
                example("teatro", "theater", "Portuguese dramatic arts, cultural expression"),
                example("pintura", "painting", "Portuguese visual arts, artistic heritage"),
                example("arquitectura", "architecture", "Portuguese architectural heritage, unique style"),
                example("música", "music", "Portuguese musical tradition, cultural expression"),
                example("escritor", "writer", "Portuguese authors, literary figures"),
                example("poeta", "poet", "Portuguese poets, lyrical tradition"),
                example("artista", "artist", "Portuguese artists, creative genius")
              ],
              
              keyPoints: [
                "Portuguese literature includes world-renowned authors and poets",
                "Portuguese architecture blends influences creating unique styles",
                "Portuguese intellectual culture values depth and sophistication"
              ],
              
              culturalNotes: [
                culturalNote(
                  "📚",
                  "Portuguese Literary Genius",
                  "Portuguese literature includes global figures like Luís de Camões, José Saramago, and Fernando Pessoa."
                ),
                culturalNote(
                  "🏛️",
                  "Portuguese Architectural Innovation",
                  "Portuguese developed unique styles like Manueline and Pombaline, showing creativity and adaptation."
                )
              ]
            }
          ],
          
          cheatSheet: cheatSheet("Portuguese Arts Quick Reference", [
            cheatCategory("Literary Forms", [
              "literatura (literature) - written heritage",
              "poesia (poetry) - lyrical tradition",
              "romance (novel) - narrative art",
              "teatro (theater) - dramatic expression"
            ])
          ]),
          
          whyItMatters: whyItMatters([
            "Appreciate Portuguese intellectual and artistic contributions",
            "Understand Portuguese cultural sophistication"
          ], "Portuguese arts and literature represent the nation's intellectual soul and creative genius.")
        } as EnhancedLessonContent,
        
        exercises: [
          { id: "e1", type: "flashcard", term: "literatura", translation: "literature" },
          { id: "e2", type: "flashcard", term: "poesia", translation: "poetry" },
          { id: "e3", type: "flashcard", term: "pintura", translation: "painting" },
          { id: "e4", type: "flashcard", term: "escritor", translation: "writer" },
          { id: "e5", type: "typing", prompt: "Say 'Portuguese literature'", correct: "literatura portuguesa" }
        ]
      }
    ]
  }
];

export default phaseCDenseModules;
