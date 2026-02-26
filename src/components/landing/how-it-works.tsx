import { Cpu, GraduationCap, Upload } from "lucide-react";

const steps = [
	{
		icon: Upload,
		step: "01",
		title: "Upload Materials",
		description:
			"Upload your syllabi, lecture notes, textbooks, and any course documents. We support PDF, DOCX, and plain text.",
	},
	{
		icon: Cpu,
		step: "02",
		title: "AI Processing",
		description:
			"Our pipeline chunks, embeds, and indexes your documents for high-precision retrieval-augmented generation.",
	},
	{
		icon: GraduationCap,
		step: "03",
		title: "Start Learning",
		description:
			"Chat with your materials, generate quizzes, create flashcards, and summarize content. All grounded in your curriculum.",
	},
];

export function HowItWorks() {
	return (
		<section className="py-24" id="how-it-works">
			<div className="mx-auto max-w-7xl px-6">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
						Get started in three steps
					</h2>
					<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
						From document upload to AI-powered study in minutes.
					</p>
				</div>

				<div className="mt-16 grid gap-8 lg:grid-cols-3">
					{steps.map((step) => (
						<div
							className="relative flex flex-col items-center text-center"
							key={step.step}
						>
							<span className="font-medium font-mono text-muted-foreground text-sm">
								{step.step}
							</span>
							<div className="mt-3 flex size-14 items-center justify-center rounded-2xl border bg-card">
								<step.icon className="size-6 text-foreground" />
							</div>
							<h3 className="mt-4 font-semibold text-foreground text-lg">
								{step.title}
							</h3>
							<p className="mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
