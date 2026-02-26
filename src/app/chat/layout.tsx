import { ChatSidebar } from "@/components/chat/chat-sidebar";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<ChatSidebar />
			<main className="relative flex flex-1 flex-col overflow-hidden">
				{children}
			</main>
		</div>
	);
}
