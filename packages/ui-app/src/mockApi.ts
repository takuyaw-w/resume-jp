import type { ExportPdfResult, ResumeDraft, SaveResult } from "../types";
import type { UiApi } from "./uiApi";

const initialDraft: ResumeDraft = {
  basic: {
    fullName: "山田 太郎",
    fullNameKana: "ヤマダ タロウ",
    birthDate: "1995-04-01",
    nearestStation: "品川",
    specialtiesText:
      "フロントエンドを中心に、業務システムおよびWebアプリケーション開発に従事。\nVue / TypeScript を用いた設計・実装・保守が得意。",
  },
  skillSummary: [
    {
      id: crypto.randomUUID(),
      name: "TypeScript",
      experienceText: "3年",
      level: "上級",
    },
    {
      id: crypto.randomUUID(),
      name: "Vue 3",
      experienceText: "2年",
      level: "中級",
    },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: "社内基幹システム再構築",
      startDate: "2023-04",
      endDate: "2024-03",
      role: "フロントエンドエンジニア",
      teamSize: "8名",
      description: "業務システムのSPA化に伴い、画面設計・実装・保守を担当。",
      languages: ["TypeScript", "Vue"],
    },
    {
      id: crypto.randomUUID(),
      name: "SaaS 管理画面開発",
      startDate: "2022-01",
      endDate: "2023-03",
      role: "開発メンバー",
      teamSize: "5名",
      description:
        "管理画面および社内運用ツールのUI実装、コンポーネント整備を担当。",
      languages: ["TypeScript", "React"],
    },
  ],
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createMockUiApi(): UiApi {
  return {
    async loadDraft(): Promise<ResumeDraft> {
      return clone(initialDraft);
    },

    async saveDraft(_draft: ResumeDraft): Promise<SaveResult> {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        saved: true,
        path: "./resume.yaml",
      };
    },

    async exportPdf(_draft: ResumeDraft): Promise<ExportPdfResult> {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        fileName: "resume.pdf",
      };
    },
  };
}
