import { redirect } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { auth } from "@/server/auth";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
