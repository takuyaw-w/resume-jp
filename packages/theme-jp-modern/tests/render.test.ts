import { assertStringIncludes } from "@std/assert";
import type { ResumeDocument } from "@resume/theme-api";
import { theme } from "../mod.ts";

const doc: ResumeDocument = {
  profile: {
    name: {
      familyName: "空野",
      givenName: "ピロシキ",
      familyNameKana: "ソラノ",
      givenNameKana: "ピロシキ",
      fullName: "空野 ピロシキ",
      fullNameKana: "ソラノ ピロシキ",
      initials: "S.P.",
    },
    gender: "不明",
    nationality: "火星",
    nearestStation: "銀河中央駅",
    specialtiesText: [
      "・ふわっとした要件の整理",
      "・急に増える仕様への耐性",
      "・画面の雰囲気調整",
    ].join("\n"),
    skillSummary: {
      os: [
        {
          name: "Yakiimo Linux",
          experienceText: "2年",
          level: "中級",
        },
        {
          name: "Mikan OS",
          experienceText: "7年",
          level: "上級",
        },
      ],
      languages: [
        {
          name: "TypeScript",
          experienceText: "5年",
          level: "上級",
        },
        {
          name: "NanisoreScript",
          experienceText: "1年",
          level: "初級",
        },
      ],
      frameworks: [
        {
          name: "Vue 3",
          experienceText: "3年",
          level: "上級",
        },
      ],
      databases: [
        {
          name: "PostgreSQL",
          experienceText: "4年",
          level: "中級",
        },
      ],
      others: [
        {
          name: "Docker",
          experienceText: "3年",
          level: "中級",
        },
      ],
    },
    selfPr:
      "画面の配置と雰囲気調整を中心に、なんとなく困っている部分をそれなりに整えることを得意としています。",
    experience: {
      totalMonths: 58,
      totalLabel: "4年10か月",
    },
  },
  qualifications: [
    {
      name: "だいたい頑張った検定",
      acquiredAt: "2022/04",
    },
  ],
  projects: [
    {
      period: {
        from: "2023/10",
        to: "2024/12",
      },
      projectName: "巨大プリン在庫監視システム",
      overview:
        "プリンの残量、補充タイミング、ゆらぎ指数を監視する管理画面の改修対応。",
      role: "member",
      techStack: {
        languages: ["TypeScript", "HTML", "CSS"],
        serverOs: ["Yakiimo Linux"],
        databases: ["PostgreSQL"],
        frameworks: ["Vue 3"],
        tools: ["Docker", "謎のCI"],
        others: ["REST API", "Pudding Sync"],
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

Deno.test("jpModernTheme: renders html string", async () => {
  const html = await theme.render(doc, { format: "html" });

  assertStringIncludes(html, "<!doctype html>");
  assertStringIncludes(html, "空野 ピロシキ");
  assertStringIncludes(html, "ソラノ ピロシキ");
  assertStringIncludes(html, "S.P.");
  assertStringIncludes(html, "銀河中央駅");
  assertStringIncludes(html, "不明");
  assertStringIncludes(html, "火星");
  assertStringIncludes(html, "4年10か月");

  assertStringIncludes(html, "ふわっとした要件の整理");
  assertStringIncludes(html, "急に増える仕様への耐性");
  assertStringIncludes(html, "画面の雰囲気調整");

  assertStringIncludes(html, "Yakiimo Linux");
  assertStringIncludes(html, "2年 / 中級");
  assertStringIncludes(html, "Mikan OS");
  assertStringIncludes(html, "7年 / 上級");
  assertStringIncludes(html, "TypeScript");
  assertStringIncludes(html, "5年 / 上級");
  assertStringIncludes(html, "NanisoreScript");
  assertStringIncludes(html, "1年 / 初級");

  assertStringIncludes(html, "だいたい頑張った検定");
  assertStringIncludes(html, "2022/04");

  assertStringIncludes(html, "巨大プリン在庫監視システム");
  assertStringIncludes(
    html,
    "プリンの残量、補充タイミング、ゆらぎ指数を監視する管理画面の改修対応。",
  );
  assertStringIncludes(html, "2023/10 - 2024/12");
  assertStringIncludes(html, "稼働期間: 1年3か月");
  assertStringIncludes(html, "メンバー");

  assertStringIncludes(html, "TypeScript, HTML, CSS");
  assertStringIncludes(html, "PostgreSQL");
  assertStringIncludes(html, "Vue 3");
  assertStringIncludes(html, "Docker, 謎のCI");
  assertStringIncludes(html, "REST API, Pudding Sync");

  assertStringIncludes(html, "要件定義");
  assertStringIncludes(html, "基本設計");
  assertStringIncludes(html, "詳細設計");
  assertStringIncludes(html, "実装");
  assertStringIncludes(html, "単体テスト");
  assertStringIncludes(html, "結合テスト");
  assertStringIncludes(html, "リリース");
  assertStringIncludes(html, "運用・保守");
});
