"use client";

import {
	BookOpen,
	FileText,
	FlaskConical,
	FolderOpen,
	Layers,
	LogOut,
	Menu,
	MessageSquare,
	MoreHorizontal,
	PanelLeftClose,
	PanelLeftOpen,
	Pencil,
	Plus,
	Settings,
	Trash2,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/chat", label: "General Chat", icon: MessageSquare },
	{ href: "/chat/quiz", label: "Quiz Mode", icon: FlaskConical },
	{ href: "/chat/flashcards", label: "Flashcards", icon: Layers },
	{ href: "/chat/summarizer", label: "Summarizer", icon: FileText },
];

const mockHistory = [
	{ id: "1", title: "Photosynthesis overview", date: "Today" },
	{ id: "2", title: "Cell membrane transport", date: "Today" },
	{ id: "3", title: "Organic chemistry reactions", date: "Yesterday" },
	{ id: "4", title: "Linear algebra eigenvalues", date: "Yesterday" },
	{ id: "5", title: "French Revolution causes", date: "This week" },
	{ id: "6", title: "Thermodynamics basics", date: "This week" },
];

function SidebarContent({
	collapsed,
	setCollapsed,
}: {
	collapsed: boolean;
	setCollapsed: (v: boolean) => void;
}) {
	const pathname = usePathname();

	return (
		<div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
			{/* Header */}
			<div className="flex h-16 shrink-0 items-center justify-between px-4">
				{!collapsed && (
					<Link className="flex items-center gap-2" href="/">
						<div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary">
							<BookOpen className="size-3.5 text-sidebar-primary-foreground" />
						</div>
						<span className="font-semibold text-sm">Swahili Chat</span>
					</Link>
				)}
				{collapsed && (
					<Link className="mx-auto flex items-center justify-center" href="/">
						<div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary">
							<BookOpen className="size-3.5 text-sidebar-primary-foreground" />
						</div>
					</Link>
				)}
				{!collapsed && (
					<Button
						aria-label="Collapse sidebar"
						className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
						onClick={() => setCollapsed(true)}
						size="icon-sm"
						variant="ghost"
					>
						<PanelLeftClose className="size-4" />
					</Button>
				)}
			</div>

			{/* New chat button */}
			<div className="px-3">
				{collapsed ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								asChild
								className="mx-auto flex w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
								size="icon-sm"
							>
								<Link href="/chat">
									<Plus className="size-4" />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">New Chat</TooltipContent>
					</Tooltip>
				) : (
					<Button
						asChild
						className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
						size="sm"
					>
						<Link href="/chat">
							<Plus className="size-4" />
							New Chat
						</Link>
					</Button>
				)}
			</div>

			{/* Navigation */}
			<div className="mt-4 px-3">
				{!collapsed && (
					<span className="mb-2 block px-2 font-medium text-sidebar-foreground/40 text-xs uppercase tracking-wider">
						Modes
					</span>
				)}
				<nav className="flex flex-col gap-1">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return collapsed ? (
							<Tooltip key={item.href}>
								<TooltipTrigger asChild>
									<Link
										className={cn(
											"mx-auto flex size-8 items-center justify-center rounded-md transition-colors",
											isActive
												? "bg-sidebar-accent text-sidebar-primary"
												: "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
										)}
										href={item.href}
									>
										<item.icon className="size-4" />
									</Link>
								</TooltipTrigger>
								<TooltipContent side="right">{item.label}</TooltipContent>
							</Tooltip>
						) : (
							<Link
								className={cn(
									"flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
									isActive
										? "bg-sidebar-accent font-medium text-sidebar-primary"
										: "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
								)}
								href={item.href}
								key={item.href}
							>
								<item.icon className="size-4 shrink-0" />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>

			<Separator className="mx-3 my-4 bg-sidebar-border" />

			{/* Extra nav */}
			<div className="px-3">
				{!collapsed && (
					<span className="mb-2 block px-2 font-medium text-sidebar-foreground/40 text-xs uppercase tracking-wider">
						Manage
					</span>
				)}
				<nav className="flex flex-col gap-1">
					{collapsed ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									className={cn(
										"mx-auto flex size-8 items-center justify-center rounded-md transition-colors",
										pathname === "/chat/documents"
											? "bg-sidebar-accent text-sidebar-primary"
											: "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
									)}
									href="/chat/documents"
								>
									<FolderOpen className="size-4" />
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right">Documents</TooltipContent>
						</Tooltip>
					) : (
						<Link
							className={cn(
								"flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
								pathname === "/chat/documents"
									? "bg-sidebar-accent font-medium text-sidebar-primary"
									: "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
							)}
							href="/chat/documents"
						>
							<FolderOpen className="size-4 shrink-0" />
							Documents
						</Link>
					)}
				</nav>
			</div>

			<Separator className="mx-3 my-4 bg-sidebar-border" />

			{/* Chat History */}
			{!collapsed && (
				<div className="flex min-h-0 flex-1 flex-col px-3">
					<span className="mb-2 block px-2 font-medium text-sidebar-foreground/40 text-xs uppercase tracking-wider">
						Recent Chats
					</span>
					<ScrollArea className="flex-1">
						<div className="flex flex-col gap-0.5">
							{mockHistory.map((chat) => (
								<div
									className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sidebar-foreground/60 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
									key={chat.id}
								>
									<span className="truncate">{chat.title}</span>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												aria-label="Chat options"
												className="invisible size-6 shrink-0 text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground group-hover:visible"
												size="icon-sm"
												variant="ghost"
											>
												<MoreHorizontal className="size-3.5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-36">
											<DropdownMenuItem>
												<Pencil className="size-3.5" />
												Rename
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-destructive">
												<Trash2 className="size-3.5" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							))}
						</div>
					</ScrollArea>
				</div>
			)}

			{collapsed && <div className="flex-1" />}

			{/* User menu */}
			<div className="shrink-0 border-sidebar-border border-t p-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className={cn(
								"w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent",
								collapsed && "justify-center px-0",
							)}
							variant="ghost"
						>
							<Avatar className="size-7">
								<AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
									JD
								</AvatarFallback>
							</Avatar>
							{!collapsed && (
								<div className="flex flex-col items-start text-left">
									<span className="font-medium text-xs">Jane Doe</span>
									<span className="text-sidebar-foreground/50 text-xs">
										jane@uni.edu
									</span>
								</div>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align={collapsed ? "center" : "end"}
						className="w-48"
						side="top"
					>
						<DropdownMenuItem asChild>
							<Link href="/chat/account">
								<User className="size-3.5" />
								My Account
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Settings className="size-3.5" />
							Settings
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/">
								<LogOut className="size-3.5" />
								Sign Out
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export function ChatSidebar() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<>
			{/* Desktop sidebar */}
			<aside
				className={cn(
					"hidden h-screen shrink-0 border-sidebar-border border-r transition-all duration-300 md:block",
					collapsed ? "w-16" : "w-64",
				)}
			>
				<SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
				{collapsed && (
					<Button
						aria-label="Expand sidebar"
						className="absolute top-4 left-4 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
						onClick={() => setCollapsed(false)}
						size="icon-sm"
						variant="ghost"
					>
						<PanelLeftOpen className="size-4" />
					</Button>
				)}
			</aside>

			{/* Mobile sidebar */}
			<Sheet>
				<SheetTrigger asChild>
					<Button
						aria-label="Open sidebar"
						className="fixed top-4 left-4 z-40 md:hidden"
						size="icon"
						variant="ghost"
					>
						<Menu className="size-5" />
					</Button>
				</SheetTrigger>
				<SheetContent className="w-72 p-0" side="left">
					<SheetHeader className="sr-only">
						<SheetTitle>Navigation</SheetTitle>
					</SheetHeader>
					<SidebarContent collapsed={false} setCollapsed={() => {}} />
				</SheetContent>
			</Sheet>
		</>
	);
}
