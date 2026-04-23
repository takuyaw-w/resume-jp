#!/usr/bin/env -S deno run -A

type Ecosystem = "npm" | "jsr";

type LockFile = {
  npm?: Record<string, unknown>;
  jsr?: Record<string, unknown>;
};

type PackageRecord = {
  ecosystem: Ecosystem;
  name: string;
  version: string;
};

type ResolvedLicense = PackageRecord & {
  license: string;
  source: string;
  notes?: string;
};

const DEFAULT_LOCK_PATH = "deno.lock";
const DEFAULT_OUTPUT_PATH = "THIRD_PARTY_LICENSES.txt";

function splitPackageKey(key: string): { name: string; version: string } {
  const atIndex = key.startsWith("@") ? key.indexOf("@", 1) : key.indexOf("@");

  if (atIndex === -1) {
    throw new Error(`Invalid package key: ${key}`);
  }

  return {
    name: key.slice(0, atIndex),
    version: key.slice(atIndex + 1).split("_")[0],
  };
}

function collectLockedPackages(lock: LockFile): PackageRecord[] {
  const items = new Map<string, PackageRecord>();

  for (const key of Object.keys(lock.jsr ?? {})) {
    const { name, version } = splitPackageKey(key);
    items.set(`jsr:${name}@${version}`, {
      ecosystem: "jsr",
      name,
      version,
    });
  }

  for (const key of Object.keys(lock.npm ?? {})) {
    const { name, version } = splitPackageKey(key);
    items.set(`npm:${name}@${version}`, {
      ecosystem: "npm",
      name,
      version,
    });
  }

  return [...items.values()].sort((a, b) => {
    if (a.ecosystem !== b.ecosystem) {
      return a.ecosystem.localeCompare(b.ecosystem);
    }
    if (a.name !== b.name) {
      return a.name.localeCompare(b.name);
    }
    return a.version.localeCompare(b.version);
  });
}

function encodeNpmName(name: string): string {
  return name.replace("/", "%2f");
}

function normalizeLicenseValue(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && value.length > 0) {
    const values = value
      .map((item) => normalizeLicenseValue(item))
      .filter((item) => item !== "UNKNOWN");
    return values.length > 0 ? values.join(" OR ") : "UNKNOWN";
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.type === "string" && record.type.trim()) {
      return record.type.trim();
    }

    if (typeof record.name === "string" && record.name.trim()) {
      return record.name.trim();
    }

    if (
      typeof record.spdxLicenseExpression === "string" &&
      record.spdxLicenseExpression.trim()
    ) {
      return record.spdxLicenseExpression.trim();
    }
  }

  return "UNKNOWN";
}

function normalizeRepositoryUrl(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.replace(/^git\+/, "").replace(/\.git$/, "");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.url === "string" && record.url.trim()) {
      return record.url.replace(/^git\+/, "").replace(/\.git$/, "");
    }
  }

  return undefined;
}

async function readJsonFile<T>(path: string): Promise<T> {
  const text = await Deno.readTextFile(path);
  return JSON.parse(text) as T;
}

async function fetchJson(
  url: string,
): Promise<Record<string, unknown> | undefined> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    return undefined;
  }

  return await response.json() as Record<string, unknown>;
}

async function fetchText(url: string): Promise<string | undefined> {
  const response = await fetch(url);

  if (!response.ok) {
    return undefined;
  }

  return await response.text();
}

function extractLicenseFromHtml(html: string): string | undefined {
  const patterns = [
    /"spdxLicenseExpression"\s*:\s*"([^"]+)"/i,
    /"license"\s*:\s*"([^"]+)"/i,
    /"license"\s*:\s*\{\s*"type"\s*:\s*"([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  return undefined;
}

async function resolveNpmLicense(pkg: PackageRecord): Promise<ResolvedLicense> {
  const registryUrl = `https://registry.npmjs.org/${
    encodeNpmName(pkg.name)
  }/${pkg.version}`;
  const data = await fetchJson(registryUrl);

  if (!data) {
    return {
      ...pkg,
      license: "UNKNOWN",
      source: `https://www.npmjs.com/package/${pkg.name}`,
      notes: "npm registry lookup failed",
    };
  }

  const source = (typeof data.homepage === "string" && data.homepage.trim())
    ? data.homepage
    : normalizeRepositoryUrl(data.repository) ??
      `https://www.npmjs.com/package/${pkg.name}`;

  return {
    ...pkg,
    license: normalizeLicenseValue(
      data.license ??
        data.licenses ??
        data.spdxLicenseExpression,
    ),
    source,
  };
}

async function resolveJsrLicense(pkg: PackageRecord): Promise<ResolvedLicense> {
  const packageUrl = `https://jsr.io/${pkg.name}`;
  const jsonCandidates = [
    `${packageUrl}/meta.json`,
    `${packageUrl}/${pkg.version}/meta.json`,
    `${packageUrl}/${pkg.version}_meta.json`,
  ];

  for (const url of jsonCandidates) {
    const data = await fetchJson(url);

    if (!data) {
      continue;
    }

    const license = normalizeLicenseValue(
      data.license ??
        data.licenses ??
        data.spdxLicenseExpression ??
        (data.package && typeof data.package === "object"
          ? (data.package as Record<string, unknown>).license
          : undefined),
    );

    if (license !== "UNKNOWN") {
      return {
        ...pkg,
        license,
        source: packageUrl,
      };
    }

    const repoCandidate = normalizeRepositoryUrl(
      data.repository ??
        data.source ??
        (data.package && typeof data.package === "object"
          ? (data.package as Record<string, unknown>).repository
          : undefined),
    );

    if (repoCandidate) {
      const githubResolved = await resolveLicenseFromGitHubRepo(repoCandidate);
      if (githubResolved) {
        return {
          ...pkg,
          license: githubResolved.license,
          source: githubResolved.source,
        };
      }
    }
  }

  const html = await fetchText(packageUrl);
  if (html) {
    const license = extractLicenseFromHtml(html);
    if (license) {
      return {
        ...pkg,
        license,
        source: packageUrl,
      };
    }

    const repoUrl = extractGitHubRepoUrl(html);
    if (repoUrl) {
      const githubResolved = await resolveLicenseFromGitHubRepo(repoUrl);
      if (githubResolved) {
        return {
          ...pkg,
          license: githubResolved.license,
          source: githubResolved.source,
        };
      }
    }
  }

  return {
    ...pkg,
    license: "UNKNOWN",
    source: packageUrl,
    notes: "JSR metadata and GitHub license lookup failed",
  };
}

async function resolveLicense(pkg: PackageRecord): Promise<ResolvedLicense> {
  if (pkg.ecosystem === "npm") {
    return await resolveNpmLicense(pkg);
  }

  return await resolveJsrLicense(pkg);
}

function renderOutput(items: ResolvedLicense[]): string {
  const lines: string[] = [];

  lines.push("resume-jp Third-Party Licenses");
  lines.push("================================");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("Mode: all locked packages from deno.lock");
  lines.push("");
  lines.push(
    "This file is generated from deno.lock and intentionally includes all locked packages, including transitive dependencies.",
  );
  lines.push("");

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`);
    lines.push(`   Ecosystem: ${item.ecosystem}`);
    lines.push(`   Version: ${item.version}`);
    lines.push(`   License: ${item.license}`);
    lines.push(`   Source: ${item.source}`);
    if (item.notes) {
      lines.push(`   Notes: ${item.notes}`);
    }
    lines.push("");
  });

  const unknowns = items.filter((item) => item.license === "UNKNOWN");
  if (unknowns.length > 0) {
    lines.push("Unresolved");
    lines.push("----------");
    lines.push("");
    for (const item of unknowns) {
      lines.push(`- ${item.ecosystem}:${item.name}@${item.version}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function parseArgs(args: string[]) {
  let lockPath = DEFAULT_LOCK_PATH;
  let outputPath = DEFAULT_OUTPUT_PATH;
  let allowUnknown = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--lock") {
      lockPath = args[++i] ?? lockPath;
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      outputPath = args[++i] ?? outputPath;
      continue;
    }

    if (arg === "--allow-unknown") {
      allowUnknown = true;
      continue;
    }
  }

  return { lockPath, outputPath, allowUnknown };
}

function extractGitHubRepoUrl(text: string): string | undefined {
  const match = text.match(
    /https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/,
  );

  if (!match) {
    return undefined;
  }

  return `https://github.com/${match[1]}/${match[2]}`;
}

function parseGitHubRepo(
  url: string,
): { owner: string; repo: string } | undefined {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/);

  if (!match) {
    return undefined;
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

async function resolveLicenseFromGitHubRepo(
  repoUrl: string,
): Promise<{ license: string; source: string } | undefined> {
  const parsed = parseGitHubRepo(repoUrl);

  if (!parsed) {
    return undefined;
  }

  const apiUrl =
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/license`;
  const response = await fetch(apiUrl, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "resume-jp-license-generator",
    },
  });

  if (!response.ok) {
    return undefined;
  }

  const data = await response.json() as Record<string, unknown>;
  const licenseInfo = data.license as Record<string, unknown> | undefined;

  const license = normalizeLicenseValue(
    licenseInfo?.spdx_id ??
      licenseInfo?.name ??
      data.license,
  );

  if (license === "UNKNOWN") {
    return undefined;
  }

  return {
    license,
    source: repoUrl,
  };
}

async function main() {
  const options = parseArgs(Deno.args);
  const lock = await readJsonFile<LockFile>(options.lockPath);
  const packages = collectLockedPackages(lock);

  const resolved: ResolvedLicense[] = [];
  for (const pkg of packages) {
    resolved.push(await resolveLicense(pkg));
  }

  const output = renderOutput(resolved);
  await Deno.writeTextFile(options.outputPath, output);

  const unknownCount =
    resolved.filter((item) => item.license === "UNKNOWN").length;

  console.log(`Generated: ${options.outputPath}`);
  console.log(`Packages: ${resolved.length}`);
  console.log(`Unknown licenses: ${unknownCount}`);

  if (unknownCount > 0 && !options.allowUnknown) {
    console.error(
      "Unknown licenses remain. Investigate the unresolved packages or rerun with --allow-unknown.",
    );
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
