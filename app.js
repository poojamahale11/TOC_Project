const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const MODEL = {
  regular: {
    code:"RL", type:"Type 3", name:"Regular Language", model:"Finite Automaton",
    icon:"FA", desc:"A finite automaton recognizes the language using only a finite number of states.",
    tags:["DFA","NFA","Finite memory"]
  },
  cfl: {
    code:"CFL", type:"Type 2", name:"Context-Free Language", model:"Pushdown Automaton",
    icon:"PDA", desc:"A pushdown automaton adds a stack, which is useful for matching or nested structures.",
    tags:["CFG","Stack","PDA"]
  },
  csl: {
    code:"CSL", type:"Type 1", name:"Context-Sensitive Language", model:"Linear Bounded Automaton",
    icon:"LBA", desc:"An LBA has bounded tape proportional to the input and can handle stronger dependencies.",
    tags:["CSG","Bounded tape","LBA"]
  },
  re: {
    code:"RE", type:"Type 0", name:"Recursively Enumerable Language", model:"Turing Machine",
    icon:"TM", desc:"A Turing machine provides the most general computation model in the Chomsky hierarchy.",
    tags:["Type-0","Unrestricted","TM"]
  }
};

let mode = "language";

$$(".tab").forEach(btn => btn.addEventListener("click", () => {
  $$(".tab").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  mode = btn.dataset.mode;
  $("#languageMode").classList.toggle("hidden", mode !== "language");
  $("#grammarMode").classList.toggle("hidden", mode !== "grammar");
}));

$$(".chip").forEach(btn => btn.addEventListener("click", () => {
  mode = "language";
  $$(".tab").forEach(x=>x.classList.toggle("active", x.dataset.mode === "language"));
  $("#languageMode").classList.remove("hidden"); $("#grammarMode").classList.add("hidden");
  $("#languageInput").value = btn.dataset.example;
}));

$("#examplesBtn").onclick = () => $("#examplesModal").classList.remove("hidden");
$("#closeModal").onclick = () => $("#examplesModal").classList.add("hidden");
$$("[data-modal-example]").forEach(btn => btn.onclick = () => {
  $("#languageInput").value = btn.dataset.modalExample;
  mode = "language";
  $$(".tab").forEach(x=>x.classList.toggle("active", x.dataset.mode === "language"));
  $("#languageMode").classList.remove("hidden"); $("#grammarMode").classList.add("hidden");
  $("#examplesModal").classList.add("hidden");
  $("#languageInput").focus();
});
$("#themeBtn").onclick = () => {
  document.body.classList.toggle("dark");
  $("#themeBtn").textContent = document.body.classList.contains("dark") ? "☀ Light" : "☾ Theme";
};

function classifyGrammar(raw) {
  const text = raw.replace(/→/g, "->").replace(/\r/g,"").trim();
  if (!text) throw new Error("Please enter at least one grammar production.");
  const productions = [];
  text.split("\n").map(x=>x.trim()).filter(Boolean).forEach(line=>{
    const parts = line.split("->");
    if(parts.length !== 2) throw new Error("Use the format: S -> aS | b");
    const lhs = parts[0].trim();
    const rhsList = parts[1].split("|").map(x=>x.trim());
    rhsList.forEach(rhs=>productions.push({lhs,rhs}));
  });

  const allLhsSingle = productions.every(p => /^[A-Z]$/.test(p.lhs));
  const type3 = allLhsSingle && productions.every(p => {
    if(rhsEpsilon(p.rhs)) return true;
    // Right/left-linear: terminals plus at most one nonterminal at one end.
    return /^[a-z0-9ε]*[A-Z]?$/.test(p.rhs) || /^[A-Z][a-z0-9ε]*$/.test(p.rhs);
  });

  const type2 = allLhsSingle;
  const type1 = productions.every(p => {
    if(rhsEpsilon(p.rhs)) return p.lhs === "S";
    return p.rhs.replace(/ε/g,"").length >= p.lhs.length;
  });

  let level = type3 ? "regular" : type2 ? "cfl" : type1 ? "csl" : "re";
  const steps = [];
  steps.push({
    ok:type3,
    title:"Check Type-3 / Regular Grammar",
    reason:type3 ? "Each production has one nonterminal on the left and a regular right-linear or left-linear form." :
      "The productions do not satisfy the regular-grammar restriction."
  });
  if(!type3) steps.push({
    ok:type2,
    title:"Check Type-2 / Context-Free Grammar",
    reason:type2 ? "Every production has exactly one nonterminal on the left-hand side." :
      "At least one production has a left-hand side containing more than one symbol."
  });
  if(!type3 && !type2) steps.push({
    ok:type1,
    title:"Check Type-1 / Context-Sensitive Grammar",
    reason:type1 ? "Productions are non-contracting (with the usual start-symbol ε exception)." :
      "At least one production contracts the string, so it is not Type-1 under this test."
  });
  if(level==="re") steps.push({ok:true,title:"Type-0 / Recursively Enumerable",reason:"The grammar is treated as unrestricted under the supported grammar test."});
  return {level, steps, why:`The grammar matches the ${MODEL[level].name} level under the implemented Chomsky grammar rules.`};
}

function clean(s){return s.toLowerCase().replace(/\s+/g," ").trim()}

function resultRegular(reason, example){
  return {
    level:"regular",
    steps:[
      {ok:true,title:"Check Type-3 / Regular Language",reason},
      {ok:true,title:"Finite Automaton (DFA/NFA)",reason:"A finite automaton needs only finitely many states to remember the required condition."}
    ],
    why:reason,
    example:example || "A DFA/NFA can recognize this language."
  };
}
function resultCFL(reason, example){
  return {
    level:"cfl",
    steps:[
      {ok:false,title:"Check Type-3 / Regular Language",reason:"Finite-state memory is insufficient for the unbounded matching/dependency in this language."},
      {ok:true,title:"Check Type-2 / Context-Free Language",reason},
      {ok:true,title:"Pushdown Automaton (PDA)",reason:"A stack provides the unbounded memory required by the supported construction."}
    ],
    why:reason,
    example:example || "A PDA/CFG construction is available."
  };
}
function resultCSL(reason, example){
  return {
    level:"csl",
    steps:[
      {ok:false,title:"Check Type-3 / Regular Language",reason:"A finite automaton cannot maintain the required unbounded dependency."},
      {ok:false,title:"Check Type-2 / Context-Free Language",reason:"The language is a standard non-context-free dependency (for example, three-way equality or copying)."},
      {ok:true,title:"Check Type-1 / Context-Sensitive Language",reason},
      {ok:true,title:"Linear Bounded Automaton (LBA)",reason:"An LBA can perform the required bounded-tape marking/comparison using space linear in the input."}
    ],
    why:reason,
    example:example || "An LBA-style marking/comparison construction recognizes it."
  };
}
function resultRE(reason, example){
  return {
    level:"re",
    steps:[
      {ok:false,title:"Check Type-3 / Regular Language",reason:"No regular proof applies to the supplied unrestricted machine/grammar description."},
      {ok:false,title:"Check Type-2 / Context-Free Language",reason:"No CFL proof applies to the supplied unrestricted machine/grammar description."},
      {ok:false,title:"Check Type-1 / Context-Sensitive Language",reason:"The description explicitly uses an unrestricted grammar/Turing-machine model rather than a Type-1 restriction."},
      {ok:true,title:"Check Type-0 / Recursively Enumerable",reason}
    ],
    why:reason,
    example:example || "A Turing-machine/Type-0 description is supplied."
  };
}

function classifyLanguage(raw){
  const original=raw.trim();
  const s=clean(original).replace(/[{}]/g,"").replace(/[|]/g," | ");
  if(!s) throw new Error("Please describe a language or choose a quick example.");

  // A common CFG entered as language text.
  if(/s\s*[-=→>]+\s*a\s*s\s*b\s*\|\s*ab/.test(s)){
    return resultCFL(
      "S → aSb | ab is a context-free grammar generating {a^n b^n | n≥1}; that language is not regular.",
      "ab, aabb and aaabbb are generated."
    );
  }

  // ---------- TYPE 1: well-known CSL but not CFL ----------
  if(
    /a\s*\^?\s*n\s*b\s*\^?\s*n\s*c\s*\^?\s*n/.test(s) ||
    /aⁿbⁿcⁿ/.test(s) ||
    /equal (number|count).*a.*b.*c/.test(s) || /equal a,b,c block counts/.test(s) ||
    /three.*(equal|same).*blocks/.test(s)
  ){
    return resultCSL(
      "The three unbounded blocks must have the same count. {a^n b^n c^n | n≥1} is context-sensitive but not context-free.",
      "abc and aabbcc are accepted; aabcc is rejected."
    );
  }
  if(
    /a\s*\^?\s*n\s*b\s*\^?\s*n\s*c\s*\^?\s*n\s*d\s*\^?\s*n/.test(s) ||
    /aⁿbⁿcⁿdⁿ/.test(s) ||
    /four.*(equal|same).*blocks/.test(s) || /four blocks with equal counts/.test(s)
  ){
    return resultCSL(
      "Four unbounded blocks must be synchronized. This is context-sensitive and is not context-free.",
      "abcd and aabbccdd are accepted."
    );
  }
  if(
    /\bww\b/.test(s) ||
    /copy language/.test(s) ||
    /two identical copies/.test(s) || /identical arbitrary copies/.test(s) ||
    /w\s*,?\s*w\s*in/.test(s)
  ){
    return resultCSL(
      "The language requires comparing two arbitrary copies of a string. The copy language {ww | w∈Σ*} is context-sensitive but not context-free.",
      "01 01 and 101 101 are accepted; 01 10 is rejected."
    );
  }
  if(/a\s*\^?\s*n\s*b\s*\^?\s*n\s*c\s*\^?\s*m\s*d\s*\^?\s*m/.test(s)){
    return resultCSL(
      "Two separated equality dependencies require more than a single context-free stack in this supported pattern.",
      "The two matched block pairs are checked with bounded tape."
    );
  }

  // ---------- TYPE 2: classic CFL families ----------
  if(/a\s*\^?\s*i\s*b\s*\^?\s*j\s*c\s*\^?\s*j/.test(s)){
    return resultCFL(
      "The b and c blocks must have equal unbounded counts while the a-block is independent. A PDA can push for b and pop for c.",
      "bcc, abbcc and aaabbbccc fit the corresponding independent/equal-block condition."
    );
  }
  if(/a\s*\^?\s*i\s*b\s*\^?\s*i\s*c\s*\^?\s*j/.test(s)){
    return resultCFL(
      "The a and b blocks must have equal unbounded counts while the c-block is independent. A PDA can push for a and pop for b.",
      "aab, aabbc and aaabbbcc fit the corresponding condition."
    );
  }

  if(
    /a\s*\^?\s*n\s*b\s*\^?\s*n/.test(s) ||
    /aⁿbⁿ/.test(s) ||
    /equal (number|count).*a.*b/.test(s) ||
    /same number.*a.*b/.test(s)
  ){
    return resultCFL(
      "The two blocks have equal unbounded counts. Grammar S → aSb | ab (or its ε variant) and a PDA prove context-freeness; it is not regular.",
      "ab, aabb and aaabbb are accepted; aab is rejected."
    );
  }
  if(/a\s*\^?\s*n\s*b\s*\^?\s*m\s*c\s*\^?\s*m/.test(s) || /a.*any.*b.*same.*c/.test(s)){
    return resultCFL(
      "Only the b/c blocks need to match; the a-block is independent. A PDA can push for b and pop for c.",
      "abbc, aabbcc and bbc are accepted under the corresponding notation."
    );
  }
  if(/palindrome/.test(s)){
    return resultCFL(
      "Palindromes require matching symbols from opposite sides. A stack can store one half and compare it with the other; arbitrary palindromes are not regular.",
      "ε, 0, 00, 0110 and 01010 are accepted."
    );
  }
  if(/balanced parentheses|balanced brackets|balanced braces|dyck language|properly nested/.test(s)){
    return resultCFL(
      "Nested matching is naturally handled by a stack. The standard grammar S → SS | (S) | ε gives a CFG/PDA.",
      "(), (()), ()() are accepted; (() is rejected."
    );
  }
  if(/equal number.*0.*1/.test(s) && !/in every prefix/.test(s)){
    return resultCFL(
      "Equal total numbers of 0s and 1s form a context-free language (a CFG/PDA can maintain the balance).",
      "01, 0011 and 0101 are accepted; 001 is rejected."
    );
  }
  if(/a\s*\^?\s*(2n|2\*n|even).*b|even.*number.*a.*b/.test(s)){
    return resultCFL(
      "The supported description includes an unbounded matching relation, handled by a PDA/CFG.",
      "The PDA tracks the required unbounded dependency."
    );
  }

  // ---------- TYPE 3: regular languages ----------
  // These rules intentionally run before generic regex/keyword rules.
  if(
    /\b(words?|strings?)\s+(that\s+)?(start|begin|beginning|starting)\s+(with|in)\s+[01ab]+/.test(s) ||
    /\b(start|begin|beginning|starting)\s+with\s+[01ab]+/.test(s) ||
    /\b(words?|strings?)\s+(that\s+)?(end|ending|ends|terminate|terminating)\s+(with|in)\s+[01ab]+/.test(s) ||
    /\bend(s|ing)?\s+with\s+[01ab]+/.test(s) ||
    /\b(start|begin|beginning|starting|end|ending|ends)\s+with\s+01\b/.test(s)
  ){
    return resultRegular(
      "A fixed prefix/suffix such as 01 can be remembered with finitely many states. Therefore the language is regular.",
      "Starting with 01: 01, 010, 0111 accepted; 10 rejected."
    );
  }
  if(/contain(s|ing)?\s+(the\s+)?substring\s+[01ab]+|contain(s|ing)?\s+[01ab]+\b|has\s+[01ab]+\s+as\s+(a\s+)?substring/.test(s)){
    return resultRegular(
      "Checking whether a fixed substring occurs needs only finitely many states (track the current prefix of the target).",
      "Contains 01: 01, 101, 010 accepted; 111 rejected."
    );
  }
  if(/even\s+(length|number\s+of\s+symbols|number\s+of\s+characters)|odd\s+(length|number\s+of\s+symbols|number\s+of\s+characters)/.test(s)){
    return resultRegular(
      "A DFA only needs two states to track parity of the input length.",
      "Even length: ε, 00, 1010 accepted; 0 rejected."
    );
  }
  if(/number\s+of\s+0s?\s+is\s+(even|odd)|number\s+of\s+1s?\s+is\s+(even|odd)/.test(s)){
    return resultRegular(
      "A DFA can track parity with two states (or a finite product of parity states).",
      "Even number of 1s: ε, 11, 101 accepted; 1 rejected."
    );
  }
  if(/no\s+(substring|occurrence)\s+[01ab]+|does\s+not\s+contain\s+[01ab]+|without\s+[01ab]+/.test(s)){
    return resultRegular(
      "Avoiding a fixed substring is a finite-memory property; a DFA can track whether the forbidden pattern has appeared.",
      "Avoiding 11: ε, 0, 010 accepted; 11 rejected."
    );
  }
  if(/finite language|finite set|finite list|exactly\s+(one|two|three|four|five)\s+strings?/.test(s)){
    return resultRegular(
      "Every finite language is regular. A DFA can use finitely many states to recognize each listed string.",
      "Every explicitly listed finite set is accepted by a DFA."
    );
  }
  if(
    /^(\([01ab]+\)\*|[01ab]\*|[01ab]\+)$/.test(s.replace(/\s/g,"")) ||
    /regular expression|regex\b|regular language|finite automaton|dfa\b|nfa\b|type.?3/.test(s)
  ){
    return resultRegular(
      "The description explicitly gives a regular expression or finite-state model. Regular expressions, DFA and NFA describe exactly the regular languages.",
      "The corresponding DFA/NFA accepts the described pattern."
    );
  }
  if(/a\s*\^?\s*i\s*b\s*\^?\s*j\s*c\s*\^?\s*j/.test(s) ||
     /a\s*\^?\s*i\s*b\s*\^?\s*i\s*c\s*\^?\s*j/.test(s) ||
     /a\s*\^?\s*n\s*b\s*\^?\s*m/.test(s) || /aⁿbᵐ/.test(s) || /independent.*(a|b).*count/.test(s)){
    return resultRegular(
      "The a and b counts are independent; no equality between two unbounded counters is required. A finite automaton is sufficient.",
      "ab, aaabbb, aaaa and bbb are all allowed according to n,m≥0."
    );
  }
  if(
    /all (binary|strings|words).*(01|10)/.test(s) ||
    /binary strings/.test(s) && /(starting|beginning|ending|ending|containing|contain|with)/.test(s)
  ){
    return resultRegular(
      "The stated binary-string property is finite-state checkable.",
      "A DFA can track the finite amount of information required."
    );
  }
  if(/length.*(multiple|divisible).*\b\d+\b/.test(s) || /number of symbols.*multiple of \d+/.test(s)){
    return resultRegular(
      "A DFA can keep the input length modulo a fixed integer using finitely many states.",
      "For length multiple of k, use k parity/modulo states."
    );
  }
  if(/starts with|starting with|begins with|beginning with|ends with|ending with|contains|does not contain/.test(s) && !/not regular|not context/.test(s)){
    return resultRegular(
      "The description is a fixed-pattern property of strings, which is regular and finite-state checkable.",
      "A DFA/NFA can track the finite pattern condition."
    );
  }

  // ---------- EXPLICIT TYPE-0 / RE ----------
  // Type-0 is only claimed when the user explicitly supplies a TM/unrestricted model.
  if(
    /turing machine.*(accept|recogniz|language)|language recognized by (a|an) turing machine|tm[- ]recognizable/.test(s) ||
    /unrestricted grammar|type.?0 grammar|recursively enumerable|r\.?e\.?\s+language|semi-decidable language/.test(s)
  ){
    return resultRE(
      "The input explicitly describes an unrestricted grammar/Turing-machine recognizer. That is the Type-0/RE model.",
      "A Turing machine recognizes the language; the exact lower class is not asserted without a lower-class proof."
    );
  }
  if(/context.?sensitive|type.?1|linear bounded automaton/.test(s)){
    return resultCSL("The description explicitly specifies a Type-1/context-sensitive model.");
  }
  if(/context.?free|type.?2|pushdown automaton|cfg\b|context free grammar/.test(s)){
    return resultCFL("The description explicitly specifies a Type-2/context-free model.");
  }
  if(/regular|finite automaton|dfa|nfa|type.?3/.test(s)){
    return resultRegular("The description explicitly specifies a Type-3/regular model.");
  }

  // ---------- SAFE UNKNOWN ----------
  return {
    level:"unknown",
    steps:[
      {ok:false,title:"Check Type-3 / Regular Language",reason:"No sound supported rule proves regularity for this description."},
      {ok:false,title:"Check Type-2 / Context-Free Language",reason:"No sound supported rule proves context-freeness for this description."},
      {ok:false,title:"Check Type-1 / Context-Sensitive Language",reason:"No sound supported rule proves context-sensitivity for this description."},
      {ok:false,title:"Check Type-0 / Recursively Enumerable",reason:"Type-0 is not a valid catch-all. The input does not explicitly provide a Type-0/Turing-machine description."}
    ],
    why:"The exact Chomsky class cannot be determined automatically from this unsupported natural-language description. The app intentionally refuses to guess.",
    uncertain:true
  };
}

const TEST_LANGUAGES = [
  // 10 Type-3
  ["RL-01","words starting with 01","regular"],
  ["RL-02","strings ending with 10","regular"],
  ["RL-03","binary strings containing 01","regular"],
  ["RL-04","binary strings with even length","regular"],
  ["RL-05","binary strings with an even number of 1s","regular"],
  ["RL-06","binary strings with no substring 11","regular"],
  ["RL-07","L = { a^n b^m | n,m >= 0 }","regular"],
  ["RL-08","strings whose length is multiple of 3","regular"],
  ["RL-09","(ab)*","regular"],
  ["RL-10","finite language {epsilon, 0, 01, 101}","regular"],

  // 10 Type-2
  ["CFL-01","L = { a^n b^n | n >= 0 }","cfl"],
  ["CFL-02","palindromes over {0,1}","cfl"],
  ["CFL-03","balanced parentheses","cfl"],
  ["CFL-04","balanced brackets","cfl"],
  ["CFL-05","L = { a^i b^j c^j | i,j >= 0 }","cfl"],
  ["CFL-06","L = { a^i b^i c^j | i,j >= 0 }","cfl"],
  ["CFL-07","equal number of 0s and 1s","cfl"],
  ["CFL-08","Dyck language with one type of bracket","cfl"],
  ["CFL-09","L = { a^n b^n | n >= 1 }","cfl"],
  ["CFL-10","S -> aSb | ab","cfl"],

  // 10 Type-1
  ["CSL-01","L = { a^n b^n c^n | n >= 1 }","csl"],
  ["CSL-02","L = { a^n b^n c^n | n >= 0 }","csl"],
  ["CSL-03","L = { a^n b^n c^n d^n | n >= 1 }","csl"],
  ["CSL-04","copy language { ww | w in {0,1}* }","csl"],
  ["CSL-05","L = { ww | w in {a,b}* }","csl"],
  ["CSL-06","three blocks with equal counts of a, b and c","csl"],
  ["CSL-07","four blocks with equal counts","csl"],
  ["CSL-08","language of two identical arbitrary copies","csl"],
  ["CSL-09","a^n b^n c^n d^n","csl"],
  ["CSL-10","equal a,b,c block counts with n >= 1","csl"],

  // 10 Type-0 / RE: explicit model descriptions only
  ["RE-01","language recognized by a Turing machine","re"],
  ["RE-02","a recursively enumerable language","re"],
  ["RE-03","language generated by an unrestricted grammar","re"],
  ["RE-04","a Type-0 grammar language","re"],
  ["RE-05","a semi-decidable language","re"],
  ["RE-06","a language recognized by a Turing machine that may not halt","re"],
  ["RE-07","unrestricted grammar with arbitrary productions","re"],
  ["RE-08","Type-0 / recursively enumerable language","re"],
  ["RE-09","TM-recognizable language","re"],
  ["RE-10","Turing machine acceptance language","re"]
];

function getExpectedTests(){
  return TEST_LANGUAGES.map(([id,input,level])=>({id,input,expected:level,actual:classifyLanguage(input).level}));
}

function sanity(level){
  const map={
    unknown:{title:"Note",text:"No sound rule matched this description; the classifier refuses to guess."},
    regular:{title:"Example",text:"Strings ending with 01: 01, 101, 1101 are accepted; 10 is rejected."},
    cfl:{title:"Example",text:"For aⁿbⁿ: ab and aabb are valid; aab is invalid because the counts differ."},
    csl:{title:"Example",text:"For aⁿbⁿcⁿ: abc and aabbcc are valid; aabcc is invalid because all three counts are not equal."},
    re:{title:"Note",text:"The general Turing-machine level is the most expressive level in this hierarchy."}
  };
  return map[level];
}

function renderDiagram(level){
  if(level==="unknown") level="re";
  const labels = {
    regular:["q0","q1","q2"],
    cfl:["q0","STACK","q1"],
    csl:["q0","TAPE","q1"],
    re:["READ","WORK","HALT"]
  }[level];
  return `<div class="diagram-wrap"><svg viewBox="0 0 620 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Conceptual computational model">
    <defs><marker id="arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="currentColor"/></marker></defs>
    <text x="310" y="25" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${MODEL[level].model}</text>
    <circle cx="125" cy="110" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="310" cy="110" r="55" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="495" cy="110" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M170 110 H252" stroke="currentColor" stroke-width="2" marker-end="url(#arr)"/>
    <path d="M365 110 H442" stroke="currentColor" stroke-width="2" marker-end="url(#arr)"/>
    <text x="125" y="105" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${labels[0]}</text>
    <text x="125" y="123" text-anchor="middle" font-size="10" fill="currentColor">input</text>
    <text x="310" y="105" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${labels[1]}</text>
    <text x="310" y="123" text-anchor="middle" font-size="10" fill="currentColor">${level==="regular"?"finite states":level==="cfl"?"stack memory":level==="csl"?"bounded tape":"unbounded tape"}</text>
    <text x="495" y="105" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${labels[2]}</text>
    <text x="495" y="123" text-anchor="middle" font-size="10" fill="currentColor">decision</text>
  </svg></div>`;
}

function render(result){
  const safeLevel = result.level==="unknown" ? "regular" : result.level;
  const m=MODEL[safeLevel];
  $("#resultSection").classList.remove("hidden");
  $("#resultTitle").textContent=m.name;
  $("#resultSubtitle").textContent=`${m.type} • ${m.model}`;
  $("#resultBadge").textContent=m.code;
  $("#typeLabel").textContent=m.type;
  $$(".level").forEach(x=>x.classList.toggle("active",x.dataset.level===result.level));
  $("#modelIcon").textContent=m.icon;
  $("#modelName").textContent=m.model;
  $("#modelDescription").textContent=m.desc;
  $("#modelTags").innerHTML=m.tags.map(x=>`<span>${x}</span>`).join("");
  $("#whyText").textContent=result.why;
  const sc=sanity(result.level==="unknown" ? "unknown" : result.level);
  $("#sanityCheck").innerHTML=`<div class="check"><b>${sc.title}</b>${sc.text}</div>`;
  $("#diagram").innerHTML=renderDiagram(result.level);
  $("#supportNote").textContent=result.uncertain
    ? "⚠ No exact supported proof was found. The app deliberately does NOT guess Type-0 for an unknown input. Type-0 is reported only when a Turing-machine/unrestricted-grammar model is explicitly supplied."
    : "✓ Classification explanation is based on the supported educational rules/patterns in this project.";
  $("#steps").innerHTML=result.steps.map((st,i)=>`
    <div class="step ${st.ok?"ok":"no"}">
      <div class="step-icon">${st.ok?"✓":"×"}</div>
      <div><b>${i+1}. ${st.title}</b><p>${st.reason}</p></div>
    </div>`).join("");
  $("#resultSection").scrollIntoView({behavior:"smooth",block:"start"});
}

$("#runTestsBtn").onclick=()=>{
  const rows=getExpectedTests();
  const passed=rows.filter(r=>r.expected===r.actual).length;
  $("#testSummary").classList.remove("hidden");
  $("#testSummary").innerHTML=`<b>${passed}/40 tests passed</b> <span>${passed===40 ? "✓ All built-in classifications match the expected class." : "⚠ Review failed rows below."}</span>`;
  $("#testTable").classList.remove("hidden");
  $("#testTable").innerHTML=`<div class="test-row head"><b>ID</b><b>Input</b><b>Expected</b><b>Actual</b><b>Status</b></div>`+
    rows.map(r=>`<div class="test-row"><span>${r.id}</span><span>${r.input}</span><span>${r.expected}</span><span>${r.actual}</span><b class="${r.expected===r.actual?"pass-t":"fail-t"}">${r.expected===r.actual?"PASS":"FAIL"}</b></div>`).join("");
};

$("#analyzeBtn").onclick=()=>{
  $("#errorBox").textContent="";
  try{
    const raw=mode==="language"?$("#languageInput").value:$("#grammarInput").value;
    const result=mode==="language"?classifyLanguage(raw):classifyGrammar(raw);
    render(result);
  }catch(e){$("#errorBox").textContent=e.message}
};

$("#languageInput").value="L = { a^n b^n c^n | n >= 1 }";
