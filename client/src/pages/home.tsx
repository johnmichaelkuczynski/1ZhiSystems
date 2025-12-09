import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { type LLM } from "@/lib/mock-ai";
import { FunctionRow } from "@/components/function-row";
import generatedLogo from "@assets/generated_images/minimalist_geometric_logo_representing_logic_transformation.png";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<LLM>("Zhi 1");

  const functions = [
    { id: 1, title: "Axiom-Set / Theory Transformation", description: "Rewrite primitives and axioms." },
    { id: 2, title: "Schema Equivalence", description: "Model-theoretic sameness check." },
    { id: 3, title: "Definitional Equivalence", description: "Bi-directional definitional translation." },
    { id: 4, title: "Model Finding & Counter-Examples", description: "Find models satisfying constraints." },
    { id: 5, title: "Consistency Check", description: "Verify internal consistency of axioms." },
    { id: 6, title: "Independence Proofs", description: "Prove axiom independence." },
    { id: 7, title: "Completeness Analysis", description: "Analyze theory completeness." },
    { id: 8, title: "Ontological Reduction", description: "Reduce ontological commitments." },
    { id: 9, title: "Theorem Derivation", description: "Derive theorems from axioms." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Logo added */}
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

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Functions Column */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4 border-b border-border pb-8">
              <h2 className="text-3xl font-light tracking-tight text-foreground">Formal Analysis Functions</h2>
              <p className="text-muted-foreground text-lg font-light max-w-2xl leading-relaxed">
                Transform, compare, and analyze axiomatic systems using advanced AI inference.
                Select your preferred reasoning engine from the chat interface.
              </p>
            </div>

            <div className="space-y-px bg-border rounded-sm overflow-hidden shadow-sm">
              {functions.map((f) => (
                <div key={f.id} className="bg-card">
                   <FunctionRow
                    id={f.id}
                    title={f.title}
                    description={f.description}
                    selectedModel={selectedModel}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface Column */}
          <div className="lg:col-span-4">
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
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground">ZHI 1</span>
                        <span className="opacity-70">Grok</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground">ZHI 2</span>
                        <span className="opacity-70">Anthropic</span>
                    </div>
                     <div className="flex flex-col">
                        <span className="font-bold text-foreground">ZHI 3</span>
                        <span className="opacity-70">OpenAI</span>
                    </div>
                     <div className="flex flex-col">
                        <span className="font-bold text-foreground">ZHI 4</span>
                        <span className="opacity-70">DeepSeek</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
