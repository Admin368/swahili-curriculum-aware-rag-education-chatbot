"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Mail,
  GraduationCap,
  Bell,
  Shield,
  Palette,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState("Jane Doe")
  const [email, setEmail] = useState("jane@university.edu")
  const [institution, setInstitution] = useState("State University")
  const [major, setMajor] = useState("Biology")

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge variant="secondary" className="gap-1">
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
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                JD
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Jane Doe</h2>
              <p className="text-sm text-muted-foreground">jane@university.edu</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs gap-1">
                  <GraduationCap className="size-3" />
                  Student
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Free Plan
                </Badge>
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="mt-8 flex gap-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-foreground text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
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
                  <h3 className="text-base font-semibold text-foreground">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">Update your profile details.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="acc-name">Full Name</Label>
                    <Input
                      id="acc-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="acc-email">Email</Label>
                    <Input
                      id="acc-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="acc-institution">Institution</Label>
                    <Input
                      id="acc-institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="acc-major">Major / Field</Label>
                    <Input
                      id="acc-major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-foreground">Academic Level</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    This helps the AI tailor responses to your level.
                  </p>
                  <Select defaultValue="undergraduate">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
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
                  <h3 className="text-base font-semibold text-foreground">Learning Preferences</h3>
                  <p className="text-sm text-muted-foreground">Customize your learning experience.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Show source references</p>
                      <p className="text-xs text-muted-foreground">
                        Display document references in chat responses
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Detailed explanations</p>
                      <p className="text-xs text-muted-foreground">
                        Provide more thorough explanations by default
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-generate flashcards</p>
                      <p className="text-xs text-muted-foreground">
                        Create flashcards automatically after each chat session
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Quiz difficulty adaptation</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically adjust quiz difficulty based on performance
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-foreground">Response Language</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
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
                  <h3 className="text-base font-semibold text-foreground">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage how you receive notifications.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Email digests</p>
                      <p className="text-xs text-muted-foreground">
                        Weekly summary of your study progress
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Document processing alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Notify when documents finish indexing
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Study reminders</p>
                      <p className="text-xs text-muted-foreground">
                        Daily reminders to review flashcards
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Product updates</p>
                      <p className="text-xs text-muted-foreground">
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
                  <h3 className="text-base font-semibold text-foreground">Password</h3>
                  <p className="text-sm text-muted-foreground">Change your account password.</p>
                </div>

                <div className="flex flex-col gap-4 max-w-sm">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="current-pw">Current Password</Label>
                    <Input id="current-pw" type="password" placeholder="Enter current password" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input id="new-pw" type="password" placeholder="Enter new password" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-pw">Confirm New Password</Label>
                    <Input id="confirm-pw" type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="w-fit">
                    Update Password
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-foreground">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline" className="mt-3">
                    Enable 2FA
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold text-foreground text-destructive">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button variant="destructive" className="mt-3">
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
