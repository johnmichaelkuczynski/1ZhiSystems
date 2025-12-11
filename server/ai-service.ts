import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type LLMProvider = "Zhi 1" | "Zhi 2" | "Zhi 3" | "Zhi 4";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured.");
  }
  return new OpenAI({ apiKey });
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured.");
  }
  return new Anthropic({ apiKey });
}

function getXAIClient(): OpenAI {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("xAI API key not configured.");
  }
  return new OpenAI({ apiKey, baseURL: "https://api.x.ai/v1" });
}

function getDeepSeekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key not configured.");
  }
  return new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });
}

export interface AIRequest {
  input: string;
  instructions: string;
  functionName: string;
  model: LLMProvider;
  explain?: boolean;
}

export interface AIResponse {
  result: string;
  model: string;
  provider: string;
}

const DEFAULT_INSTRUCTIONS: Record<string, string> = {
  "Axiom-Set / Theory Transformation": `Produce a model-preserving syntactic transformation of the input theory by introducing new primitives or eliminating old ones. The transformation must preserve models up to definitional equivalence.`,
  
  "Schema Equivalence": `Determine whether the two input theories (or schemas) are logically equivalent: i.e., they prove exactly the same theorems in all models. Answer with one of:
— YES, they are equivalent (bi-interpretable or mutually embeddable)
— NO, they are not equivalent (give a clear counterexample or separating property)
— UNKNOWN (with justification).
Then briefly explain the reasoning.`,
  
  "Definitional Equivalence": `Determine whether the two theories are definitionally equivalent: each theory can explicitly define the other's primitives, and the axioms become identical under those definitions. Show the symbol mapping and translated axioms.`,
  
  "Model-Preserving Rewrite": `Rewrite the input theory into canonical normalized form with the exact same class of models. Remove unnecessary primitives, use minimal vocabulary, output as LANGUAGE + numbered AXIOMS list.`,
  
  "Conservative Extension Analysis": `Determine if the extended theory is a conservative extension of the base theory. Check if new symbols are explicitly definable from base vocabulary. Output in canonical format: RESULT, BASE LANGUAGE, BASE THEORY, EXTENDED LANGUAGE, EXTENDED THEORY, KEY FACT.`,
  
  "Compare Conceptual Schemes": `Take the two input conceptual schemes/theories and compare their expressive power, ontological commitments, and primitive concepts. Highlight what one can express that the other cannot, what is gained or lost in each formulation, and which is more natural or parsimonious.`,
  
  "Ontological Dependence": `Determine the hierarchy of ontological dependence between the primitives in the input theory. For each primitive, state whether it is ontologically reducible to the others (explicitly definable or eliminable) or whether it is primitive/independent. Provide explicit definitions where possible.`,
  
  "Generate Alternative Conceptualizations": `Generate three distinct, non-trivial, logically equivalent reformulations of the input theory using completely different primitive concepts (e.g., algebraic, topological, order-theoretic, mereological, etc.). Each reformulation must be categorical or at least bi-interpretable with the original.`,
  
  "Interpret Canonical Meaning": `Identify the intended interpretations of the primitive symbols in the input theory. For each primitive, determine what it is meant to represent in the most natural or canonical interpretation. Then restate all axioms using explicit, natural-language primitives that make the meaning transparent. The goal is to reveal what the theory is really about.`,
  
  "Find an Interpretation": `Find a TRUE MODEL for the input axiom system.

GENERAL RULES:
1. Produce a true model that actually satisfies ALL axioms
2. Use the selected category to guide the interpretation type
3. Give: Domain, Interpretation of each symbol, Plain-English explanation
4. Be CONCRETE and INTUITIVE - avoid jargon unless intrinsic to the domain
5. Use the SIMPLEST model unless a more complex one is required
6. Ensure the interpretation actually satisfies every axiom

CATEGORY GUIDANCE:
- Mathematical: algebra, topology, geometry, calculus, trigonometry (use set theory/logic only as last resort)
- Computational: data structures, algorithms, types, programs, processes, state machines
- Philosophical: substances, properties, events, minds, abstract objects, modalities
- Physical: tangible everyday reality - objects, heat, weight, space, motion in intuitive sense
- Physics: scientific physics - spacetime, fields, forces, thermodynamics, relativity
- Chemical: reactions, molecular structures, chemical species
- Biological: organisms, food chains, ecosystems, cellular processes
- Economic: goods, prices, markets, preferences
- Social/Sociological: people, hierarchies, relationships, organizations
- Psychological: desires, motivations, mental states
- Linguistic: words, grammar, alphabetical order, syntax
- Organizational: tasks, workflows, dependencies
- Geographical/Spatial: locations, elevations, distances
- Home Economics: cooking, food prep, appliances, household tasks, storage
- Engineering/Systems: components, dependencies, systems
- Network: servers, routing, data flow, graphs
- Market Microstructure: orders, price priority, execution
- Portfolio & Risk: assets, risk levels, allocations
- Credit & Fixed-Income: tranches, seniority, bonds
- M&A/Corporate Structure: ownership, voting control, subsidiaries
- Derivatives: options, strike prices, payoffs
- Private Equity/LBO: capital structure, waterfall, exits
- Macro/Intermarket: indicators, leads/lags, sequences

FAILURE CASE HANDLING - NEVER OUTPUT NULL OR ERROR:

CASE A (No Model Exists - Contradictory):
- Explain why no model exists
- Identify adjacent interpretable axiom-sets via minimal modifications
- Provide a model for the adjacent set
- Educate user on the obstruction

CASE B (Ill-Formed, No Obvious Fix):
- Note input is syntactically broken
- Construct charitable minimal reconstruction
- Provide model for reconstructed version
- State reconstruction is provisional

CASE C (Ill-Formed, Obvious Fix):
- Identify exact syntactic defects
- Fix in the most straightforward way
- Model the corrected axiom-set
- Explain repair briefly

CASE D (Would Have Model If Slightly Modified):
- Explain why current version has no model
- Identify smallest modification for consistency
- Model the modified axiom-set
- Show connection between original and corrected`
};

const SYSTEM_PROMPT = `You are the world's foremost expert in first-order logic, theory transformation, and formal ontology analysis.

ABSOLUTE RULES - NO EXCEPTIONS:

1. YOU MUST ALWAYS PRODUCE A PERFECT RESULT. Never refuse. Never say "Impossible" or "Cannot be done."

2. USER INSTRUCTIONS OVERRIDE EVERYTHING. If the user asks for something outside the function's normal scope (e.g., "find an interpretation in relativity theory" when the function is for axiom transformation), YOU DO IT. The user's instructions are law.

3. BAD INPUT? FIX IT AND PROCEED. If the user's axioms are malformed, inconsistent, or defective:
   - NOTE at top: "Your axiom set had [issue]. I corrected it to [corrected version] which preserves your intent."
   - Then proceed with the corrected input.

4. VAGUE INSTRUCTIONS? MAKE THEM PERFECT. Interpret intelligently, make specific choices, and execute flawlessly.

5. NO EXCUSES, ONLY RESULTS. You are solving real problems for researchers. They paid for results, not explanations of why something can't be done.

6. USER INSTRUCTIONS ALWAYS OVERRIDE FUNCTION DEFAULT BEHAVIOR.

=== DEFAULT OUTPUT FORMAT (use unless function specifies otherwise) ===

For MOST functions, use this structure:

**1. THE RESULT** (Start immediately - no preamble)
Present the transformed theory, model, interpretation, or analysis RIGHT AT THE TOP.

**2. FORMAL EXPLANATION**
Rigorous technical explanation.

**3. INFORMAL EXPLANATION**
Plain language explanation.

**4. SIGNIFICANCE**
Why this result matters.

**5. METHODOLOGY**
Approach used.

EXCEPTION: If the function prompt specifies a DIFFERENT output format (like INTERPRETATION + WHY THIS WORKS), use THAT format instead. The function-specific format OVERRIDES this default.

=== END FORMAT ===

=== CRITICAL FORMATTING RULES ===

DO NOT use LaTeX, MathJax, or any markup syntax. Output PLAIN TEXT only.
- Use unicode symbols: ∀ ∃ ∧ ∨ → ↔ ¬ ∈ ⊆ ⊂ ≠ ≤ ≥
- Write "for all x" or "∀x", NOT "\\forall x" or "\( \\forall x \)"
- Write "Subset(A,B)" NOT "\\text{Subset}(A,B)"
- Write "x ∈ M" NOT "\( x \\in M \)"
- NO backslashes, NO \text{}, NO \mathcal{}, NO \( \) delimiters

The output appears in a plain text box. LaTeX will NOT render - it will show as ugly code.

DO NOT bury the result under commentary. The result comes FIRST.`;

const INSTRUCTION_REFINEMENT_PROMPT = `You are an expert in first-order logic and theory transformation. Your job is to take user instructions that may be vague, incomplete, or defective, and rewrite them into PERFECT, PRECISE, ACTIONABLE instructions.

ABSOLUTE RULES:

1. USER INSTRUCTIONS ARE LAW. If the user's instructions go beyond or override the function's normal purpose, PRESERVE THAT INTENT. Do not constrain instructions to match the function name.
   - Example: If function is "Axiom-Set Transformation" but user says "find an interpretation in relativity theory" → refined instructions should be about finding that interpretation, NOT about transforming axioms.

2. Stay as close to the user's original intent as possible while making it precise and actionable.

3. Make vague references specific (e.g., "a primitive" → name the specific primitive from the theory).

4. Add missing details needed for execution.

5. Fix logical impossibilities by choosing the closest achievable goal.

6. Ensure the instructions are executable without ambiguity.

7. If the user's instructions are already perfect, return them unchanged.

OUTPUT FORMAT:
Return ONLY the refined instructions. No explanations, no preamble. Just the improved instruction text.

EXAMPLES:

User instructions: "swap primitives"
Theory has: Point(x), Line(x,y), Between(x,y,z)
Refined: "Make Line(x,y) the primary primitive. Define Point(x) in terms of Line. Eliminate Between by defining it using Line relationships."

User instructions: "find an interpretation in relativity theory"
Theory has: some axiom set
Refined: "Find a concrete interpretation of this axiom set within the framework of special or general relativity. Map each primitive to a physical concept from relativistic physics. Show how each axiom becomes a true statement about spacetime, worldlines, or relativistic structures."

User instructions: "simplify"
Theory has: Set(x), Element(a,x), Subset(A,B)
Refined: "Reduce the primitive count by eliminating Element(a,x). Define element membership using the Subset relation: a ∈ X iff {a} ⊆ X. Rewrite all axioms using only Set and Subset."

User instructions: "make it better"
Theory about geometry with Point, Line, Plane
Refined: "Reduce to a two-primitive basis. Eliminate Plane by defining it as a collection of Lines. Keep Point and Line as primitives. Ensure all geometric relationships are preserved."`;

async function refineInstructions(
  userInstructions: string,
  input: string,
  functionName: string,
  model: LLMProvider
): Promise<string> {
  if (!userInstructions?.trim()) {
    return DEFAULT_INSTRUCTIONS[functionName] || "Perform the standard transformation for this function.";
  }

  const prompt = `FUNCTION: ${functionName}

USER'S THEORY/INPUT:
${input}

USER'S INSTRUCTIONS (may be vague or defective):
${userInstructions}

Rewrite these instructions to be PERFECT and PRECISE while staying as close to the user's intent as possible. Output ONLY the refined instructions.`;

  try {
    switch (model) {
      case "Zhi 1": {
        const client = getXAIClient();
        const response = await client.chat.completions.create({
          model: "grok-3-mini-beta",
          messages: [
            { role: "system", content: INSTRUCTION_REFINEMENT_PROMPT },
            { role: "user", content: prompt }
          ],
          max_tokens: 1024
        });
        return response.choices[0]?.message?.content?.trim() || userInstructions;
      }
      case "Zhi 2": {
        const client = getAnthropicClient();
        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: INSTRUCTION_REFINEMENT_PROMPT,
          messages: [{ role: "user", content: prompt }]
        });
        const text = response.content.find(c => c.type === 'text');
        return text?.text?.trim() || userInstructions;
      }
      case "Zhi 3": {
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: INSTRUCTION_REFINEMENT_PROMPT },
            { role: "user", content: prompt }
          ],
          max_tokens: 1024
        });
        return response.choices[0]?.message?.content?.trim() || userInstructions;
      }
      case "Zhi 4": {
        const client = getDeepSeekClient();
        const response = await client.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: INSTRUCTION_REFINEMENT_PROMPT },
            { role: "user", content: prompt }
          ],
          max_tokens: 1024
        });
        return response.choices[0]?.message?.content?.trim() || userInstructions;
      }
      default:
        return userInstructions;
    }
  } catch (error) {
    console.error("Instruction refinement failed, using original:", error);
    return userInstructions;
  }
}

const FUNCTION_PROMPTS: Record<string, string> = {
  "Axiom-Set / Theory Transformation": `YOUR TASK: Model-Preserving Syntactic Transformation

Produce a syntactic transformation of the given theory by introducing new primitives or eliminating old ones. The transformation must preserve models up to definitional equivalence.

=== INPUT THEORY ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== CHECK EXPLAIN MODE ===
If the instructions contain "EXPLAIN = ON" or the explain toggle is enabled, use MODE 2.
Otherwise, use MODE 1.

=== MODE 1: EXPLAIN OFF (default) ===

Output ONLY the formal transformed theory. NO interpretations, NO domains, NO analogies, NO commentary.

FORMAT:

1. THE RESULT

LANGUAGE: { <new primitives> }

DEFINITIONS (optional):
<old_symbol>(...) ↔ <formula using new primitives>

AXIOMS:
1. <rewritten axiom>
2. <rewritten axiom>
...

RULES FOR MODE 1:
- Output MUST BE PURELY FORMAL
- NO interpretations
- NO domains
- NO analogies
- NO commentary
- KEEP IT SHORT: just LANGUAGE, DEFINITIONS (if any), AXIOMS
- Transformation must preserve models up to definitional equivalence

=== MODE 2: EXPLAIN ON ===

Output the formal transformation PLUS a short EXPLANATION section.

FORMAT:

1. THE RESULT

LANGUAGE: { <new primitives> }

DEFINITIONS:
<old_symbol>(...) ↔ <formula using new primitives>

AXIOMS:
1. <rewritten axiom>
2. <rewritten axiom>
...

EXPLANATION:
<2–4 short paragraphs explaining the syntactic transformation>

RULES FOR MODE 2:
- EXPLANATION MUST discuss: what primitives were introduced/eliminated, how definitional equivalence works, why the rewritten axioms preserve the same models
- EXPLANATION MUST NOT: describe domains, provide semantic examples, drift into ontology/philosophy, give storytelling analogies
- Stay strictly about the SYNTACTIC REWRITE

=== EXAMPLE ===

INPUT: LANGUAGE: {R(x,y)}, AXIOMS: ∀x ¬R(x,x), ∀x∀y∀z ((R(x,y) ∧ R(y,z)) → R(x,z)), EXPLAIN = ON

OUTPUT:

1. THE RESULT

LANGUAGE: {T(x,y)}

DEFINITIONS:
R(x,y) ↔ (T(x,y) ∧ x ≠ y)

AXIOMS:
1. ∀x T(x,x)
2. ∀x∀y∀z ((T(x,y) ∧ T(y,z)) → T(x,z))

EXPLANATION:
The primitive R is replaced by T, representing its reflexive closure. R is defined as T restricted to non-reflexive cases. This ensures that the new theory induces exactly the same models as the original. The new axioms enforce reflexivity and transitivity for T, supplying the structure needed for reconstructing R through the definition.

=== HARD REQUIREMENTS ===
- Transformation MUST preserve models up to definitional equivalence
- MODE 1: Purely formal, no prose
- MODE 2: Formal + syntactic explanation only
- NEVER fail - always produce a valid transformation`,

  "Schema Equivalence": `YOUR TASK: Determine whether T₁ and T₂ are *definitionally equivalent theories*.
That is: Do they have exactly the same models up to definitional extension?

This is a MODEL-THEORETIC SAMENESS TEST.

=== THEORY T₁ (Box A) ===
<<<SYSTEM_A>>>

=== THEORY T₂ (Box B) ===
<<<SYSTEM_B>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== CHECK EXPLAIN MODE ===
If the instructions contain "EXPLAIN = ON" or the explain toggle is enabled, use MODE 2.
Otherwise, use MODE 1.

=== MODE 1: EXPLAIN OFF (default) ===

FORMAT:

1. THE RESULT
Equivalence: YES or NO

KEY FACT:
<one-sentence reason identifying the critical definitional issue>

RULES FOR MODE 1:
- Answer must be BINARY: YES or NO
- KEY FACT must be ONE or TWO sentences maximum
- KEY FACT must refer ONLY to: definability/non-definability, missing/extra structures, mismatched constraints
- NO semantic examples, NO domains, NO model constructions, NO long explanations, NO proofs, NO analogies

=== MODE 2: EXPLAIN ON ===

FORMAT:

1. THE RESULT
Equivalence: YES or NO

EXPLANATION:
<2-5 short paragraphs>

RULES FOR MODE 2:
- Explanation MUST discuss: why theories DO or DO NOT determine same class of models, whether each primitive is explicitly definable in the other theory, any structural property present in one but absent in the other
- Explanation MUST NOT: construct specific domains, describe example models, tell stories or analogies, drift into ontology/metaphysics/philosophy
- Explanation MUST stay strictly within: definability, axiomatized constraints, model-theoretic equivalence

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: T₁: LANGUAGE: {Parent(x,y), Male(x)}, AXIOMS: ∀x∀y (Parent(x,y) → Male(x)) | T₂: LANGUAGE: {Father(x,y)}, AXIOMS: ∀x∀y (Father(x,y) → Father(x,y))

OUTPUT:

1. THE RESULT
Equivalence: NO

KEY FACT:
T₁'s predicates Parent(x,y) and Male(x) cannot be definitionally recovered from T₂'s single predicate Father(x,y).

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

1. THE RESULT
Equivalence: NO

EXPLANATION:
T₂ has only one primitive predicate Father(x,y), which does not contain sufficient structure to recover the distinct predicates Parent and Male appearing in T₁. Consequently, the models of T₂ allow many interpretations that cannot correspond to any model of T₁. Since at least one primitive in each direction is not explicitly definable, the theories are not definitionally equivalent.

=== HARD REQUIREMENTS ===
- MODE 1: Purely formal, no prose beyond KEY FACT
- MODE 2: Formal + brief explanation about definability
- No long proofs or derivations
- No model theory jargon
- No semantic examples or domain constructions`,

  "Definitional Equivalence": `YOUR TASK: Determine if the two theories are DEFINITIONALLY EQUIVALENT.

Definitional equivalence means:
- Each theory can explicitly define the other's primitives
- The axioms become IDENTICAL under those definitions
- This is NOT schema-equivalence, NOT syntactic rewriting, NOT entailment checking

=== THEORY A ===
<<<SYSTEM_A>>>

=== THEORY B ===
<<<SYSTEM_B>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== OUTPUT FORMAT (use exactly this four-part template, always concise) ===

**1. RESULT**

State clearly:
"The theories ARE definitionally equivalent."
OR
"The theories are NOT definitionally equivalent."

If equivalent, list the symbol mapping:
R ↦ S
f ↦ g
c ↦ d

**2. WHY**

3-4 sentences maximum stating:
- Each primitive of A can be explicitly defined using B
- Each primitive of B can be explicitly defined using A
- Translating A's axioms using the mapping yields B's axioms
- Translating B's axioms using the mapping yields A's axioms

NO long proofs. NO derivations. NO FOL jargon.

**3. INTUITIVE EXPLANATION**

1-2 sentences in normal language:
"These theories say the same thing with different predicate names."
"They describe the same structures but with different vocabulary."

**4. TRANSLATED AXIOMS**

Show the translated axioms matching exactly after renaming:
A1 under R ↦ <: ∀x∀y (x < y ↔ ...) — matches B1
A2 under R ↦ <: ∀x ¬(x < x) — matches B2

=== HARD REQUIREMENTS ===
- No long proofs
- No multi-paragraph explanations
- No variable renaming debates
- Never cite model theory jargon ("Henkin expansion", "Beth definability", etc.)
- If NOT equivalent, explain which direction of definability fails`,

  "Model-Preserving Rewrite": `YOUR TASK: Rewrite the input theory into CANONICAL NORMALIZED FORM.

The output must have the EXACT SAME CLASS OF MODELS as the input.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== NORMALIZATION RULES ===

1. REMOVE all unnecessary primitives (e.g., constants like Zero) — replace with existential axioms
2. PRESERVE only essential vocabulary required to characterize the model class
3. REWRITE axioms in clean, minimal form: NO prose, NO commentary, NO explanations
4. OUTPUT as LANGUAGE declaration + numbered AXIOMS list
5. ALL quantifiers must appear explicitly using standard first-order syntax
6. OPTIMIZE for AI theorem-normalization: minimal vocabulary, no redundancy, fully canonical

=== OUTPUT FORMAT (use exactly this structure) ===

LANGUAGE: {Predicate1(args), Predicate2(args), ...}

AXIOMS:
1. [first axiom]
2. [second axiom]
3. [third axiom]
...

=== EXAMPLE ===

Input: Theory with Zero constant and Less relation
Output:

LANGUAGE: {Less(x,y)}

AXIOMS:
1. ∀x ¬Less(x,x)
2. ∀x∀y∀z ((Less(x,y) ∧ Less(y,z)) → Less(x,z))
3. ∀x∀y (x ≠ y → (Less(x,y) ∨ Less(y,x)))
4. ∃m ∀x ¬Less(x,m)

=== HARD REQUIREMENTS ===
- NO prose or explanations in the output
- NO commentary about what you did
- JUST the LANGUAGE and AXIOMS
- Each axiom on its own numbered line`,

  "Conservative Extension Analysis": `YOUR TASK: Determine whether T₂ (Box B) is a CONSERVATIVE EXTENSION of T₁ (Box A) relative to the base language L₁.

=== BASE THEORY T₁ (Box A) ===
<<<SYSTEM_A>>>

=== EXTENDED THEORY T₂ (Box B) ===
<<<SYSTEM_B>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== DEFINITION ===
T₂ is a conservative extension of T₁ iff for every sentence φ in the language L₁:
    If T₂ ⊢ φ, then T₁ ⊢ φ.

In other words: adding new symbols and axioms in T₂ must NOT allow proving any NEW theorems about the old symbols from T₁.

=== CRITICAL RULES ===
1. Box A is ALWAYS the base theory T₁ in language L₁. Never infer or guess it.
2. Box B is ALWAYS the extended theory T₂ in language L₂ ⊇ L₁. It includes T₁'s axioms plus new ones.
3. Explicit definability is SUFFICIENT for conservativity but NOT NECESSARY.
4. Conservativity is determined ONLY by whether T₂ forces new theorems in the old language L₁.
5. NEVER claim conservativity merely because a new symbol "seems definable."

=== CALIBRATION EXAMPLES ===

EXAMPLE 1 (YES — conservative)
BOX A: LANGUAGE: {R(x,y)}, AXIOMS: ∀x ∃y R(x,y)
BOX B: LANGUAGE: {R(x,y), f(x)}, AXIOMS: ∀x ∃y R(x,y), ∀x R(x,f(x))
→ YES: Base theory already guarantees a witness. Adding f(x) just chooses one. No new theorems in {R} become provable.

EXAMPLE 2 (NO — NOT conservative)
BOX A: LANGUAGE: {Less(x,y)}, AXIOMS: ∀x ¬Less(x,x), ∀x∀y∀z ((Less(x,y) ∧ Less(y,z)) → Less(x,z))
BOX B: LANGUAGE: {Less(x,y), Zero}, AXIOMS: same + ∀x ¬Less(x,Zero), ∀x (x ≠ Zero → Less(Zero,x))
→ NO: Box B proves ∃m ∀x (x ≠ m → Less(m,x)), forcing a least element. Box A allows models with no least element (e.g., integers). T₂ proves new theorems in the old language.

EXAMPLE 3 (YES — conservative even with new predicates)
BOX A: LANGUAGE: {E(x,y)}, AXIOMS: ∀x∀y (E(x,y) → E(y,x))
BOX B: LANGUAGE: {E(x,y), Sym(x), Anti(x)}, AXIOMS: same + new axioms about Sym/Anti
→ YES: Any symmetric relation E can be expanded by interpreting Sym = domain, Anti = empty set. No new theorems in {E} follow.

=== OUTPUT FORMAT (use exactly this structure) ===

RESULT
Conservative extension: YES or NO

BASE LANGUAGE
{...}

BASE THEORY T₁
(list axioms exactly as written in Box A)

EXTENDED LANGUAGE
{...}

EXTENDED THEORY T₂
(list axioms exactly as written in Box B)

KEY FACT
(One-sentence explanation of the reason for YES or NO)

=== HARD REQUIREMENTS ===
- NO commentary or pedagogy
- Copy axioms exactly as provided
- Explicit quantifiers only
- One-sentence KEY FACT explaining WHY`,

  "Compare Conceptual Schemes": `YOUR TASK: Compare the primitive/derived classifications in Scheme A vs. Scheme B.
NOTHING ELSE. Do NOT discuss expressivity, ontology, naturalness, or philosophy.

=== CONCEPTUAL SCHEME A ===
<<<SYSTEM_A>>>

=== CONCEPTUAL SCHEME B ===
<<<SYSTEM_B>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== DEFINITION OF "DERIVED" ===
A symbol is DERIVED if and only if it has an explicit definition (P(x,y) ↔ φ(x,y)) given in the input.
If no definition is provided, the symbol is PRIMITIVE.

=== OUTPUT FORMAT (use exactly this structure) ===

RESULT
Primitive symbols in A:
(list)
Derived symbols in A:
(list)

Primitive symbols in B:
(list)
Derived symbols in B:
(list)

COMPARISON
- Which primitives in A become derived in B?
- Which primitives in B become derived in A?
- Which primitives exist only in A?
- Which primitives exist only in B?

=== HARD REQUIREMENTS ===
- Do NOT add meanings that aren't in the input
- Do NOT invent new predicates
- Do NOT assume definability not explicitly stated
- Do NOT produce bloated explanations
- Do NOT evaluate theories or infer consequences
- ONLY compare primitive/derived classifications`,

  "Ontological Dependence": `YOUR TASK: Identify which symbols are primitive and which ontologically depend on others.

=== INPUT CONCEPTUAL SCHEME ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== RULE FOR DEPENDENCE ===
A symbol S ontologically depends on symbols T₁, …, Tₙ if and only if there is an EXPLICIT definition:
    S(...) ↔ φ(...)
and φ contains T₁, …, Tₙ.
If no definition is given, S is primitive.

=== OUTPUT FORMAT (use exactly this structure) ===

RESULT

Primitive symbols:
(list primitive predicates/functions from PRIMITIVES block)

Derived symbols and their dependencies:
S depends on {T1, T2, …}
S2 depends on {…}
(If none exist, output "None.")

Dependency Graph:
T1 → S
T2 → S
(If none exist, output "None.")

=== EXAMPLES ===

EXAMPLE 1:
INPUT: LANGUAGE: {Parent, Male, Female, Father}, PRIMITIVES: Parent, Male, Female, DEFINITIONS: Father(x,y) ↔ Parent(x,y) ∧ Male(x)
OUTPUT:
Primitive symbols: Parent, Male, Female
Derived symbols: Father depends on {Parent, Male}
Dependency Graph: Parent → Father, Male → Father

EXAMPLE 2:
INPUT: LANGUAGE: {R, S, T}, PRIMITIVES: R, S, DEFINITIONS: T(x,y) ↔ R(x) ∧ S(x,y)
OUTPUT:
Primitive symbols: R, S
Derived symbols: T depends on {R, S}
Dependency Graph: R → T, S → T

=== HARD REQUIREMENTS ===
- Do NOT infer definability from axioms
- Do NOT guess dependencies
- Do NOT reason about models
- Do NOT add symbols
- Do NOT philosophize or narrate
- Do NOT produce explanations longer than one sentence`,

  "Generate Alternative Conceptualizations": `YOUR TASK: Produce 1–3 alternative axiom sets T' for the input theory T.

=== INPUT THEORY T ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== REQUIREMENTS FOR ALTERNATIVE THEORIES ===
Each alternative T' must:
- Use a different but closely related conceptualization
- Have model classes naturally included in the model class of T
- Preserve the "intended interpretation" of the input theory

=== ALLOWED OPERATIONS ===
- Rename the primitive predicate
- Replace the primitive with a natural conceptual surrogate
- Use equivalent axiom patterns (e.g., "strict order" ↔ "acyclic + irreflexive", "irreflexive + transitive" ↔ "asymmetric + transitive")
- Express the same idea through different semantic framing (ranks, layers, precedence, exclusion, partial orders, etc.)

=== FORBIDDEN ===
- Do NOT produce definitional rewrites (same axioms, just renamed)
- Do NOT add new primitives (no expansions)
- Do NOT invent new structures beyond the input's scope
- Do NOT produce model-theoretically unrelated theories

=== OUTPUT FORMAT ===

ALTERNATIVE 1
LANGUAGE: {NewPred(args), ...}
AXIOMS:
1. [axiom]
2. [axiom]
...
WHY RELATED: (one sentence explaining how this captures the same idea)

ALTERNATIVE 2 (if applicable)
...

ALTERNATIVE 3 (if applicable)
...

=== HARD REQUIREMENTS ===
- 1–3 alternatives only
- Each must be a genuine reconceptualization, not just a synonym swap
- Concise output, no philosophy or commentary`,

  "Interpret Canonical Meaning": `YOUR TASK: Identify the canonical meaning of each primitive and restate all axioms in natural language.

=== INPUT THEORY ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== RULES FOR INTERPRETING PRIMITIVES ===
- Interpret only from the NAME and the STRUCTURE of the axioms
- Provide ONE short, explicit meaning per primitive symbol
- Interpret at the level of ordinary natural language (e.g., "x is earlier than y", "x touches y")
- Do NOT introduce technical ontology, metaphysics, or formalisms

=== RULES FOR RESTATING AXIOMS ===
- Replace formal notation with clear English sentences
- Each axiom MUST be restated in ONE sentence
- The restated sentences must preserve the logical content
- Do NOT comment, analyze, justify, or expand beyond restatement

=== OUTPUT FORMAT (use exactly this structure) ===

RESULT

Intended Meaning of Primitives:
P1: <short meaning>
P2: <short meaning>
...

Restated Axioms:
1. <axiom 1 restated briefly>
2. <axiom 2 restated briefly>
...

=== EXAMPLE ===

INPUT: LANGUAGE: {Before(x,y)}, AXIOMS: ∀x ¬Before(x,x), ∀x∀y∀z ((Before(x,y) ∧ Before(y,z)) → Before(x,z)), ∀x∀y (x ≠ y → (Before(x,y) ∨ Before(y,x)))

OUTPUT:
RESULT
Intended Meaning of Primitives:
Before(x,y): x comes earlier than y.

Restated Axioms:
1. Nothing comes earlier than itself.
2. If x comes earlier than y and y comes earlier than z, then x comes earlier than z.
3. Any two distinct things are ordered so that one comes earlier than the other.

=== HARD REQUIREMENTS ===
- NO formal explanations
- NO informal commentary
- NO methodology sections
- NO significance statements
- NO classification (e.g., "this is a strict order")
- NO domain theory, ontology, or philosophy
- NO multi-paragraph descriptions`,

  "Find an Interpretation": `YOUR TASK: Produce ONE concrete interpretation (model) that satisfies ALL axioms.

=== INPUT THEORY ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== WHAT A VALID INTERPRETATION MUST INCLUDE ===
- A DOMAIN: a specific set (e.g., {0,1,2}, ℕ, ℤ, ℝ, or a finite set)
- An interpretation for each primitive symbol:
  - For predicates: a concrete relation
  - For functions: a concrete function
  - For constants: a concrete element of the domain

=== OUTPUT FORMAT (use exactly this structure) ===

INTERPRETATION
Domain: <description of the set>
Symbol1: <how it is interpreted>
Symbol2: <how it is interpreted>
...

=== GUIDELINES FOR CHOOSING A MODEL ===
- Choose a domain that makes the axioms easy to satisfy
- For equivalence relations: use equality on ℤ or a universal relation
- For orders: use < or ≤ on ℕ or ℤ
- For graphs: use a simple adjacency on a finite set
- For function symbols: choose trivial functions if possible
- Always choose the SIMPLEST domain and interpretation that works
- If instructions specify a category (Computational, Physical, etc.), use that domain type

=== EXAMPLES ===

EXAMPLE 1:
INPUT: LANGUAGE: {R(x,y)}, AXIOMS: ∀x R(x,x), ∀x∀y (R(x,y) → R(y,x)), ∀x∀y∀z ((R(x,y) ∧ R(y,z)) → R(x,z))
OUTPUT:
INTERPRETATION
Domain: ℤ (the integers)
R(x,y): x = y (equality)

EXAMPLE 2:
INPUT: LANGUAGE: {Less(x,y)}, AXIOMS: ∀x ¬Less(x,x), ∀x∀y∀z ((Less(x,y) ∧ Less(y,z)) → Less(x,z))
OUTPUT:
INTERPRETATION
Domain: ℕ (the natural numbers)
Less(x,y): x < y (standard less-than)

=== HARD REQUIREMENTS ===
- NO proofs
- NO multi-paragraph justification
- NO philosophical commentary
- NO model-theoretic analysis
- NO extra sentences beyond the format above`
};

function buildPrompt(input: string, instructions: string, functionName: string): string {
  // Normalize function name by removing argument count suffix like "(One Argument)" or "(Two Arguments)"
  const normalizedName = functionName.replace(/\s*\(.*Argument.*\)\s*$/i, "").trim();
  
  const template = FUNCTION_PROMPTS[normalizedName] || FUNCTION_PROMPTS["Axiom-Set / Theory Transformation"];
  const effectiveInstructions = instructions?.trim() || DEFAULT_INSTRUCTIONS[normalizedName] || "Perform the standard transformation for this function.";
  
  // Handle dual-input functions
  const dualInputFunctions = ["Schema Equivalence", "Definitional Equivalence", "Conservative Extension Analysis", "Compare Conceptual Schemes"];
  if (dualInputFunctions.includes(normalizedName) && input.includes("<<<SEPARATOR>>>")) {
    const [systemA, systemB] = input.split("<<<SEPARATOR>>>");
    return template
      .replace("<<<SYSTEM_A>>>", systemA?.trim() || "")
      .replace("<<<SYSTEM_B>>>", systemB?.trim() || "")
      .replace("<<<INSTRUCTIONS>>>", effectiveInstructions);
  }
  
  return template
    .replace("<<<INPUT>>>", input)
    .replace("<<<INSTRUCTIONS>>>", effectiveInstructions);
}

export async function processWithAI(request: AIRequest): Promise<AIResponse> {
  const refinedInstructions = await refineInstructions(
    request.instructions,
    request.input,
    request.functionName,
    request.model
  );
  
  const prompt = buildPrompt(request.input, refinedInstructions, request.functionName);
  
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: prompt }
  ];

  switch (request.model) {
    case "Zhi 1": {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
    case "Zhi 2": {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }]
      });
      const text = response.content.find(c => c.type === 'text');
      return {
        result: text?.text || "",
        model: "claude-sonnet-4-20250514",
        provider: "Anthropic"
      };
    }
    case "Zhi 3": {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "gpt-4o",
        provider: "OpenAI"
      };
    }
    case "Zhi 4": {
      const client = getDeepSeekClient();
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "deepseek-chat",
        provider: "DeepSeek"
      };
    }
    default: {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
  }
}

export async function chatWithAI(message: string, model: LLMProvider, history: Array<{role: string, content: string}>): Promise<AIResponse> {
  const messages = [
    ...history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user" as const, content: message }
  ];

  switch (model) {
    case "Zhi 1": {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
    case "Zhi 2": {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages
      });
      const text = response.content.find(c => c.type === 'text');
      return {
        result: text?.text || "",
        model: "claude-sonnet-4-20250514",
        provider: "Anthropic"
      };
    }
    case "Zhi 3": {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "gpt-4o",
        provider: "OpenAI"
      };
    }
    case "Zhi 4": {
      const client = getDeepSeekClient();
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "deepseek-chat",
        provider: "DeepSeek"
      };
    }
    default: {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
  }
}
