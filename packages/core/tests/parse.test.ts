import { assertEquals, assertThrows } from "@std/assert";
import { parseResumeContent, ResumeParseError } from "../mod.ts";

Deno.test("parseResumeContent: valid JSON is parsed", () => {
  const input = `{
    "profile": {
      "name": {
        "familyName": "虹野",
        "givenName": "パセリ",
        "familyNameKana": "ニジノ",
        "givenNameKana": "パセリ"
      },
      "gender": "不明",
      "nationality": "月",
      "nearestStation": "流星台駅",
      "specialtiesText": "・仕様変更にそれっぽく追従することが得意です\\n・曖昧な依頼をそれなりに着地させます",
      "skillSummary": {
        "os": [
          {
            "name": "Mikan OS",
            "experienceText": "7年",
            "level": "上級"
          }
        ],
        "languages": [
          {
            "name": "TypeScript",
            "experienceText": "5年",
            "level": "上級"
          }
        ],
        "frameworks": [
          {
            "name": "Vue 3",
            "experienceText": "3年",
            "level": "上級"
          }
        ],
        "databases": [
          {
            "name": "PostgreSQL",
            "experienceText": "4年",
            "level": "中級"
          }
        ],
        "others": [
          {
            "name": "Docker",
            "experienceText": "3年",
            "level": "中級"
          }
        ]
      },
      "selfPr": "ふんわりした要求の整理と、画面まわりの改善を中心に対応してきました。"
    },
    "qualifications": [],
    "projects": []
  }`;

  const result = parseResumeContent(input, "resume.json") as {
    profile: {
      nearestStation: string;
      nationality: string;
    };
  };

  assertEquals(result.profile.nearestStation, "流星台駅");
  assertEquals(result.profile.nationality, "月");
});

Deno.test("parseResumeContent: valid YAML is parsed", () => {
  const input = `
profile:
  name:
    familyName: "空野"
    givenName: "ピロシキ"
    familyNameKana: "ソラノ"
    givenNameKana: "ピロシキ"
  gender: "不明"
  nationality: "火星"
  nearestStation: "銀河中央駅"
  specialtiesText: |-
    ・ふわっとした要件の整理
    ・急に増える仕様への耐性
  skillSummary:
    os:
      - name: "Yakiimo Linux"
        experienceText: "2年"
        level: "中級"
    languages:
      - name: "NanisoreScript"
        experienceText: "1年"
        level: "初級"
    frameworks:
      - name: "UltraWidget"
        experienceText: "8か月"
        level: "実務経験あり"
    databases:
      - name: "PostgreSQL"
        experienceText: "4年"
        level: "中級"
    others:
      - name: "謎のCI"
        experienceText: "1年"
        level: "実務経験あり"
  selfPr: "画面の配置と雰囲気調整を得意としています。"
qualifications: []
projects: []
`;

  const result = parseResumeContent(input, "resume.yaml") as {
    profile: {
      nearestStation: string;
      nationality: string;
    };
  };

  assertEquals(result.profile.nearestStation, "銀河中央駅");
  assertEquals(result.profile.nationality, "火星");
});

Deno.test("parseResumeContent: invalid JSON throws ResumeParseError", () => {
  assertThrows(
    () => parseResumeContent(`{ "profile": `, "resume.json"),
    ResumeParseError,
    "Invalid",
  );
});

Deno.test("parseResumeContent: unsupported extension throws ResumeParseError", () => {
  assertThrows(
    () => parseResumeContent("hello", "resume.txt"),
    ResumeParseError,
    "Unsupported",
  );
});
