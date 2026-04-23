import { assertThrows } from "@std/assert";
import { ZodError } from "zod";
import { validateResume } from "../mod.ts";

function createValidInput() {
  return {
    profile: {
      name: {
        familyName: "虹野",
        givenName: "パセリ",
        familyNameKana: "ニジノ",
        givenNameKana: "パセリ",
      },
      gender: "不明",
      nationality: "月",
      nearestStation: "流星台駅",
      specialtiesText: [
        "・仕様変更にそれっぽく追従することが得意です",
        "・一覧画面をなんとなく見やすく整えられます",
        "・曖昧な依頼をそれなりに着地させます",
      ].join("\n"),
      skillSummary: {
        os: [
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
            name: "PiyoScript",
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
        "ふんわりした要求の整理と、画面まわりの改善を中心に対応してきました。",
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
        role: "メンバー",
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
}

Deno.test("validateResume: valid input passes", () => {
  validateResume(createValidInput());
});

Deno.test("validateResume: invalid role throws ZodError", () => {
  const input = createValidInput();
  input.projects[0].role = "supreme-leader";

  assertThrows(
    () => validateResume(input),
    ZodError,
  );
});

Deno.test("validateResume: missing profile throws ZodError", () => {
  const input = createValidInput();
  // deno-lint-ignore no-explicit-any
  delete (input as any).profile;

  assertThrows(
    () => validateResume(input),
    ZodError,
  );
});
