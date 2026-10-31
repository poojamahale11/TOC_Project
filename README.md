# ChomskyLens — Interactive Chomsky Hierarchy Language Classifier

A simple, beginner-friendly TOC project that demonstrates the four levels of the Chomsky hierarchy:

1. Type 3 — Regular Language — Finite Automaton
2. Type 2 — Context-Free Language — Pushdown Automaton
3. Type 1 — Context-Sensitive Language — Linear Bounded Automaton
4. Type 0 — Recursively Enumerable Language — Turing Machine

## Main features

- Simple language input
- Grammar production input
- Quick examples
- Step-by-step classification
- Chomsky hierarchy visualization
- Computational model recommendation
- Conceptual model diagram
- Dark/light theme
- Responsive UI for laptop and mobile
- No database
- No backend
- No API key
- No installation required

## How to run

### Easiest method

Open `index.html` directly in Chrome/Edge.

### Recommended method

If Python is installed:

```bash
cd Chomsky_Hierarchy_Language_Classifier
python -m http.server 5500
```

Then open:

`http://localhost:5500`

Stop the server with `Ctrl + C`.

## Try these

### Regular

`strings ending with 01`

### Context-Free

`L = { a^n b^n | n >= 0 }`

### Context-Sensitive

`L = { a^n b^n c^n | n >= 1 }`

### Regular

`L = { a^n b^m | n,m >= 0 }`

### Context-Free

`palindromes over {0,1}`

## Grammar mode

Example:

```text
S -> aS | b
```

This is recognized as a regular grammar.

Another example:

```text
S -> aSb | ab
```

This is recognized as context-free.

## Important scope note

A complete automatic classifier for every arbitrary mathematical language is not possible because general language-property questions can be undecidable.

Therefore this project intentionally uses a supported educational rule/pattern library. For common TOC examples and grammar forms, it gives the classification plus reasoning. For unsupported descriptions, it reports **Undetermined** instead of pretending that an unproved answer is Type-0.

The project includes a built-in 40-case accuracy suite:
- 10 Type-3 / Regular
- 10 Type-2 / Context-Free
- 10 Type-1 / Context-Sensitive
- 10 explicit Type-0 / Recursively Enumerable model descriptions

The Type-0 set intentionally uses explicit Turing-machine/unrestricted-grammar descriptions. It does not treat every unknown language as Type-0.

## Suggested future upgrades

- Full regex → NFA/DFA conversion
- CFG parser and derivation tree
- PDA transition simulation
- LBA/TM step simulation
- State-diagram editor
- More formal grammar validation
- Export analysis as PDF
- Quiz/practice mode
- Teacher/student mode
