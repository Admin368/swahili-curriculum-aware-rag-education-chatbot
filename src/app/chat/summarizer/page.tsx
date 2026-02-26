"use client";

import {
  AlignLeft,
  Copy,
  Download,
  FileText,
  List,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SummarySection {
  heading: string;
  content: string;
}

const mockSummary: SummarySection[] = [
  {
    heading: "Overview",
    content:
      "Photosynthesis is the biological process by which light energy is converted into chemical energy, storing it as glucose. This process is critical for life on Earth, providing both oxygen and the organic compounds that form the base of most food chains.",
  },
  {
    heading: "Light-Dependent Reactions",
    content:
      "These reactions occur in the thylakoid membranes and require direct light input. Water molecules are split (photolysis), releasing O2 as a byproduct. The energy from light drives the electron transport chain, generating ATP via chemiosmosis and reducing NADP+ to NADPH. Photosystem II (P680) and Photosystem I (P700) work in series to transfer electrons.",
  },
  {
    heading: "Calvin Cycle (Light-Independent Reactions)",
    content:
      "Taking place in the stroma, the Calvin Cycle uses ATP and NADPH from the light reactions to fix CO2 into organic molecules. The enzyme RuBisCO catalyzes the first step, combining CO2 with ribulose bisphosphate (RuBP). Through a series of reductions and regeneration steps, the cycle produces glyceraldehyde-3-phosphate (G3P), which can be used to synthesize glucose.",
  },
  {
    heading: "Key Relationships",
    content:
      "Photosynthesis and cellular respiration are complementary processes. The products of photosynthesis (glucose and O2) serve as reactants for cellular respiration, which produces CO2 and H2O - the reactants for photosynthesis. This creates a closed metabolic loop essential for ecosystem energy balance.",
  },
  {
    heading: "Key Terms",
    content:
      "Chlorophyll: Primary photosynthetic pigment. Stroma: Fluid interior of the chloroplast. Thylakoid: Membrane-bound compartments inside chloroplasts. RuBisCO: Enzyme that fixes CO2. Chemiosmosis: ATP production driven by H+ gradient. Photophosphorylation: Light-driven ATP synthesis.",
  },
];

export default function SummarizerPage() {
  const [generated, setGenerated] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [summaryStyle, setSummaryStyle] = useState("structured");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge className="gap-1" variant="secondary">
            <FileText className="size-3" />
            Summarizer
          </Badge>
        </div>
        {generated && (
          <div className="flex items-center gap-2">
            <Button
              aria-label="Copy summary"
              className="gap-1.5 text-xs"
              size="sm"
              variant="ghost"
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button
              aria-label="Download summary"
              className="gap-1.5 text-xs"
              size="sm"
              variant="ghost"
            >
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {!generated ? (
            /* Setup */
            <div className="flex flex-col items-center pt-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground text-xl">
                Summarize Your Text
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground text-sm">
                Paste or type the text you want to summarize, choose a format,
                and generate a structured summary.
              </p>

              <div className="mt-8 grid w-full gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Text to Summarize
                  </label>
                  <Textarea
                    className="min-h-40 max-h-[50vh] resize-y"
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your text here..."
                    rows={8}
                    value={textInput}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Summary Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                        summaryStyle === "structured"
                          ? "border-foreground/20 bg-muted/50 text-foreground"
                          : "text-muted-foreground hover:border-foreground/10",
                      )}
                      onClick={() => setSummaryStyle("structured")}
                    >
                      <List className="size-4" />
                      Structured
                    </button>
                    <button
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                        summaryStyle === "paragraph"
                          ? "border-foreground/20 bg-muted/50 text-foreground"
                          : "text-muted-foreground hover:border-foreground/10",
                      )}
                      onClick={() => setSummaryStyle("paragraph")}
                    >
                      <AlignLeft className="size-4" />
                      Paragraph
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Focus Area
                    <span className="ml-1 font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    className="min-h-20 resize-none"
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g., Focus on key definitions and main concepts..."
                    rows={3}
                    value={customInput}
                  />
                </div>

                <Button
                  className="mt-2"
                  disabled={!textInput.trim()}
                  onClick={() => setGenerated(true)}
                >
                  <Sparkles className="size-4" />
                  Generate Summary
                </Button>
              </div>
            </div>
          ) : (
            /* Summary Output */
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground text-lg">
                  Photosynthesis Summary
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                {mockSummary.map((section, i) => (
                  <div className="rounded-xl border bg-card p-5" key={i}>
                    <h3 className="font-semibold text-foreground text-sm">
                      {section.heading}
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    setGenerated(false);
                    setTextInput("");
                    setCustomInput("");
                  }}
                  variant="outline"
                >
                  Generate New Summary
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
