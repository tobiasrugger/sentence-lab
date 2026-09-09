/* ============================================================
   SENTENCE LAB — CONTENT PACK
   This is the only file you edit to add activities.
   Nothing here is code. It is all data.

   ------------------------------------------------------------
   FOUR ACTIVITY TYPES ("tool")
   ------------------------------------------------------------
   "combine"  Student sees 2-4 short sentences and fuses them into one.
   "write"    Student rewrites one sentence to fix or use a target structure.
   "blank"    Student fills a gap. Tapping options, or typing.
   "proof"    Student finds and fixes errors in a short passage.

   ------------------------------------------------------------
   HOW FEEDBACK WORKS
   ------------------------------------------------------------
   Each prompt has up to five attempts. Order of evaluation:
     1. Response is normalized (lowercase, spaces collapsed, curly quotes fixed).
     2. If it matches anything in "optimal" -> correct.
     3. Otherwise "rules" run top to bottom. The FIRST rule that fires
        is the only feedback shown. Put the biggest problem first.
     4. If no rule fires and "mechanics" is on, capital / end-punctuation
        are checked last (Quill's order: meaning first, mechanics last).
     5. If still nothing and the activity has "ai": true, Claude writes
        one short hint through the Supabase proxy.
     6. Otherwise the activity's "fallback" line is shown.

   RULE SHAPES
     { when: "contains", pattern: "\\band\\b",  feedback: "..." }
        fires when the pattern IS present
     { when: "missing",  pattern: "\\bbut\\b",  feedback: "..." }
        fires when the pattern is NOT present
     { when: "shorter",  than: 5,               feedback: "..." }
        fires when the response has fewer than N words
     { when: "same",                            feedback: "..." }
        fires when they just copied a cue sentence back

   Patterns are regular expressions written as strings, case-insensitive.
   \\b means "word boundary" — use it so "and" doesn't match "sandwich".

   ------------------------------------------------------------
   TRANSLATIONS
   ------------------------------------------------------------
   Any "directions" can carry a "t" object keyed by language code.
   Students pick their language once and it sticks.
   Codes used across your suite: es zh vi ar tl pt ru ja ko fr ne
   ============================================================ */

window.QF_CONTENT = {

  meta: {
    title: "Sentence Lab",
    subtitle: "Galileo ELD",
    languages: ["es", "zh", "vi", "ar", "tl", "pt", "ne"]
  },

  /* Skill labels shown in the reports. Add your own freely.
     The key is what you write in a prompt's "skill" field. */
  skills: {
    "present-simple":        "Present simple",
    "past-simple":           "Past simple",
    "subject-verb":          "Subject-verb agreement",
    "coordinating-because":  "Joining with because",
    "coordinating-but":      "Joining with but",
    "coordinating-so":       "Joining with so",
    "adjective-order":       "Putting adjectives before nouns",
    "articles":              "A, an, the",
    "capitalization":        "Capital letters",
    "end-punctuation":       "End punctuation",
    "prepositions-place":    "Prepositions of place",
    "plural-nouns":          "Plural nouns"
  },

  activities: [

    /* ========================================================
       1. COMBINE — the sentence-combining engine
       ======================================================== */
    {
      id: "cmb-because-01",
      title: "Why? Joining with because",
      tool: "combine",
      level: "Newcomer",
      skill: "coordinating-because",
      standard: "ELD.PI.9-10.11",
      mechanics: true,
      ai: false,
      fallback: "Read your sentence out loud. Does it use because to tell why?",
      directions: {
        text: "Put the ideas together in ONE sentence. Use because.",
        t: {
          es: "Une las ideas en UNA sola oración. Usa because.",
          zh: "把这些想法合并成一个句子。使用 because。",
          vi: "Ghép các ý thành MỘT câu. Dùng because.",
          ar: "اجمع الأفكار في جملة واحدة. استخدم because.",
          tl: "Pagsamahin ang mga ideya sa ISANG pangungusap. Gamitin ang because.",
          pt: "Junte as ideias em UMA frase. Use because.",
          ne: "विचारहरूलाई एउटै वाक्यमा जोड्नुहोस्। because प्रयोग गर्नुहोस्।"
        }
      },
      prompts: [
        {
          id: "p1",
          skill: "coordinating-because",
          cues: ["Marisol was tired.", "She worked all night."],
          optimal: [
            "Marisol was tired because she worked all night.",
            "Because she worked all night, Marisol was tired.",
            "Because Marisol worked all night, she was tired."
          ],
          rules: [
            { when: "same", feedback: "Use both ideas. Your sentence needs to say she was tired AND why." },
            { when: "contains", pattern: "\\band\\b", feedback: "And joins the ideas, but it does not tell why. Which word tells why?" },
            { when: "missing", pattern: "\\bbecause\\b", feedback: "Use the word because to tell why she was tired." },
            { when: "missing", pattern: "\\btired\\b", feedback: "Keep the word tired. That is the first idea." },
            { when: "missing", pattern: "worked all night", feedback: "Keep the words worked all night. That is the reason." }
          ]
        },
        {
          id: "p2",
          skill: "coordinating-because",
          cues: ["The bus was late.", "There was an accident."],
          optimal: [
            "The bus was late because there was an accident.",
            "Because there was an accident, the bus was late."
          ],
          rules: [
            { when: "contains", pattern: "\\bso\\b", feedback: "So tells the result. Here you need the word that tells the reason." },
            { when: "missing", pattern: "\\bbecause\\b", feedback: "Use because to give the reason the bus was late." },
            { when: "shorter", than: 7, feedback: "Your sentence is missing an idea. Use both sentences." }
          ]
        },
        {
          id: "p3",
          skill: "coordinating-because",
          cues: ["Danny did not eat lunch.", "He forgot his money."],
          optimal: [
            "Danny did not eat lunch because he forgot his money.",
            "Because he forgot his money, Danny did not eat lunch.",
            "Because Danny forgot his money, he did not eat lunch."
          ],
          rules: [
            { when: "contains", pattern: "\\bbut\\b", feedback: "But shows a difference. Here you are telling why. Try because." },
            { when: "missing", pattern: "\\bbecause\\b", feedback: "Use because to tell why Danny did not eat." },
            { when: "contains", pattern: "\\bdanny\\b.*\\bdanny\\b", feedback: "Say Danny one time. Use he for the second one." }
          ]
        }
      ]
    },

    /* ========================================================
       2. WRITE — rewrite one sentence, target one structure
       ======================================================== */
    {
      id: "wrt-past-01",
      title: "Yesterday: past simple",
      tool: "write",
      level: "Low beginner",
      skill: "past-simple",
      standard: "ELD.PI.9-10.10",
      mechanics: true,
      ai: false,
      fallback: "Look at the verb. Yesterday means the action is finished.",
      directions: {
        text: "Rewrite the sentence. Make it about YESTERDAY.",
        t: {
          es: "Reescribe la oración. Que sea sobre AYER.",
          zh: "重写这个句子。把它改成关于昨天的。",
          vi: "Viết lại câu. Làm cho câu nói về HÔM QUA.",
          ar: "أعد كتابة الجملة لتتحدث عن الأمس.",
          tl: "Isulat muli ang pangungusap. Gawin itong tungkol KAHAPON.",
          pt: "Reescreva a frase. Faça sobre ONTEM.",
          ne: "वाक्य पुनः लेख्नुहोस्। यसलाई हिजोको बारेमा बनाउनुहोस्।"
        }
      },
      prompts: [
        {
          id: "p1",
          skill: "past-simple",
          stem: "I walk to school.",
          hint: "Yesterday, ...",
          optimal: ["yesterday i walked to school", "i walked to school yesterday", "i walked to school"],
          rules: [
            { when: "contains", pattern: "\\bwalk\\b(?!ed)", feedback: "Walk is happening now. Add -ed to make it finished." },
            { when: "contains", pattern: "\\bwalkd\\b|\\bwalket\\b", feedback: "Almost. The spelling is walked." },
            { when: "missing", pattern: "\\bwalked\\b", feedback: "Use the past form of walk." }
          ]
        },
        {
          id: "p2",
          skill: "past-simple",
          stem: "She eats rice and beans.",
          hint: "Last night, ...",
          optimal: ["she ate rice and beans", "last night she ate rice and beans", "she ate rice and beans last night"],
          rules: [
            { when: "contains", pattern: "\\beated\\b", feedback: "Eat is irregular. It does not take -ed. The past form is ate." },
            { when: "contains", pattern: "\\beats?\\b", feedback: "Change eat to its past form." },
            { when: "missing", pattern: "\\bate\\b", feedback: "The past form of eat is ate." }
          ]
        },
        {
          id: "p3",
          skill: "past-simple",
          stem: "They go to the park.",
          hint: "Last Saturday, ...",
          optimal: ["they went to the park", "last saturday they went to the park", "they went to the park last saturday"],
          rules: [
            { when: "contains", pattern: "\\bgoed\\b|\\bwented\\b", feedback: "Go is irregular. The past form is went, with no -ed." },
            { when: "contains", pattern: "\\bgo(es)?\\b", feedback: "Change go to its past form." },
            { when: "missing", pattern: "\\bwent\\b", feedback: "The past form of go is went." }
          ]
        }
      ]
    },

    /* ========================================================
       3. BLANK — tap or type into the gap
       Write ___ (three underscores) where the gap goes.
       Give "options" to make it tappable. Leave options out to make it typed.
       ======================================================== */
    {
      id: "blk-svagree-01",
      title: "One or many? Subject and verb",
      tool: "blank",
      level: "Newcomer",
      skill: "subject-verb",
      standard: "ELD.PII.9-10.4",
      directions: {
        text: "Choose the word that fits.",
        t: {
          es: "Elige la palabra que corresponde.",
          zh: "选择合适的词。",
          vi: "Chọn từ phù hợp.",
          ar: "اختر الكلمة المناسبة.",
          tl: "Piliin ang salitang bagay.",
          pt: "Escolha a palavra que se encaixa.",
          ne: "मिल्ने शब्द छान्नुहोस्।"
        }
      },
      prompts: [
        {
          id: "p1", skill: "subject-verb",
          text: "My brother ___ soccer every Saturday.",
          options: ["play", "plays", "playing"],
          answer: "plays",
          why: "My brother is one person. One person takes plays.",
          wrong: {
            "play": "Play is for I, you, we, and they. My brother is one person.",
            "playing": "Playing needs a helper word like is in front of it."
          }
        },
        {
          id: "p2", skill: "subject-verb",
          text: "The students ___ in the library after school.",
          options: ["studies", "study", "studying"],
          answer: "study",
          why: "The students is more than one. More than one takes study.",
          wrong: {
            "studies": "Studies is for one person. The students is more than one.",
            "studying": "Studying needs a helper word like are in front of it."
          }
        },
        {
          id: "p3", skill: "subject-verb",
          text: "Ms. Chen ___ three languages.",
          options: ["speak", "speaks", "spoke"],
          answer: "speaks",
          why: "Ms. Chen is one person, and this happens now.",
          wrong: {
            "speak": "Speak is for more than one person.",
            "spoke": "Spoke is the past. This sentence is about now."
          }
        },
        {
          id: "p4", skill: "plural-nouns",
          text: "I have two ___ in my backpack.",
          options: ["book", "books", "bookes"],
          answer: "books",
          why: "Two means more than one, so the noun needs -s.",
          wrong: {
            "book": "Two means more than one. Add -s.",
            "bookes": "Close. Only add -es after s, x, ch, sh. Book takes -s."
          }
        }
      ]
    },

    /* ========================================================
       4. PROOF — find and fix errors in a passage
       Mark every error inline:  [wrong|correct]
       Everything not in brackets is already correct.
       ======================================================== */
    {
      id: "prf-intro-01",
      title: "Proofread: Marisol's introduction",
      tool: "proof",
      level: "Newcomer",
      skill: "capitalization",
      standard: "L.9-10.2",
      directions: {
        text: "Tap the words that have mistakes. Fix them.",
        t: {
          es: "Toca las palabras que tienen errores. Corrígelas.",
          zh: "点击有错误的词，然后改正。",
          vi: "Chạm vào những từ sai. Sửa lại.",
          ar: "انقر على الكلمات الخاطئة وصححها.",
          tl: "Pindutin ang mga salitang may mali. Ayusin ang mga ito.",
          pt: "Toque nas palavras com erros. Corrija-as.",
          ne: "गल्ती भएका शब्दहरूमा थिच्नुहोस्। सच्याउनुहोस्।"
        }
      },
      prompts: [
        {
          id: "p1",
          passage: "[my|My] name is [marisol|Marisol]. I am from [el salvador|El Salvador]. I [lives|live] in San Francisco with my aunt. Every morning I [takes|take] the 49 bus to school. My favorite class [are|is] science.",
          skills: {
            "My": "capitalization",
            "Marisol": "capitalization",
            "El Salvador": "capitalization",
            "live": "subject-verb",
            "take": "subject-verb",
            "is": "subject-verb"
          }
        }
      ]
    }

  ]
};
