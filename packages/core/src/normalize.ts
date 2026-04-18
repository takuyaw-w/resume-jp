import type { ResumeInput, ResumeSkillItem } from "@resume/types";
import type { ResumeDocument } from "@resume/theme-api";

const KANA_TO_INITIAL: Record<string, string> = {
  ア: "A",
  イ: "I",
  ウ: "U",
  エ: "E",
  オ: "O",
  カ: "K",
  キ: "K",
  ク: "K",
  ケ: "K",
  コ: "K",
  ガ: "G",
  ギ: "G",
  グ: "G",
  ゲ: "G",
  ゴ: "G",
  サ: "S",
  シ: "S",
  ス: "S",
  セ: "S",
  ソ: "S",
  ザ: "Z",
  ジ: "J",
  ズ: "Z",
  ゼ: "Z",
  ゾ: "Z",
  タ: "T",
  チ: "C",
  ツ: "T",
  テ: "T",
  ト: "T",
  ダ: "D",
  ヂ: "J",
  ヅ: "Z",
  デ: "D",
  ド: "D",
  ナ: "N",
  ニ: "N",
  ヌ: "N",
  ネ: "N",
  ノ: "N",
  ハ: "H",
  ヒ: "H",
  フ: "F",
  ヘ: "H",
  ホ: "H",
  バ: "B",
  ビ: "B",
  ブ: "B",
  ベ: "B",
  ボ: "B",
  パ: "P",
  ピ: "P",
  プ: "P",
  ペ: "P",
  ポ: "P",
  マ: "M",
  ミ: "M",
  ム: "M",
  メ: "M",
  モ: "M",
  ヤ: "Y",
  ユ: "Y",
  ヨ: "Y",
  ラ: "R",
  リ: "R",
  ル: "R",
  レ: "R",
  ロ: "R",
  ワ: "W",
  ヲ: "W",
  ン: "N",
  ヴ: "V",
};

const SMALL_KANA_REGEX = /[ァィゥェォャュョヮヵヶ]/;

function normalizeString(value: string): string {
  return value.trim();
}

function normalizeStringArray(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function normalizeMultilineText(value: string): string {
  return value
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}

function normalizeSkillItems(items: ResumeSkillItem[]): ResumeSkillItem[] {
  return items
    .map((item) => ({
      name: normalizeString(item.name),
      experienceText: item.experienceText
        ? normalizeString(item.experienceText)
        : undefined,
      level: item.level,
    }))
    .filter((item) => item.name.length > 0);
}

function hiraganaToKatakana(value: string): string {
  return value.replace(
    /[ぁ-ゖ]/g,
    (char) => String.fromCodePoint(char.codePointAt(0)! + 0x60),
  );
}

function normalizeKana(value: string): string {
  return hiraganaToKatakana(value)
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .trim();
}

function getLeadingKana(value: string): string {
  const chars = Array.from(normalizeKana(value));

  for (const char of chars) {
    if (char === "ー") continue;
    if (SMALL_KANA_REGEX.test(char)) continue;
    return char;
  }

  throw new Error(`Invalid kana: ${value}`);
}

function getInitialFromKana(kana: string): string {
  const leadingKana = getLeadingKana(kana);
  const initial = KANA_TO_INITIAL[leadingKana];

  if (!initial) {
    throw new Error(`Unsupported kana for initial: ${leadingKana}`);
  }

  return initial;
}

function getInitialsFromKana(
  familyNameKana: string,
  givenNameKana: string,
): string {
  const familyInitial = getInitialFromKana(familyNameKana);
  const givenInitial = getInitialFromKana(givenNameKana);

  return `${familyInitial}.${givenInitial}.`;
}

export function normalizeResume(input: ResumeInput): ResumeDocument {
  const familyName = normalizeString(input.profile.name.familyName);
  const givenName = normalizeString(input.profile.name.givenName);
  const familyNameKana = normalizeKana(input.profile.name.familyNameKana);
  const givenNameKana = normalizeKana(input.profile.name.givenNameKana);

  const normalizedProjects = reverseProjects(input.projects).map((project) => ({
    period: {
      from: normalizeString(project.period.from),
      to: normalizeString(project.period.to),
    },
    projectName: normalizeString(project.projectName),
    overview: normalizeString(project.overview),
    role: project.role,
    techStack: {
      languages: normalizeStringArray(project.techStack.languages),
      serverOs: normalizeStringArray(project.techStack.serverOs),
      databases: normalizeStringArray(project.techStack.databases),
      frameworks: normalizeStringArray(project.techStack.frameworks),
      tools: normalizeStringArray(project.techStack.tools),
      others: normalizeStringArray(project.techStack.others),
    },
    phases: project.phases,
  }));

  const experience = buildExperienceSummary(normalizedProjects);

  return {
    profile: {
      name: {
        familyName,
        givenName,
        familyNameKana,
        givenNameKana,
        fullName: `${familyName} ${givenName}`,
        fullNameKana: `${familyNameKana} ${givenNameKana}`,
        initials: getInitialsFromKana(familyNameKana, givenNameKana),
      },
      gender: normalizeString(input.profile.gender) || undefined,
      nationality: normalizeString(input.profile.nationality) || undefined,
      nearestStation: normalizeString(input.profile.nearestStation),
      specialtiesText: normalizeMultilineText(input.profile.specialtiesText),
      skillSummary: {
        os: normalizeSkillItems(input.profile.skillSummary.os),
        languages: normalizeSkillItems(input.profile.skillSummary.languages),
        frameworks: normalizeSkillItems(input.profile.skillSummary.frameworks),
        databases: normalizeSkillItems(input.profile.skillSummary.databases),
        others: normalizeSkillItems(input.profile.skillSummary.others),
      },
      selfPr: normalizeString(input.profile.selfPr),
      experience,
    },
    qualifications: input.qualifications.map((item) => ({
      name: normalizeString(item.name),
      acquiredAt: normalizeString(item.acquiredAt),
    })),
    projects: normalizedProjects,
  };
}

function reverseProjects<T>(projects: T[]): T[] {
  return [...projects].reverse();
}

function parseYearMonth(value: string): { year: number; month: number } | null {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})\/(\d{1,2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function expandMonthKeys(fromText: string, toText: string): string[] {
  const from = parseYearMonth(fromText);
  const to = parseYearMonth(toText);

  if (!from || !to) {
    return [];
  }

  const start = from.year * 12 + (from.month - 1);
  const end = to.year * 12 + (to.month - 1);

  if (end < start) {
    return [];
  }

  const result: string[] = [];

  for (let value = start; value <= end; value++) {
    const year = Math.floor(value / 12);
    const month = (value % 12) + 1;
    result.push(toMonthKey(year, month));
  }

  return result;
}

function formatExperienceLabel(totalMonths: number): string {
  if (totalMonths <= 0) {
    return "0か月";
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months}か月`;
  }

  if (months === 0) {
    return `${years}年`;
  }

  return `${years}年${months}か月`;
}

function buildExperienceSummary(
  projects: Array<{
    period: { from: string; to: string };
  }>,
) {
  const totalMonthSet = new Set<string>();

  for (const project of projects) {
    const monthKeys = expandMonthKeys(project.period.from, project.period.to);

    for (const monthKey of monthKeys) {
      totalMonthSet.add(monthKey);
    }
  }

  const totalMonths = totalMonthSet.size;

  return {
    totalMonths,
    totalLabel: formatExperienceLabel(totalMonths),
  };
}
