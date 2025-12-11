import { useState, useRef } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { type LLM } from "@/lib/api";
import { FunctionRow } from "@/components/function-row";
import { DualInputRow } from "@/components/dual-input-row";
import { PresetsSidebar, type Preset } from "@/components/presets-sidebar";
import generatedLogo from "@assets/generated_images/minimalist_geometric_logo_representing_logic_transformation.png";

interface FunctionInputs {
  [key: number]: { input: string; instructions: string; trigger: number };
}

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<LLM>("Zhi 1");
  const [functionInputs, setFunctionInputs] = useState<FunctionInputs>({});
  const functionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const functions = [
    { id: 1, title: "Axiom-Set / Theory Transformation (One Argument)", description: "Rewrite primitives and axioms.", dualInput: false },
    { id: 2, title: "Schema Equivalence (Two Arguments)", description: "Model-theoretic sameness check.", dualInput: false },
    { id: 3, title: "Definitional Equivalence (Two Arguments)", description: "Bi-directional definitional translation.", dualInput: false },
    { id: 4, title: "Model-Preserving Rewrite (One Argument)", description: "Rewrite theory preserving all models.", dualInput: false },
    { id: 5, title: "Conservative Extension Analysis (One Argument)", description: "Analyze extensions for conservativity.", dualInput: false },
    { id: 6, title: "Compare Conceptual Schemes (Two Arguments)", description: "Compare primitive/derived classifications.", dualInput: false },
    { id: 7, title: "Ontological Dependence (One Argument)", description: "Analyze primitive dependencies.", dualInput: false },
    { id: 8, title: "Generate Alternative Conceptualizations (One Argument)", description: "Produce alternative axiom-sets whose most natural interpretations are also interpretations of the input theory.", dualInput: false },
    { id: 9, title: "Interpret Canonical Meaning (One Argument)", description: "Identify intended interpretations of primitive symbols and restate the axioms using explicit, natural-language primitives.", dualInput: false },
    { id: 10, title: "Find an Interpretation (One Argument)", description: "Find a true model for the axiom system.", dualInput: false },
    { id: 11, title: "Determine Equivalence (Two Arguments)", description: "Compare two systems for theorem equivalence.", dualInput: true },
  ];

  const handleSelectPreset = (preset: Preset) => {
    setFunctionInputs(prev => ({
      ...prev,
      [preset.functionId]: { 
        input: prev[preset.functionId]?.input || preset.input, 
        instructions: preset.instructions,
        trigger: Date.now()
      }
    }));

    setTimeout(() => {
      const ref = functionRefs.current[preset.functionId];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 flex">
      {/* Left Sidebar - Presets */}
      <aside className="w-72 shrink-0 hidden lg:block h-screen sticky top-0 overflow-hidden">
        <PresetsSidebar onSelectPreset={handleSelectPreset} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center overflow-hidden">
                <img src={generatedLogo} alt="TT Logo" className="h-full w-full object-cover invert dark:invert-0" />
              </div>
              <h1 className="font-semibold tracking-tight text-lg">Theory Transformation App</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                SYSTEM ONLINE
              </div>
              <div className="text-xs font-mono text-muted-foreground border-l border-border pl-4">
                Engine: <span className="text-foreground font-medium">{selectedModel}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Main Functions Column */}
            <div className="xl:col-span-8 space-y-12">
              <div className="space-y-4 border-b border-border pb-8">
                <h2 className="text-3xl font-light tracking-tight text-foreground">Formal Analysis Functions</h2>
                <p className="text-muted-foreground text-lg font-light max-w-2xl leading-relaxed">
                  Transform, compare, and analyze axiomatic systems using advanced AI inference.
                  Select presets from the left or enter your own input.
                </p>
              </div>

              <div className="space-y-px bg-border rounded-sm overflow-hidden shadow-sm">
                {functions.map((f) => (
                  <div 
                    key={f.id} 
                    className="bg-card"
                    ref={(el) => { functionRefs.current[f.id] = el; }}
                  >
                    {f.dualInput ? (
                      <DualInputRow
                        id={f.id}
                        title={f.title}
                        description={f.description}
                        selectedModel={selectedModel}
                      />
                    ) : (
                      <FunctionRow
                        id={f.id}
                        title={f.title}
                        description={f.description}
                        selectedModel={selectedModel}
                        presetInput={functionInputs[f.id]?.input}
                        presetInstructions={functionInputs[f.id]?.instructions}
                        triggerRun={functionInputs[f.id]?.trigger}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Interface Column */}
            <div className="xl:col-span-4">
              <div className="sticky top-24 space-y-6">
                <ChatInterface 
                  selectedModel={selectedModel} 
                  onModelChange={setSelectedModel} 
                />
                
                <div className="p-5 rounded-sm bg-muted/30 border border-border text-xs text-muted-foreground font-mono leading-relaxed space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-2">
                    <span className="text-[10px] bg-primary text-primary-foreground px-1 py-0.5 rounded-[1px]">INFO</span>
                    AVAILABLE ENGINES
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => setSelectedModel("Zhi 1")}
                      className={`text-center p-2 rounded-sm transition-colors cursor-pointer font-bold ${selectedModel === "Zhi 1" ? "bg-primary/20 ring-1 ring-primary text-foreground" : "hover:bg-muted/50 text-foreground"}`}
                      data-testid="button-select-zhi-1"
                    >
                      ZHI 1
                    </button>
                    <button 
                      onClick={() => setSelectedModel("Zhi 2")}
                      className={`text-center p-2 rounded-sm transition-colors cursor-pointer font-bold ${selectedModel === "Zhi 2" ? "bg-primary/20 ring-1 ring-primary text-foreground" : "hover:bg-muted/50 text-foreground"}`}
                      data-testid="button-select-zhi-2"
                    >
                      ZHI 2
                    </button>
                    <button 
                      onClick={() => setSelectedModel("Zhi 3")}
                      className={`text-center p-2 rounded-sm transition-colors cursor-pointer font-bold ${selectedModel === "Zhi 3" ? "bg-primary/20 ring-1 ring-primary text-foreground" : "hover:bg-muted/50 text-foreground"}`}
                      data-testid="button-select-zhi-3"
                    >
                      ZHI 3
                    </button>
                    <button 
                      onClick={() => setSelectedModel("Zhi 4")}
                      className={`text-center p-2 rounded-sm transition-colors cursor-pointer font-bold ${selectedModel === "Zhi 4" ? "bg-primary/20 ring-1 ring-primary text-foreground" : "hover:bg-muted/50 text-foreground"}`}
                      data-testid="button-select-zhi-4"
                    >
                      ZHI 4
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
