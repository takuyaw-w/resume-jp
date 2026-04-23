import type { ResumeInput } from "@resume/types";
import type { SaveDocumentResult, UiApi } from "./uiApi.ts";

const mockDocument: ResumeInput = {
  profile: {
    name: {
      familyName: "佐藤",
      givenName: "湊",
      familyNameKana: "サトウ",
      givenNameKana: "ミナト",
    },
    gender: "男性",
    nationality: "日本",
    nearestStation: "横浜駅",
    specialtiesText:
      "・BtoB向け業務システムの画面設計および実装\n・既存システムの改修、追加開発、運用保守対応",
    skillSummary: {
      os: [
        { name: "Windows", experienceText: "8年", level: "上級" },
        { name: "Ubuntu", experienceText: "4年", level: "中級" },
      ],
      languages: [
        { name: "TypeScript", experienceText: "4年", level: "上級" },
        { name: "JavaScript", experienceText: "8年", level: "指導可能" },
      ],
      frameworks: [
        { name: "Vue 3", experienceText: "3年", level: "上級" },
        { name: "Laravel", experienceText: "5年", level: "上級" },
      ],
      databases: [
        { name: "PostgreSQL", experienceText: "4年", level: "上級" },
      ],
      others: [
        { name: "Docker", experienceText: "4年", level: "上級" },
        { name: "Git", experienceText: "8年", level: "指導可能" },
      ],
    },
    selfPr:
      "フロントエンド開発を中心に、業務システムの新規開発、追加開発、改修、運用保守に携わってきました。",
  },
  qualifications: [
    {
      name: "基本情報技術者試験",
      acquiredAt: "2017/10",
    },
  ],
  projects: [
    {
      period: {
        from: "2023/10",
        to: "2024/12",
      },
      projectName: "予約受付管理サイト運用改善",
      overview: "予約受付、キャンセル、通知配信を扱う管理サイトの改善案件。",
      role: "member",
      techStack: {
        languages: ["TypeScript", "PHP", "HTML", "CSS"],
        serverOs: ["Amazon Linux"],
        databases: ["PostgreSQL"],
        frameworks: ["Vue 3", "Laravel"],
        tools: ["Docker", "GitHub Actions", "Slack"],
        others: ["REST API", "SSO"],
      },
      phases: {
        requirementAnalysis: false,
        requirementsDefinition: true,
        basicDesign: true,
        detailDesign: true,
        implementation: true,
        unitTest: true,
        integrationTest: true,
        systemTest: false,
        acceptanceTest: false,
        release: true,
        operationMaintenance: true,
      },
    },
  ],
};

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createMockUiApi(): UiApi {
  return {
    async loadDocument(): Promise<ResumeInput> {
      return cloneJson(mockDocument);
    },

    async saveDocument(_document: ResumeInput): Promise<SaveDocumentResult> {
      await new Promise((resolve) => setTimeout(resolve, 250));

      return {
        saved: true,
        path: "./resume.json",
      };
    },
  };
}
