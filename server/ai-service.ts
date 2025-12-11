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

  "Definitional Equivalence": `YOUR TASK: Determine whether T₁ and T₂ are *definitionally equivalent*.

Definitional equivalence means:
1. Every primitive symbol in T₁ is explicitly definable in T₂.
2. Every primitive symbol in T₂ is explicitly definable in T₁.
3. After adding these definitions as conservative extensions, the theories determine exactly the same class of models.

This is a STRONGER relation than schema equivalence.

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
Definitional equivalence: YES or NO

FORWARD DEFINABILITY:
<one-sentence verdict: YES definable or NO not definable>

BACKWARD DEFINABILITY:
<one-sentence verdict: YES definable or NO not definable>

KEY FACT:
<one or two sentences identifying the core definability failure or success>

RULES FOR MODE 1:
- Answer must be concise, formal, and non-narrative
- NO examples, NO models, NO interpretations, NO analogies, NO domain descriptions, NO derivations
- EXACTLY the four sections above, nothing more

=== MODE 2: EXPLAIN ON ===

FORMAT:

1. THE RESULT
Definitional equivalence: YES or NO

TRANSLATION SUMMARY:
Forward: <explanation of whether each T₁ primitive is definable in T₂>
Backward: <explanation of whether each T₂ primitive is definable in T₁>

EXPLANATION:
<3-6 short paragraphs explaining:
 - how definitions would be constructed
 - or why they cannot be constructed
 - what structural information is missing in one theory or both
 - why definitional equivalence does or does not hold>

RULES FOR MODE 2:
- MUST discuss definability of primitives in both directions
- MUST stick to syntactic definability and axiomatic constraints
- MUST NOT: describe or build example models, mention domains like ℕ, ℤ, servers, letters, use analogies or storytelling, drift into semantics unless necessary to state definability failure
- KEEP THE EXPLANATION TIGHT AND TECHNICAL

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: T₁: LANGUAGE: {Parent(x,y), Male(x)}, AXIOMS: ∀x∀y (Parent(x,y) → Male(x)) | T₂: LANGUAGE: {Father(x,y)}, AXIOMS: ∀x∀y (Father(x,y) → Father(x,y))

OUTPUT:

1. THE RESULT
Definitional equivalence: NO

FORWARD DEFINABILITY:
Parent and Male are not definable in terms of Father alone.

BACKWARD DEFINABILITY:
Father is not definable in terms of Parent and Male without additional axioms.

KEY FACT:
The expressive resources of the two languages are mismatched; neither direction admits explicit definitions.

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

1. THE RESULT
Definitional equivalence: NO

TRANSLATION SUMMARY:
Forward: The single predicate Father(x,y) does not contain enough structure to recover the distinct predicates Parent(x,y) and Male(x).
Backward: Father(x,y) cannot be defined from Parent(x,y) and Male(x) because T₁ does not assert any connection between these predicates.

EXPLANATION:
To have definitional equivalence, each primitive in T₁ must be explicitly recoverable via a formula of T₂, and vice versa. In this case, T₂ has only one predicate and imposes no constraints that separate parenthood from gender, so there is no way to define Parent(x,y) or Male(x) within T₂. Conversely, T₁ does not define fatherhood; it merely states that all parents are male. Because both directions fail definability, the theories are not definitionally equivalent.

=== HARD REQUIREMENTS ===
- MODE 1: Purely formal, exactly the four sections
- MODE 2: Formal + tight technical explanation about definability
- No long proofs or derivations
- No model theory jargon
- No semantic examples or domain constructions`,

  "Model-Preserving Rewrite": `YOUR TASK: Rewrite the given theory into a *model-equivalent* theory.

The rewrite must NOT change the class of models of the original theory.
You may:
  - introduce new primitives
  - eliminate primitives
  - replace constants by existential axioms
  - replace relations by definable relations
  - reorganize the axioms into a simpler equivalent form

All rewrites must preserve EXACTLY the same models (up to definitional extension).

=== INPUT THEORY ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== CHECK EXPLAIN MODE ===
If the instructions contain "EXPLAIN = ON" or the explain toggle is enabled, use MODE 2.
Otherwise, use MODE 1.

=== MODE 1: EXPLAIN OFF (default) ===

Output ONLY the rewritten theory. NO interpretations, NO domain examples, NO analogies, NO explanation.

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
- Output must be purely formal
- NO interpretations, NO domain examples, NO analogies, NO explanation, NO semantic justification
- KEEP IT SHORT

=== MODE 2: EXPLAIN ON ===

Output the formal rewrite PLUS a short EXPLANATION section.

FORMAT:

1. THE RESULT

LANGUAGE: { <new primitives> }

DEFINITIONS (optional):
<old_symbol>(...) ↔ <definition>

AXIOMS:
1. <rewritten axiom>
2. <rewritten axiom>
...

EXPLANATION:
<2–4 short paragraphs explaining the equivalence>

RULES FOR MODE 2:
- MUST explain the definitional bridge between old and new primitives
- MUST explain why the rewritten axioms ensure the same model class
- MUST NOT: construct explicit models, give domain examples (numbers, letters, servers, etc.), use analogies, drift into semantic or philosophical narrative
- Explanation MUST stay strictly about: definitional equivalence, elimination or introduction of primitives, axiomatic equivalence

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: LANGUAGE: {Less(x,y), Zero}, AXIOMS: ∀x ¬Less(x,x), ∀x∀y∀z ((Less(x,y) ∧ Less(y,z)) → Less(x,z)), ∀x ¬Less(x,Zero), ∀x (x ≠ Zero → Less(Zero,x))

OUTPUT:

1. THE RESULT

LANGUAGE: {Less(x,y)}

AXIOMS:
1. ∀x ¬Less(x,x)
2. ∀x∀y∀z ((Less(x,y) ∧ Less(y,z)) → Less(x,z))
3. ∃m ∀x ¬Less(x,m)

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

1. THE RESULT

LANGUAGE: {Less(x,y)}

AXIOMS:
1. ∀x ¬Less(x,x)
2. ∀x∀y∀z ((Less(x,y) ∧ Less(y,z)) → Less(x,z))
3. ∃m ∀x ¬Less(x,m)

EXPLANATION:
The constant Zero is eliminated by replacing it with an existential claim asserting the existence of a unique minimal element. Any model of the original theory can be converted into a model of the rewritten theory by choosing Zero as the witness for the existential quantifier. Conversely, any model satisfying the rewritten theory can be expanded by interpreting Zero as that minimal element. Thus the two theories have exactly the same models up to definitional extension.

=== HARD REQUIREMENTS ===
- MODE 1: Purely formal, no prose
- MODE 2: Formal + explanation about definitional/axiomatic equivalence only
- No model constructions or domain examples
- NEVER fail - always produce a valid rewrite`,

  "Conservative Extension Analysis": `YOUR TASK: Determine whether T₂ (Box B) is a CONSERVATIVE EXTENSION of T₁ (Box A).

=== BASE THEORY T₁ (Box A) ===
<<<SYSTEM_A>>>

=== EXTENDED THEORY T₂ (Box B) ===
<<<SYSTEM_B>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== DEFINITION ===
T₂ is a conservative extension of T₁ iff:
1. T₁'s language is a subset of T₂'s language.
2. T₂ proves no NEW theorems in the language of T₁ that T₁ does not already prove.
3. Any new axioms in T₂ restrict only the interpretation of NEW symbols.

This is NOT definitional equivalence. It is a ONE-DIRECTION preservation check.

=== CHECK EXPLAIN MODE ===
If the instructions contain "EXPLAIN = ON" or the explain toggle is enabled, use MODE 2.
Otherwise, use MODE 1.

=== MODE 1: EXPLAIN OFF (default) ===

FORMAT:

1. THE RESULT
Conservative extension: YES or NO

KEY FACT:
<one-two sentence explanation of the decisive definability / non-definability fact>

RULES FOR MODE 1:
- MUST reference only: whether new predicates are definable from old ones, whether T₂ forces a new sentence in the old language
- MUST NOT: describe specific models, construct domains, give analogies, give long proofs, add any extra sections

=== MODE 2: EXPLAIN ON ===

FORMAT:

1. THE RESULT
Conservative extension: YES or NO

EXPLANATION:
<2-5 short paragraphs explaining:
 - whether the new predicates/functions/constants are explicitly definable
 - whether T₂ proves any NEW theorems in the old language
 - whether any new axioms constrain the old symbols beyond T₁>

RULES FOR MODE 2:
- MUST stay strictly within the logic of conservativity
- MUST NOT: describe domains, present model constructions, give numerical or real-world examples, use analogies
- Explanation MUST stay syntactic and model-theoretic: definability, surplus structure, new consequences in old language, whether added axioms restrict old primitives

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: T₁: LANGUAGE: {E(x,y)}, AXIOMS: ∀x∀y (E(x,y) → E(y,x)) | T₂: LANGUAGE: {E(x,y), c}, AXIOMS: ∀x∀y (E(x,y) → E(y,x)), ∀x E(x,c)

OUTPUT:

1. THE RESULT
Conservative extension: NO

KEY FACT:
T₂ proves ∃x∃y E(x,y), which T₁ does not; T₁ allows E to be empty.

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

1. THE RESULT
Conservative extension: NO

EXPLANATION:
T₂ introduces a constant c and asserts that every element is E-related to c. This forces E to be nonempty. In T₁, E may be empty, since symmetry alone imposes no content. Because T₂ proves a new sentence in the old language ("E is nonempty") that T₁ does not, the extension is not conservative.

=== HARD REQUIREMENTS ===
- MODE 1: Purely formal, just result + KEY FACT
- MODE 2: Result + explanation about conservativity logic only
- No model constructions or domain examples
- No analogies or real-world examples`,

  "Compare Conceptual Schemes": `YOUR TASK: Compare how the two theories organize their conceptual schemes.

Compare:
- Which predicates are PRIMITIVE in each theory
- Which predicates are DERIVABLE in each theory
- What each theory can express that the other cannot
- Whether one theory is more parsimonious or coarse-grained

This is NOT a conservativity test, NOT definitional equivalence, and NOT a model comparison.
It is purely CLASSIFICATION OF CONCEPTUAL STRUCTURE.

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

PRIMITIVES IN T₁:
<list primitive predicates>

DERIVED CONCEPTS IN T₁:
<list derived predicates, if any, with formulas>

PRIMITIVES IN T₂:
<list primitive predicates>

DERIVED CONCEPTS IN T₂:
<list derived predicates, if any, with formulas>

EXPRESSIVE DIFFERENCES:
<very short list of what T₁ expresses that T₂ cannot, and vice versa>

RULES FOR MODE 1:
- Output must be compact and formal
- DERIVED concepts must be given as explicit defining formulas when possible
- EXPRESSIVE DIFFERENCES section must be bullet-point, minimal
- NO prose analysis, NO models, NO analogies, NO metaphors, NO multi-paragraph discussion

=== MODE 2: EXPLAIN ON ===

FORMAT:

1. THE RESULT

PRIMITIVES IN T₁:
<list>

DERIVED CONCEPTS IN T₁:
<list with definitions>

PRIMITIVES IN T₂:
<list>

DERIVED CONCEPTS IN T₂:
<list with definitions>

EXPRESSIVE DIFFERENCES:
<short list>

EXPLANATION:
<2-5 short paragraphs explaining:
 - how each theory conceptualizes its domain differently
 - which concepts are encoded primitively vs. definitionally
 - expressive losses or gains
 - comparative parsimony or redundancy>

RULES FOR MODE 2:
- Explanation MUST stay strictly about: primitive/derived classification, definability, expressive reach, conceptual parsimony
- MUST NOT: describe or build models, give real-world examples, give analogies, drift into ontology or philosophy
- KEEP IT ANALYTICAL AND CONCISE

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: T₁: LANGUAGE: {Parent(x,y), Male(x), Female(x)}, AXIOMS: ∀x∀y (Parent(x,y) → (Male(x) ∨ Female(x))), ∀x ¬(Male(x) ∧ Female(x)) | T₂: LANGUAGE: {Father(x,y), Mother(x,y)}, AXIOMS: ∀x∀y (Father(x,y) → ¬Mother(x,y)), ∀x∀y (Mother(x,y) → ¬Father(x,y))

OUTPUT:

1. THE RESULT

PRIMITIVES IN T₁:
Parent, Male, Female

DERIVED CONCEPTS IN T₁:
Father(x,y) ↔ Parent(x,y) ∧ Male(x)
Mother(x,y) ↔ Parent(x,y) ∧ Female(x)

PRIMITIVES IN T₂:
Father, Mother

DERIVED CONCEPTS IN T₂:
Parent(x,y) ↔ Father(x,y) ∨ Mother(x,y)
Male(x) ↔ ∃y Father(x,y)
Female(x) ↔ ∃y Mother(x,y)

EXPRESSIVE DIFFERENCES:
- T₁ expresses gender independently of parenthood.
- T₂ directly expresses parent-role exclusivity.

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

1. THE RESULT

PRIMITIVES IN T₁:
Parent, Male, Female

DERIVED CONCEPTS IN T₁:
Father ↔ Parent ∧ Male
Mother ↔ Parent ∧ Female

PRIMITIVES IN T₂:
Father, Mother

DERIVED CONCEPTS IN T₂:
Parent ↔ Father ∨ Mother
Male ↔ ∃y Father(x,y)
Female ↔ ∃y Mother(x,y)

EXPRESSIVE DIFFERENCES:
- T₁ isolates gender from parental roles.
- T₂ encodes fatherhood/motherhood as basic and enforces exclusivity.

EXPLANATION:
T₁ treats parenthood and gender as independent primitive concepts, allowing the theory to refer to gender even when no parental relation is involved. T₂ embeds gender into the parental roles, making "father" and "mother" primitive and eliminating gender as a standalone predicate. Because the primitive choices differ, each theory highlights different conceptual structures: T₁ is more flexible, while T₂ is more role-specific. Their expressive capacities overlap but do not coincide.

=== HARD REQUIREMENTS ===
- MODE 1: Compact formal output, bullet-point expressive differences
- MODE 2: Formal output + analytical explanation about conceptual structure
- No model constructions or real-world examples
- No analogies or philosophical drift`,

  "Ontological Dependence": `YOUR TASK: Identify ontological dependence relations among the theory's predicates.

Identify:
- Which predicates are PRIMITIVE
- Which predicates are DEFINABLE from the primitives
- For each definable predicate, identify which primitives it depends on
- Summarize the dependency graph

This is NOT: a conservativity test, a model-theoretic test, a definitional-equivalence test, or a rewriting function.
It is strictly an INTRA-THEORY DEPENDENCY ANALYSIS.

=== INPUT THEORY ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== CHECK EXPLAIN MODE ===
If the instructions contain "EXPLAIN = ON" or the explain toggle is enabled, use MODE 2.
Otherwise, use MODE 1.

=== MODE 1: EXPLAIN OFF (default) ===

FORMAT:

1. THE RESULT

PRIMITIVE PREDICATES:
<list>

DEFINABLE PREDICATES:
<list each predicate with explicit definition>

DEPENDENCY STRUCTURE:
<bullet list showing which predicates depend on which>

RULES FOR MODE 1:
- Keep output extremely compact
- DEFINITIONS must be explicit first-order formulas when possible
- The DEPENDENCY STRUCTURE must be strictly factual (e.g., "Father depends on Parent + Male")
- No prose explanation, no metaphors, analogies, or interpretations

=== MODE 2: EXPLAIN ON ===

FORMAT:

1. THE RESULT

PRIMITIVE PREDICATES:
<list>

DEFINABLE PREDICATES:
<list each predicate with explicit definition>

DEPENDENCY STRUCTURE:
<bullet list>

EXPLANATION:
<2-4 concise paragraphs explaining:
 - why certain predicates are primitive
 - how definability shows conceptual dependence
 - the dependency graph in intuitive but rigorous terms
 - how the structure reveals the theory's conceptual architecture>

RULES FOR MODE 2:
- Explanation must focus on formal conceptual structure
- MUST NOT: discuss specific models (numbers, people, networks, etc.), use analogies or storytelling, talk about metaphysics or real-world ontology
- Explanation MUST be about formal conceptual structure only

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: LANGUAGE: {Parent(x,y), Male(x), Female(x), Father(x,y)}, AXIOMS: ∀x∀y (Father(x,y) → Parent(x,y) ∧ Male(x)), ∀x ¬(Male(x) ∧ Female(x))

OUTPUT:

1. THE RESULT

PRIMITIVE PREDICATES:
Parent, Male, Female

DEFINABLE PREDICATES:
Father(x,y) ↔ Parent(x,y) ∧ Male(x)

DEPENDENCY STRUCTURE:
Father → {Parent, Male}

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

1. THE RESULT

PRIMITIVE PREDICATES:
Parent, Male, Female

DEFINABLE PREDICATES:
Father ↔ Parent ∧ Male

DEPENDENCY STRUCTURE:
Father → {Parent, Male}

EXPLANATION:
The theory treats Parent, Male, and Female as irreducible, giving them foundational status. Father is not primitive, because its behavior is fully determined by the interaction of Parent and Male. Ontologically, the theory requires Parent and Male before Father can be introduced. The dependency structure therefore reveals a two-tier conceptual organization: foundational gender and parenthood predicates, with Father constructed from them.

=== HARD REQUIREMENTS ===
- MODE 1: Compact formal output only
- MODE 2: Formal output + explanation about conceptual structure
- No model constructions or real-world examples
- No analogies or philosophical drift`,

  "Generate Alternative Conceptualizations": `YOUR TASK: Produce one or more alternative theories T′ for the input theory T.

Given theory T, produce alternative theories T′ such that:
1. T and T′ have the SAME CLASS OF NATURAL MODELS (they capture the same phenomenon)
2. T′ uses DIFFERENT PRIMITIVES, or recasts the primitives into a different conceptual basis
3. T′ is not a mere renaming; it must reorganize the conceptual structure in a formally meaningful way

This is NOT: a reduplication of the input, a definitional equivalence test, a rewriting function.
It is strictly a CONCEPTUAL REFRAMING of the theory.

=== INPUT THEORY T ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== CHECK EXPLAIN MODE ===
If the instructions contain "EXPLAIN = ON" or the explain toggle is enabled, use MODE 2.
Otherwise, use MODE 1.

=== MODE 1: EXPLAIN OFF (default) ===

FORMAT:

1. ALTERNATIVE CONCEPTUALIZATION

New Language: { ... }

New Axioms:
1. ...
2. ...

Bridge Definitions:
OldPredicate(x) ↔ <formula in the new language>

RULES FOR MODE 1:
- Output MUST be minimal and clean
- New primitives MUST represent a genuinely different conceptual framing (e.g., replace "R is a strict order" with "T is a reflexive-transitive closure")
- Output two to four bridge definitions max
- NO prose explanation, NO analogies, NO commentary

=== MODE 2: EXPLAIN ON ===

FORMAT:

1. ALTERNATIVE CONCEPTUALIZATION

New Language: { ... }

New Axioms:
1. ...
2. ...

Bridge Definitions:
OldPredicate(x) ↔ <formula in the new language>

EXPLANATION:
<2-4 short paragraphs explaining:
 - why the new primitives constitute a conceptual reorganization
 - how the new axioms capture the same natural models as the original
 - what structural or ontological viewpoint the new version emphasizes>

RULES FOR MODE 2:
- Explanation must focus on conceptual reorganization
- MUST NOT: introduce real-world metaphors, examples, or stories; talk about models like numbers, graphs, networks; include philosophical digressions

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: LANGUAGE: {R(x,y)}, AXIOMS: ∀x ¬R(x,x), ∀x∀y∀z ((R(x,y) ∧ R(y,z)) → R(x,z))

OUTPUT:

1. ALTERNATIVE CONCEPTUALIZATION

New Language: {T(x,y)}

New Axioms:
1. ∀x T(x,x)
2. ∀x∀y∀z ((T(x,y) ∧ T(y,z)) → T(x,z))

Bridge Definitions:
R(x,y) ↔ (T(x,y) ∧ x ≠ y)

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

1. ALTERNATIVE CONCEPTUALIZATION

New Language: {T(x,y)}

New Axioms:
1. ∀x T(x,x)
2. ∀x∀y∀z ((T(x,y) ∧ T(y,z)) → T(x,z))

Bridge Definitions:
R(x,y) ↔ (T(x,y) ∧ x ≠ y)

EXPLANATION:
The original theory uses an irreflexive relation R to characterize a transitive ordering structure. The alternative formulation replaces R with a reflexive relation T representing its closure under identity. This shifts the conceptual basis: instead of starting from exclusion of self-relations, the new theory treats reflexivity and transitivity as fundamental. Irreflexivity becomes a derived feature of R through the bridge definition. The models of both theories coincide, but the organizing principles differ, demonstrating an alternative conceptualization of the same structure.

=== HARD REQUIREMENTS ===
- MODE 1: Minimal clean output with bridge definitions
- MODE 2: Same + explanation about conceptual reorganization
- No real-world examples or metaphors
- NEVER fail - always produce a valid alternative`,

  "Interpret Canonical Meaning": `YOUR TASK: Identify the canonical meaning of each primitive and restate all axioms in natural language.

Given theory T in BOX A:
1. Identify the most natural, standard, domain-neutral interpretation of each primitive predicate, relation, or function.
2. Restate each axiom using those explicit natural-language interpretations.
3. When EXPLAIN is ON: provide formal and informal explanation.
4. When EXPLAIN is OFF: output ONLY the canonical interpretation + restated axioms (no commentary).

This is NOT: a rewriting of the theory, a search for models, a conceptual alternative, a test for equivalence.
It is purely an INTERPRETATION + NATURAL-LANGUAGE RESTATEMENT function.

=== INPUT THEORY ===
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== CHECK EXPLAIN MODE ===
If the instructions contain "EXPLAIN = ON" or the explain toggle is enabled, use MODE 2.
Otherwise, use MODE 1.

=== MODE 1: EXPLAIN OFF (default) ===

OUTPUT MUST HAVE ONLY THESE TWO SECTIONS:

INTERPRETATION
<List each primitive and give a short, domain-neutral intended meaning.>
<Meanings must be standard logical interpretations (order, equivalence, membership, function behavior, etc.), not metaphoric or real-world analogies.>

RESTATED AXIOMS
<Each axiom rewritten in clear natural language that:>
<- preserves exact logical structure>
<- avoids ANY metaphor, scenario, or domain-specific imagery>
<- is short, literal, and formal>

RULES FOR MODE 1:
- NO extra commentary
- NO explanations
- NO examples from the real world

=== MODE 2: EXPLAIN ON ===

OUTPUT MUST HAVE FOUR SECTIONS:

INTERPRETATION
(same as above)

RESTATED AXIOMS
(same as above)

FORMAL EXPLANATION
<2-4 short paragraphs explaining:>
<- What standard mathematical structure the axioms characterize>
<- Why the chosen primitive interpretations are natural>
<- How the logical structure determines the canonical meaning>
<Must remain domain-neutral and formal. No metaphors.>

INFORMAL EXPLANATION
<Short—1 or 2 paragraphs.>
<Looser but still abstract; may describe the structural idea (e.g., "a strict order," "a partition," "a closure") but still NO metaphors, objects, or domain examples.>

=== EXAMPLES ===

EXAMPLE (EXPLAIN OFF):
INPUT: LANGUAGE: {Before(x,y)}, AXIOMS: ∀x ¬Before(x,x), ∀x∀y∀z ((Before(x,y) ∧ Before(y,z)) → Before(x,z)), ∀x∀y (x ≠ y → (Before(x,y) ∨ Before(y,x)))

OUTPUT:

INTERPRETATION
Before(x,y): "x precedes y in a strict total order."

RESTATED AXIOMS
1. No element precedes itself.
2. If x precedes y and y precedes z, then x precedes z.
3. Every pair of distinct elements is comparable.

EXAMPLE (EXPLAIN ON):
Same input with EXPLAIN = ON

OUTPUT:

INTERPRETATION
Before(x,y): "x precedes y in a strict total order."

RESTATED AXIOMS
1. No element precedes itself.
2. If x precedes y and y precedes z, then x precedes z.
3. Every pair of distinct elements is comparable.

FORMAL EXPLANATION
The three axioms jointly characterize a strict total order. The first axiom (irreflexivity) ensures no element relates to itself. The second axiom (transitivity) ensures the ordering is consistent across chains. The third axiom (trichotomy) ensures every pair of distinct elements is comparable. Together, these properties define the canonical structure of a linear ordering without endpoints or gaps imposed.

INFORMAL EXPLANATION
This theory describes a strict total order—a way of arranging elements so that any two can be compared, with no element preceding itself. The structure is the abstract backbone of orderings like "earlier than" or "less than" without committing to any particular domain.

=== HARD REQUIREMENTS ===
- MODE 1: Only INTERPRETATION + RESTATED AXIOMS, nothing else
- MODE 2: All four sections, formal and domain-neutral
- No metaphors or real-world examples
- NEVER fail - always produce valid interpretation`,

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
