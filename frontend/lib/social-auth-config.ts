import { Github, FileCode, GitBranch } from "lucide-react"
import type React from "react"

export type SocialProvider = "github" | "gitlab" | "bitbucket"

export interface SocialAuthConfig {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  scopes: string[]
}

export const socialAuthConfig: Record<SocialProvider, SocialAuthConfig> = {
  github: {
    name: "GitHub",
    icon: Github,
    color: "#24292e",
    scopes: ["user:email", "read:user"],
  },
  gitlab: {
    name: "GitLab",
    icon: FileCode,
    color: "#fc6d26",
    scopes: ["read_user", "profile", "email"],
  },
  bitbucket: {
    name: "Bitbucket",
    icon: GitBranch,
    color: "#0052cc",
    scopes: ["account", "email"],
  },
} 