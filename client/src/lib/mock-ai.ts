export type LLM = "Zhi 1" | "Zhi 2" | "Zhi 3" | "Zhi 4";

export interface ProcessingResponse {
  result: string;
  notes?: string;
  mapping?: string;
}

// Mock AI latency and response generation
export async function mockProcess(
  input: string,
  instructions: string,
  functionName: string,
  model: LLM
): Promise<ProcessingResponse> {
  // Simulate variable latency based on model "complexity"
  const latency = Math.floor(Math.random() * 1000) + 1000;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockResponse(input, instructions, functionName, model));
    }, latency);
  });
}

function generateMockResponse(
  input: string,
  instructions: string,
  functionName: string,
  model: LLM
): ProcessingResponse {
  const modelNameMap = {
    "Zhi 1": "Grok",
    "Zhi 2": "Anthropic",
    "Zhi 3": "OpenAI",
    "Zhi 4": "DeepSeek"
  };

  const actualModel = modelNameMap[model];

  // Distinctive styles for each model
  const signatures = {
    "Zhi 1": (text: string) => `// GROK MODE: ACTIVATED 🚀\n// Direct, witty, and unfiltered analysis.\n\n${text}\n\n// End of transmission.`,
    "Zhi 2": (text: string) => `--- CLAUDE/ANTHROPIC ANALYSIS ---\n\nHere is a detailed breakdown of the transformation:\n\n${text}\n\nThis concludes the formal analysis.`,
    "Zhi 3": (text: string) => `/* OpenAI GPT-4o Engine */\n/* Status: Optimal */\n\n${text}`,
    "Zhi 4": (text: string) => `>>> DEEPSEEK_R1_DISTILL\n>>> THOUGHT_TRACE_INITIATED...\n>>> PATTERN_MATCHED: ${functionName.toUpperCase().replace(/ /g, '_')}\n\n${text}\n\n>>> COMPUTATION_COMPLETE`
  };

  const format = signatures[model];

  if (functionName.includes("Transformation")) {
    const coreContent = `NEW PRIMITIVE:\n Line(x, y)\n\nREWRITTEN AXIOMS:\n1. ∀x∀y [Line(x, y) → x ≠ y]\n2. ∀x∀y∀z [Line(x, y) ∧ Line(y, z) → Line(x, z)]\n3. ∀x∀y [x ≠ y → ∃z (Line(x, z) ∧ Line(z, y))]`;
    
    return {
      result: format(coreContent),
      notes: model === "Zhi 4" 
        ? "DeepSeek Optimization: Axiom set reduced by 14% redundant predicates." 
        : "Transformation complete. Metric-free properties preserved."
    };
  }

  if (functionName.includes("Schema Equivalence")) {
    return {
      result: format(`RESULT: EQUIVALENT UP TO DEFINITIONS\n\nMAPPING:\nParent(x, y) ≈ Ancestor(x, y)`),
      mapping: "Parent(x, y) ≈ Ancestor(x, y)",
      notes: "Schema B is a conservative extension of Schema A."
    };
  }

  return {
    result: format(`Function: ${functionName}\n\nAnalyzing input:\n${input.substring(0, 50)}...\n\nResult:\nAnalysis complete. The logical structure holds under the specified constraints.`),
    notes: `Processed using ${actualModel} inference engine.`
  };
}
