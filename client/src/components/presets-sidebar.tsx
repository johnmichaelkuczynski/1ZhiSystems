import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export interface Preset {
  id: string;
  name: string;
  functionId: number;
  input: string;
  instructions: string;
}

const PRESETS: Preset[] = [
  // FUNCTION 1: Axiom-Set / Theory Transformation
  {
    id: "f1-argument-reversal",
    name: "Argument-Order Reversal",
    functionId: 1,
    input: ``,
    instructions: `ARGUMENT-ORDER REVERSAL OPERATION:

For every predicate symbol in the LANGUAGE with arity ≥ 2, reverse the order of its arguments everywhere it appears (in LANGUAGE and all AXIOMS). Unary predicates remain unchanged.

OUTPUT FORMAT:
1. THE RESULT

LANGUAGE: {<language with each predicate of arity ≥ 2 rewritten with reversed argument order>}

ARGUMENT-ORDER REVERSAL:
<list each predicate of arity ≥ 2 with its transformation, e.g. R(x,y) → R(y,x)>

AXIOMS:
1. <axiom with all arity ≥ 2 predicates rewritten with reversed arguments>
2. ...

RULES:
- This is a PURE textual reversal of argument order for predicates of arity ≥ 2
- Do NOT add definitions
- Do NOT add or remove axioms
- Do NOT change logical connectives or quantifiers
- Unary predicates are left unchanged`
  },
  {
    id: "f1-signature-change",
    name: "Signature Change",
    functionId: 1,
    input: ``,
    instructions: `Replace all binary relations with ternary relations by adding a context parameter. Rewrite all axioms to use the new signatures while preserving meaning.`
  },
  {
    id: "f1-vocab-compression",
    name: "Vocabulary Compression",
    functionId: 1,
    input: ``,
    instructions: `VOCABULARY COMPRESSION OPERATION:

Compress the vocabulary by:
1. Identifying unary predicates that can be defined using surviving non-unary predicates.
2. Eliminating those unary predicates from the LANGUAGE.
3. Introducing DEFINITIONS for each eliminated predicate.
4. Removing only axioms that become tautological after substitution.
5. Leaving all other axioms exactly intact.

RULES:
- If U(x) appears only in axioms of the form (U(x) → ∃y F(x,y)) or (F(x,y) → U(x)), define: U(x) ↔ ∃y F(x,y)
- If V(x) is always the negation of U(x), define: V(x) ↔ ¬∃y F(x,y)
- Keep all surviving predicates unchanged
- Do NOT add new primitives
- Always return a nontrivial compressed theory

OUTPUT FORMAT:
1. THE RESULT

LANGUAGE: { <surviving predicates> }

DEFINITIONS:
<one line per eliminated predicate>

AXIOMS:
<remaining axioms after eliminating tautologies>`
  },
  {
    id: "f1-vocab-expansion",
    name: "Vocabulary Expansion",
    functionId: 1,
    input: ``,
    instructions: `VOCABULARY EXPANSION OPERATION:

Introduce ONE new helper predicate H that abbreviates the most common pattern in the axioms.

STEPS:
1. Count occurrences of every binary pattern R(x,y) and unary pattern P(x) in axioms.
2. Select the pattern with highest frequency. If tie, choose binary.
3. Introduce new primitive: H(x,y) if binary, H(x) if unary.
4. Add DEFINITION: H(args) ↔ <chosen pattern>
5. Replace every instance of chosen pattern with H in all axioms.
6. Do NOT eliminate the original primitive.
7. Do NOT simplify other parts of formulas.

OUTPUT FORMAT:
1. THE RESULT

LANGUAGE: { <original primitives>, H(args) }

DEFINITION:
H(args) ↔ <original pattern>

AXIOMS:
1. <axiom with pattern replaced by H>
2. ...`
  },
  {
    id: "f1-non-iso-equivalent",
    name: "Non-Isomorphic Equivalent",
    functionId: 1,
    input: ``,
    instructions: `NON-ISOMORPHIC EQUIVALENT CONSTRUCTION:

Build a NEW theory T* in a COMPLETELY DIFFERENT SIGNATURE (same number of predicates, all with HIGHER ARITY and DIFFERENT NAMES) such that T and T* are definitionally equivalent.

CONSTRUCTION:
1. For each original predicate Pi of arity ni, introduce new predicate Hi of arity ni + 1.
2. Introduce ONE new constant c.
3. NEW LANGUAGE: All Hi (of arity ni + 1) and constant c. NO original Pi.
4. TRANSLATION at atomic level: Replace every Pi(t1,...,t_ni) with Hi(c,t1,...,t_ni).
5. AXIOMS of T*: Original axioms with all Pi-atoms rewritten as Hi(c,...).
6. Do NOT add extra axioms.
7. Do NOT keep Pi in LANGUAGE of T*.

OUTPUT FORMAT:
1. THE RESULT

LANGUAGE: { H1(c,x1,...,x_n1), H2(c,x1,...,x_n2), ..., c }

TRANSLATION (OLD → NEW):
P1(x1,...,x_n1) ↔ H1(c,x1,...,x_n1)
P2(x1,...,x_n2) ↔ H2(c,x1,...,x_n2)
...

AXIOMS:
1. <axiom with all Pi-atoms rewritten as Hi(c,...)>
2. ...`
  },
  // FUNCTION 2: Schema Equivalence
  {
    id: "f2-direct-vocab",
    name: "Direct Vocabulary Mapping",
    functionId: 2,
    input: `<<<SEPARATOR>>>`,
    instructions: `Build a one-to-one symbol mapping between the two theories. Match each primitive to exactly one primitive in the other theory. Report if such a mapping exists.`
  },
  {
    id: "f2-arity-preserving",
    name: "Arity-Preserving Mapping",
    functionId: 2,
    input: `<<<SEPARATOR>>>`,
    instructions: `SCHEMA EQUIVALENCE: ARITY-PRESERVING MAPPING (T₁, T₂)

TASK:
Given two input theories T₁ and T₂, decide whether they are definitionally equivalent **via a direct arity-preserving renaming of predicates**.

This sub-function checks ONLY vocabulary structure:
- SAME number of predicates
- SAME arities in the SAME order
- AND a 1–1 renaming exists that makes all axioms match

CORE CONDITIONS:
1. T₁ and T₂ MUST have the same number k of predicate symbols
2. For each i = 1,...,k: arity(Pi) = arity(Qi). If any mismatch → NOT equivalent
3. If arities match, define a direct renaming: Pi(x1,...,x_ni) ↔ Qi(x1,...,x_ni)
4. Rewrite every axiom of T₁ by replacing Pi with Qi
5. Compare rewritten axioms to T₂'s axioms (up to permutation and α-conversion)
6. If the rewritten set exactly matches → EQUIVALENT: YES. Otherwise → EQUIVALENT: NO

OUTPUT (EXPLAIN = OFF):
Equivalence: YES/NO
If YES:
TRANSLATION (OLD → NEW):
P1(x1,...,x_n1) ↔ Q1(x1,...,x_n1)
...
If NO:
Equivalence: NO

OUTPUT (EXPLAIN = ON):
Equivalence: YES/NO
[same translation if YES]
EXPLANATION:
- Arity-preserving schema equivalence requires 1–1 predicate renaming with identical arities
- If arities match and axioms align under renaming, the theories are definitionally equivalent
- Otherwise, no arity-preserving schema map exists`
  },
  {
    id: "f2-structural-role",
    name: "Structural Role Mapping",
    functionId: 2,
    input: `<<<SEPARATOR>>>`,
    instructions: `SCHEMA EQUIVALENCE: STRUCTURAL ROLE MAPPING (T₁, T₂)

TASK:
Given two theories T₁ and T₂, determine whether they are definitionally equivalent **via a structural role mapping**: a bijection between predicate symbols that preserves (1) arity, AND (2) each predicate's syntactic "role-profile" across axioms.

This sub-function is a schema-level test of *pattern position*. No semantic reasoning and no model-searching are permitted.

ROLE PROFILE OF A PREDICATE R:
For each predicate symbol R in a theory, its "structural role profile" is the multiset of all syntactic contexts in which R appears inside the axioms:
- number of positive occurrences
- number of negative occurrences
- quantifier depth of each occurrence
- argument-position patterns (e.g., R(_,x2,_) vs R(x1,x1,_))
- connective environment (in antecedent, consequent, atomic, etc.)

CONDITIONS FOR STRUCTURAL-ROLE EQUIVALENCE:

1. SAME NUMBER OF PREDICATES: |Lang(T₁)| = |Lang(T₂)| = k
2. MATCHING ARITIES: For each i, arity(Pi) = arity(Qσ(i)) for some bijection σ
3. ROLE PROFILE MATCH: There exists a bijection σ on {1,...,k} such that RoleProfile(Pi) = RoleProfile(Qσ(i))
   - same multiset of contexts
   - same polarity distribution
   - same argument-position patterns
   - same depth patterns
   - same connective environments
4. AXIOM MATCH UNDER σ: After renaming each Pi to Qσ(i), transformed axioms of T₁ must match axioms of T₂ (up to permutation and α-conversion)

OUTPUT (EXPLAIN = OFF):
Equivalence: YES/NO
If YES:
TRANSLATION (OLD → NEW):
P1 ↔ Qσ(1)
P2 ↔ Qσ(2)
...
Pk ↔ Qσ(k)

OUTPUT (EXPLAIN = ON):
Equivalence: YES/NO
[same translation if YES]
EXPLANATION:
- A structural-role mapping compares predicates not by name but by their syntactic behavior inside axioms
- A bijection of predicates preserving arity and structural role yields a definitional equivalence
- The theories match exactly once all predicates are renamed by σ`
  },
  {
    id: "f2-obstruction",
    name: "Minimal Obstruction Report",
    functionId: 2,
    input: `<<<SEPARATOR>>>`,
    instructions: `SCHEMA EQUIVALENCE: MINIMAL OBSTRUCTION REPORT (T₁, T₂)

TASK:
Given two theories T₁ and T₂, output a **single, minimal, formal obstruction** explaining why they FAIL schema-equivalence under any mapping type (Direct Vocabulary, Arity-Preserving, Structural Role).

This sub-function NEVER declares equivalence. Its sole purpose is to identify the FIRST point of failure.

ORDER OF TESTING (test in this EXACT sequence):
1. Cardinality Mismatch: |Lang(T₁)| ≠ |Lang(T₂)|
2. Arity Mismatch: ∃i such that arity(Pi) ≠ any arity in T₂
3. No Possible Arity-Preserving Bijection: Multisets of arities differ
4. Role-Profile Mismatch: Even with matching arities, no bijection aligns role profiles
5. Axiom Mismatch: Even with a candidate bijection, rewritten axioms of T₁ fail to match T₂

Upon encountering the FIRST failing condition, STOP and report ONLY that obstruction.

MINIMAL OBSTRUCTION MESSAGES (pick exactly ONE):
1. "Obstruction: Different number of predicate symbols."
2. "Obstruction: Predicate arities do not match across theories."
3. "Obstruction: No arity-preserving bijection exists."
4. "Obstruction: No predicate-role mapping preserves structural profiles."
5. "Obstruction: Axioms do not match under any arity-preserving renaming."

OUTPUT (EXPLAIN = OFF):
<one minimal obstruction message>

OUTPUT (EXPLAIN = ON):
<one minimal obstruction message>
EXPLANATION:
A short explanation (2–3 lines maximum) stating why that specific obstruction prevents any schema-equivalence between the theories.`
  },
  // FUNCTION 3: Definitional Equivalence
  {
    id: "f3-mutual-explicit",
    name: "Mutual Explicit Definitions",
    functionId: 3,
    input: `<<<SEPARATOR>>>`,
    instructions: `DEFINITIONAL EQUIVALENCE (MUTUAL EXPLICIT DEFINITIONS) (T₁, T₂)

TASK:
Given two theories T₁ and T₂, determine whether every primitive predicate of T₁ is explicitly definable in T₂ AND every primitive predicate of T₂ is explicitly definable in T₁.

This sub-function tests **mutual explicit definability only**. No semantic reasoning, no models, no conservativity checks.

LANGUAGES:
- T₁ uses predicates P1,...,Pk with arities n1,...,nk
- T₂ uses predicates Q1,...,Qm with arities m1,...,mm

MECHANICAL TEST FOR EXPLICIT DEFINABILITY:

For each predicate Pi in T₁:
1. Construct a fresh atomic pattern: Pi(x1,...,x_ni)
2. Search T₂'s axioms for a formula φi(x1,...,x_ni) such that T₂ proves: Pi(x̄) ↔ φi(x̄)
   UNDER PURE SYNTAX MATCHING:
   - Replace every occurrence of Qi(...) in T₂ with schematic placeholders
   - Attempt to unify Pi(x̄) with a subformula that occupies the same structural position
   - No inference, no proof search
3. If no φi matches → definability fails

Repeat symmetrically for each predicate Qj of T₂ using formulas ψj in the language of T₁.

SUCCESS CONDITION:

Mutual explicit definability succeeds IFF:
- For every Pi in T₁, a formula φi exists in T₂
- For every Qj in T₂, a formula ψj exists in T₁

If so, the theories are definitionally equivalent **under mutual explicit definition**.

OUTPUT (EXPLAIN = OFF):
Equivalence: YES/NO
If YES:
TRANSLATIONS:
Pi(x̄) ↔ φi(x̄)
Qj(x̄) ↔ ψj(x̄)
If NO:
Equivalence: NO

OUTPUT (EXPLAIN = ON):
Equivalence: YES/NO
[same translations if YES]
EXPLANATION:
- Mutual explicit definability requires each primitive in T₁ to be explicitly definable in T₂ and vice versa
- The test uses only syntactic pattern-matching
- If all primitives admit explicit definitions, T₁ and T₂ are definitionally equivalent`
  },
  {
    id: "f3-one-direction",
    name: "One-Direction Definability",
    functionId: 3,
    input: `<<<SEPARATOR>>>`,
    instructions: `DEFINITIONAL EQUIVALENCE (ONE-DIRECTION DEFINABILITY) FROM T₁ INTO T₂

TASK:
Given two theories T₁ and T₂, determine whether **every primitive predicate of Theory A (T₁)** is explicitly definable **using only the vocabulary of Theory B (T₂)**.

This is a ONE-DIRECTION definability test: T₁ → T₂ only. No reverse definability is checked here.

LANGUAGES:
T₁ uses predicates: P1,...,Pk with arities n1,...,nk
T₂ uses predicates: Q1,...,Qm with arities m1,...,mm

The goal: For each Pi, produce a formula φi in the language of T₂ with the SAME arity.

MECHANICAL PROCEDURE FOR DEFINABILITY:

For each primitive predicate Pi of T₁:
1. Construct a schematic atomic pattern: Pi(x1,...,x_ni)
2. Search T₂'s axioms for a candidate formula φi(x1,...,x_ni) using PURE syntax matching:
   - Replace every Qi(...) in T₂ with schematic placeholders
   - Attempt to unify Pi(x̄) with a subformula of T₂'s axioms occupying the same syntactic role
   - No inference, no proof search, no semantic reasoning
3. If a matching φi is found: Record the explicit definition: Pi(x̄) ↔ φi(x̄)
4. If no φi matches: One-direction definability FAILS

SUCCESS CONDITION:

One-direction definability from T₁ into T₂ succeeds IFF:
- For every primitive Pi of T₁, a defining formula φi in T₂ exists
- Output the complete list of explicit definitions

OUTPUT (EXPLAIN = OFF):
Definable: YES/NO
If YES:
DEFINITIONS:
P1(x̄) ↔ φ1(x̄)
P2(x̄) ↔ φ2(x̄)
...
Pk(x̄) ↔ φk(x̄)
If NO:
Definable: NO

OUTPUT (EXPLAIN = ON):
Definable: YES/NO
[same definitions if YES]
EXPLANATION:
- One-direction definability requires defining every primitive of T₁ using only T₂ vocabulary
- The procedure is purely syntactic, based on pattern-matching against T₂'s axioms
- If all definitions are successfully located, T₁ is definable within T₂`
  },
  {
    id: "f3-minimization",
    name: "Definition Minimization",
    functionId: 3,
    input: `<<<SEPARATOR>>>`,
    instructions: `DEFINITIONAL EQUIVALENCE (DEFINITION MINIMIZATION)

TASK:
Given two theories T₁ and T₂, and assuming explicit definitions from earlier steps exist, compute **the shortest possible explicit definitions** for each primitive predicate of T₁ using the vocabulary of T₂.

"Shortest" means:
- Minimizing total number of quantifiers, and
- Minimizing total number of logical connectives
If ties remain, prefer the syntactically shortest formula.

This is a purely syntactic optimization step.

INPUT:
For each predicate Pi of T₁:
- A list of candidate explicit definitions φi¹, φi², … in the vocabulary of T₂ (generated earlier by the definability module)
- Each candidate is a formula with free variables x1,...,x_ni

MECHANICAL MINIMIZATION PROCEDURE:

For each predicate Pi:
1. For every candidate φiᵏ: Compute its **complexity score**: Score(φiᵏ) = (# of quantifiers) + (# of connectives)
2. Find the minimum score: S_min = min_k Score(φiᵏ)
3. Collect all candidates with Score = S_min
4. If more than one candidate remains: Select the lexicographically shortest formula as a tiebreaker
5. Record the unique minimal definition: Pi(x̄) ↔ φi_min(x̄)

SUCCESS CONDITION:

Definition minimization ALWAYS succeeds if at least one explicit definition exists for each Pi.

If any predicate has no candidate definitions:
- Minimization fails for that predicate
- Report "No definable formula available"

OUTPUT (EXPLAIN = OFF):
MINIMAL DEFINITIONS:
P1(x̄) ↔ φ1_min(x̄)
P2(x̄) ↔ φ2_min(x̄)
...
Pk(x̄) ↔ φk_min(x̄)

If any predicate has no available definition:
Report only:
"No definable formula available for Pi"

OUTPUT (EXPLAIN = ON):
MINIMAL DEFINITIONS:
[same as above]
EXPLANATION:
- Minimization selects the explicit definition with the smallest total number of quantifiers and connectives
- If multiple formulas tie, the syntactically shortest is chosen
- This ensures each definition is the most efficient available`
  },
  {
    id: "f3-conservative",
    name: "Conservative Definability",
    functionId: 3,
    input: `<<<SEPARATOR>>>`,
    instructions: `DEFINITIONAL EQUIVALENCE (CONSERVATIVE DEFINABILITY)

TASK:
Given two theories T₁ and T₂, determine whether the explicit definitions of T₁-primitives in T₂ (or vice versa) are **conservative definitions**.

A definition is conservative iff:
- Adding it to T₂ does NOT allow proving any new theorems in the old language of T₂ alone
- The definition is **eliminable**: any derivation using it can be rewritten into a derivation not using it

This sub-function checks conservativity **purely syntactically**.

INPUT:
For each predicate Pi of T₁:
- A candidate explicit definition: Pi(x̄) ↔ φi(x̄)
  where φi is a formula in the language of T₂

Goal: Determine whether each definition is conservative over T₂.

MECHANICAL CONSERVATIVITY TEST:

For each definition Pi(x̄) ↔ φi(x̄):

1. **Check eliminability condition syntactically:**
   A definition is eliminable iff:
   - Pi appears ONLY as a defined symbol, never as a primitive
   - Replacing every occurrence of Pi in any T₂-derivation with φi preserves the shape of the derivation
   - No new atomic forms are introduced into T₂'s language outside φi itself
   
   This is a structural check:
   - Confirm Pi does not occur in T₂'s axioms
   - Confirm φi uses only vocabulary already present in T₂
   - Confirm φi does not increase arity of any symbol

2. **Check conservativity syntactically:**
   T₂ ∪ {Pi(x̄) ↔ φi(x̄)} must not yield any new theorems in the vocabulary of T₂
   
   Mechanically:
   - Attempt to derive any T₂-language atomic formula from the definition alone
   - If substitution of φi never produces a T₂-atomic formula not already present, conservativity holds
   - If any such production occurs, conservativity fails

No semantic or proof-theoretic reasoning is permitted. This is a purely structural, schema-level elimination check.

SUCCESS CONDITION:

Conservative definability succeeds IFF:
- For every primitive Pi of T₁: Pi(x̄) ↔ φi(x̄) is **eliminable** in T₂
- Adding the definition produces **no new theorems** in the vocabulary of T₂

If all definitions pass, report success and output the conservative definitions.
If any definition fails, the entire test fails.

OUTPUT (EXPLAIN = OFF):
Conservative: YES/NO
If YES:
CONSERVATIVE DEFINITIONS:
P1(x̄) ↔ φ1(x̄)
P2(x̄) ↔ φ2(x̄)
...
Pk(x̄) ↔ φk(x̄)
If NO:
Conservative: NO

OUTPUT (EXPLAIN = ON):
Conservative: YES/NO
[same definitions if YES]
EXPLANATION:
- A conservative definition must be eliminable without affecting provability in the base theory
- The test checks only syntactic eliminability and prohibition of new theorems in T₂'s vocabulary
- If every definition satisfies eliminability, conservativity holds`
  },
  // FUNCTION 4: Model-Preserving Rewrite
  {
    id: "f4-reduced-primitive",
    name: "Reduced Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `MODEL-PRESERVING REWRITE (REDUCED PRIMITIVE SET)

TASK:
Given a theory T, eliminate as many primitive predicates as possible while preserving EXACTLY the same class of models (up to isomorphism). All eliminated primitives must be explicitly definable from the remaining ones.

The sub-function must output:
1. The minimal surviving primitive set
2. Definitions expressing each eliminated primitive in terms of the survivors

INPUT:
A single theory T with:
- LANGUAGE: predicates P1,...,Pk with arities ≥ 1
- AXIOMS: first-order sentences over that language
- EXPLAIN toggle (ON or OFF)

MECHANICAL REDUCTION PROCEDURE:

For each predicate Pi:
1. Attempt to syntactically express Pi(x̄) as a formula φi(x̄) using ONLY the other predicates {Pj : j ≠ i} by:
   - Searching every axiom for positions where Pi appears
   - Replacing other predicates Pj by schematic placeholders
   - Attempting to unify Pi(x̄) with a subformula in which Pi appears *only on one side* of an equivalence, implication, or definitional pattern
2. If such a φi is found and contains no occurrence of Pi: Mark Pi as DEFINABLE
3. If no such φi exists: Mark Pi as NON-DEFINABLE

After scanning all predicates:
4. Remove all DEFINABLE primitives from the language
5. For each removed Pi, record its explicit definition: Pi(x̄) ↔ φi(x̄)
6. The remaining primitives form the MINIMAL PRIMITIVE SET

No inference, no model-building, and no semantic reasoning are permitted. THIS IS A PURELY SYNTACTIC DEFINABILITY TEST.

SUCCESS CONDITION:

Reduction ALWAYS succeeds.
- If zero primitives are eliminable: Output the original primitive set unchanged + "No eliminable primitives"
- If at least one primitive is eliminable: Output the reduced primitive set + explicit definitions for each eliminated predicate

OUTPUT (EXPLAIN = OFF):

MINIMAL LANGUAGE:
{ list surviving primitives with arities }

ELIMINATED PRIMITIVES AND DEFINITIONS:
P_i(x̄) ↔ φ_i(x̄)
...

AXIOMS:
(same axioms of T, unchanged except that eliminated predicates, if they appear, are replaced by their definitions)

OUTPUT (EXPLAIN = ON):
(same as EXPLAIN = OFF)

EXPLANATION:
- A primitive was removed only if it had an explicit syntactic definition using the remaining primitives
- This guarantees that all models of the original theory extend uniquely to models of the rewritten theory
- Therefore the rewritten theory is model-preserving`
  },
  {
    id: "f4-expanded-primitive",
    name: "Expanded Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `MODEL-PRESERVING REWRITE (EXPANDED PRIMITIVE SET)

TASK:
Given a theory T, introduce NEW primitive predicates that serve as abbreviations for complex or frequently occurring patterns in the axioms, with the objective of making the axiom-set syntactically simpler while preserving EXACTLY the same models.

Each added primitive MUST:
1. Correspond to a definable pattern in the original language
2. Be introduced with an explicit definition
3. Preserve model-equivalence (the new primitives add no new models and remove none)

The rewritten theory must contain:
- The enlarged vocabulary (old primitives + new primitives)
- The original axioms rewritten to use the new primitives
- The explicit definitions of the new primitives

INPUT:
A single theory T with:
- LANGUAGE: P1,...,Pk
- AXIOMS: any first-order sentences
- EXPLAIN toggle (ON or OFF)

MECHANICAL EXPANSION PROCEDURE:

1. **Pattern Detection**: Scan every axiom for repeated subformula patterns ψ(x̄). A pattern counts as repeated if it occurs at least twice syntactically (α-equivalent).

2. **New Primitive Introduction**: For each repeated ψ(x̄), introduce a fresh predicate Hψ with arity equal to the length of x̄.

3. **Definition of New Primitive**: Add a definitional axiom: ∀x̄ ( Hψ(x̄) ↔ ψ(x̄) )

4. **Rewrite Axioms Using New Primitives**: Replace every occurrence of ψ(x̄) in the axioms with Hψ(x̄).

5. **Model-Equivalence Verification (Syntactic Only)**: Because Hψ is introduced via an explicit biconditional:
   - Every model of the original theory uniquely expands to a model of the new theory by interpreting Hψ as ψ
   - Every model of the new theory reduces to a model of the old theory by eliminating Hψ
   - Therefore, NO semantic check, inference, or model search is used.

SUCCESS CONDITION:

Expansion ALWAYS succeeds.
- If no repeated patterns are found: No new primitives are added. Output "No convenient primitives detected."
- If repeated patterns exist: Add new primitives, add definitional equivalences, rewrite axioms accordingly.

OUTPUT (EXPLAIN = OFF):

NEW LANGUAGE:
{ original predicates, plus all new Hψ predicates }

DEFINITIONS:
Hψ(x̄) ↔ ψ(x̄)
...

REWRITTEN AXIOMS:
1. <axiom 1 rewritten using Hψ>
2. <axiom 2 rewritten using Hψ>
...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- Each added primitive abbreviates a repeated complex pattern
- Each is introduced conservatively via a biconditional definition
- Eliminability of the new primitives ensures model-equivalence`
  },
  {
    id: "f4-algebraic",
    name: "Algebraic Reconstruction",
    functionId: 4,
    input: ``,
    instructions: `MODEL-PRESERVING REWRITE (ALGEBRAIC RECONSTRUCTION)

TASK:
Given a theory T written in a relational first-order language, rewrite it into a PURELY ALGEBRAIC (equational) formulation:
- Only function symbols (including constants) are permitted
- All predicates must be eliminated
- Every relation must be converted into one or more functions
- All axioms must be rewritten as equations between terms

The resulting theory must:
1. Be definitionally equivalent to the original
2. Characterize EXACTLY the same class of models (up to isomorphism)

INPUT:
A single theory T with:
- LANGUAGE: predicates P1,...,Pk (arity ≥ 1)
- AXIOMS: any first-order sentences
- EXPLAIN toggle (ON or OFF)

MECHANICAL ALGEBRAIC REWRITE PROCEDURE:

STEP 1 — FUNCTIONALIZE EACH RELATION:
For each predicate Pi(x1,...,x_ni):
1. Introduce a NEW function symbol Fi of arity ni whose outputs live in a new designated "boolean" sort (treated algebraically)
2. Introduce two constant symbols: tt (representing "true") and ff (representing "false")
3. Replace every atomic formula Pi(t1,...,t_ni) with the equation: Fi(t1,...,t_ni) = tt
4. Replace ¬Pi(t1,...,t_ni) with: Fi(t1,...,t_ni) = ff

STEP 2 — ELIMINATE LOGICAL CONNECTIVES:
Rewrite all logical operations using algebraic equalities:
- (A ∧ B) becomes: min(F_A(...), F_B(...)) = tt
- (A ∨ B) becomes: max(F_A(...), F_B(...)) = tt
- (A ↔ B) becomes: Fi(...) = Fj(...)
- (A → B) becomes: (Fi(...)=ff) ∨ (Fj(...)=tt), rewritten using max/min
Add function symbols min and max if needed, defined algebraically:
- min(tt,tt)=tt; min(tt,ff)=ff; min(ff,ff)=ff
- max(ff,ff)=ff; max(tt,ff)=tt; max(tt,tt)=tt

STEP 3 — ELIMINATE QUANTIFIERS:
Quantifiers are algebraized using Skolem functions:
- ∀x φ(x) becomes an equation stating φ(x) holds for an arbitrary Skolem variable chosen by a fresh function S∀
- ∃x φ(x) becomes φ applied to a Skolem function S∃(params)
This preserves model-equivalence via standard Skolemization.

STEP 4 — PRODUCE FINAL EQUATIONAL THEORY:
All axioms must now be:
- equalities between terms
- using only function symbols (old Skolem and new Fi, min, max)
- with no predicate symbols remaining

SUCCESS CONDITION:

Algebraic reconstruction ALWAYS succeeds. The output theory must:
- Contain NO predicates
- Contain ONLY function symbols and equations
- Be definitionally equivalent to the original
- Allow every original model to expand uniquely into a model of the algebraic form

OUTPUT (EXPLAIN = OFF):

LANGUAGE:
{ all new Fi functions, tt, ff, min, max, and Skolem functions }

EQUATIONAL AXIOMS:
1. <first axiom rewritten as an equation>
2. <second axiom rewritten as an equation>
...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- Every relation is replaced by a "truth-valued" function
- Logical structure is coded algebraically using tt, ff, min, max
- Quantifiers are eliminated by Skolemization
- The resulting equational theory is definitionally equivalent and preserves all models`
  },
  {
    id: "f4-pure-relational",
    name: "Pure Relational Reconstruction",
    functionId: 4,
    input: ``,
    instructions: `Eliminate all function symbols and constants. Rewrite using only relations and predicates. Every term becomes a relational assertion.`
  },
  // FUNCTION 5: Conservative Extension Analysis
  {
    id: "f5-new-primitives",
    name: "New Primitives Test",
    functionId: 5,
    input: `<<<SEPARATOR>>>`,
    instructions: `CONSERVATIVE EXTENSION ANALYSIS (NEW PRIMITIVES TEST)

TASK:
Given a base theory T₁ and an extended theory T₂ formed by adding NEW primitive symbols (predicates, functions, or constants), determine whether the extension is **conservative**:

Adding the new primitives must NOT allow proving any new theorems in the **original vocabulary** of T₁.

Only the new symbols differ; no new axioms are considered here.

INPUT:
Two theories:

T₁ (base theory):
- LANGUAGE: L₁
- AXIOMS: A₁

T₂ (extension):
- LANGUAGE: L₂ = L₁ ∪ {new primitives}
- AXIOMS: A₁ (same axioms; only the language is expanded)

EXPLAIN toggle (ON or OFF)

MECHANICAL CONSERVATIVITY TEST:

STEP 1 — IDENTIFY NEW PRIMITIVES:
New primitives = L₂ − L₁

STEP 2 — CHECK FOR DEFINABILITY:
For each new primitive symbol S:
Attempt to find a syntactic definition φ_S in the language L₁ such that: S(x̄) ↔ φ_S(x̄)

Matching must be purely syntactic:
- Scan axioms of T₂ (which equal those of T₁)
- Attempt to unify S(x̄) with any subformula φ_S(x̄)
- No inference, no semantic reasoning

If such a φ_S is found for ALL S: The extension is conservative.

STEP 3 — CHECK FOR NEW THEOREMS IN L₁:
Attempt to derive any formula ψ in L₁ that was NOT derivable in T₁ but becomes derivable in T₂

Mechanically:
- Replace every occurrence of each S(x̄) with φ_S(x̄) anywhere it occurs
- If the resulting formula is ALWAYS reducible to a formula already provable from A₁, then no new theorems appear
- If, after substitution, ANY ψ in L₁ becomes derivable that was not previously derivable, the extension is NON-conservative

This is a syntactic substitution test only.

SUCCESS CONDITION:

The extension T₂ is CONSERVATIVE over T₁ iff:
- Every new primitive symbol S has a syntactic definition φ_S in L₁
- Replacing S by φ_S never produces new theorems in L₁

Otherwise: The extension is NON-CONSERVATIVE

OUTPUT (EXPLAIN = OFF):
Conservative: YES/NO
If YES:
DEFINITIONS:
S₁(x̄) ↔ φ₁(x̄)
S₂(x̄) ↔ φ₂(x̄)
...
If NO:
Conservative: NO

OUTPUT (EXPLAIN = ON):
Conservative: YES/NO
[same definitions if YES]
EXPLANATION:
- The test checks whether each introduced primitive is definable using only the old vocabulary
- If definable, the extension cannot add new theorems in L₁
- If any primitive lacks a definition or yields new L₁-theorems, the extension is non-conservative`
  },
  {
    id: "f5-new-axioms",
    name: "New Axioms Test",
    functionId: 5,
    input: `<<<SEPARATOR>>>`,
    instructions: `CONSERVATIVE EXTENSION ANALYSIS (NEW AXIOMS TEST)

TASK:
Given a base theory T₁ and an extended theory T₂ obtained by adding **new axioms** (not new symbols), determine whether the extension is **conservative**:

T₂ must NOT prove any new theorems expressible in the vocabulary of T₁ that were not already provable in T₁.

This test evaluates only the effect of **additional axioms**.

INPUT:
T₁ (base theory):
- LANGUAGE: L
- AXIOMS: A₁

T₂ (extension):
- LANGUAGE: L (same vocabulary)
- AXIOMS: A₂ = A₁ ∪ {new axioms}

EXPLAIN toggle (ON or OFF)

MECHANICAL CONSERVATIVITY TEST:

STEP 1 — IDENTIFY NEW AXIOMS:
Let Δ = A₂ − A₁. These are the axioms whose effect we are analyzing.

STEP 2 — CHECK FOR NEW THEOREMS:
We examine whether any formula ψ in the **original language** L is derivable from A₂ but NOT derivable from A₁

Mechanical procedure:
1. For each new axiom δ in Δ:
   - Attempt to syntactically produce consequences of δ using: substitution, instantiation, rewriting under equivalences in A₁
2. Any consequence ψ that lies **entirely in L** (no new symbols) is a candidate new theorem
3. If ψ is reducible to an axiom or theorem already in A₁: NOT A NEW THEOREM
4. If ψ cannot be reduced syntactically to anything provable from A₁: T₂ proves a new fact → NON-CONSERVATIVE

No semantic reasoning, no model-search, and no meta-theoretical proof attempts are permitted.

STEP 3 — CHECK FOR COUNTERMODEL:
If a candidate ψ appears to be new:
Search for a syntactic countermodel pattern:
- Attempt to unify ¬ψ with a model-pattern that satisfies A₁ but not δ
- If such a syntactic model-pattern exists, ψ was NOT previously provable in T₁, hence T₂ is non-conservative

SUCCESS CONDITION:

T₂ is CONSERVATIVE over T₁ iff:
- No sentence ψ in language L becomes newly provable from the added axioms Δ

If ANY such ψ exists, conservativity FAILS.

OUTPUT (EXPLAIN = OFF):
Conservative: YES/NO
If NO:
NEW THEOREM:
ψ
If YES:
(No new theorems)

OUTPUT (EXPLAIN = ON):
Conservative: YES/NO
[NEW THEOREM: ψ if NO]
EXPLANATION:
- New axioms are conservative only if they do not generate new consequences in the original vocabulary
- The test isolates the effects of the new axioms syntactically
- If any new ψ arises, the extension is non-conservative`
  },
  {
    id: "f5-weak-extension",
    name: "Weak Extension Test",
    functionId: 5,
    input: `<<<SEPARATOR>>>`,
    instructions: `CONSERVATIVE EXTENSION ANALYSIS (WEAK EXTENSION TEST)

TASK:
Given two theories T₁ and T₂ where T₂ extends T₁, determine whether T₂ is a **weak conservative extension** of T₁.

A WEAK extension allows:
- Adding **only definitional abbreviations**, not arbitrary axioms
- Each added sentence must be eliminable by substituting its definitional expansion
- No new theorems in T₁'s vocabulary may be introduced

This is STRICTER than full conservativity.

INPUT:
T₁ (base theory):
- LANGUAGE: L
- AXIOMS: A₁

T₂ (candidate weak extension):
- LANGUAGE: L ∪ {new symbols}
- AXIOMS: A₁ ∪ {δ₁,...,δₙ}

Each δᵢ must be tested to see if it is a **pure definitional abbreviation**.

EXPLAIN toggle: ON or OFF

MECHANICAL WEAK-EXTENSION TEST:

STEP 1 — IDENTIFY NEW SYMBOLS:
Let S = (L₂ − L₁). Each δᵢ must define exactly ONE symbol in S.

If δᵢ contains more than one symbol in S → FAIL.
If δᵢ is not of the form: NewSymbol(x̄) ↔ φ(x̄) with φ in L₁ → FAIL.

STEP 2 — ELIMINABILITY CHECK:
For each definitional clause: NewSymbol(x̄) ↔ φ(x̄)

Verify mechanically that:
- Substituting φ(x̄) everywhere for NewSymbol(x̄) in T₂ yields exactly T₁ plus trivial logical consequences
- No substitution produces an axiom not derivable from A₁
- No substitution introduces a non-eliminable occurrence of NewSymbol

If any fail → FAIL.

STEP 3 — CONSERVATIVITY CHECK (STRONGER THAN NORMAL):
This check is stricter than ordinary conservativity:

Even if T₂ is conservative in the usual sense, WEAK conservativity fails unless:
- Every added δᵢ is ELIMINABLE
- Every δᵢ introduces NO new theorems in L₁
- T₂ reduces to T₁ *purely by definitional inlining*

If ANY δᵢ fails, the weak extension test fails.

SUCCESS CONDITION:

T₂ is a **weak conservative extension** of T₁ IFF:
1. Every added axiom δᵢ is a definitional equivalence NewSymbol ↔ φ in the old language
2. Every definition is fully eliminable
3. T₂ introduces NO new theorems in the original vocabulary
4. T₁ is recovered *exactly* by eliminating abbreviations

Otherwise: Weak Extension: NO.

OUTPUT (EXPLAIN = OFF):
Weak Extension: YES/NO
If YES:
DEFINITIONS:
NewSymbol₁(x̄) ↔ φ₁(x̄)
...
If NO:
Weak Extension: NO

OUTPUT (EXPLAIN = ON):
Weak Extension: YES/NO
[same definitions if YES]
EXPLANATION:
- Weak extensions allow only definitional abbreviations
- Each must be eliminable and yield no new theorems
- If any abbreviation is non-eliminable, the extension fails even if T₂ is conservative in the ordinary sense`
  },
  {
    id: "f5-independence",
    name: "Independence Check",
    functionId: 5,
    input: `<<<SEPARATOR>>>`,
    instructions: `Determine whether the added axiom is independent of the base theory (neither provable nor refutable). Provide model evidence for independence.`
  },
  // FUNCTION 6: Compare Conceptual Schemes
  {
    id: "f6-primitive-derived",
    name: "Primitive vs. Derived Classification",
    functionId: 6,
    input: `<<<SEPARATOR>>>`,
    instructions: `COMPARE CONCEPTUAL SCHEMES: PRIMITIVE VS. DERIVED CLASSIFICATION (T₁, T₂)

TASK:
Given two theories T₁ and T₂, list all concepts (all predicate symbols), determine which are **primitive** and which are **derived**, and construct a **dependency graph** showing how derived predicates depend on primitives.

Concept classification must be based on explicit definability only. No semantic reasoning, no model-searching.

INPUT:
T₁ and T₂ with:
- Predicates P₁,...,P_k (from T₁)
- Predicates Q₁,...,Q_m (from T₂)
- Axioms A₁ (from T₁) and A₂ (from T₂)
- EXPLAIN toggle ON/OFF

MECHANICAL CLASSIFICATION PROCEDURE:

STEP 1 — COLLECT ALL CONCEPTS:
Concept set C = predicates of T₁ ∪ predicates of T₂. Each concept is analyzed separately.

STEP 2 — TEST DEFINABILITY:
For each predicate symbol R(x̄):
1. Attempt to find a syntactic definition φ_R in the language of (C − {R}): R(x̄) ↔ φ_R(x̄)
   using the mechanical definability procedure used in Definitional Equivalence:
   - Replace non-R predicates by placeholders
   - Attempt unification of R(x̄) with a subformula
   - No inference, no semantic reasoning
2. If such a φ_R exists: Mark R as **derived**. Record definition: R(x̄) ↔ φ_R(x̄)
3. Else: Mark R as **primitive**

STEP 3 — BUILD DEPENDENCY GRAPH:
For each derived predicate R with definition φ_R:
1. Identify all predicate symbols S appearing in φ_R
2. Add directed edges: S → R

The resulting dependency graph shows how concepts build on one another.

SUCCESS CONDITION:

This procedure ALWAYS succeeds: every predicate is either:
- primitive (no explicit definition found), or
- derived (explicit definition found)

OUTPUT (EXPLAIN = OFF):

PRIMITIVES:
{ list of all predicates classified as primitive }

DERIVED:
R₁(x̄) ↔ φ₁(x̄)
R₂(x̄) ↔ φ₂(x̄)
...

DEPENDENCY GRAPH:
S₁ → R₁
S₂ → R₁
S₃ → R₂
...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- A concept is primitive if no explicit definition is available using the other predicates
- A concept is derived if an explicit definition is found
- The dependency graph shows how complex concepts depend on simpler ones, revealing the structure of the conceptual scheme`
  },
  {
    id: "f6-depth-map",
    name: "Conceptual Depth Map",
    functionId: 6,
    input: `<<<SEPARATOR>>>`,
    instructions: `COMPARE CONCEPTUAL SCHEMES: CONCEPTUAL DEPTH MAP (T₁, T₂)

TASK:
Compute the **definitional depth** of every concept (predicate) in the combined conceptual scheme of T₁ and T₂.

Definitional depth = number of definitional layers separating a concept from the primitives.

Depth is:
- 0 for primitive predicates
- 1 for predicates definable from primitives
- 2 for predicates definable from depth-1 predicates
- etc.

This is a graph-theoretic computation using the dependency graph from the previous sub-function.

INPUT:
Input consists of:
- The set of concepts: all predicates from T₁ and T₂
- Their primitive/derived classification
- Their definitional dependencies (edges S → R)
- EXPLAIN toggle (ON or OFF)

MECHANICAL DEPTH COMPUTATION:

STEP 1 — INITIALIZE DEPTHS:
For every predicate R:
- If R is primitive, set depth(R) = 0
- If R is derived, leave depth unset initially

STEP 2 — ITERATIVE DEPTH ASSIGNMENT:
Repeat the following until no assignments remain:

For every derived predicate R:
- Let its definition be: R(x̄) ↔ φ_R(x̄)
- Let Dependencies(R) be the set of predicates appearing in φ_R

If **all** predicates in Dependencies(R) already have assigned depths:
- Assign: depth(R) = 1 + max(depth(S) for S in Dependencies(R))

If ANY dependency lacks a depth, skip R for now.

Continue iterating until all derived predicates with definable dependencies are assigned a finite depth.

STEP 3 — HANDLE CYCLIC DEFINITIONS:
If a predicate R is involved in a definitional cycle:
- If the cycle includes a primitive → depth is finite
- If the cycle contains **no** primitives → assign: depth(R) = ∞ (mark as "infinitely derived")

SUCCESS CONDITION:

A complete conceptual depth map must be produced listing the depth of every concept:
- finite natural number or
- ∞ for irreducibly cyclic definitions

OUTPUT (EXPLAIN = OFF):

CONCEPTUAL DEPTHS:
Primitive predicates (depth 0):
  P₁, P₂, ...

Depth 1:
  R₁, R₂, ...

Depth 2:
  S₁, S₂, ...

Depth ∞ (cyclic, no primitive base):
  C₁, C₂, ...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- Depth measures the number of definitional layers above primitives
- Deeper concepts depend structurally on many other concepts
- Cycles without primitives yield infinite definitional chains`
  },
  {
    id: "f6-bottleneck",
    name: "Bottleneck Detection",
    functionId: 6,
    input: `<<<SEPARATOR>>>`,
    instructions: `COMPARE CONCEPTUAL SCHEMES: BOTTLENECK DETECTION (T₁, T₂)

TASK:
Given two conceptual schemes (T₁ and T₂), identify **conceptual bottlenecks**—primitive predicates on which **all other concepts ultimately depend** through their definitional chains.

A bottleneck is a primitive that appears (directly or indirectly) in every definitional lineage of every derived concept.

INPUT:
Input consists of:
- The full set of predicates from T₁ and T₂
- The definitional dependency graph (edges S → R)
- The primitive/derived classification
- The conceptual depths (finite or ∞)
- EXPLAIN toggle ON/OFF

MECHANICAL BOTTLENECK COMPUTATION:

STEP 1 — COMPUTE ANCESTRAL SETS:
For each concept R:
1. Trace all definitional dependencies recursively: Ancestors(R) = { all predicates S such that S →* R }
   where →* is transitive closure
2. If R is primitive, Ancestors(R) = {R}

STEP 2 — IDENTIFY GLOBAL BOTTLENECKS:
A primitive predicate P is a conceptual bottleneck iff:

For **every** concept R in the scheme: P ∈ Ancestors(R)

This includes:
- all derived predicates
- all other primitives (trivial for itself)

If multiple primitives satisfy this property, each is a bottleneck.
If NO primitive satisfies this for all R: There is **no** bottleneck.

STEP 3 — OPTIONAL PARTIAL BOTTLENECKS:
If no global bottleneck exists:
Compute **partial bottlenecks**: Primitives that appear in Ancestors(R) for a **majority** of concepts.
These are not required for the RESULT block, but may appear when EXPLAIN = ON.

SUCCESS CONDITION:

The sub-function must output:
- The list of global bottlenecks (possibly empty)
- No additional constructs

OUTPUT (EXPLAIN = OFF):

CONCEPTUAL BOTTLENECKS:
{ list of primitives P such that P ∈ Ancestors(R) for all R }

If none exist:
CONCEPTUAL BOTTLENECKS:
{ }

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- A bottleneck is a primitive all definitional paths eventually rely on
- These predicates serve as structural "chokepoints" in the conceptual scheme
- If no primitive appears in all ancestral sets, there is no bottleneck`
  },
  {
    id: "f6-rebalancing",
    name: "Conceptual Rebalancing",
    functionId: 6,
    input: `<<<SEPARATOR>>>`,
    instructions: `Suggest alternative primitive choices that distribute conceptual load more evenly. Reduce bottlenecks by changing what counts as primitive.`
  },
  // FUNCTION 7: Ontological Dependence
  {
    id: "f7-remove-one",
    name: "Remove One Primitive",
    functionId: 7,
    input: ``,
    instructions: `ONTOLOGICAL DEPENDENCE: REMOVE ONE PRIMITIVE (1 ARG)

TASK:
Given a single theory T, remove its **first (main) primitive** from the language and determine what collapses.

You must report:
1. Which axioms become **unstatable** (contain symbols no longer in the language)
2. Which definitional chains break
3. Which theorems (syntactically derivable consequences) become **unprovable** because they depended on the removed primitive
4. Whether the remaining primitives suffice to reconstruct the old one (definability test). If so, note the definitional recovery

No semantic reasoning. No model construction. Purely syntactic.

INPUT:
A single theory T with:
- LANGUAGE: {P₁, P₂, ..., P_k} (P₁ is the primitive to remove)
- AXIOMS: A
- EXPLAIN toggle ON/OFF

MECHANICAL REMOVAL PROCEDURE:

STEP 1 — REMOVE P₁ FROM THE LANGUAGE:
New language L′ = L − {P₁}. Any axiom or derived formula containing P₁ becomes unstatable.

STEP 2 — FILTER AXIOMS:
Partition the axioms into:
• **Surviving axioms**: Axioms that contain no occurrence of P₁
• **Destroyed axioms**: Axioms that contain P₁ and cannot be expressed in the new language

Destroyed axioms are removed from the theory entirely.

STEP 3 — TEST DEFINABILITY OF THE REMOVED PRIMITIVE:
Attempt to find a syntactic definition φ(x̄) such that: P₁(x̄) ↔ φ(x̄)
where φ uses only symbols from L′.

Use mechanical definability test:
- Syntactic pattern matching only
- No inference, no semantic interpretation

If definable: Mark P₁ as **recoverable**
If not definable: Mark P₁ as **irrecoverable**

STEP 4 — IDENTIFY LOST THEOREMS:
Compute which theorems depended on P₁:
- Any theorem ψ containing P₁ becomes inexpressible → lost
- Any theorem ψ not containing P₁ but whose derivation used a destroyed axiom becomes **unprovable**

Check derivations by:
- Replacing each destroyed axiom with a placeholder FAILURE marker
- Any ψ whose proof references a FAILURE marker is removed from the theorem set

STEP 5 — SUMMARY OF COLLAPSE:
List:
1. Unstatable axioms
2. Lost theorems
3. Surviving axioms
4. Whether P₁ is definably recoverable or permanently lost

OUTPUT (EXPLAIN = OFF):

REMOVED PRIMITIVE:
P₁

UNSTABLE AXIOMS (DESTROYED):
1. <axiom>
2. <axiom>
...

SURVIVING AXIOMS:
1. <axiom>
2. <axiom>
...

LOST THEOREMS:
1. <theorem>
2. <theorem>
...

RECOVERABILITY:
Recoverable / Not recoverable

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- Removing P₁ deletes every axiom in which it appears
- Any theorem whose proof uses a deleted axiom becomes unprovable
- If no definition φ in the reduced language exists, P₁ is ontologically load-bearing and cannot be rebuilt`
  },
  {
    id: "f7-minimal-set",
    name: "Minimal Primitive Set",
    functionId: 7,
    input: ``,
    instructions: `ONTOLOGICAL DEPENDENCE: MINIMAL PRIMITIVE SET (1 ARG)

TASK:
Given a single theory T, find the **smallest subset of primitives** that still makes the theory functional.

A primitive set S ⊆ L is **minimal** iff:
1. Every other primitive predicate P ∉ S is explicitly definable from S (syntactic definability only)
2. No proper subset of S has property (1)

You must output the minimal primitive base S and all definitional schemata expressing the other primitives in terms of S.

INPUT:
A theory T with:
- LANGUAGE: L = {P₁, P₂, ..., P_k}
- AXIOMS: A
- EXPLAIN toggle ON/OFF

MECHANICAL MINIMALITY PROCEDURE:

STEP 1 — INITIALIZE CANDIDATE SET:
Start with the full primitive set: S = L

STEP 2 — VARIATIONAL REMOVAL OF PRIMITIVES:
For each primitive P in S:
1. Temporarily remove P: S_temp = S − {P}
2. Test whether P is definable from S_temp:
   Attempt to find φ_P(x̄) in the language S_temp such that: P(x̄) ↔ φ_P(x̄)
   Using the mechanical definability test:
   - Syntactic matching only
   - No inference
   - No semantic reasoning
3. If definable: Permanently remove P from S
4. If not definable: Keep P in S

Repeat until no primitive can be removed.

STEP 3 — VERIFY MINIMALITY:
After all removals:
For each P ∈ S:
- Attempt to define P using S − {P}
- If definable → S is NOT minimal → continue removing
- If not definable → S is minimally necessary

Stop once every predicate in S fails the definability test relative to the others.

STEP 4 — COMPUTE DEFINITIONS FOR NON-PRIMITIVES:
For each primitive Q ∉ S (removed earlier):
- Output its explicit definition: Q(x̄) ↔ φ_Q(x̄)

SUCCESS CONDITION:

A minimal primitive set S must satisfy:
1. Every predicate outside S is definable from S
2. No predicate inside S is definable from the remaining ones

OUTPUT (EXPLAIN = OFF):

MINIMAL PRIMITIVE SET:
{ P_i, P_j, ... }

DEFINITIONS OF REMOVED PRIMITIVES:
Q₁(x̄) ↔ φ₁(x̄)
Q₂(x̄) ↔ φ₂(x̄)
...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- A minimal primitive base is one from which all other predicates can be defined, but which itself cannot be reduced further
- Each removed primitive is explicitly definable from the final base
- No further removal is possible without losing definability`
  },
  {
    id: "f7-replacement",
    name: "Replacement Test",
    functionId: 7,
    input: ``,
    instructions: `ONTOLOGICAL DEPENDENCE: REPLACEMENT TEST (1 ARG)

TASK:
Given a theory T, attempt to **replace the main/first primitive P₁** with a definable surrogate constructed from the other primitives.

You must determine:
1. Whether such a surrogate exists (syntactic definability test)
2. Provide the explicit replacement if it exists
3. If impossible, report the exact reason: no definitional match, circular dependencies, missing structural roles

No semantic reasoning or model analysis. Pure syntax only.

INPUT:
A theory T with:
- LANGUAGE: L = {P₁, P₂, ..., P_k} (P₁ is the target primitive for replacement)
- AXIOMS: A
- EXPLAIN toggle ON/OFF

MECHANICAL REPLACEMENT PROCEDURE:

STEP 1 — REMOVE P₁ FROM DEFINIENDUM:
Candidate surrogate must use only predicates in: L′ = L − {P₁}

STEP 2 — ATTEMPT DEFINABILITY MATCH:
Search for a formula φ(x̄) built only from symbols in L′ such that: P₁(x̄) ↔ φ(x̄)

Procedure:
- Scan all axioms of T
- Replace occurrences of predicates other than P₁ with placeholders
- Attempt to unify P₁(x̄) with a subformula φ(x̄) in identical argument positions
- No inference rules. No proof search. Strict syntactic match only

If a valid φ(x̄) is found, proceed to STEP 3.
If no match is found: Replacement = Impossible. Reason = Non-definability

STEP 3 — CHECK FOR CIRCULARITY:
Inspect φ(x̄):

If φ(x̄) depends on any predicate R such that:
- R is definable only using P₁ (directly or indirectly), and
- removing P₁ breaks R

Then definability is circular → Replacement impossible.

STEP 4 — CONSTRUCT SURROGATE P₁*:
If definability succeeds and is non-circular:

Define new surrogate primitive: P₁*(x̄) ≡ φ(x̄)

Replace ALL occurrences of P₁ in the axioms of T with P₁*(x̄).

Form new theory T*:
- LANGUAGE: L′ ∪ {P₁*}
- AXIOMS: A with all instances of P₁ replaced by φ

STEP 5 — VERIFY STRUCTURAL ROLE PRESERVATION:
Check syntactically whether every axiom containing P₁ remains well-formed after substitution.

If any axiom is destroyed (e.g., φ requires more/fewer arguments):
Replacement fails. Reason = Structural mismatch

SUCCESS CONDITION:

Replacement succeeds IFF:
1. A syntactic definition φ(x̄) of P₁ exists using L′
2. φ does not involve circular definitional dependencies
3. Substitution preserves the form of all axioms in T

OUTPUT (EXPLAIN = OFF):

REPLACEMENT:
Possible / Impossible

If POSSIBLE:
P₁(x̄) ↔ φ(x̄)

SURROGATE:
P₁*(x̄) ≡ φ(x̄)

REWRITTEN AXIOMS:
1. <axiom with φ-substitution>
2. ...

If IMPOSSIBLE:
Reason:
- Non-definability
- Circular dependency
- Structural mismatch

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- Replacement requires explicit definability and non-circularity
- If φ exists, P₁ can be eliminated without loss of structure
- If not, P₁ is load-bearing and cannot be substituted`
  },
  {
    id: "f7-load-bearing",
    name: "Load-Bearing Ranking",
    functionId: 7,
    input: ``,
    instructions: `Rank all primitives from most to least ontologically important. Score by how many axioms and theorems depend on each.`
  },
  // FUNCTION 8: Generate Alternative Conceptualizations
  {
    id: "f8-invert-ontology",
    name: "Invert Ontology",
    functionId: 8,
    input: ``,
    instructions: `GENERATE ALTERNATIVE CONCEPTUALIZATIONS: INVERT ONTOLOGY (1 ARG)

TASK:
Given a theory T, identify the **most heavily derived concept**—the predicate that appears in the largest number of definitions or the largest number of definitional chains—and make it the **new primitive**.

Then:
1. Redefine the original primitives using this new base
2. Rewrite all axioms into a fully inverted theory T*
3. Output the inverted language, definitions, and rewritten axioms

Purely syntactic. No semantic reasoning.

INPUT:
A single theory T with:
- LANGUAGE: L = {P₁, …, P_k}
- AXIOMS: A
- The definitional dependency graph from earlier modules
- EXPLAIN toggle ON/OFF

MECHANICAL INVERSION PROCEDURE:

STEP 1 — COMPUTE DERIVATIONAL LOAD:
For each predicate R: Load(R) = number of predicates S such that R ∈ Ancestors(S)

The concept with maximum Load(R) is the **most heavily derived**.
If tie: choose the first in lexical order.
Call this predicate D.

STEP 2 — MAKE D THE NEW PRIMITIVE:
New language starts with: L* = { D }

STEP 3 — REDEFINE ALL OTHER PRIMITIVES:
For each primitive or derived predicate P ≠ D:

Attempt to find a syntactic definition φ_P(D, …) such that: P(x̄) ↔ φ_P(x̄)

Procedure:
- Replace all other primitives with placeholders
- Try to unify P(x̄) with a formula constructed only from: D and variables and logical operators

If definability succeeds: Add P(x̄) ↔ φ_P(x̄) to the definition list
If definability fails: Mark P as **irreducible under inversion**

STEP 4 — BUILD THE INVERTED LANGUAGE:
The inverted language contains:
- The new primitive D
- Any irreducible primitives
- No other primitives

STEP 5 — REWRITE THE AXIOMS:
For each axiom in A:
- Replace every predicate P with its definitional surrogate φ_P
- Axioms that contain irreducible primitives remain intact
- Axioms relying on unmappable predicates are marked as **non-invertible**

STEP 6 — FORM THE INVERTED THEORY T*:
T* consists of:
- New language L*
- Redefined axioms A* (the rewritten axioms)
- Explicit definition list for all definable predicates

OUTPUT (EXPLAIN = OFF):

NEW PRIMITIVE:
D

DEFINITIONS (Old → New):
P₁(x̄) ↔ φ₁(x̄)
P₂(x̄) ↔ φ₂(x̄)
...

IRREDUCIBLE PREDICATES:
{ list }

INVERTED AXIOMS:
1. <rewritten axiom>
2. ...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- The most derived predicate becomes the new foundation
- All other predicates are defined relative to it
- The inverted ontology reverses the original conceptual direction, exposing hidden structural asymmetries`
  },
  {
    id: "f8-behavioral",
    name: "Behavioral Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `GENERATE ALTERNATIVE CONCEPTUALIZATIONS: BEHAVIORAL RECONSTRUCTION (1 ARG)

TASK:
Rewrite a theory T using **only observable / behavioral predicates**.

The goal:
1. Eliminate primitives referring to intrinsic, internal, or hidden properties
2. Replace them with predicates describing observable interactions, outputs, or measurable behavior
3. Rewrite all axioms using only behavioral primitives
4. Remove any axiom that cannot be expressed behaviorally

All transformations must be syntactic. No semantic or empirical interpretation is allowed.

INPUT:
A single theory T with:
- LANGUAGE: L = {P₁, …, P_k}
- AXIOMS: A
- Classification of predicates:
    • Behavioral: B₁, …  
    • Intrinsic / hidden: H₁, …
- EXPLAIN toggle ON/OFF

MECHANICAL RECONSTRUCTION PROCEDURE:

STEP 1 — IDENTIFY BEHAVIORAL CORE:
Behavioral primitives = all predicates explicitly classified as: observable, testable, interaction-based
Intrinsic primitives = all others
New language: L* = { all behavioral predicates B_i }

STEP 2 — ATTEMPT DEFINABILITY OF INTRINSIC PRIMITIVES:
For each intrinsic primitive H:

Try to syntactically define it using only behavioral primitives: H(x̄) ↔ φ_H(x̄)
where φ_H contains only predicates in L*

Use the standard definability test:
- Syntactic substitution and matching only
- No inference
- No semantic assumptions

If definable: Store definition H → φ_H
If not definable: Mark H as **eliminated**

STEP 3 — REWRITE AXIOMS:
For each axiom α in A:

1. Replace each intrinsic predicate H with φ_H if definable
2. If α contains any intrinsic predicate that is **not** definable, the entire axiom becomes **unstatable** and must be removed
3. Keep all remaining axioms intact

The resulting axiom set A* contains only behavioral vocabulary.

STEP 4 — CONSTRUCT THE BEHAVIORAL THEORY T*:
T* consists of:
- LANGUAGE: L*
- DEFINITIONS: all H(x̄) ↔ φ_H(x̄) found in Step 2
- AXIOMS: A*

SUCCESS CONDITION:

Behavioral reconstruction succeeds even if many axioms are removed.

The goal is NOT to preserve equivalence, but:
- To remove intrinsic predicates
- To express everything possible in behavioral terms
- To mark all else as eliminated

OUTPUT (EXPLAIN = OFF):

BEHAVIORAL LANGUAGE:
{ B₁, B₂, ... }

DEFINABLE INTRINSICS:
H₁(x̄) ↔ φ₁(x̄)
H₂(x̄) ↔ φ₂(x̄)
...

ELIMINATED INTRINSICS:
{ H_i not definable }

REWRITTEN AXIOMS:
1. <behavioral axiom>
2. ...

REMOVED AXIOMS:
1. <unstatable axiom>
2. ...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- Behavioral reconstruction removes all intrinsic predicates
- Only observable interaction-patterns remain
- Any intrinsic concept that cannot be behaviorally defined is eliminated
- Axioms depending on intrinsic notions are deleted`
  },
  {
    id: "f8-structural",
    name: "Structural Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `GENERATE ALTERNATIVE CONCEPTUALIZATIONS: STRUCTURAL RECONSTRUCTION (1 ARG)

TASK:
Rewrite theory T using ONLY **structural / relational predicates**.

This reconstruction eliminates all primitives referring to:
- intrinsic natures
- internal essences
- qualitative or non-relational attributes

The result is a theory grounded purely in **relations between objects**.

INPUT:
A single theory T with:
- LANGUAGE: L = {P₁, …, P_k}
- AXIOMS: A
- Classification of predicates:
    • Structural / relational: R₁, R₂, …
    • Intrinsic / qualitative: Q₁, Q₂, …
- EXPLAIN toggle ON/OFF

MECHANICAL RECONSTRUCTION PROCEDURE:

STEP 1 — ISOLATE STRUCTURAL VOCABULARY:
New language: L* = { all structural predicates R_i }
Intrinsic predicates Q_i are targeted for elimination

STEP 2 — ATTEMPT DEFINABILITY OF INTRINSIC PRIMITIVES:
For each intrinsic predicate Q:

Attempt to syntactically define Q(x̄) using only relational predicates: Q(x̄) ↔ φ_Q(x̄)
where φ_Q is constructed solely from R_i

Use the standard definability mechanism:
- pattern matching only
- no inference
- no semantic assumptions

If definable: Record definition Q → φ_Q
If not: Mark Q as **eliminated**

STEP 3 — REWRITE ALL AXIOMS:
For each original axiom α:

1. Replace Q(x̄) with φ_Q(x̄) for all definable Q
2. If α contains any Q not definable in L*, the axiom is removed
3. All remaining axioms must contain only relational vocabulary

Resulting axiom-set: A*

STEP 4 — FORM THE PURELY STRUCTURAL THEORY T*:
T* consists of:
- LANGUAGE: L*
- DEFINITIONS: Q_i(x̄) ↔ φ_Q_i(x̄)
- AXIOMS: A*

SUCCESS CONDITION:

Structural reconstruction will produce:
- A fully relational language
- A set of relational axioms
- Eliminations of any concept not expressible structurally

Equivalence with the original theory is *not* required.

OUTPUT (EXPLAIN = OFF):

STRUCTURAL LANGUAGE:
{ R₁, R₂, ... }

DEFINABLE INTRINSICS:
Q₁(x̄) ↔ φ₁(x̄)
Q₂(x̄) ↔ φ₂(x̄)
...

ELIMINATED INTRINSICS:
{ Q_i not definable }

REWRITTEN AXIOMS:
1. <structural axiom>
2. ...

REMOVED AXIOMS:
1. <unstatable axiom>
2. ...

OUTPUT (EXPLAIN = ON):

(same as above)

EXPLANATION:
- Only relational predicates survive
- Intrinsic attributes are removed unless relationally definable
- Axioms depending on intrinsic notions are eliminated
- The resulting theory emphasizes structural relations rather than internal natures`
  },
  {
    id: "f8-physicalization",
    name: "Physicalization",
    functionId: 8,
    input: ``,
    instructions: `GENERATE ALTERNATIVE CONCEPTUALIZATIONS: PHYSICALIZATION (1 ARG)

TASK:
Rewrite a theory T using ONLY **physical, spatial, or metric predicates**.

The goal is to:
1. Eliminate abstract primitives (psychological, normative, semantic, theoretical, etc.)
2. Replace them with primitives grounded in: geometry, topology, distance relations, spatial adjacency, physical interaction patterns
3. Rewrite all axioms accordingly
4. Remove any axiom that cannot be expressed in physicalized terms

This is a syntactic transformation only. No external physical interpretation is allowed.

INPUT:
A single theory T with:
- LANGUAGE: L = {P₁, …, P_k}
- AXIOMS: A
- Partition of predicates into:
      • Physicalizable: Φ₁, Φ₂, …
      • Abstract / non-physicalizable: A₁, A₂, …
- EXPLAIN toggle ON/OFF

MECHANICAL PHYSICALIZATION PROCEDURE:

STEP 1 — DEFINE THE PHYSICAL CORE LANGUAGE:
New language: L* = { all physicalizable predicates Φ_i }

These include spatial, geometric, metric, or physically-embeddable relations.

STEP 2 — ATTEMPT DEFINABILITY OF ABSTRACT PREDICATES:
For each abstract predicate A:

Attempt to find a syntactic definition in L*: A(x̄) ↔ φ_A(x̄)
with φ_A containing ONLY Φ_i

Use the standard definability procedure:
- Replace non-physical predicates by placeholders
- Attempt pattern unification
- No inference or semantic reasoning

If definable: Record definition: A → φ_A
If not definable: Mark A as **eliminated**

STEP 3 — REWRITE AXIOMS:
For each axiom α:

1. Replace each A(x̄) with φ_A(x̄) if definable
2. If α contains any abstract predicate A that is **not definable** in physical terms: α becomes **unstatable** and is removed
3. Remaining axioms must contain only Φ_i

The result is the physicalized axiom-set A*.

STEP 4 — FORM THE PHYSICALIZED THEORY T*:
T* consists of:
- LANGUAGE: L*
- DEFINITIONS: all A(x̄) ↔ φ_A(x̄) obtained in Step 2
- AXIOMS: A*

SUCCESS CONDITION:

Physicalization ALWAYS returns a well-defined theory, even if many axioms and primitives are removed.

The output theory is NOT required to be equivalent to the original—it is a physical re-expression of whatever can survive the mapping.

OUTPUT (EXPLAIN = OFF):

PHYSICALIZED LANGUAGE:
{ Φ₁, Φ₂, ... }

DEFINABLE ABSTRACT PREDICATES:
A₁(x̄) ↔ φ₁(x̄)
A₂(x̄) ↔ φ₂(x̄)
...

ELIMINATED ABSTRACT PREDICATES:
{ A_i not definable }

REWRITTEN AXIOMS:
1. <physicalized axiom>
2. ...

REMOVED AXIOMS:
1. <unstatable axiom>
2. ...

OUTPUT (EXPLAIN = ON):

(same as EXPLAIN = OFF)

EXPLANATION:
- Physicalization keeps only spatial, metric, geometric, and physically structured primitives
- Abstract predicates are replaced where possible or removed
- Axioms that depend on irreducible abstract notions are deleted
- The resulting theory expresses T's content in purely physical terms`
  },
  // FUNCTION 9: Interpret Canonical Meaning
  {
    id: "f9-primitive-meanings",
    name: "Identify Primitive Meanings",
    functionId: 9,
    input: ``,
    instructions: `For each primitive symbol in the theory, identify what it is most naturally intended to represent. Explain the canonical meaning of each predicate, function, and constant.`
  },
  {
    id: "f9-natural-language",
    name: "Natural Language Restatement",
    functionId: 9,
    input: ``,
    instructions: `Restate all axioms using explicit natural-language terms instead of abstract symbols. Replace each primitive with a phrase that captures its intended meaning.`
  },
  {
    id: "f9-reveal-content",
    name: "Reveal Theory Content",
    functionId: 9,
    input: ``,
    instructions: `Explain what this theory is really about. Strip away the formal notation and describe in plain English what claims the theory makes about reality.`
  },
  {
    id: "f9-intended-domain",
    name: "Identify Intended Domain",
    functionId: 9,
    input: ``,
    instructions: `Determine what domain of objects this theory is intended to describe. What are the primitives supposed to range over? What is the intended subject matter?`
  },
  // FUNCTION 10: Find an Interpretation
  // A. Abstract / Formal Domains
  {
    id: "f10-mathematical",
    name: "Mathematical",
    functionId: 10,
    input: ``,
    instructions: `Find a MATHEMATICAL interpretation. Use algebra, topology, geometry, calculus, or trigonometry. Resort to set theory only if all else fails.`
  },
  {
    id: "f10-computational",
    name: "Computational",
    functionId: 10,
    input: ``,
    instructions: `Find a COMPUTATIONAL interpretation. Use data structures, algorithms, types, programs, or processes.`
  },
  {
    id: "f10-philosophical",
    name: "Philosophical",
    functionId: 10,
    input: ``,
    instructions: `Find a PHILOSOPHICAL interpretation. Use concepts like substances, properties, events, minds, or abstract objects.`
  },
  // B. Natural Sciences
  {
    id: "f10-physical",
    name: "Physical (Everyday)",
    functionId: 10,
    input: ``,
    instructions: `Find a PHYSICAL interpretation from everyday life. Use tangible objects, containers, weight, heat, space, motion in the intuitive sense.`
  },
  {
    id: "f10-physics",
    name: "Physics (Science)",
    functionId: 10,
    input: ``,
    instructions: `Find a PHYSICS interpretation from the science. Use spacetime, fields, forces, thermodynamics, electromagnetism, or relativity.`
  },
  {
    id: "f10-chemical",
    name: "Chemical",
    functionId: 10,
    input: ``,
    instructions: `Find a CHEMICAL interpretation. Use chemical species, reactions, molecular structures, or reaction pathways.`
  },
  {
    id: "f10-biological",
    name: "Biological",
    functionId: 10,
    input: ``,
    instructions: `Find a BIOLOGICAL interpretation. Use organisms, food chains, ecosystems, cells, or evolutionary relationships.`
  },
  // C. Human, Social, Cultural Domains
  {
    id: "f10-economic",
    name: "Economic",
    functionId: 10,
    input: ``,
    instructions: `Find an ECONOMIC interpretation. Use goods, prices, markets, preferences, or trade relationships.`
  },
  {
    id: "f10-social",
    name: "Social / Sociological",
    functionId: 10,
    input: ``,
    instructions: `Find a SOCIAL interpretation. Use people, social hierarchies, relationships, or group dynamics.`
  },
  {
    id: "f10-psychological",
    name: "Psychological",
    functionId: 10,
    input: ``,
    instructions: `Find a PSYCHOLOGICAL interpretation. Use desires, motivations, mental states, or priority of needs.`
  },
  {
    id: "f10-linguistic",
    name: "Linguistic",
    functionId: 10,
    input: ``,
    instructions: `Find a LINGUISTIC interpretation. Use words, alphabetical order, grammar, or syntactic structures.`
  },
  {
    id: "f10-organizational",
    name: "Organizational",
    functionId: 10,
    input: ``,
    instructions: `Find an ORGANIZATIONAL interpretation. Use tasks, workflows, dependencies, or project structures.`
  },
  {
    id: "f10-geographical",
    name: "Geographical / Spatial",
    functionId: 10,
    input: ``,
    instructions: `Find a GEOGRAPHICAL interpretation. Use locations, elevations, distances, or spatial relationships.`
  },
  {
    id: "f10-home-economics",
    name: "Home Economics",
    functionId: 10,
    input: ``,
    instructions: `Find a HOME ECONOMICS interpretation. Use cooking, food prep, appliances, temperature, household tasks, or storage rules.`
  },
  // D. Engineering & Systems
  {
    id: "f10-engineering",
    name: "Engineering / Systems",
    functionId: 10,
    input: ``,
    instructions: `Find an ENGINEERING interpretation. Use machine components, system dependencies, or functional relationships.`
  },
  {
    id: "f10-network",
    name: "Network",
    functionId: 10,
    input: ``,
    instructions: `Find a NETWORK interpretation. Use servers, routing, data flow, graphs, or connectivity.`
  },
  // E. Finance, Markets, Investment
  {
    id: "f10-market-microstructure",
    name: "Market Microstructure",
    functionId: 10,
    input: ``,
    instructions: `Find a MARKET MICROSTRUCTURE interpretation. Use limit orders, price priority, execution rules, or order books.`
  },
  {
    id: "f10-portfolio-risk",
    name: "Portfolio & Risk",
    functionId: 10,
    input: ``,
    instructions: `Find a PORTFOLIO & RISK interpretation. Use asset classes, risk levels, allocations, or return profiles.`
  },
  {
    id: "f10-credit-fixed-income",
    name: "Credit & Fixed-Income",
    functionId: 10,
    input: ``,
    instructions: `Find a CREDIT & FIXED-INCOME interpretation. Use tranches, seniority, bonds, or CDO structures.`
  },
  {
    id: "f10-ma-corporate",
    name: "M&A / Corporate Structure",
    functionId: 10,
    input: ``,
    instructions: `Find an M&A / CORPORATE STRUCTURE interpretation. Use corporate entities, ownership, voting control, or subsidiaries.`
  },
  {
    id: "f10-derivatives",
    name: "Derivatives",
    functionId: 10,
    input: ``,
    instructions: `Find a DERIVATIVES interpretation. Use options, strike prices, payoffs, or contract structures.`
  },
  {
    id: "f10-private-equity",
    name: "Private Equity / LBO",
    functionId: 10,
    input: ``,
    instructions: `Find a PRIVATE EQUITY / LBO interpretation. Use capital structure layers, exit waterfalls, or payout priorities.`
  },
  {
    id: "f10-macro-intermarket",
    name: "Macro / Intermarket",
    functionId: 10,
    input: ``,
    instructions: `Find a MACRO / INTERMARKET interpretation. Use global macro indicators, leads/lags, or economic sequences.`
  }
];

interface PresetsSidebarProps {
  onSelectPreset: (preset: Preset) => void;
  onScrollToFunction?: (functionId: number) => void;
}

export function PresetsSidebar({ onSelectPreset, onScrollToFunction }: PresetsSidebarProps) {
  const functionNames = [
    "Axiom-Set / Theory Transformation (1 Arg)",
    "Schema Equivalence (2 Args)",
    "Definitional Equivalence (2 Args)",
    "Model-Preserving Rewrite (1 Arg)",
    "Conservative Extension Analysis (2 Args)",
    "Compare Conceptual Schemes (2 Args)",
    "Ontological Dependence (1 Arg)",
    "Generate Alt. Conceptualizations (1 Arg)",
    "Interpret Canonical Meaning (1 Arg)",
    "Find an Interpretation (1 Arg)"
  ];

  const groupedPresets = functionNames.map((name, idx) => ({
    id: idx + 1,
    name,
    presets: PRESETS.filter(p => p.functionId === idx + 1)
  }));

  return (
    <div className="h-full border-r border-border bg-muted/20 flex flex-col">
      <div className="p-4 border-b border-border bg-background/50">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Presets
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click to run transformation instantly
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {groupedPresets.map((group) => (
            <div key={group.id}>
              <button
                className="flex items-center gap-2 min-w-0 w-full p-2 rounded-sm hover:bg-muted/50 transition-colors text-left"
                onClick={() => onScrollToFunction?.(group.id)}
              >
                <Badge variant="outline" className="font-mono text-[10px] shrink-0 rounded-sm">
                  {group.id}
                </Badge>
                <span className="text-xs font-medium truncate">{group.name}</span>
              </button>
              <div className="pl-4 pr-2 pb-2 space-y-1">
                {group.presets.length > 0 ? (
                  group.presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-8 font-normal text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        onSelectPreset(preset);
                        onScrollToFunction?.(group.id);
                      }}
                      data-testid={`preset-${preset.id}`}
                    >
                      {preset.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-[10px] text-muted-foreground/50 py-1 pl-2">No presets</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
