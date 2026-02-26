import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section className="relative overflow-hidden">
			<div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-24 text-center lg:pt-32">
				<Badge
					className="mb-6 gap-1.5 px-3 py-1.5 font-normal text-sm"
					variant="secondary"
				>
					<Sparkles className="size-3.5" />
					AI-Powered Education Platform
				</Badge>

				<h1 className="max-w-4xl text-balance font-semibold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
					Learn smarter with curriculum-aware AI
				</h1>

				<p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
					Upload your course materials and let AI transform them into
					personalized study tools. Generate quizzes, flashcards, and summaries
					grounded in your actual curriculum.
				</p>

				<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
					<Button asChild size="lg">
						<Link href="/signup">
							Start Learning Free
							<ArrowRight className="size-4" />
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link href="#features">See How It Works</Link>
					</Button>
				</div>

				<div className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-8">
					<div className="flex flex-col items-center">
						<span className="font-semibold text-3xl text-foreground">98%</span>
						<span className="mt-1 text-muted-foreground text-sm">
							Accuracy Rate
						</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="font-semibold text-3xl text-foreground">50k+</span>
						<span className="mt-1 text-muted-foreground text-sm">Students</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="font-semibold text-3xl text-foreground">2x</span>
						<span className="mt-1 text-muted-foreground text-sm">
							Faster Learning
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
