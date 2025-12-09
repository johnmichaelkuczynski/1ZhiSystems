import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type LLMProvider = "Zhi 1" | "Zhi 2" | "Zhi 3" | "Zhi 4";

const FUNCTION_PROMPTS: Record<string, string> = {
  "Axiom-Set / Theory Transformation": `You are a formal logic expert specializing in axiomatic systems transformation.
Your task is to take a user's theory (formal axioms OR plain text) and rewrite it according to their instructions.
You can: change primitives, eliminate primitives, introduce new primitives, restructure axioms, invert the conceptual scheme, produce equivalent theories, or explain why a transformation is impossible.
Always provide the new primitives, rewritten axioms, and notes explaining your reasoning.`,

  "Schema Equivalence": `You are a model-theoretic analysis expert.
Your task is to check whether two formal systems or representations are schema-equivalent - whether they define the same class of models despite different primitives or syntax.
Determine if they are equivalent, explain differences if not, and show mappings between primitives if equivalence exists.`,

  "Definitional Equivalence": `You are a formal logic expert specializing in definitional equivalence.
Two theories are definitionally equivalent when each can fully define the vocabulary of the other with no loss of information.
Check if each theory can define the other's primitives. If yes, return bi-directional definitions. If no, explain the failure.`,

  "Model Finding & Counter-Examples": `You are a model-theoretic expert.
Your task is to find models that satisfy given constraints, or find counter-examples that disprove claims.
Provide concrete models with explicit interpretations of all primitives.`,

  "Consistency Check": `You are a formal logic expert.
Your task is to verify the internal consistency of an axiom set.
Check for contradictions, analyze logical dependencies, and report whether the system is consistent or identify specific inconsistencies.`,

  "Independence Proofs": `You are a formal logic expert specializing in independence proofs.
Your task is to prove whether a given axiom is independent from others (cannot be derived from them).
Construct models that satisfy all other axioms but not the target axiom.`,

  "Completeness Analysis": `You are a formal logic expert.
Analyze whether a theory is complete - whether for every sentence in its language, either it or its negation is provable.
Identify gaps, undecidable propositions, or confirm completeness with reasoning.`,

  "Ontological Reduction": `You are a philosophical logic expert.
Your task is to reduce ontological commitments of a theory - showing how to express the same content with fewer primitive kinds of entities.
Provide the reduced theory and explain what ontological commitments have been eliminated.`,

  "Theorem Derivation": `You are a formal logic expert.
Derive theorems from given axioms. Show step-by-step logical derivations with justifications for each step.
Use formal proof notation where appropriate.`
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
}

export interface AIResponse {
  result: string;
  model: string;
  provider: string;
}

function buildPrompt(functionName: string, input: string, instructions: string): string {
  const systemContext = FUNCTION_PROMPTS[functionName] || FUNCTION_PROMPTS["Axiom-Set / Theory Transformation"];
  
  return `${systemContext}

USER INPUT:
${input}

USER INSTRUCTIONS:
${instructions || "Process this input according to the function's purpose."}

Provide a clear, structured response with the analysis results.`;
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
  const prompt = buildPrompt(request.functionName, request.input, request.instructions);

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
