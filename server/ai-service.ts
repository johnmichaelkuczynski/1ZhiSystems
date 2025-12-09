import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type LLMProvider = "Zhi 1" | "Zhi 2" | "Zhi 3" | "Zhi 4";

const FUNCTION_PROMPTS: Record<string, { concise: string; explain: string }> = {
  "Axiom-Set / Theory Transformation": {
    concise: `You are an expert formal logic transformation engine. RADICALLY RESTRUCTURE axiomatic theories using different primitives.

TASK: Take an axiomatic theory and user instructions, produce a NEW logically equivalent theory using ONLY the primitives specified by the user. Eliminated primitives must be 100% gone.

RULES:
1. Eliminated primitives must vanish completely - not in axioms, not in definitions, nowhere
2. Output ONLY new primitives and new axioms using ONLY those primitives
3. Do NOT add a Definitions section referencing eliminated primitives
4. Do NOT explain or comment
5. NEVER claim impossibility without rigorous proof - most transformations ARE possible

OUTPUT FORMAT:
NEW PRIMITIVE:
  [name and signature]

REWRITTEN AXIOMS:
1. [axiom using only new primitives]
2. [axiom using only new primitives]
...`,
    explain: `You are a formal logic expert specializing in axiomatic systems transformation.

Transform the theory by RADICALLY RESTRUCTURING according to user instructions:
- Eliminate specified primitives completely (no traces anywhere)
- Introduce new primitives as specified  
- Produce equivalent axioms using ONLY the new primitives
- NEVER claim impossibility without rigorous proof

Provide:
1. The transformed theory (new primitives + rewritten axioms)
2. Brief explanation of how the new axioms capture the original theory's content
3. Note if anything is lost in the transformation`
  },

  "Schema Equivalence": {
    concise: `You are a model-theoretic schema equivalence analyzer. You determine whether two axiomatic theories/schemas have the same expressive power.

DEFINITION: Two schemas S1 and S2 are EQUIVALENT iff:
- Every model of S1 can be converted to a model of S2 (and vice versa)
- The theories prove the same sentences (up to translation)

YOUR TASK:
Given two schemas, determine if they are equivalent and provide the witnessing translation.

OUTPUT FORMAT:
VERDICT: [EQUIVALENT or NOT EQUIVALENT]

[If EQUIVALENT:]
TRANSLATION S1 → S2:
  [primitive1] ↦ [definition in S2 primitives]
  [primitive2] ↦ [definition in S2 primitives]

TRANSLATION S2 → S1:
  [primitive1] ↦ [definition in S1 primitives]

[If NOT EQUIVALENT:]
OBSTRUCTION: [What S1 can express that S2 cannot, or vice versa]
SEPARATING MODEL: [A model that witnesses the difference]

RULES:
- Be precise with the translations
- Show both directions for equivalence
- For non-equivalence, provide a concrete obstruction`,
    explain: `You are a model-theoretic expert. Check schema equivalence with full analysis.

Provide:
1. VERDICT (EQUIVALENT or NOT EQUIVALENT)
2. Complete bi-directional translations if equivalent
3. Detailed obstruction and separating model if not equivalent
4. Explanation of the model-theoretic reasoning`
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
  // Pure passthrough - just send user input and instructions directly to LLM
  let prompt = input;
  
  if (instructions && instructions.trim()) {
    prompt += `\n\n${instructions}`;
  }
  
  if (!explain) {
    prompt += `\n\nOutput only the result. No commentary.`;
  }
  
  return prompt;
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
