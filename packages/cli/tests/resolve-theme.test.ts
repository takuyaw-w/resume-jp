import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from "@std/assert";
import type { ResumeDocument } from "@resume/theme-api";
import { resolveTheme } from "../src/themes/resolve.ts";

const themeModuleUrl = new URL(
  "../../theme-jp-basic/mod.ts",
  import.meta.url,
).href;

const invalidModuleUrl = new URL(
  "../../core/mod.ts",
  import.meta.url,
).href;

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
    ].join("\n"),
    skillSummary: {
      os: [
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
    selfPr: "画面の配置と雰囲気調整を得意としています。",
    experience: {
      totalMonths: 58,
      totalLabel: "4年10か月",
    },
  },
  qualifications: [],
  projects: [],
};

Deno.test("resolveTheme: built-in theme を解決できる", async () => {
  const theme = await resolveTheme("jp-basic");

  assertEquals(theme.meta.id, "jp-basic");
  assertEquals(typeof theme.render, "function");
});

Deno.test("resolveTheme: workspace package 名で解決できる", async () => {
  const theme = await resolveTheme("@resume/theme-jp-basic");

  assertEquals(theme.meta.id, "jp-basic");
  assertEquals(typeof theme.render, "function");
});

Deno.test({
  name: "resolveTheme: ローカルパスで解決できる",
  permissions: { read: true },
  async fn() {
    const theme = await resolveTheme(themeModuleUrl);

    assertEquals(theme.meta.id, "jp-basic");
    assertEquals(typeof theme.render, "function");
  },
});

Deno.test({
  name: "resolveTheme: 不正なモジュールはエラーになる",
  permissions: { read: true },
  async fn() {
    await assertRejects(
      () => resolveTheme(invalidModuleUrl),
      Error,
      "Theme module must export a ThemeModule",
    );
  },
});

Deno.test("resolveTheme: 解決した theme は html を返せる", async () => {
  const theme = await resolveTheme("jp-basic");
  const html = await theme.render(doc, { format: "html" });

  assertStringIncludes(html, "<!doctype html>");
  assertStringIncludes(html, "空野 ピロシキ");
  assertStringIncludes(html, "銀河中央駅");
});
