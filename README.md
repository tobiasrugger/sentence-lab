# Sentence Lab

A Quill-shaped framework you own. Four activity types, a staged feedback engine, attempt-level logging to Supabase, and a teacher report set that mirrors Quill's Activity Summary / Activity Analysis / Skills reports.

## Files

| File | What it is |
|---|---|
| `author.html` | **Where you build activities.** A form, not a file to edit. Password `galileo2026`. |
| `index.html` | Activity library students land on |
| `play.html` | The player — all four activity types |
| `dashboard.html` | Teacher reports (password `galileo2026`) |
| `content.js` | Backup copy of the content, used only if Supabase is unreachable |
| `schema.sql` | Run once in the Supabase SQL editor |

## Setup

1. Open the Supabase SQL editor for `lhmwtfyceilgndpygivj` and run `schema.sql`. The anon key can't create tables, so this has to be done by hand.
2. Drop all five files in a GitHub Pages repo folder.
3. Open `author.html`. The four starter activities load from `content.js` and are marked unsaved. Press **Save** once — that copies them into Supabase, which becomes the live source from then on.
4. Do one activity yourself in `play.html`, then open `dashboard.html` and confirm your attempts show up under Responses.

Nothing needs a build step and nothing needs npm.

## Where content lives

`author.html` writes activities to the `qf_activities` table. `index.html` and `play.html` read from that table first and fall back to `content.js` if the network is down or the table is empty — so a bad connection at the start of a period doesn't produce a blank page.

That means **adding a question never requires a git push**. Open `author.html`, make the change, press Save, and the next student to load the page sees it.

The **Download content.js** button writes out everything currently in the editor. Commit that file to the repo now and then so the fallback stays current; nothing breaks if you forget.

## Building an activity

Pick a type from the **New activity** dropdown in the sidebar, fill in the form, add questions, press Save. **Try it as a student** opens the real player so you can walk through it before assigning it.

A few things the form does that are worth knowing about:

- **Rules** are built from a dropdown — "the answer uses the word", "the answer is missing the word", "the answer is shorter than", "the answer just copies a sentence". Type a plain word and it's escaped for you. The "matches the pattern" option is there if you want to write a regular expression directly.
- **Proofreading passages**: type the passage with the mistakes in it, select a mistake, press **Mark what I selected**, and type the correction. A live preview underneath shows every marked error. Each correction gets its own skill dropdown, which is what lets the reports separate capital-letter errors from verb errors.
- **Skill names** live under Setup in the sidebar. The key is what's stored with every attempt; the label is what you read in the reports. Renaming a key rewrites it across all activities, but past student rows keep the old one, so rename before students practice a skill rather than after.
- **Students can see this activity** is a checkbox — uncheck it to work on something without it appearing in the library.
- Changing the **web address name** changes the activity's URL and its identity in the reports. Old results stay under the old name.

Everything below describes the underlying data shape, in case you want to read the JSON or hand-edit the fallback file.

Everything is one object in the `activities` array.

```js
{
  id: "cmb-so-01",           // unique, becomes the URL: play.html?a=cmb-so-01
  title: "Joining with so",
  tool: "combine",           // combine | write | blank | proof
  level: "Newcomer",
  skill: "coordinating-so",  // key from the skills map at the top
  standard: "ELD.PI.9-10.11",
  mechanics: true,           // check capital + period, after meaning
  ai: false,                 // Claude writes the hint when no rule fires
  fallback: "Read it out loud. Does it show the result?",
  directions: { text: "...", t: { es:"...", zh:"..." } },
  prompts: [ ... ]
}
```

### combine

```js
{
  id: "p1",
  skill: "coordinating-so",
  cues: ["It rained all night.", "The game was cancelled."],
  optimal: ["It rained all night, so the game was cancelled."],
  rules: [ ... ]
}
```

### write

```js
{
  id: "p1",
  stem: "I walk to school.",
  hint: "Yesterday, ...",
  optimal: ["I walked to school."],
  rules: [ ... ]
}
```

### blank

Put `___` where the gap goes. Include `options` to make it tappable, leave them out to make it typed.

```js
{
  id: "p1",
  text: "My brother ___ soccer every Saturday.",
  options: ["play", "plays", "playing"],
  answer: "plays",
  why: "My brother is one person.",
  wrong: { "play": "Play is for I, you, we, and they." }
}
```

### proof

Mark every error inline as `[wrong|correct]`. Everything outside brackets is already right. `skills` maps a corrected word to a skill key so the reports can tell capitalization errors from agreement errors.

```js
{
  id: "p1",
  passage: "[my|My] name is [marisol|Marisol]. I [lives|live] here.",
  skills: { "My": "capitalization", "live": "subject-verb" }
}
```

## Writing rules

Rules run top to bottom. The first one that fires is the only feedback the student sees, so put the biggest problem first. Patterns are case-insensitive regular expressions written as strings — `\\b` is a word boundary, and you want it so `and` doesn't match `sandwich`.

```js
{ when: "contains", pattern: "\\band\\b", feedback: "..." }   // fires when present
{ when: "missing",  pattern: "\\bso\\b",  feedback: "..." }   // fires when absent
{ when: "shorter",  than: 7,              feedback: "..." }   // too few words
{ when: "same",                           feedback: "..." }   // copied a cue back
```

You don't need a rule for every wrong answer. The engine handles the common path on its own:

1. Matches an `optimal` exactly → correct.
2. Right words, wrong marks → "Good work. Now add the comma."
3. Your rules, in order.
4. Mechanics last: opening capital, end punctuation, and proper nouns that are capitalized in your `optimal` but lowercase in theirs.
5. `ai: true` → one short hint from Claude through your `anthropic-proxy` edge function. Otherwise the activity's `fallback`.

Five attempts per prompt, one point either way, exactly as Quill scores it. Tapping activities get `options.length - 1` attempts instead. On the last attempt the student sees a model answer.

## The reports

**Activity summary** — students down, activities across, a colored square per cell. Green 83–100, yellow 32–82, red 0–31. A superscript number means they replayed it; the square shows their best result. Click any square to jump to that student's transcript.

**Responses** — every attempt in order with the exact feedback the student was shown. This is the conference view.

**Skills** — exposure counted separately from accuracy, so a low number reads differently for a skill met twice than one met twenty times. Momentum compares the back half of a student's practice on a skill against the front half. Tries is the average attempts to reach a correct answer. Replay rate distinguishes a student improving through persistence from one grinding and still stuck.

**Export CSV** — raw attempt rows for the gradebook.

## Notes

- Speech buttons use the Web Speech API. Silent on browsers without it, nothing breaks.
- Directions translate per student; the language choice persists in `localStorage`.
- The AI path goes through the Supabase edge function, never the Anthropic API from the browser.
- `qf_roster` is optional. Without it the summary grid only shows students who have submitted something.
