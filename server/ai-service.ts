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
  "Axiom-Set / Theory Transformation": `Transform the input axiomatic theory into a radically different but logically equivalent form. You may eliminate primitives, introduce new ones, change arity, switch from predicates to functions or vice versa, or completely invert the conceptual foundation. The new theory must prove exactly the same theorems and have isomorphic models. Do not keep eliminated primitives anywhere in the output, not even in definitions or comments. If impossible, explain why.`,
  
  "Schema Equivalence": `Determine whether the two input theories (or schemas) are logically equivalent: i.e., they prove exactly the same theorems in all models. Answer with one of:
— YES, they are equivalent (bi-interpretable or mutually embeddable)
— NO, they are not equivalent (give a clear counterexample or separating property)
— UNKNOWN (with justification).
Then briefly explain the reasoning.`,
  
  "Definitional Equivalence": `Determine whether one theory is a definitional extension of the other: i.e., one can be obtained from the other by adding explicit definitions (conservative extension with new symbols explicitly defined). State which direction holds (A defines B, B defines A, mutual, or neither) and show the explicit definitions if they exist.`,
  
  "Model-Preserving Rewrite": `Rewrite the input theory using a completely different vocabulary and axiom set, but such that every model of the original is isomorphic to a model of the new theory and vice versa. The two theories must be categorically equivalent. Do not use conservative extensions — the output must not be a definitional extension.`,
  
  "Conservative Extension Analysis": `Analyze whether adding the given new axioms or primitives to the base theory constitutes a conservative extension (no new theorems in the original language are provable). Answer YES or NO and prove it: either exhibit a proof of a new old-language theorem or prove independence using a model where the extension fails.`,
  
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
- Show connection between original and corrected`,
  
  "Determine Equivalence": `Determine whether the two axiom systems generate exactly the same theorems. Provide a verdict (EQUIVALENT or NOT EQUIVALENT) with detailed analysis:

If EQUIVALENT: Explain why they generate the same theorems. Show the logical relationship between them.

If NOT EQUIVALENT: Classify the relationship:
- DISJOINT: The theorem sets have no overlap (neither proves anything the other proves)
- OVERLAPPING: Some theorems are shared, but each has unique theorems
- A ⊂ B: System A's theorems are a proper subset of System B's theorems
- B ⊂ A: System B's theorems are a proper subset of System A's theorems

Provide specific examples of theorems that demonstrate the relationship.`
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

=== MANDATORY OUTPUT FORMAT ===

EVERY response MUST follow this EXACT structure:

**1. THE RESULT** (Start here immediately - no preamble, no introduction)
Present the transformed theory, model, interpretation, or analysis RIGHT AT THE TOP.
Just output it. No "Here is..." or "I will now..." - just the actual result.

**2. FORMAL EXPLANATION**
Provide a rigorous, technical explanation of the result using proper logical notation and terminology.

**3. INFORMAL EXPLANATION**
Explain the result in plain language that a non-specialist could understand.

**4. SIGNIFICANCE**
Brief discussion of why this result matters, what it reveals, or how it could be used.

**5. METHODOLOGY**
Explain the approach/algorithm used to arrive at this result.

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
  "Axiom-Set / Theory Transformation": `Transform the theory below according to the instructions.
The new theory must have exactly the same models (up to isomorphism) as the original.
Any primitive asked to be eliminated must disappear completely from the final output.

You have these paradigms to guide your style:

Paradigm 1 – Betweenness → Line
Input: Primitives: Point(x) Between(x,y,z)
Instructions: Rewrite using "Line(x,y)" as the sole primitive.
Output:
Primitive: Line(x,y)
Axioms:
1. ∀x∀y [Line(x,y) → x ≠ y]
2. ∀x∀y∀z [Line(x,y) ∧ Line(y,z) → Line(x,z)]
3. ∀x∀y [x ≠ y → ∃z (Line(x,z) ∧ Line(z,y))]

Paradigm 2 – Membership → Subset
Input: Primitives: Set(x) ElementOf(a,x)
Instructions: Eliminate ElementOf completely, use only Subset(A,B)
Output:
Primitive: Subset(A,B)
Axioms:
1. ∀A∀B∀C [Subset(A,B) ∧ Subset(B,C) → Subset(A,C)]
2. ∀A∀B [Subset(A,B) ∧ Subset(B,A) → A = B]
3. ∃E ∀X ¬Subset(X,E)

USER THEORY:
<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

Output the new primitives and axioms. If you must make choices, state them clearly.`,

  "Schema Equivalence": `Determine if the two theories below are schema-equivalent (same up to renaming of symbols).

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

Build a symbol mapping between vocabularies. Test all arity-preserving mappings. Report whether schema equivalence holds. If yes, give the mapping. If no, give the minimal obstruction.`,

  "Definitional Equivalence": `Test whether the two theories below are definitionally equivalent.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

For each primitive of Theory A, provide an explicit definition using Theory B's vocabulary.
For each primitive of Theory B, provide an explicit definition using Theory A's vocabulary.
Show the bi-directional translation that establishes equivalence.`,

  "Model-Preserving Rewrite": `Rewrite the theory below while preserving exactly the same class of models.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

Analyze which primitives can be eliminated or combined. Produce a rewritten theory with different primitives but identical models.`,

  "Conservative Extension Analysis": `Analyze whether the extension is conservative.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

Determine if adding the new axioms/primitives changes what can be proved in the original vocabulary. Provide verdict with justification.`,

  "Compare Conceptual Schemes": `Analyze the conceptual structure of this theory.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

Build a dependency graph. Classify concepts as primitive vs derived. Compute definitional depth. Identify bottlenecks and central concepts.`,

  "Ontological Dependence": `Analyze the ontological dependencies in this theory.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

For each primitive, determine its ontological load. Rank primitives by importance. Find the minimal sustaining set. Report which primitives are eliminable.`,

  "Generate Alternative Conceptualizations": `Generate an alternative conceptualization of this theory.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

Invert the conceptual hierarchy. Make derived notions primitive. Redefine original primitives. Produce an equivalent theory with different conceptual structure.`,

  "Interpret Canonical Meaning": `Interpret the canonical meaning of this theory.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

For each primitive symbol, identify what it is intended to represent in the most natural interpretation. Then restate all axioms in explicit natural language that reveals what the theory is really about.`,

  "Find an Interpretation": `Find a TRUE MODEL for the axiom system below.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

=== MANDATORY OUTPUT FORMAT ===

**INTERPRETATION**

Domain: [exactly what objects the variables range over]
[Symbol 1]: [plain English meaning]
[Symbol 2]: [plain English meaning]
[etc.]

**WHY THIS WORKS**

[For each axiom, explain in 1-2 sentences why it is TRUE in this model. Be concrete and intuitive.]

=== END FORMAT ===

RULES:
1. The interpretation section must be SHORT and IMMEDIATELY UNDERSTANDABLE
2. No jargon - a reader should instantly grasp the model
3. The model must make ALL axioms literally true (not approximately true)
4. Use the category specified in instructions to guide domain choice
5. If no category specified, choose the most natural/intuitive domain

CATEGORY GUIDANCE:
- Mathematical: algebra, topology, geometry, calculus (set theory only as last resort)
- Computational: data structures, algorithms, types, programs, processes
- Philosophical: substances, properties, events, minds, abstract objects
- Physical: everyday tangible reality - objects, containers, weight, heat
- Physics: scientific physics - spacetime, fields, forces, thermodynamics
- Chemical: reactions, species, molecular structures
- Biological: organisms, food chains, ecosystems
- Economic: goods, prices, preferences
- Social: people, hierarchies, relationships
- Psychological: desires, motivations
- Linguistic: words, alphabetical order
- Organizational: tasks, workflows
- Geographical: locations, elevations
- Home Economics: cooking, food prep, appliances
- Engineering: components, dependencies
- Network: servers, routing, graphs
- Finance categories: orders, assets, tranches, options, capital structure, indicators

FAILURE HANDLING (never return empty):
- Case A (contradictory): Explain why, give adjacent consistent set with model
- Case B (ill-formed, unclear): Reconstruct charitably, model that
- Case C (ill-formed, obvious fix): Fix syntax, model corrected version
- Case D (nearly consistent): Show minimal fix, model the fixed version`,

  "Determine Equivalence": `Compare the two axiom systems below and determine their logical relationship.

=== SYSTEM A ===
<<<SYSTEM_A>>>

=== SYSTEM B ===
<<<SYSTEM_B>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

TASK:
1. Identify the primitives and axioms of each system.
2. Determine what theorems each system can prove.
3. Compare the theorem sets and classify the relationship:
   - EQUIVALENT: Both systems prove exactly the same theorems
   - A ⊂ B (A STRICTLY WEAKER): Every theorem of A is provable in B, but B proves more
   - B ⊂ A (B STRICTLY WEAKER): Every theorem of B is provable in A, but A proves more
   - OVERLAPPING: Some shared theorems, but each has unique theorems the other cannot prove
   - DISJOINT: No shared theorems (extremely rare)

4. Provide specific example theorems demonstrating the relationship.
5. If equivalent, show why (translation, bi-interpretation, etc.).
6. If not equivalent, show a separating theorem (provable in one but not the other).`
};

function buildPrompt(input: string, instructions: string, functionName: string): string {
  const template = FUNCTION_PROMPTS[functionName] || FUNCTION_PROMPTS["Axiom-Set / Theory Transformation"];
  const effectiveInstructions = instructions?.trim() || DEFAULT_INSTRUCTIONS[functionName] || "Perform the standard transformation for this function.";
  
  // Handle dual-input functions (like Determine Equivalence)
  if (functionName === "Determine Equivalence" && input.includes("<<<SEPARATOR>>>")) {
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
