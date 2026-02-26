"use client";

import {
	Bell,
	GraduationCap,
	// Mail,
	Palette,
	Save,
	Shield,
	User,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const tabs = [
	{ id: "profile", label: "Profile", icon: User },
	{ id: "preferences", label: "Preferences", icon: Palette },
	{ id: "notifications", label: "Notifications", icon: Bell },
	{ id: "security", label: "Security", icon: Shield },
];

export default function AccountPage() {
	const [activeTab, setActiveTab] = useState("profile");
	const [name, setName] = useState("Jane Doe");
	const [email, setEmail] = useState("jane@university.edu");
	const [institution, setInstitution] = useState("State University");
	const [major, setMajor] = useState("Biology");

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<header className="flex h-14 shrink-0 items-center border-b px-6">
				<div className="flex items-center gap-2 pl-10 md:pl-0">
					<Badge className="gap-1" variant="secondary">
						<User className="size-3" />
						My Account
					</Badge>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<div className="mx-auto max-w-3xl px-6 py-8">
					{/* Profile header */}
					<div className="flex items-center gap-4">
						<Avatar className="size-16">
							<AvatarFallback className="bg-primary text-lg text-primary-foreground">
								JD
							</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Jane Doe
							</h2>
							<p className="text-muted-foreground text-sm">
								jane@university.edu
							</p>
							<div className="mt-1 flex items-center gap-2">
								<Badge className="gap-1 text-xs" variant="secondary">
									<GraduationCap className="size-3" />
									Student
								</Badge>
								<Badge className="text-xs" variant="outline">
									Free Plan
								</Badge>
							</div>
						</div>
					</div>

					{/* Tab navigation */}
					<div className="mt-8 flex gap-1 border-b">
						{tabs.map((tab) => (
							<button
								className={cn(
									"flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors",
									activeTab === tab.id
										? "border-foreground font-medium text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground",
								)}
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								type="button"
							>
								<tab.icon className="size-4" />
								{tab.label}
							</button>
						))}
					</div>

					{/* Tab content */}
					<div className="mt-6">
						{activeTab === "profile" && (
							<div className="flex flex-col gap-6">
								<div>
									<h3 className="font-semibold text-base text-foreground">
										Personal Information
									</h3>
									<p className="text-muted-foreground text-sm">
										Update your profile details.
									</p>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="flex flex-col gap-2">
										<Label htmlFor="acc-name">Full Name</Label>
										<Input
											id="acc-name"
											onChange={(e) => setName(e.target.value)}
											value={name}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="acc-email">Email</Label>
										<Input
											id="acc-email"
											onChange={(e) => setEmail(e.target.value)}
											type="email"
											value={email}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="acc-institution">Institution</Label>
										<Input
											id="acc-institution"
											onChange={(e) => setInstitution(e.target.value)}
											value={institution}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="acc-major">Major / Field</Label>
										<Input
											id="acc-major"
											onChange={(e) => setMajor(e.target.value)}
											value={major}
										/>
									</div>
								</div>

								<Separator />

								<div>
									<h3 className="font-semibold text-base text-foreground">
										Academic Level
									</h3>
									<p className="mb-3 text-muted-foreground text-sm">
										This helps the AI tailor responses to your level.
									</p>
									<Select defaultValue="undergraduate">
										<SelectTrigger className="w-48">
											<SelectValue placeholder="Select level" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="high-school">High School</SelectItem>
											<SelectItem value="undergraduate">
												Undergraduate
											</SelectItem>
											<SelectItem value="graduate">Graduate</SelectItem>
											<SelectItem value="doctoral">Doctoral</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex justify-end">
									<Button>
										<Save className="size-4" />
										Save Changes
									</Button>
								</div>
							</div>
						)}

						{activeTab === "preferences" && (
							<div className="flex flex-col gap-6">
								<div>
									<h3 className="font-semibold text-base text-foreground">
										Learning Preferences
									</h3>
									<p className="text-muted-foreground text-sm">
										Customize your learning experience.
									</p>
								</div>

								<div className="flex flex-col gap-4">
									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Show source references
											</p>
											<p className="text-muted-foreground text-xs">
												Display document references in chat responses
											</p>
										</div>
										<Switch defaultChecked />
									</div>

									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Detailed explanations
											</p>
											<p className="text-muted-foreground text-xs">
												Provide more thorough explanations by default
											</p>
										</div>
										<Switch defaultChecked />
									</div>

									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Auto-generate flashcards
											</p>
											<p className="text-muted-foreground text-xs">
												Create flashcards automatically after each chat session
											</p>
										</div>
										<Switch />
									</div>

									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Quiz difficulty adaptation
											</p>
											<p className="text-muted-foreground text-xs">
												Automatically adjust quiz difficulty based on
												performance
											</p>
										</div>
										<Switch defaultChecked />
									</div>
								</div>

								<Separator />

								<div>
									<h3 className="font-semibold text-base text-foreground">
										Response Language
									</h3>
									<p className="mb-3 text-muted-foreground text-sm">
										Choose the language for AI responses.
									</p>
									<Select defaultValue="en">
										<SelectTrigger className="w-48">
											<SelectValue placeholder="Select language" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="en">English</SelectItem>
											<SelectItem value="es">Spanish</SelectItem>
											<SelectItem value="fr">French</SelectItem>
											<SelectItem value="de">German</SelectItem>
											<SelectItem value="zh">Chinese</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex justify-end">
									<Button>
										<Save className="size-4" />
										Save Preferences
									</Button>
								</div>
							</div>
						)}

						{activeTab === "notifications" && (
							<div className="flex flex-col gap-6">
								<div>
									<h3 className="font-semibold text-base text-foreground">
										Notification Settings
									</h3>
									<p className="text-muted-foreground text-sm">
										Manage how you receive notifications.
									</p>
								</div>

								<div className="flex flex-col gap-4">
									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Email digests
											</p>
											<p className="text-muted-foreground text-xs">
												Weekly summary of your study progress
											</p>
										</div>
										<Switch defaultChecked />
									</div>

									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Document processing alerts
											</p>
											<p className="text-muted-foreground text-xs">
												Notify when documents finish indexing
											</p>
										</div>
										<Switch defaultChecked />
									</div>

									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Study reminders
											</p>
											<p className="text-muted-foreground text-xs">
												Daily reminders to review flashcards
											</p>
										</div>
										<Switch />
									</div>

									<div className="flex items-center justify-between rounded-xl border p-4">
										<div>
											<p className="font-medium text-foreground text-sm">
												Product updates
											</p>
											<p className="text-muted-foreground text-xs">
												News about new features and improvements
											</p>
										</div>
										<Switch />
									</div>
								</div>

								<div className="flex justify-end">
									<Button>
										<Save className="size-4" />
										Save Settings
									</Button>
								</div>
							</div>
						)}

						{activeTab === "security" && (
							<div className="flex flex-col gap-6">
								<div>
									<h3 className="font-semibold text-base text-foreground">
										Password
									</h3>
									<p className="text-muted-foreground text-sm">
										Change your account password.
									</p>
								</div>

								<div className="flex max-w-sm flex-col gap-4">
									<div className="flex flex-col gap-2">
										<Label htmlFor="current-pw">Current Password</Label>
										<Input
											id="current-pw"
											placeholder="Enter current password"
											type="password"
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="new-pw">New Password</Label>
										<Input
											id="new-pw"
											placeholder="Enter new password"
											type="password"
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="confirm-pw">Confirm New Password</Label>
										<Input
											id="confirm-pw"
											placeholder="Confirm new password"
											type="password"
										/>
									</div>
									<Button className="w-fit">Update Password</Button>
								</div>

								<Separator />

								<div>
									<h3 className="font-semibold text-base text-foreground">
										Two-Factor Authentication
									</h3>
									<p className="text-muted-foreground text-sm">
										Add an extra layer of security to your account.
									</p>
									<Button className="mt-3" variant="outline">
										Enable 2FA
									</Button>
								</div>

								<Separator />

								<div>
									<h3 className="font-semibold text-base text-destructive text-foreground">
										Danger Zone
									</h3>
									<p className="text-muted-foreground text-sm">
										Permanently delete your account and all associated data.
									</p>
									<Button className="mt-3" variant="destructive">
										Delete Account
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
