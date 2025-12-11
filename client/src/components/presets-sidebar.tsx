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
    instructions: `For each primitive in Theory A, write an explicit definition using Theory B's vocabulary. Then do the reverse. Show the complete bi-directional translation.`
  },
  {
    id: "f3-one-direction",
    name: "One-Direction Definability",
    functionId: 3,
    input: `<<<SEPARATOR>>>`,
    instructions: `Define all primitives of Theory A using only Theory B's vocabulary. Show each definition and verify it preserves the intended meaning.`
  },
  {
    id: "f3-minimization",
    name: "Definition Minimization",
    functionId: 3,
    input: `<<<SEPARATOR>>>`,
    instructions: `Find the shortest possible explicit definitions. Minimize the total number of quantifiers and logical connectives in the definitions.`
  },
  {
    id: "f3-conservative",
    name: "Conservative Definability",
    functionId: 3,
    input: `<<<SEPARATOR>>>`,
    instructions: `Provide only conservative definitions that do not introduce any new theorems. Verify that each definition is eliminable without changing provability.`
  },
  // FUNCTION 4: Model-Preserving Rewrite
  {
    id: "f4-reduced-primitive",
    name: "Reduced Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `Eliminate as many primitives as possible while keeping exactly the same models. Report the minimal primitive set and how eliminated primitives are defined.`
  },
  {
    id: "f4-expanded-primitive",
    name: "Expanded Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `Add new convenient primitives that make the axioms simpler. Each new primitive should abbreviate a common pattern. Verify model-equivalence.`
  },
  {
    id: "f4-algebraic",
    name: "Algebraic Reconstruction",
    functionId: 4,
    input: ``,
    instructions: `Rewrite the theory using only function symbols and equations. Convert all relations to functions. Produce an equational/algebraic formulation.`
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
    instructions: `Analyze whether adding the specified new primitives changes any theorems in the original vocabulary. Report conservative or non-conservative with justification.`
  },
  {
    id: "f5-new-axioms",
    name: "New Axioms Test",
    functionId: 5,
    input: `<<<SEPARATOR>>>`,
    instructions: `Determine whether adding the new axioms proves any new facts expressible in the original vocabulary. Provide proof or countermodel.`
  },
  {
    id: "f5-weak-extension",
    name: "Weak Extension Test",
    functionId: 5,
    input: `<<<SEPARATOR>>>`,
    instructions: `Check if the extension is conservative when allowing only definitional abbreviations. Stricter than full conservativity.`
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
    instructions: `List all concepts. Classify each as primitive or derived. Draw the dependency graph showing which concepts depend on which.`
  },
  {
    id: "f6-depth-map",
    name: "Conceptual Depth Map",
    functionId: 6,
    input: `<<<SEPARATOR>>>`,
    instructions: `For each concept, compute its definitional depth (how many layers of definitions separate it from primitives). Rank concepts by depth.`
  },
  {
    id: "f6-bottleneck",
    name: "Bottleneck Detection",
    functionId: 6,
    input: `<<<SEPARATOR>>>`,
    instructions: `Identify which primitives all other concepts ultimately depend on. Find conceptual bottlenecks that everything flows through.`
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
    instructions: `Remove the first/main primitive and analyze what collapses. Report which axioms become unstatable and which theorems are lost.`
  },
  {
    id: "f7-minimal-set",
    name: "Minimal Primitive Set",
    functionId: 7,
    input: ``,
    instructions: `Find the smallest subset of primitives that keeps the theory functional. All other primitives must be definable from this set.`
  },
  {
    id: "f7-replacement",
    name: "Replacement Test",
    functionId: 7,
    input: ``,
    instructions: `For the main/first primitive, attempt to replace it with a definable surrogate constructed from other primitives. Show the replacement or prove it impossible.`
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
    instructions: `Make the most commonly derived concept into a primitive. Redefine the original primitives using this new base. Produce the inverted theory.`
  },
  {
    id: "f8-behavioral",
    name: "Behavioral Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using only observable/behavioral predicates. Eliminate any primitives that refer to intrinsic properties. Keep only what can be tested.`
  },
  {
    id: "f8-structural",
    name: "Structural Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using only structural/relational primitives. Eliminate any primitives about intrinsic properties. Focus on relations between things.`
  },
  {
    id: "f8-physicalization",
    name: "Physicalization",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using physical, spatial, or metric primitives. Ground abstract concepts in physical terms where possible.`
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
