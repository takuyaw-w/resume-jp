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
      "・なんとなくいい感じの画面調整",
      "・急に増える仕様への耐性",
    ].join("\n"),
    skillSummary: {
      os: [
        {
          name: "Mikan OS",
          experienceText: "7年",
          level: "上級",
        },
        {
          name: "Yakiimo Linux",
          experienceText: "2年",
          level: "中級",
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
        {
          name: "UltraWidget",
          experienceText: "8か月",
          level: "実務経験あり",
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
        {
          name: "謎のCI",
          experienceText: "1年",
          level: "実務経験あり",
        },
      ],
    },
    selfPr:
      "画面の配置、一覧の見やすさ、入力導線の整理などを中心に、なんとなく困っている部分をそれなりに整えることを得意としています。",
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
        from: "2023/01",
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

Deno.test("jpBasicTheme: renders html string", async () => {
  const html = await theme.render(doc, { format: "html" });

  assertStringIncludes(html, "<!doctype html>");
  assertStringIncludes(html, "空野 ピロシキ");
  assertStringIncludes(html, "ソラノ ピロシキ");
  assertStringIncludes(html, "S.P.");
  assertStringIncludes(html, "不明");
  assertStringIncludes(html, "火星");
  assertStringIncludes(html, "4年10か月");
  assertStringIncludes(html, "ふわっとした要件の整理");
  assertStringIncludes(html, "Mikan OS（7年 / 上級）");
  assertStringIncludes(html, "Yakiimo Linux（2年 / 中級）");
  assertStringIncludes(html, "巨大プリン在庫監視システム");
  assertStringIncludes(html, "TypeScript, HTML, CSS");
});
