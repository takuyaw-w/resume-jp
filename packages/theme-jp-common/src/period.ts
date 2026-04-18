function parseYearMonth(value: string): { year: number; month: number } | null {
  const normalized = value.trim();

  if (normalized === "") {
    return null;
  }

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

function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

function diffInclusiveMonths(
  from: { year: number; month: number },
  to: { year: number; month: number },
): number {
  return (to.year - from.year) * 12 + (to.month - from.month) + 1;
}

export function formatWorkingPeriodDuration(
  fromText: string,
  toText: string,
): string {
  const from = parseYearMonth(fromText);
  const to = parseYearMonth(toText) ?? getCurrentYearMonth();

  if (!from) {
    return "";
  }

  const totalMonths = diffInclusiveMonths(from, to);

  if (totalMonths <= 0) {
    return "";
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
