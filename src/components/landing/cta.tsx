import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
	return (
		<section className="border-t bg-primary py-24">
			<div className="mx-auto max-w-7xl px-6 text-center">
				<h2 className="font-semibold text-3xl text-primary-foreground tracking-tight sm:text-4xl">
					Ready to transform how you study?
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/70 leading-relaxed">
					Join thousands of students already using AI-powered learning tools to
					study smarter and retain more.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button asChild size="lg" variant="secondary">
						<Link href="/signup">
							Get Started Free
							<ArrowRight className="size-4" />
						</Link>
					</Button>
					<Button
						asChild
						className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
						size="lg"
						variant="outline"
					>
						<Link href="/signin">Sign In</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
