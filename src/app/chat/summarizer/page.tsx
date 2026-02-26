"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Copy,
  Download,
  List,
  AlignLeft,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SummarySection {
  heading: string
  content: string
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
]

export default function SummarizerPage() {
  const [generated, setGenerated] = useState(false)
  const [customInput, setCustomInput] = useState("")
  const [textInput, setTextInput] = useState("")
  const [summaryStyle, setSummaryStyle] = useState("structured")

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge variant="secondary" className="gap-1">
            <FileText className="size-3" />
            Summarizer
          </Badge>
        </div>
        {generated && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" aria-label="Copy summary">
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" aria-label="Download summary">
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {!generated ? (
            /* Setup */
            <div className="flex flex-col items-center pt-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Summarize Your Text
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Paste or type the text you want to summarize, choose a format, and generate a structured summary.
              </p>

              <div className="mt-8 grid w-full max-w-sm gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Text to Summarize</label>
                  <Textarea
                    placeholder="Paste your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-40 resize-none"
                    rows={6}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Summary Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSummaryStyle("structured")}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                        summaryStyle === "structured"
                          ? "border-foreground/20 bg-muted/50 text-foreground"
                          : "text-muted-foreground hover:border-foreground/10"
                      )}
                    >
                      <List className="size-4" />
                      Structured
                    </button>
                    <button
                      onClick={() => setSummaryStyle("paragraph")}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                        summaryStyle === "paragraph"
                          ? "border-foreground/20 bg-muted/50 text-foreground"
                          : "text-muted-foreground hover:border-foreground/10"
                      )}
                    >
                      <AlignLeft className="size-4" />
                      Paragraph
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Focus Area
                    <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="e.g., Focus on key definitions and main concepts..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="min-h-20 resize-none"
                    rows={3}
                  />
                </div>

                <Button className="mt-2" onClick={() => setGenerated(true)} disabled={!textInput.trim()}>
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
                <h2 className="text-lg font-semibold text-foreground">
                  Photosynthesis Summary
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                {mockSummary.map((section, i) => (
                  <div key={i} className="rounded-xl border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {section.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => { setGenerated(false); setTextInput(""); setCustomInput(""); }}>
                  Generate New Summary
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
