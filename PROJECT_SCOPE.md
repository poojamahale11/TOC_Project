# Project Scope and Classification Rules

## Hierarchy

Type 3 ⊂ Type 2 ⊂ Type 1 ⊂ Type 0

Regular → Context-Free → Context-Sensitive → Recursively Enumerable

## Supported language patterns

### Regular
- strings ending/starting with a fixed pattern
- strings containing a fixed pattern
- finite languages / finite lists
- regular-expression style descriptions
- L = {a^n b^m | n,m >= 0}
- explicit regular keywords

### Context-Free
- L = {a^n b^n | n >= 0}
- palindromes
- balanced parentheses/brackets
- explicit context-free keywords

### Context-Sensitive
- L = {a^n b^n c^n | n >= 1}
- synchronized multiple-block counts
- explicit context-sensitive keywords

### Recursively Enumerable
- explicit Type-0 / unrestricted grammar / Turing-machine descriptions

## Grammar classifier

The grammar mode checks:

### Type 3
Every left side is a single nonterminal and the right side follows a left-linear or right-linear regular-grammar pattern.

### Type 2
Every left side is a single nonterminal.

### Type 1
Productions are non-contracting, with the standard start-symbol epsilon exception used by the implementation.

### Type 0
Anything not satisfying the above supported tests is treated as unrestricted.

## Important

The app is an educational classifier. It is not a universal decision procedure for arbitrary mathematical language descriptions.


## Accuracy suite

The current build contains 40 deterministic regression inputs:

- RL-01..RL-10: 10 Regular examples
- CFL-01..CFL-10: 10 Context-Free examples
- CSL-01..CSL-10: 10 Context-Sensitive examples
- RE-01..RE-10: 10 explicit Type-0/RE model descriptions

The built-in suite is expected to report **40/40 PASS**.

### Safety rule

An unknown natural-language description is **not** automatically classified as Type-0. It is reported as **Undetermined** until a supported proof/model is available.

This prevents the common error:

> "Not recognized by the current rules" → incorrectly calling it "Recursively Enumerable".

### Regular fixed-prefix examples

Inputs such as:

- `word starting with 01`
- `words starting with 01`
- `strings starting with 01`
- `strings ending with 01`
- `binary strings containing 01`

are explicitly recognized as **Type-3 / Regular**, because a DFA can remember a finite prefix/suffix/sub-string condition.
