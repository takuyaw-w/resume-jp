import { assertEquals, assertStrictEquals } from "@std/assert";
import { normalizeResume, validateResume } from "../mod.ts";

function createInput() {
  return {
    profile: {
      name: {
        familyName: "  虹野  ",
        givenName: " パセリ ",
        familyNameKana: " にじの ",
        givenNameKana: " ぱせり ",
      },
      gender: " 不明 ",
      nationality: " 月 ",
      nearestStation: " 流星台駅 ",
      specialtiesText: [
        "  ・仕様変更にそれっぽく追従することが得意です  ",
        "・一覧画面をなんとなく見やすく整えられます ",
        " ・曖昧な依頼をそれなりに着地させます",
      ].join("\n"),
      skillSummary: {
        os: [
          {
            name: " Mikan OS ",
            experienceText: " 7年 ",
            level: "上級",
          },
          {
            name: " ",
            experienceText: " ",
            level: "初級",
          },
        ],
        languages: [
          {
            name: " TypeScript ",
            experienceText: " 5年 ",
            level: "上級",
          },
          {
            name: " PiyoScript ",
            experienceText: " 1年 ",
            level: "初級",
          },
        ],
        frameworks: [
          {
            name: " Vue 3 ",
            experienceText: " 3年 ",
            level: "上級",
          },
        ],
        databases: [
          {
            name: " PostgreSQL ",
            experienceText: " 4年 ",
            level: "中級",
          },
        ],
        others: [
          {
            name: " Docker ",
            experienceText: " 3年 ",
            level: "中級",
          },
        ],
      },
      selfPr:
        "  ふんわりした要求の整理と、画面まわりの改善を中心に対応してきました。 ",
    },
    qualifications: [
      {
        name: " だいたい頑張った検定 ",
        acquiredAt: " 2022/04 ",
      },
    ],
    projects: [
      {
        period: {
          from: " 2021/01 ",
          to: " 2021/06 ",
        },
        projectName: " 先に入力した古い案件 ",
        overview: " 古い案件の概要 ",
        role: "member" as const,
        techStack: {
          languages: [" JavaScript ", " HTML "],
          serverOs: [" Ubuntu "],
          databases: [" SQLite "],
          frameworks: [" Vue 2 "],
          tools: [" Git "],
          others: [" Legacy Sync "],
        },
        phases: {
          requirementAnalysis: false,
          requirementsDefinition: false,
          basicDesign: true,
          detailDesign: true,
          implementation: true,
          unitTest: true,
          integrationTest: false,
          systemTest: false,
          acceptanceTest: false,
          release: true,
          operationMaintenance: true,
        },
      },
      {
        period: {
          from: " 2023/01 ",
          to: " 2024/12 ",
        },
        projectName: " 巨大プリン在庫監視システム ",
        overview:
          " プリンの残量、補充タイミング、ゆらぎ指数を監視する管理画面の改修対応。 ",
        role: "member" as const,
        techStack: {
          languages: [" TypeScript ", " HTML ", " CSS "],
          serverOs: [" Yakiimo Linux "],
          databases: [" PostgreSQL "],
          frameworks: [" Vue 3 "],
          tools: [" Docker ", " 謎のCI "],
          others: [" REST API ", " Pudding Sync "],
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

function createInputWithEmptyOptionalFields() {
  return {
    profile: {
      name: {
        familyName: "空野",
        givenName: "ピロシキ",
        familyNameKana: "ソラノ",
        givenNameKana: "ピロシキ",
      },
      gender: " ",
      nationality: "",
      nearestStation: "銀河中央駅",
      specialtiesText: "  ・ふわっとした要件の整理  ",
      skillSummary: {
        os: [],
        languages: [],
        frameworks: [],
        databases: [],
        others: [],
      },
      selfPr: "  画面の配置と雰囲気調整を得意としています。  ",
    },
    qualifications: [],
    projects: [],
  };
}

Deno.test("normalizeResume: trims values and derives display fields", () => {
  const validated = validateResume(createInput());
  const result = normalizeResume(validated);

  assertEquals(result.profile.name.familyName, "虹野");
  assertEquals(result.profile.name.givenName, "パセリ");
  assertEquals(result.profile.name.familyNameKana, "ニジノ");
  assertEquals(result.profile.name.givenNameKana, "パセリ");
  assertEquals(result.profile.name.fullName, "虹野 パセリ");
  assertEquals(result.profile.name.fullNameKana, "ニジノ パセリ");
  assertEquals(result.profile.name.initials, "N.P.");

  assertEquals(result.profile.gender, "不明");
  assertEquals(result.profile.nationality, "月");
  assertEquals(result.profile.nearestStation, "流星台駅");

  assertEquals(
    result.profile.specialtiesText,
    [
      "・仕様変更にそれっぽく追従することが得意です",
      "・一覧画面をなんとなく見やすく整えられます",
      "・曖昧な依頼をそれなりに着地させます",
    ].join("\n"),
  );

  assertEquals(result.profile.skillSummary.os.length, 1);
  assertEquals(result.profile.skillSummary.os[0].name, "Mikan OS");
  assertEquals(result.profile.skillSummary.os[0].experienceText, "7年");
  assertEquals(result.profile.skillSummary.os[0].level, "上級");

  assertEquals(result.profile.skillSummary.languages.length, 2);
  assertEquals(result.profile.skillSummary.languages[0].name, "TypeScript");
  assertEquals(result.profile.skillSummary.languages[0].experienceText, "5年");
  assertEquals(result.profile.skillSummary.languages[0].level, "上級");
  assertEquals(result.profile.skillSummary.languages[1].name, "PiyoScript");

  assertEquals(result.profile.skillSummary.frameworks[0].name, "Vue 3");
  assertEquals(result.profile.skillSummary.databases[0].name, "PostgreSQL");
  assertEquals(result.profile.skillSummary.others[0].name, "Docker");

  assertEquals(
    result.profile.selfPr,
    "ふんわりした要求の整理と、画面まわりの改善を中心に対応してきました。",
  );

  assertEquals(result.qualifications[0].name, "だいたい頑張った検定");
  assertEquals(result.qualifications[0].acquiredAt, "2022/04");

  assertEquals(result.projects.length, 2);
  assertEquals(result.projects[0].projectName, "巨大プリン在庫監視システム");
  assertEquals(result.projects[1].projectName, "先に入力した古い案件");

  assertEquals(result.projects[0].period.from, "2023/01");
  assertEquals(result.projects[0].period.to, "2024/12");
  assertEquals(
    result.projects[0].overview,
    "プリンの残量、補充タイミング、ゆらぎ指数を監視する管理画面の改修対応。",
  );
  assertEquals(result.projects[0].techStack.languages, [
    "TypeScript",
    "HTML",
    "CSS",
  ]);
  assertEquals(result.projects[0].techStack.serverOs, ["Yakiimo Linux"]);
  assertEquals(result.projects[0].techStack.tools, ["Docker", "謎のCI"]);

  assertEquals(result.projects[1].techStack.languages, [
    "JavaScript",
    "HTML",
  ]);
  assertEquals(result.projects[1].techStack.serverOs, ["Ubuntu"]);

  assertEquals(result.profile.experience.totalMonths, 30);
  assertEquals(result.profile.experience.totalLabel, "2年6か月");
  assertStrictEquals(typeof result.profile.experience.totalMonths, "number");
});

Deno.test("normalizeResume: empty gender and nationality become undefined", () => {
  const validated = validateResume(createInputWithEmptyOptionalFields());
  const result = normalizeResume(validated);

  assertStrictEquals(result.profile.gender, undefined);
  assertStrictEquals(result.profile.nationality, undefined);
  assertEquals(result.profile.nearestStation, "銀河中央駅");
  assertEquals(result.profile.name.fullName, "空野 ピロシキ");
  assertEquals(result.profile.name.fullNameKana, "ソラノ ピロシキ");
  assertEquals(result.profile.name.initials, "S.P.");
  assertEquals(result.profile.specialtiesText, "・ふわっとした要件の整理");
  assertEquals(
    result.profile.selfPr,
    "画面の配置と雰囲気調整を得意としています。",
  );
  assertEquals(result.profile.experience.totalMonths, 0);
  assertEquals(result.profile.experience.totalLabel, "0か月");
});
