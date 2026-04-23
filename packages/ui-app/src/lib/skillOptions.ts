import type { SkillCategoryKey } from "../composables/createEditorState.ts";

export const osOptions = [
  "Windows",
  "Windows Server",
  "macOS",
  "Linux",
  "Ubuntu",
  "Debian",
  "CentOS",
  "Red Hat Enterprise Linux",
  "Rocky Linux",
  "Amazon Linux",
] as const;

export const languageOptions = [
  "JavaScript",
  "TypeScript",
  "HTML",
  "CSS",
  "PHP",
  "Java",
  "Python",
  "Go",
  "Ruby",
  "C#",
  "Kotlin",
  "Swift",
  "Dart",
  "SQL",
  "Shell",
  "Bash",
  "PowerShell",
] as const;

export const frameworkOptions = [
  "Vue 3",
  "Nuxt",
  "React",
  "Next.js",
  "Angular",
  "Svelte",
  "Laravel",
  "Symfony",
  "Spring",
  "Spring Boot",
  "Django",
  "FastAPI",
  "Express",
  "Hono",
  "ASP.NET Core",
  "Tailwind CSS",
  "Vuetify",
  "Bootstrap",
] as const;

export const databaseOptions = [
  "PostgreSQL",
  "MySQL",
  "MariaDB",
  "Oracle Database",
  "SQL Server",
  "SQLite",
  "Redis",
  "MongoDB",
  "DynamoDB",
  "BigQuery",
] as const;

export const otherSkillOptions = [
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "GitLab",
  "Jenkins",
  "GitHub Actions",
  "Terraform",
  "AWS",
  "Azure",
  "GCP",
  "REST API",
  "GraphQL",
  "Firebase",
  "Auth0",
  "Figma",
] as const;

export const toolOptions = [
  "Docker",
  "Docker Compose",
  "Kubernetes",
  "Git",
  "GitHub",
  "GitLab",
  "Jenkins",
  "GitHub Actions",
  "Terraform",
  "Ansible",
  "Slack",
  "Jira",
  "Backlog",
  "Figma",
  "Postman",
  "Swagger",
] as const;

export const skillOptionsByCategory: Record<
  SkillCategoryKey,
  readonly string[]
> = {
  os: osOptions,
  languages: languageOptions,
  frameworks: frameworkOptions,
  databases: databaseOptions,
  others: otherSkillOptions,
};

export const techStackOptions = {
  languages: languageOptions,
  serverOs: osOptions,
  databases: databaseOptions,
  frameworks: frameworkOptions,
  tools: toolOptions,
  others: otherSkillOptions,
} as const;
