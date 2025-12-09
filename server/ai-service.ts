import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type LLMProvider = "Zhi 1" | "Zhi 2" | "Zhi 3" | "Zhi 4";

const FUNCTION_PROMPTS: Record<string, { concise: string; explain: string }> = {
  "Axiom-Set / Theory Transformation": {
    concise: `You are a formal logic transformation engine that RADICALLY RESTRUCTURES axiomatic theories.

CORE TASK:
Take an axiomatic theory (primitives + axioms) and user instructions, then produce a NEW logically equivalent theory that:
- Uses ONLY the new primitives specified by the user
- Has ZERO traces of eliminated primitives (not in axioms, not in definitions, not anywhere)
- Preserves the same class of models (up to isomorphism) and same provable theorems

ALLOWED OPERATIONS:
- Eliminate primitives completely (they must vanish 100%)
- Introduce entirely new primitives
- Replace old primitives with new ones  
- Restructure, split, or merge axioms
- Invert the entire conceptual scheme

CRITICAL RULES:
1. ELIMINATED PRIMITIVES MUST BE 100% GONE. No "Definition: OldPrimitive(x) = ..." allowed. The old primitives DO NOT EXIST in the output.
2. Output ONLY the new primitives and new axioms using ONLY those new primitives
3. Do NOT add a Definitions section that references eliminated primitives
4. Do NOT explain, analyze, or comment
5. If transformation is impossible, state why briefly

OUTPUT FORMAT (exactly):
NEW PRIMITIVE:
  [name and signature]

REWRITTEN AXIOMS:
1. [axiom using only new primitives]
2. [axiom using only new primitives]
...

EXAMPLE - This is the FLAGSHIP transformation that MUST work:
INPUT: Point(x), Between(x,y,z) with betweenness axioms
INSTRUCTION: "Rewrite using Line(x,y) as sole primitive. Eliminate Point and Between."
CORRECT OUTPUT:
NEW PRIMITIVE:
  Line(x,y)   // x and y determine a unique line

REWRITTEN AXIOMS:
1. ∀x∀y [Line(x,y) → x ≠ y]
2. ∀x∀y∀z [Line(x,y) ∧ Line(y,z) → Line(x,z)]
3. ∀x∀y [x ≠ y → ∃z (Line(x,z) ∧ Line(z,y))]

WRONG OUTPUT (NEVER DO THIS):
Definitions: Point(x) = ∃y Line(x,y)  ← WRONG! Point must be GONE!`,
    explain: `You are a formal logic expert specializing in axiomatic systems transformation.

Transform the theory by RADICALLY RESTRUCTURING it according to the user's instructions:
- Eliminate specified primitives completely (no traces anywhere)
- Introduce new primitives as specified
- Produce equivalent axioms using ONLY the new primitives
- Preserve the same models and theorems

Provide:
1. The transformed theory (new primitives + rewritten axioms)
2. Brief explanation of how the new axioms capture the original theory's content
3. Note if anything is lost in the transformation`
  },

  "Schema Equivalence": {
    concise: `You are a schema equivalence checker. OUTPUT ONLY THE RESULT. NO COMMENTARY.

RULES:
- State EQUIVALENT or NOT EQUIVALENT
- If equivalent: provide the mapping between primitives
- If not equivalent: state the minimal obstruction
- Do NOT explain your reasoning unless asked`,
    explain: `You are a model-theoretic analysis expert. Check schema equivalence and explain your analysis in detail.`
  },

  "Definitional Equivalence": {
    concise: `You are a definitional equivalence checker. OUTPUT ONLY THE RESULT. NO COMMENTARY.

RULES:
- State DEFINITIONALLY EQUIVALENT or NOT DEFINITIONALLY EQUIVALENT
- If equivalent: provide bi-directional definitions
- If not: state what cannot be defined
- No explanations`,
    explain: `You are a formal logic expert. Check definitional equivalence and explain your reasoning step by step.`
  },

  "Model Finding & Counter-Examples": {
    concise: `You are a model finder. OUTPUT ONLY THE MODEL. NO COMMENTARY.

RULES:
- Provide the model directly
- Show interpretations of all primitives
- No explanations or analysis`,
    explain: `You are a model-theoretic expert. Find models and explain how they satisfy the constraints.`
  },

  "Consistency Check": {
    concise: `You are a consistency checker. OUTPUT ONLY THE RESULT. NO COMMENTARY.

RULES:
- State CONSISTENT or INCONSISTENT
- If inconsistent: show the contradiction
- No explanations`,
    explain: `You are a formal logic expert. Check consistency and explain your analysis.`
  },

  "Independence Proofs": {
    concise: `You are an independence prover. OUTPUT ONLY THE RESULT. NO COMMENTARY.

RULES:
- State INDEPENDENT or NOT INDEPENDENT
- If independent: provide the separating model
- No explanations`,
    explain: `You are a formal logic expert. Prove independence and explain the construction.`
  },

  "Completeness Analysis": {
    concise: `You are a completeness analyzer. OUTPUT ONLY THE RESULT. NO COMMENTARY.

RULES:
- State COMPLETE or INCOMPLETE
- If incomplete: provide an undecidable sentence
- No explanations`,
    explain: `You are a formal logic expert. Analyze completeness and explain your reasoning.`
  },

  "Ontological Reduction": {
    concise: `You are an ontological reducer. OUTPUT ONLY THE REDUCED THEORY. NO COMMENTARY.

RULES:
- Output only the reduced Primitives and Axioms
- Show how eliminated entities are defined
- No explanations`,
    explain: `You are a philosophical logic expert. Reduce the ontology and explain what commitments are eliminated.`
  },

  "Theorem Derivation": {
    concise: `You are a theorem deriver. OUTPUT ONLY THE DERIVATION. NO COMMENTARY.

RULES:
- Show the proof steps
- Use formal notation
- No meta-commentary`,
    explain: `You are a formal logic expert. Derive the theorem and explain each step in detail.`
  }
};

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please set up the OpenAI integration or provide OPENAI_API_KEY.");
  }
  return new OpenAI({ apiKey });
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured. Please set up the Anthropic integration or provide ANTHROPIC_API_KEY.");
  }
  return new Anthropic({ apiKey });
}

function getXAIClient(): OpenAI {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("xAI API key not configured. Please provide XAI_API_KEY in secrets.");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1"
  });
}

function getDeepSeekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key not configured. Please provide DEEPSEEK_API_KEY in secrets.");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com"
  });
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

function buildPrompt(functionName: string, input: string, instructions: string, explain: boolean = false): string {
  const prompts = FUNCTION_PROMPTS[functionName] || FUNCTION_PROMPTS["Axiom-Set / Theory Transformation"];
  const systemContext = explain ? prompts.explain : prompts.concise;
  
  const outputInstruction = explain 
    ? "Provide a detailed response with explanations."
    : "Output ONLY the result. No commentary. No explanations.";
  
  return `${systemContext}

USER INPUT:
${input}

USER INSTRUCTIONS:
${instructions || "Process this input according to the function's purpose."}

${outputInstruction}`;
}

async function callGrok(prompt: string): Promise<AIResponse> {
  const client = getXAIClient();
  const response = await client.chat.completions.create({
    model: "grok-3-mini-beta",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096
  });

  return {
    result: response.choices[0]?.message?.content || "No response generated.",
    model: "grok-3-mini-beta",
    provider: "xAI (Grok)"
  };
}

async function callAnthropic(prompt: string): Promise<AIResponse> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }]
  });

  const textContent = response.content.find(c => c.type === 'text');
  return {
    result: textContent?.text || "No response generated.",
    model: "claude-sonnet-4-20250514",
    provider: "Anthropic"
  };
}

async function callOpenAI(prompt: string): Promise<AIResponse> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096
  });

  return {
    result: response.choices[0]?.message?.content || "No response generated.",
    model: "gpt-4o",
    provider: "OpenAI"
  };
}

async function callDeepSeek(prompt: string): Promise<AIResponse> {
  const client = getDeepSeekClient();
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096
  });

  return {
    result: response.choices[0]?.message?.content || "No response generated.",
    model: "deepseek-chat",
    provider: "DeepSeek"
  };
}

export async function processWithAI(request: AIRequest): Promise<AIResponse> {
  const prompt = buildPrompt(request.functionName, request.input, request.instructions, request.explain || false);

  switch (request.model) {
    case "Zhi 1":
      return callGrok(prompt);
    case "Zhi 2":
      return callAnthropic(prompt);
    case "Zhi 3":
      return callOpenAI(prompt);
    case "Zhi 4":
      return callDeepSeek(prompt);
    default:
      return callGrok(prompt);
  }
}

export async function chatWithAI(message: string, model: LLMProvider, history: Array<{role: string, content: string}>): Promise<AIResponse> {
  const systemPrompt = `You are an expert in formal logic, axiomatic systems, and theory transformation. 
You help users analyze, transform, and understand formal theories and conceptual schemes.
Be precise, use formal notation when appropriate, and explain your reasoning clearly.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user" as const, content: message }
  ];

  switch (model) {
    case "Zhi 1": {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        temperature: 0.7,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "No response.",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
    case "Zhi 2": {
      const client = getAnthropicClient();
      const anthropicMessages = messages.filter(m => m.role !== "system").map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: anthropicMessages
      });
      const textContent = response.content.find(c => c.type === 'text');
      return {
        result: textContent?.text || "No response.",
        model: "claude-sonnet-4-20250514",
        provider: "Anthropic"
      };
    }
    case "Zhi 3": {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "No response.",
        model: "gpt-4o",
        provider: "OpenAI"
      };
    }
    case "Zhi 4": {
      const client = getDeepSeekClient();
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "No response.",
        model: "deepseek-chat",
        provider: "DeepSeek"
      };
    }
    default:
      return callGrok(message);
  }
}
