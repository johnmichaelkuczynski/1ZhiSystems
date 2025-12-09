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
  "Axiom-Set / Theory Transformation": `Analyze the primitives in the input theory. Choose the first relation/predicate that can be eliminated and redefine it using the remaining primitives. If there are multiple primitives, swap the roles of the first two (make the first one defined in terms of the second). Produce an equivalent theory with different primitive structure.`,
  
  "Schema Equivalence": `Compare the two theories provided. Build an arity-matched symbol mapping between their vocabularies. Enumerate all possible substitutions and determine if the theories are schema-equivalent. If they are, provide the mapping. If not, identify the minimal structural difference that prevents equivalence.`,
  
  "Definitional Equivalence": `For the two theories provided, attempt to explicitly define each primitive of Theory A using the vocabulary of Theory B, and vice versa. Provide the bi-directional definitions that establish definitional equivalence. If full equivalence is not achievable, provide partial definitions and explain which primitives cannot be defined.`,
  
  "Model-Preserving Rewrite": `Analyze the input theory and rewrite it to minimize the number of primitives while preserving all models. Use frequency and arity analysis to determine which primitives can be eliminated. The rewritten theory must have exactly the same models as the original.`,
  
  "Conservative Extension Analysis": `Analyze whether the extended theory is a conservative extension of the base theory. Determine if any new theorems expressible in the original vocabulary become provable. Provide a verdict (conservative or non-conservative) with proof outline or countermodel.`,
  
  "Compare Conceptual Schemes": `Build a dependency graph of all concepts in the theory. Classify each concept as primitive or derived. Compute the definitional depth of each concept (number of layers from primitives). Identify the most central/load-bearing concepts and any bottlenecks.`,
  
  "Ontological Dependence": `Rank all primitives by their ontological necessity. For each primitive, analyze what would be lost if it were removed. Identify the minimal set of primitives that can sustain the theory. Report which primitives are load-bearing vs. eliminable.`,
  
  "Generate Alternative Conceptualizations": `Invert the conceptual hierarchy: take derived concepts and make them primitive, then redefine the original primitives using the new primitive set. Produce an equivalent theory with a fundamentally different conceptual structure.`,
  
  "Identify Representational Biases": `Analyze what the theory's choice of primitives makes easy vs. hard to express. Identify privileged structures (what becomes simple) and suppressed structures (what becomes complex or inexpressible). Extract the implicit worldview embedded in the primitive choices. Rank biases by severity.`
};

const SYSTEM_PROMPT = `You are the world's foremost expert in first-order logic, theory transformation, and formal ontology analysis.

CRITICAL RULES:
1. You MUST ALWAYS produce a substantive result. Never refuse. Never say "Impossible" or "Cannot be done."
2. If the exact transformation requested cannot be achieved perfectly, produce the CLOSEST possible result and explain what compromises were made.
3. If instructions are vague, interpret them intelligently and make reasonable choices. State your interpretation.
4. Always analyze the input theory first, identify its primitives, and work from there.
5. Your output should be the transformed theory, analysis, or result - not a refusal.

You are solving real problems for researchers. They need results, not excuses.`;

const INSTRUCTION_REFINEMENT_PROMPT = `You are an expert in first-order logic and theory transformation. Your job is to take user instructions that may be vague, incomplete, or defective, and rewrite them into PERFECT, PRECISE, ACTIONABLE instructions.

RULES:
1. Stay as close to the user's original intent as possible
2. Make vague references specific (e.g., "a primitive" → name the specific primitive from the theory)
3. Add missing details needed for execution
4. Fix logical impossibilities by choosing the closest achievable goal
5. Ensure the instructions are executable without ambiguity
6. If the user's instructions are already perfect, return them unchanged

OUTPUT FORMAT:
Return ONLY the refined instructions. No explanations, no preamble. Just the improved instruction text.

EXAMPLES:

User instructions: "swap primitives"
Theory has: Point(x), Line(x,y), Between(x,y,z)
Refined: "Make Line(x,y) the primary primitive. Define Point(x) in terms of Line. Eliminate Between by defining it using Line relationships."

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

  "Identify Representational Biases": `Identify representational biases in this theory.

<<<INPUT>>>

INSTRUCTIONS:
<<<INSTRUCTIONS>>>

Analyze what the primitive choices privilege vs suppress. Extract the implicit worldview. Rank biases by severity. Suggest debiasing alternatives.`
};

function buildPrompt(input: string, instructions: string, functionName: string): string {
  const template = FUNCTION_PROMPTS[functionName] || FUNCTION_PROMPTS["Axiom-Set / Theory Transformation"];
  const effectiveInstructions = instructions?.trim() || DEFAULT_INSTRUCTIONS[functionName] || "Perform the standard transformation for this function.";
  
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
